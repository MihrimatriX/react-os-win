export interface BrowserBookmark {
  name: string;
  url: string;
}

export const CHROME_BOOKMARKS_STORAGE_KEY = "win11_chrome_bookmarks";
/** Default bookmark keys already offered once; removed defaults stay removed. */
export const CHROME_SEEN_DEFAULTS_STORAGE_KEY = "win11_chrome_bookmarks_seen_defaults";

const PAGES = "https://mihrimatrix.github.io";

export const DEFAULT_BROWSER_BOOKMARKS: BrowserBookmark[] = [
  { name: "React Shop", url: `${PAGES}/react-shop/` },
  { name: "AW Component", url: `${PAGES}/awesome-web-components/` },
  { name: "TKM", url: "https://tkm.ahmetfuzunkaya.com/" },
  { name: "Easy Pomodoro", url: `${PAGES}/easy-pomodoro/` },
  { name: "Vid Report", url: "https://vid-report.ahmetfuzunkaya.com/" },
  { name: "Murat Yelol", url: "https://www.muratyelol.com/" },
  { name: "Ecrin Su Arıtma", url: "https://www.ecrinsuaritma.com/" },
  { name: "Windows 11 OS", url: "https://win11-react.ahmetfuzunkaya.com/" },
  { name: "Element API", url: "https://element-api.ahmetfuzunkaya.com/" },
  { name: "Spider Solitaire", url: `${PAGES}/react-spider-solitaire/` },
  { name: "Rick and Morty", url: `${PAGES}/react-rick-and-morty/` },
  { name: "Film Review", url: `${PAGES}/film-review-movie/` },
  {
    name: "Photon Engine",
    url: "https://github.com/MihrimatriX/photon-engine",
  },
  { name: "Windows XP", url: `${PAGES}/xp-clone-react/` },
  { name: "macOS Tahoe", url: `${PAGES}/macos-clone-react/` },
  { name: "Ubuntu 24.04", url: `${PAGES}/ubuntu-react/` },
  { name: "Windows 8.1 Metro", url: `${PAGES}/win8-metro/` },
  { name: "WebDroid", url: `${PAGES}/android-react/` },
  { name: "iPhone Clone", url: `${PAGES}/iphone-clone-react/` },
  { name: "AFU Console", url: `${PAGES}/ps5-showcase/` },
  { name: "AFU Coming Soon", url: `${PAGES}/afu-coming-soon/` },
  { name: "IPTV Player", url: `${PAGES}/iptv-react/` },
  { name: "Temp Shop", url: `${PAGES}/Temp-Shop/` },
  { name: "Bookmark Manager", url: `${PAGES}/bookmark-editor-save/` },
  { name: "Fluxer", url: `${PAGES}/fluxer-download-manager/` },
  { name: "Nuvora Player", url: `${PAGES}/nuvora-media-player/` },
  { name: "Glance", url: `${PAGES}/glance-image-viewer/` },
  { name: "Inlay Disc Studio", url: `${PAGES}/inlay-disc-studio/` },
  { name: "Backend .NET", url: `${PAGES}/backend-dotnet/` },
  { name: "Backend Spring", url: `${PAGES}/backend-spring/` },
  { name: "Social Media API", url: `${PAGES}/demo-social-media-api/` },
  { name: "Arr Stack", url: `${PAGES}/arr-stack/` },
  { name: "DEV Projects", url: `${PAGES}/projects/` },
];

/** Old custom subdomains that moved to GitHub Pages (normalized key -> new URL). */
export const LEGACY_URLS: Record<string, string> = {
  "https://react-shop.ahmetfuzunkaya.com": `${PAGES}/react-shop/`,
  "https://aw-component.ahmetfuzunkaya.com": `${PAGES}/awesome-web-components/`,
  "https://easy-pomodoro.ahmetfuzunkaya.com": `${PAGES}/easy-pomodoro/`,
  "https://spider-solitaire.ahmetfuzunkaya.com": `${PAGES}/react-spider-solitaire/`,
  "https://rick-morty.ahmetfuzunkaya.com": `${PAGES}/react-rick-and-morty/`,
  "https://filmrev-movie.ahmetfuzunkaya.com": `${PAGES}/film-review-movie/`,
};

/**
 * Rewrite a saved URL that points at a moved project to its new home, so
 * visitors with old localStorage don't get the project twice.
 */
