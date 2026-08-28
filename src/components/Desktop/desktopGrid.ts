export const DESKTOP_GRID = {
  origin: 20,
  cellW: 100,
  cellH: 110,
  iconW: 96,
  iconH: 106,
  taskbarH: 48,
};

export type GridPoint = { x: number; y: number };

export type DesktopLayoutNode = {
  name: string;
  type?: string;
  appId?: string;
  x?: number;
  y?: number;
};

export function desktopInnerHeight(): number {
  if (typeof window === "undefined") return 720;
  return Math.max(DESKTOP_GRID.cellH + DESKTOP_GRID.origin, window.innerHeight - DESKTOP_GRID.taskbarH);
}

export function rowsForHeight(height: number): number {
  return Math.max(1, Math.floor((height - DESKTOP_GRID.origin) / DESKTOP_GRID.cellH));
}

export function slotAt(index: number, rows: number): GridPoint {
  const col = Math.floor(index / rows);
  const row = index % rows;
  return {
    x: DESKTOP_GRID.origin + col * DESKTOP_GRID.cellW,
    y: DESKTOP_GRID.origin + row * DESKTOP_GRID.cellH,
  };
}

export function snapToGrid(x: number, y: number): GridPoint {
  return {
    x:
      DESKTOP_GRID.origin +
      Math.round((x - DESKTOP_GRID.origin) / DESKTOP_GRID.cellW) *
        DESKTOP_GRID.cellW,
    y:
      DESKTOP_GRID.origin +
      Math.round((y - DESKTOP_GRID.origin) / DESKTOP_GRID.cellH) *
        DESKTOP_GRID.cellH,
  };
}

export function clampToDesktop(
  point: GridPoint,
  width: number,
  height: number,
): GridPoint {
  return {
    x: Math.max(
      DESKTOP_GRID.origin,
      Math.min(point.x, Math.max(DESKTOP_GRID.origin, width - DESKTOP_GRID.iconW)),
    ),
    y: Math.max(
      DESKTOP_GRID.origin,
      Math.min(point.y, Math.max(DESKTOP_GRID.origin, height - DESKTOP_GRID.iconH)),
    ),
  };
}

export function nextFreeSlot(
  occupied: Array<{ x?: number; y?: number }>,
  height = desktopInnerHeight(),
): GridPoint {
  const rows = rowsForHeight(height);
  // ponytail: 10k slot scan is enough for this desktop; if we ever host thousands of icons, index with a Set.
  for (let i = 0; i < 10000; i++) {
    const slot = slotAt(i, rows);
    if (!occupied.some((n) => n.x === slot.x && n.y === slot.y)) return slot;
  }
  return slotAt(0, rows);
}

export function packIcons<T extends { name: string; x?: number; y?: number }>(
  nodes: T[],
  height: number,
): Record<string, GridPoint> {
  const rows = rowsForHeight(height);
  const ordered = [...nodes].sort((a, b) => {
    const ac = Math.round(((a.x ?? DESKTOP_GRID.origin) - DESKTOP_GRID.origin) / DESKTOP_GRID.cellW);
    const ar = Math.round(((a.y ?? DESKTOP_GRID.origin) - DESKTOP_GRID.origin) / DESKTOP_GRID.cellH);
    const bc = Math.round(((b.x ?? DESKTOP_GRID.origin) - DESKTOP_GRID.origin) / DESKTOP_GRID.cellW);
    const br = Math.round(((b.y ?? DESKTOP_GRID.origin) - DESKTOP_GRID.origin) / DESKTOP_GRID.cellH);
    return ac - bc || ar - br;
  });
  const positions: Record<string, GridPoint> = {};
  ordered.forEach((node, i) => {
    positions[node.name] = slotAt(i, rows);
  });
  return positions;
}

const compareByCurrentGridPosition = <T extends { x?: number; y?: number }>(
  a: T,
  b: T,
) => {
  const ac = Math.round(
    ((a.x ?? DESKTOP_GRID.origin) - DESKTOP_GRID.origin) /
      DESKTOP_GRID.cellW,
  );
  const ar = Math.round(
    ((a.y ?? DESKTOP_GRID.origin) - DESKTOP_GRID.origin) /
      DESKTOP_GRID.cellH,
  );
  const bc = Math.round(
    ((b.x ?? DESKTOP_GRID.origin) - DESKTOP_GRID.origin) /
      DESKTOP_GRID.cellW,
  );
  const br = Math.round(
    ((b.y ?? DESKTOP_GRID.origin) - DESKTOP_GRID.origin) /
      DESKTOP_GRID.cellH,
  );
  return ac - bc || ar - br;
};

