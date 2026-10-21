import type { VFSNode } from "../../context/FSContext";
import type { WindowParams } from "../../context/WindowContext";

type OpenApp = (appId: string, params?: WindowParams) => void;

/** Which app opens a file, by extension. */
export const fileAppId = (name: string) =>
  /\.(png|jpe?g|gif|webp)$/i.test(name)
    ? "imageviewer"
    : /\.(html|css|jsx?|tsx?|json)$/i.test(name)
      ? "vscode"
      : "notepad";

/** The computer icon is an Explorer entry; the recycle bin is one too. */
export const isThisPCNode = (node: VFSNode) =>
  node.type === "app" && node.appId === "explorer" && !/geri/i.test(node.name);

/** Double-click / "Aç" for an item that lives at `path`. */
export const openNode = (node: VFSNode, path: string[], openApp: OpenApp) => {
  if (node.type === "shortcut") {
    openApp("edge", { url: node.url || "https://www.google.com" });
  } else if (node.type === "app") {
    openApp(
      node.appId || "explorer",
      isThisPCNode(node) ? { initialPath: ["Bu Bilgisayar"] } : undefined,
    );
  } else if (node.type === "file") {
    openApp(fileAppId(node.name), {
      fileName: node.name,
      content: node.content || "",
      filePath: path,
    });
  } else if (node.type === "dir") {
    openApp("explorer", { initialPath: [...path, node.name] });
  }
};
