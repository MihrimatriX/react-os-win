import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSystem } from "../../context/SystemContext";
import { WIFI_SSID } from "../../networkState";
import { useWindow } from "../../context/WindowContext";
import {
  Wifi,
  Bluetooth,
  Volume2,
  VolumeX,
  Search,
  ChevronUp,
  Shield,
  Battery,
  ShieldCheck,
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
  OneDriveIcon,
  DefenderIcon,
  DiscordIcon,
  SpotifyIcon,
  SteamIcon,
} from "../Common/Win11Icons";
import {
  TASKBAR_PINNED_APP_IDS,
  getAppDefinition,
} from "../../appCatalog";
import { buildTaskbarEntries } from "../../taskbarEntries";
import {
  TaskbarPreviewFlyout,
  type TaskbarPreviewState,
} from "./TaskbarPreview";
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
    bluetooth,
    airplaneMode,
    installedAppIds,
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
  const [preview, setPreview] = useState<TaskbarPreviewState | null>(null);
  const previewOpenTimer = useRef<number | null>(null);
  const previewCloseTimer = useRef<number | null>(null);
  const PREVIEW_OPEN_DELAY = 350;
  const PREVIEW_CLOSE_DELAY = 280;

  const clearPreviewTimers = () => {
    if (previewOpenTimer.current !== null) {
      window.clearTimeout(previewOpenTimer.current);
      previewOpenTimer.current = null;
    }
    if (previewCloseTimer.current !== null) {
      window.clearTimeout(previewCloseTimer.current);
      previewCloseTimer.current = null;
    }
  };

  const schedulePreviewClose = () => {
    if (previewCloseTimer.current !== null) {
      window.clearTimeout(previewCloseTimer.current);
    }
    previewCloseTimer.current = window.setTimeout(() => {
      setPreview(null);
      previewCloseTimer.current = null;
    }, PREVIEW_CLOSE_DELAY);
  };

  const keepPreviewOpen = () => {
    if (previewCloseTimer.current !== null) {
      window.clearTimeout(previewCloseTimer.current);
      previewCloseTimer.current = null;
    }
  };

  /** Combine-by-default: previewIds is every open window for the app. */
  const showPreviewFor = (
    appId: string,
    windowIds: string[],
    activeId: string,
    anchorEl: HTMLElement,
  ) => {
    keepPreviewOpen();
    if (previewOpenTimer.current !== null) {
      window.clearTimeout(previewOpenTimer.current);
    }
    const rect = anchorEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    previewOpenTimer.current = window.setTimeout(() => {
      setMenu(null);
      setPreview({
        centerX,
        appId,
        windowIds,
        activeWindowId: activeId,
      });
      previewOpenTimer.current = null;
    }, PREVIEW_OPEN_DELAY);
  };

  const cancelPreviewOpen = () => {
    if (previewOpenTimer.current !== null) {
      window.clearTimeout(previewOpenTimer.current);
      previewOpenTimer.current = null;
    }
    schedulePreviewClose();
  };

  useEffect(() => {
    return () => clearPreviewTimers();
  }, []);
  const PINNED_STORAGE_KEY = "win11_taskbar_pinned";
  const [pinnedAppIds, setPinnedAppIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(PINNED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.every((id) => typeof id === "string")
        ) {
          return parsed;
        }
      }
    } catch {
      /* use defaults */
    }
    return [...TASKBAR_PINNED_APP_IDS];
  });

  useEffect(() => {
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedAppIds));
  }, [pinnedAppIds]);

  const togglePin = (appId: string) => {
    setPinnedAppIds((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId],
    );
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      setIsHiddenIconsOpen(false);
      setMenu(null);
      setPreview(null);
      clearPreviewTimers();
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
    setIsHiddenIconsOpen(false);
    setStartOpen(!isStartOpen);
  };

  const handleQuickSettingsToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenu(null);
    setIsHiddenIconsOpen(false);
    setQuickSettingsOpen(!isQuickSettingsOpen);
  };

  const handleCalendarToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenu(null);
    setIsHiddenIconsOpen(false);
    setCalendarOpen(!isCalendarOpen);
  };

  const openMenu = (next: TaskbarMenu) => {
    closePanels();
    setMenu(next);
  };

  const taskbarEntries = useMemo(
    () =>
      buildTaskbarEntries(
        // Keep the pin for uninstalled apps so it comes back on reinstall.
        pinnedAppIds.filter(
          (id) => id === "store" || installedAppIds.includes(id),
        ),
        windows,
        (appId) => getAppDefinition(appId).title,
      ),
    [pinnedAppIds, installedAppIds, windows],
  );

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
          {openWindows.length > 1 && (
            <>
              <div className="taskbar-jump-title">Açık pencereler</div>
              {openWindows.map((win, i) => (
                <div
                  key={win.id}
                  className={`context-menu-item ${win.id === activeWindowId ? "active" : ""}`}
                  onClick={() => {
                    focusWindow(win.id);
                    setMenu(null);
                  }}
                >
                  <AppWindowIcon appId={menu.appId} size={14} />
                  <span>
                    {win.title || `${menu.name} (${i + 1})`}
                  </span>
                </div>
              ))}
              <div className="context-menu-separator" />
            </>
          )}

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

          <div
            className="context-menu-item"
            onClick={() => {
              openApp(menu.appId);
              setMenu(null);
            }}
          >
            <Play size={14} className="context-menu-icon" />
            <span>Yeni pencere</span>
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

          <div
            className="context-menu-item"
            onClick={() => {
              togglePin(menu.appId);
              setMenu(null);
            }}
          >
            <Pin size={14} className="context-menu-icon" />
            <span>
              {pinnedAppIds.includes(menu.appId)
                ? "Görev çubuğundan kaldır"
                : "Görev çubuğuna sabitle"}
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
            <Wifi size={16} className="context-menu-icon" />
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
            <Shield size={16} className="context-menu-icon" />
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
          {installedAppIds.includes("weather") && (
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
          {taskbarEntries.map((entry) => {
            if (entry.kind === "launch") {
              return (
                <button
                  key={`launch-${entry.appId}`}
                  className="taskbar-btn app-icon-btn"
                  onClick={() => {
                    setMenu(null);
                    openApp(entry.appId);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openMenu({
                      kind: "app",
                      appId: entry.appId,
                      name: entry.name,
                      x: e.clientX,
                    });
                  }}
                  title={entry.name}
                  aria-label={entry.name}
                >
                  <span className="app-icon-visual">
                    <AppWindowIcon appId={entry.appId} size={22} />
                  </span>
                  <span className="app-status-bar" />
                </button>
              );
            }

            const windowIds = entry.windowIds;
            const groupWindows = windowIds
              .map((id) => windows.find((w) => w.id === id))
              .filter((w): w is NonNullable<typeof w> => Boolean(w));
            const isActive = windowIds.includes(activeWindowId ?? "");
            const allMinimized =
              groupWindows.length > 0 &&
              groupWindows.every((w) => w.isMinimized);
            const multi = windowIds.length > 1;
            const topWin = [...groupWindows].sort(
              (a, b) => b.zIndex - a.zIndex,
            )[0];
            const focusTargetId = topWin?.id ?? windowIds[0];

            const handleAppClick = () => {
              setMenu(null);
              setPreview(null);
              clearPreviewTimers();
              if (windowIds.length === 0) {
                openApp(entry.appId);
                return;
              }
              if (isActive && !allMinimized) {
                if (windowIds.length === 1) {
                  minimizeWindow(windowIds[0]);
                } else {
                  const idx = windowIds.indexOf(activeWindowId ?? "");
                  const next = windowIds[(idx + 1) % windowIds.length];
                  focusWindow(next);
                }
              } else {
                focusWindow(focusTargetId);
              }
            };

            return (
              <button
                key={`running-${entry.appId}`}
                className={`taskbar-btn app-icon-btn open ${isActive ? "active" : ""} ${multi ? "multi" : ""} ${allMinimized ? "minimized" : ""}`}
                onClick={handleAppClick}
                onMouseEnter={(e) => {
                  showPreviewFor(
                    entry.appId,
                    windowIds,
                    activeWindowId && windowIds.includes(activeWindowId)
                      ? activeWindowId
                      : focusTargetId,
                    e.currentTarget,
                  );
                }}
                onMouseLeave={cancelPreviewOpen}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPreview(null);
                  clearPreviewTimers();
                  openMenu({
                    kind: "app",
                    appId: entry.appId,
                    name: entry.name,
                    x: e.clientX,
                  });
                }}
                title={undefined}
                aria-label={
                  multi
                    ? `${entry.name} (${windowIds.length} pencere)`
                    : entry.titles[0] || entry.name
                }
                aria-pressed={isActive}
                data-preview-app={entry.appId}
                data-window-count={windowIds.length}
              >
                <span className="app-icon-visual">
                  <AppWindowIcon appId={entry.appId} size={22} />
                </span>
                <span className="app-status-bar" aria-hidden />
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
            <ChevronUp size={16} className="hidden-icons-chevron" />
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
                <OneDriveIcon size={16} />
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
                <DefenderIcon size={16} />
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
                <DiscordIcon size={16} />
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
                <SpotifyIcon size={16} />
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
                <SteamIcon size={16} />
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
          <DefenderIcon size={16} />
        </button>

        <button
          className={`tray-group-btn ${isQuickSettingsOpen ? "active" : ""}`}
          onClick={handleQuickSettingsToggle}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openMenu({ kind: "tray", zone: "quick", x: e.clientX });
          }}
          title={
            wifi && !airplaneMode
              ? `Hızlı ayarlar — ${WIFI_SSID}, Bluetooth ${bluetooth && !airplaneMode ? "açık" : "kapalı"}, ses, pil`
              : "Hızlı ayarlar — Wi-Fi, ses, pil"
          }
          aria-label="Hızlı ayarlar"
          aria-pressed={isQuickSettingsOpen}
        >
          {wifi && !airplaneMode ? (
            <Wifi size={16} aria-hidden />
          ) : (
            <Wifi size={16} style={{ opacity: 0.4 }} aria-hidden />
          )}
          <Bluetooth
            size={16}
            style={{
              opacity: bluetooth && !airplaneMode ? 1 : 0.35,
            }}
            aria-hidden
          />
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <Battery size={16} style={{ color: "#4cd964" }} />
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

      {preview && (
        <TaskbarPreviewFlyout
          preview={preview}
          windows={windows}
          activeWindowId={activeWindowId}
          onFocus={(id) => {
            focusWindow(id);
            setPreview(null);
            clearPreviewTimers();
          }}
          onCloseRequest={schedulePreviewClose}
          onKeepOpen={keepPreviewOpen}
        />
      )}

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
