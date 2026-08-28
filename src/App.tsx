import React, { useEffect, useRef } from "react";
import { SystemProvider, useSystem } from "./context/SystemContext";
import { FSProvider } from "./context/FSContext";
import { WindowProvider, useWindow } from "./context/WindowContext";

// Boot Screens
import { MSIBios, MSIBIOSSetup } from "./components/Boot/MSIBios";
import LoadingScreen from "./components/Boot/LoadingScreen";
import LoginScreen from "./components/Boot/LoginScreen";

// Desktop & Panels
import Desktop from "./components/Desktop/Desktop";
import Window from "./components/Window/Window";
import Taskbar from "./components/Taskbar/Taskbar";
import StartMenu from "./components/Taskbar/StartMenu";
import QuickSettings from "./components/Taskbar/QuickSettings";
import CalendarPanel from "./components/Taskbar/CalendarPanel";
import WidgetsPanel from "./components/Taskbar/WidgetsPanel";
import TaskView from "./components/Taskbar/TaskView";

// Applications
import FileExplorerApp from "./components/Apps/FileExplorer";
import NotepadApp from "./components/Apps/Notepad";
import SettingsApp from "./components/Apps/Settings";
import CalculatorApp from "./components/Apps/Calculator";
import TerminalApp from "./components/Apps/Terminal";
import EdgeBrowser from "./components/Apps/Edge";
import PaintApp from "./components/Apps/Paint";
import VSCodeApp from "./components/Apps/VSCode";
import MinesweeperApp from "./components/Apps/Minesweeper";
import CameraApp from "./components/Apps/Camera";
import ImageViewerApp from "./components/Apps/ImageViewer";
import StoreApp from "./components/Apps/Store";
import CopilotApp from "./components/Apps/Copilot";
import TaskManagerApp from "./components/Apps/TaskManager";
import WeatherApp from "./components/Apps/Weather";
import FreeDownloadManagerApp from "./components/Apps/FreeDownloadManager";
import TorrentClientApp from "./components/Apps/TorrentClient";

