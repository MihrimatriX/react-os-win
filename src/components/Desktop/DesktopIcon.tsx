import React, { useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useFS } from "../../context/FSContext";
import type { VFSNode } from "../../context/FSContext";
import { useWindow } from "../../context/WindowContext";
import {
  FolderIcon,
  ComputerIcon,
  RecycleBinIcon,
  EdgeIcon,
  TextFileIcon,
  ImageViewerIcon,
  VSCodeIcon,
  AppWindowIcon,
} from "../Common/Win11Icons";
import "./desktop.css";
import {
  DESKTOP_GRID,
  clampToDesktop,
  snapToGrid,
} from "./desktopGrid";
import { openNode } from "./openNode";
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
  /** True when another visible icon already sits at (x, y). */
  isCellTaken: (x: number, y: number) => boolean;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  node,
  isSelected,
  autoAlign,
  alignToGrid,
  onSelect,
  onIconContextMenu,
  isCellTaken,
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
    const size = 48; // Win11 desktop glyph size

    if (node.type === "shortcut") {
      const hasFavicon = Boolean(node.iconUrl);
      return (
        <span
          className={`desktop-web-shortcut-icon ${hasFavicon ? "has-favicon" : ""}`}
          aria-hidden="true"
        >
          {hasFavicon ? (
            <img
              className="desktop-project-favicon"
              src={node.iconUrl}
              alt=""
              draggable={false}
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = "block";
              }}
            />
          ) : null}
          <span
            className="desktop-shortcut-fallback"
            style={{ display: hasFavicon ? "none" : "block" }}
          >
            <EdgeIcon size={size} />
          </span>
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
    if (node.appId === "explorer") {
      if (/geri/i.test(node.name)) {
        return <RecycleBinIcon size={size} />;
      }
      return <ComputerIcon size={size} />;
    }
    if (node.appId) {
      return <AppWindowIcon appId={node.appId} size={size} />;
    }
    return <TextFileIcon size={size} />;
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
    // Dropped onto another icon → snap back instead of stacking.
    if (isCellTaken(final.x, final.y)) {
      final = {
        x: node.x ?? DESKTOP_GRID.origin,
        y: node.y ?? DESKTOP_GRID.origin,
      };
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

  const handleDoubleClick = () => openNode(node, DESKTOP_PATH, openApp);

  // Win11: one wrapper owns selection (thin rounded acrylic). Label is NOT a separate filled box.
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
