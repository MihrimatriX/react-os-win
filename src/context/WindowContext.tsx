import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { getAppDefinition } from "../appCatalog";

const TASKBAR_HEIGHT = 48;
const WINDOW_MARGIN = 12;
const MIN_WINDOW_WIDTH = 280;
const MIN_WINDOW_HEIGHT = 200;

export interface WindowParams {
  fileName?: string;
  content?: string;
  filePath?: string[];
  tab?: string;
  initialPath?: string[];
  url?: string;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SnapLayout =
  | "left-half"
  | "right-half"
  | "left-third"
  | "center-third"
  | "right-third"
  | "left-twothird"
  | "right-twothird";

const SNAP_LAYOUTS: SnapLayout[] = [
  "left-half",
  "right-half",
  "left-third",
  "center-third",
  "right-third",
  "left-twothird",
  "right-twothird",
];

export interface AppWindow extends WindowBounds {
  id: string;
  title: string;
  appId: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  params?: WindowParams;
  snapLayout?: SnapLayout | null;
  restoreBounds?: WindowBounds;
}

interface WorkArea {
  width: number;
  height: number;
}

export interface WindowContextType {
  windows: AppWindow[];
  activeWindowId: string | null;
  isShowingDesktop: boolean;
  openApp: (appId: string, params?: WindowParams) => void;
  closeWindow: (id: string) => void;
  closeAllWindows: () => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string, x?: number, y?: number) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (
    id: string,
    width: number,
    height: number,
    x?: number,
    y?: number,
  ) => void;
  snapWindow: (id: string, layout: SnapLayout) => void;
  minimizeAllWindows: () => void;
  toggleShowDesktop: () => void;
  cycleWindows: (direction?: 1 | -1) => void;
  reconcileWindows: () => void;
  updateWindowMeta: (
    id: string,
    update: { title?: string; params?: WindowParams },
  ) => void;
}

interface WindowState {
  windows: AppWindow[];
  activeWindowId: string | null;
  desktopSnapshot: string[] | null;
}

type WindowAction =
  | {
      type: "open";
      appId: string;
      params?: WindowParams;
      id: string;
      area: WorkArea;
    }
  | { type: "close"; id: string }
  | { type: "close-all" }
  | { type: "minimize"; id: string }
  | { type: "maximize"; id: string }
  | { type: "restore"; id: string; x?: number; y?: number }
  | { type: "focus"; id: string }
  | { type: "move"; id: string; x: number; y: number }
  | {
      type: "resize";
      id: string;
      width: number;
      height: number;
      x?: number;
      y?: number;
    }
  | { type: "snap"; id: string; layout: SnapLayout; area: WorkArea }
  | { type: "minimize-all" }
  | { type: "toggle-desktop" }
  | { type: "cycle"; direction: 1 | -1 }
  | { type: "reconcile"; area: WorkArea }
  | {
      type: "update-meta";
      id: string;
      update: { title?: string; params?: WindowParams };
    };

const WindowContext = createContext<WindowContextType | undefined>(undefined);

const getWorkArea = (): WorkArea => ({
  width: Math.max(
    MIN_WINDOW_WIDTH,
    typeof window === "undefined" ? 1200 : window.innerWidth,
  ),
  height: Math.max(
    MIN_WINDOW_HEIGHT,
    (typeof window === "undefined" ? 800 : window.innerHeight) - TASKBAR_HEIGHT,
  ),
});

const nextZIndex = (windows: AppWindow[]) =>
  Math.max(9, ...windows.map((item) => item.zIndex)) + 1;

const topVisibleWindowId = (windows: AppWindow[]): string | null => {
  const visible = windows.filter((item) => !item.isMinimized);
  if (visible.length === 0) return null;
  return visible.reduce((top, item) =>
    item.zIndex > top.zIndex ? item : top,
  ).id;
};

const clampBounds = (bounds: WindowBounds, area: WorkArea): WindowBounds => {
  const width = Math.min(
    Math.max(Math.min(MIN_WINDOW_WIDTH, area.width), bounds.width),
    area.width,
  );
  const height = Math.min(
    Math.max(Math.min(MIN_WINDOW_HEIGHT, area.height), bounds.height),
    area.height,
  );
  const minX = 0;
  const maxX = Math.max(0, area.width - width);
  const x = Math.min(maxX, Math.max(minX, bounds.x));
  const y = Math.min(
    Math.max(0, area.height - 36),
    Math.max(0, bounds.y),
  );
  return { x, y, width, height };
};