const OSContent: React.FC = () => {
  const {
    bootStage,
    isShutdown,
    isStartOpen,
    setStartOpen,
    isTaskViewOpen,
    setTaskViewOpen,
    closeSystemPanels,
    brightness,
  } = useSystem();
  const {
    windows,
    activeWindowId,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    snapWindow,
    toggleShowDesktop,
    cycleWindows,
    openApp,
  } = useWindow();
  const metaKeyUsedAsModifier = useRef(false);

  // 1. Synthesize startup sound when bootStage shifts to desktop
  useEffect(() => {
    if (bootStage === "desktop") {
      const playStartupChime = () => {
        try {
          const AudioCtx =
            window.AudioContext ||
            (window as Window & { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (!AudioCtx) return;
          const ctx = new AudioCtx();

          // Beautiful synthesized Windows-like ambient bell chord:
          // F4 (349Hz), A4 (440Hz), C5 (523Hz), E5 (659Hz)
          const notes = [349.23, 440.0, 523.25, 659.25];
          const delays = [0, 0.08, 0.16, 0.24];

          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delays[idx]);

            // Envelope: slow attack and long exponential decay
            gain.gain.setValueAtTime(0, ctx.currentTime + delays[idx]);
            gain.gain.linearRampToValueAtTime(
              0.08,
              ctx.currentTime + delays[idx] + 0.18,
            );
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + delays[idx] + 1.8,
            );

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + delays[idx]);
            osc.stop(ctx.currentTime + delays[idx] + 1.8);
          });

          window.setTimeout(() => void ctx.close(), 2300);
        } catch (e) {
          console.warn("AudioContext failed to start", e);
        }
      };

      // Delay play briefly for smooth visual load sync
      const timer = setTimeout(playStartupChime, 250);
      return () => clearTimeout(timer);
    }
  }, [bootStage]);

  // 2. Desktop keyboard shortcuts
  useEffect(() => {
    if (bootStage !== "desktop") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.metaKey && key !== "meta") metaKeyUsedAsModifier.current = true;

      if (e.altKey && e.key === "F4") {
        e.preventDefault();
        if (activeWindowId) closeWindow(activeWindowId);
        return;
      }

      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
        cycleWindows(e.shiftKey ? -1 : 1);
        return;
      }

      if (e.ctrlKey && e.shiftKey && e.key === "Escape") {
        e.preventDefault();
        openApp("taskmgr");
        return;
      }

      if (e.key === "Escape") {
        closeSystemPanels();
        return;
      }

      if (!e.metaKey || e.repeat) return;

      if (key === "d") {
        e.preventDefault();
        closeSystemPanels();
        toggleShowDesktop();
      } else if (key === "e") {
        e.preventDefault();
        openApp("explorer");
      } else if (key === "i") {
        e.preventDefault();
        openApp("settings");
      } else if (e.key === "Tab") {
        e.preventDefault();
        setTaskViewOpen(!isTaskViewOpen);
      } else if (activeWindowId && e.key === "ArrowLeft") {
        e.preventDefault();
        snapWindow(activeWindowId, "left-half");
      } else if (activeWindowId && e.key === "ArrowRight") {
        e.preventDefault();
        snapWindow(activeWindowId, "right-half");
      } else if (activeWindowId && e.key === "ArrowUp") {
        e.preventDefault();
        const activeWindow = windows.find((win) => win.id === activeWindowId);
        if (!activeWindow?.isMaximized) maximizeWindow(activeWindowId);
      } else if (activeWindowId && e.key === "ArrowDown") {
        e.preventDefault();
        const activeWindow = windows.find((win) => win.id === activeWindowId);
        if (activeWindow?.isMaximized || activeWindow?.snapLayout) {
          restoreWindow(activeWindowId);
        } else {
          minimizeWindow(activeWindowId);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Meta") return;
      if (!metaKeyUsedAsModifier.current) {
        e.preventDefault();
        setStartOpen(!isStartOpen);
      }
      metaKeyUsedAsModifier.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    bootStage,
    activeWindowId,
    windows,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    snapWindow,
    toggleShowDesktop,
    cycleWindows,
    openApp,
    closeSystemPanels,
    isTaskViewOpen,
    setTaskViewOpen,
    isStartOpen,
    setStartOpen,
  ]);

  // 1. Shutdown → redirect to portfolio
  if (isShutdown) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#000000",
          color: "#555555",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ fontSize: "14px", letterSpacing: "1px" }}>
          Sistem kapatılıyor…
        </p>
        <p style={{ fontSize: "11px", marginTop: "10px", opacity: 0.7 }}>
          ahmetfuzunkaya.com
        </p>
      </div>
    );
  }

  // 2. Boot Stage Routing
  switch (bootStage) {
    case "bios":
      return <MSIBios />;
    case "loading":
      return <LoadingScreen />;
    case "login":
      return <LoginScreen />;
    case "desktop":
      return (
        <div
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Main Desktop layout */}
          <Desktop>
            {/* Map Open App Windows */}
            {windows.map((win) => (
              <Window key={win.id} win={win}>
                {win.appId === "explorer" && (
                  <FileExplorerApp params={win.params} />
                )}
                {win.appId === "notepad" && (
                  <NotepadApp winId={win.id} params={win.params} />
                )}
                {win.appId === "settings" && (
                  <SettingsApp params={win.params} />
                )}
                {win.appId === "calculator" && <CalculatorApp />}
                {win.appId === "cmd" && <TerminalApp />}
                {win.appId === "edge" && (
                  <EdgeBrowser winId={win.id} params={win.params} />
                )}
                {win.appId === "paint" && <PaintApp />}
                {win.appId === "vscode" && <VSCodeApp params={win.params} />}
                {win.appId === "minesweeper" && <MinesweeperApp />}
                {win.appId === "camera" && <CameraApp />}
                {win.appId === "imageviewer" && (
                  <ImageViewerApp params={win.params} />
                )}
                {win.appId === "store" && <StoreApp />}
                {win.appId === "copilot" && <CopilotApp />}
                {win.appId === "taskmgr" && <TaskManagerApp />}
                {win.appId === "weather" && <WeatherApp />}
                {win.appId === "bios" && (
                  <MSIBIOSSetup isWindowed onExit={() => closeWindow(win.id)} />
                )}
                {win.appId === "fdm" && <FreeDownloadManagerApp />}
                {win.appId === "torrent" && <TorrentClientApp />}
              </Window>
            ))}
          </Desktop>

          {/* Start Menu, System Overlays, and Taskbar */}
          <StartMenu />
          <QuickSettings />
          <CalendarPanel />
          <WidgetsPanel />
          <TaskView />
          <Taskbar />
          <div
            className="screen-brightness-overlay"
            style={{ opacity: ((100 - brightness) / 100) * 0.62 }}
            aria-hidden="true"
          />
        </div>
      );
    default:
      return <MSIBios />;
  }
};

export const App: React.FC = () => {
  return (
    <SystemProvider>
      <FSProvider>
        <WindowProvider>
          <OSContent />
        </WindowProvider>
      </FSProvider>
    </SystemProvider>
  );
};

export default App;
