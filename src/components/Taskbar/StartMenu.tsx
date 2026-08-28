import React, { useEffect, useMemo, useRef, useState } from "react";
import { LockKeyhole, LogOut, Power, RotateCw, Search } from "lucide-react";
import { APP_CATALOG } from "../../appCatalog";
import { useFS, type VFSNode } from "../../context/FSContext";
import { useSystem } from "../../context/SystemContext";
import { useWindow } from "../../context/WindowContext";
import { OS_USER, userPath } from "../../osUser";
import { AppWindowIcon, TextFileIcon } from "../Common/Win11Icons";
import "./startmenu.css";

const DESKTOP_PATH = userPath("Desktop");
const PINNED_APP_IDS = [
  "explorer",
  "edge",
  "notepad",
  "calculator",
  "cmd",
  "settings",
  "paint",
  "vscode",
  "minesweeper",
  "camera",
  "imageviewer",
  "store",
];

export const StartMenu: React.FC = () => {
  const {
    isStartOpen,
    setStartOpen,
    restartSystem,
    shutdownSystem,
    lockSystem,
    installedAppIds,
  } = useSystem();
  const { openApp } = useWindow();
  const { getDesktopNodes } = useFS();
  const [searchQuery, setSearchQuery] = useState("");
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);
  const [showAllApps, setShowAllApps] = useState(false);
  const powerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (powerRef.current && !powerRef.current.contains(event.target as Node)) {
        setPowerMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isStartOpen) return;
    const timer = window.setTimeout(() => {
      setSearchQuery("");
      setPowerMenuOpen(false);
      setShowAllApps(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isStartOpen]);

  const availableApps = useMemo(
    () =>
      APP_CATALOG.filter(
        (app) => app.id === "store" || installedAppIds.includes(app.id),
      ),
    [installedAppIds],
  );

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("tr-TR");
  const displayedApps = availableApps
    .filter((app) => {
      if (normalizedQuery) {
        return app.title.toLocaleLowerCase("tr-TR").includes(normalizedQuery);
      }
      return showAllApps ? true : PINNED_APP_IDS.includes(app.id);
    })
    .sort((a, b) =>
      showAllApps || normalizedQuery
        ? a.title.localeCompare(b.title, "tr-TR")
        : PINNED_APP_IDS.indexOf(a.id) - PINNED_APP_IDS.indexOf(b.id),
    );

  const recentFiles = getDesktopNodes()
    .filter((node) => node.type === "file")
    .slice(0, 4);

  const handleAppClick = (appId: string) => {
    openApp(appId);
    setStartOpen(false);
  };

  const handleRecentFileClick = (file: VFSNode) => {
    const extension = file.name.split(".").pop()?.toLocaleLowerCase("tr-TR");
    if (["png", "jpg", "jpeg", "gif"].includes(extension ?? "")) {
      openApp("imageviewer", {
        fileName: file.name,
        filePath: DESKTOP_PATH,
      });
    } else if (
      ["js", "jsx", "ts", "tsx", "css", "html", "json"].includes(
        extension ?? "",
      )
    ) {
      openApp("vscode", {
        fileName: file.name,
        filePath: DESKTOP_PATH,
      });
    } else {
      openApp("notepad", {
        fileName: file.name,
        filePath: DESKTOP_PATH,
      });
    }
    setStartOpen(false);
  };

  if (!isStartOpen) return null;

  return (
    <section
      className="start-menu-container glass"
      role="dialog"
      aria-label="Başlat menüsü"
      onClick={(event) => event.stopPropagation()}
    >
      <label className="start-search-bar">
        <Search size={16} className="start-search-icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Uygulama ve dosya arayın"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Başlat menüsünde ara"
          autoFocus
        />
      </label>

      <div className="pinned-apps-section">
        <div className="section-header">
          <span>
            {normalizedQuery
              ? "Arama sonuçları"
              : showAllApps
                ? "Tüm Uygulamalar"
                : "Sabitlenenler"}
          </span>
          {!normalizedQuery && (
            <button
              type="button"
              className="all-apps-btn"
              onClick={() => setShowAllApps((value) => !value)}
              aria-pressed={showAllApps}
            >
              {showAllApps ? "Geri" : "Tüm Uygulamalar ›"}
            </button>
          )}
        </div>

        {displayedApps.length > 0 ? (
          <div className={`apps-grid ${showAllApps ? "all-apps-grid" : ""}`}>
            {displayedApps.map((app) => (
              <button
                type="button"
                key={app.id}
                className="grid-app-item"
                onClick={() => handleAppClick(app.id)}
                title={app.title}
              >
                <span className="grid-app-icon">
                  <AppWindowIcon appId={app.id} size={28} />
                </span>
                <span className="grid-app-name">{app.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="no-results" role="status">
            “{searchQuery}” için sonuç bulunamadı
          </div>
        )}
      </div>

      {!showAllApps && !normalizedQuery && (
        <div className="recommended-section">
          <div className="section-header">
            <span>Önerilenler</span>
          </div>
          <div className="recent-files-list">
            {recentFiles.length > 0 ? (
              recentFiles.map((file) => (
                <button
                  type="button"
                  key={file.name}
                  className="recent-file-item"
                  onClick={() => handleRecentFileClick(file)}
                >
                  <TextFileIcon size={24} className="recent-file-icon" />
                  <span className="recent-file-details">
                    <span className="recent-file-name">{file.name}</span>
                    <span className="recent-file-time">Masaüstünde</span>
                  </span>
                </button>
              ))
            ) : (
              <div className="no-recent">Yakın zamanda kaydedilen dosya yok</div>
            )}
          </div>
        </div>
      )}

      <footer className="start-menu-footer">
        <button
          type="button"
          className="footer-user"
          onClick={() => {
            openApp("settings", { tab: "accounts" });
            setStartOpen(false);
          }}
          title="Hesap ayarlarını aç"
        >
          <img
            src={OS_USER.avatarUrl}
            alt=""
            className="footer-user-avatar"
          />
          <span className="footer-user-name">{OS_USER.displayName}</span>
        </button>

        <div ref={powerRef} className="power-menu-anchor">
          <button
            type="button"
            className="footer-power-btn"
            onClick={() => setPowerMenuOpen((value) => !value)}
            title="Güç seçenekleri"
            aria-expanded={powerMenuOpen}
          >
            <Power size={18} />
          </button>

          {powerMenuOpen && (
            <div className="power-menu-dropdown glass" role="menu">
              <button type="button" className="power-item" onClick={lockSystem}>
                <LockKeyhole size={14} />
                <span>Kilitle</span>
              </button>
              <button
                type="button"
                className="power-item"
                onClick={restartSystem}
              >
                <RotateCw size={14} />
                <span>Yeniden Başlat</span>
              </button>
              <button
                type="button"
                className="power-item"
                onClick={shutdownSystem}
              >
                <LogOut size={14} />
                <span>Bilgisayarı Kapat</span>
              </button>
            </div>
          )}
        </div>
      </footer>
    </section>
  );
};

export default StartMenu;
