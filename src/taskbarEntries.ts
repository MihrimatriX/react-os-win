export interface TaskbarWindowLike {
  id: string;
  appId: string;
  title: string;
}

export type TaskbarEntry =
  | { kind: "launch"; appId: string; name: string }
  | {
      kind: "running";
      appId: string;
      name: string;
      /** All open windows for this app — combine-by-default (one icon). */
      windowIds: string[];
      titles: string[];
    };

/**
 * Build taskbar app buttons (Win11 combine-by-default).
 * - Pinned apps with no open windows → one launch button
 * - Any open windows for an appId → exactly ONE button with windowIds[]
 * Running unpinned apps appear after pinned ones.
 */
export function buildTaskbarEntries(
  pinnedAppIds: string[],
  windows: TaskbarWindowLike[],
  resolveName: (appId: string) => string,
): TaskbarEntry[] {
  const order: string[] = [];
  const seen = new Set<string>();
  for (const id of pinnedAppIds) {
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  for (const win of windows) {
    if (!seen.has(win.appId)) {
      seen.add(win.appId);
      order.push(win.appId);
    }
  }

  const entries: TaskbarEntry[] = [];
  for (const appId of order) {
    const appWindows = windows.filter((w) => w.appId === appId);
    const name = resolveName(appId);
    if (appWindows.length === 0) {
      entries.push({ kind: "launch", appId, name });
      continue;
    }
    entries.push({
      kind: "running",
      appId,
      name,
      windowIds: appWindows.map((w) => w.id),
      titles: appWindows.map((w) => w.title || name),
    });
  }
  return entries;
}
