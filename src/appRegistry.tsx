/* eslint-disable react-refresh/only-export-components */
import {
  Component,
  lazy,
  Suspense,
  type ComponentType,
  type FC,
  type LazyExoticComponent,
  type ReactNode,
} from "react";
import type { AppWindow, WindowParams } from "./context/WindowContext";

export type AppHostProps = {
  winId: string;
  params?: WindowParams;
  onClose: () => void;
};

type AnyProps = Record<string, unknown>;

function wrapApp(
  loader: () => Promise<{ default: ComponentType<AnyProps> }>,
  pickProps: (host: AppHostProps) => AnyProps = () => ({}),
): LazyExoticComponent<ComponentType<AppHostProps>> {
  return lazy(async () => {
    const mod = await loader();
    const Inner = mod.default as ComponentType<AnyProps>;
    const Wrapped: ComponentType<AppHostProps> = (host) => (
      <Inner {...pickProps(host)} />
    );
    Wrapped.displayName = `LazyApp(${Inner.displayName || Inner.name || "App"})`;
    return { default: Wrapped };
  });
}

/** appId → lazy-loaded window content. Keeps App.tsx free of per-app if chains. */
export const APP_REGISTRY: Record<
  string,
  LazyExoticComponent<ComponentType<AppHostProps>>
> = {
  explorer: wrapApp(
    () => import("./components/Apps/FileExplorer") as unknown as Promise<{ default: ComponentType<AnyProps> }>,
    ({ params }) => ({ params }),
  ),
  notepad: wrapApp(
    () => import("./components/Apps/Notepad") as unknown as Promise<{ default: ComponentType<AnyProps> }>,
    ({ winId, params }) => ({ winId, params }),
  ),
  settings: wrapApp(
    () => import("./components/Apps/Settings") as unknown as Promise<{ default: ComponentType<AnyProps> }>,
    ({ params }) => ({ params }),
  ),
  calculator: wrapApp(() => import("./components/Apps/Calculator") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  cmd: wrapApp(
    () => import("./components/Apps/Terminal") as unknown as Promise<{ default: ComponentType<AnyProps> }>,
    ({ winId }) => ({ winId }),
  ),
  edge: wrapApp(
    () => import("./components/Apps/Edge") as unknown as Promise<{ default: ComponentType<AnyProps> }>,
    ({ winId, params }) => ({ winId, params }),
  ),
  paint: wrapApp(() => import("./components/Apps/Paint") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  vscode: wrapApp(
    () => import("./components/Apps/VSCode") as unknown as Promise<{ default: ComponentType<AnyProps> }>,
    ({ params }) => ({ params }),
  ),
  minesweeper: wrapApp(() => import("./components/Apps/Minesweeper") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  camera: wrapApp(() => import("./components/Apps/Camera") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  imageviewer: wrapApp(
    () => import("./components/Apps/ImageViewer") as unknown as Promise<{ default: ComponentType<AnyProps> }>,
    ({ params }) => ({ params }),
  ),
  store: wrapApp(() => import("./components/Apps/Store") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  copilot: wrapApp(() => import("./components/Apps/Copilot") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  taskmgr: wrapApp(() => import("./components/Apps/TaskManager") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  weather: wrapApp(() => import("./components/Apps/Weather") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  fdm: wrapApp(() => import("./components/Apps/FreeDownloadManager") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  torrent: wrapApp(() => import("./components/Apps/TorrentClient") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  projects: wrapApp(() => import("./components/Apps/Projects") as unknown as Promise<{ default: ComponentType<AnyProps> }>),
  bios: lazy(async () => {
    const mod = await import("./components/Boot/MSIBios");
    const Bios: ComponentType<AppHostProps> = ({ onClose }) => (
      <mod.MSIBIOSSetup isWindowed onExit={onClose} />
    );
    Bios.displayName = "LazyBiosSetup";
    return { default: Bios };
  }),
};

/** Keeps one crashing app (or a failed chunk load) inside its own window
 * instead of unmounting the whole desktop. */
class AppErrorBoundary extends Component<
  { appId: string; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`Uygulama çöktü: ${this.props.appId}`, error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="app-missing" role="alert">
        Uygulama beklenmedik bir hata nedeniyle durdu. Pencereyi kapatıp
        yeniden açabilirsiniz.
      </div>
    );
  }
}

export const AppHost: FC<{
  win: AppWindow;
  onClose: (id: string) => void;
}> = ({ win, onClose }) => {
  const Comp = APP_REGISTRY[win.appId];
  if (!Comp) {
    return (
      <div className="app-missing" role="status">
        Bilinmeyen uygulama: {win.appId}
      </div>
    );
  }
  return (
    <AppErrorBoundary appId={win.appId}>
      <Suspense
        fallback={
          <div className="app-loading-fallback" role="status">
            Yükleniyor…
          </div>
        }
      >
        <Comp
          winId={win.id}
          params={win.params}
          onClose={() => onClose(win.id)}
        />
      </Suspense>
    </AppErrorBoundary>
  );
};

export default AppHost;
