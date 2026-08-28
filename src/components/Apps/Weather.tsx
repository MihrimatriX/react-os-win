import React, { useState } from "react";
import { Search, Wind, Droplets, Sun, Eye, Navigation } from "lucide-react";
import "./weather.css";

interface WeatherInfo {
  city: string;
  temp: number;
  condition: string;
  emoji: string;
  humidity: number;
  wind: number;
  uv: string;
  visibility: string;
  hourly: { time: string; temp: number; emoji: string }[];
  forecast: { day: string; temp: string; emoji: string }[];
}

const WEATHER_DATA: { [key: string]: WeatherInfo } = {
  istanbul: {
    city: "İstanbul",
    temp: 24,
    condition: "Parçalı Bulutlu",
    emoji: "🌤️",
    humidity: 58,
    wind: 14,
    uv: "Orta",
    visibility: "10 km",
    hourly: [
      { time: "12:00", temp: 24, emoji: "🌤️" },
      { time: "14:00", temp: 25, emoji: "☀️" },
      { time: "16:00", temp: 23, emoji: "🌤️" },
      { time: "18:00", temp: 21, emoji: "☁️" },
      { time: "20:00", temp: 19, emoji: "🌙" },
    ],
    forecast: [
      { day: "Bugün", temp: "25° / 18°", emoji: "🌤️" },
      { day: "Salı", temp: "21° / 16°", emoji: "🌧️" },
      { day: "Çarşamba", temp: "26° / 19°", emoji: "☀️" },
      { day: "Perşembe", temp: "27° / 20°", emoji: "☀️" },
      { day: "Cuma", temp: "24° / 17°", emoji: "🌤️" },
    ],
  },
  ankara: {
    city: "Ankara",
    temp: 20,
    condition: "Güneşli",
    emoji: "☀️",
    humidity: 40,
    wind: 8,
    uv: "Yüksek",
    visibility: "12 km",
    hourly: [
      { time: "12:00", temp: 20, emoji: "☀️" },
      { time: "14:00", temp: 22, emoji: "☀️" },
      { time: "16:00", temp: 21, emoji: "☀️" },
      { time: "18:00", temp: 17, emoji: "🌤️" },
      { time: "20:00", temp: 14, emoji: "🌙" },
    ],
    forecast: [
      { day: "Bugün", temp: "22° / 12°", emoji: "☀️" },
      { day: "Salı", temp: "19° / 9°", emoji: "🌤️" },
      { day: "Çarşamba", temp: "23° / 11°", emoji: "☀️" },
      { day: "Perşembe", temp: "25° / 13°", emoji: "☀️" },
      { day: "Cuma", temp: "22° / 10°", emoji: "🌤️" },
    ],
  },
  izmir: {
    city: "İzmir",
    temp: 28,
    condition: "Güneşli",
    emoji: "☀️",
    humidity: 50,
    wind: 18,
    uv: "Çok Yüksek",
    visibility: "14 km",
    hourly: [
      { time: "12:00", temp: 28, emoji: "☀️" },
      { time: "14:00", temp: 29, emoji: "☀️" },
      { time: "16:00", temp: 28, emoji: "☀️" },
      { time: "18:00", temp: 25, emoji: "☀️" },
      { time: "20:00", temp: 22, emoji: "🌙" },
    ],
    forecast: [
      { day: "Bugün", temp: "30° / 21°", emoji: "☀️" },
      { day: "Salı", temp: "28° / 19°", emoji: "☀️" },
      { day: "Çarşamba", temp: "29° / 20°", emoji: "☀️" },
      { day: "Perşembe", temp: "31° / 22°", emoji: "☀️" },
      { day: "Cuma", temp: "29° / 20°", emoji: "☀️" },
    ],
  },
  antalya: {
    city: "Antalya",
    temp: 32,
    condition: "Sıcak & Güneşli",
    emoji: "🔥",
    humidity: 65,
    wind: 10,
    uv: "Ekstrem",
    visibility: "10 km",
    hourly: [
      { time: "12:00", temp: 32, emoji: "🔥" },
      { time: "14:00", temp: 34, emoji: "🔥" },
      { time: "16:00", temp: 33, emoji: "🔥" },
      { time: "18:00", temp: 29, emoji: "☀️" },
      { time: "20:00", temp: 26, emoji: "🌙" },
    ],
    forecast: [
      { day: "Bugün", temp: "34° / 25°", emoji: "🔥" },
      { day: "Salı", temp: "32° / 24°", emoji: "☀️" },
      { day: "Çarşamba", temp: "33° / 24°", emoji: "☀️" },
      { day: "Perşembe", temp: "35° / 26°", emoji: "🔥" },
      { day: "Cuma", temp: "31° / 23°", emoji: "☀️" },
    ],
  },
  berlin: {
    city: "Berlin",
    temp: 16,
    condition: "Kuvvetli Yağmur",
    emoji: "🌧️",
    humidity: 85,
    wind: 22,
    uv: "Düşük",
    visibility: "8 km",
    hourly: [
      { time: "12:00", temp: 16, emoji: "🌧️" },
      { time: "14:00", temp: 15, emoji: "🌧️" },
      { time: "16:00", temp: 14, emoji: "🌧️" },
      { time: "18:00", temp: 13, emoji: "☁️" },
      { time: "20:00", temp: 12, emoji: "☁️" },
    ],
    forecast: [
      { day: "Bugün", temp: "16° / 11°", emoji: "🌧️" },
      { day: "Salı", temp: "14° / 10°", emoji: "🌧️" },
      { day: "Çarşamba", temp: "18° / 12°", emoji: "🌤️" },
      { day: "Perşembe", temp: "20° / 14°", emoji: "☀️" },
      { day: "Cuma", temp: "17° / 12°", emoji: "☁️" },
    ],
  },
  london: {
    city: "Londra",
    temp: 14,
    condition: "Hafif Çisenti",
    emoji: "🌦️",
    humidity: 90,
    wind: 24,
    uv: "Düşük",
    visibility: "7 km",
    hourly: [
      { time: "12:00", temp: 14, emoji: "🌦️" },
      { time: "14:00", temp: 14, emoji: "🌧️" },
      { time: "16:00", temp: 13, emoji: "☁️" },
      { time: "18:00", temp: 12, emoji: "☁️" },
      { time: "20:00", temp: 11, emoji: "☁️" },
    ],
    forecast: [
      { day: "Bugün", temp: "15° / 10°", emoji: "🌦️" },
      { day: "Salı", temp: "13° / 9°", emoji: "🌧️" },
      { day: "Çarşamba", temp: "15° / 10°", emoji: "☁️" },
      { day: "Perşembe", temp: "17° / 11°", emoji: "🌤️" },
      { day: "Cuma", temp: "16° / 11°", emoji: "🌤️" },
    ],
  },
  "new york": {
    city: "New York",
    temp: 18,
    condition: "Parçalı Bulutlu",
    emoji: "🌤️",
    humidity: 55,
    wind: 12,
    uv: "Orta",
    visibility: "10 km",
    hourly: [
      { time: "12:00", temp: 18, emoji: "🌤️" },
      { time: "14:00", temp: 19, emoji: "🌤️" },
      { time: "16:00", temp: 20, emoji: "☀️" },
      { time: "18:00", temp: 17, emoji: "🌤️" },
      { time: "20:00", temp: 15, emoji: "🌙" },
    ],
    forecast: [
      { day: "Bugün", temp: "20° / 14°", emoji: "🌤️" },
      { day: "Salı", temp: "22° / 16°", emoji: "☀️" },
      { day: "Çarşamba", temp: "19° / 13°", emoji: "🌧️" },
      { day: "Perşembe", temp: "17° / 11°", emoji: "🌤️" },
      { day: "Cuma", temp: "21° / 15°", emoji: "☀️" },
    ],
  },
};

