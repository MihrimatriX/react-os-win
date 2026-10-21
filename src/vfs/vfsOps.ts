import type { VFSNode } from "../context/FSContext";

// ponytail: plain JSON tree only; swap if VFS ever holds non-cloneable refs
export const cloneTree = (node: VFSNode): VFSNode => structuredClone(node);

export const uniqueNodeName = (
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

export const getParentNode = (root: VFSNode, path: string[]): VFSNode | null => {
  let current = root;
  for (const segment of path) {
    if (!current.children?.[segment]) return null;
    current = current.children[segment];
  }
  return current;
};

/** Pure create — returns the same reference if the parent is missing or the
 * name is taken (never overwrites; use updateFileContent for that). */
export const createNodeInTree = (
  root: VFSNode,
  path: string[],
  node: VFSNode,
): VFSNode => {
  const target = getParentNode(root, path);
  if (target?.type !== "dir" || target.children?.[node.name]) return root;
  const next = cloneTree(root);
  const parent = getParentNode(next, path)!;
  if (!parent.children) parent.children = {};
  parent.children[node.name] = node;
  return next;
};

/** Pure rename — no-op if missing, empty name, or collision. */
export const renameNodeInTree = (
  root: VFSNode,
  path: string[],
  oldName: string,
  newName: string,
): VFSNode => {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return root;
  const next = cloneTree(root);
  const parent = getParentNode(next, path);
  const source = parent?.children?.[oldName];
  if (!parent?.children || !source || parent.children[trimmed]) return root;
  const renamed = cloneTree(source);
  renamed.name = trimmed;
  renamed.updatedAt = new Date().toISOString();
  parent.children[trimmed] = renamed;
  delete parent.children[oldName];
  return next;
};

export const makeEmptyRoot = (): VFSNode => ({
  name: "root",
  type: "dir",
  updatedAt: new Date().toISOString(),
  children: {
    Desktop: {
      name: "Desktop",
      type: "dir",
      children: {},
      updatedAt: new Date().toISOString(),
    },
  },
});
