import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  desktopInnerHeight,
  nextFreeSlot,
} from "../components/Desktop/desktopGrid";
import {
  faviconUrl,
  readBrowserBookmarks,
  webShortcutName,
  type BrowserBookmark,
} from "../browserBookmarks";
import { userPath } from "../osUser";

const DESKTOP_PATH = userPath("Desktop");

export type NodeType = "file" | "dir" | "app" | "shortcut";

export interface VFSNode {
  name: string;
  type: NodeType;
  content?: string; // Text content for files
  appId?: string; // App key (e.g. 'notepad', 'edge') for shortcuts
  url?: string; // Target URL for browser shortcuts
  iconUrl?: string; // Optional favicon for browser shortcuts
  children?: { [name: string]: VFSNode }; // Subnodes for directories
  x?: number; // Custom desktop X coordinate (if located on Desktop)
  y?: number; // Custom desktop Y coordinate (if located on Desktop)
  updatedAt: string;
}

export interface FSContextType {
  fs: VFSNode;
  createFile: (
    path: string[],
    name: string,
    content?: string,
    appId?: string,
  ) => void;
  createDirectory: (path: string[], name: string) => void;
  createUniqueFile: (
    path: string[],
    name: string,
    content?: string,
    appId?: string,
  ) => string;
  createUniqueDirectory: (path: string[], name: string) => string;
  upsertWebShortcut: (name: string, url: string, iconUrl?: string) => void;
  renameNode: (path: string[], oldName: string, newName: string) => void;
  transferNode: (
    sourcePath: string[],
    name: string,
    destinationPath: string[],
    action: "copy" | "move",
  ) => void;
  deleteNode: (path: string[], name: string) => void;
  updateFileContent: (path: string[], name: string, content: string) => void;
  updateNodePosition: (name: string, x: number, y: number) => void;
  updateNodePositions: (positions: Record<string, { x: number; y: number }>) => void;
  getDesktopNodes: () => VFSNode[];
  getNodeByPath: (path: string[]) => VFSNode | null;
}

const FSContext = createContext<FSContextType | undefined>(undefined);

// Helper to clone VFS tree
const cloneTree = (node: VFSNode): VFSNode => {
  const cloned: VFSNode = { ...node };
  if (node.children) {
    cloned.children = {};
    for (const key in node.children) {
      cloned.children[key] = cloneTree(node.children[key]);
    }
  }
  return cloned;
};

const uniqueNodeName = (
  children: Record<string, VFSNode> | undefined,
  requestedName: string,
) => {
  if (!children?.[requestedName]) return requestedName;
  const dotIndex = requestedName.lastIndexOf(".");
  const hasExtension = dotIndex > 0;
  const stem = hasExtension ? requestedName.slice(0, dotIndex) : requestedName;
  const extension = hasExtension ? requestedName.slice(dotIndex) : "";
  let index = 2;
  let candidate = `${stem} (${index})${extension}`;
  while (children[candidate]) {
    index += 1;
    candidate = `${stem} (${index})${extension}`;
  }
  return candidate;
};

const pathsEqual = (left: string[], right: string[]) =>
  left.length === right.length &&
  left.every((segment, index) => segment === right[index]);

const pathStartsWith = (path: string[], prefix: string[]) =>
  path.length >= prefix.length &&
  prefix.every((segment, index) => segment === path[index]);

const getParentNode = (root: VFSNode, path: string[]): VFSNode | null => {
  let current = root;
  for (const segment of path) {
    if (!current.children?.[segment]) return null;
    current = current.children[segment];
  }
  return current;
};

const normalizeShortcutUrl = (value: string) => {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
};

