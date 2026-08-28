import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Plus,
  X,
  Star,
  Lock,
  Puzzle,
  MoreVertical,
  Search,
  Globe,
  User,
  AlertCircle,
  Minus,
  Square,
  Copy,
} from "lucide-react";
import { useWindow } from "../../context/WindowContext";
import { useFS } from "../../context/FSContext";
import {
  CHROME_BOOKMARKS_STORAGE_KEY,
  faviconUrl,
  readBrowserBookmarks,
} from "../../browserBookmarks";
import { OS_USER } from "../../osUser";
import "./edge.css";

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  inputUrl: string;
  history: string[];
  historyIndex: number;
  reloadKey: number;
}

interface BrowserProps {
  winId: string;
  params?: { url?: string };
}

type Shortcut = { name: string; url: string; color: string; letter: string };

const SHORTCUTS: Shortcut[] = [
  { name: "YouTube", url: "https://www.youtube.com", color: "#FF0000", letter: "▶" },
  { name: "GitHub", url: "https://github.com", color: "#24292f", letter: "GH" },
  { name: "Wikipedia", url: "https://tr.wikipedia.org", color: "#000", letter: "W" },
  { name: "Gmail", url: "https://mail.google.com", color: "#EA4335", letter: "M" },
  { name: "Drive", url: "https://drive.google.com", color: "#34A853", letter: "D" },
  {
    name: "react-os-win",
    url: "https://github.com/MihrimatriX/react-os-win",
    color: "#0969da",
    letter: "R",
  },
];

const YT_VIDEOS = [
  {
    id: "dQw4w9WgXcQ",
    title: "Building a Windows 11 Desktop in React",
    channel: "John Doe Dev",
    views: "128 B izlenme",
    time: "2 gün önce",
    thumb:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=480&h=270&fit=crop",
  },
  {
    id: "m7e-D7D06vA",
    title: "Google DeepMind: AI Agents & Automation",
    channel: "DeepTech",
    views: "89 B izlenme",
    time: "5 gün önce",
    thumb:
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=480&h=270&fit=crop",
  },
  {
    id: "jNQXAC9IVRw",
    title: "Chrome DevTools: Debugging Like a Pro",
    channel: "Chrome for Developers",
    views: "54 B izlenme",
    time: "1 hafta önce",
    thumb:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=480&h=270&fit=crop",
  },
  {
    id: "18gqGz99Loo",
    title: "Fluent Design vs Material You — UI Face-off",
    channel: "Design Weekly",
    views: "23 B izlenme",
    time: "12 saat önce",
    thumb:
      "https://images.unsplash.com/photo-1626379616459-b2ce1d9decbc?w=480&h=270&fit=crop",
  },
];

const titleForUrl = (url: string): string => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "google.com" && u.pathname.startsWith("/search"))
      return "Google Arama";
    if (host === "google.com" && (u.pathname === "/" || u.pathname === ""))
      return "Yeni Sekme";
    if (host.includes("youtube.com") && u.pathname.startsWith("/watch"))
      return "YouTube Video";
    if (host.includes("youtube.com")) return "YouTube";
    if (host.includes("github.com") && u.pathname.includes("react-os-win"))
      return "react-os-win";
    if (host.includes("github.com")) return "GitHub";
    if (host.includes("wikipedia.org")) return "Wikipedia";
    if (host.includes("mail.google.com")) return "Gmail";
    return host.length > 22 ? `${host.slice(0, 22)}…` : host;
  } catch {
    return "Yeni Sekme";
  }
};

const normalizeUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "https://www.google.com";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes(".") && !/\s/.test(trimmed)) return `https://${trimmed}`;
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
};

