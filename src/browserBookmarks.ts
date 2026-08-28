export interface BrowserBookmark {
  name: string;
  url: string;
}

export const CHROME_BOOKMARKS_STORAGE_KEY = "win11_chrome_bookmarks";

export const DEFAULT_BROWSER_BOOKMARKS: BrowserBookmark[] = [
  { name: "React Shop", url: "https://react-shop.ahmetfuzunkaya.com/" },
  { name: "AW Component", url: "https://aw-component.ahmetfuzunkaya.com/" },
  { name: "TKM", url: "https://tkm.ahmetfuzunkaya.com/" },
  {
    name: "Easy Pomodoro",
    url: "https://easy-pomodoro.ahmetfuzunkaya.com/",
  },
  { name: "Vid Report", url: "https://vid-report.ahmetfuzunkaya.com/" },
];

const isWebUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const normalizeBookmark = (value: unknown): BrowserBookmark | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<BrowserBookmark>;
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const url = typeof candidate.url === "string" ? candidate.url.trim() : "";
  if (!name || !isWebUrl(url)) return null;
  return { name, url };
};

export const readBrowserBookmarks = (): BrowserBookmark[] => {
  if (typeof window === "undefined") return [...DEFAULT_BROWSER_BOOKMARKS];
  const saved = window.localStorage.getItem(CHROME_BOOKMARKS_STORAGE_KEY);
  if (!saved) return [...DEFAULT_BROWSER_BOOKMARKS];

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [...DEFAULT_BROWSER_BOOKMARKS];
    const bookmarks = parsed
      .map(normalizeBookmark)
      .filter((bookmark): bookmark is BrowserBookmark => bookmark !== null);
    return bookmarks;
  } catch {
    return [...DEFAULT_BROWSER_BOOKMARKS];
  }
};

export const faviconUrl = (pageUrl: string) => {
  try {
    const host = new URL(pageUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return "";
  }
};

export const webShortcutName = (name: string, url: string) => {
  const trimmed = name.trim();
  if (trimmed) return trimmed;
  try {
    return new URL(url).hostname.replace(/^www\./, "") || "Web Kısayolu";
  } catch {
    return "Web Kısayolu";
  }
};
