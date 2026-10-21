import React, { useEffect, useRef, useState } from "react";
import { LIVE_WALLPAPER_ID } from "../../wallpapers";
import { useSystem } from "../../context/SystemContext";
import type { Theme } from "../../context/SystemContext";
import "./liveWallpaper.css";

export type LiveWallpaperVariant = "desktop" | "thumb" | "login";

interface LiveWallpaperProps {
  variant?: LiveWallpaperVariant;
  className?: string;
  /** When true, force static (e.g. energy saver). */
  paused?: boolean;
}

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  depth: number;
  hue: number;
};

const PARTICLE_COUNT_FULL = 78;
const PARTICLE_COUNT_THUMB = 24;
const PARTICLE_COUNT_SOFT = 40;
const MAX_DPR = 1.25;
const PARALLAX_MAX_PX = 24;
const PARALLAX_MAX_SOFT_PX = 12;
const MOUSE_SMOOTH = 0.1;

type Palette = {
  hues: number[];
  particleHue: [number, number];
  nebulaAlpha: number;
  particleSat: number;
  particleLight: number;
  /** Canvas 2D composite — light needs non-additive so pastels read on white. */
  composite: GlobalCompositeOperation;
};

const PALETTES: Record<Theme, Palette> = {
  light: {
    // Pastel but mid-tone / high-sat so multiply blend stays visible on white
    hues: [210, 330, 160],
    particleHue: [195, 85],
    nebulaAlpha: 0.34,
    particleSat: 82,
    particleLight: 48,
    composite: "multiply",
  },
  dark: {
    // Neon cyan / magenta / violet — Wallpaper Engine feel
    hues: [190, 300, 250],
    particleHue: [175, 110],
    nebulaAlpha: 0.18,
    particleSat: 90,
    particleLight: 68,
    composite: "lighter",
  },
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function seedParticles(
  count: number,
  w: number,
  h: number,
  soft: boolean,
  theme: Theme,
): Particle[] {
  const out: Particle[] = [];
  const speed = soft ? 0.4 : 1.15;
  const [baseHue, hueSpan] = PALETTES[theme].particleHue;
  // Light: bump alpha so drift + dots stay obvious on pale base
  const alphaFloor = theme === "light" ? 0.48 : 0.3;
  const alphaSpan = theme === "light" ? 0.5 : 0.52;
  for (let i = 0; i < count; i++) {
    const depth = 0.15 + Math.random() * 0.85;
    out.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (1.15 + Math.random() * 3.8) * (0.55 + depth) * (theme === "light" ? 1.15 : 1),
      vx: (Math.random() - 0.5) * 0.65 * depth * speed,
      vy: ((Math.random() - 0.5) * 0.48 - 0.1) * depth * speed,
      a: alphaFloor + Math.random() * alphaSpan * depth,
      depth,
      hue: baseHue + Math.random() * hueSpan,
    });
  }
  return out;
}

/**
 * Wallpaper Engine–style live bloom: CSS parallax depth layers + soft
 * particle/nebula canvas loop. Light/dark OS theme swaps palette instantly.
 * Energy-saver (paused) freezes motion; prefers-reduced-motion keeps a soft
 * drift so "Canlı" still looks alive when the user explicitly chose it.
 */
