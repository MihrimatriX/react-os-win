import React, { useEffect, useRef } from "react";
import { useFS } from "../../context/FSContext";
import { useWindow } from "../../context/WindowContext";
import {
  RefreshCw,
  FolderPlus,
  FilePlus,
  Settings,
  Check,
  Play,
  Trash2,
  Edit3,
  Sun,
  Moon,
} from "lucide-react";
import { useSystem } from "../../context/SystemContext";
import { userPath } from "../../osUser";
import "./contextmenu.css";

const DESKTOP_PATH = userPath("Desktop");

interface ContextMenuProps {
  x: number;
  y: number;
  type: "desktop" | "icon";
  targetNodeName?: string;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  type,
  targetNodeName,
  onClose,
}) => {
  const {
    createUniqueDirectory,
    createUniqueFile,
    renameNode,
    deleteNode,
    getNodeByPath,
  } = useFS();
  const { openApp } = useWindow();
  const { theme, toggleTheme, desktopAutoAlign, desktopAlignToGrid, setDesktopAutoAlign, setDesktopAlignToGrid } =
    useSystem();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu if clicked outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(".context-menu-item") ??
        [],
    );
    items.forEach((item) => {
      item.tabIndex = 0;
      item.setAttribute("role", "menuitem");
    });
    items[0]?.focus();
  }, [type]);

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("desktop-refresh"));
    onClose();
  };

  const handleNewFolder = () => {
    const name = `Yeni Klasör`;
    createUniqueDirectory(DESKTOP_PATH, name);
    onClose();
  };

  const handleNewFile = () => {
    const name = `yeni_belge.txt`;
    createUniqueFile(DESKTOP_PATH, name, "");
    onClose();
  };

  const handlePersonalize = () => {
    openApp("settings", { tab: "personalization" });
    onClose();
  };

  // ICON CONTEXT MENU ACTIONS
  const handleOpenIcon = () => {
    if (!targetNodeName) return;
    const path = DESKTOP_PATH;
    const node = getNodeByPath([...path, targetNodeName]);
    if (!node) return;

    if (node.type === "shortcut") {
      openApp("edge", { url: node.url || "https://www.google.com" });
    } else if (node.type === "app") {
      openApp(node.appId || "explorer");
    } else if (node.type === "file") {
      const isImage = /\.(png|jpg|jpeg|gif)$/i.test(node.name);
      const isCode = /\.(html|css|js)$/i.test(node.name);

      if (isImage) {
        openApp("imageviewer", {
          fileName: node.name,
          content: node.content || "",
          filePath: path,
        });
      } else if (isCode) {
        openApp("vscode", {
          fileName: node.name,
          content: node.content || "",
          filePath: path,
        });
      } else {
        openApp("notepad", {
          fileName: node.name,
          content: node.content || "",
          filePath: path,
        });
      }
    } else if (node.type === "dir") {
      openApp("explorer", {
        initialPath: [...path, node.name],
      });
    }
    onClose();
  };

  const handleDeleteIcon = () => {
    if (!targetNodeName) return;
    if (
      confirm(`"${targetNodeName}" öğesini silmek istediğinizden emin misiniz?`)
    ) {
      deleteNode(DESKTOP_PATH, targetNodeName);
    }
    onClose();
  };

  const handleRenameIcon = () => {
    if (!targetNodeName) return;
    const node = getNodeByPath([...DESKTOP_PATH, targetNodeName]);
    if (!node) return;

    const newName = prompt(
      `"${targetNodeName}" öğesini yeniden adlandır:`,
      targetNodeName,
    );
    if (newName && newName.trim() && newName.trim() !== targetNodeName) {
      const trimmed = newName.trim();
      const desktop = getNodeByPath(DESKTOP_PATH);
      if (desktop?.children?.[trimmed]) {
        alert(`"${trimmed}" adında bir öğe zaten var.`);
      } else {
        renameNode(DESKTOP_PATH, targetNodeName, trimmed);
      }
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu glass"
      style={{
        top: `${Math.max(8, Math.min(y, window.innerHeight - (type === "desktop" ? 330 : 170)))}px`,
        left: `${Math.max(8, Math.min(x, window.innerWidth - 250))}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(event) => {
        const items = Array.from(
          menuRef.current?.querySelectorAll<HTMLElement>(
            ".context-menu-item",
          ) ?? [],
        );
        const currentIndex = items.indexOf(event.target as HTMLElement);
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const direction = event.key === "ArrowDown" ? 1 : -1;
          items[(currentIndex + direction + items.length) % items.length]?.focus();
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          (event.target as HTMLElement).click();
        }
      }}
      role="menu"
      aria-label={type === "desktop" ? "Masaüstü menüsü" : "Öğe menüsü"}
    >
      {type === "desktop" ? (
        <>
          <div className="context-menu-item" onClick={handleRefresh}>
            <RefreshCw size={14} className="context-menu-icon" />
            <span>Yenile</span>
          </div>

          <div className="context-menu-separator" />

          <div
            className={`context-menu-item ${desktopAutoAlign ? "is-checked" : ""}`}
            onClick={() => {
              setDesktopAutoAlign(!desktopAutoAlign);
              onClose();
            }}
          >
            <Check size={14} className="context-menu-icon context-menu-check" />
            <span>Simgeleri otomatik hizala</span>
          </div>

          <div
            className={`context-menu-item ${desktopAlignToGrid ? "is-checked" : ""}`}
            onClick={() => {
              setDesktopAlignToGrid(!desktopAlignToGrid);
              onClose();
            }}
          >
            <Check size={14} className="context-menu-icon context-menu-check" />
            <span>Simgeleri kılavuza hizala</span>
          </div>

          <div className="context-menu-separator" />

          <div className="context-menu-item" onClick={handleNewFolder}>
            <FolderPlus size={14} className="context-menu-icon" />
            <span>Yeni Klasör</span>
          </div>

          <div className="context-menu-item" onClick={handleNewFile}>
            <FilePlus size={14} className="context-menu-icon" />
            <span>Yeni Metin Belgesi</span>
          </div>

          <div className="context-menu-separator" />

          <div className="context-menu-item" onClick={handlePersonalize}>
            <Settings size={14} className="context-menu-icon" />
            <span>Kişiselleştir (Tema & Duvar Kağıdı)</span>
          </div>

          <div
            className="context-menu-item"
            onClick={() => {
              toggleTheme();
              onClose();
            }}
          >
            {theme === "dark" ? (
              <Sun size={14} className="context-menu-icon" />
            ) : (
              <Moon size={14} className="context-menu-icon" />
            )}
            <span>
              {theme === "dark" ? "Açık Temaya Geç" : "Karanlık Temaya Geç"}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="context-menu-item" onClick={handleOpenIcon}>
            <Play
              size={14}
              className="context-menu-icon"
              style={{ color: "#4cd964" }}
            />
            <span style={{ fontWeight: "600" }}>Aç</span>
          </div>

          <div className="context-menu-separator" />

          <div className="context-menu-item" onClick={handleRenameIcon}>
            <Edit3 size={14} className="context-menu-icon" />
            <span>Yeniden Adlandır</span>
          </div>

          <div className="context-menu-separator" />

          <div
            className="context-menu-item"
            style={{ color: "#ff3b30" }}
            onClick={handleDeleteIcon}
          >
            <Trash2
              size={14}
              className="context-menu-icon"
              style={{ color: "#ff3b30" }}
            />
            <span>Sil</span>
          </div>
        </>
      )}
    </div>
  );
};
export default ContextMenu;
