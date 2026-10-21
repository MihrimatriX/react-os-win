import { describe, expect, it } from "vitest";
import { buildTaskbarEntries } from "./taskbarEntries";

const nameOf = (id: string) => `App:${id}`;

describe("buildTaskbarEntries", () => {
  it("shows a launch button for pinned apps with no windows", () => {
    const entries = buildTaskbarEntries(["edge", "notepad"], [], nameOf);
    expect(entries).toEqual([
      { kind: "launch", appId: "edge", name: "App:edge" },
      { kind: "launch", appId: "notepad", name: "App:notepad" },
    ]);
  });

  it("combines by default: one button per appId with all windowIds", () => {
    const entries = buildTaskbarEntries(
      ["edge"],
      [
        { id: "edge:1", appId: "edge", title: "Chrome A" },
        { id: "edge:2", appId: "edge", title: "Chrome B" },
      ],
      nameOf,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({
      kind: "running",
      appId: "edge",
      name: "App:edge",
      windowIds: ["edge:1", "edge:2"],
      titles: ["Chrome A", "Chrome B"],
    });
    expect(entries.some((e) => e.kind === "launch")).toBe(false);
  });

  it("single open window still yields one combined running entry", () => {
    const entries = buildTaskbarEntries(
      ["edge"],
      [{ id: "edge:1", appId: "edge", title: "Chrome A" }],
      nameOf,
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].kind).toBe("running");
    if (entries[0].kind === "running") {
      expect(entries[0].windowIds).toEqual(["edge:1"]);
    }
  });

  it("appends running unpinned apps after pinned", () => {
    const entries = buildTaskbarEntries(
      ["explorer"],
      [{ id: "taskmgr:1", appId: "taskmgr", title: "Task Manager" }],
      nameOf,
    );
    expect(entries.map((e) => e.appId)).toEqual(["explorer", "taskmgr"]);
  });
});
