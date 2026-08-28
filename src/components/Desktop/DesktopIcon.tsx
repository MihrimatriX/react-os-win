import React, { useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useFS } from "../../context/FSContext";
import type { VFSNode } from "../../context/FSContext";
import { useWindow } from "../../context/WindowContext";
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
  PaintIcon,
  VSCodeIcon,
  MinesweeperIcon,
  CameraIcon,
  ImageViewerIcon,
  StoreIcon,
  CopilotIcon,
  TaskManagerIcon,
  WeatherIcon,
  MSIBiosIcon,
  FdmIcon,
  TorrentIcon,
} from "../Common/Win11Icons";
import "./desktop.css";
import {
  DESKTOP_GRID,
  clampToDesktop,
  snapToGrid,
} from "./desktopGrid";
import { userPath } from "../../osUser";

const DESKTOP_PATH = userPath("Desktop");

interface DesktopIconProps {
  node: VFSNode;
  isSelected: boolean;
  autoAlign: boolean;
  alignToGrid: boolean;
  onSelect: (
    e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
  onIconContextMenu: (x: number, y: number, name: string) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  node,
  isSelected,
  autoAlign,
  alignToGrid,
  onSelect,
  onIconContextMenu,
}) => {
  const { updateNodePosition } = useFS();
  const { openApp } = useWindow();
  const iconRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({
    x: node.x ?? DESKTOP_GRID.origin,
    y: node.y ?? DESKTOP_GRID.origin,
  });
  const positionRef = useRef(position);

  // Select icon based on type / appId
  const renderIconSymbol = () => {
    const size = 42; // slightly larger for premium feel

    if (node.type === "shortcut") {
      return (
        <span className="desktop-web-shortcut-icon" aria-hidden="true">
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
          <span className="desktop-shortcut-badge">
            <ExternalLink size={10} strokeWidth={2.4} />
          </span>
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

    // It's an app shortcut
    switch (node.appId) {
      case "explorer":
        if (node.name.includes("Geri Dönüşüm")) {
          return <RecycleBinIcon size={size} />;
        }
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
      case "store":
        return <StoreIcon size={size} />;
      case "copilot":
        return <CopilotIcon size={size} />;
      case "taskmgr":
        return <TaskManagerIcon size={size} />;
      case "weather":
        return <WeatherIcon size={size} />;
      case "bios":
        return <MSIBiosIcon size={size} />;
      case "fdm":
        return <FdmIcon size={size} />;
      case "torrent":
        return <TorrentIcon size={size} />;
      default:
        return <TextFileIcon size={size} />;
    }
  };

  // Pointer Down: Init drag
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary mouse click/touch
    if (e.button !== 0) return;

    onSelect(e);
    e.stopPropagation();
    if (autoAlign) return;

    const currentPosition = {
      x: node.x ?? DESKTOP_GRID.origin,
      y: node.y ?? DESKTOP_GRID.origin,
    };
    positionRef.current = currentPosition;
    setPosition(currentPosition);
    setIsDragging(true);
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    iconRef.current?.setPointerCapture(e.pointerId);
  };

  // Pointer Move: Drag
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const parent = iconRef.current?.parentElement;
    const parentRect = parent?.getBoundingClientRect();

    if (parentRect) {
      const nextX = e.clientX - parentRect.left - dragOffset.x;
      const nextY = e.clientY - parentRect.top - dragOffset.y;
      const clamped = clampToDesktop(
        { x: nextX, y: nextY },
        parentRect.width,
        parentRect.height,
      );
      positionRef.current = clamped;
      setPosition(clamped);
    }
    e.stopPropagation();
  };

  // Pointer Up: End drag & snap to grid
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    iconRef.current?.releasePointerCapture(e.pointerId);

    const parent = iconRef.current?.parentElement;
    const parentRect = parent?.getBoundingClientRect();
    let final = { ...positionRef.current };

    if (alignToGrid) {
      final = snapToGrid(final.x, final.y);
    }
    if (parentRect) {
      final = clampToDesktop(final, parentRect.width, parentRect.height);
    }

    setPosition(final);
    positionRef.current = final;
    updateNodePosition(node.name, final.x, final.y);
    e.stopPropagation();
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(e);
    onIconContextMenu(e.clientX, e.clientY, node.name);
  };

  const handleDoubleClick = () => {
    if (node.type === "shortcut") {
      openApp("edge", { url: node.url || "https://www.google.com" });
    } else if (node.type === "app") {
      openApp(node.appId || "explorer");
    } else if (node.type === "file") {
      const isImage = /\.(png|jpg|jpeg|gif)$/i.test(node.name);
      const isCode = /\.(html|css|js)$/i.test(node.name);
      const path = DESKTOP_PATH;

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
      // Open in File Explorer at this path
      openApp("explorer", {
        initialPath: [...DESKTOP_PATH, node.name],
      });
    }
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon-wrapper ${isDragging ? "dragging" : ""} ${isSelected ? "selected" : ""}`}
      style={{
        position: "absolute",
        left: `${isDragging ? position.x : node.x ?? DESKTOP_GRID.origin}px`,
        top: `${isDragging ? position.y : node.y ?? DESKTOP_GRID.origin}px`,
        zIndex: isDragging ? 999 : 5,
        touchAction: "none", // Prevents default touch scrolling during drag
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleDoubleClick();
        }
      }}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      title={node.url ? `${node.name}\n${node.url}` : node.name}
    >
      <div className="desktop-icon-visual">{renderIconSymbol()}</div>
      <div className="desktop-icon-label">{node.name}</div>
    </div>
  );
};
export default DesktopIcon;