export type DesktopZone = "windows" | "custom" | "folders";

const WINDOWS_DESKTOP_APP_IDS = new Set([
  "explorer",
  "edge",
  "notepad",
  "calculator",
  "cmd",
  "settings",
  "paint",
  "minesweeper",
  "camera",
  "imageviewer",
  "store",
  "copilot",
  "taskmgr",
  "weather",
]);

export const desktopZoneFor = (node: DesktopLayoutNode): DesktopZone => {
  if (node.type === "dir" || node.type === "file") return "folders";
  if (
    node.type === "app" &&
    node.appId &&
    WINDOWS_DESKTOP_APP_IDS.has(node.appId)
  ) {
    return "windows";
  }
  return "custom";
};

function columnsForWidth(width: number): number {
  return Math.max(
    1,
    Math.floor(
      (width - DESKTOP_GRID.origin * 2 - DESKTOP_GRID.iconW) /
        DESKTOP_GRID.cellW,
    ) + 1,
  );
}

/** Shared right-side columns where custom (top) and folders (bottom) can stack. */
function stackedRightColumns(
  customCount: number,
  folderCount: number,
  rows: number,
): number | null {
  if (customCount === 0 && folderCount === 0) return 0;
  if (customCount === 0) return Math.ceil(folderCount / rows);
  if (folderCount === 0) return Math.ceil(customCount / rows);
  const limit = customCount + folderCount;
  for (let k = 1; k <= limit; k++) {
    if (
      Math.ceil(customCount / k) + Math.ceil(folderCount / k) <=
      rows
    ) {
      return k;
    }
  }
  return null;
}

function packRightBand<T extends { name: string }>(
  nodes: T[],
  columns: number,
  bandRows: number,
  startRow: number,
  positions: Record<string, GridPoint>,
) {
  if (bandRows <= 0) return;
  nodes.forEach((node, index) => {
    const colFromRight = Math.floor(index / bandRows);
    positions[node.name] = {
      x:
        DESKTOP_GRID.origin +
        (columns - 1 - colFromRight) * DESKTOP_GRID.cellW,
      y: DESKTOP_GRID.origin + (startRow + (index % bandRows)) * DESKTOP_GRID.cellH,
    };
  });
}

/**
 * Windows apps dock left; our apps pack top-right; folders pack bottom-right.
 * If the viewport cannot hold the three groups, they fall back to a linear pack.
 */
export function packDesktopZones<T extends DesktopLayoutNode>(
  nodes: T[],
  width: number,
  height: number,
): Record<string, GridPoint> {
  const rows = rowsForHeight(height);
  const columns = columnsForWidth(width);
  const windows = nodes
    .filter((node) => desktopZoneFor(node) === "windows")
    .sort(compareByCurrentGridPosition);
  const custom = nodes
    .filter((node) => desktopZoneFor(node) === "custom")
    .sort(compareByCurrentGridPosition);
  const folders = nodes
    .filter((node) => desktopZoneFor(node) === "folders")
    .sort(compareByCurrentGridPosition);

  const linearFallback = () => {
    const positions: Record<string, GridPoint> = {};
    [...windows, ...folders, ...custom].forEach((node, index) => {
      positions[node.name] = slotAt(index, rows);
    });
    return positions;
  };

  const windowsCols =
    windows.length === 0 ? 0 : Math.ceil(windows.length / rows);
  const positions: Record<string, GridPoint> = {};
  windows.forEach((node, index) => {
    positions[node.name] = slotAt(index, rows);
  });

  const stackedCols = stackedRightColumns(custom.length, folders.length, rows);
  if (stackedCols !== null && windowsCols + stackedCols <= columns) {
    const customH =
      custom.length === 0 ? 0 : Math.ceil(custom.length / Math.max(stackedCols, 1));
    const folderH =
      folders.length === 0 ? 0 : Math.ceil(folders.length / Math.max(stackedCols, 1));
    packRightBand(custom, columns, customH, 0, positions);
    packRightBand(folders, columns, folderH, rows - folderH, positions);
    return positions;
  }

  const customCols =
    custom.length === 0 ? 0 : Math.ceil(custom.length / rows);
  const folderCols =
    folders.length === 0 ? 0 : Math.ceil(folders.length / rows);
  if (windowsCols + customCols + folderCols <= columns) {
    const customH =
      custom.length === 0 ? 0 : Math.ceil(custom.length / Math.max(customCols, 1));
    const folderH =
      folders.length === 0 ? 0 : Math.ceil(folders.length / Math.max(folderCols, 1));
    packRightBand(custom, columns, customH, 0, positions);
    packRightBand(
      folders,
      columns - customCols,
      folderH,
      rows - folderH,
      positions,
    );
    return positions;
  }

  return linearFallback();
}

