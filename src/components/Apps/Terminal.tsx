import React, { useState, useRef, useEffect, useCallback } from "react";
import { Minus, Square, Copy, X, Plus } from "lucide-react";
import { useFS } from "../../context/FSContext";
import { useSystem } from "../../context/SystemContext";
import { useWindow } from "../../context/WindowContext";
import { AppWindowIcon } from "../Common/Win11Icons";
import { OS_USER, userPath } from "../../osUser";
import "./terminal.css";

interface ConsoleLine {
  text: string;
  type: "input" | "output" | "error" | "system";
}

interface TerminalTab {
  id: string;
  title: string;
  cwd: string[];
  history: ConsoleLine[];
  cmdHistory: string[];
  cmdHistoryIndex: number;
  inputVal: string;
}

const BOOT_LINES = (): ConsoleLine[] => [
  { text: "Microsoft Windows [Version 10.0.26100.1]", type: "system" },
  { text: "(c) Microsoft Corporation. T\u00fcm haklar\u0131 sakl\u0131d\u0131r.", type: "system" },
  { text: "", type: "output" },
  { text: 'Yard\u0131m i\u00e7in "help" yaz\u0131n.  |  neofetch  |  clear', type: "system" },
  { text: "", type: "output" },
];

const makeTab = (index: number): TerminalTab => ({
  id: `wt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  title: index === 0 ? "PowerShell" : `PowerShell ${index + 1}`,
  cwd: userPath(),
  history: BOOT_LINES(),
  cmdHistory: [],
  cmdHistoryIndex: -1,
  inputVal: "",
});

const pathString = (parts: string[]) => parts.join("\\");

interface Props {
  winId: string;
}

type TermState = { tabs: TerminalTab[]; activeTabId: string };

export const TerminalApp: React.FC<Props> = ({ winId }) => {
  const { createDirectory, deleteNode, getNodeByPath } = useFS();
  const { theme, toggleTheme } = useSystem();
  const {
    windows,
    activeWindowId,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
  } = useWindow();
  const win = windows.find((w) => w.id === winId);
  const isMaximized = Boolean(win?.isMaximized);
  const isWindowActive = activeWindowId === winId && !win?.isMinimized;

  // Combined state (same pattern as ChromeBrowser) — avoids StrictMode
  // desync between tabs[] and activeTabId that silently dropped commands.
  const [{ tabs, activeTabId }, setTerm] = useState<TermState>(() => {
    const first = makeTab(0);
    return { tabs: [first], activeTabId: first.id };
  });

  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab =
    tabs.find((t) => t.id === activeTabId) ?? tabs[0] ?? null;

  const patchTab = useCallback((id: string, patch: Partial<TerminalTab>) => {
    setTerm((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const setActiveTabId = useCallback((id: string) => {
    setTerm((prev) => ({ ...prev, activeTabId: id }));
  }, []);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTab?.history, activeTabId]);

  // Focus CLI whenever the window/tab becomes active (after Suspense mount too).
  useEffect(() => {
    if (!isWindowActive) return;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, [isWindowActive, activeTabId, winId]);

  const addTab = () => {
    setTerm((prev) => {
      const next = makeTab(prev.tabs.length);
      return { tabs: [...prev.tabs, next], activeTabId: next.id };
    });
  };

  const closeTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tabs.length === 1) {
      closeWindow(winId);
      return;
    }
    setTerm((prev) => {
      if (prev.tabs.length === 1) return prev;
      const idx = prev.tabs.findIndex((t) => t.id === id);
      const remaining = prev.tabs.filter((t) => t.id !== id);
      const nextActive =
        prev.activeTabId === id
          ? (remaining[Math.max(0, idx - 1)] ?? remaining[0]).id
          : prev.activeTabId;
      return { tabs: remaining, activeTabId: nextActive };
    });
  };

  const runCommand = (raw: string, tabId: string) => {
    const command = raw.trim();
    if (!command) return;

    // Side effects (FS, theme) run here, once; the setTerm updater below stays
    // pure because StrictMode invokes updaters twice.
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const promptLine = `${OS_USER.promptHost} ${pathString(tab.cwd)}>${command}`;
    const parts = command.split(/\s+/);
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);
    const outputLines: ConsoleLine[] = [];
    const cwdNode = getNodeByPath(tab.cwd);
    let nextCwd = tab.cwd;
    let clearScreen = false;

    switch (cmdName) {
      case "clear":
      case "cls":
        clearScreen = true;
        break;

      case "help":
        outputLines.push({
          text: "Windows Terminal \u2014 kullan\u0131labilir komutlar:",
          type: "output",
        });
        outputLines.push({ text: "  help            Komut listesi", type: "output" });
        outputLines.push({ text: "  ls / dir        Klas\u00f6r i\u00e7eri\u011fi", type: "output" });
        outputLines.push({
          text: "  cd <klas\u00f6r>     Klas\u00f6r de\u011fi\u015ftir (.. destekli)",
          type: "output",
        });
        outputLines.push({ text: "  pwd             Aktif yol", type: "output" });
        outputLines.push({ text: "  mkdir <ad>      Klas\u00f6r olu\u015ftur", type: "output" });
        outputLines.push({ text: "  echo <metin>    Metin yaz", type: "output" });
        outputLines.push({ text: "  cat <dosya>     Dosya oku", type: "output" });
        outputLines.push({ text: "  rm <ad>         Sil", type: "output" });
        outputLines.push({ text: "  whoami          Kullan\u0131c\u0131", type: "output" });
        outputLines.push({ text: "  hostname        Bilgisayar ad\u0131", type: "output" });
        outputLines.push({ text: "  theme           A\u00e7\u0131k/Koyu tema", type: "output" });
        outputLines.push({ text: "  neofetch        Sistem bilgisi", type: "output" });
        outputLines.push({ text: "  clear / cls     Ekran\u0131 temizle", type: "output" });
        break;

      case "echo":
        outputLines.push({ text: args.join(" "), type: "output" });
        break;

      case "whoami":
        outputLines.push({
          text: `${OS_USER.hostname}\\${OS_USER.folderName}`.toLowerCase(),
          type: "output",
        });
        break;

      case "hostname":
        outputLines.push({ text: OS_USER.hostname, type: "output" });
        break;

      case "pwd":
        outputLines.push({ text: pathString(tab.cwd), type: "output" });
        break;

      case "theme":
        toggleTheme();
        outputLines.push({
          text: `Tema de\u011fi\u015ftirildi. Aktif: ${theme === "dark" ? "Ayd\u0131nl\u0131k" : "Karanl\u0131k"}`,
          type: "output",
        });
        break;

      case "ls":
      case "dir":
        if (cwdNode?.children) {
          const names = Object.keys(cwdNode.children);
          if (names.length === 0) {
            outputLines.push({ text: "Klas\u00f6r bo\u015f.", type: "output" });
          } else {
            outputLines.push({
              text: ` Directory of ${pathString(tab.cwd)}`,
              type: "output",
            });
            outputLines.push({ text: "", type: "output" });
            names.forEach((name) => {
              const node = cwdNode.children![name];
              const dateStr = new Date(node.updatedAt).toLocaleDateString("tr-TR");
              const indicator =
                node.type === "dir"
                  ? "<DIR>     "
                  : node.type === "app" || node.type === "shortcut"
                    ? "<LINK>    "
                    : "          ";
              outputLines.push({
                text: `${dateStr}  ${indicator}${name}`,
                type: "output",
              });
            });
          }
        } else {
          outputLines.push({ text: "Klas\u00f6r okunamad\u0131.", type: "error" });
        }
        break;

      case "cd": {
        const dest = args.join(" ");
        if (!dest) {
          outputLines.push({ text: pathString(tab.cwd), type: "output" });
        } else if (dest === "..") {
          if (tab.cwd.length > 1) nextCwd = tab.cwd.slice(0, -1);
        } else if (cwdNode?.children?.[dest]) {
          const sub = cwdNode.children[dest];
          if (sub.type === "dir") {
            nextCwd = [...tab.cwd, dest];
          } else {
            outputLines.push({
              text: `Hata: "${dest}" bir klas\u00f6r de\u011fil.`,
              type: "error",
            });
          }
        } else {
          outputLines.push({
            text: `Hata: "${dest}" klas\u00f6r\u00fc bulunamad\u0131.`,
            type: "error",
          });
        }
        break;
      }

      case "mkdir": {
        const name = args.join(" ");
        if (!name) {
          outputLines.push({
            text: "Hata: Klas\u00f6r ad\u0131 gerekli (mkdir <ad>).",
            type: "error",
          });
        } else if (cwdNode?.children?.[name]) {
          outputLines.push({
            text: `Hata: "${name}" zaten mevcut.`,
            type: "error",
          });
        } else {
          createDirectory(tab.cwd, name);
          outputLines.push({
            text: `"${name}" klas\u00f6r\u00fc olu\u015fturuldu.`,
            type: "output",
          });
        }
        break;
      }

      case "rm": {
        const name = args.join(" ");
        if (!name) {
          outputLines.push({
            text: "Hata: Silinecek \u00f6\u011fe ad\u0131 gerekli (rm <ad>).",
            type: "error",
          });
        } else if (cwdNode?.children?.[name]) {
          deleteNode(tab.cwd, name);
          outputLines.push({ text: `"${name}" silindi.`, type: "output" });
        } else {
          outputLines.push({
            text: `Hata: "${name}" bulunamad\u0131.`,
            type: "error",
          });
        }
        break;
      }

      case "cat": {
        const filename = args.join(" ");
        if (!filename) {
          outputLines.push({
            text: "Hata: Dosya adi gerekli (cat <dosya>).",
            type: "error",
          });
        } else if (cwdNode?.children?.[filename]) {
          const fileNode = cwdNode.children[filename];
          if (fileNode.type === "file") {
            outputLines.push({
              text: fileNode.content || "(Bo\u015f Dosya)",
              type: "output",
            });
          } else {
            outputLines.push({
              text: `Hata: "${filename}" bir dosya de\u011fil.`,
              type: "error",
            });
          }
        } else {
          outputLines.push({
            text: `Hata: "${filename}" bulunamad\u0131.`,
            type: "error",
          });
        }
        break;
      }

      case "neofetch": {
        const host = OS_USER.promptHost;
        const pad = (s: string) => s.padEnd(28, " ");
        const art = [
          "      MMMMMMMMMMMMMMMMMMMMMMMM",
          "      M       MMMMMMM        M",
          "      M       M     M        M",
          "      M       M     M        M",
          "      M       MMMMMMM        M",
          "      MMMMMMMMMMMMMMMMMMMMMMMM",
          "             M        M",
          "             M        M",
          "      MMMMMMMMMMMMMMMMMMMMMMMM",
          "      M                      M",
        ];
        const info = [
          host,
          "---------------------",
          `OS: Windows 11 Pro x86_64`,
          `Host: ${OS_USER.hostname}`,
          `User: ${OS_USER.displayName}`,
          `Shell: Windows Terminal`,
          `CPU: AMD Ryzen 9 5900X`,
          `Memory: 32 GB`,
          `Resolution: ${window.innerWidth}x${window.innerHeight}`,
          `Theme: ${theme.toUpperCase()}`,
        ];
        art.forEach((line, i) => {
          outputLines.push({
            text: `${pad(line)}  ${info[i] ?? ""}`,
            type: "output",
          });
        });
        break;
      }

      default:
        outputLines.push({
          text: `'${cmdName}' tan\u0131nmad\u0131. "help" yaz\u0131n.`,
          type: "error",
        });
    }

    setTerm((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              history: clearScreen
                ? []
                : [
                    ...t.history,
                    { text: promptLine, type: "input" },
                    ...outputLines,
                  ],
              cwd: nextCwd,
              inputVal: "",
              cmdHistory: [...t.cmdHistory, command],
              cmdHistoryIndex: -1,
            }
          : t,
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTab) return;
    runCommand(activeTab.inputVal, activeTab.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!activeTab) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const hist = activeTab.cmdHistory;
      if (hist.length === 0) return;
      const next =
        activeTab.cmdHistoryIndex < 0
          ? hist.length - 1
          : Math.max(0, activeTab.cmdHistoryIndex - 1);
      patchTab(activeTab.id, {
        cmdHistoryIndex: next,
        inputVal: hist[next],
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const hist = activeTab.cmdHistory;
      if (activeTab.cmdHistoryIndex < 0) return;
      const next = activeTab.cmdHistoryIndex + 1;
      if (next >= hist.length) {
        patchTab(activeTab.id, { cmdHistoryIndex: -1, inputVal: "" });
      } else {
        patchTab(activeTab.id, {
          cmdHistoryIndex: next,
          inputVal: hist[next],
        });
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      patchTab(activeTab.id, { history: [] });
    } else if (e.key === "t" && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      addTab();
    } else if (e.key === "w" && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      closeTab(activeTab.id);
    }
  };

  const focusInput = (e?: React.MouseEvent) => {
    // Don't steal focus from tab/window chrome buttons
    const t = e?.target as HTMLElement | undefined;
    if (t?.closest("button, .wt-tab-close, a, input")) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  if (!activeTab) return null;

  return (
    <div
      className="wt-root"
      data-win-id={winId}
      onMouseDown={(e) => {
        // Keep keyboard focus on the CLI when clicking the body
        const t = e.target as HTMLElement;
        if (!t.closest("button, .wt-tab-close, a, input, .wt-win-btn")) {
          // defer so Window focus lands first
          queueMicrotask(() => inputRef.current?.focus({ preventScroll: true }));
        }
      }}
      onClick={focusInput}
    >
      <div className="wt-tabstrip wt-caption-drag">
        <div className="wt-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`wt-tab ${tab.id === activeTabId ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTabId(tab.id);
              }}
              title={tab.title}
            >
              <span className="wt-tab-icon">
                <AppWindowIcon appId="cmd" size={14} />
              </span>
              <span className="wt-tab-title">{tab.title}</span>
              <span
                className="wt-tab-close"
                role="button"
                tabIndex={-1}
                onClick={(e) => closeTab(tab.id, e)}
                title="Sekmeyi kapat"
              >
                <X size={11} strokeWidth={2.25} />
              </span>
            </button>
          ))}
          <button
            type="button"
            className="wt-new-tab"
            onClick={(e) => {
              e.stopPropagation();
              addTab();
            }}
            title="Yeni sekme (Ctrl+Shift+T)"
          >
            <Plus size={14} strokeWidth={2.25} />
          </button>
        </div>

        <div
          className="wt-window-controls"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="wt-win-btn"
            title="Küçült"
            onClick={() => minimizeWindow(winId)}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="wt-win-btn"
            title={isMaximized ? "A\u015fa\u011f\u0131 Ekran" : "Ekran\u0131 Kapla"}
            onClick={() => maximizeWindow(winId)}
          >
            {isMaximized ? <Copy size={11} /> : <Square size={11} />}
          </button>
          <button
            type="button"
            className="wt-win-btn wt-win-btn--close"
            title="Kapat"
            onClick={() => closeWindow(winId)}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="wt-body">
        <div className="wt-history" aria-live="polite">
          {activeTab.history.map((line, idx) => (
            <div key={idx} className={`wt-line type-${line.type}`}>
              {line.type === "input" ? (
                <PromptLine full={line.text} host={OS_USER.promptHost} />
              ) : (
                line.text
              )}
            </div>
          ))}
          <div ref={outputEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="wt-input-row">
          <span className="wt-prompt-host">{OS_USER.promptHost}</span>
          <span className="wt-prompt-sep"> </span>
          <span className="wt-prompt-path">{pathString(activeTab.cwd)}</span>
          <span className="wt-prompt-gt">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={activeTab.inputVal}
            onChange={(e) =>
              patchTab(activeTab.id, {
                inputVal: e.target.value,
                cmdHistoryIndex: -1,
              })
            }
            onKeyDown={handleKeyDown}
            className="wt-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Terminal komut girişi"
          />
        </form>
      </div>
    </div>
  );
};

/** Colorize stored input lines that start with host prompt. */
const PromptLine: React.FC<{ full: string; host: string }> = ({
  full,
  host,
}) => {
  if (!full.startsWith(host)) {
    return <>{full}</>;
  }
  const rest = full.slice(host.length);
  const gt = rest.lastIndexOf(">");
  if (gt < 0) {
    return (
      <>
        <span className="wt-prompt-host">{host}</span>
        {rest}
      </>
    );
  }
  const pathPart = rest.slice(0, gt);
  const cmd = rest.slice(gt + 1);
  return (
    <>
      <span className="wt-prompt-host">{host}</span>
      <span className="wt-prompt-path">{pathPart}</span>
      <span className="wt-prompt-gt">&gt;</span>
      <span className="wt-cmd-text">{cmd}</span>
    </>
  );
};

export default TerminalApp;
