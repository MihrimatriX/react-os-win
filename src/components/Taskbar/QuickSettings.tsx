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
  Moon,
  Pencil,
} from "lucide-react";
import {
  wifiStatusLabel,
  bluetoothStatusLabel,
} from "../../networkState";
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
  } = useSystem();

  const { openApp } = useWindow();
  const [editMode, setEditMode] = useState(false);

  if (!isQuickSettingsOpen) return null;

  const openSettings = (tab?: string) => {
    openApp("settings", tab ? { tab } : undefined);
    setQuickSettingsOpen(false);
  };

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

  const tiles = [
    {
      id: "wifi",
      label: wifiStatusLabel(wifi, airplaneMode),
      active: wifi && !airplaneMode,
      icon: wifi && !airplaneMode ? <Wifi size={20} /> : <WifiOff size={20} />,
      onToggle: () => setWifi(!wifi),
      onExpand: () => openSettings("network"),
      split: true,
    },
    {
      id: "bt",
      label: bluetoothStatusLabel(bluetooth, airplaneMode),
      active: bluetooth && !airplaneMode,
      icon: <Bluetooth size={20} />,
      onToggle: () => setBluetooth(!bluetooth),
      onExpand: () => openSettings("devices"),
      split: true,
    },
    {
      id: "airplane",
      label: "Uçak modu",
      active: airplaneMode,
      icon: <Plane size={20} />,
      onToggle: () => setAirplaneMode(!airplaneMode),
      split: false,
    },
    {
      id: "energy",
      label: "Enerji tasarrufu",
      active: energySaver,
      icon: <Leaf size={20} />,
      onToggle: () => setEnergySaver(!energySaver),
      split: false,
    },
    {
      id: "theme",
      label: theme === "dark" ? "Karanlık" : "Aydınlık",
      active: theme === "dark",
      icon: <Moon size={20} />,
      onToggle: () => toggleTheme(),
      split: false,
    },
    {
      id: "a11y",
      label: "Erişilebilirlik",
      active: false,
      icon: <Accessibility size={20} />,
      onToggle: () => openSettings("accessibility"),
      onExpand: () => openSettings("accessibility"),
      split: true,
    },
  ];

  return (
    <div
      className="qs-flyout"
      role="dialog"
      aria-label="Hızlı ayarlar"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="qs-header">
        <span className="qs-header-title">Hızlı ayarlar</span>
        <button
          type="button"
          className={`qs-edit-btn ${editMode ? "active" : ""}`}
          title="Hızlı ayarları düzenle"
          aria-label="Hızlı ayarları düzenle"
          aria-pressed={editMode}
          onClick={() => setEditMode((v) => !v)}
        >
          <Pencil size={14} />
        </button>
      </div>

      <div className={`qs-tiles ${editMode ? "editing" : ""}`}>
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`qs-tile ${tile.active ? "active" : ""} ${tile.split ? "split" : ""}`}
          >
            <button
              type="button"
              className="qs-tile-main"
              onClick={tile.onToggle}
              aria-pressed={tile.active}
              title={tile.label}
            >
              <span className="qs-tile-icon">{tile.icon}</span>
              <span className="qs-tile-label">{tile.label}</span>
            </button>
            {tile.split && tile.onExpand && (
              <button
                type="button"
                className="qs-tile-expand"
                onClick={tile.onExpand}
                title={`${tile.label} seçenekleri`}
                aria-label={`${tile.label} seçenekleri`}
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="qs-sliders">
        <div className="qs-slider-row">
          <SunDim size={18} className="qs-slider-icon" aria-hidden />
          <input
            type="range"
            min={10}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
            className="qs-slider"
            aria-label="Ekran parlaklığı"
            aria-valuetext={`Yüzde ${brightness}`}
          />
        </div>
        <div className="qs-slider-row">
          <button
            type="button"
            className="qs-slider-mute"
            onClick={() => setVolume(volume === 0 ? 70 : 0)}
            aria-label={volume === 0 ? "Sesi aç" : "Sesi kapat"}
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value, 10))}
            onMouseUp={() => playVolumeBeep(volume)}
            onTouchEnd={() => playVolumeBeep(volume)}
            className="qs-slider"
            aria-label="Ses düzeyi"
            aria-valuetext={`Yüzde ${volume}`}
          />
        </div>
      </div>

      <div className="qs-footer">
        <div className="qs-battery">
          <Battery size={16} style={{ color: "#4cd964" }} aria-hidden />
          <span>%100</span>
        </div>
        <button
          type="button"
          className="qs-all-settings"
          onClick={() => openSettings()}
        >
          Tüm ayarlar
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
};

export default QuickSettings;
