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
  Accessibility,
  ChevronRight,
  Monitor,
  Volume2,
  HardDrive,
  Battery,
  Bluetooth,
  Wifi,
  Moon,
  Sun,
} from "lucide-react";
import { OS_USER } from "../../osUser";
import { WALLPAPERS, isLiveWallpaper } from "../../wallpapers";
import LiveWallpaper from "../Desktop/LiveWallpaper";
import {
  WIFI_SSID,
  BLUETOOTH_CONNECTED_DEVICES,
} from "../../networkState";
import "./settings.css";

interface SettingsProps {
  params?: WindowParams;
}


type NavId =
  | "system"
  | "devices"
  | "network"
  | "personalization"
  | "apps"
  | "accounts"
  | "time"
  | "accessibility"
  | "privacy"
  | "update";


const SettingsSwitch: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    type="button"
    className={`settings-switch ${active ? "on" : ""}`}
    onClick={onClick}
    aria-pressed={active}
    aria-label={label}
  >
    <span className="settings-switch-thumb" />
  </button>
);

const SettingsRow: React.FC<{
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
}> = ({ icon, title, desc, onClick, trailing }) => (
  <div
    className={"settings-list-row" + (onClick ? " clickable" : "")}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
  >
    {icon && <span className="settings-row-icon">{icon}</span>}
    <span className="settings-row-text">
      <span className="settings-row-title">{title}</span>
      {desc && <span className="settings-row-desc">{desc}</span>}
    </span>
    {trailing ?? <ChevronRight size={16} className="settings-row-chevron" />}
  </div>
);

