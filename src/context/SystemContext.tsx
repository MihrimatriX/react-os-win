import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { DEFAULT_INSTALLED_APP_IDS } from "../appCatalog";
import { resolveInitialWallpaper } from "../wallpapers";

export type BootStage = "bios" | "loading" | "login" | "desktop";
export type Theme = "light" | "dark";

export interface SystemContextType {
  bootStage: BootStage;
  setBootStage: (stage: BootStage) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  wallpaper: string;
  /** Returns false when the choice could not be persisted (storage full). */
  setWallpaper: (url: string) => boolean;
  wifi: boolean;
  setWifi: (val: boolean) => void;
  bluetooth: boolean;
  setBluetooth: (val: boolean) => void;
  volume: number;
  setVolume: (val: number) => void;
  brightness: number;
  setBrightness: (val: number) => void;
  isStartOpen: boolean;
  setStartOpen: (val: boolean) => void;
  isQuickSettingsOpen: boolean;
  setQuickSettingsOpen: (val: boolean) => void;
  isCalendarOpen: boolean;
  setCalendarOpen: (val: boolean) => void;
  isWidgetsOpen: boolean;
  setWidgetsOpen: (val: boolean) => void;
  isTaskViewOpen: boolean;
  setTaskViewOpen: (val: boolean) => void;
  closeSystemPanels: () => void;
  restartSystem: () => void;
  lockSystem: () => void;
  shutdownSystem: () => void;
  isShutdown: boolean;
  installedAppIds: string[];
  installApp: (appId: string) => void;
  uninstallApp: (appId: string) => void;
  desktopAutoAlign: boolean;
  desktopAlignToGrid: boolean;
  setDesktopAutoAlign: (val: boolean) => void;
  setDesktopAlignToGrid: (val: boolean) => void;
  airplaneMode: boolean;
  setAirplaneMode: (val: boolean) => void;
  energySaver: boolean;
  setEnergySaver: (val: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);


const readStoredNumber = (key: string, fallback: number, minimum = 0) => {
  const raw = localStorage.getItem(key);
  // Number(null) is 0, which would start fresh visitors muted and dimmed.
  const parsed = raw === null || raw.trim() === "" ? NaN : Number(raw);
  return Number.isFinite(parsed)
    ? Math.min(100, Math.max(minimum, parsed))
    : fallback;
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [bootStage, setBootStageState] = useState<BootStage>(() => {
    // If desktop was already active, we can skip bios? Or always show bios once, but keep it on refresh.
    // For premium feel, let's play bios on fresh load, but we can bypass it if user wants, or let's run bios every refresh since user requested: "msi bios post olsun. loading screen olsun. win 11 başlatma ekranı olsun"
    return "bios";
  });

  const [isShutdown, setIsShutdown] = useState<boolean>(false);

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("win11_theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  const [wallpaper, setWallpaperState] = useState<string>(() => {
    return resolveInitialWallpaper(localStorage.getItem("win11_wallpaper"));
  });

  const [wifi, setWifiState] = useState<boolean>(() => {
    if (localStorage.getItem("win11_airplane_mode") === "true") return false;
    const saved = localStorage.getItem("win11_wifi");
    return saved !== "false";
  });

  const [bluetooth, setBluetoothState] = useState<boolean>(() => {
    if (localStorage.getItem("win11_airplane_mode") === "true") return false;
    const saved = localStorage.getItem("win11_bluetooth");
    return saved !== "false";
  });

  const [volume, setVolumeState] = useState<number>(() => {
    return readStoredNumber("win11_volume", 80);
  });

  const [brightness, setBrightnessState] = useState<number>(() => {
    return readStoredNumber("win11_brightness", 90, 10);
  });