const snapBounds = (layout: SnapLayout, area: WorkArea): WindowBounds => {
  const half = Math.round(area.width / 2);
  const third = Math.round(area.width / 3);

  switch (layout) {
    case "left-half":
      return { x: 0, y: 0, width: half, height: area.height };
    case "right-half":
      return {
        x: half,
        y: 0,
        width: area.width - half,
        height: area.height,
      };
    case "left-third":
      return { x: 0, y: 0, width: third, height: area.height };
    case "center-third":
      return { x: third, y: 0, width: third, height: area.height };
    case "right-third":
      return {
        x: third * 2,
        y: 0,
        width: area.width - third * 2,
        height: area.height,
      };
    case "left-twothird":
      return { x: 0, y: 0, width: third * 2, height: area.height };
    case "right-twothird":
      return {
        x: third,
        y: 0,
        width: area.width - third,
        height: area.height,
      };
  }
};

const makeInitialBounds = (
  width: number,
  height: number,
  area: WorkArea,
  cascadeIndex: number,
): WindowBounds => {
  const fittedWidth = Math.min(width, Math.max(MIN_WINDOW_WIDTH, area.width - 24));
  const fittedHeight = Math.min(
    height,
    Math.max(MIN_WINDOW_HEIGHT, area.height - 24),
  );
  const cascadeX = (cascadeIndex * 28) % 168;
  const cascadeY = (cascadeIndex * 24) % 120;

  return clampBounds(
    {
      width: fittedWidth,
      height: fittedHeight,
      x: Math.max(
        WINDOW_MARGIN,
        Math.floor((area.width - fittedWidth) / 2) + cascadeX,
      ),
      y: Math.max(
        WINDOW_MARGIN,
        Math.floor((area.height - fittedHeight) / 2) + cascadeY,
      ),
    },
    area,
  );
};

const documentWindowKey = (params?: WindowParams) => {
  if (!params?.fileName) return null;
  const path = [...(params.filePath ?? []), params.fileName]
    .join("/")
    .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ._/-]+/g, "-");
  return path.toLocaleLowerCase("tr-TR");
};

const normalizeParams = (value: unknown): WindowParams | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as WindowParams;
  const params: WindowParams = {};
  if (typeof candidate.fileName === "string") params.fileName = candidate.fileName;
  if (typeof candidate.content === "string") params.content = candidate.content;
  if (
    Array.isArray(candidate.filePath) &&
    candidate.filePath.every((segment) => typeof segment === "string")
  ) {
    params.filePath = candidate.filePath;
  }
  if (typeof candidate.tab === "string") params.tab = candidate.tab;
  if (
    Array.isArray(candidate.initialPath) &&
    candidate.initialPath.every((segment) => typeof segment === "string")
  ) {
    params.initialPath = candidate.initialPath;
  }
  if (typeof candidate.url === "string") params.url = candidate.url;
  return Object.keys(params).length > 0 ? params : undefined;
};

const isValidBounds = (value: unknown): value is WindowBounds => {
  if (!value || typeof value !== "object") return false;
  const bounds = value as Partial<WindowBounds>;
  return [bounds.x, bounds.y, bounds.width, bounds.height].every((entry) =>
    Number.isFinite(entry),
  );
};

