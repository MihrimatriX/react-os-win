import React, { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, FolderOpen, Globe } from "lucide-react";
import { useWindow } from "../../context/WindowContext";
import { useFS } from "../../context/FSContext";
import { readBrowserBookmarks } from "../../browserBookmarks";
import {
  collectProjectCards,
  hostLabel,
  type ProjectCard,
} from "../../projectsCatalog";
import { OS_USER } from "../../osUser";
import "./projects.css";

/** Official GitHub Mark (Octocat silhouette) — lucide dropped brand icons. */
const GitHubMark: React.FC<{ size?: number; className?: string }> = ({
  size = 14,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
  </svg>
);

const githubRepoLabel = (url: string) => {
  const bare = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const m = bare.match(/^github\.com\/([^/]+\/[^/]+)/i);
  return m ? m[1] : bare.replace(/^github\.com\//i, "");
};

/** Soft subtle gradient + faint drifting glows — calm, not busy. */
const ProjectsSceneBg: React.FC = () => (
  <div className="projects-scene-soft" aria-hidden="true">
    <div className="projects-scene-base" />
    <div className="projects-scene-glow projects-scene-glow--a" />
    <div className="projects-scene-glow projects-scene-glow--b" />
    <div className="projects-scene-glow projects-scene-glow--c" />
  </div>
);

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};

const PHOTON_COLORS = [
  "#ff006e",
  "#fb5607",
  "#ffbe0b",
  "#8338ec",
  "#3a86ff",
  "#06d6a0",
  "#ff4d6d",
  "#c77dff",
];

/** Lightweight canvas fireworks — Photon Engine card only. */
const PhotonFireworks: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mq.matches;
    const onChange = () => {
      reducedRef.current = mq.matches;
      if (mq.matches) sparksRef.current = [];
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const burst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35;
        const speed = 1.6 + Math.random() * 3.4;
        sparksRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8,
          life: 0,
          max: 28 + Math.random() * 22,
          color: PHOTON_COLORS[(Math.random() * PHOTON_COLORS.length) | 0],
          size: 1.4 + Math.random() * 1.8,
        });
      }
      // Cap particles for performance
      if (sparksRef.current.length > 160) {
        sparksRef.current.splice(0, sparksRef.current.length - 160);
      }
    };

    let lastBurst = 0;
    const tick = (t: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (active && !reducedRef.current) {
        if (t - lastBurst > 280) {
          lastBurst = t;
          burst(
            w * (0.2 + Math.random() * 0.6),
            h * (0.2 + Math.random() * 0.45),
            14 + ((Math.random() * 10) | 0),
          );
        }
      }

      const next: Spark[] = [];
      for (const s of sparksRef.current) {
        s.life += 1;
        if (s.life >= s.max) continue;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.06;
        s.vx *= 0.985;
        const alpha = 1 - s.life / s.max;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        next.push(s);
      }
      sparksRef.current = next;
      ctx.globalAlpha = 1;

      if (active || sparksRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (active && !reducedRef.current) {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      burst(w * 0.5, h * 0.38, 22);
      rafRef.current = requestAnimationFrame(tick);
    } else if (sparksRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      if (!active) sparksRef.current = [];
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="projects-card-fireworks"
      aria-hidden="true"
    />
  );
};

export const ProjectsApp: React.FC = () => {
  const { openApp } = useWindow();
  const { getDesktopNodes } = useFS();
  const [brokenPreviews, setBrokenPreviews] = useState<Record<string, true>>(
    {},
  );
  const [hoverPhoton, setHoverPhoton] = useState(false);

  const projects = useMemo(
    () => collectProjectCards(readBrowserBookmarks(), getDesktopNodes()),
    [getDesktopNodes],
  );

  /** Photon: real browser GitHub tab — not in-OS Edge. Other cards keep in-OS Edge. */
  const openProject = (project: ProjectCard) => {
    if (project.specialEffect === "photon") {
      const githubUrl = project.githubUrl ?? project.url;
      window.open(githubUrl, "_blank", "noopener");
      return;
    }
    openApp("edge", { url: project.url });
  };

  /** Real browser new tab (Edge/Chrome) — not in-OS Edge window. */
  const openGithub = (project: ProjectCard, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!project.githubUrl) return;
    window.open(project.githubUrl, "_blank", "noopener");
  };

  /** Freelance / no-repo projects: open live site in a real browser tab. */
  const openSite = (project: ProjectCard, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(project.url, "_blank", "noopener,noreferrer");
  };

  const previewSrc = (project: ProjectCard) => {
    if (brokenPreviews[project.id]) {
      return project.previewFallback ?? project.preview;
    }
    return project.preview ?? project.previewFallback;
  };

  const onCardMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--mx", px.toFixed(3));
    card.style.setProperty("--my", py.toFixed(3));
  };

  const onCardLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--mx", "0");
    e.currentTarget.style.setProperty("--my", "0");
  };

  return (
    <div className="projects-app" role="main" aria-label="Projelerim">
      <div className="projects-scene" aria-hidden="true">
        <ProjectsSceneBg />
        <div className="projects-scene-vignette" />
      </div>

      <header className="projects-header">
        <div className="projects-title-row">
          <div className="projects-title-icon" aria-hidden="true">
            <FolderOpen size={22} />
          </div>
          <div>
            <h1 className="projects-title">Projelerim</h1>
            <p className="projects-subtitle">
              Masaüstü kısayolları ve tarayıcı yer imleri · {projects.length}{" "}
              proje
            </p>
          </div>
        </div>

        <section className="projects-intro" aria-label="Tanıtım">
          <p className="projects-intro-name">{OS_USER.displayName}</p>
          <p className="projects-intro-text">
            Full-stack .NET ve React geliştiricisi. Bu koleksiyon, canlıya alınan
            web uygulamalarımı ve freelance işlerimi — e-ticaret, bileşen
            kütüphanesi, gerçek zamanlı oyun, pomodoro, video analizi, klinik site, su arıtma, tarayıcıda çalışan işletim sistemleri (Windows 11, XP, 8.1, macOS, Ubuntu, Android, iPhone), Windows masaüstü uygulamaları, .NET / Spring backend API'leri ve Photon Engine (C++ path tracer) — tek bakışta toplar. Karttaki önizlemeye tıklayarak siteyi açın;
            GitHub veya site bağlantısından kaynağa / canlıya gidin.
          </p>
        </section>

      </header>

      {projects.length === 0 ? (
        <div className="projects-empty" role="status">
          Henüz proje kısayolu yok. Masaüstüne web kısayolu ekleyin veya Chrome
          yer imlerini güncelleyin.
        </div>
      ) : (
        <div className="projects-grid" role="list">
          {projects.map((project, index) => {
            const src = previewSrc(project);
            const isPhoton = project.specialEffect === "photon";
            return (
              <article
                key={project.id}
                className={
                  isPhoton
                    ? "projects-card projects-card--photon"
                    : "projects-card"
                }
                role="listitem"
                style={{ ["--stagger" as string]: String(index) }}
                onMouseMove={onCardMove}
                onMouseEnter={
                  isPhoton ? () => setHoverPhoton(true) : undefined
                }
                onMouseLeave={(e) => {
                  onCardLeave(e);
                  if (isPhoton) setHoverPhoton(false);
                }}
                onAnimationEnd={(e) => {
                  if (e.target === e.currentTarget) {
                    e.currentTarget.classList.add("projects-card--ready");
                  }
                }}
              >
                {isPhoton ? <div className="projects-card-rainbow" aria-hidden="true" /> : null}
                {isPhoton ? <PhotonFireworks active={hoverPhoton} /> : null}
                <button
                  type="button"
                  className="projects-card-main"
                  onClick={() => openProject(project)}
                  aria-label={
                    isPhoton
                      ? `${project.name} GitHub deposunu yeni sekmede aç`
                      : `${project.name} sitesini aç`
                  }
                >
                  <div className="projects-card-media" aria-hidden="true">
                    {src ? (
                      <img
                        src={src}
                        alt=""
                        className="projects-card-preview-img"
                        loading="lazy"
                        onError={() => {
                          if (
                            project.previewFallback &&
                            !brokenPreviews[project.id]
                          ) {
                            setBrokenPreviews((prev) => ({
                              ...prev,
                              [project.id]: true,
                            }));
                          }
                        }}
                      />
                    ) : (
                      <div className="projects-card-preview-fallback" />
                    )}
                    <div className="projects-card-scrim" />
                    <div className="projects-card-fore">
                      <div className="projects-card-icon-wrap">
                        <img
                          src={project.icon}
                          alt=""
                          className="projects-card-icon"
                          width={56}
                          height={56}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              `${import.meta.env.BASE_URL}icons/chrome.svg`;
                          }}
                        />
                      </div>
                      <div className="projects-card-body">
                        <span className="projects-card-name">{project.name}</span>
                        <span className="projects-card-host">
                          {hostLabel(project.url)}
                        </span>
                      </div>
                      <ExternalLink
                        size={15}
                        className="projects-card-open"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>
                <div className="projects-card-footer">
                  {project.githubUrl ? (
                    <button
                      type="button"
                      className="projects-card-github"
                      onClick={(e) => openGithub(project, e)}
                      title={project.githubUrl}
                      aria-label={`${project.name} GitHub deposunu yeni sekmede aç`}
                    >
                      <GitHubMark size={14} className="projects-card-github-mark" />
                      <span className="projects-card-github-url">
                        {githubRepoLabel(project.githubUrl)}
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="projects-card-site"
                      onClick={(e) => openSite(project, e)}
                      title={project.url}
                      aria-label={`${project.name} sitesini yeni sekmede aç`}
                    >
                      <Globe size={14} className="projects-card-site-mark" />
                      <span className="projects-card-site-url">
                        {hostLabel(project.url)}
                      </span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsApp;