const GroupCard: React.FC<{
  children: React.ReactNode;
  title?: string;
}> = ({ children, title }) => (
  <div className="settings-group-card">
    {title && <h3 className="settings-group-title">{title}</h3>}
    <div className="settings-group-body">{children}</div>
  </div>
);

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
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateHeader, setUpdateHeader] = useState("Güncelsiniz");
  const [updateCheckedText, setUpdateCheckedText] = useState(
    "Son denetleme: Bugün, 16:56",
  );

  const [mockSettings, setMockSettings] = useState<{ [key: string]: boolean }>({
    fastBoot: true,
    autoUpdate: true,
    diagnosticData: false,
    developerMode: false,
    locationServices: true,
    cameraAccess: true,
    microphoneAccess: true,
    autoTime: true,
    narrator: false,
    monoAudio: false,
  });

  const toggleMockSetting = (key: string) => {
    setMockSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckForUpdates = () => {
    setIsCheckingUpdate(true);
    setUpdateHeader("Güncelleştirmeler denetleniyor...");
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateHeader("Güncelsiniz");
      setUpdateCheckedText("Son denetleme: Az önce");
    }, 1500);
  };

  // Depend on the params object, not params.tab: the window reducer creates a
  // new params object per openApp, so re-requesting the same tab still switches.
  useEffect(() => {
    if (!params?.tab) return;
    const timer = window.setTimeout(() => setActiveTab(params.tab as string), 0);
    return () => window.clearTimeout(timer);
  }, [params]);

  const sidebarItems: { id: NavId; name: string; icon: React.ReactNode }[] = [
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
    {
      id: "accessibility",
      name: "Erişilebilirlik",
      icon: <Accessibility size={16} />,
    },
    { id: "privacy", name: "Gizlilik ve güvenlik", icon: <Shield size={16} /> },
    { id: "update", name: "Windows Update", icon: <RefreshCw size={16} /> },
  ];

  const filteredSidebarItems = sidebarItems.filter((item) =>
    item.name.toLowerCase().includes(sidebarSearch.toLowerCase()),
  );

  return (
    <div className="settings-app-container">
      <aside className="settings-sidebar">
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

        <div className="sidebar-search-box">
          <Search size={14} className="sidebar-search-icon" />
          <input
            type="text"
            placeholder="Bir ayar bulun"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            aria-label="Ayarlarda ara"
          />
        </div>

        <nav className="sidebar-nav-list" aria-label="Ayarlar kategorileri">
          {filteredSidebarItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              {activeTab === item.id && (
                <span className="active-indicator" aria-hidden />
              )}
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="settings-main-content">
        {/* SYSTEM HOME */}
        {activeTab === "system" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Sistem</h1>

            <div className="settings-hero-card">
              <div className="settings-hero-copy">
                <h2 className="settings-hero-title">{OS_USER.hostname}</h2>
                <p className="settings-hero-sub">
                  Windows 11 Pro · React Web Edition · 26H2
                </p>
                <p className="settings-hero-meta">
                  AMD EPYC 9965 · 256 GB RAM · NVMe 2 TB
                </p>
                <button
                  type="button"
                  className="settings-hero-cta"
                  onClick={() => {
                    const el = document.getElementById("settings-about");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Bu bilgisayar hakkında
                </button>
              </div>
              <div className="settings-hero-device" aria-hidden>
                <Monitor size={72} strokeWidth={1.25} />
                <span className="settings-hero-device-label">PC</span>
              </div>
            </div>

            <div className="settings-shortcut-grid">
              <button
                type="button"
                className="settings-shortcut-tile"
                onClick={() => setActiveTab("personalization")}
              >
                <Paintbrush size={22} />
                <span>
                  <strong>Ekran</strong>
                  <small>Parlaklık, gece ışığı</small>
                </span>
              </button>
              <button
                type="button"
                className="settings-shortcut-tile"
                onClick={() => setActiveTab("system")}
              >
                <Volume2 size={22} />
                <span>
                  <strong>Ses</strong>
                  <small>Çıkış birimleri, düzey</small>
                </span>
              </button>
              <button
                type="button"
                className="settings-shortcut-tile"
                onClick={() => setActiveTab("network")}
              >
                <Wifi size={22} />
                <span>
                  <strong>Wi-Fi</strong>
                  <small>{wifi ? WIFI_SSID : "Kapalı"}</small>
                </span>
              </button>
              <button
                type="button"
                className="settings-shortcut-tile"
                onClick={() => setActiveTab("update")}
              >
                <RefreshCw size={22} />
                <span>
                  <strong>Windows Update</strong>
                  <small>Güncelsiniz</small>
                </span>
              </button>
              <button
                type="button"
                className="settings-shortcut-tile"
                onClick={() => setActiveTab("devices")}
              >
                <Bluetooth size={22} />
                <span>
                  <strong>Bluetooth</strong>
                  <small>{bluetooth ? "Açık · bağlı değil" : "Kapalı"}</small>
                </span>
              </button>
              <button
                type="button"
                className="settings-shortcut-tile"
                onClick={() => setEnergySaver(!energySaver)}
              >
                <Battery size={22} />
                <span>
                  <strong>Güç</strong>
                  <small>{energySaver ? "Tasarruf açık" : "Dengeli"}</small>
                </span>
              </button>
            </div>

            <GroupCard>
              <SettingsRow
                icon={<Monitor size={18} />}
                title="Ekran"
                desc={`Parlaklık %${brightness}`}
                trailing={
                  <input
                    type="range"
                    className="settings-inline-slider"
                    min={10}
                    max={100}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    aria-label="Parlaklık"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              />
              <SettingsRow
                icon={<HardDrive size={18} />}
                title="Depolama"
                desc="NVMe M.2 SSD 2 TB"
              />
              <SettingsRow
                icon={<Battery size={18} />}
                title="Güç ve pil"
                desc={energySaver ? "Enerji tasarrufu açık" : "Dengeli"}
                trailing={
                  <SettingsSwitch
                    active={energySaver}
                    onClick={() => setEnergySaver(!energySaver)}
                    label="Enerji tasarrufu"
                  />
                }
              />
              <SettingsRow
                icon={<Cpu size={18} />}
                title="Hakkında"
                desc={OS_USER.hostname}
                onClick={() =>
                  document
                    .getElementById("settings-about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              />
            </GroupCard>

            <div id="settings-about" className="settings-group-card">
              <h3 className="settings-group-title">Cihaz özellikleri</h3>
              <div className="settings-group-body settings-about-rows">
                <div className="settings-kv">
                  <span>İşlemci</span>
                  <span>AMD EPYC 9965 192-Core @ 2.25 GHz</span>
                </div>
                <div className="settings-kv">
                  <span>Takılı RAM</span>
                  <span>256 GB DDR5 ECC</span>
                </div>
                <div className="settings-kv">
                  <span>Sistem türü</span>
                  <span>64 bit işletim sistemi, x64 tabanlı işlemci</span>
                </div>
                <div className="settings-kv">
                  <span>Edisyon</span>
                  <span>Windows 11 Pro (React Web Edition)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BLUETOOTH */}
        {activeTab === "devices" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Bluetooth ve cihazlar</h1>
            <GroupCard>
              <SettingsRow
                icon={<Bluetooth size={18} />}
                title="Bluetooth"
                desc="Yakındaki aygıtları bulun ve bağlayın"
                trailing={
                  <SettingsSwitch
                    active={bluetooth}
                    onClick={() => setBluetooth(!bluetooth)}
                    label="Bluetooth"
                  />
                }
              />
            </GroupCard>
            <GroupCard title="Bağlı cihazlar">
              {BLUETOOTH_CONNECTED_DEVICES.length === 0 ? (
                <SettingsRow
                  title="Bağlı cihaz yok"
                  desc={
                    bluetooth
                      ? "Bluetooth açık · yakın cihaz aranıyor"
                      : "Bluetooth kapalı"
                  }
                />
              ) : (
                BLUETOOTH_CONNECTED_DEVICES.map((name) => (
                  <SettingsRow key={name} title={name} desc="Bağlı" />
                ))
              )}
            </GroupCard>
          </div>
        )}

        {/* NETWORK */}
        {activeTab === "network" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Ağ ve İnternet</h1>
            <div className="settings-hero-card settings-hero-compact">
              <div className="settings-hero-copy">
                <h2 className="settings-hero-title">Wi-Fi</h2>
                <p
                  className="settings-hero-sub"
                  style={{
                    color: wifi ? "#107c10" : undefined,
                    fontWeight: 600,
                  }}
                >
                  {wifi
                    ? `Bağlı · ${WIFI_SSID} · İnternet erişimi`
                    : "Bağlantı kapalı"}
                </p>
                <p className="settings-hero-meta">
                  {wifi ? `SSID: ${WIFI_SSID} · 192.168.1.104 · 1000/1000 Mbps` : "Wi-Fi kapalı"}
                </p>
              </div>
              <div className="settings-hero-device" aria-hidden>
                <Wifi size={56} strokeWidth={1.25} />
              </div>
            </div>
            <GroupCard>
              <SettingsRow
                icon={<Wifi size={18} />}
                title="Wi-Fi"
                desc="Kablosuz ağ bağlantısı"
                trailing={
                  <SettingsSwitch
                    active={wifi}
                    onClick={() => setWifi(!wifi)}
                    label="Wi-Fi"
                  />
                }
              />
              <SettingsRow
                title="Uçak modu"
                desc="Tüm kablosuz iletişimleri kapatır"
                trailing={
                  <SettingsSwitch
                    active={airplaneMode}
                    onClick={() => setAirplaneMode(!airplaneMode)}
                    label="Uçak modu"
                  />
                }
              />
            </GroupCard>
          </div>
        )}

        {/* PERSONALIZATION */}
        {activeTab === "personalization" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Kişiselleştirme</h1>
            <GroupCard title="Tema">
              <div className="theme-selector-cards">
                <button
                  type="button"
                  className={`theme-card ${theme === "light" ? "active" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <div className="theme-card-preview light-preview" />
                  <div className="theme-card-label">
                    <Sun size={14} /> Açık
                  </div>
                </button>
                <button
                  type="button"
                  className={`theme-card ${theme === "dark" ? "active" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="theme-card-preview dark-preview" />
                  <div className="theme-card-label">
                    <Moon size={14} /> Karanlık
                  </div>
                </button>
              </div>
            </GroupCard>
            <GroupCard title="Arka plan">
              <div className="wallpapers-grid">
                {WALLPAPERS.map((wallUrl, idx) => {
                  const live = isLiveWallpaper(wallUrl);
                  return (
                    <button
                      type="button"
                      key={wallUrl}
                      className={`wallpaper-thumb${live ? " wallpaper-thumb--live" : ""}${wallpaper === wallUrl ? " active" : ""}`}
                      style={live ? undefined : { backgroundImage: `url(${wallUrl})` }}
                      onClick={() => setWallpaper(wallUrl)}
                      aria-label={
                        live
                          ? "Canlı duvar kağıdı"
                          : `Duvar kağıdı ${idx}`
                      }
                    >
                      {live && (
                        <>
                          <LiveWallpaper variant="thumb" />
                          <span className="wallpaper-live-label">Canlı</span>
                        </>
                      )}
                      {wallpaper === wallUrl && (
                        <span className="wallpaper-active-badge">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </GroupCard>
          </div>
        )}

        {/* APPS */}
        {activeTab === "apps" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Uygulamalar</h1>
            <GroupCard title="Yüklü uygulamalar">
              <SettingsRow title="Dosya Gezgini" desc="Sürüm 11.0.1 (Sistem)" />
              <SettingsRow title="Microsoft Edge" desc="Sürüm 122 (Sistem)" />
              <SettingsRow title="Not Defteri" desc="Sürüm 11.2312 (Sistem)" />
              <SettingsRow title="Sistem Ayarları" desc="Sürüm 11.26H2" />
              <SettingsRow
                title="Free Download Manager"
                desc="Sürüm 6.20.0"
              />
              <SettingsRow title="qBittorrent" desc="Sürüm 4.6.3" />
            </GroupCard>
          </div>
        )}

        {/* ACCOUNTS */}
        {activeTab === "accounts" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Hesaplar</h1>
            <div className="settings-hero-card settings-hero-compact">
              <div className="settings-hero-copy settings-account-hero">
                <img
                  src={OS_USER.avatarUrl}
                  alt=""
                  className="settings-account-avatar"
                />
                <div>
                  <h2 className="settings-hero-title">{OS_USER.displayName}</h2>
                  <p className="settings-hero-sub">{OS_USER.email}</p>
                  <p className="settings-hero-meta">{OS_USER.accountRole}</p>
                </div>
              </div>
            </div>
            <GroupCard>
              <SettingsRow
                title="Ayarlarımı eşitle"
                desc="Tema ve dil tercihlerini senkronize et"
                trailing={
                  <SettingsSwitch
                    active={mockSettings.developerMode}
                    onClick={() => toggleMockSetting("developerMode")}
                    label="Eşitleme"
                  />
                }
              />
            </GroupCard>
          </div>
        )}

        {/* TIME */}
        {activeTab === "time" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Zaman ve dil</h1>
            <GroupCard>
              <SettingsRow
                title="Saati otomatik olarak ayarla"
                desc="İnternet saat sunucusu"
                trailing={
                  <SettingsSwitch
                    active={mockSettings.autoTime}
                    onClick={() => toggleMockSetting("autoTime")}
                    label="Otomatik saat"
                  />
                }
              />
              <SettingsRow
                title="Bölgesel biçim"
                desc="Türkçe (Türkiye)"
              />
              <SettingsRow
                title="Saat dilimi"
                desc="(UTC+03:00) İstanbul"
              />
            </GroupCard>
          </div>
        )}

        {/* ACCESSIBILITY */}
        {activeTab === "accessibility" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Erişilebilirlik</h1>
            <GroupCard title="Görme ve işitme">
              <SettingsRow
                title="Ekran Okuyucusu"
                desc="Metinleri ve düğmeleri sesli okur"
                trailing={
                  <SettingsSwitch
                    active={mockSettings.narrator}
                    onClick={() => toggleMockSetting("narrator")}
                    label="Ekran Okuyucusu"
                  />
                }
              />
              <SettingsRow
                title="Mono ses"
                desc="Sol ve sağ kanalları birleştirir"
                trailing={
                  <SettingsSwitch
                    active={mockSettings.monoAudio}
                    onClick={() => toggleMockSetting("monoAudio")}
                    label="Mono ses"
                  />
                }
              />
            </GroupCard>
          </div>
        )}

        {/* PRIVACY */}
        {activeTab === "privacy" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Gizlilik ve güvenlik</h1>
            <GroupCard title="Uygulama izinleri">
              <SettingsRow
                title="Konum"
                desc="Harita ve hava durumu için konum"
                trailing={
                  <SettingsSwitch
                    active={mockSettings.locationServices}
                    onClick={() => toggleMockSetting("locationServices")}
                    label="Konum"
                  />
                }
              />
              <SettingsRow
                title="Kamera"
                desc="Uygulamaların kamera erişimi"
                trailing={
                  <SettingsSwitch
                    active={mockSettings.cameraAccess}
                    onClick={() => toggleMockSetting("cameraAccess")}
                    label="Kamera"
                  />
                }
              />
              <SettingsRow
                title="Mikrofon"
                desc="Uygulamaların mikrofon erişimi"
                trailing={
                  <SettingsSwitch
                    active={mockSettings.microphoneAccess}
                    onClick={() => toggleMockSetting("microphoneAccess")}
                    label="Mikrofon"
                  />
                }
              />
            </GroupCard>
          </div>
        )}

        {/* UPDATE */}
        {activeTab === "update" && (
          <div className="settings-tab-view animate-fade-in">
            <h1 className="settings-title">Windows Update</h1>
            <div className="settings-hero-card settings-hero-compact">
              <div className="settings-hero-copy">
                <h2 className="settings-hero-title">{updateHeader}</h2>
                <p className="settings-hero-sub">{updateCheckedText}</p>
                <button
                  type="button"
                  className="settings-hero-cta"
                  onClick={handleCheckForUpdates}
                  disabled={isCheckingUpdate}
                >
                  {isCheckingUpdate
                    ? "Denetleniyor..."
                    : "Güncelleştirmeleri denetle"}
                </button>
              </div>
              <div className="settings-hero-device" aria-hidden>
                <RefreshCw
                  size={56}
                  strokeWidth={1.25}
                  className={isCheckingUpdate ? "spin" : ""}
                />
              </div>
            </div>
            <GroupCard>
              <SettingsRow
                title="Otomatik güncelleştirmeler"
                desc="Güvenlik düzeltmelerini otomatik alın"
                trailing={
                  <SettingsSwitch
                    active={mockSettings.autoUpdate}
                    onClick={() => toggleMockSetting("autoUpdate")}
                    label="Otomatik güncelleştirme"
                  />
                }
              />
            </GroupCard>
          </div>
        )}
      </main>
    </div>
  );
};

export default SettingsApp;