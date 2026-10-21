import { describe, expect, it } from "vitest";
import { fileAppId, isThisPCNode } from "./openNode";

describe("openNode", () => {
  it("picks one app per extension everywhere", () => {
    expect(fileAppId("Doğa.PNG")).toBe("imageviewer");
    expect(fileAppId("index.html")).toBe("vscode");
    expect(fileAppId("data.json")).toBe("vscode");
    expect(fileAppId("notlar.txt")).toBe("notepad");
    expect(fileAppId("README")).toBe("notepad");
  });

  it("tells This PC apart from the recycle bin", () => {
    const at = "2026-01-01T00:00:00.000Z";
    expect(isThisPCNode({ name: "Bu Bilgisayar", type: "app", appId: "explorer", updatedAt: at })).toBe(true);
    expect(isThisPCNode({ name: "Geri Dönüşüm Kutusu", type: "app", appId: "explorer", updatedAt: at })).toBe(false);
    expect(isThisPCNode({ name: "Belgeler", type: "dir", updatedAt: at })).toBe(false);
  });
});
