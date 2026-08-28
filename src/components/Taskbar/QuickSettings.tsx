import React, { useState } from "react";
import { useSystem } from "../../context/SystemContext";
import { useWindow } from "../../context/WindowContext";
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Volume2,
  VolumeX,
  SunDim,
  Settings,
  Battery,
  ChevronRight,
  Plane,
  Accessibility,
  Leaf,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
} from "lucide-react";
import "./quicksettings.css";

export const QuickSettings: React.FC = () => {
  const {
    isQuickSettingsOpen,
    setQuickSettingsOpen,
    wifi,
    setWifi,
    bluetooth,
    setBluetooth,
    volume,
    setVolume,
    brightness,
    setBrightness,
    theme,
    toggleTheme,
    airplaneMode,
    setAirplaneMode,
    energySaver,
    setEnergySaver,
    isFullscreen,
    toggleFullscreen,
  } = useSystem();

  const { openApp } = useWindow();

  // State controls for media card and toggles
  const [isPlaying, setIsPlaying] = useState(true);

  const mockSongs = [
    {
      title: "Midnight Focus",
      artist: "Desktop Sessions",
      thumb:
        "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=120&q=80",
    },
    {
      title: "Sweater Weather",
      artist: "The Neighbourhood",
      thumb:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&q=80",
    },
    {
      title: "Relaxing Lofi Beats",
      artist: "Lofi Chill",
      thumb:
        "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=120&q=80",
    },
  ];
  const [songIndex, setSongIndex] = useState(0);

  const playVolumeBeep = (volLevel: number) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime((volLevel / 100) * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
      osc.addEventListener("ended", () => void ctx.close(), { once: true });
    } catch (e) {
      console.warn("AudioContext failed to beep", e);
    }
  };

  if (!isQuickSettingsOpen) return null;

  const handleWifiToggle = () => setWifi(!wifi);
  const handleBluetoothToggle = () => setBluetooth(!bluetooth);

  const handleSettingsClick = () => {
    openApp("settings");
    setQuickSettingsOpen(false);
  };

  const handleOpenSettingsTab = (tabId: string) => {
    openApp("settings", { tab: tabId });
    setQuickSettingsOpen(false);
  };

  const handlePrevSong = () => {
    setSongIndex((prev) => (prev === 0 ? mockSongs.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleNextSong = () => {
    setSongIndex((prev) => (prev === mockSongs.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
  };

  return (
    <div
      className="quick-settings-container"
      role="dialog"
      aria-label="Hızlı ayarlar"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Floating Media Control Card */}
      <div className="quick-settings-media-card glass">
        <div className="media-card-header">
          <span className="media-app-icon">🦁</span>
          <span className="media-app-name">Brave</span>
        </div>

        <div className="media-card-body">
          <div className="media-info-text">
            <span className="media-title">
              {isPlaying ? mockSongs[songIndex].title : "Medya Duraklatıldı"}
            </span>
            <span className="media-artist">{mockSongs[songIndex].artist}</span>
          </div>
          <div
            className="media-thumbnail"
            style={{
              backgroundImage: `url('${mockSongs[songIndex].thumb}')`,
            }}
          />
        </div>

        <div className="media-controls">
          <button
            className="media-ctrl-btn"
            onClick={handlePrevSong}
            aria-label="Önceki parça"
          >
            <SkipBack size={14} fill="currentColor" />
          </button>
          <button
            className="media-ctrl-btn play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Duraklat" : "Oynat"}
          >
            {isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
          </button>
          <button
            className="media-ctrl-btn"
            onClick={handleNextSong}
            aria-label="Sonraki parça"
          >
            <SkipForward size={14} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="quick-settings-main-panel glass">
        {/* Toggles Grid - 2x3 layout */}
        <div className="toggles-grid">
          {/* Wi-Fi (Split Button) */}
          <div className="toggle-item-wrapper">
            <div className={`toggle-pill-split ${wifi ? "active" : ""}`}>
              <button
                className="toggle-pill-main"
                onClick={handleWifiToggle}
                title="Wi-Fi"
                aria-pressed={wifi}
              >
                {wifi ? <Wifi size={15} /> : <WifiOff size={15} />}
              </button>
              <div className="toggle-pill-divider" />
              <button
                className="toggle-pill-arrow"
                onClick={() => handleOpenSettingsTab("network")}
                title="Ağ Seç"
              >
                <ChevronRight size={10} />
              </button>
            </div>
            <span className="toggle-item-label">
              {wifi ? "Zyxel_6491_5G" : "Bağlı değil"}
            </span>
          </div>

          {/* Bluetooth (Split Button) */}
          <div className="toggle-item-wrapper">
            <div className={`toggle-pill-split ${bluetooth ? "active" : ""}`}>
              <button
                className="toggle-pill-main"
                onClick={handleBluetoothToggle}
                title="Bluetooth"
                aria-pressed={bluetooth}
              >
                <Bluetooth size={15} />
              </button>
              <div className="toggle-pill-divider" />
              <button
                className="toggle-pill-arrow"
                onClick={() => handleOpenSettingsTab("devices")}
                title="Cihaz Seç"
              >
                <ChevronRight size={10} />
              </button>
            </div>
            <span className="toggle-item-label">Bluetooth</span>
          </div>

          {/* Airplane Mode (Single Button) */}
          <div className="toggle-item-wrapper">
            <button
              className={`toggle-pill-single ${airplaneMode ? "active" : ""}`}
              onClick={() => setAirplaneMode(!airplaneMode)}
              title="Uçak Modu"
              aria-pressed={airplaneMode}
            >
              <Plane size={15} />
            </button>
            <span className="toggle-item-label">Uçak modu</span>
          </div>

          {/* Accessibility (Split Button) */}
          <div className="toggle-item-wrapper">
            <div className="toggle-pill-split">
              <button
                className="toggle-pill-main"
                onClick={() => handleOpenSettingsTab("accessibility")}
                title="Erişilebilirlik"
              >
                <Accessibility size={15} />
              </button>
              <div className="toggle-pill-divider" />
              <button
                className="toggle-pill-arrow"
                onClick={() => handleOpenSettingsTab("accessibility")}
                title="Erişilebilirlik Ayarları"
              >
                <ChevronRight size={10} />
              </button>
            </div>
            <span className="toggle-item-label">Erişilebilirlik</span>
          </div>

          {/* Energy Saver (Single Button) */}
          <div className="toggle-item-wrapper">
            <button
              className={`toggle-pill-single ${energySaver ? "active" : ""}`}
              onClick={() => setEnergySaver(!energySaver)}
              title="Enerji Tasarrufu"
              aria-pressed={energySaver}
            >
              <Leaf size={15} />
            </button>
            <span className="toggle-item-label">Enerji tasarrufu</span>
          </div>

          {/* Dark Mode (Single Button) */}
          <div className="toggle-item-wrapper">
            <button
              className={`toggle-pill-single ${theme === "dark" ? "active" : ""}`}
              onClick={toggleTheme}
              title="Karanlık Mod"
              aria-pressed={theme === "dark"}
            >
              {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <span className="toggle-item-label">
              {theme === "dark" ? "Karanlık mod" : "Aydınlık mod"}
            </span>
          </div>
        </div>

        <div className="quick-settings-separator" />

        {/* Sliders Area */}
        <div className="sliders-section">
          {/* Brightness Slider */}
          <div className="slider-row">
            <SunDim size={16} className="slider-static-icon" />
            <input
              type="range"
              min="10"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="quick-slider"
              aria-label="Ekran parlaklığı"
              aria-valuetext={`Yüzde ${brightness}`}
            />
            <span className="slider-value">{brightness}</span>
          </div>

          {/* Volume Slider with Output Switcher */}
          <div className="slider-row">
            <button
              className="slider-icon-btn"
              onClick={() => setVolume(volume === 0 ? 70 : 0)}
              aria-label={volume === 0 ? "Sesi aç" : "Sesi kapat"}
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              onMouseUp={() => playVolumeBeep(volume)}
              onTouchEnd={() => playVolumeBeep(volume)}
              className="quick-slider"
              aria-label="Ses düzeyi"
              aria-valuetext={`Yüzde ${volume}`}
            />
            <button
              className="sound-output-btn"
              onClick={() => handleOpenSettingsTab("system")}
              title="Ses çıkış aygıtını yönetin"
            >
              <Volume2 size={13} />
              <ChevronRight size={10} />
            </button>
          </div>
        </div>

        <div className="quick-settings-separator" />

        {/* Footer Info & Shortcuts */}
        <div className="quick-settings-footer">
          <div className="battery-info">
            <Battery
              size={16}
              className="battery-icon"
              style={{ color: "#4cd964" }}
            />
            <span>%100</span>
          </div>
          <button
            className="settings-shortcut-btn"
            onClick={() => void toggleFullscreen()}
            title={isFullscreen ? "Tam ekrandan çık" : "Tam ekrana geç"}
            aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekrana geç"}
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            className="settings-shortcut-btn"
            onClick={handleSettingsClick}
            title="Ayarlar'ı Aç"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickSettings;