const makeTab = (url: string): BrowserTab => {
  const normalized = normalizeUrl(url);
  return {
    id: `tab_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: titleForUrl(normalized),
    url: normalized,
    inputUrl: normalized === "https://www.google.com" ? "" : normalized,
    history: [normalized],
    historyIndex: 0,
    reloadKey: 0,
  };
};

export const ChromeBrowser: React.FC<BrowserProps> = ({ winId, params }) => {
  const { windows, minimizeWindow, maximizeWindow, closeWindow } = useWindow();
  const { upsertWebShortcut } = useFS();
  const win = windows.find((w) => w.id === winId);
  const isMaximized = !!win?.isMaximized;

  const startUrl = params?.url || "https://www.google.com";
  const [{ tabs, activeTabId }, setBrowser] = useState(() => {
    const first = makeTab(startUrl);
    return { tabs: [first], activeTabId: first.id };
  });
  const setTabs = (updater: BrowserTab[] | ((prev: BrowserTab[]) => BrowserTab[])) => {
    setBrowser((prev) => ({
      ...prev,
      tabs: typeof updater === "function" ? updater(prev.tabs) : updater,
    }));
  };
  const setActiveTabId = (id: string) => {
    setBrowser((prev) => ({ ...prev, activeTabId: id }));
  };
  const [bookmarks, setBookmarks] = useState(readBrowserBookmarks);
  const [ntpQuery, setNtpQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHROME_BOOKMARKS_STORAGE_KEY,
        JSON.stringify(bookmarks),
      );
    } catch (error) {
      console.error("Chrome yer işaretleri kaydedilemedi", error);
    }

    bookmarks.forEach((bookmark) => {
      upsertWebShortcut(
        bookmark.name,
        bookmark.url,
        faviconUrl(bookmark.url),
      );
    });
  }, [bookmarks, upsertWebShortcut]);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const patchTab = (id: string, patch: Partial<BrowserTab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const navigateTo = (raw: string, opts?: { replace?: boolean }) => {
    if (!activeTab) return;
    const url = normalizeUrl(raw);
    const title = titleForUrl(url);
    const inputUrl = url === "https://www.google.com" ? "" : url;

    if (opts?.replace) {
      const history = [...activeTab.history];
      history[activeTab.historyIndex] = url;
      patchTab(activeTab.id, { url, inputUrl, title, history });
      return;
    }

    const history = activeTab.history.slice(0, activeTab.historyIndex + 1);
    history.push(url);
    patchTab(activeTab.id, {
      url,
      inputUrl,
      title,
      history,
      historyIndex: history.length - 1,
    });
  };

  const goBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) return;
    const idx = activeTab.historyIndex - 1;
    const url = activeTab.history[idx];
    patchTab(activeTab.id, {
      historyIndex: idx,
      url,
      inputUrl: url === "https://www.google.com" ? "" : url,
      title: titleForUrl(url),
    });
  };

  const goForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1)
      return;
    const idx = activeTab.historyIndex + 1;
    const url = activeTab.history[idx];
    patchTab(activeTab.id, {
      historyIndex: idx,
      url,
      inputUrl: url === "https://www.google.com" ? "" : url,
      title: titleForUrl(url),
    });
  };

  const reload = () => {
    if (!activeTab) return;
    patchTab(activeTab.id, { reloadKey: activeTab.reloadKey + 1 });
  };

  const newTab = () => {
    const tab = makeTab("https://www.google.com");
    setBrowser((prev) => ({
      tabs: [...prev.tabs, tab],
      activeTabId: tab.id,
    }));
    setNtpQuery("");
  };

  const closeTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBrowser((prev) => {
      if (prev.tabs.length === 1) {
        const fresh = makeTab("https://www.google.com");
        return { tabs: [fresh], activeTabId: fresh.id };
      }
      const idx = prev.tabs.findIndex((t) => t.id === id);
      const next = prev.tabs.filter((t) => t.id !== id);
      const activeTabId =
        prev.activeTabId === id
          ? next[Math.max(0, idx - 1)].id
          : prev.activeTabId;
      return { tabs: next, activeTabId };
    });
  };

  const toggleBookmark = () => {
    if (!activeTab) return;
    const exists = bookmarks.some((b) => b.url === activeTab.url);
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.url !== activeTab.url));
      showToast("Yer işareti kaldırıldı · Masaüstü kısayolu korundu");
    } else {
      setBookmarks((prev) => [
        ...prev,
        { name: activeTab.title, url: activeTab.url },
      ]);
      showToast("Yer işaretlerine ve masaüstüne eklendi");
    }
  };

  const onOmniboxSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("url") ?? activeTab.inputUrl).trim();
    navigateTo(q || "https://www.google.com");
  };

  const onNtpSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? ntpQuery).trim();
    if (!q) return;
    navigateTo(q);
    setNtpQuery("");
  };

  const searchQuery = (() => {
    try {
      return new URL(activeTab.url).searchParams.get("q") || "";
    } catch {
      return "";
    }
  })();

  const canBack = activeTab.historyIndex > 0;
  const canForward = activeTab.historyIndex < activeTab.history.length - 1;
  const isBookmarked = bookmarks.some((b) => b.url === activeTab.url);

  const renderPage = () => {
    const url = activeTab.url;

    // Google NTP
    if (url === "https://www.google.com" || url === "https://google.com/") {
      return (
        <div className="chrome-page chrome-ntp" key={activeTab.reloadKey}>
          <div className="chrome-ntp-logo" aria-hidden>
            <span style={{ color: "#4285F4" }}>G</span>
            <span style={{ color: "#EA4335" }}>o</span>
            <span style={{ color: "#FBBC05" }}>o</span>
            <span style={{ color: "#4285F4" }}>g</span>
            <span style={{ color: "#34A853" }}>l</span>
            <span style={{ color: "#EA4335" }}>e</span>
          </div>
          <form className="chrome-ntp-search" onSubmit={onNtpSearch}>
            <Search size={18} className="chrome-ntp-search-icon" />
            <input
              name="q"
              value={ntpQuery}
              onChange={(e) => setNtpQuery(e.target.value)}
              placeholder="Google'da arama yapın veya URL yazın"
              autoFocus
            />
          </form>
          <div className="chrome-shortcuts">
            {SHORTCUTS.map((s) => (
              <button
                key={s.url}
                type="button"
                className="chrome-shortcut"
                onClick={() => navigateTo(s.url)}
                title={s.url}
              >
                <span
                  className="chrome-shortcut-icon"
                  style={{ background: s.color }}
                >
                  {s.letter}
                </span>
                <span className="chrome-shortcut-name">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Google SERP
    if (url.includes("google.com/search")) {
      const q = searchQuery;
      const results = [
        {
          title: `${q} - Vikipedi`,
          url: `https://tr.wikipedia.org/wiki/${encodeURIComponent(q)}`,
          snippet: `${q} hakkında ansiklopedik bilgi. Kaynak: Vikipedi, özgür ansiklopedi.`,
        },
        {
          title: `${q} — YouTube`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
          snippet: `${q} ile ilgili videoları YouTube'da izleyin.`,
        },
        {
          title: `${q} · GitHub`,
          url: `https://github.com/search?q=${encodeURIComponent(q)}`,
          snippet: `Açık kaynak kod, issue ve depo sonuçları.`,
        },
        {
          title: "react-os-win — Windows 11 Web Desktop",
          url: "https://github.com/MihrimatriX/react-os-win",
          snippet:
            "Tarayıcıda çalışan Windows 11 simülasyonu. React + Vite. John Doe masaüstü.",
        },
      ];
      return (
        <div className="chrome-page chrome-serp" key={activeTab.reloadKey}>
          <header className="chrome-serp-header">
            <button
              type="button"
              className="chrome-serp-logo"
              onClick={() => navigateTo("https://www.google.com")}
            >
              <span style={{ color: "#4285F4" }}>G</span>
              <span style={{ color: "#EA4335" }}>o</span>
              <span style={{ color: "#FBBC05" }}>o</span>
              <span style={{ color: "#4285F4" }}>g</span>
              <span style={{ color: "#34A853" }}>l</span>
              <span style={{ color: "#EA4335" }}>e</span>
            </button>
            <form
              className="chrome-serp-form"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                navigateTo(String(fd.get("q") || q));
              }}
            >
              <Search size={16} />
              <input name="q" defaultValue={q} />
            </form>
          </header>
          <div className="chrome-serp-meta">
            Yaklaşık {(q.length * 137 + 4200).toLocaleString("tr-TR")} sonuç
          </div>
          <div className="chrome-serp-results">
            {results.map((r) => (
              <article key={r.url} className="chrome-serp-item">
                <a
                  href={r.url}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(r.url);
                  }}
                >
                  <cite>{r.url.replace(/^https?:\/\//, "")}</cite>
                  <h3>{r.title}</h3>
                </a>
                <p>{r.snippet}</p>
              </article>
            ))}
          </div>
        </div>
      );
    }

    // YouTube watch
    if (url.includes("youtube.com/watch")) {
      let videoId = "dQw4w9WgXcQ";
      try {
        videoId = new URL(url).searchParams.get("v") || videoId;
      } catch {
        /* keep default */
      }
      const meta = YT_VIDEOS.find((v) => v.id === videoId);
      return (
        <div className="chrome-page chrome-yt-watch" key={activeTab.reloadKey}>
          <div className="chrome-yt-player">
            <iframe
              key={`${videoId}-${activeTab.reloadKey}`}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
              title={meta?.title || "YouTube"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="chrome-yt-watch-meta">
            <h2>{meta?.title || "YouTube Video"}</h2>
            <p>
              {meta?.channel || "Kanal"} · {meta?.views || ""} ·{" "}
              {meta?.time || ""}
            </p>
          </div>
        </div>
      );
    }

    // YouTube home / results
    if (url.includes("youtube.com")) {
      return (
        <div className="chrome-page chrome-yt" key={activeTab.reloadKey}>
          <header className="chrome-yt-bar">
            <div className="chrome-yt-brand">
              <span className="chrome-yt-play">▶</span> YouTube
            </div>
            <form
              className="chrome-yt-search"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const q = String(fd.get("q") || "").trim();
                if (q) navigateTo(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`);
              }}
            >
              <input name="q" placeholder="Ara" defaultValue={searchQuery} />
              <button type="submit">
                <Search size={16} />
              </button>
            </form>
            <div className="chrome-yt-user">{OS_USER.displayName}</div>
          </header>
          <div className="chrome-yt-grid">
            {YT_VIDEOS.map((v) => (
              <button
                key={v.id}
                type="button"
                className="chrome-yt-card"
                onClick={() =>
                  navigateTo(`https://www.youtube.com/watch?v=${v.id}`)
                }
              >
                <img src={v.thumb} alt="" />
                <div>
                  <h4>{v.title}</h4>
                  <span>
                    {v.channel} · {v.views}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // GitHub
    if (url.includes("github.com")) {
      const isRepo = url.includes("react-os-win");
      return (
        <div className="chrome-page chrome-gh" key={activeTab.reloadKey}>
          <header className="chrome-gh-bar">
            <button type="button" onClick={() => navigateTo("https://github.com")}>
              GitHub
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                navigateTo(
                  `https://github.com/search?q=${encodeURIComponent(String(fd.get("q") || ""))}`,
                );
              }}
            >
              <input name="q" placeholder="Search GitHub" />
            </form>
            <span className="chrome-gh-user">{OS_USER.displayName}</span>
          </header>
          <div className="chrome-gh-body">
            {isRepo ? (
              <>
                <h1>
                  MihrimatriX / <strong>react-os-win</strong>
                </h1>
                <p className="chrome-gh-desc">
                  Tarayıcıda çalışan Windows 11 masaüstü simülasyonu — React,
                  Vite, Fluent UI. Oturum: {OS_USER.displayName}.
                </p>
                <div className="chrome-gh-actions">
                  <button type="button" onClick={() => showToast("Star eklendi")}>
                    ★ Star
                  </button>
                  <button type="button" onClick={() => showToast("Fork simüle edildi")}>
                    Fork
                  </button>
                </div>
                <pre className="chrome-gh-code">{`src/
  components/Apps/Edge.tsx
  osUser.ts          # ${OS_USER.displayName}
  context/FSContext.tsx
public/
  og-image.png
Dockerfile`}</pre>
              </>
            ) : (
              <>
                <div className="chrome-gh-profile">
                  <img src={OS_USER.avatarUrl} alt="" />
                  <div>
                    <h1>{OS_USER.displayName}</h1>
                    <p>johndoe · {OS_USER.email}</p>
                    <p className="chrome-gh-bio">
                      Frontend / OS sims. Building react-os-win in the browser.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="chrome-gh-repo-card"
                  onClick={() =>
                    navigateTo("https://github.com/MihrimatriX/react-os-win")
                  }
                >
                  <strong>react-os-win</strong>
                  <span>Windows 11 web desktop · TypeScript</span>
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    // Wikipedia
    if (url.includes("wikipedia.org")) {
      const topic =
        decodeURIComponent(url.split("/wiki/")[1] || "Ana_Sayfa").replace(
          /_/g,
          " ",
        ) || "Ana Sayfa";
      return (
        <div className="chrome-page chrome-wiki" key={activeTab.reloadKey}>
          <header className="chrome-wiki-bar">
            <strong>Vikipedi</strong>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const q = String(fd.get("q") || "").trim();
                if (q)
                  navigateTo(
                    `https://tr.wikipedia.org/wiki/${encodeURIComponent(q.replace(/\s+/g, "_"))}`,
                  );
              }}
            >
              <input name="q" placeholder="Vikipedi'de ara" defaultValue={topic} />
            </form>
          </header>
          <article className="chrome-wiki-article">
            <h1>{topic}</h1>
            <p>
              <em>{topic}</em>, Vikipedi'nin özgür ansiklopedisinde yer alan bir
              maddedir. Bu sayfa {OS_USER.displayName} oturumundaki Google Chrome
              simülasyonunda gösterilmektedir.
            </p>
            <p>
              Gerçek Wikipedia içeriği için bağlantıyı harici olarak açabilir veya
              adres çubuğuna tam bir URL yapıştırabilirsiniz.
            </p>
          </article>
        </div>
      );
    }

    // Generic iframe (sites that allow embedding)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return (
        <div className="chrome-page chrome-iframe-wrap" key={activeTab.reloadKey}>
          <iframe
            key={`${url}-${activeTab.reloadKey}`}
            src={url}
            title={activeTab.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
          />
          <div className="chrome-iframe-hint">
            Bazı siteler iframe içinde açılamaz (X-Frame-Options). Yerleşik
            Google / YouTube / GitHub sayfalarını deneyin.
          </div>
        </div>
      );
    }

    return (
      <div className="chrome-page chrome-error">
        <AlertCircle size={40} />
        <h3>Bu sayfaya ulaşılamıyor</h3>
        <p>{url}</p>
        <button type="button" onClick={() => navigateTo("https://www.google.com")}>
          Google'a dön
        </button>
      </div>
    );
  };

  if (!activeTab) return null;

  return (
    <div
      className="chrome-browser chrome-browser--fluent"
      onClick={() => menuOpen && setMenuOpen(false)}
    >
      {/* Caption = pill tabs + drag area + window buttons (like real Chrome) */}
      <div className="chrome-tabstrip chrome-caption-drag">
        <div className="chrome-tabs">
          {tabs.map((tab) => {
            const fav = faviconUrl(tab.url);
            return (
              <div
                key={tab.id}
                className={`chrome-tab ${tab.id === activeTabId ? "active" : ""}`}
                onClick={() => setActiveTabId(tab.id)}
                onAuxClick={(e) => {
                  if (e.button === 1) closeTab(tab.id, e);
                }}
                title={tab.url}
              >
                {fav ? (
                  <img
                    className="chrome-tab-favicon-img"
                    src={fav}
                    alt=""
                    draggable={false}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Globe size={12} className="chrome-tab-favicon" />
                )}
                <span className="chrome-tab-title">{tab.title}</span>
                <button
                  type="button"
                  className="chrome-tab-close"
                  onClick={(e) => closeTab(tab.id, e)}
                  title="Sekmeyi kapat"
                >
                  <X size={11} strokeWidth={2.25} />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            className="chrome-new-tab"
            onClick={newTab}
            title="Yeni sekme"
          >
            <Plus size={15} strokeWidth={2.25} />
          </button>
        </div>

        <div
          className="chrome-window-controls"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="chrome-win-btn"
            title="Küçült"
            onClick={() => minimizeWindow(winId)}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="chrome-win-btn"
            title={isMaximized ? "Aşağı Ekran" : "Ekranı Kapla"}
            onClick={() => maximizeWindow(winId)}
          >
            {isMaximized ? <Copy size={11} /> : <Square size={11} />}
          </button>
          <button
            type="button"
            className="chrome-win-btn chrome-win-btn--close"
            title="Kapat"
            onClick={() => closeWindow(winId)}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="chrome-toolbar">
        <div className="chrome-nav">
          <button type="button" disabled={!canBack} onClick={goBack} title="Geri">
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            disabled={!canForward}
            onClick={goForward}
            title="İleri"
          >
            <ArrowRight size={16} />
          </button>
          <button type="button" onClick={reload} title="Yeniden yükle">
            <RotateCw size={14} />
          </button>
          <button
            type="button"
            onClick={() => navigateTo("https://www.google.com")}
            title="Ana sayfa"
          >
            <Home size={15} />
          </button>
        </div>

        <form className="chrome-omnibox" onSubmit={onOmniboxSubmit}>
          <Lock size={12} className="chrome-omnibox-lock" />
          <input
            name="url"
            value={activeTab.inputUrl}
            onChange={(e) =>
              patchTab(activeTab.id, { inputUrl: e.target.value })
            }
            onFocus={(e) => e.target.select()}
            placeholder="Ara veya URL girin"
            spellCheck={false}
          />
          <button
            type="button"
            className={`chrome-star ${isBookmarked ? "on" : ""}`}
            onClick={toggleBookmark}
            title="Yer işareti ve masaüstü kısayolu"
          >
            <Star size={14} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </form>

        <div className="chrome-actions">
          <button
            type="button"
            title="Uzantılar"
            onClick={() => showToast("Uzantı mağazası simüle")}
          >
            <Puzzle size={16} />
          </button>
          <button
            type="button"
            className="chrome-profile"
            title={OS_USER.displayName}
            onClick={() => showToast(`${OS_USER.displayName} · Google Hesabı`)}
          >
            <User size={14} />
          </button>
          <div className="chrome-menu-wrap">
            <button
              type="button"
              title="Chrome menüsü"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="chrome-menu" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    newTab();
                    setMenuOpen(false);
                  }}
                >
                  Yeni sekme
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigateTo("https://www.google.com");
                    setMenuOpen(false);
                  }}
                >
                  Yeni sekme sayfası
                </button>
                <hr />
                <button
                  type="button"
                  onClick={() => {
                    showToast("Ayarlar simüle");
                    setMenuOpen(false);
                  }}
                >
                  Ayarlar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Oturum: ${OS_USER.displayName}`);
                    setMenuOpen(false);
                  }}
                >
                  {OS_USER.displayName}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="chrome-bookmarks">
          {bookmarks.map((b) => {
            const fav = faviconUrl(b.url);
            return (
              <button
                key={b.url + b.name}
                type="button"
                className="chrome-bookmark"
                onClick={() => navigateTo(b.url)}
              >
                {fav ? (
                  <img src={fav} alt="" width={12} height={12} draggable={false} />
                ) : (
                  <Globe size={11} />
                )}
                {b.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="chrome-viewport">{renderPage()}</div>

      {toast && <div className="chrome-toast">{toast}</div>}
    </div>
  );
};

export default ChromeBrowser;
