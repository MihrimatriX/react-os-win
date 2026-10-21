import { describe, expect, it } from "vitest";
import {
  createEmptyWindowState,
  windowReducer,
} from "../context/WindowContext";

const AREA = { width: 1200, height: 752 };

describe("windowReducer", () => {
  it("opens a window and sets it active", () => {
    const state = windowReducer(createEmptyWindowState(), {
      type: "open",
      appId: "notepad",
      id: "notepad:test-1",
      area: AREA,
    });
    expect(state.windows).toHaveLength(1);
    expect(state.windows[0].appId).toBe("notepad");
    expect(state.windows[0].isMinimized).toBe(false);
    expect(state.activeWindowId).toBe("notepad:test-1");
  });

  it("closes the active window and clears active id when empty", () => {
    const opened = windowReducer(createEmptyWindowState(), {
      type: "open",
      appId: "explorer",
      id: "explorer:1",
      area: AREA,
    });
    const closed = windowReducer(opened, { type: "close", id: "explorer:1" });
    expect(closed.windows).toHaveLength(0);
    expect(closed.activeWindowId).toBeNull();
  });

  it("snaps a window to the left half", () => {
    const opened = windowReducer(createEmptyWindowState(), {
      type: "open",
      appId: "settings",
      id: "settings:1",
      area: AREA,
    });
    const snapped = windowReducer(opened, {
      type: "snap",
      id: "settings:1",
      layout: "left-half",
      area: AREA,
    });
    const win = snapped.windows[0];
    expect(win.snapLayout).toBe("left-half");
    expect(win.x).toBe(0);
    expect(win.width).toBe(Math.round(AREA.width / 2));
    expect(win.height).toBe(AREA.height);
    expect(win.isMaximized).toBe(false);
  });

  it("keys Notepad windows by exact path, including Turkish letters", () => {
    const open = (state: ReturnType<typeof createEmptyWindowState>, id: string, fileName: string) =>
      windowReducer(state, {
        type: "open",
        appId: "notepad",
        id,
        area: AREA,
        params: { fileName, filePath: ["Desktop"] },
      });
    let state = open(createEmptyWindowState(), "n:1", "Doğa.txt");
    state = open(state, "n:2", "Doça.txt");
    state = open(state, "n:3", "doğa.txt");
    expect(state.windows.map((w) => w.id)).toEqual(["n:1", "n:2", "n:3"]);
    const paramsBefore = state.windows[0].params;
    state = open(state, "n:4", "Doğa.txt");
    expect(state.windows).toHaveLength(3);
    expect(state.activeWindowId).toBe("n:1");
    // Same object → Notepad's [params] effect doesn't reload over unsaved edits.
    expect(state.windows[0].params).toBe(paramsBefore);
  });

  it("opens multiple Chrome (edge) windows with distinct ids", () => {
    const first = windowReducer(createEmptyWindowState(), {
      type: "open",
      appId: "edge",
      id: "edge:1",
      area: AREA,
      params: { url: "https://example.com/a" },
    });
    const second = windowReducer(first, {
      type: "open",
      appId: "edge",
      id: "edge:2",
      area: AREA,
      params: { url: "https://example.com/b" },
    });
    expect(second.windows).toHaveLength(2);
    expect(second.windows.map((w) => w.id)).toEqual(["edge:1", "edge:2"]);
    expect(second.activeWindowId).toBe("edge:2");
  });
});
