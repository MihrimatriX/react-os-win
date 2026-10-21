import { describe, expect, it } from "vitest";
import {
  createNodeInTree,
  makeEmptyRoot,
  renameNodeInTree,
  uniqueNodeName,
} from "./vfsOps";

describe("vfsOps", () => {
  it("creates a file under Desktop", () => {
    const root = makeEmptyRoot();
    const next = createNodeInTree(root, ["Desktop"], {
      name: "not.txt",
      type: "file",
      content: "hello",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(next.children?.Desktop.children?.["not.txt"]?.content).toBe("hello");
    expect(root.children?.Desktop.children?.["not.txt"]).toBeUndefined();
  });

  it("never overwrites an existing node (e.g. `mkdir Desktop`)", () => {
    const root = createNodeInTree(makeEmptyRoot(), ["Desktop"], {
      name: "a.txt",
      type: "file",
      content: "keep",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const same = createNodeInTree(root, [], {
      name: "Desktop",
      type: "dir",
      children: {},
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(same).toBe(root);
    expect(same.children?.Desktop.children?.["a.txt"]?.content).toBe("keep");
  });

  it("renames a node without colliding", () => {
    let root = makeEmptyRoot();
    root = createNodeInTree(root, ["Desktop"], {
      name: "eski.txt",
      type: "file",
      content: "x",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const renamed = renameNodeInTree(root, ["Desktop"], "eski.txt", "yeni.txt");
    expect(renamed.children?.Desktop.children?.["yeni.txt"]?.name).toBe(
      "yeni.txt",
    );
    expect(renamed.children?.Desktop.children?.["eski.txt"]).toBeUndefined();
  });

  it("generates unique names for collisions", () => {
    const children = {
      "rapor.txt": {
        name: "rapor.txt",
        type: "file" as const,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    };
    expect(uniqueNodeName(children, "rapor.txt")).toBe("rapor (2).txt");
  });
});
