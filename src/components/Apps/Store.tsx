import React, { useState } from "react";
import { useSystem } from "../../context/SystemContext";
import {
  Search,
  Download,
  Trash2,
  Grid,
  Gamepad2,
  Cpu,
  Sparkles,
  CloudSun,
  Check,
} from "lucide-react";
import "./store.css";

interface StoreAppItem {
  id: string;
  name: string;
  category: "Verimlilik" | "Oyunlar" | "Geliştirici" | "Sistem" | "AI";
  description: string;
  rating: number;
  icon: string;
  author: string;
}

const STORE_APPS: StoreAppItem[] = [
  {
    id: "paint",
    name: "MS Paint",
    category: "Verimlilik",
    description:
      "Çizim yapın, boyayın ve resimleri düzenleyin. Yaratıcılığınızı konuşturun.",
    rating: 4.5,
    icon: "🎨",
    author: "Microsoft Corporation",
  },
  {
    id: "vscode",
    name: "VS Code Klonu",
    category: "Geliştirici",
    description:
      "Web geliştirme için gelişmiş kod düzenleyici. HTML/CSS/JS önizleme desteği.",
    rating: 4.9,
    icon: "💻",
    author: "Microsoft Corporation",
  },
  {
    id: "minesweeper",
    name: "Mayın Tarlası",
    category: "Oyunlar",
    description:
      "Klasik retro mayın arama oyunu. Mantığınızı kullanın ve patlamayın.",
    rating: 4.7,
    icon: "💣",
    author: "RetroGames Ltd",
  },
  {
    id: "camera",
    name: "Kamera",
    category: "Verimlilik",
    description:
      "Kameranızı açıp fotoğraf çekin. Web kamerası simülasyonu desteklidir.",
    rating: 4.2,
    icon: "📷",
    author: "Microsoft Corporation",
  },
  {
    id: "imageviewer",
    name: "Fotoğraflar",
    category: "Verimlilik",
    description:
      "Masaüstü ve sistem resimlerini görüntüleyin. Duvar kağıdı yapma özellikli.",
    rating: 4.4,
    icon: "🖼️",
    author: "Microsoft Corporation",
  },
  {
    id: "copilot",
    name: "Windows Copilot",
    category: "AI",
    description:
      "Sistem komutları çalıştırabilen ve sorularınızı yanıtlayan yapay zeka asistanı.",
    rating: 4.8,
    icon: "🌀",
    author: "Microsoft AI Division",
  },
  {
    id: "taskmgr",
    name: "Görev Yöneticisi",
    category: "Sistem",
    description:
      "Sistem performansını, bellek/işlemci telemetry grafiklerini izleyin.",
    rating: 4.6,
    icon: "📊",
    author: "Microsoft Corporation",
  },
  {
    id: "weather",
    name: "Hava Durumu",
    category: "Sistem",
    description:
      "Detaylı 5 günlük hava durumu tahminleri ve şehir bazlı sıcaklık haritaları.",
    rating: 4.3,
    icon: "🌦️",
    author: "MeteoWeb Inc",
  },
];

export const StoreApp: React.FC = () => {
  const { installedAppIds, installApp, uninstallApp } = useSystem();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [installingIds, setInstallingIds] = useState<{ [id: string]: boolean }>(
    {},
  );

  const handleInstall = (appId: string) => {
    setInstallingIds((prev) => ({ ...prev, [appId]: true }));
    // Simulate downloading & installing delay
    setTimeout(() => {
      installApp(appId);
      setInstallingIds((prev) => ({ ...prev, [appId]: false }));
    }, 1800);
  };

  const handleUninstall = (appId: string) => {
    uninstallApp(appId);
  };

  const filteredApps = STORE_APPS.filter((app) => {
    const matchesCategory =
      selectedCategory === "all" ||
      app.category.toLowerCase() === selectedCategory;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "all", name: "Tüm Uygulamalar", icon: <Grid size={16} /> },
    { id: "verimlilik", name: "Verimlilik", icon: <Cpu size={16} /> },
    { id: "oyunlar", name: "Oyunlar", icon: <Gamepad2 size={16} /> },
    {
      id: "geliştirici",
      name: "Geliştirici Araçları",
      icon: <Cpu size={16} />,
    },
    { id: "ai", name: "Yapay Zeka (AI)", icon: <Sparkles size={16} /> },
    {
      id: "sistem",
      name: "Sistem & Hava Durumu",
      icon: <CloudSun size={16} />,
    },
  ];

  return (
    <div className="store-app-container">
      {/* Sidebar navigation */}
      <div className="store-sidebar">
        <div className="store-logo-area">
          <div className="store-logo-bag">👜</div>
          <div className="store-logo-text">Microsoft Store</div>
        </div>

        <div className="store-nav-list">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`store-nav-item ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {selectedCategory === cat.id && (
                <div className="store-active-indicator" />
              )}
              {cat.icon}
              <span>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="store-main-content">
        {/* Search header bar */}
        <div className="store-header-bar">
          <div className="store-search-wrapper">
            <Search size={14} className="store-search-icon" />
            <input
              type="text"
              placeholder="Uygulama, oyun veya araç arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="store-header-banner">
            <span className="banner-badge">YENİ & GÜNCEL</span>
            <h2>Seçilmiş Windows 11 Uygulamaları</h2>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="store-apps-grid">
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => {
              const isInstalled = installedAppIds.includes(app.id);
              const isInstalling = installingIds[app.id];

              return (
                <div key={app.id} className="store-app-card glass">
                  <div className="card-top">
                    <span className="app-card-icon">{app.icon}</span>
                    <div className="app-card-identity">
                      <h3>{app.name}</h3>
                      <span className="app-card-author">{app.author}</span>
                      <span className="app-card-rating">⭐ {app.rating}</span>
                    </div>
                  </div>

                  <p className="app-card-description">{app.description}</p>

                  <div className="card-actions">
                    <span className="app-card-category">{app.category}</span>

                    {isInstalling ? (
                      <button className="store-btn installing" disabled>
                        <div className="store-spinner" />
                        <span>Yükleniyor...</span>
                      </button>
                    ) : isInstalled ? (
                      <div className="installed-actions-row">
                        <span className="installed-badge">
                          <Check size={14} style={{ marginRight: "4px" }} />
                          Yüklendi
                        </span>
                        <button
                          className="store-uninstall-btn"
                          onClick={() => handleUninstall(app.id)}
                          title="Uygulamayı Kaldır"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="store-btn install"
                        onClick={() => handleInstall(app.id)}
                      >
                        <Download size={14} style={{ marginRight: "6px" }} />
                        Al / Yükle
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="store-no-results">
              🔍 Sonuç bulunamadı. Lütfen aramanızı veya kategori seçiminizi
              değiştirin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreApp;
