import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useWindow } from "../../context/WindowContext";
import type {
  AppWindow,
  SnapLayout,
} from "../../context/WindowContext";
import { Minus, Square, Copy, X } from "lucide-react";
import { AppWindowIcon } from "../Common/Win11Icons";
import "./window.css";

interface WindowProps {
  win: AppWindow;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ win, children }) => {
  const {
    activeWindowId,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
  } = useWindow();

  const winRef = useRef<HTMLDivElement>(null);
  const isActive = activeWindowId === win.id;

  // Snap Layouts state
  const [showSnapLayouts, setShowSnapLayouts] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    winX: 0,
    winY: 0,
    winW: 0,
  });
  const [snapPreview, setSnapPreview] = useState<
    SnapLayout | "maximize" | null
  >(null);

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    winX: 0,
    winY: 0,
    winW: 0,
    winH: 0,
  });

  // DRAG GLOBAL EFFECT
  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const workHeight = Math.max(200, window.innerHeight - 48);
      const visibleGrip = Math.min(120, dragStart.winW);
      const nextX = Math.min(
        window.innerWidth - visibleGrip,
        Math.max(-dragStart.winW + visibleGrip, dragStart.winX + deltaX),
      );
      const nextY = Math.min(
        workHeight - 36,
        Math.max(0, dragStart.winY + deltaY),
      );

      if (e.clientY <= 8) setSnapPreview("maximize");
      else if (e.clientX <= 10) setSnapPreview("left-half");
      else if (e.clientX >= window.innerWidth - 10)
        setSnapPreview("right-half");
      else setSnapPreview(null);

      updateWindowPosition(win.id, nextX, nextY);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      if (snapPreview === "maximize") maximizeWindow(win.id);
      else if (snapPreview) snapWindow(win.id, snapPreview);
      setSnapPreview(null);
    };

    const handlePointerCancel = () => {
      setIsDragging(false);
      setSnapPreview(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, [
    isDragging,
    dragStart,
    maximizeWindow,
    snapPreview,
    snapWindow,
    win.id,
    updateWindowPosition,
  ]);

  // RESIZE GLOBAL EFFECT
  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = resizeStart.winW;
      let newHeight = resizeStart.winH;
      let newX = resizeStart.winX;
      let newY = resizeStart.winY;

      const workWidth = Math.max(280, window.innerWidth);
      const workHeight = Math.max(200, window.innerHeight - 48);
      const minWidth = Math.min(280, workWidth);
      const minHeight = Math.min(200, workHeight);

      // Horizontal Resizing
      if (resizeDirection.includes("e")) {
        newWidth = Math.min(
          workWidth - resizeStart.winX,
          Math.max(minWidth, resizeStart.winW + deltaX),
        );
      } else if (resizeDirection.includes("w")) {
        const rightEdge = resizeStart.winX + resizeStart.winW;
        newX = Math.min(
          rightEdge - minWidth,
          Math.max(0, resizeStart.winX + deltaX),
        );
        newWidth = rightEdge - newX;
      }

      // Vertical Resizing
      if (resizeDirection.includes("s")) {
        newHeight = Math.min(
          workHeight - resizeStart.winY,
          Math.max(minHeight, resizeStart.winH + deltaY),
        );
      } else if (resizeDirection.includes("n")) {
        const bottomEdge = resizeStart.winY + resizeStart.winH;
        newY = Math.min(
          bottomEdge - minHeight,
          Math.max(0, resizeStart.winY + deltaY),
        );
        newHeight = bottomEdge - newY;
      }

      updateWindowSize(win.id, newWidth, newHeight, newX, newY);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      setResizeDirection("");
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isResizing, resizeStart, resizeDirection, win.id, updateWindowSize]);

  // DRAG HANDLERS
  const handleTitlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return; // Left click only

    let winX = win.x;
    let winY = win.y;
    let winW = win.width;

    if (win.isMaximized || win.snapLayout) {
      const restored = win.restoreBounds ?? {
        x: 20,
        y: 20,
        width: Math.min(900, window.innerWidth - 40),
        height: Math.min(600, window.innerHeight - 88),
      };
      const horizontalRatio = Math.min(
        0.92,
        Math.max(0.08, e.clientX / Math.max(1, window.innerWidth)),
      );
      winW = restored.width;
      winX = Math.min(
        window.innerWidth - 120,
        Math.max(-winW + 120, e.clientX - winW * horizontalRatio),
      );
      winY = 0;
      restoreWindow(win.id, winX, winY);
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      winX,
      winY,
      winW,
    });
    focusWindow(win.id);
    e.stopPropagation();
  };

  // SNAP HANDLER
  const handleSnap = (type: SnapLayout) => {
    snapWindow(win.id, type);
    setShowSnapLayouts(false);
  };

  // RESIZE HANDLERS
  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    direction: string,
  ) => {
    if (win.isMaximized) return;
    if (e.button !== 0) return;

    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      winX: win.x,
      winY: win.y,
      winW: win.width,
      winH: win.height,
    });
    focusWindow(win.id);
    e.stopPropagation();
  };

  // Maximize against the viewport (not desktop %). Absolute 100% inside
  // .desktop-area was shifting the box up ~21px (clipped top + gap above taskbar).
  const windowStyles: React.CSSProperties = win.isMaximized
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "calc(100vh - var(--taskbar-height))",
        zIndex: win.zIndex,
        borderRadius: 0,
        animation: "none",
        transform: "none",
        opacity: 1,
      }
    : {
        position: "absolute",
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex,
      };

  return (
    <>
      {snapPreview &&
        createPortal(
          <div
            className={`window-snap-preview preview-${snapPreview}`}
            aria-hidden="true"
          />,
          document.body,
        )}
      <div
      ref={winRef}
      className={`window-container glass ${isActive ? "active" : ""} ${
        win.isMaximized ? "maximized" : ""
      } ${win.isMinimized ? "minimized" : ""}`}
      style={win.isMinimized ? { ...windowStyles, display: "none" } : windowStyles}
      onMouseDown={() => focusWindow(win.id)}
      onTouchStart={() => focusWindow(win.id)}
      role="dialog"
      aria-label={`${win.title} penceresi`}
      aria-hidden={win.isMinimized}
    >
      {/* Resizer Handles (8 positions - only when not maximized) */}
      {!win.isMaximized && (
        <>
          <div
            className="resizer resizer-n"
            onPointerDown={(e) => handleResizePointerDown(e, "n")}
          />
          <div
            className="resizer resizer-s"
            onPointerDown={(e) => handleResizePointerDown(e, "s")}
          />
          <div
            className="resizer resizer-e"
            onPointerDown={(e) => handleResizePointerDown(e, "e")}
          />
          <div
            className="resizer resizer-w"
            onPointerDown={(e) => handleResizePointerDown(e, "w")}
          />
          <div
            className="resizer resizer-nw"
            onPointerDown={(e) => handleResizePointerDown(e, "nw")}
          />
          <div
            className="resizer resizer-ne"
            onPointerDown={(e) => handleResizePointerDown(e, "ne")}
          />
          <div
            className="resizer resizer-sw"
            onPointerDown={(e) => handleResizePointerDown(e, "sw")}
          />
          <div
            className="resizer resizer-se"
            onPointerDown={(e) => handleResizePointerDown(e, "se")}
          />
        </>
      )}

      {/* Chrome owns its caption (tabs + window buttons); skip OS titlebar */}
      {win.appId !== "edge" && (
        <div
          className="window-titlebar"
          onPointerDown={handleTitlePointerDown}
          onDoubleClick={() => maximizeWindow(win.id)}
        >
          <div className="titlebar-info">
            <span className="titlebar-app-icon">
              <AppWindowIcon appId={win.appId} size={16} />
            </span>
            <span className="titlebar-text">{win.title}</span>
          </div>

          <div
            className="titlebar-controls"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              className="ctrl-btn btn-min"
              onClick={() => minimizeWindow(win.id)}
              title="Küçült"
              aria-label={`${win.title} penceresini küçült`}
            >
              <Minus size={14} />
            </button>

            <div
              className="maximize-btn-wrapper"
              onMouseEnter={() => setShowSnapLayouts(true)}
              onMouseLeave={() => setShowSnapLayouts(false)}
            >
              <button
                className="ctrl-btn btn-max"
                onClick={() => maximizeWindow(win.id)}
                title={win.isMaximized ? "Aşağı Ekran" : "Ekranı Kapla"}
                aria-label={
                  win.isMaximized
                    ? `${win.title} penceresini geri yükle`
                    : `${win.title} penceresini ekranı kapla`
                }
              >
                {win.isMaximized ? <Copy size={11} /> : <Square size={11} />}
              </button>

              {showSnapLayouts && !win.isMaximized && (
                <div className="snap-layouts-dropdown glass">
                  <button
                    type="button"
                    className="snap-layout-option option-split-half"
                    onClick={() => handleSnap("left-half")}
                    title="Sol Yarı"
                    aria-label="Pencereyi sol yarıya yerleştir"
                  />
                  <button
                    type="button"
                    className="snap-layout-option option-split-half"
                    onClick={() => handleSnap("right-half")}
                    title="Sağ Yarı"
                    aria-label="Pencereyi sağ yarıya yerleştir"
                  />
                  <button
                    type="button"
                    className="snap-layout-option option-split-third-left"
                    onClick={() => handleSnap("left-third")}
                    title="Sol Üçte Bir"
                    aria-label="Pencereyi sol üçte bire yerleştir"
                  />
                  <button
                    type="button"
                    className="snap-layout-option option-split-third-right"
                    onClick={() => handleSnap("right-twothird")}
                    title="Sağ Üçte İki"
                    aria-label="Pencereyi sağ üçte ikiye yerleştir"
                  />
                </div>
              )}
            </div>

            <button
              className="ctrl-btn btn-close"
              onClick={() => closeWindow(win.id)}
              title="Kapat"
              aria-label={`${win.title} penceresini kapat`}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* App Content */}
      <div
        className={`window-content-area ${win.appId === "edge" ? "chrome-hosted" : ""}`}
        onPointerDown={(e) => {
          if (win.appId !== "edge") return;
          const t = e.target as HTMLElement;
          if (
            t.closest(".chrome-caption-drag") &&
            !t.closest("button, a, input, .chrome-tab")
          ) {
            handleTitlePointerDown(e);
          }
        }}
        onDoubleClick={(e) => {
          if (win.appId !== "edge") return;
          const t = e.target as HTMLElement;
          if (
            t.closest(".chrome-caption-drag") &&
            !t.closest("button, a, input, .chrome-tab")
          ) {
            maximizeWindow(win.id);
          }
        }}
      >
        {/* Prevent iframe stealing mouse focus during drag/resize */}
        {(isDragging || isResizing) && <div className="iframe-shield" />}
        {children}
      </div>
      </div>
    </>
  );
};
export default Window;
