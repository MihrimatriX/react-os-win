import React, { useState, useEffect, useRef } from "react";
import { useSystem } from "../../context/SystemContext";
import { useFS } from "../../context/FSContext";
import DesktopIcon from "./DesktopIcon";
import ContextMenu from "./ContextMenu";
import {
  DESKTOP_GRID,
  fitOverflowIcons,
  packDesktopZones,
} from "./desktopGrid";
import "./desktop.css";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: "desktop" | "icon";
  targetNodeName?: string;
}

export const Desktop: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const {
    wallpaper,
    closeSystemPanels,
    installedAppIds,
    desktopAutoAlign,
    desktopAlignToGrid,
  } = useSystem();
  const { getDesktopNodes, updateNodePositions } = useFS();
  const iconsRef = useRef<HTMLDivElement>(null);
  const [desktopSize, setDesktopSize] = useState({ w: 0, h: 0 });

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    type: "desktop",
  });

  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);

  const [selection, setSelection] = useState({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        const activeElement = document.activeElement as HTMLElement | null;
        if (
          activeElement?.closest(
            ".window-container, input, textarea, select, [contenteditable='true']",
          )
        ) {
          return;
        }
        e.preventDefault();
        triggerRefresh();
      }
    };

    const handleCustomRefresh = () => {
      triggerRefresh();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("desktop-refresh", handleCustomRefresh);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("desktop-refresh", handleCustomRefresh);
    };
  }, []);

  const desktopNodes = getDesktopNodes().filter((node) => {
    if (node.type === "app") {
      return (
        node.appId === "store" || installedAppIds.includes(node.appId || "")
      );
    }
    return true;
  });
  const iconNamesKey = desktopNodes.map((node) => node.name).join("\0");

  useEffect(() => {
    const el = iconsRef.current;
    if (!el) return;
    const applySize = () =>
      setDesktopSize({ w: el.clientWidth, h: el.clientHeight });
    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (desktopSize.h <= 0 || desktopSize.w <= 0 || desktopNodes.length === 0)
      return;

    if (desktopAutoAlign) {
      updateNodePositions(
        packDesktopZones(desktopNodes, desktopSize.w, desktopSize.h),
      );
      return;
    }

    // Even without auto-align: pull icons back when the viewport shrinks.
    updateNodePositions(
      fitOverflowIcons(
        desktopNodes,
        desktopSize.w,
        desktopSize.h,
        desktopAlignToGrid,
      ),
    );
    // Positions are applied from the render that changed names/flags/size.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    desktopAutoAlign,
    desktopAlignToGrid,
    desktopSize.h,
    desktopSize.w,
    iconNamesKey,
  ]);

  const handleDesktopClick = () => {
    // Close open tray menus
    closeSystemPanels();
    setContextMenu((prev) => ({ ...prev, visible: false }));
    setSelectedIcons([]); // Clear icon selection
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only show context menu if clicking the desktop background directly
    const target = e.target as HTMLElement;
    const isDesktopBackground =
      target.classList.contains("desktop-area") ||
      target.classList.contains("desktop-icons-container");

    if (isDesktopBackground) {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        type: "desktop",
      });
    }
  };

  const handleIconContextMenu = (x: number, y: number, name: string) => {
    setContextMenu({
      visible: true,
      x,
      y,
      type: "icon",
      targetNodeName: name,
    });
  };

  const handleIconSelect = (
    name: string,
    e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
  ) => {
    e.stopPropagation();
    // Close other open trays/menus but preserve icon selection
    closeSystemPanels();
    setContextMenu((prev) => ({ ...prev, visible: false }));
    if (e.ctrlKey || e.metaKey) {
      setSelectedIcons((current) =>
        current.includes(name)
          ? current.filter((item) => item !== name)
          : [...current, name],
      );
    } else {
      setSelectedIcons([name]);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      e.button !== 0 ||
      !(
        target.classList.contains("desktop-area") ||
        target.classList.contains("desktop-icons-container")
      )
    )
      return;

    setSelection({
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
    handleDesktopClick();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!selection.active) return;
    const nextCurrentX = e.clientX;
    const nextCurrentY = e.clientY;

    setSelection((prev) => ({
      ...prev,
      currentX: nextCurrentX,
      currentY: nextCurrentY,
    }));

    // Calculate marquee bounds relative to desktop element
    const rect = e.currentTarget.getBoundingClientRect();
    const marqueeX1 = Math.min(selection.startX, nextCurrentX) - rect.left;
    const marqueeY1 = Math.min(selection.startY, nextCurrentY) - rect.top;
    const marqueeX2 = Math.max(selection.startX, nextCurrentX) - rect.left;
    const marqueeY2 = Math.max(selection.startY, nextCurrentY) - rect.top;

    // Check intersection with all desktop nodes (96x106 px bounding box)
    const newlySelected = desktopNodes
      .filter((node) => {
        const x = node.x ?? DESKTOP_GRID.origin;
        const y = node.y ?? DESKTOP_GRID.origin;
        const iconWidth = DESKTOP_GRID.iconW;
        const iconHeight = DESKTOP_GRID.iconH;

        return !(
          x > marqueeX2 ||
          x + iconWidth < marqueeX1 ||
          y > marqueeY2 ||
          y + iconHeight < marqueeY1
        );
      })
      .map((node) => node.name);

    setSelectedIcons(newlySelected);
  };

  const handlePointerUp = () => {
    if (selection.active) {
      setSelection((prev) => ({ ...prev, active: false }));
    }
  };

  return (
    <div
      className={`desktop-area ${isRefreshing ? "refreshing" : ""}`}
      style={{ backgroundImage: `url(${wallpaper})` }}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="application"
      aria-label="Masaüstü"
    >
      {/* Selection Marquee Box */}
      {selection.active && (
        <div
          className="desktop-selection-marquee"
          style={{
            position: "absolute",
            left: `${Math.min(selection.startX, selection.currentX)}px`,
            top: `${Math.min(selection.startY, selection.currentY)}px`,
            width: `${Math.abs(selection.startX - selection.currentX)}px`,
            height: `${Math.abs(selection.startY - selection.currentY)}px`,
          }}
        />
      )}
      {/* Desktop Grid Icons */}
      <div
        className="desktop-icons-container"
        ref={iconsRef}
        role="listbox"
        aria-label="Masaüstü simgeleri"
        aria-multiselectable="true"
      >
        {desktopNodes.map((node) => (
          <DesktopIcon
            key={node.name}
            node={node}
            isSelected={selectedIcons.includes(node.name)}
            autoAlign={desktopAutoAlign}
            alignToGrid={desktopAlignToGrid}
            onSelect={(e) => handleIconSelect(node.name, e)}
            onIconContextMenu={handleIconContextMenu}
          />
        ))}
      </div>

      {/* Render open applications / windows */}
      {children}

      {/* Context Right Click Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          targetNodeName={contextMenu.targetNodeName}
          onClose={() =>
            setContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      )}
    </div>
  );
};

export default Desktop;
