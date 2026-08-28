import React, { useEffect, useRef } from "react";
import { X, PanelsTopLeft } from "lucide-react";
import { useSystem } from "../../context/SystemContext";
import { useWindow } from "../../context/WindowContext";
import { AppWindowIcon } from "../Common/Win11Icons";
import "./taskview.css";

export const TaskView: React.FC = () => {
  const { isTaskViewOpen, setTaskViewOpen } = useSystem();
  const { windows, activeWindowId, focusWindow, closeWindow } = useWindow();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTaskViewOpen) return;
    panelRef.current?.focus();
  }, [isTaskViewOpen]);

  if (!isTaskViewOpen) return null;

  const orderedWindows = [...windows].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div
      className="task-view-backdrop"
      onPointerDown={() => setTaskViewOpen(false)}
    >
      <div
        ref={panelRef}
        className="task-view-panel"
        role="dialog"
        aria-label="Görev görünümü"
        tabIndex={-1}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <header className="task-view-header">
          <div>
            <span className="task-view-eyebrow">Görev görünümü</span>
            <h2>Açık pencereler</h2>
          </div>
          <button
            type="button"
            className="task-view-close"
            onClick={() => setTaskViewOpen(false)}
            aria-label="Görev görünümünü kapat"
          >
            <X size={18} />
          </button>
        </header>

        {orderedWindows.length === 0 ? (
          <div className="task-view-empty">
            <PanelsTopLeft size={42} />
            <strong>Açık pencere yok</strong>
            <span>Bir uygulama açtığınızda burada görünecek.</span>
          </div>
        ) : (
          <div className="task-view-grid" role="list">
            {orderedWindows.map((win) => (
              <article
                key={win.id}
                className={`task-view-card ${
                  win.id === activeWindowId ? "active" : ""
                } ${win.isMinimized ? "minimized" : ""}`}
                role="listitem"
              >
                <button
                  type="button"
                  className="task-view-card-main"
                  onClick={() => {
                    focusWindow(win.id);
                    setTaskViewOpen(false);
                  }}
                  aria-label={`${win.title} penceresine geç`}
                >
                  <span className="task-view-preview">
                    <AppWindowIcon appId={win.appId} size={46} />
                    <span>{win.isMinimized ? "Küçültüldü" : "Açık"}</span>
                  </span>
                  <span className="task-view-card-title">
                    <AppWindowIcon appId={win.appId} size={18} />
                    <span>{win.title}</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="task-view-card-close"
                  onClick={() => closeWindow(win.id)}
                  aria-label={`${win.title} penceresini kapat`}
                >
                  <X size={15} />
                </button>
              </article>
            ))}
          </div>
        )}

        <footer className="task-view-footer">
          <span>Alt + Tab ile pencereler arasında geçiş yapabilirsiniz.</span>
          <span>{windows.length} açık pencere</span>
        </footer>
      </div>
    </div>
  );
};

export default TaskView;
