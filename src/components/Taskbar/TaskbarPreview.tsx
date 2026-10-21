import React from "react";
import { AppWindowIcon } from "../Common/Win11Icons";
import type { AppWindow } from "../../context/WindowContext";

export interface TaskbarPreviewState {
  /** Anchor button center X (viewport). */
  centerX: number;
  appId: string;
  /** Ids of the app's open windows; resolved against live windows at render. */
  windowIds: string[];
  /** Highlighted / hovered instance. */
  activeWindowId: string;
}

interface Props {
  preview: TaskbarPreviewState;
  /** All current windows (from WindowContext). */
  windows: AppWindow[];
  activeWindowId: string | null;
  onFocus: (windowId: string) => void;
  onCloseRequest: () => void;
  onKeepOpen: () => void;
}

const accentFor = (appId: string, seed: string): [string, string] => {
  const palette: Record<string, [string, string]> = {
    edge: ["#4285f4", "#34a853"],
    explorer: ["#f7ba2b", "#0078d4"],
    settings: ["#0078d4", "#00bcf2"],
    notepad: ["#f2c811", "#fff4b8"],
    terminal: ["#0c0c0c", "#16c60c"],
    calculator: ["#2d2d2d", "#60cdff"],
    taskmgr: ["#0078d4", "#50e6ff"],
    projects: ["#0078d4", "#5b9bd5"],
    paint: ["#c43e1c", "#f7630c"],
    store: ["#0078d4", "#5c2d91"],
  };
  if (palette[appId]) return palette[appId];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return [`hsl(${hue} 65% 48%)`, `hsl(${(hue + 40) % 360} 55% 58%)`];
};

const WindowSilhouette: React.FC<{
  win: AppWindow;
  isActive: boolean;
  onSelect: () => void;
}> = ({ win, isActive, onSelect }) => {
  const [c1, c2] = accentFor(win.appId, win.title || win.id);
  let host = "";
  try {
    const urlHint = win.params?.url ?? "";
    if (urlHint) host = new URL(urlHint).hostname.replace(/^www\./, "");
  } catch {
    host = "";
  }

  return (
    <button
      type="button"
      className={`tb-preview-card ${isActive ? "active" : ""} ${win.isMinimized ? "minimized" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      title={win.title}
    >
      <div className="tb-preview-thumb" style={{ ["--tb-a" as string]: c1, ["--tb-b" as string]: c2 }}>
        <div className="tb-preview-titlebar">
          <span className="tb-preview-titlebar-icon">
            <AppWindowIcon appId={win.appId} size={12} />
          </span>
          <span className="tb-preview-titlebar-text">
            {win.title || "Pencere"}
          </span>
          <span className="tb-preview-titlebar-dots" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="tb-preview-body">
          {host ? (
            <div className="tb-preview-browser">
              <div className="tb-preview-omnibox">{host}</div>
              <div className="tb-preview-blocks">
                <span className="blk hero" />
                <span className="blk side" />
                <span className="blk row" />
                <span className="blk row short" />
                <span className="blk card" />
                <span className="blk card" />
              </div>
            </div>
          ) : (
            <div className="tb-preview-app-layout">
              <span className="blk nav" />
              <span className="blk main">
                <span className="blk line" />
                <span className="blk line mid" />
                <span className="blk line short" />
                <span className="blk panel" />
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="tb-preview-caption">
        <AppWindowIcon appId={win.appId} size={14} />
        <span>{win.title || "Pencere"}</span>
      </div>
    </button>
  );
};

export const TaskbarPreviewFlyout: React.FC<Props> = ({
  preview,
  windows,
  activeWindowId,
  onFocus,
  onCloseRequest,
  onKeepOpen,
}) => {
  const previewWindows = preview.windowIds
    .map((id) => windows.find((w) => w.id === id))
    .filter((w): w is AppWindow => Boolean(w));
  if (previewWindows.length === 0) return null;

  const cardW = 176;
  const gap = 8;
  const pad = 10;
  const totalW =
    previewWindows.length * cardW +
    (previewWindows.length - 1) * gap +
    pad * 2;
  const left = Math.max(
    8,
    Math.min(preview.centerX - totalW / 2, window.innerWidth - totalW - 8),
  );

  return (
    <div
      className="tb-preview-flyout glass"
      style={{ left: `${left}px` }}
      role="dialog"
      aria-label="Pencere önizlemeleri"
      onMouseEnter={onKeepOpen}
      onMouseLeave={onCloseRequest}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="tb-preview-row">
        {previewWindows.map((win) => (
          <WindowSilhouette
            key={win.id}
            win={win}
            isActive={win.id === (activeWindowId ?? preview.activeWindowId)}
            onSelect={() => onFocus(win.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskbarPreviewFlyout;
