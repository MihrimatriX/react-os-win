import React, { useEffect, useRef, useState } from "react";
import { useSystem } from "../../context/SystemContext";
import { useWindow } from "../../context/WindowContext";
import {
  Wifi,
  Volume2,
  VolumeX,
  Search,
  ChevronUp,
  Shield,
  Battery,
  Cloud,
  ShieldCheck,
  MessageSquare,
  Music,
  Gamepad2,
  Play,
  Minimize2,
  X,
  Pin,
  LayoutDashboard,
  Calendar,
  Settings,
  EyeOff,
  Activity,
  PanelsTopLeft,
} from "lucide-react";
import {
  FolderIcon,
  EdgeIcon,
  AppWindowIcon,
} from "../Common/Win11Icons";
import {
  TASKBAR_PINNED_APP_IDS,
  getAppDefinition,
} from "../../appCatalog";
import "./taskbar.css";
import "../Desktop/contextmenu.css";

type TaskbarMenu =
  | {
      kind: "app";
      appId: string;
      name: string;
      x: number;
    }
  | {
      kind: "start";
      x: number;
    }
  | {
      kind: "search";
      x: number;
    }
  | {
      kind: "tray";
      zone: "quick" | "clock" | "security" | "widgets" | "empty";
      x: number;
    };

