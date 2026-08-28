import React, { useState, useEffect, useRef } from "react";
import { useFS } from "../../context/FSContext";
import type { VFSNode } from "../../context/FSContext";
import { useWindow } from "../../context/WindowContext";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FolderPlus,
  FilePlus,
  Trash2,
  Scissors,
  Copy,
  Clipboard,
  Edit3,
  Search,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import {
  FolderIcon,
  ComputerIcon,
  RecycleBinIcon,
  NotepadIcon,
  EdgeIcon,
  SettingsIcon,
  CalculatorIcon,
  TerminalIcon,
  TextFileIcon,
  HardDriveIcon,
  PaintIcon,
  VSCodeIcon,
  MinesweeperIcon,
  CameraIcon,
  ImageViewerIcon,
} from "../Common/Win11Icons";
import "./fileexplorer.css";
import { userPath } from "../../osUser";

const DESKTOP_PATH = userPath("Desktop");

interface FileExplorerProps {
  params?: {
    initialPath?: string[];
  };
}

interface ClipboardState {
  name: string;
  sourcePath: string[];
  action: "cut" | "copy";
}

export const FileExplorerApp: React.FC<FileExplorerProps> = ({ params }) => {
  const {
    createUniqueFile,
    createUniqueDirectory,
    renameNode,
    transferNode,
    deleteNode,
    getNodeByPath,
  } = useFS();
  const { openApp } = useWindow();

  // Navigation path state (defaults to desktop)
  const [currentPath, setCurrentPath] = useState<string[]>(
    params?.initialPath || DESKTOP_PATH,
  );

  // Navigation history
  const [history, setHistory] = useState<string[][]>([
    params?.initialPath || DESKTOP_PATH,
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selected item and Clipboard (Cut/Copy/Paste)
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  // New menu dropdown state
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  // Search input state
  const [searchVal, setSearchVal] = useState("");

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        newMenuRef.current &&
        !newMenuRef.current.contains(e.target as Node)
      ) {
        setNewMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isThisPC =
    currentPath.length === 1 && currentPath[0] === "Bu Bilgisayar";
  const cwdNode = isThisPC ? null : getNodeByPath(currentPath);

  const navigateTo = (newPath: string[]) => {
    setSelectedName(null);
    setSearchVal("");
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newPath);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setCurrentPath(newPath);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setCurrentPath(history[idx]);
      setSelectedName(null);
      setSearchVal("");
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setCurrentPath(history[idx]);
      setSelectedName(null);
      setSearchVal("");
    }
  };

  // Directory / File CRUD Action triggers
  const handleNewFolder = () => {
    setNewMenuOpen(false);
    if (isThisPC) return; // Cannot create folders in This PC root
    const name = prompt("Yeni Klasör adı girin:", "Yeni Klasör");
    if (name && name.trim()) {
      createUniqueDirectory(currentPath, name.trim());
    }
  };

  const handleNewFile = () => {
    setNewMenuOpen(false);
    if (isThisPC) return;
    const name = prompt("Yeni Metin Belgesi adı girin:", "yeni_belge.txt");
    if (name && name.trim()) {
      let finalName = name.trim();
      if (!finalName.endsWith(".txt")) finalName += ".txt";
      createUniqueFile(currentPath, finalName, "");
    }
  };

  const handleDeleteItem = () => {
    if (!selectedName || isThisPC) return;
    if (
      confirm(`"${selectedName}" öğesini silmek istediğinizden emin misiniz?`)
    ) {
      deleteNode(currentPath, selectedName);
      setSelectedName(null);
    }
  };

  const handleRenameItem = () => {
    if (!selectedName || isThisPC) return;
    const item = cwdNode?.children?.[selectedName];
    if (!item) return;

    const newName = prompt(
      `"${selectedName}" öğesini yeniden adlandır:`,
      selectedName,
    );
    if (newName && newName.trim() && newName.trim() !== selectedName) {
      const trimmed = newName.trim();
      if (cwdNode?.children?.[trimmed]) {
        alert(`"${trimmed}" adında bir öğe zaten var.`);
        return;
      }
      renameNode(currentPath, selectedName, trimmed);
      setSelectedName(null);
    }
  };

  const handleCut = () => {
    if (!selectedName || isThisPC) return;
    setClipboard({
      name: selectedName,
      sourcePath: currentPath,
      action: "cut",
    });
  };

  const handleCopy = () => {
    if (!selectedName || isThisPC) return;
    setClipboard({
      name: selectedName,
      sourcePath: currentPath,
      action: "copy",
    });
  };

  const handlePaste = () => {
    if (!clipboard || isThisPC) return;

    transferNode(
      clipboard.sourcePath,
      clipboard.name,
      currentPath,
      clipboard.action === "cut" ? "move" : "copy",
    );

    setClipboard(null);
  };

  const handleExplorerKeyDown = (event: React.KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.matches("input, textarea, [contenteditable='true']")) return;

    if (event.key === "Delete") {
      event.preventDefault();
      handleDeleteItem();
    } else if (event.key === "F2") {
      event.preventDefault();
      handleRenameItem();
    } else if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      handleCopy();
    } else if (event.ctrlKey && event.key.toLowerCase() === "x") {
      event.preventDefault();
      handleCut();
    } else if (event.ctrlKey && event.key.toLowerCase() === "v") {
      event.preventDefault();
      handlePaste();
    }
  };

  const handleNodeDoubleClick = (node: VFSNode) => {
    if (node.type === "dir") {
      navigateTo([...currentPath, node.name]);
    } else if (node.type === "file") {
      const isImage = /\.(png|jpg|jpeg|gif)$/i.test(node.name);
      const isCode = /\.(html|css|js)$/i.test(node.name);

      if (isImage) {
        openApp("imageviewer", {
          fileName: node.name,
          content: node.content || "",
          filePath: currentPath,
        });
      } else if (isCode) {
        openApp("vscode", {
          fileName: node.name,
          content: node.content || "",
          filePath: currentPath,
        });
      } else {
        openApp("notepad", {
          fileName: node.name,
          content: node.content || "",
          filePath: currentPath,
        });
      }
    } else if (node.type === "shortcut") {
      openApp("edge", { url: node.url || "https://www.google.com" });
    } else if (node.type === "app") {
      openApp(node.appId || "explorer");
    }
  };

  // Mock list for "Bu Bilgisayar" view
  const thisPCFolders = [
    { name: "Masaüstü", path: userPath("Desktop") },
    { name: "Belgeler", path: userPath("Documents") },
    { name: "İndirilenler", path: userPath("Downloads") },
    { name: "Resimler", path: userPath("Pictures") },
  ];

  // Sidebar shortcut helpers
  const sidebarShortcuts = thisPCFolders;

  const renderGridItemIcon = (node: VFSNode) => {
    const size = 38;
    if (node.type === "shortcut") {
      return (
        <span className="explorer-web-shortcut-icon" aria-hidden="true">
          <EdgeIcon size={size} />
          {node.iconUrl && (
            <img
              src={node.iconUrl}
              alt=""
              draggable={false}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
          <ExternalLink size={9} />
        </span>
      );
    }
    if (node.type === "dir") {
      return <FolderIcon size={size} />;
    }
    if (node.type === "file") {
      if (/\.(png|jpg|jpeg|gif)$/i.test(node.name)) {
        return <ImageViewerIcon size={size} />;
      }
      if (/\.(html|css|js)$/i.test(node.name)) {
        return <VSCodeIcon size={size} />;
      }
      return <TextFileIcon size={size} />;
    }

    switch (node.appId) {
      case "explorer":
        if (node.name.includes("Geri Dönüşüm"))
          return <RecycleBinIcon size={size} />;
        return <ComputerIcon size={size} />;
      case "edge":
        return <EdgeIcon size={size} />;
      case "notepad":
        return <NotepadIcon size={size} />;
      case "calculator":
        return <CalculatorIcon size={size} />;
      case "cmd":
        return <TerminalIcon size={size} />;
      case "settings":
        return <SettingsIcon size={size} />;
      case "paint":
        return <PaintIcon size={size} />;
      case "vscode":
        return <VSCodeIcon size={size} />;
      case "minesweeper":
        return <MinesweeperIcon size={size} />;
      case "camera":
        return <CameraIcon size={size} />;
      case "imageviewer":
        return <ImageViewerIcon size={size} />;
      default:
        return <TextFileIcon size={size} />;
    }
  };

  // Filter children by search bar
  const getCwdChildren = () => {
    if (!cwdNode || !cwdNode.children) return [];
    const rawList = Object.values(cwdNode.children);
    if (!searchVal.trim()) return rawList;
    return rawList.filter((c) =>
      c.name.toLowerCase().includes(searchVal.toLowerCase()),
    );
  };

  const activeChildren = getCwdChildren();

  return (
    <div
      className="explorer-container"
      onClick={() => setSelectedName(null)}
      onKeyDown={handleExplorerKeyDown}
      role="application"
      aria-label="Dosya Gezgini"
    >
      {/* 1. Windows 11 Styled Toolbar */}
      <div className="explorer-toolbar" onClick={(e) => e.stopPropagation()}>
        {/* NEW DROP DOWN */}
        <div ref={newMenuRef} className="new-dropdown-wrapper">
          <button
            className="explorer-new-btn"
            onClick={() => setNewMenuOpen(!newMenuOpen)}
            aria-expanded={newMenuOpen}
          >
            <span
              style={{
                fontSize: "18px",
                marginRight: "4px",
                fontWeight: "bold",
              }}
            >
              +
            </span>
            <span>Yeni</span>
            <ChevronDown
              size={12}
              style={{ marginLeft: "4px", opacity: 0.8 }}
            />
          </button>

          {newMenuOpen && (
            <div className="new-menu-dropdown glass">
              <button
                type="button"
                className="new-menu-item"
                onClick={handleNewFolder}
              >
                <FolderPlus size={14} style={{ color: "#fcd34d" }} />
                <span>Klasör</span>
              </button>
              <button
                type="button"
                className="new-menu-item"
                onClick={handleNewFile}
              >
                <FilePlus size={14} style={{ color: "#60cdff" }} />
                <span>Metin Belgesi</span>
              </button>
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Windows 11 Action Commands */}
        <div className="explorer-actions-group">
          <button
            className="action-btn"
            title="Kes"
            onClick={handleCut}
            disabled={!selectedName || isThisPC}
          >
            <Scissors size={15} />
          </button>

          <button
            className="action-btn"
            title="Kopyala"
            onClick={handleCopy}
            disabled={!selectedName || isThisPC}
          >
            <Copy size={15} />
          </button>

          <button
            className="action-btn"
            title="Yapıştır"
            onClick={handlePaste}
            disabled={!clipboard || isThisPC}
          >
            <Clipboard size={15} />
          </button>

          <button
            className="action-btn"
            title="Yeniden Adlandır"
            onClick={handleRenameItem}
            disabled={!selectedName || isThisPC}
          >
            <Edit3 size={15} />
          </button>

          <button
            className="action-btn action-btn-delete"
            title="Sil"
            onClick={handleDeleteItem}
            disabled={!selectedName || isThisPC}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* 2. Navigation Address and Search Bar */}
      <div className="explorer-nav-bar" onClick={(e) => e.stopPropagation()}>
        <div className="toolbar-navigation">
          <button
            className="toolbar-nav-btn"
            onClick={handleBack}
            disabled={historyIndex <= 0}
            aria-label="Geri"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            className="toolbar-nav-btn"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            aria-label="İleri"
          >
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Breadcrumb Path */}
        <div className="explorer-path-bar">
          {currentPath.map((segment, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight size={10} className="path-chevron" />}
              <button
                type="button"
                className="path-segment"
                onClick={() => navigateTo(currentPath.slice(0, idx + 1))}
              >
                {segment}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search Field */}
        <div className="explorer-search-field">
          <Search size={13} className="search-field-icon" />
          <input
            type="text"
            placeholder="Arama..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            aria-label="Bu klasörde ara"
          />
        </div>
      </div>

      {/* 3. Main Split Viewport */}
      <div className="explorer-viewport">
        {/* Left Tree Navigation Sidebar */}
        <div className="explorer-sidebar" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`sidebar-item ${isThisPC ? "active" : ""}`}
            onClick={() => navigateTo(["Bu Bilgisayar"])}
          >
            <ComputerIcon size={16} className="sidebar-icon-margin" />
            <span>Bu Bilgisayar</span>
          </button>

          <div className="sidebar-group-title">Hızlı erişim</div>
          {sidebarShortcuts.map((sc) => {
            const isSelected =
              JSON.stringify(currentPath) === JSON.stringify(sc.path);
            return (
              <button
                type="button"
                key={sc.name}
                className={`sidebar-item ${isSelected ? "active" : ""}`}
                onClick={() => navigateTo(sc.path)}
              >
                <FolderIcon size={16} className="sidebar-icon-margin" />
                <span>{sc.name}</span>
              </button>
            );
          })}

          <div className="sidebar-group-title">Sürücüler</div>
          <button
            type="button"
            className={`sidebar-item ${JSON.stringify(currentPath) === JSON.stringify(["C:"]) ? "active" : ""}`}
            onClick={() => navigateTo(["C:"])}
          >
            <HardDriveIcon size={16} className="sidebar-icon-margin" />
            <span>Yerel Disk (C:)</span>
          </button>
        </div>

        {/* Right Contents View Grid */}
        <div
          className="explorer-files-grid"
          onClick={(e) => e.stopPropagation()}
        >
          {/* A. RENDER THIS PC VIEW */}
          {isThisPC && (
            <div className="this-pc-layout-view">
              <h4 className="this-pc-section-header">Klasörler</h4>
              <div className="this-pc-folders-grid">
                {thisPCFolders.map((fold) => (
                  <button
                    type="button"
                    key={fold.name}
                    className={`this-pc-grid-folder ${selectedName === fold.name ? "selected" : ""}`}
                    onClick={() => setSelectedName(fold.name)}
                    onDoubleClick={() => navigateTo(fold.path)}
                  >
                    <FolderIcon size={38} />
                    <span className="this-pc-folder-name">{fold.name}</span>
                  </button>
                ))}
              </div>

              <h4
                className="this-pc-section-header"
                style={{ marginTop: "25px" }}
              >
                Cihazlar ve Sürücüler
              </h4>
              <div className="this-pc-drives-list">
                <button
                  type="button"
                  className={`this-pc-drive-item ${selectedName === "drive_c" ? "selected" : ""}`}
                  onClick={() => setSelectedName("drive_c")}
                  onDoubleClick={() => navigateTo(["C:"])}
                >
                  <HardDriveIcon size={44} />
                  <div className="drive-details">
                    <span className="drive-label">Yerel Disk (C:)</span>
                    <div className="drive-progress-bar-container">
                      <div
                        className="drive-progress-bar-fill"
                        style={{ width: "67%" }}
                      ></div>
                    </div>
                    <span className="drive-capacity-text">
                      1.24 TB boş / 1.86 TB
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* B. RENDER VFS CHILD NODES VIEW */}
          {!isThisPC &&
            (activeChildren.length > 0 ? (
              activeChildren.map((child) => (
                <button
                  type="button"
                  key={child.name}
                  className={`file-grid-item ${selectedName === child.name ? "selected" : ""}`}
                  onClick={() => setSelectedName(child.name)}
                  onDoubleClick={() => handleNodeDoubleClick(child)}
                >
                  <div className="file-item-icon">
                    {renderGridItemIcon(child)}
                  </div>
                  <div className="file-item-label">{child.name}</div>
                </button>
              ))
            ) : (
              <div className="empty-folder-message">Bu klasör boş.</div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default FileExplorerApp;
