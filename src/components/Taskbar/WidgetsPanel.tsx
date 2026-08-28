import React, { useState, useEffect, useRef } from "react";
import { useSystem } from "../../context/SystemContext";
import { useWindow } from "../../context/WindowContext";
import {
  Search,
  Clock,
  Sun,
  CloudRain,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import "./widgets.css";

export const WidgetsPanel: React.FC = () => {
  const { isWidgetsOpen, setWidgetsOpen } = useSystem();
  const { openApp } = useWindow();

  // States for clock & alarm
  const [time, setTime] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState({ hour: "08", minute: "00" });
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // States for finance rates simulation
  const [marketRates, setMarketRates] = useState([
    { name: "BIST 100", value: "10.234,40", change: "+1.42%", up: true },
    { name: "USD/TRY", value: "32,45", change: "-0.12%", up: false },
    { name: "EUR/TRY", value: "35,21", change: "+0.25%", up: true },
    { name: "BTC/USD", value: "67.890", change: "+2.85%", up: true },
  ]);

  // Click outside detection reference
  const panelRef = useRef<HTMLDivElement>(null);

  // Keep clock running
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      // Check alarm trigger
      if (alarmActive && !alarmTriggered) {
        const currentHour = now.getHours().toString().padStart(2, "0");
        const currentMinute = now.getMinutes().toString().padStart(2, "0");
        if (
          currentHour === alarmTime.hour &&
          currentMinute === alarmTime.minute
        ) {
          setAlarmTriggered(true);
        }
      }
      // Reset trigger if minutes passed
      if (alarmTriggered) {
        const currentHour = now.getHours().toString().padStart(2, "0");
        const currentMinute = now.getMinutes().toString().padStart(2, "0");
        if (
          currentHour !== alarmTime.hour ||
          currentMinute !== alarmTime.minute
        ) {
          setAlarmTriggered(false);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [alarmActive, alarmTime, alarmTriggered]);

  // Simulate market fluctuation periodically
  useEffect(() => {
    const marketTimer = setInterval(() => {
      setMarketRates((prev) =>
        prev.map((rate) => {
          const rand = Math.random();
          if (rand > 0.6) {
            const changePercent = (Math.random() * 0.5).toFixed(2);
            const valNum = parseFloat(
              rate.value.replace(/\./g, "").replace(",", "."),
            );
            const isUp = Math.random() > 0.45;
            const delta =
              valNum * (parseFloat(changePercent) / 100) * (isUp ? 1 : -1);
            const newVal = (valNum + delta).toFixed(2);
            return {
              ...rate,
              value: newVal.replace(".", ","),
              change: `${isUp ? "+" : "-"}${changePercent}%`,
              up: isUp,
            };
          }
          return rate;
        }),
      );
    }, 5000);

    return () => clearInterval(marketTimer);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isWidgetsOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        // Exclude widgets button clicks (handled natively)
        const target = e.target as HTMLElement;
        if (!target.closest(".taskbar-left-widgets")) {
          setWidgetsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isWidgetsOpen, setWidgetsOpen]);

  if (!isWidgetsOpen) return null;

  return (
    <div
      ref={panelRef}
      className="widgets-panel-container glass"
      role="dialog"
      aria-label="Widget'lar"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="widgets-header">
        <span className="widgets-title">Günün Özeti</span>
        <span className="widgets-date">
          {time.toLocaleDateString("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </div>

      {/* Widget Grid Layout */}
      <div className="widgets-grid-content">
        {/* Search Bar Widget */}
        <form
          className="widget-card search-widget glass"
          onSubmit={(event) => {
            event.preventDefault();
            const query = searchQuery.trim();
            if (!query) return;
            openApp("edge", {
              url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            });
            setWidgetsOpen(false);
          }}
        >
          <Search size={16} className="search-widget-icon" />
          <input
            type="search"
            placeholder="Web'de ara..."
            className="search-widget-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Web'de ara"
          />
        </form>

        {/* Alarm Alert Toast overlay if active and triggered */}
        {alarmTriggered && (
          <div className="alarm-triggered-banner" role="alert">
            <AlertTriangle size={18} className="alarm-alert-icon" />
            <div className="alarm-banner-text">
              <strong>Alarm Çalıyor!</strong>
              <span>
                Saat: {alarmTime.hour}:{alarmTime.minute}
              </span>
            </div>
            <button
              className="alarm-stop-btn"
              onClick={() => setAlarmActive(false)}
            >
              Durdur
            </button>
          </div>
        )}

        {/* Weather Forecast Widget */}
        <div className="widget-card weather-widget glass">
          <div className="weather-widget-header">
            <div className="weather-main-info">
              <span className="weather-city">İstanbul</span>
              <span className="weather-status">Parçalı Bulutlu</span>
            </div>
            <span className="weather-temp">24°</span>
          </div>

          <div className="weather-widget-details">
            <div className="weather-detail-item">
              <span className="detail-label">Nem</span>
              <span className="detail-val">%58</span>
            </div>
            <div className="weather-detail-item">
              <span className="detail-label">Rüzgar</span>
              <span className="detail-val">14 km/s</span>
            </div>
            <div className="weather-detail-item">
              <span className="detail-label">UV İndeksi</span>
              <span className="detail-val">Orta</span>
            </div>
          </div>

          <div className="weather-forecast-list">
            <div className="forecast-day">
              <span>Pzt</span>
              <Sun size={16} color="#ffd54f" />
              <span>25°</span>
            </div>
            <div className="forecast-day">
              <span>Sal</span>
              <CloudRain size={16} color="#81d4fa" />
              <span>21°</span>
            </div>
            <div className="forecast-day">
              <span>Çar</span>
              <Sun size={16} color="#ffd54f" />
              <span>26°</span>
            </div>
          </div>
        </div>

        {/* Alarm and Clock Widget */}
        <div className="widget-card alarm-widget glass">
          <div className="alarm-widget-header">
            <Clock size={18} className="alarm-clock-icon" />
            <span className="alarm-widget-title">Alarm & Saat</span>
          </div>

          <div className="alarm-current-time">
            {time.toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>

          <div className="alarm-settings-row">
            <div className="alarm-time-inputs">
              <input
                type="number"
                min="0"
                max="23"
                value={alarmTime.hour}
                onChange={(e) =>
                  setAlarmTime((prev) => ({
                    ...prev,
                    hour: e.target.value.padStart(2, "0").slice(-2),
                  }))
                }
                className="alarm-input"
                aria-label="Alarm saati"
              />
              <span className="alarm-colon">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={alarmTime.minute}
                onChange={(e) =>
                  setAlarmTime((prev) => ({
                    ...prev,
                    minute: e.target.value.padStart(2, "0").slice(-2),
                  }))
                }
                className="alarm-input"
                aria-label="Alarm dakikası"
              />
            </div>

            <label className="alarm-switch-label">
              <input
                type="checkbox"
                checked={alarmActive}
                onChange={(e) => {
                  setAlarmActive(e.target.checked);
                  if (!e.target.checked) setAlarmTriggered(false);
                }}
                className="alarm-toggle-checkbox"
              />
              <span className="alarm-toggle-btn">
                {alarmActive ? "Aktif" : "Kapalı"}
              </span>
            </label>
          </div>
        </div>

        {/* Market Stocks / Exchange Rates Widget */}
        <div className="widget-card finance-widget glass">
          <div className="finance-header">
            <TrendingUp size={16} className="finance-icon" />
            <span className="finance-title">Piyasalar · Demo veriler</span>
          </div>
          <div className="finance-rates-grid">
            {marketRates.map((rate) => (
              <div key={rate.name} className="finance-rate-item">
                <div className="finance-rate-name">{rate.name}</div>
                <div className="finance-rate-values">
                  <span className="rate-value">{rate.value}</span>
                  <span className={`rate-change ${rate.up ? "up" : "down"}`}>
                    {rate.up ? (
                      <TrendingUp size={10} style={{ marginRight: "2px" }} />
                    ) : (
                      <TrendingDown size={10} style={{ marginRight: "2px" }} />
                    )}
                    {rate.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Feed Widget */}
        <div className="widget-card news-widget glass">
          <div className="news-widget-header">
            <span className="news-title">Günün Teknoloji Gündemi</span>
          </div>
          <div className="news-articles-list">
            <div className="news-item">
              <span className="news-source">React OS</span>
              <span className="news-headline">
                Pencere hizalama ve görev görünümü masaüstüne eklendi.
              </span>
            </div>
            <div className="news-item">
              <span className="news-source">Windows 11</span>
              <span className="news-headline">
                Widgets paneli ve gelişmiş masaüstü özellikleri kullanıcılardan
                tam not aldı.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetsPanel;