export const Taskbar: React.FC = () => {
  const {
    isStartOpen,
    setStartOpen,
    isQuickSettingsOpen,
    setQuickSettingsOpen,
    isCalendarOpen,
    setCalendarOpen,
    isWidgetsOpen,
    setWidgetsOpen,
    isTaskViewOpen,
    setTaskViewOpen,
    closeSystemPanels,
    volume,
    wifi,
  } = useSystem();

  const {
    windows,
    openApp,
    focusWindow,
    activeWindowId,
    minimizeWindow,
    closeWindow,
    toggleShowDesktop,
    isShowingDesktop,
  } = useWindow();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isHiddenIconsOpen, setIsHiddenIconsOpen] = useState(false);
  const [menu, setMenu] = useState<TaskbarMenu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      setIsHiddenIconsOpen(false);
      setMenu(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        ".context-menu-item:not([aria-disabled='true'])",
      ) ?? [],
    );
    items.forEach((item) => {
      item.tabIndex = 0;
      item.setAttribute("role", "menuitem");
    });
    items[0]?.focus();
  }, [menu]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      );
      setDateStr(
        now.toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const closePanels = () => {
    closeSystemPanels();
    setIsHiddenIconsOpen(false);
  };

  const handleStartToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenu(null);
    setStartOpen(!isStartOpen);
    setQuickSettingsOpen(false);
    setCalendarOpen(false);
  };

  const handleQuickSettingsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenu(null);
    setQuickSettingsOpen(!isQuickSettingsOpen);
    setStartOpen(false);
    setCalendarOpen(false);
  };

  const handleCalendarToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenu(null);
    setCalendarOpen(!isCalendarOpen);
    setStartOpen(false);
    setQuickSettingsOpen(false);
  };

  const openMenu = (next: TaskbarMenu) => {
    closePanels();
    setMenu(next);
  };

  const taskbarAppIds = [
    ...TASKBAR_PINNED_APP_IDS,
    ...windows.map((win) => win.appId),
  ].filter((appId, index, ids) => ids.indexOf(appId) === index);

  const taskbarApps = taskbarAppIds.map((appId) => {
    const definition = getAppDefinition(appId);
    return { appId, name: definition.title };
  });

  const menuLeft = menu
    ? Math.max(8, Math.min(menu.x - 110, window.innerWidth - 256))
    : 0;

  const renderMenu = () => {
    if (!menu) return null;

    if (menu.kind === "app") {
      const openWindows = windows.filter((w) => w.appId === menu.appId);
      const isOpen = openWindows.length > 0;
      const focused = openWindows.find((w) => w.id === activeWindowId);

      return (
        <>
          <div
            className="context-menu-item"
            onClick={() => {
              if (isOpen) {
                if (focused) focusWindow(focused.id);
                else focusWindow(openWindows[0].id);
              } else {
                openApp(menu.appId);
              }
              setMenu(null);
            }}
          >
            <Play size={14} className="context-menu-icon" />
            <span>{isOpen ? "Öne getir" : `${menu.name} aç`}</span>
          </div>

          {isOpen && (
            <div
              className="context-menu-item"
              onClick={() => {
                openWindows.forEach((w) => minimizeWindow(w.id));
                setMenu(null);
              }}
            >
              <Minimize2 size={14} className="context-menu-icon" />
              <span>Küçült</span>
            </div>
          )}

          <div className="context-menu-separator" />

          <div className="context-menu-item" aria-disabled="true">
            <Pin size={14} className="context-menu-icon" />
            <span>
              {TASKBAR_PINNED_APP_IDS.includes(
                menu.appId as (typeof TASKBAR_PINNED_APP_IDS)[number],
              )
                ? "Görev çubuğuna sabitlendi"
                : "Çalışan uygulama"}
            </span>
          </div>

          {isOpen && (
            <>
              <div className="context-menu-separator" />
              <div
                className="context-menu-item"
                style={{ color: "#ff3b30" }}
                onClick={() => {
                  openWindows.forEach((w) => closeWindow(w.id));
                  setMenu(null);
                }}
              >
                <X size={14} className="context-menu-icon" style={{ color: "#ff3b30" }} />
                <span>
                  {openWindows.length > 1
                    ? `Tüm pencereleri kapat (${openWindows.length})`
                    : "Pencereyi kapat"}
                </span>
              </div>
            </>
          )}

          <div className="context-menu-separator" />
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("taskmgr");
              setMenu(null);
            }}
          >
            <Activity size={14} className="context-menu-icon" />
            <span>Görev Yöneticisi</span>
          </div>
        </>
      );
    }

    if (menu.kind === "start") {
      return (
        <>
          <div
            className="context-menu-item"
            onClick={() => {
              setStartOpen(true);
              setMenu(null);
            }}
          >
            <LayoutDashboard size={14} className="context-menu-icon" />
            <span>Başlat menüsü</span>
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("settings");
              setMenu(null);
            }}
          >
            <Settings size={14} className="context-menu-icon" />
            <span>Ayarlar</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("explorer");
              setMenu(null);
            }}
          >
            <FolderIcon size={14} />
            <span>Dosya Gezgini</span>
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("taskmgr");
              setMenu(null);
            }}
          >
            <Activity size={14} className="context-menu-icon" />
            <span>Görev Yöneticisi</span>
          </div>
        </>
      );
    }

    if (menu.kind === "search") {
      return (
        <>
          <div
            className="context-menu-item"
            onClick={() => {
              setStartOpen(true);
              setMenu(null);
            }}
          >
            <Search size={14} className="context-menu-icon" />
            <span>Ara</span>
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("taskmgr");
              setMenu(null);
            }}
          >
            <Activity size={14} className="context-menu-icon" />
            <span>Görev Yöneticisi</span>
          </div>
        </>
      );
    }

    // tray zones
    if (menu.zone === "clock") {
      return (
        <>
          <div
            className="context-menu-item"
            onClick={() => {
              setCalendarOpen(true);
              setMenu(null);
            }}
          >
            <Calendar size={14} className="context-menu-icon" />
            <span>Takvimi aç</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("settings", { tab: "time" });
              setMenu(null);
            }}
          >
            <Settings size={14} className="context-menu-icon" />
            <span>Tarih ve saat ayarları</span>
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("taskmgr");
              setMenu(null);
            }}
          >
            <Activity size={14} className="context-menu-icon" />
            <span>Görev Yöneticisi</span>
          </div>
        </>
      );
    }

    if (menu.zone === "quick") {
      return (
        <>
          <div
            className="context-menu-item"
            onClick={() => {
              setQuickSettingsOpen(true);
              setMenu(null);
            }}
          >
            <Settings size={14} className="context-menu-icon" />
            <span>Hızlı ayarlar</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("settings", { tab: "network" });
              setMenu(null);
            }}
          >
            <Wifi size={14} className="context-menu-icon" />
            <span>Ağ ve İnternet ayarları</span>
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("taskmgr");
              setMenu(null);
            }}
          >
            <Activity size={14} className="context-menu-icon" />
            <span>Görev Yöneticisi</span>
          </div>
        </>
      );
    }

    if (menu.zone === "security") {
      return (
        <>
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("settings", { tab: "privacy" });
              setMenu(null);
            }}
          >
            <ShieldCheck size={14} className="context-menu-icon" />
            <span>Windows Güvenliği</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("settings", { tab: "privacy" });
              setMenu(null);
            }}
          >
            <Shield size={14} className="context-menu-icon" />
            <span>Gizlilik ve güvenlik</span>
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("taskmgr");
              setMenu(null);
            }}
          >
            <Activity size={14} className="context-menu-icon" />
            <span>Görev Yöneticisi</span>
          </div>
        </>
      );
    }

    if (menu.zone === "widgets") {
      return (
        <>
          <div
            className="context-menu-item"
            onClick={() => {
              setWidgetsOpen(true);
              setMenu(null);
            }}
          >
            <LayoutDashboard size={14} className="context-menu-icon" />
            <span>Widget'ları aç</span>
          </div>
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("weather");
              setMenu(null);
            }}
          >
            <span className="context-menu-icon" style={{ fontSize: 14 }}>
              🌦️
            </span>
            <span>Hava Durumu</span>
          </div>
          <div className="context-menu-separator" />
          <div
            className="context-menu-item"
            onClick={() => {
              openApp("taskmgr");
              setMenu(null);
            }}
          >
            <Activity size={14} className="context-menu-icon" />
            <span>Görev Yöneticisi</span>
          </div>
        </>
      );
    }

    // empty taskbar
    return (
      <>
        <div
          className="context-menu-item"
          onClick={() => {
            toggleShowDesktop();
            setMenu(null);
          }}
        >
          <EyeOff size={14} className="context-menu-icon" />
          <span>Masaüstünü göster</span>
        </div>
        <div className="context-menu-separator" />
        <div
          className="context-menu-item"
          onClick={() => {
            openApp("taskmgr");
            setMenu(null);
          }}
        >
          <Activity size={14} className="context-menu-icon" />
          <span>Görev Yöneticisi</span>
        </div>
        <div
          className="context-menu-item"
          onClick={() => {
            openApp("settings");
            setMenu(null);
          }}
        >
          <Settings size={14} className="context-menu-icon" />
          <span>Ayarlar</span>
        </div>
      </>
    );
  };

  return (
    <div
      className="taskbar-container glass"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target as HTMLElement;
        if (
          target.closest(".taskbar-btn") ||
          target.closest(".tray-icon-btn") ||
          target.closest(".tray-group-btn") ||
          target.closest(".tray-clock-btn") ||
          target.closest(".taskbar-left-widgets")
        ) {
          return;
        }
        openMenu({ kind: "tray", zone: "empty", x: e.clientX });
      }}
    >
      <button
        className={`taskbar-left-widgets ${isWidgetsOpen ? "active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          setMenu(null);
          setWidgetsOpen(!isWidgetsOpen);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openMenu({ kind: "tray", zone: "widgets", x: e.clientX });
        }}
        title="Hava Durumu ve Widget'lar"
        aria-label="Hava Durumu ve Widget'lar"
        aria-pressed={isWidgetsOpen}
      >
        <span className="widget-icon">🌦️</span>
        <span className="widget-temp">24°C</span>
      </button>

      <div className="taskbar-center-icons">
        <div className="taskbar-system-cluster">
          <button
            className={`taskbar-btn start-button ${isStartOpen ? "active" : ""}`}
            onClick={handleStartToggle}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openMenu({ kind: "start", x: e.clientX });
            }}
            title="Başlat"
            aria-label="Başlat"
            aria-pressed={isStartOpen}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <rect x="2" y="2" width="9.2" height="9.2" rx="1.2" fill="#7fd4ff" />
              <rect
                x="12.8"
                y="2"
                width="9.2"
                height="9.2"
                rx="1.2"
                fill="#4cc2ff"
              />
              <rect
                x="2"
                y="12.8"
                width="9.2"
                height="9.2"
                rx="1.2"
                fill="#2bb0f5"
              />
              <rect
                x="12.8"
                y="12.8"
                width="9.2"
                height="9.2"
                rx="1.2"
                fill="#0078d4"
              />
            </svg>
          </button>

          <button
            className="taskbar-btn search-button"
            onClick={handleStartToggle}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openMenu({ kind: "search", x: e.clientX });
            }}
            title="Arama"
            aria-label="Ara"
          >
            <Search size={18} strokeWidth={2.1} color="var(--text-color)" />
          </button>

          <button
            className={`taskbar-btn task-view-button ${
              isTaskViewOpen ? "active" : ""
            }`}
            onClick={(event) => {
              event.stopPropagation();
              setMenu(null);
              setTaskViewOpen(!isTaskViewOpen);
            }}
            title="Görev görünümü (Win + Tab)"
            aria-label="Görev görünümü"
            aria-pressed={isTaskViewOpen}
          >
            <PanelsTopLeft size={18} strokeWidth={2} color="var(--text-color)" />
          </button>
        </div>

        <div className="taskbar-separator" aria-hidden />

        <div className="taskbar-app-cluster">
          {taskbarApps.map((app) => {
            const openWindows = windows.filter((w) => w.appId === app.appId);
            const isOpen = openWindows.length > 0;
            const isActive = openWindows.some((w) => w.id === activeWindowId);

            return (
              <button
                key={app.appId}
                className={`taskbar-btn app-icon-btn ${isOpen ? "open" : ""} ${isActive ? "active" : ""}`}
                onClick={() => {
                  setMenu(null);
                  if (isOpen) {
                    const activeWin = openWindows.find(
                      (w) => w.id === activeWindowId,
                    );
                    if (activeWin) {
                      minimizeWindow(activeWin.id);
                    } else {
                      focusWindow(openWindows[0].id);
                    }
                  } else {
                    openApp(app.appId);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openMenu({
                    kind: "app",
                    appId: app.appId,
                    name: app.name,
                    x: e.clientX,
                  });
                }}
                title={app.name}
                aria-label={app.name}
                aria-pressed={isActive}
              >
                <span className="app-icon-visual">
                  <AppWindowIcon appId={app.appId} size={22} />
                </span>
                <span className="app-status-bar" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="taskbar-right-tray">
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            className={`tray-icon-btn hidden-icons-btn ${
              isHiddenIconsOpen ? "open" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setMenu(null);
              setIsHiddenIconsOpen(!isHiddenIconsOpen);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openMenu({ kind: "tray", zone: "empty", x: e.clientX });
            }}
            title="Gizli simgeleri göster"
            aria-label="Gizli simgeleri göster"
            aria-expanded={isHiddenIconsOpen}
            aria-haspopup="dialog"
          >
            <ChevronUp size={14} className="hidden-icons-chevron" />
          </button>

          {isHiddenIconsOpen && (
            <div
              className="hidden-icons-popover"
              role="dialog"
              aria-label="Gizli simgeler"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="hidden-icon-item"
                title="OneDrive: Eşitleme tamamlandı"
                onClick={() => {
                  openApp("explorer");
                  setIsHiddenIconsOpen(false);
                }}
              >
                <Cloud size={16} color="#0078d4" />
              </button>
              <button
                type="button"
                className="hidden-icon-item"
                title="Windows Defender: Güvendesiniz"
                onClick={() => {
                  openApp("settings", { tab: "privacy" });
                  setIsHiddenIconsOpen(false);
                }}
              >
                <ShieldCheck size={16} color="#4cd964" />
              </button>
              <button
                type="button"
                className="hidden-icon-item"
                title="Discord: Çevrimiçi"
                onClick={() => {
                  openApp("edge", { url: "https://discord.com" });
                  setIsHiddenIconsOpen(false);
                }}
              >
                <MessageSquare size={16} color="#5865F2" />
              </button>
              <button
                type="button"
                className="hidden-icon-item"
                title="Spotify"
                onClick={() => {
                  openApp("edge", { url: "https://open.spotify.com" });
                  setIsHiddenIconsOpen(false);
                }}
              >
                <Music size={16} color="#1DB954" />
              </button>
              <button
                type="button"
                className="hidden-icon-item"
                title="Steam"
                onClick={() => {
                  openApp("edge", { url: "https://store.steampowered.com" });
                  setIsHiddenIconsOpen(false);
                }}
              >
                <Gamepad2 size={16} color="#66c0f4" />
              </button>
              <button
                type="button"
                className="hidden-icon-item"
                title="Google Chrome"
                onClick={() => {
                  openApp("edge");
                  setIsHiddenIconsOpen(false);
                }}
              >
                <EdgeIcon size={17} />
              </button>
            </div>
          )}
        </div>

        <button
          className="tray-icon-btn security-btn"
          onClick={(e) => {
            e.stopPropagation();
            setMenu(null);
            openApp("settings", { tab: "privacy" });
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openMenu({ kind: "tray", zone: "security", x: e.clientX });
          }}
          title="Windows Defender: Güvendesiniz"
          aria-label="Windows Defender: Güvendesiniz"
        >
          <Shield size={14} style={{ fill: "#4cd964", color: "#4cd964" }} />
        </button>

        <button
          className={`tray-group-btn ${isQuickSettingsOpen ? "active" : ""}`}
          onClick={handleQuickSettingsToggle}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openMenu({ kind: "tray", zone: "quick", x: e.clientX });
          }}
          aria-label="Hızlı ayarlar"
          aria-pressed={isQuickSettingsOpen}
        >
          {wifi ? (
            <Wifi size={14} />
          ) : (
            <Wifi size={14} style={{ opacity: 0.4 }} />
          )}
          {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <Battery size={14} style={{ color: "#4cd964" }} />
          <span className="tray-battery-text">%100</span>
        </button>

        <button
          className={`tray-clock-btn ${isCalendarOpen ? "active" : ""}`}
          onClick={handleCalendarToggle}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openMenu({ kind: "tray", zone: "clock", x: e.clientX });
          }}
          aria-label="Bildirimler ve takvim"
          aria-pressed={isCalendarOpen}
        >
          <div className="clock-time">{timeStr}</div>
          <div className="clock-date">{dateStr}</div>
        </button>

        <button
          type="button"
          className={`show-desktop-button ${isShowingDesktop ? "active" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            setMenu(null);
            closeSystemPanels();
            toggleShowDesktop();
          }}
          title="Masaüstünü göster (Win + D)"
          aria-label="Masaüstünü göster"
          aria-pressed={isShowingDesktop}
        />
      </div>

      {menu && (
        <div
          ref={menuRef}
          className="context-menu glass taskbar-context-menu"
          style={{ left: `${menuLeft}px` }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(event) => {
            const items = Array.from(
              menuRef.current?.querySelectorAll<HTMLElement>(
                ".context-menu-item:not([aria-disabled='true'])",
              ) ?? [],
            );
            const index = items.indexOf(event.target as HTMLElement);
            if (event.key === "Escape") {
              event.preventDefault();
              setMenu(null);
            } else if (
              event.key === "ArrowDown" ||
              event.key === "ArrowUp"
            ) {
              event.preventDefault();
              const direction = event.key === "ArrowDown" ? 1 : -1;
              items[(index + direction + items.length) % items.length]?.focus();
            } else if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              (event.target as HTMLElement).click();
            }
          }}
          role="menu"
          aria-label="Görev çubuğu menüsü"
        >
          {menu.kind === "app" && (
            <div className="taskbar-jump-title">{menu.name}</div>
          )}
          {renderMenu()}
        </div>
      )}
    </div>
  );
};
export default Taskbar;
