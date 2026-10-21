import {
  faviconUrl,
  githubRepoKey,
  siteKey,
  type BrowserBookmark,
} from "./browserBookmarks";

export interface ProjectCard {
  id: string;
  name: string;
  url: string;
  icon: string;
  source: "bookmark" | "desktop";
  /** Public GitHub repository URL when known. */
  githubUrl?: string;
  /** Live site screenshot (shot-*.png) or stylized fallback under public/. */
  preview?: string;
  /** SVG silhouette used when the live screenshot fails to load. */
  previewFallback?: string;
  /** Special visual treatment (e.g. Photon Engine rainbow + fireworks). */
  specialEffect?: "photon";
}

export interface DesktopProjectNode {
  name: string;
  type: string;
  url?: string;
  iconUrl?: string;
}

/**
 * Repos for custom-domain projects (MihrimatriX on GitHub). Key: siteKey.
 * *.github.io sites need no entry — see githubFromPages.
 */
export const PROJECT_GITHUB_BY_SITE: Record<string, string> = {
  "tkm.ahmetfuzunkaya.com":
    "https://github.com/MihrimatriX/online-tas-kagit-makas",
  "vid-report.ahmetfuzunkaya.com":
    "https://github.com/MihrimatriX/video-compression-analyzer",
  "win11-react.ahmetfuzunkaya.com":
    "https://github.com/MihrimatriX/react-os-win",
  "element-api.ahmetfuzunkaya.com":
    "https://github.com/MihrimatriX/element-api",
};

/** https://mihrimatrix.github.io/<repo>/ -> https://github.com/MihrimatriX/<repo> */
const githubFromPages = (pageUrl: string): string | undefined => {
  try {
    const u = new URL(pageUrl);
    if (u.hostname !== "mihrimatrix.github.io") return undefined;
    const repo = u.pathname.split("/").filter(Boolean)[0];
    return repo ? `https://github.com/MihrimatriX/${repo}` : undefined;
  } catch {
    return undefined;
  }
};

/** GitHub-primary projects (no live demo). Key: owner/repo lowercase. */
export const PROJECT_GITHUB_PRIMARY: Record<
  string,
  {
    githubUrl: string;
    preview: string;
    previewFallback: string;
    specialEffect?: "photon";
  }
> = {
  "mihrimatrix/photon-engine": {
    githubUrl: "https://github.com/MihrimatriX/photon-engine",
    preview: `${import.meta.env.BASE_URL}icons/projects/shot-photon-engine.png`,
    previewFallback: `${import.meta.env.BASE_URL}icons/projects/preview-photon-engine.svg`,
    specialEffect: "photon",
  },
};

/** Stylized layout mock thumbnails (gradient + chrome) — capture fallback. Key: siteKey. */
export const PROJECT_PREVIEW_FALLBACK_BY_SITE: Record<string, string> = {
  "mihrimatrix.github.io/react-shop": `${import.meta.env.BASE_URL}icons/projects/preview-react-shop.svg`,
  "mihrimatrix.github.io/awesome-web-components":
    `${import.meta.env.BASE_URL}icons/projects/preview-aw-component.svg`,
  "tkm.ahmetfuzunkaya.com": `${import.meta.env.BASE_URL}icons/projects/preview-tkm.svg`,
  "mihrimatrix.github.io/easy-pomodoro":
    `${import.meta.env.BASE_URL}icons/projects/preview-easy-pomodoro.svg`,
  "vid-report.ahmetfuzunkaya.com": `${import.meta.env.BASE_URL}icons/projects/preview-vid-report.svg`,
  "muratyelol.com": `${import.meta.env.BASE_URL}icons/projects/preview-muratyelol.svg`,
  "ecrinsuaritma.com": `${import.meta.env.BASE_URL}icons/projects/preview-ecrinsuaritma.svg`,
  "win11-react.ahmetfuzunkaya.com":
    `${import.meta.env.BASE_URL}icons/projects/preview-react-os-win.svg`,
  "element-api.ahmetfuzunkaya.com":
    `${import.meta.env.BASE_URL}icons/projects/preview-element-api.svg`,
  "mihrimatrix.github.io/react-spider-solitaire":
    `${import.meta.env.BASE_URL}icons/projects/preview-spider-solitaire.svg`,
  "mihrimatrix.github.io/react-rick-and-morty":
    `${import.meta.env.BASE_URL}icons/projects/preview-rick-morty.svg`,
  "mihrimatrix.github.io/film-review-movie":
    `${import.meta.env.BASE_URL}icons/projects/preview-filmrev-movie.svg`,
};

