import React, { useEffect, useState } from "react";
import { useSystem } from "../../context/SystemContext";
import type { WindowParams } from "../../context/WindowContext";
import {
  Paintbrush,
  Cpu,
  Smartphone,
  Globe,
  Grid,
  User,
  Clock,
  Shield,
  RefreshCw,
  Search,
  Gamepad2,
  Accessibility,
} from "lucide-react";
import { OS_USER } from "../../osUser";
import "./settings.css";

interface SettingsProps {
  params?: WindowParams;
}

const WALLPAPERS = [
  "/wallpaper.png",
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1920&q=80", // Blue abstract
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80", // Dark abstract
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&q=80", // Pink-orange wave
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1920&q=80", // Minimal splash
];

export const SettingsApp: React.FC<SettingsProps> = ({ params }) => {
  const {
    theme,
    setTheme,
    wallpaper,
    setWallpaper,
    wifi,
    setWifi,
    bluetooth,
    setBluetooth,
    brightness,
    setBrightness,
    airplaneMode,
    setAirplaneMode,
    energySaver,
    setEnergySaver,
  } = useSystem();
  const [activeTab, setActiveTab] = useState<string>(params?.tab || "system");
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Windows Update simulation states
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateHeader, setUpdateHeader] = useState("Güncelsiniz");
  const [updateCheckedText, setUpdateCheckedText] = useState(
    "Son denetleme: Bugün, 16:56",
  );

  const handleCheckForUpdates = () => {
    setIsCheckingUpdate(true);
    setUpdateHeader("Güncelleştirmeler denetleniyor...");
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateHeader("Güncelsiniz");
      setUpdateCheckedText("Son denetleme: Az önce");
    }, 1500);
  };

  // Stateful interactive mock settings
  const [mockSettings, setMockSettings] = useState<{ [key: string]: boolean }>({
    fastBoot: true,
    autoUpdate: true,
    diagnosticData: false,
    developerMode: false,
    locationServices: true,
    cameraAccess: true,
    microphoneAccess: true,
    autoTime: true,
    gameMode: true,
    gameBar: false,
    narrator: false,
    monoAudio: false,
  });

  const toggleMockSetting = (key: string) => {
    setMockSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!params?.tab) return;
    const timer = window.setTimeout(() => setActiveTab(params.tab as string), 0);
    return () => window.clearTimeout(timer);
  }, [params?.tab]);

  const sidebarItems = [
    { id: "system", name: "Sistem", icon: <Cpu size={16} /> },
    {
      id: "devices",
      name: "Bluetooth ve cihazlar",
      icon: <Smartphone size={16} />,
    },
    { id: "network", name: "Ağ ve İnternet", icon: <Globe size={16} /> },
    {
      id: "personalization",
      name: "Kişiselleştirme",
      icon: <Paintbrush size={16} />,
    },
    { id: "apps", name: "Uygulamalar", icon: <Grid size={16} /> },
    { id: "accounts", name: "Hesaplar", icon: <User size={16} /> },
    { id: "time", name: "Zaman ve dil", icon: <Clock size={16} /> },
    { id: "gaming", name: "Oyun", icon: <Gamepad2 size={16} /> },
    {
      id: "accessibility",
      name: "Erişilebilirlik",
      icon: <Accessibility size={16} />,
    },
    { id: "privacy", name: "Gizlilik ve güvenlik", icon: <Shield size={16} /> },
    { id: "update", name: "Windows Update", icon: <RefreshCw size={16} /> },
  ];

  // Filter sidebar items based on search input
  const filteredSidebarItems = sidebarItems.filter((item) =>
    item.name.toLowerCase().includes(sidebarSearch.toLowerCase()),
  );

  return (
    <div className="settings-app-container">
      {/* Sidebar Navigation */}
      <div className="settings-sidebar">
        {/* User Card */}
        <div className="sidebar-user-card">
          <img
            src={OS_USER.avatarUrl}
            alt={OS_USER.displayName}
            className="sidebar-avatar"
          />
          <div className="sidebar-user-info">
            <span className="sidebar-username">{OS_USER.displayName}</span>
            <span className="sidebar-user-email">{OS_USER.accountHint}</span>
          </div>
        </div>

        {/* Search Settings Bar */}
        <div className="sidebar-search-box">
          <Search size={14} className="sidebar-search-icon" />
          <input
            type="text"
            placeholder="Bir ayar bulun"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
        </div>

        {/* Nav List */}
        <div className="sidebar-nav-list">
          {filteredSidebarItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              {activeTab === item.id && <div className="active-indicator" />}
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Settings Display */}
      <div className="settings-main-content">
        {/* Tab: System Info */}
        {activeTab === "system" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Sistem Özellikleri</h2>

            <div className="spec-card glass">
              <div className="spec-header">
                <Cpu size={24} color="var(--accent-color)" />
                <div>
                  <h3 className="spec-device-name">{OS_USER.hostname}</h3>
                  <p className="spec-sub">MSI Server Board EPYC-D8</p>
                </div>
              </div>

              <div className="spec-details-list">
                <div className="spec-row">
                  <span className="spec-label">İşlemci:</span>
                  <span className="spec-value">
                    AMD EPYC 9965 192-Core Processor @ 2.25 GHz
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Takılı RAM:</span>
                  <span className="spec-value">
                    256 GB (DDR5 ECC Server Memory @ 4800 MHz)
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Depolama:</span>
                  <span className="spec-value">
                    NVMe M.2 SSD 2TB (PCIe Gen 4)
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Sistem Türü:</span>
                  <span className="spec-value">
                    64 bit işletim sistemi, x64 tabanlı işlemci
                  </span>
                </div>
              </div>
            </div>

            <div className="spec-card glass" style={{ marginTop: "20px" }}>
              <h3 className="spec-title-minor">Windows Özellikleri</h3>
              <div className="spec-details-list">
                <div className="spec-row">
                  <span className="spec-label">Edisyon:</span>
                  <span className="spec-value">
                    Windows 11 Pro (React Web Edition)
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Sürüm:</span>
                  <span className="spec-value">26H2</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Geliştirici:</span>
                  <span className="spec-value">
                    React, TypeScript ve Vite
                  </span>
                </div>
              </div>
            </div>

            <div className="spec-card glass" style={{ marginTop: "20px" }}>
              <h3 className="spec-title-minor">Performans & Hızlı Başlat</h3>
              <div className="spec-details-list">
                <div className="mock-toggle-row">
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">
                      Hızlı Başlatmayı Etkinleştir (Önerilen)
                    </span>
                    <span className="mock-toggle-desc">
                      Bilgisayarı kapattıktan sonra daha hızlı açılmasına
                      yardımcı olur.
                    </span>
                  </div>
                  <button
                    className={`settings-mock-switch ${mockSettings.fastBoot ? "active" : ""}`}
                    onClick={() => toggleMockSetting("fastBoot")}
                  >
                    {mockSettings.fastBoot ? "Açık" : "Kapalı"}
                  </button>
                </div>
                <div className="mock-toggle-row">
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">Enerji Tasarrufu</span>
                    <span className="mock-toggle-desc">
                      Animasyonları azaltır ve daha sakin bir masaüstü deneyimi
                      sağlar.
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`settings-mock-switch ${energySaver ? "active" : ""}`}
                    onClick={() => setEnergySaver(!energySaver)}
                    aria-pressed={energySaver}
                    aria-label="Enerji tasarrufu"
                  >
                    {energySaver ? "Açık" : "Kapalı"}
                  </button>
                </div>
                <label className="settings-slider-row">
                  <span>
                    <strong>Parlaklık</strong>
                    <small>Ekran karartma düzeyi</small>
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={brightness}
                    onChange={(event) =>
                      setBrightness(Number(event.target.value))
                    }
                    aria-valuetext={`Yüzde ${brightness}`}
                  />
                  <output>{brightness}%</output>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Bluetooth & Devices */}
        {activeTab === "devices" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Bluetooth ve Cihazlar</h2>

            <div className="personalize-card glass">
              <div className="mock-toggle-row">
                <div className="mock-toggle-info">
                  <h3>Bluetooth</h3>
                  <p className="spec-sub">
                    Yakındaki aygıtları bulun, bağlayın ve dosya aktarın.
                  </p>
                </div>
                <button
                  className={`settings-mock-switch ${bluetooth ? "active" : ""}`}
                  onClick={() => setBluetooth(!bluetooth)}
                  aria-pressed={bluetooth}
                  aria-label="Bluetooth"
                >
                  {bluetooth ? "Açık" : "Kapalı"}
                </button>
              </div>
            </div>

            <div
              className="personalize-card glass"
              style={{ marginTop: "20px" }}
            >
              <h3>Bağlı Cihazlar</h3>
              <p className="spec-sub" style={{ marginBottom: "15px" }}>
                Şu an eşleştirilmiş aygıtlar listesi:
              </p>

              <div className="connected-devices-list">
                <div className="device-item-row">
                  <div className="device-icon-circle">🖱️</div>
                  <div className="device-info-text">
                    <span className="device-name">Logitech MX Master 3S</span>
                    <span className="device-type">Mouse · Bağlı (%85 Pil)</span>
                  </div>
                </div>
                <div className="device-item-row">
                  <div className="device-icon-circle">⌨️</div>
                  <div className="device-info-text">
                    <span className="device-name">Keychron Q1 Pro</span>
                    <span className="device-type">Klavye · Eşleşti</span>
                  </div>
                </div>
                <div className="device-item-row">
                  <div className="device-icon-circle">🎧</div>
                  <div className="device-info-text">
                    <span className="device-name">Sony WH-1000XM4</span>
                    <span className="device-type">Kulaklık · Eşleşti</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Network & Internet */}
        {activeTab === "network" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Ağ ve İnternet</h2>

            <div className="spec-card glass">
              <div className="connection-status-header">
                <div className="connection-icon-box">🌐</div>
                <div>
                  <h3>Wi-Fi Bağlantısı</h3>
                  <p
                    className="spec-sub"
                    style={{
                      color: wifi ? "#4cd964" : "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {wifi ? "Bağlı · İnternet Erişimi" : "Bağlantı kapalı"}
                  </p>
                </div>
              </div>

              <div className="spec-details-list" style={{ marginTop: "20px" }}>
                <div className="spec-row">
                  <span className="spec-label">IPv4 Adresi:</span>
                  <span className="spec-value">192.168.1.104</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Bağlantı Hızı:</span>
                  <span className="spec-value">1000/1000 (Mbps)</span>
                </div>
              </div>
            </div>

            <div className="spec-card glass" style={{ marginTop: "20px" }}>
              <div className="mock-toggle-row">
                <div className="mock-toggle-info">
                  <span className="mock-toggle-title">Wi-Fi</span>
                  <span className="mock-toggle-desc">
                    Kablosuz ağ bağlantısını açın veya kapatın.
                  </span>
                </div>
                <button
                  type="button"
                  className={`settings-mock-switch ${wifi ? "active" : ""}`}
                  onClick={() => setWifi(!wifi)}
                  aria-pressed={wifi}
                  aria-label="Wi-Fi"
                >
                  {wifi ? "Açık" : "Kapalı"}
                </button>
              </div>
              <div className="mock-toggle-row">
                <div className="mock-toggle-info">
                  <span className="mock-toggle-title">Uçak Modu</span>
                  <span className="mock-toggle-desc">
                    Tüm kablosuz iletişimleri (Wi-Fi, Bluetooth) tek seferde
                    kapatın.
                  </span>
                </div>
                <button
                  className={`settings-mock-switch ${airplaneMode ? "active" : ""}`}
                  onClick={() => setAirplaneMode(!airplaneMode)}
                  aria-pressed={airplaneMode}
                  aria-label="Uçak modu"
                >
                  {airplaneMode ? "Açık" : "Kapalı"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Personalization */}
        {activeTab === "personalization" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Kişiselleştirme</h2>

            <div className="personalize-card glass">
              <h3>Tema Seçimi</h3>
              <p className="spec-sub" style={{ marginBottom: "15px" }}>
                Sistem temasını değiştirmek için bir tema kartı seçin:
              </p>

              <div className="theme-selector-cards">
                <div
                  className={`theme-card ${theme === "light" ? "active" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <div className="theme-card-preview light-preview" />
                  <div className="theme-card-label">Açık Tema (Light)</div>
                </div>

                <div
                  className={`theme-card ${theme === "dark" ? "active" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="theme-card-preview dark-preview" />
                  <div className="theme-card-label">Karanlık Tema (Dark)</div>
                </div>
              </div>
            </div>

            <div
              className="personalize-card glass"
              style={{ marginTop: "20px" }}
            >
              <h3>Masaüstü Duvar Kağıdı</h3>
              <p className="spec-sub" style={{ marginBottom: "15px" }}>
                Değiştirmek istediğiniz duvar kağıdına tıklayın:
              </p>

              <div className="wallpapers-grid">
                {WALLPAPERS.map((wallUrl, idx) => (
                  <div
                    key={idx}
                    className={`wallpaper-thumb ${wallpaper === wallUrl ? "active" : ""}`}
                    style={{ backgroundImage: `url(${wallUrl})` }}
                    onClick={() => setWallpaper(wallUrl)}
                  >
                    {wallpaper === wallUrl && (
                      <div className="wallpaper-active-badge">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Apps */}
        {activeTab === "apps" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Uygulamalar</h2>

            <div className="personalize-card glass">
              <h3>Yüklü Uygulamalar</h3>
              <p className="spec-sub" style={{ marginBottom: "15px" }}>
                Sisteminizde kayıtlı olan uygulamaların listesi:
              </p>

              <div className="apps-installed-list">
                <div className="app-install-item">
                  <div className="app-icon-img">📁</div>
                  <div className="app-details-text">
                    <span className="app-name">Dosya Gezgini</span>
                    <span className="app-ver">Sürüm 11.0.1 (Sistem)</span>
                  </div>
                </div>
                <div className="app-install-item">
                  <div className="app-icon-img">🌐</div>
                  <div className="app-details-text">
                    <span className="app-name">Google Chrome</span>
                    <span className="app-ver">Sürüm 122.0.6261 (Sistem)</span>
                  </div>
                </div>
                <div className="app-install-item">
                  <div className="app-icon-img">📝</div>
                  <div className="app-details-text">
                    <span className="app-name">Not Defteri</span>
                    <span className="app-ver">Sürüm 11.2312 (Sistem)</span>
                  </div>
                </div>
                <div className="app-install-item">
                  <div className="app-icon-img">⚙️</div>
                  <div className="app-details-text">
                    <span className="app-name">Sistem Ayarları</span>
                    <span className="app-ver">Sürüm 11.26H2 (Sistem)</span>
                  </div>
                </div>
                <div className="app-install-item">
                  <div className="app-icon-img">📥</div>
                  <div className="app-details-text">
                    <span className="app-name">Free Download Manager</span>
                    <span className="app-ver">Sürüm 6.20.0 (Kullanıcı)</span>
                  </div>
                </div>
                <div className="app-install-item">
                  <div className="app-icon-img">⚡</div>
                  <div className="app-details-text">
                    <span className="app-name">qBittorrent</span>
                    <span className="app-ver">Sürüm 4.6.3 (Kullanıcı)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Accounts */}
        {activeTab === "accounts" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Hesaplar</h2>

            <div className="spec-card glass">
              <div className="account-profile-header">
                <img
                  src={OS_USER.avatarUrl}
                  alt={OS_USER.displayName}
                  className="profile-big-avatar"
                />
                <div className="profile-text">
                  <h3>{OS_USER.displayName}</h3>
                  <span className="account-badge">{OS_USER.accountRole}</span>
                  <p className="spec-sub">{OS_USER.email}</p>
                </div>
              </div>
            </div>

            <div className="spec-card glass" style={{ marginTop: "20px" }}>
              <h3>Eşitleme Seçenekleri</h3>
              <div className="mock-toggle-row">
                <div className="mock-toggle-info">
                  <span className="mock-toggle-title">Ayarlarımı Eşitle</span>
                  <span className="mock-toggle-desc">
                    Tema, şifre ve dil ayarlarını diğer cihazlarınızla
                    senkronize edin.
                  </span>
                </div>
                <button
                  className={`settings-mock-switch ${mockSettings.developerMode ? "active" : ""}`}
                  onClick={() => toggleMockSetting("developerMode")}
                >
                  {mockSettings.developerMode ? "Açık" : "Kapalı"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Time & Language */}
        {activeTab === "time" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Zaman ve dil</h2>

            <div className="personalize-card glass">
              <div className="mock-toggle-row">
                <div className="mock-toggle-info">
                  <span className="mock-toggle-title">
                    Saati Otomatik Olarak Ayarla
                  </span>
                  <span className="mock-toggle-desc">
                    İnternet saat sunucusunu kullanarak saati güncel tutar.
                  </span>
                </div>
                <button
                  className={`settings-mock-switch ${mockSettings.autoTime ? "active" : ""}`}
                  onClick={() => toggleMockSetting("autoTime")}
                >
                  {mockSettings.autoTime ? "Açık" : "Kapalı"}
                </button>
              </div>

              <div className="spec-details-list" style={{ marginTop: "20px" }}>
                <div className="spec-row">
                  <span className="spec-label">Bölgesel Biçim:</span>
                  <span className="spec-value">Türkçe (Türkiye)</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Saat Dilimi:</span>
                  <span className="spec-value">(UTC+03:00) İstanbul</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Gaming */}
        {activeTab === "gaming" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Oyun Ayarları</h2>

            <div className="personalize-card glass">
              <h3>Oyun Modu</h3>
              <p className="spec-sub" style={{ marginBottom: "15px" }}>
                Sistem kaynaklarını oyun performansı için optimize edin.
              </p>

              <div className="spec-details-list">
                <div className="mock-toggle-row">
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">Oyun Modunu Aç</span>
                    <span className="mock-toggle-desc">
                      Oyun sırasında arka plan işlemlerini duraklatarak FPS
                      dengesini artırır.
                    </span>
                  </div>
                  <button
                    className={`settings-mock-switch ${mockSettings.gameMode ? "active" : ""}`}
                    onClick={() => toggleMockSetting("gameMode")}
                  >
                    {mockSettings.gameMode ? "Açık" : "Kapalı"}
                  </button>
                </div>

                <div className="mock-toggle-row" style={{ marginTop: "10px" }}>
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">Xbox Game Bar</span>
                    <span className="mock-toggle-desc">
                      Oyun klipleri kaydetmek, arkadaşlarınızla sohbet etmek ve
                      widget kullanmak için kısayollar.
                    </span>
                  </div>
                  <button
                    className={`settings-mock-switch ${mockSettings.gameBar ? "active" : ""}`}
                    onClick={() => toggleMockSetting("gameBar")}
                  >
                    {mockSettings.gameBar ? "Açık" : "Kapalı"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Accessibility */}
        {activeTab === "accessibility" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Erişilebilirlik</h2>

            <div className="personalize-card glass">
              <h3>Görme ve İşitme Destekleri</h3>
              <p className="spec-sub" style={{ marginBottom: "15px" }}>
                Ekran görünümünü ve ses çıkışlarını kendinize göre uyarlayın.
              </p>

              <div className="spec-details-list">
                <div className="mock-toggle-row">
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">
                      Ekran Okuyucusu (Narrator)
                    </span>
                    <span className="mock-toggle-desc">
                      Ekranda yer alan metinleri ve butonları sesli olarak okur.
                    </span>
                  </div>
                  <button
                    className={`settings-mock-switch ${mockSettings.narrator ? "active" : ""}`}
                    onClick={() => toggleMockSetting("narrator")}
                  >
                    {mockSettings.narrator ? "Açık" : "Kapalı"}
                  </button>
                </div>

                <div className="mock-toggle-row" style={{ marginTop: "10px" }}>
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">Mono Ses</span>
                    <span className="mock-toggle-desc">
                      Sol ve sağ ses kanallarını birleştirerek her iki kanaldan
                      da aynı sesi verir.
                    </span>
                  </div>
                  <button
                    className={`settings-mock-switch ${mockSettings.monoAudio ? "active" : ""}`}
                    onClick={() => toggleMockSetting("monoAudio")}
                  >
                    {mockSettings.monoAudio ? "Açık" : "Kapalı"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Privacy & Security */}
        {activeTab === "privacy" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Gizlilik ve güvenlik</h2>

            <div className="personalize-card glass">
              <h3>Uygulama İzinleri</h3>
              <p className="spec-sub" style={{ marginBottom: "15px" }}>
                Uygulamaların donanımlara erişimini yönetin:
              </p>

              <div className="spec-details-list">
                <div className="mock-toggle-row">
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">Konum Servisleri</span>
                    <span className="mock-toggle-desc">
                      Harita ve hava durumu uygulamaları için konum erişimi.
                    </span>
                  </div>
                  <button
                    className={`settings-mock-switch ${mockSettings.locationServices ? "active" : ""}`}
                    onClick={() => toggleMockSetting("locationServices")}
                  >
                    {mockSettings.locationServices ? "Açık" : "Kapalı"}
                  </button>
                </div>

                <div className="mock-toggle-row">
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">Kamera Erişimi</span>
                    <span className="mock-toggle-desc">
                      Kamerayı kullanmak isteyen uygulamalara izin ver.
                    </span>
                  </div>
                  <button
                    className={`settings-mock-switch ${mockSettings.cameraAccess ? "active" : ""}`}
                    onClick={() => toggleMockSetting("cameraAccess")}
                  >
                    {mockSettings.cameraAccess ? "Açık" : "Kapalı"}
                  </button>
                </div>

                <div className="mock-toggle-row">
                  <div className="mock-toggle-info">
                    <span className="mock-toggle-title">Mikrofon Erişimi</span>
                    <span className="mock-toggle-desc">
                      Mikrofonu kullanmak isteyen uygulamalara izin ver.
                    </span>
                  </div>
                  <button
                    className={`settings-mock-switch ${mockSettings.microphoneAccess ? "active" : ""}`}
                    onClick={() => toggleMockSetting("microphoneAccess")}
                  >
                    {mockSettings.microphoneAccess ? "Açık" : "Kapalı"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Windows Update */}
        {activeTab === "update" && (
          <div className="settings-tab-view animate-fade-in">
            <h2 className="settings-title">Windows Update</h2>

            <div className="spec-card glass">
              <div className="update-status-header">
                <div
                  className={`update-status-icon ${isCheckingUpdate ? "loading" : ""}`}
                >
                  {isCheckingUpdate ? "🔄" : "✓"}
                </div>
                <div>
                  <h3>{updateHeader}</h3>
                  <p className="spec-sub">{updateCheckedText}</p>
                </div>
              </div>

              <div className="update-actions-row" style={{ marginTop: "20px" }}>
                <button
                  className="settings-theme-btn"
                  onClick={handleCheckForUpdates}
                  disabled={isCheckingUpdate}
                >
                  {isCheckingUpdate
                    ? "Denetleniyor..."
                    : "Güncelleştirmeleri Denetle"}
                </button>
              </div>
            </div>

            <div className="spec-card glass" style={{ marginTop: "20px" }}>
              <div className="mock-toggle-row">
                <div className="mock-toggle-info">
                  <span className="mock-toggle-title">
                    Otomatik Güncelleştirmeler
                  </span>
                  <span className="mock-toggle-desc">
                    Güvenlik düzeltmelerini ve yeni özellikleri çıktığı anda
                    alın.
                  </span>
                </div>
                <button
                  className={`settings-mock-switch ${mockSettings.autoUpdate ? "active" : ""}`}
                  onClick={() => toggleMockSetting("autoUpdate")}
                >
                  {mockSettings.autoUpdate ? "Açık" : "Kapalı"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsApp;