export const WeatherApp: React.FC = () => {
  const [query, setQuery] = useState("");
  const [cityKey, setCityKey] = useState("istanbul");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.toLowerCase().trim();

    // Find matching key
    const match = Object.keys(WEATHER_DATA).find(
      (key) =>
        key === cleanQuery ||
        WEATHER_DATA[key].city.toLowerCase() === cleanQuery,
    );

    if (match) {
      setCityKey(match);
    } else {
      alert(
        "Şehir bulunamadı! Lütfen şunu deneyin: İstanbul, Ankara, İzmir, Antalya, Berlin, Londra (London) veya New York.",
      );
    }
  };

  const weather = WEATHER_DATA[cityKey] || WEATHER_DATA["istanbul"];

  return (
    <div className="weather-container">
      {/* Search Header */}
      <form className="weather-search-bar" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <Search size={15} className="weather-search-icon" />
          <input
            type="text"
            placeholder="Şehir arayın... (örn: Ankara, Berlin)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="weather-search-btn">
          Ara
        </button>
      </form>

      {/* Main Panel */}
      <div className="weather-main-panel">
        {/* Left Side: Current Stats */}
        <div className="weather-current-box glass">
          <div className="current-header">
            <span className="location-indicator">
              <Navigation
                size={14}
                style={{ marginRight: "6px", transform: "rotate(45deg)" }}
              />
              {weather.city}
            </span>
            <span className="current-date">Şu Anda</span>
          </div>

          <div className="current-temp-row">
            <span className="current-emoji">{weather.emoji}</span>
            <div className="temp-info">
              <span className="temp-number">{weather.temp}°C</span>
              <span className="temp-condition">{weather.condition}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="weather-details-grid">
            <div className="detail-card">
              <Wind size={16} />
              <div className="detail-text">
                <span>Rüzgar</span>
                <strong>{weather.wind} km/s</strong>
              </div>
            </div>
            <div className="detail-card">
              <Droplets size={16} />
              <div className="detail-text">
                <span>Nem</span>
                <strong>%{weather.humidity}</strong>
              </div>
            </div>
            <div className="detail-card">
              <Sun size={16} />
              <div className="detail-text">
                <span>UV İndeksi</span>
                <strong>{weather.uv}</strong>
              </div>
            </div>
            <div className="detail-card">
              <Eye size={16} />
              <div className="detail-text">
                <span>Görüş Derecesi</span>
                <strong>{weather.visibility}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Projections */}
        <div className="weather-projections-box">
          {/* Hourly Forecast */}
          <div className="hourly-panel glass">
            <h3>Saatlik Tahmin</h3>
            <div className="hourly-list">
              {weather.hourly.map((h, idx) => (
                <div key={idx} className="hourly-item">
                  <span className="hourly-time">{h.time}</span>
                  <span className="hourly-emoji">{h.emoji}</span>
                  <span className="hourly-temp">{h.temp}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="daily-panel glass">
            <h3>5 Günlük Tahmin</h3>
            <div className="daily-list">
              {weather.forecast.map((f, idx) => (
                <div key={idx} className="daily-item">
                  <span className="daily-day">{f.day}</span>
                  <span className="daily-emoji">{f.emoji}</span>
                  <span className="daily-temp">{f.temp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