export const migrateLegacyUrl = (url: string): string =>
  LEGACY_URLS[bookmarkKey(url)] ?? url;

/**
 * Lookup key for per-project assets: hostname, plus the repo segment on
 * *.github.io where every project shares one host.
 */
export const siteKey = (pageUrl: string): string => {
  try {
    const u = new URL(pageUrl);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (!host.endsWith(".github.io")) return host;
    const repo = u.pathname.split("/").filter(Boolean)[0];
    return repo ? `${host}/${repo.toLowerCase()}` : host;
  } catch {
    return "";
  }
};

/** Local project favicons under public/icons/projects/ (real site icons). Key: siteKey. */
export const PROJECT_FAVICON_BY_SITE: Record<string, string> = {
  "mihrimatrix.github.io/react-shop": `${import.meta.env.BASE_URL}icons/projects/react-shop.svg`,
  "mihrimatrix.github.io/awesome-web-components": `${import.meta.env.BASE_URL}icons/projects/aw-component.svg`,
  "tkm.ahmetfuzunkaya.com": `${import.meta.env.BASE_URL}icons/projects/tkm.svg`,
  "mihrimatrix.github.io/easy-pomodoro": `${import.meta.env.BASE_URL}icons/projects/easy-pomodoro.svg`,
  "vid-report.ahmetfuzunkaya.com": `${import.meta.env.BASE_URL}icons/projects/vid-report.svg`,
  "muratyelol.com": `${import.meta.env.BASE_URL}icons/projects/muratyelol.svg`,
  "ecrinsuaritma.com": `${import.meta.env.BASE_URL}icons/projects/ecrinsuaritma.svg`,
  "win11-react.ahmetfuzunkaya.com": `${import.meta.env.BASE_URL}icons/projects/react-os-win.svg`,
  "element-api.ahmetfuzunkaya.com": `${import.meta.env.BASE_URL}icons/projects/element-api.svg`,
  "mihrimatrix.github.io/react-spider-solitaire": `${import.meta.env.BASE_URL}icons/projects/spider-solitaire.svg`,
  "mihrimatrix.github.io/react-rick-and-morty": `${import.meta.env.BASE_URL}icons/projects/rick-morty.svg`,
  "mihrimatrix.github.io/film-review-movie": `${import.meta.env.BASE_URL}icons/projects/filmrev-movie.svg`,
  "mihrimatrix.github.io/xp-clone-react": `${import.meta.env.BASE_URL}icons/projects/xp-clone-react.svg`,
  "mihrimatrix.github.io/macos-clone-react": `${import.meta.env.BASE_URL}icons/projects/macos-clone-react.svg`,
  "mihrimatrix.github.io/ubuntu-react": `${import.meta.env.BASE_URL}icons/projects/ubuntu-react.svg`,
  "mihrimatrix.github.io/win8-metro": `${import.meta.env.BASE_URL}icons/projects/win8-metro.svg`,
  "mihrimatrix.github.io/android-react": `${import.meta.env.BASE_URL}icons/projects/android-react.svg`,
  "mihrimatrix.github.io/afu-coming-soon": `${import.meta.env.BASE_URL}icons/projects/afu-coming-soon.svg`,
  "mihrimatrix.github.io/iptv-react": `${import.meta.env.BASE_URL}icons/projects/iptv-react.svg`,
  "mihrimatrix.github.io/temp-shop": `${import.meta.env.BASE_URL}icons/projects/temp-shop.ico`,
  "mihrimatrix.github.io/bookmark-editor-save": `${import.meta.env.BASE_URL}icons/projects/bookmark-editor-save.png`,
  "mihrimatrix.github.io/fluxer-download-manager": `${import.meta.env.BASE_URL}icons/projects/fluxer-download-manager.png`,
  "mihrimatrix.github.io/nuvora-media-player": `${import.meta.env.BASE_URL}icons/projects/nuvora-media-player.png`,
  "mihrimatrix.github.io/glance-image-viewer": `${import.meta.env.BASE_URL}icons/projects/glance-image-viewer.svg`,
  "mihrimatrix.github.io/inlay-disc-studio": `${import.meta.env.BASE_URL}icons/projects/inlay-disc-studio.ico`,
  "mihrimatrix.github.io/projects": `${import.meta.env.BASE_URL}icons/projects/projects.svg`,
};