/** Real Playwright screenshots of live sites (preferred card previews). Key: siteKey. */
export const PROJECT_PREVIEW_BY_SITE: Record<string, string> = {
  "mihrimatrix.github.io/react-shop": `${import.meta.env.BASE_URL}icons/projects/shot-react-shop.png`,
  "mihrimatrix.github.io/awesome-web-components":
    `${import.meta.env.BASE_URL}icons/projects/shot-aw-component.png`,
  "tkm.ahmetfuzunkaya.com": `${import.meta.env.BASE_URL}icons/projects/shot-tkm.png`,
  "mihrimatrix.github.io/easy-pomodoro":
    `${import.meta.env.BASE_URL}icons/projects/shot-easy-pomodoro.png`,
  "vid-report.ahmetfuzunkaya.com": `${import.meta.env.BASE_URL}icons/projects/shot-vid-report.png`,
  "muratyelol.com": `${import.meta.env.BASE_URL}icons/projects/shot-muratyelol.png`,
  "ecrinsuaritma.com": `${import.meta.env.BASE_URL}icons/projects/shot-ecrinsuaritma.png`,
  "win11-react.ahmetfuzunkaya.com":
    `${import.meta.env.BASE_URL}icons/projects/shot-react-os-win.png`,
  "element-api.ahmetfuzunkaya.com":
    `${import.meta.env.BASE_URL}icons/projects/shot-element-api.png`,
  "mihrimatrix.github.io/react-spider-solitaire":
    `${import.meta.env.BASE_URL}icons/projects/shot-spider-solitaire.png`,
  "mihrimatrix.github.io/react-rick-and-morty":
    `${import.meta.env.BASE_URL}icons/projects/shot-rick-morty.png`,
  "mihrimatrix.github.io/film-review-movie":
    `${import.meta.env.BASE_URL}icons/projects/shot-filmrev-movie.png`,
  ...Object.fromEntries(
    [
      "xp-clone-react",
      "macos-clone-react",
      "ubuntu-react",
      "win8-metro",
      "android-react",
      "iphone-clone-react",
      "ps5-showcase",
      "afu-coming-soon",
      "iptv-react",
      "temp-shop",
      "bookmark-editor-save",
      "fluxer-download-manager",
      "nuvora-media-player",
      "glance-image-viewer",
      "inlay-disc-studio",
      "backend-dotnet",
      "backend-spring",
      "demo-social-media-api",
      "arr-stack",
      "projects",
    ].map((repo) => [
      `mihrimatrix.github.io/${repo}`,
      `${import.meta.env.BASE_URL}icons/projects/shot-${repo}.png`,
    ]),
  ),
};

/** Host plus path, so github.io projects are told apart on cards. */
const hostLabel = (url: string) => {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname}`.replace(/\/$/, "");
  } catch {
    return url;
  }
};

const enrich = (
  card: Omit<
    ProjectCard,
    "githubUrl" | "preview" | "previewFallback" | "specialEffect"
  >,
): ProjectCard => {
  const site = siteKey(card.url);
  const repo = githubRepoKey(card.url);
  const primary = repo ? PROJECT_GITHUB_PRIMARY[repo] : undefined;
  return {
    ...card,
    githubUrl:
      PROJECT_GITHUB_BY_SITE[site] ??
      githubFromPages(card.url) ??
      primary?.githubUrl,
    preview: PROJECT_PREVIEW_BY_SITE[site] ?? primary?.preview,
    previewFallback:
      PROJECT_PREVIEW_FALLBACK_BY_SITE[site] ?? primary?.previewFallback,
    specialEffect: primary?.specialEffect,
  };
};

/** Merge browser bookmarks + desktop web shortcuts (dedupe by URL). */
export const collectProjectCards = (
  bookmarks: BrowserBookmark[],
  desktopNodes: DesktopProjectNode[],
): ProjectCard[] => {
  const byUrl = new Map<string, ProjectCard>();

  for (const bookmark of bookmarks) {
    const url = bookmark.url.trim();
    if (!/^https?:\/\//i.test(url)) continue;
    const key = url.replace(/\/$/, "").toLowerCase();
    byUrl.set(
      key,
      enrich({
        id: `bm-${key}`,
        name: bookmark.name.trim() || hostLabel(url),
        url,
        icon: faviconUrl(url),
        source: "bookmark",
      }),
    );
  }

  for (const node of desktopNodes) {
    if (node.type !== "shortcut" || !node.url) continue;
    const url = node.url.trim();
    if (!/^https?:\/\//i.test(url)) continue;
    const key = url.replace(/\/$/, "").toLowerCase();
    if (byUrl.has(key)) continue;
    byUrl.set(
      key,
      enrich({
        id: `desk-${key}`,
        name: node.name,
        url,
        icon: node.iconUrl || faviconUrl(url),
        source: "desktop",
      }),
    );
  }

  return Array.from(byUrl.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "tr-TR"),
  );
};

export { hostLabel };