const ensureBrowserShortcuts = (
  root: VFSNode,
  bookmarks: BrowserBookmark[],
) => {
  const desktop = getParentNode(root, DESKTOP_PATH);
  if (desktop?.type !== "dir") return;
  if (!desktop.children) desktop.children = {};

  for (const bookmark of bookmarks) {
    const url = normalizeShortcutUrl(bookmark.url);
    if (!url) continue;
    const existing = Object.values(desktop.children).find(
      (node) =>
        node.type === "shortcut" &&
        normalizeShortcutUrl(node.url || "") === url,
    );
    if (existing) {
      if (!existing.iconUrl) existing.iconUrl = faviconUrl(url);
      continue;
    }

    const requestedName = webShortcutName(bookmark.name, url);
    const finalName = uniqueNodeName(desktop.children, requestedName);
    const coords = nextFreeSlot(
      Object.values(desktop.children),
      desktopInnerHeight(),
    );
    desktop.children[finalName] = {
      name: finalName,
      type: "shortcut",
      appId: "edge",
      url,
      iconUrl: faviconUrl(url),
      ...coords,
      updatedAt: new Date().toISOString(),
    };
  }
};

// Default initial virtual file system structure
const initialFS: VFSNode = {
  name: "root",
  type: "dir",
  updatedAt: new Date().toISOString(),
  children: {
    "C:": {
      name: "C:",
      type: "dir",
      updatedAt: new Date().toISOString(),
      children: {
        Users: {
          name: "Users",
          type: "dir",
          updatedAt: new Date().toISOString(),
          children: {
            JohnDoe: {
              name: "JohnDoe",
              type: "dir",
              updatedAt: new Date().toISOString(),
              children: {
                Desktop: {
                  name: "Desktop",
                  type: "dir",
                  updatedAt: new Date().toISOString(),
                  children: {
                    "Bu Bilgisayar": {
                      name: "Bu Bilgisayar",
                      type: "app",
                      appId: "explorer",
                      x: 20,
                      y: 20,
                      updatedAt: new Date().toISOString(),
                    },
                    "Google Chrome": {
                      name: "Google Chrome",
                      type: "app",
                      appId: "edge",
                      x: 20,
                      y: 130,
                      updatedAt: new Date().toISOString(),
                    },
                    "Not Defteri": {
                      name: "Not Defteri",
                      type: "app",
                      appId: "notepad",
                      x: 20,
                      y: 240,
                      updatedAt: new Date().toISOString(),
                    },
                    "Hesap Makinesi": {
                      name: "Hesap Makinesi",
                      type: "app",
                      appId: "calculator",
                      x: 20,
                      y: 350,
                      updatedAt: new Date().toISOString(),
                    },
                    Terminal: {
                      name: "Terminal",
                      type: "app",
                      appId: "cmd",
                      x: 120,
                      y: 20,
                      updatedAt: new Date().toISOString(),
                    },
                    Ayarlar: {
                      name: "Ayarlar",
                      type: "app",
                      appId: "settings",
                      x: 120,
                      y: 130,
                      updatedAt: new Date().toISOString(),
                    },
                    "Geri Dönüşüm Kutusu": {
                      name: "Geri Dönüşüm Kutusu",
                      type: "app",
                      appId: "explorer",
                      x: 120,
                      y: 240,
                      updatedAt: new Date().toISOString(),
                    },
                    Belgeler: {
                      name: "Belgeler",
                      type: "dir",
                      children: {},
                      x: 220,
                      y: 20,
                      updatedAt: new Date().toISOString(),
                    },
                    İndirilenler: {
                      name: "İndirilenler",
                      type: "dir",
                      children: {},
                      x: 220,
                      y: 130,
                      updatedAt: new Date().toISOString(),
                    },
                    Resimler: {
                      name: "Resimler",
                      type: "dir",
                      children: {
                        "Doğa.png": {
                          name: "Doğa.png",
                          type: "file",
                          content:
                            "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1920&q=80",
                          updatedAt: new Date().toISOString(),
                        },
                      },
                      x: 220,
                      y: 240,
                      updatedAt: new Date().toISOString(),
                    },
                    "MS Paint": {
                      name: "MS Paint",
                      type: "app",
                      appId: "paint",
                      x: 320,
                      y: 130,
                      updatedAt: new Date().toISOString(),
                    },
                    "VS Code": {
                      name: "VS Code",
                      type: "app",
                      appId: "vscode",
                      x: 320,
                      y: 240,
                      updatedAt: new Date().toISOString(),
                    },
                    "Mayın Tarlası": {
                      name: "Mayın Tarlası",
                      type: "app",
                      appId: "minesweeper",
                      x: 320,
                      y: 350,
                      updatedAt: new Date().toISOString(),
                    },
                    Kamera: {
                      name: "Kamera",
                      type: "app",
                      appId: "camera",
                      x: 420,
                      y: 20,
                      updatedAt: new Date().toISOString(),
                    },
                    "Microsoft Store": {
                      name: "Microsoft Store",
                      type: "app",
                      appId: "store",
                      x: 420,
                      y: 130,
                      updatedAt: new Date().toISOString(),
                    },
                    "Windows Copilot": {
                      name: "Windows Copilot",
                      type: "app",
                      appId: "copilot",
                      x: 420,
                      y: 240,
                      updatedAt: new Date().toISOString(),
                    },
                    "Görev Yöneticisi": {
                      name: "Görev Yöneticisi",
                      type: "app",
                      appId: "taskmgr",
                      x: 420,
                      y: 350,
                      updatedAt: new Date().toISOString(),
                    },
                    "Hava Durumu": {
                      name: "Hava Durumu",
                      type: "app",
                      appId: "weather",
                      x: 520,
                      y: 20,
                      updatedAt: new Date().toISOString(),
                    },
                    "MSI BIOS": {
                      name: "MSI BIOS",
                      type: "app",
                      appId: "bios",
                      x: 520,
                      y: 130,
                      updatedAt: new Date().toISOString(),
                    },
                    "Free Download Manager": {
                      name: "Free Download Manager",
                      type: "app",
                      appId: "fdm",
                      x: 520,
                      y: 240,
                      updatedAt: new Date().toISOString(),
                    },
                    "Torrent İstemcisi": {
                      name: "Torrent İstemcisi",
                      type: "app",
                      appId: "torrent",
                      x: 520,
                      y: 350,
                      updatedAt: new Date().toISOString(),
                    },
                  },
                },
                Documents: {
                  name: "Documents",
                  type: "dir",
                  updatedAt: new Date().toISOString(),
                  children: {
                    "notlar.txt": {
                      name: "notlar.txt",
                      type: "file",
                      content:
                        "Geliştirilecekler:\n- Pencere yönetimi geliştirilecek [x]\n- LocalStorage entegrasyonu [x]\n- MSI Boot sekansı [x]",
                      updatedAt: new Date().toISOString(),
                    },
                  },
                },
                Downloads: {
                  name: "Downloads",
                  type: "dir",
                  updatedAt: new Date().toISOString(),
                  children: {},
                },
                Pictures: {
                  name: "Pictures",
                  type: "dir",
                  updatedAt: new Date().toISOString(),
                  children: {
                    "Doğa.png": {
                      name: "Doğa.png",
                      type: "file",
                      content:
                        "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1920&q=80",
                      updatedAt: new Date().toISOString(),
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const FSProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fs, setFs] = useState<VFSNode>(() => {
    const saved = localStorage.getItem("win11_vfs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Rename legacy home folders → JohnDoe
        const cDrive = parsed.children?.["C:"];
        const usersDir = cDrive?.children?.["Users"];
        for (const legacy of ["Mirus", "User"]) {
          if (usersDir?.children?.[legacy] && !usersDir.children["JohnDoe"]) {
            const node = usersDir.children[legacy];
            node.name = "JohnDoe";
            usersDir.children["JohnDoe"] = node;
            delete usersDir.children[legacy];
          } else if (usersDir?.children?.[legacy]) {
            delete usersDir.children[legacy];
          }
        }
        // Migration: Ensure 'MSI BIOS' and other new app icons are on the Desktop
        const desktopDir = usersDir?.children?.["JohnDoe"]?.children?.["Desktop"];
        if (desktopDir && desktopDir.children) {
          // Rename Edge Tarayıcı to Google Chrome if it exists
          if (desktopDir.children["Edge Tarayıcı"]) {
            const oldNode = desktopDir.children["Edge Tarayıcı"];
            oldNode.name = "Google Chrome";
            desktopDir.children["Google Chrome"] = oldNode;
            delete desktopDir.children["Edge Tarayıcı"];
          }
          // Remove unnecessary text files if they exist
          if (desktopDir.children["Beni Oku.txt"])
            delete desktopDir.children["Beni Oku.txt"];
          if (desktopDir.children["Yapılacaklar Listesi.txt"])
            delete desktopDir.children["Yapılacaklar Listesi.txt"];
          if (desktopDir.children["Sistem Notları.txt"])
            delete desktopDir.children["Sistem Notları.txt"];
          if (!desktopDir.children["Google Chrome"]) {
            desktopDir.children["Google Chrome"] = {
              name: "Google Chrome",
              type: "app",
              appId: "edge",
              x: 20,
              y: 130,
              updatedAt: new Date().toISOString(),
            };
          }
          if (!desktopDir.children["MSI BIOS"]) {
            desktopDir.children["MSI BIOS"] = {
              name: "MSI BIOS",
              type: "app",
              appId: "bios",
              x: 520,
              y: 130,
              updatedAt: new Date().toISOString(),
            };
          }
          if (!desktopDir.children["Görev Yöneticisi"]) {
            desktopDir.children["Görev Yöneticisi"] = {
              name: "Görev Yöneticisi",
              type: "app",
              appId: "taskmgr",
              x: 420,
              y: 350,
              updatedAt: new Date().toISOString(),
            };
          }
          if (!desktopDir.children["Free Download Manager"]) {
            desktopDir.children["Free Download Manager"] = {
              name: "Free Download Manager",
              type: "app",
              appId: "fdm",
              x: 520,
              y: 240,
              updatedAt: new Date().toISOString(),
            };
          }
          if (!desktopDir.children["Torrent İstemcisi"]) {
            desktopDir.children["Torrent İstemcisi"] = {
              name: "Torrent İstemcisi",
              type: "app",
              appId: "torrent",
              x: 520,
              y: 350,
              updatedAt: new Date().toISOString(),
            };
          }
        }
        ensureBrowserShortcuts(parsed, readBrowserBookmarks());
        return parsed;
      } catch (e) {
        console.error(
          "Error parsing VFS from localStorage, using initial layout",
          e,
        );
      }
    }
    const fresh = cloneTree(initialFS);
    ensureBrowserShortcuts(fresh, readBrowserBookmarks());
    return fresh;
  });
  const fsRef = useRef(fs);
  fsRef.current = fs;

  // Save VFS change to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("win11_vfs", JSON.stringify(fs));
    } catch (error) {
      console.error("VFS kaydedilemedi; depolama alanı dolmuş olabilir", error);
      window.dispatchEvent(new CustomEvent("vfs-storage-error"));
    }
  }, [fs]);

  // Find a specific node by path
  const getNodeByPath = useCallback(
    (path: string[]): VFSNode | null => getParentNode(fsRef.current, path),
    [],
  );

  // Create a file in a given directory path
  const createFile = (
    path: string[],
    name: string,
    content = "",
    appId?: string,
  ) => {
    setFs((prevFs) => {
      const newFs = cloneTree(prevFs);
      const parent = getParentNode(newFs, path);
      if (parent && parent.type === "dir") {
        if (!parent.children) parent.children = {};

        let coords: { x?: number; y?: number } = {};
        if (path[path.length - 1] === "Desktop") {
          coords = nextFreeSlot(Object.values(parent.children), desktopInnerHeight());
        }

        parent.children[name] = {
          name,
          type: appId ? "app" : "file",
          content,
          appId,
          ...coords,
          updatedAt: new Date().toISOString(),
        };
      }
      return newFs;
    });
  };

  // Create directory in path
  const createDirectory = (path: string[], name: string) => {
    setFs((prevFs) => {
      const newFs = cloneTree(prevFs);
      const parent = getParentNode(newFs, path);
      if (parent && parent.type === "dir") {
        if (!parent.children) parent.children = {};

        let coords: { x?: number; y?: number } = {};
        if (path[path.length - 1] === "Desktop") {
          coords = nextFreeSlot(Object.values(parent.children), desktopInnerHeight());
        }

        parent.children[name] = {
          name,
          type: "dir",
          children: {},
          ...coords,
          updatedAt: new Date().toISOString(),
        };
      }
      return newFs;
    });
  };

  const createUniqueFile = (
    path: string[],
    name: string,
    content = "",
    appId?: string,
  ) => {
    const parent = getParentNode(fs, path);
    const finalName = uniqueNodeName(parent?.children, name);
    createFile(path, finalName, content, appId);
    return finalName;
  };

  const createUniqueDirectory = (path: string[], name: string) => {
    const parent = getParentNode(fs, path);
    const finalName = uniqueNodeName(parent?.children, name);
    createDirectory(path, finalName);
    return finalName;
  };

  const upsertWebShortcut = useCallback(
    (name: string, rawUrl: string, requestedIconUrl?: string) => {
      const url = normalizeShortcutUrl(rawUrl);
      if (!url) return;

      setFs((prevFs) => {
        const desktop = getParentNode(prevFs, DESKTOP_PATH);
        if (desktop?.type !== "dir") return prevFs;
        const existing = Object.values(desktop.children || {}).find(
          (node) =>
            node.type === "shortcut" &&
            normalizeShortcutUrl(node.url || "") === url,
        );
        const iconUrl = requestedIconUrl || faviconUrl(url);

        if (existing) {
          if (existing.iconUrl === iconUrl && existing.appId === "edge") {
            return prevFs;
          }
          const newFs = cloneTree(prevFs);
          const nextDesktop = getParentNode(newFs, DESKTOP_PATH);
          const nextExisting = Object.values(nextDesktop?.children || {}).find(
            (node) =>
              node.type === "shortcut" &&
              normalizeShortcutUrl(node.url || "") === url,
          );
          if (!nextExisting) return prevFs;
          nextExisting.iconUrl = iconUrl;
          nextExisting.appId = "edge";
          nextExisting.updatedAt = new Date().toISOString();
          return newFs;
        }

        const newFs = cloneTree(prevFs);
        const nextDesktop = getParentNode(newFs, DESKTOP_PATH);
        if (nextDesktop?.type !== "dir") return prevFs;
        if (!nextDesktop.children) nextDesktop.children = {};
        const finalName = uniqueNodeName(
          nextDesktop.children,
          webShortcutName(name, url),
        );
        const coords = nextFreeSlot(
          Object.values(nextDesktop.children),
          desktopInnerHeight(),
        );
        nextDesktop.children[finalName] = {
          name: finalName,
          type: "shortcut",
          appId: "edge",
          url,
          iconUrl,
          ...coords,
          updatedAt: new Date().toISOString(),
        };
        return newFs;
      });
    },
    [],
  );

  const renameNode = (path: string[], oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setFs((prevFs) => {
      const newFs = cloneTree(prevFs);
      const parent = getParentNode(newFs, path);
      const source = parent?.children?.[oldName];
      if (!parent?.children || !source || parent.children[trimmed]) return prevFs;

      const renamed = cloneTree(source);
      renamed.name = trimmed;
      renamed.updatedAt = new Date().toISOString();
      parent.children[trimmed] = renamed;
      delete parent.children[oldName];
      return newFs;
    });
  };

  const transferNode = (
    sourcePath: string[],
    name: string,
    destinationPath: string[],
    action: "copy" | "move",
  ) => {
    if (action === "move" && pathsEqual(sourcePath, destinationPath)) return;
    setFs((prevFs) => {
      const newFs = cloneTree(prevFs);
      const sourceParent = getParentNode(newFs, sourcePath);
      const destination = getParentNode(newFs, destinationPath);
      const source = sourceParent?.children?.[name];
      if (
        !sourceParent?.children ||
        !source ||
        destination?.type !== "dir" ||
        (source.type === "dir" &&
          pathStartsWith(destinationPath, [...sourcePath, name]))
      ) {
        return prevFs;
      }

      if (!destination.children) destination.children = {};
      const finalName = uniqueNodeName(destination.children, name);
      const transferred = cloneTree(source);
      transferred.name = finalName;
      transferred.updatedAt = new Date().toISOString();

      if (destinationPath.at(-1) === "Desktop") {
        const coords = nextFreeSlot(
          Object.values(destination.children),
          desktopInnerHeight(),
        );
        transferred.x = coords.x;
        transferred.y = coords.y;
      } else {
        delete transferred.x;
        delete transferred.y;
      }

      destination.children[finalName] = transferred;
      if (action === "move") delete sourceParent.children[name];
      return newFs;
    });
  };

  // Delete folder or file
  const deleteNode = (path: string[], name: string) => {
    setFs((prevFs) => {
      const newFs = cloneTree(prevFs);
      const parent = getParentNode(newFs, path);
      if (parent && parent.children && parent.children[name]) {
        delete parent.children[name];
      }
      return newFs;
    });
  };

  // Update file content
  const updateFileContent = (path: string[], name: string, content: string) => {
    setFs((prevFs) => {
      const newFs = cloneTree(prevFs);
      const parent = getParentNode(newFs, path);
      if (parent && parent.children && parent.children[name]) {
        parent.children[name].content = content;
        parent.children[name].updatedAt = new Date().toISOString();
      }
      return newFs;
    });
  };

  // Update desktop icon position (drag-drop)
  const updateNodePosition = (name: string, x: number, y: number) => {
    updateNodePositions({ [name]: { x, y } });
  };

  const updateNodePositions = (
    positions: Record<string, { x: number; y: number }>,
  ) => {
    setFs((prevFs) => {
      const desktop = getParentNode(prevFs, DESKTOP_PATH);
      if (!desktop?.children) return prevFs;

      let changed = false;
      for (const name of Object.keys(positions)) {
        const node = desktop.children[name];
        const next = positions[name];
        if (node && (node.x !== next.x || node.y !== next.y)) {
          changed = true;
          break;
        }
      }
      if (!changed) return prevFs;

      const newFs = cloneTree(prevFs);
      const nextDesktop = getParentNode(newFs, DESKTOP_PATH);
      if (!nextDesktop?.children) return prevFs;
      const now = new Date().toISOString();
      for (const name of Object.keys(positions)) {
        const node = nextDesktop.children[name];
        const next = positions[name];
        if (node) {
          node.x = next.x;
          node.y = next.y;
          node.updatedAt = now;
        }
      }
      return newFs;
    });
  };

  const getDesktopNodes = useCallback((): VFSNode[] => {
    const desktop = getParentNode(fsRef.current, DESKTOP_PATH);
    if (desktop && desktop.children) {
      return Object.values(desktop.children);
    }
    return [];
  }, []);

  return (
    <FSContext.Provider
      value={{
        fs,
        createFile,
        createDirectory,
        createUniqueFile,
        createUniqueDirectory,
        upsertWebShortcut,
        renameNode,
        transferNode,
        deleteNode,
        updateFileContent,
        updateNodePosition,
        updateNodePositions,
        getDesktopNodes,
        getNodeByPath,
      }}
    >
      {children}
    </FSContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFS = () => {
  const context = useContext(FSContext);
  if (!context) throw new Error("useFS must be used within a FSProvider");
  return context;
};
