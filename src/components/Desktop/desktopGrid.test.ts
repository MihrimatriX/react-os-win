import { describe, expect, it } from "vitest";
import {
  DESKTOP_GRID,
  fitOverflowIcons,
  isOnDesktop,
  packDesktopZones,
} from "./desktopGrid";

describe("desktopGrid", () => {
  it("fits overflow icons onto the desktop", () => {
    const fitted = fitOverflowIcons(
      [
        { name: "ok", x: 20, y: 20 },
        { name: "below", x: 20, y: 790 },
      ],
      800,
      400,
    );
    expect(fitted.ok).toEqual({ x: 20, y: 20 });
    expect(isOnDesktop(fitted.below, 800, 400)).toBe(true);
  });

  it("packs windows left, custom top-right, folders bottom-right", () => {
    const zoned = packDesktopZones(
      [
        { name: "Belgeler", type: "dir" },
        { name: "Chrome", type: "app", appId: "edge" },
        { name: "VS Code", type: "app", appId: "vscode" },
      ],
      800,
      240,
    );
    expect(zoned.Chrome.x).toBe(DESKTOP_GRID.origin);
    expect(zoned["VS Code"].x).toBeGreaterThan(zoned.Chrome.x);
    expect(zoned.Belgeler.x).toBeGreaterThan(zoned.Chrome.x);
    expect(zoned["VS Code"].y).toBe(DESKTOP_GRID.origin);
    expect(zoned.Belgeler.y).toBeGreaterThan(zoned["VS Code"].y);
  });

  it("stacks custom above folders on tall desktops", () => {
    const tall = packDesktopZones(
      [
        { name: "Klasör", type: "dir" },
        { name: "Notepad", type: "app", appId: "notepad" },
        { name: "FDM", type: "app", appId: "fdm" },
      ],
      800,
      460,
    );
    expect(tall.Notepad.x).toBe(DESKTOP_GRID.origin);
    expect(tall.FDM.y).toBe(DESKTOP_GRID.origin);
    expect(tall.Klasör.y).toBeGreaterThan(tall.FDM.y);
    expect(tall.FDM.x).toBeGreaterThan(tall.Notepad.x);
  });

  it("falls back to linear pack when the viewport is too narrow", () => {
    const narrow = packDesktopZones(
      [
        { name: "Klasör", type: "dir" },
        { name: "Uygulama", type: "app", appId: "notepad" },
        { name: "Web", type: "shortcut", appId: "edge" },
      ],
      200,
      240,
    );
    const slots = new Set(
      Object.values(narrow).map((point) => `${point.x}:${point.y}`),
    );
    expect(slots.size).toBe(3);
    expect(narrow.Uygulama.x).toBe(DESKTOP_GRID.origin);
  });
});