const createWindowId = (appId: string) => {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${appId}:${randomPart}`;
};

const normalizeWindows = (value: unknown): AppWindow[] => {
  if (!Array.isArray(value)) return [];
  const area = getWorkArea();
  return value.flatMap((item, index): AppWindow[] => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<AppWindow>;
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.appId !== "string"
    ) {
      return [];
    }

    const definition = getAppDefinition(candidate.appId);
    const bounds = clampBounds(
      {
        x: Number.isFinite(candidate.x) ? Number(candidate.x) : WINDOW_MARGIN,
        y: Number.isFinite(candidate.y) ? Number(candidate.y) : WINDOW_MARGIN,
        width: Number.isFinite(candidate.width)
          ? Number(candidate.width)
          : definition.width,
        height: Number.isFinite(candidate.height)
          ? Number(candidate.height)
          : definition.height,
      },
      area,
    );
    const snapLayout = SNAP_LAYOUTS.includes(candidate.snapLayout as SnapLayout)
      ? (candidate.snapLayout as SnapLayout)
      : null;
    const normalizedBounds = snapLayout ? snapBounds(snapLayout, area) : bounds;

    return [
      {
        ...normalizedBounds,
        id: candidate.id,
        appId: candidate.appId,
        title:
          typeof candidate.title === "string"
            ? candidate.title
            : definition.title,
        isOpen: true,
        isMinimized: Boolean(candidate.isMinimized),
        isMaximized: snapLayout ? false : Boolean(candidate.isMaximized),
        zIndex: 10 + index,
        params: normalizeParams(candidate.params),
        snapLayout,
        restoreBounds: isValidBounds(candidate.restoreBounds)
          ? clampBounds(candidate.restoreBounds, area)
          : undefined,
      },
    ];
  });
};

const loadInitialState = (): WindowState => {
  try {
    const windows = normalizeWindows(
      JSON.parse(localStorage.getItem("win11_windows") ?? "[]"),
    );
    const requestedActive = localStorage.getItem("win11_active_window_id");
    const activeWindowId = windows.some(
      (item) => item.id === requestedActive && !item.isMinimized,
    )
      ? requestedActive
      : topVisibleWindowId(windows);
    return { windows, activeWindowId, desktopSnapshot: null };
  } catch {
    return { windows: [], activeWindowId: null, desktopSnapshot: null };
  }
};

const windowReducer = (
  state: WindowState,
  action: WindowAction,
): WindowState => {
  switch (action.type) {
    case "open": {
      const definition = getAppDefinition(action.appId);
      const documentKey =
        action.appId === "notepad" ? documentWindowKey(action.params) : null;
      const existing = state.windows.find(
        (item) =>
          (definition.singleInstance && item.appId === action.appId) ||
          (documentKey !== null &&
            item.appId === "notepad" &&
            documentWindowKey(item.params) === documentKey),
      );
      const zIndex = nextZIndex(state.windows);

      if (existing) {
        return {
          windows: state.windows.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  isMinimized: false,
                  zIndex,
                  params: action.params
                    ? { ...item.params, ...action.params }
                    : item.params,
                }
              : item,
          ),
          activeWindowId: existing.id,
          desktopSnapshot: null,
        };
      }

      const id = action.id;
      const bounds = makeInitialBounds(
        definition.width,
        definition.height,
        action.area,
        state.windows.length,
      );
      const title =
        action.appId === "notepad" && action.params?.fileName
          ? `${action.params.fileName} - Not Defteri`
          : definition.title;
      const created: AppWindow = {
        ...bounds,
        id,
        title,
        appId: action.appId,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex,
        params: action.params,
        snapLayout: null,
      };
      return {
        windows: [...state.windows, created],
        activeWindowId: id,
        desktopSnapshot: null,
      };
    }

    case "close": {
      const windows = state.windows.filter((item) => item.id !== action.id);
      return {
        windows,
        activeWindowId:
          state.activeWindowId === action.id
            ? topVisibleWindowId(windows)
            : state.activeWindowId,
        desktopSnapshot:
          state.desktopSnapshot?.filter((id) => id !== action.id) ?? null,
      };
    }

    case "close-all":
      return { windows: [], activeWindowId: null, desktopSnapshot: null };

    case "minimize": {
      if (!state.windows.some((item) => item.id === action.id)) return state;
      const windows = state.windows.map((item) =>
        item.id === action.id ? { ...item, isMinimized: true } : item,
      );
      return {
        ...state,
        windows,
        activeWindowId:
          state.activeWindowId === action.id
            ? topVisibleWindowId(windows)
            : state.activeWindowId,
      };
    }

    case "focus": {
      const target = state.windows.find((item) => item.id === action.id);
      if (!target) return state;
      const topZ = Math.max(9, ...state.windows.map((item) => item.zIndex));
      const needsRaise = target.isMinimized || target.zIndex < topZ;
      return {
        windows: state.windows.map((item) =>
          item.id === action.id
            ? {
                ...item,
                isMinimized: false,
                zIndex: needsRaise ? topZ + 1 : item.zIndex,
              }
            : item,
        ),
        activeWindowId: action.id,
        desktopSnapshot: null,
      };
    }

    case "maximize": {
      const target = state.windows.find((item) => item.id === action.id);
      if (!target) return state;
      const zIndex = nextZIndex(state.windows);
      const windows = state.windows.map((item) => {
        if (item.id !== action.id) return item;
        if (item.isMaximized) {
          const restored = item.restoreBounds ?? item;
          return {
            ...item,
            ...restored,
            isMaximized: false,
            isMinimized: false,
            snapLayout: null,
            restoreBounds: undefined,
            zIndex,
          };
        }
        const restoreBounds =
          item.restoreBounds ??
          ({
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
          } satisfies WindowBounds);
        return {
          ...item,
          isMaximized: true,
          isMinimized: false,
          snapLayout: null,
          restoreBounds,
          zIndex,
        };
      });
      return {
        windows,
        activeWindowId: action.id,
        desktopSnapshot: null,
      };
    }

    case "restore": {
      const target = state.windows.find((item) => item.id === action.id);
      if (!target) return state;
      const base = target.restoreBounds ?? target;
      const zIndex = nextZIndex(state.windows);
      return {
        windows: state.windows.map((item) =>
          item.id === action.id
            ? {
                ...item,
                ...base,
                x: action.x ?? base.x,
                y: action.y ?? base.y,
                isMaximized: false,
                isMinimized: false,
                snapLayout: null,
                restoreBounds: undefined,
                zIndex,
              }
            : item,
        ),
        activeWindowId: action.id,
        desktopSnapshot: null,
      };
    }

    case "move":
      return {
        ...state,
        windows: state.windows.map((item) =>
          item.id === action.id
            ? {
                ...item,
                x: action.x,
                y: action.y,
                isMaximized: false,
                snapLayout: null,
                restoreBounds: undefined,
              }
            : item,
        ),
      };

    case "resize":
      return {
        ...state,
        windows: state.windows.map((item) =>
          item.id === action.id
            ? {
                ...item,
                width: action.width,
                height: action.height,
                x: action.x ?? item.x,
                y: action.y ?? item.y,
                isMaximized: false,
                snapLayout: null,
                restoreBounds: undefined,
              }
            : item,
        ),
      };

    case "snap": {
      const target = state.windows.find((item) => item.id === action.id);
      if (!target) return state;
      const restoreBounds =
        target.restoreBounds ??
        ({
          x: target.x,
          y: target.y,
          width: target.width,
          height: target.height,
        } satisfies WindowBounds);
      const bounds = snapBounds(action.layout, action.area);
      const zIndex = nextZIndex(state.windows);
      return {
        windows: state.windows.map((item) =>
          item.id === action.id
            ? {
                ...item,
                ...bounds,
                isMaximized: false,
                isMinimized: false,
                snapLayout: action.layout,
                restoreBounds,
                zIndex,
              }
            : item,
        ),
        activeWindowId: action.id,
        desktopSnapshot: null,
      };
    }

    case "minimize-all":
      return {
        ...state,
        windows: state.windows.map((item) => ({
          ...item,
          isMinimized: true,
        })),
        activeWindowId: null,
        desktopSnapshot: null,
      };

    case "toggle-desktop": {
      if (state.desktopSnapshot) {
        const restorable = state.desktopSnapshot.filter((id) =>
          state.windows.some((item) => item.id === id),
        );
        const topId = restorable.at(-1) ?? null;
        return {
          windows: state.windows.map((item) =>
            restorable.includes(item.id)
              ? { ...item, isMinimized: false }
              : item,
          ),
          activeWindowId: topId,
          desktopSnapshot: null,
        };
      }
      const visible = state.windows
        .filter((item) => !item.isMinimized)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((item) => item.id);
      if (visible.length === 0) return state;
      return {
        windows: state.windows.map((item) => ({
          ...item,
          isMinimized: true,
        })),
        activeWindowId: null,
        desktopSnapshot: visible,
      };
    }

    case "cycle": {
      if (state.windows.length === 0) return state;
      const ordered = [...state.windows].sort((a, b) => b.zIndex - a.zIndex);
      const currentIndex = ordered.findIndex(
        (item) => item.id === state.activeWindowId,
      );
      const startIndex = currentIndex < 0 ? -1 : currentIndex;
      const targetIndex =
        (startIndex + action.direction + ordered.length) % ordered.length;
      const target = ordered[targetIndex];
      const zIndex = nextZIndex(state.windows);
      return {
        windows: state.windows.map((item) =>
          item.id === target.id
            ? { ...item, isMinimized: false, zIndex }
            : item,
        ),
        activeWindowId: target.id,
        desktopSnapshot: null,
      };
    }

    case "reconcile":
      return {
        ...state,
        windows: state.windows.map((item) => {
          const restoreBounds = item.restoreBounds
            ? clampBounds(item.restoreBounds, action.area)
            : undefined;
          if (item.snapLayout) {
            return {
              ...item,
              ...snapBounds(item.snapLayout, action.area),
              restoreBounds,
            };
          }
          return {
            ...item,
            ...clampBounds(item, action.area),
            restoreBounds,
          };
        }),
      };

    case "update-meta":
      return {
        ...state,
        windows: state.windows.map((item) =>
          item.id === action.id
            ? {
                ...item,
                title: action.update.title ?? item.title,
                params: action.update.params
                  ? { ...item.params, ...action.update.params }
                  : item.params,
              }
            : item,
        ),
      };
  }
};

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    windowReducer,
    undefined,
    loadInitialState,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const serializableWindows = state.windows.map((item) => ({
          ...item,
          params: item.params
            ? { ...item.params, content: undefined }
            : undefined,
        }));
        localStorage.setItem(
          "win11_windows",
          JSON.stringify(serializableWindows),
        );
        if (state.activeWindowId) {
          localStorage.setItem(
            "win11_active_window_id",
            state.activeWindowId,
          );
        } else {
          localStorage.removeItem("win11_active_window_id");
        }
      } catch (error) {
        console.warn("Pencere oturumu kaydedilemedi", error);
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [state.activeWindowId, state.windows]);

  const openApp = useCallback((appId: string, params?: WindowParams) => {
    dispatch({
      type: "open",
      appId,
      params,
      id: createWindowId(appId),
      area: getWorkArea(),
    });
  }, []);

  const closeWindow = useCallback(
    (id: string) => dispatch({ type: "close", id }),
    [],
  );
  const closeAllWindows = useCallback(
    () => dispatch({ type: "close-all" }),
    [],
  );
  const minimizeWindow = useCallback(
    (id: string) => dispatch({ type: "minimize", id }),
    [],
  );
  const maximizeWindow = useCallback(
    (id: string) => dispatch({ type: "maximize", id }),
    [],
  );
  const restoreWindow = useCallback(
    (id: string, x?: number, y?: number) =>
      dispatch({ type: "restore", id, x, y }),
    [],
  );
  const focusWindow = useCallback(
    (id: string) => dispatch({ type: "focus", id }),
    [],
  );
  const updateWindowPosition = useCallback(
    (id: string, x: number, y: number) =>
      dispatch({ type: "move", id, x, y }),
    [],
  );
  const updateWindowSize = useCallback(
    (
      id: string,
      width: number,
      height: number,
      x?: number,
      y?: number,
    ) => dispatch({ type: "resize", id, width, height, x, y }),
    [],
  );
  const snapWindow = useCallback(
    (id: string, layout: SnapLayout) =>
      dispatch({ type: "snap", id, layout, area: getWorkArea() }),
    [],
  );
  const minimizeAllWindows = useCallback(
    () => dispatch({ type: "minimize-all" }),
    [],
  );
  const toggleShowDesktop = useCallback(
    () => dispatch({ type: "toggle-desktop" }),
    [],
  );
  const cycleWindows = useCallback(
    (direction: 1 | -1 = 1) => dispatch({ type: "cycle", direction }),
    [],
  );
  const reconcileWindows = useCallback(
    () => dispatch({ type: "reconcile", area: getWorkArea() }),
    [],
  );
  const updateWindowMeta = useCallback(
    (id: string, update: { title?: string; params?: WindowParams }) =>
      dispatch({ type: "update-meta", id, update }),
    [],
  );

  useEffect(() => {
    let frame = 0;
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(reconcileWindows);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [reconcileWindows]);

  const value = useMemo<WindowContextType>(
    () => ({
      windows: state.windows,
      activeWindowId: state.activeWindowId,
      isShowingDesktop: state.desktopSnapshot !== null,
      openApp,
      closeWindow,
      closeAllWindows,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      snapWindow,
      minimizeAllWindows,
      toggleShowDesktop,
      cycleWindows,
      reconcileWindows,
      updateWindowMeta,
    }),
    [
      closeAllWindows,
      closeWindow,
      cycleWindows,
      focusWindow,
      maximizeWindow,
      minimizeAllWindows,
      minimizeWindow,
      openApp,
      reconcileWindows,
      restoreWindow,
      snapWindow,
      state.activeWindowId,
      state.desktopSnapshot,
      state.windows,
      toggleShowDesktop,
      updateWindowPosition,
      updateWindowSize,
      updateWindowMeta,
    ],
  );

  return (
    <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWindow = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error("useWindow must be used within a WindowProvider");
  }
  return context;
};