export function isOnDesktop(
  point: GridPoint,
  width: number,
  height: number,
): boolean {
  return (
    point.x >= DESKTOP_GRID.origin &&
    point.y >= DESKTOP_GRID.origin &&
    point.x + DESKTOP_GRID.iconW <= width &&
    point.y + DESKTOP_GRID.iconH <= height
  );
}

/** Keep on-screen icons; reflow anything past the desktop edge into free slots. */
export function fitOverflowIcons<T extends { name: string; x?: number; y?: number }>(
  nodes: T[],
  width: number,
  height: number,
  snap = false,
): Record<string, GridPoint> {
  const positions: Record<string, GridPoint> = {};
  const occupied: GridPoint[] = [];
  const overflow: T[] = [];

  for (const node of nodes) {
    let point = {
      x: node.x ?? DESKTOP_GRID.origin,
      y: node.y ?? DESKTOP_GRID.origin,
    };
    if (snap) point = snapToGrid(point.x, point.y);
    const taken = occupied.some((o) => o.x === point.x && o.y === point.y);
    if (!taken && isOnDesktop(point, width, height)) {
      positions[node.name] = point;
      occupied.push(point);
    } else {
      overflow.push(node);
    }
  }

  for (const node of overflow) {
    const point = clampToDesktop(nextFreeSlot(occupied, height), width, height);
    positions[node.name] = point;
    occupied.push(point);
  }

  return positions;
}

{
  const packed = packIcons(
    [
      { name: "b", x: 20, y: 130 },
      { name: "a", x: 20, y: 20 },
    ],
    240,
  );
  if (packed.a.x !== 20 || packed.a.y !== 20 || packed.b.x !== 20 || packed.b.y !== 130) {
    throw new Error("desktop icon pack layout is broken");
  }

  const fitted = fitOverflowIcons(
    [
      { name: "ok", x: 20, y: 20 },
      { name: "below", x: 20, y: 790 },
    ],
    800,
    400,
  );
  if (
    fitted.ok.x !== 20 ||
    fitted.ok.y !== 20 ||
    !isOnDesktop(fitted.below, 800, 400)
  ) {
    throw new Error("desktop overflow fit is broken");
  }

  const zoned = packDesktopZones(
    [
      { name: "Belgeler", type: "dir" },
      { name: "Chrome", type: "app", appId: "edge" },
      { name: "VS Code", type: "app", appId: "vscode" },
    ],
    800,
    240,
  );
  if (
    zoned.Chrome.x !== DESKTOP_GRID.origin ||
    zoned["VS Code"].x <= zoned.Chrome.x ||
    zoned.Belgeler.x <= zoned.Chrome.x ||
    zoned["VS Code"].y !== DESKTOP_GRID.origin ||
    zoned.Belgeler.y <= zoned["VS Code"].y
  ) {
    throw new Error("desktop zone layout is broken");
  }

  const tall = packDesktopZones(
    [
      { name: "Klasör", type: "dir" },
      { name: "Notepad", type: "app", appId: "notepad" },
      { name: "FDM", type: "app", appId: "fdm" },
    ],
    800,
    460,
  );
  if (
    tall.Notepad.x !== DESKTOP_GRID.origin ||
    tall.FDM.y !== DESKTOP_GRID.origin ||
    tall.Klasör.y <= tall.FDM.y ||
    tall.FDM.x <= tall.Notepad.x
  ) {
    throw new Error("desktop tall zone layout is broken");
  }

  const narrow = packDesktopZones(
    [
      { name: "Klasör", type: "dir" },
      { name: "Uygulama", type: "app", appId: "notepad" },
      { name: "Web", type: "shortcut", appId: "edge" },
    ],
    200,
    240,
  );
  const narrowSlots = new Set(
    Object.values(narrow).map((point) => `${point.x}:${point.y}`),
  );
  if (narrowSlots.size !== 3 || narrow.Uygulama.x !== DESKTOP_GRID.origin) {
    throw new Error("desktop narrow zone fallback is broken");
  }
}