  const [airplaneMode, setAirplaneModeState] = useState(
    () => localStorage.getItem("win11_airplane_mode") === "true",
  );
  const [energySaver, setEnergySaverState] = useState(() => {
    // One-time migration: simulation used to default energy-saver ON in some
    // installs; Ahmet wants startup OFF so live wallpaper keeps moving.
    const migrated = localStorage.getItem("win11_energy_saver_off_v1");
    if (migrated !== "1") {
      localStorage.setItem("win11_energy_saver", "false");
      localStorage.setItem("win11_energy_saver_off_v1", "1");
      return false;
    }
    return localStorage.getItem("win11_energy_saver") === "true";
  });
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && Boolean(document.fullscreenElement),
  );

  // UI Panel states
  const [isStartOpen, setStartOpen] = useState(false);
  const [isQuickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isWidgetsOpen, setWidgetsOpen] = useState(false);
  const [isTaskViewOpen, setTaskViewOpen] = useState(false);

  // Stable references: consumers list these in effect deps (e.g. the
  // Widgets alarm interval), which would otherwise restart on every render.
  const closeSystemPanels = useCallback(() => {
    setStartOpen(false);
    setQuickSettingsOpen(false);
    setCalendarOpen(false);
    setWidgetsOpen(false);
    setTaskViewOpen(false);
  }, []);

  // Opening one panel closes the others.
  const panelSetters = useMemo(() => {
    const exclusive = (open: (val: boolean) => void) => (val: boolean) => {
      if (val) closeSystemPanels();
      open(val);
    };
    return {
      setStartOpen: exclusive(setStartOpen),
      setQuickSettingsOpen: exclusive(setQuickSettingsOpen),
      setCalendarOpen: exclusive(setCalendarOpen),
      setWidgetsOpen: exclusive(setWidgetsOpen),
      setTaskViewOpen: exclusive(setTaskViewOpen),
    };
  }, [closeSystemPanels]);

  // Sync theme with DOM attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("win11_theme", theme);
  }, [theme]);

  // Save other settings to localStorage
  const setWallpaper = (url: string) => {
    setWallpaperState(url);
    try {
      localStorage.setItem("win11_wallpaper", url);
      return true;
    } catch (error) {
      // Large photo data URLs can exceed the quota; keep it for this session.
      console.warn("Duvar kağıdı kaydedilemedi", error);
      return false;
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    setVolumeState(clamped);
    localStorage.setItem("win11_volume", clamped.toString());
  };

  const setBrightness = (val: number) => {
    const clamped = Math.min(100, Math.max(10, val));
    setBrightnessState(clamped);
    localStorage.setItem("win11_brightness", clamped.toString());
  };

  const setWifi = (val: boolean) => {
    setWifiState(val);
    if (val) setAirplaneModeState(false);
  };

  const setBluetooth = (val: boolean) => {
    setBluetoothState(val);
    if (val) setAirplaneModeState(false);
  };

  const setAirplaneMode = (val: boolean) => {
    setAirplaneModeState(val);
    if (val) {
      setWifiState(false);
      setBluetoothState(false);
    }
  };

  const setEnergySaver = (val: boolean) => setEnergySaverState(val);

  useEffect(() => {
    localStorage.setItem("win11_wifi", wifi.toString());
  }, [wifi]);

  useEffect(() => {
    localStorage.setItem("win11_bluetooth", bluetooth.toString());
  }, [bluetooth]);

  useEffect(() => {
    localStorage.setItem("win11_airplane_mode", airplaneMode.toString());
  }, [airplaneMode]);

  useEffect(() => {
    localStorage.setItem("win11_energy_saver", energySaver.toString());
    document.documentElement.toggleAttribute("data-energy-saver", energySaver);
  }, [energySaver]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (error) {
      console.warn("Tam ekran modu kullanılamıyor", error);
    }
  };

  // Stable: boot screens list it in their timer effects' deps.
  const setBootStage = useCallback((stage: BootStage) => {
    setBootStageState(stage);
    if (stage === "desktop") {
      setIsShutdown(false);
    }
  }, []);

  const restartSystem = () => {
    closeSystemPanels();
    setIsShutdown(false);
    setBootStageState("bios");
  };

  const lockSystem = () => {
    closeSystemPanels();
    setIsShutdown(false);
    setBootStageState("login");
  };

  const shutdownSystem = () => {
    closeSystemPanels();
    setIsShutdown(true);
    // Brief black screen, then leave the sim
    window.setTimeout(() => {
      window.location.href = "https://ahmetfuzunkaya.com";
    }, 1400);
  };

  const [desktopAutoAlign, setDesktopAutoAlignState] = useState<boolean>(() => {
    const saved = localStorage.getItem("win11_desktop_layout");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.autoAlign === "boolean") return parsed.autoAlign;
      } catch {
        /* use default */
      }
    }
    return true;
  });

  const [desktopAlignToGrid, setDesktopAlignToGridState] = useState<boolean>(
    () => {
      const saved = localStorage.getItem("win11_desktop_layout");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.alignToGrid === "boolean") return parsed.alignToGrid;
        } catch {
          /* use default */
        }
      }
      return true;
    },
  );

  const setDesktopAutoAlign = (val: boolean) => {
    setDesktopAutoAlignState(val);
    if (val) setDesktopAlignToGridState(true);
  };

  const setDesktopAlignToGrid = (val: boolean) => {
    setDesktopAlignToGridState(val);
    if (!val) setDesktopAutoAlignState(false);
  };

  useEffect(() => {
    localStorage.setItem(
      "win11_desktop_layout",
      JSON.stringify({
        autoAlign: desktopAutoAlign,
        alignToGrid: desktopAlignToGrid,
      }),
    );
  }, [desktopAutoAlign, desktopAlignToGrid]);

  const [installedAppIds, setInstalledAppIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("win11_installed_apps");
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const ids = parsed.filter((id): id is string => typeof id === "string");
          // One-time: give older installs the newer default apps. Running this on
          // every load would undo the user's uninstalls of these apps.
          if (localStorage.getItem("win11_installed_apps_v2") !== "1") {
            for (const app of ["bios", "taskmgr", "fdm", "torrent"] as const) {
              if (!ids.includes(app)) ids.push(app);
            }
          }
          return ids;
        }
      } catch (e) {
        console.error("Error parsing installed apps from localStorage", e);
      }
    }
    return [...DEFAULT_INSTALLED_APP_IDS];
  });

  useEffect(() => {
    localStorage.setItem(
      "win11_installed_apps",
      JSON.stringify(installedAppIds),
    );
    localStorage.setItem("win11_installed_apps_v2", "1");
  }, [installedAppIds]);

  const installApp = (appId: string) => {
    setInstalledAppIds((prev) =>
      prev.includes(appId) ? prev : [...prev, appId],
    );
  };

  const uninstallApp = (appId: string) => {
    setInstalledAppIds((prev) => prev.filter((id) => id !== appId));
  };

  return (
    <SystemContext.Provider
      value={{
        bootStage,
        setBootStage,
        theme,
        setTheme: setThemeState,
        toggleTheme: () =>
          setThemeState((t) => (t === "light" ? "dark" : "light")),
        wallpaper,
        setWallpaper,
        wifi,
        setWifi,
        bluetooth,
        setBluetooth,
        volume,
        setVolume,
        brightness,
        setBrightness,
        isStartOpen,
        isQuickSettingsOpen,
        isCalendarOpen,
        isWidgetsOpen,
        isTaskViewOpen,
        ...panelSetters,
        closeSystemPanels,
        restartSystem,
        lockSystem,
        shutdownSystem,
        isShutdown,
        installedAppIds,
        installApp,
        uninstallApp,
        desktopAutoAlign,
        desktopAlignToGrid,
        setDesktopAutoAlign,
        setDesktopAlignToGrid,
        airplaneMode,
        setAirplaneMode,
        energySaver,
        setEnergySaver,
        isFullscreen,
        toggleFullscreen,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context)
    throw new Error("useSystem must be used within a SystemProvider");
  return context;
};