/** Favicons for GitHub-primary projects (owner/repo lowercase). */
export const PROJECT_FAVICON_BY_GITHUB_REPO: Record<string, string> = {
  "mihrimatrix/photon-engine": `${import.meta.env.BASE_URL}icons/projects/photon-engine.svg`,
};

const isWebUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const bookmarkKey = (url: string) =>
  url.trim().replace(/\/$/, "").toLowerCase();

/** owner/repo lowercase when URL is a GitHub repository page. */
export const githubRepoKey = (pageUrl: string): string => {
  try {
    const u = new URL(pageUrl);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "github.com") return "";
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return "";
    return `${parts[0]}/${parts[1]}`.toLowerCase();
  } catch {
    return "";
  }
};

const normalizeBookmark = (value: unknown): BrowserBookmark | null => {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<BrowserBookmark>;
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const url =
    typeof candidate.url === "string" ? migrateLegacyUrl(candidate.url.trim()) : "";
  if (!name || !isWebUrl(url)) return null;
  return { name, url };
};

/**
 * Keep user-saved bookmarks, then append DEFAULT entries missing by URL that
 * were never offered before (`seenDefaultKeys`). Fixes stale localStorage hiding
 * newly added portfolio sites (e.g. Murat Yelol) without resurrecting removed ones.
 */
export const mergeDefaultBookmarks = (
  saved: BrowserBookmark[],
  seenDefaultKeys: ReadonlySet<string> = new Set(),
): BrowserBookmark[] => {
  const result: BrowserBookmark[] = [];
  const seen = new Set<string>();

  for (const bookmark of saved) {
    const key = bookmarkKey(bookmark.url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(bookmark);
  }

  for (const def of DEFAULT_BROWSER_BOOKMARKS) {
    const key = bookmarkKey(def.url);
    if (!key || seen.has(key) || seenDefaultKeys.has(key)) continue;
    seen.add(key);
    result.push(def);
  }

  return result;
};

export const readSeenDefaultKeys = (): Set<string> => {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(CHROME_SEEN_DEFAULTS_STORAGE_KEY) ?? "[]",
    );
    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((key): key is string => typeof key === "string")
        : [],
    );
  } catch {
    return new Set();
  }
};

/** Defaults never offered yet — the only ones that may get an automatic desktop shortcut. */
export const unseenDefaultBookmarks = (): BrowserBookmark[] =>
  mergeDefaultBookmarks([], readSeenDefaultKeys());

/** Persist bookmarks and mark every current default as offered. */
export const saveBrowserBookmarks = (bookmarks: BrowserBookmark[]) => {
  window.localStorage.setItem(
    CHROME_BOOKMARKS_STORAGE_KEY,
    JSON.stringify(bookmarks),
  );
  window.localStorage.setItem(
    CHROME_SEEN_DEFAULTS_STORAGE_KEY,
    JSON.stringify(DEFAULT_BROWSER_BOOKMARKS.map((b) => bookmarkKey(b.url))),
  );
};

export const readBrowserBookmarks = (): BrowserBookmark[] => {
  if (typeof window === "undefined") {
    return [...DEFAULT_BROWSER_BOOKMARKS];
  }
  const saved = window.localStorage.getItem(CHROME_BOOKMARKS_STORAGE_KEY);
  if (!saved) return [...DEFAULT_BROWSER_BOOKMARKS];

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [...DEFAULT_BROWSER_BOOKMARKS];
    const bookmarks = parsed
      .map(normalizeBookmark)
      .filter((bookmark): bookmark is BrowserBookmark => bookmark !== null);
    return mergeDefaultBookmarks(bookmarks, readSeenDefaultKeys());
  } catch {
    return [...DEFAULT_BROWSER_BOOKMARKS];
  }
};

export const faviconUrl = (pageUrl: string) => {
  try {
    const host = new URL(pageUrl).hostname.replace(/^www\./, "").toLowerCase();
    const local = PROJECT_FAVICON_BY_SITE[siteKey(pageUrl)];
    if (local) return local;
    const repo = githubRepoKey(pageUrl);
    if (repo && PROJECT_FAVICON_BY_GITHUB_REPO[repo]) {
      return PROJECT_FAVICON_BY_GITHUB_REPO[repo];
    }
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
