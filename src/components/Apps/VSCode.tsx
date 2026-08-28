import React, { useState, useEffect, useCallback } from "react";
import { useFS } from "../../context/FSContext";
import {
  Folder,
  Plus,
  Play,
  Save,
  X,
  Settings,
  Files,
  Search,
  GitBranch,
  Bug,
  Puzzle,
  FileCode,
  AlertCircle,
} from "lucide-react";
import "./vscode.css";
import { userPath } from "../../osUser";

const fileColor = (name: string) => {
  if (/\.html?$/i.test(name)) return "#e37933";
  if (/\.css$/i.test(name)) return "#519aba";
  if (/\.jsx?$/i.test(name)) return "#cbcb41";
  if (/\.tsx?$/i.test(name)) return "#519aba";
  if (/\.json$/i.test(name)) return "#cbcb41";
  if (/\.md$/i.test(name)) return "#519aba";
  return "#cccccc";
};

const langLabel = (name: string) => {
  if (/\.html?$/i.test(name)) return "HTML";
  if (/\.css$/i.test(name)) return "CSS";
  if (/\.jsx?$/i.test(name)) return "JavaScript";
  if (/\.tsx?$/i.test(name)) return "TypeScript";
  if (/\.json$/i.test(name)) return "JSON";
  if (/\.md$/i.test(name)) return "Markdown";
  return "Plain Text";
};

interface VSCodeTab {
  fileName: string;
  filePath: string[];
  content: string;
}

interface VSCodeProps {
  params?: {
    fileName?: string;
    content?: string;
    filePath?: string[];
  };
}