export const LiveWallpaper: React.FC<LiveWallpaperProps> = ({
  variant = "desktop",
  className = "",
  paused = false,
}) => {
  const { theme } = useSystem();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const seededForRef = useRef({ w: 0, h: 0, soft: false, theme: theme as Theme });
  const [softMotion, setSoftMotion] = useState(() => prefersReducedMotion());

  const interactive = variant === "desktop" || variant === "login";
  const classes = [
    "live-wallpaper",
    `live-wallpaper--${variant}`,
    `live-wallpaper--${theme}`,
    paused ? "live-wallpaper--paused" : "",
    softMotion && !paused ? "live-wallpaper--soft" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSoftMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Mouse parallax target — CSS vars updated in rAF (no React re-renders).
  useEffect(() => {
    if (!interactive || paused) return;

    const onMove = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseTarget.current.x = Math.max(-1, Math.min(1, nx));
      mouseTarget.current.y = Math.max(-1, Math.min(1, ny));
    };

    const onLeave = () => {
      mouseTarget.current.x = 0;
      mouseTarget.current.y = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
    };
  }, [interactive, paused]);

  // Canvas particle / nebula loop + parallax smoothing.
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;

    const soft = softMotion;
    const palette = PALETTES[theme];
    const parallaxMax = soft ? PARALLAX_MAX_SOFT_PX : PARALLAX_MAX_PX;
    // Soft mode still animates (user chose Canlı); only energy-saver pauses.
    const runParticles = !paused && variant !== "thumb";
    const staticThumbPaint = variant === "thumb";
    const needRaf = runParticles || (interactive && !paused);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let alive = true;
    let lastTs = 0;

    const ensureParticles = (w: number, h: number) => {
      const count =
        variant === "thumb"
          ? PARTICLE_COUNT_THUMB
          : soft
            ? PARTICLE_COUNT_SOFT
            : PARTICLE_COUNT_FULL;
      const prev = seededForRef.current;
      const sizeChanged =
        Math.abs(prev.w - w) > 48 || Math.abs(prev.h - h) > 48;
      if (
        particlesRef.current.length !== count ||
        sizeChanged ||
        prev.w === 0 ||
        prev.soft !== soft ||
        prev.theme !== theme
      ) {
        particlesRef.current = seedParticles(count, w, h, soft, theme);
        seededForRef.current = { w, h, soft, theme };
      }
    };

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ensureParticles(w, h);
    };

    const ro = new ResizeObserver(() => {
      resize();
      // Resizing clears the bitmap; the static thumb has no rAF to redraw it.
      if (staticThumbPaint && !runParticles) paint(1);
    });
    ro.observe(root);
    resize();

    const paint = (dt: number) => {
      const { w, h } = sizeRef.current;
      if (w < 1 || h < 1) return;

      const mx = mouseCurrent.current;
      const mt = mouseTarget.current;
      const smooth = soft ? MOUSE_SMOOTH * 0.6 : MOUSE_SMOOTH;
      mx.x += (mt.x - mx.x) * smooth;
      mx.y += (mt.y - mx.y) * smooth;
      root.style.setProperty("--lw-mx", mx.x.toFixed(4));
      root.style.setProperty("--lw-my", mx.y.toFixed(4));

      if (!runParticles && !staticThumbPaint) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      if (runParticles) {
        // Faster nebula drift so motion is obvious within a few seconds.
        const t = performance.now() * (soft ? 0.00014 : 0.00026);
        ctx.globalCompositeOperation = palette.composite;
        const hues = palette.hues;
        const nebulaAlpha = soft
          ? palette.nebulaAlpha * 0.7
          : palette.nebulaAlpha;
        const nebulaLight = theme === "light" ? 52 : 62;
        for (let i = 0; i < 3; i++) {
          const px =
            w *
              (0.25 +
                0.5 *
                  ((i * 0.37 + Math.sin(t + i) * 0.5 + 0.5) % 1)) +
            mx.x * parallaxMax * (0.3 + i * 0.2);
          const py =
            h *
              (0.3 +
                0.4 *
                  ((i * 0.51 + Math.cos(t * 0.8 + i) * 0.5 + 0.5) % 1)) +
            mx.y * parallaxMax * (0.3 + i * 0.2);
          const rad = Math.min(w, h) * (0.24 + i * 0.07);
          const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
          g.addColorStop(
            0,
            `hsla(${hues[i]}, 85%, ${nebulaLight}%, ${nebulaAlpha})`,
          );
          g.addColorStop(1, "transparent");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = palette.composite;
      const parts = particlesRef.current;
      const thumbScale = variant === "thumb" ? 1.4 : 1;
      const sat = palette.particleSat;
      const light = palette.particleLight;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (runParticles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < -8) p.x = w + 8;
          if (p.x > w + 8) p.x = -8;
          if (p.y < -8) p.y = h + 8;
          if (p.y > h + 8) p.y = -8;
        }
        const x = p.x + mx.x * parallaxMax * p.depth;
        const y = p.y + mx.y * parallaxMax * p.depth;
        const r = p.r * thumbScale;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
        g.addColorStop(0, `hsla(${p.hue}, ${sat}%, ${light + 8}%, ${p.a})`);
        g.addColorStop(
          0.45,
          `hsla(${p.hue}, ${sat - 8}%, ${light - 8}%, ${p.a * 0.35})`,
        );
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    if (staticThumbPaint && !runParticles) {
      paint(1);
    }

    const tick = (ts: number) => {
      if (!alive) return;
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const raw = lastTs ? (ts - lastTs) / 16.67 : 1;
      lastTs = ts;
      const dt = Math.min(2.5, Math.max(0.5, raw));
      paint(dt);
      if (needRaf) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (needRaf) {
      rafRef.current = requestAnimationFrame(tick);
    } else if (!staticThumbPaint) {
      ctx.clearRect(0, 0, sizeRef.current.w, sizeRef.current.h);
      root.style.setProperty("--lw-mx", "0");
      root.style.setProperty("--lw-my", "0");
    }

    const onVis = () => {
      if (!document.hidden && needRaf && alive) {
        lastTs = 0;
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [paused, variant, interactive, softMotion, theme]);

  return (
    <div
      ref={rootRef}
      className={classes}
      data-wallpaper={LIVE_WALLPAPER_ID}
      data-lw-theme={theme}
      aria-hidden="true"
    >
      <div className="live-wallpaper-layer live-wallpaper-layer--base">
        <div className="live-wallpaper-base" />
      </div>
      <div className="live-wallpaper-layer live-wallpaper-layer--far">
        <div className="live-wallpaper-blob live-wallpaper-blob--a" />
      </div>
      <div className="live-wallpaper-layer live-wallpaper-layer--mid">
        <div className="live-wallpaper-blob live-wallpaper-blob--b" />
        <div className="live-wallpaper-blob live-wallpaper-blob--c" />
      </div>
      <div className="live-wallpaper-layer live-wallpaper-layer--near">
        <div className="live-wallpaper-blob live-wallpaper-blob--d" />
        <div className="live-wallpaper-blob live-wallpaper-blob--e" />
      </div>
      <canvas className="live-wallpaper-canvas" ref={canvasRef} />
      <div className="live-wallpaper-layer live-wallpaper-layer--sheen">
        <div className="live-wallpaper-sheen" />
      </div>
      <div className="live-wallpaper-vignette" />
      <div className="live-wallpaper-noise" />
    </div>
  );
};

export default LiveWallpaper;