export const VSCodeApp: React.FC<VSCodeProps> = ({ params }) => {
  const { createFile, updateFileContent, getNodeByPath } = useFS();

  // Active Workspace Folders
  const workspaceFolders = [
    { name: "Masaüstü", path: userPath("Desktop") },
    { name: "Belgeler", path: userPath("Documents") },
  ];

  const [openTabs, setOpenTabs] = useState<VSCodeTab[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(-1);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const handleOpenFile = useCallback(
    (fileName: string, filePath: string[]) => {
      const node = getNodeByPath([...filePath, fileName]);
      if (!node) return;

      setOpenTabs((prev) => {
        const existingIndex = prev.findIndex(
          (t) =>
            t.fileName === fileName &&
            JSON.stringify(t.filePath) === JSON.stringify(filePath),
        );

        if (existingIndex > -1) {
          setActiveTabIndex(existingIndex);
          return prev;
        } else {
          const newTab: VSCodeTab = {
            fileName,
            filePath,
            content: node.content || "",
          };
          const nextTabs = [...prev, newTab];
          setActiveTabIndex(nextTabs.length - 1);
          return nextTabs;
        }
      });
    },
    [getNodeByPath, setActiveTabIndex],
  );

  // If launched with params (e.g. double clicked file)
  useEffect(() => {
    if (params?.fileName && params.filePath) {
      const { fileName, filePath } = params;
      const timer = setTimeout(() => {
        handleOpenFile(fileName, filePath);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [params, handleOpenFile]);

  // Read folder children helper
  const getFolderFiles = (path: string[]) => {
    const node = getNodeByPath(path);
    if (node && node.children) {
      return Object.values(node.children).filter((n) => n.type === "file");
    }
    return [];
  };

  const handleCreateFile = (folderPath: string[]) => {
    const name = prompt(
      "Yeni Dosya Adı (uzantısıyla birlikte girin. örn: index.html):",
      "sayfa.html",
    );
    if (!name || !name.trim()) return;

    const trimmed = name.trim();
    createFile(folderPath, trimmed, "<!-- Yeni kod dosyası -->\n");

    // Auto-open newly created file
    setTimeout(() => {
      handleOpenFile(trimmed, folderPath);
    }, 100);
  };

  const handleSaveFile = () => {
    if (activeTabIndex === -1) return;
    const tab = openTabs[activeTabIndex];
    updateFileContent(tab.filePath, tab.fileName, tab.content);
    alert(`"${tab.fileName}" başarıyla kaydedildi!`);
  };

  const handleCloseTab = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextTabs = openTabs.filter((_, idx) => idx !== index);
    setOpenTabs(nextTabs);

    if (nextTabs.length === 0) {
      setActiveTabIndex(-1);
      setPreviewSrc(null);
    } else if (activeTabIndex >= nextTabs.length) {
      setActiveTabIndex(nextTabs.length - 1);
    }
  };

  const updateActiveContent = (text: string) => {
    if (activeTabIndex === -1) return;
    setOpenTabs((prev) =>
      prev.map((t, idx) =>
        idx === activeTabIndex ? { ...t, content: text } : t,
      ),
    );
  };

  // Compile and Run Code inside iframe
  const handleRunCode = () => {
    if (activeTabIndex === -1) return;
    const tab = openTabs[activeTabIndex];
    let srcDoc: string;

    if (tab.fileName.endsWith(".html")) {
      srcDoc = tab.content;
    } else if (tab.fileName.endsWith(".css")) {
      srcDoc = `<html><head><style>${tab.content}</style></head><body><h1>CSS Önizleme Modu</h1><p>CSS kuralları yüklendi.</p></body></html>`;
    } else if (tab.fileName.endsWith(".js")) {
      srcDoc = `<html><body><h3>JS Konsol Önizleme</h3><div id="console-log"></div><script>
        const oldLog = console.log;
        const logBox = document.getElementById("console-log");
        console.log = function(...args) {
          logBox.innerHTML += args.join(' ') + '<br/>';
          oldLog(...args);
        };
        try {
          ${tab.content}
        } catch(e) {
          logBox.innerHTML += '<span style="color:red">Hata: ' + e.message + '</span>';
        }
      </script></body></html>`;
    } else {
      // For standard txt / markdown files
      srcDoc = `<html><body style="font-family:sans-serif; padding: 20px;"><pre>${escapeHTML(tab.content)}</pre></body></html>`;
    }

    setPreviewSrc(srcDoc);
  };

  const escapeHTML = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  const activeTab = activeTabIndex > -1 ? openTabs[activeTabIndex] : null;

  // Generate line numbers
  const getLineNumbers = () => {
    if (!activeTab) return "";
    const lineCount = activeTab.content.split("\n").length;
    return Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");
  };

  return (
    <div className="vscode-container">
      <div className="vscode-titlebar">
        <div className="vscode-menubar">
          <span className="vscode-app-mark">VS Code</span>
          <button type="button">Dosya</button>
          <button type="button">Düzen</button>
          <button type="button">Seçim</button>
          <button type="button">Görünüm</button>
          <button type="button">Git</button>
          <button type="button">Çalıştır</button>
          <button type="button">Terminal</button>
          <button type="button">Yardım</button>
        </div>
        <div className="vscode-titlebar-actions">
          {activeTab && (
            <>
              <button
                type="button"
                className="vscode-tool-btn"
                onClick={handleSaveFile}
                title="Kaydet"
              >
                <Save size={14} />
              </button>
              <button
                type="button"
                className="vscode-tool-btn run"
                onClick={handleRunCode}
                title="Çalıştır"
              >
                <Play size={13} fill="currentColor" />
                Run
              </button>
            </>
          )}
        </div>
      </div>

      <div className="vscode-body">
        <div className="vscode-actionbar">
          <button className="vscode-actionbar-btn active" title="Gezgin">
            <Files size={22} />
          </button>
          <button className="vscode-actionbar-btn" title="Ara">
            <Search size={22} />
          </button>
          <button className="vscode-actionbar-btn" title="Kaynak Denetimi">
            <GitBranch size={22} />
          </button>
          <button className="vscode-actionbar-btn" title="Çalıştır ve Hata Ayıkla">
            <Bug size={22} />
          </button>
          <button className="vscode-actionbar-btn" title="Uzantılar">
            <Puzzle size={22} />
          </button>
          <div className="vscode-actionbar-spacer" />
          <button className="vscode-actionbar-btn" title="Ayarlar">
            <Settings size={20} />
          </button>
        </div>

        <div className="vscode-sidebar">
          <div className="vscode-sidebar-header">
            <span>Gezgin</span>
            <button
              className="vscode-sidebar-action-btn"
              onClick={() => handleCreateFile(workspaceFolders[0].path)}
              title="Yeni Dosya"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="vscode-file-tree">
            {workspaceFolders.map((folder) => {
              const files = getFolderFiles(folder.path);
              return (
                <div key={folder.name} className="tree-folder-group">
                  <div className="tree-folder-header">
                    <Folder size={14} className="tree-folder-icon" />
                    <span style={{ flex: 1 }}>{folder.name}</span>
                    <button
                      className="vscode-sidebar-action-btn"
                      onClick={() => handleCreateFile(folder.path)}
                      title="Yeni Dosya"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div className="tree-folder-contents">
                    {files.map((file) => {
                      const isTabOpen =
                        activeTab?.fileName === file.name &&
                        JSON.stringify(activeTab?.filePath) ===
                          JSON.stringify(folder.path);
                      return (
                        <div
                          key={file.name}
                          className={`tree-file-item ${isTabOpen ? "active" : ""}`}
                          onClick={() => handleOpenFile(file.name, folder.path)}
                        >
                          <FileCode
                            size={13}
                            style={{ color: fileColor(file.name) }}
                          />
                          <span>{file.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="vscode-editor-pane">
          <div className="vscode-tabs-bar">
            {openTabs.length === 0 ? (
              <div className="vscode-tab placeholder">Welcome</div>
            ) : (
              openTabs.map((tab, idx) => (
                <div
                  key={idx}
                  className={`vscode-tab ${idx === activeTabIndex ? "active" : ""}`}
                  onClick={() => setActiveTabIndex(idx)}
                >
                  <FileCode
                    size={12}
                    style={{ color: fileColor(tab.fileName) }}
                  />
                  <span>{tab.fileName}</span>
                  <button
                    className="tab-close"
                    onClick={(e) => handleCloseTab(idx, e)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {activeTab ? (
            <div className="vscode-text-pane">
              <pre className="vscode-line-numbers">{getLineNumbers()}</pre>
              <textarea
                className="vscode-textarea"
                value={activeTab.content}
                onChange={(e) => updateActiveContent(e.target.value)}
                placeholder="// Kodunuzu buraya yazın..."
                spellCheck="false"
              />
            </div>
          ) : (
            <div className="preview-empty-state editor-welcome">
              <div className="welcome-brand">Visual Studio Code</div>
              <p>
                Sol gezginden bir dosya açın veya{" "}
                <strong>Yeni Dosya</strong> ile başlayın.
              </p>
              <div className="welcome-shortcuts">
                <span>
                  <kbd>Ctrl</kbd> + <kbd>S</kbd> Kaydet
                </span>
                <span>
                  <kbd>F5</kbd> Run Code
                </span>
              </div>
            </div>
          )}

          <div className="vscode-statusbar">
            <div className="statusbar-left">
              <span className="status-chip">main*</span>
              <span>✓ Hazır</span>
              {activeTab && (
                <span className="status-muted">
                  {activeTab.filePath.join(" / ")}
                </span>
              )}
            </div>
            <div className="statusbar-right">
              {activeTab && (
                <>
                  <span>Ln {activeTab.content.split("\n").length}</span>
                  <span>UTF-8</span>
                  <span>{langLabel(activeTab.fileName)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="vscode-preview-pane">
          <div className="preview-header">
            <span className="preview-title">Canlı Önizleme</span>
            {activeTab && (
              <button className="preview-run-btn" onClick={handleRunCode}>
                <Play size={11} fill="currentColor" />
                Run
              </button>
            )}
          </div>

          {previewSrc ? (
            <iframe
              className="preview-iframe"
              srcDoc={previewSrc}
              title="Live Code Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <div className="preview-empty-state">
              <AlertCircle size={28} className="preview-empty-icon" />
              <p>
                Önizleme için <strong>Run</strong> düğmesine basın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VSCodeApp;
