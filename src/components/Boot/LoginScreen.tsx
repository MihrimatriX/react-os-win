import React, { useEffect, useState, useCallback } from "react";
import { useSystem } from "../../context/SystemContext";
import { OS_USER } from "../../osUser";
import { Wifi, Volume2, Power } from "lucide-react";
import "./login.css";

export const LoginScreen: React.FC = () => {
  const { setBootStage, wallpaper, restartSystem } = useSystem();
  const [isLocked, setIsLocked] = useState(true);
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [password, setPassword] = useState("");

  // Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Time format HH:MM
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);

      // Date format (Turkish style)
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
      };
      setDateStr(now.toLocaleDateString("tr-TR", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlockClick = () => {
    setIsLocked(false);
  };

  const handleKeyPress = useCallback(() => {
    if (isLocked) {
      setIsLocked(false);
    }
  }, [isLocked]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login validation. Password can be empty or anything, but let's let them enter anything.
    setBootStage("desktop");
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onClick={isLocked ? handleUnlockClick : undefined}
    >
      {/* Background Overlay */}
      <div className={`login-overlay ${!isLocked ? "blurred" : ""}`} />

      {/* LOCK SCREEN STATE */}
      {isLocked && (
        <div className="lock-screen-content">
          <div className="lock-time">{time}</div>
          <div className="lock-date">{dateStr}</div>
          <div className="lock-tip">
            Geçiş yapmak için herhangi bir yere tıklayın veya bir tuşa basın
          </div>
        </div>
      )}

      {/* LOGIN PANEL STATE */}
      {!isLocked && (
        <div className="login-form-container">
          <div className="profile-container">
            {/* Elegant user avatar */}
            <div className="user-avatar">
              <img src={OS_USER.avatarUrl} alt={OS_USER.displayName} />
            </div>
            <h2 className="user-name">{OS_USER.displayName}</h2>

            <form onSubmit={handleLogin} className="password-form">
              <input
                type="password"
                placeholder="Parola"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="password-input"
              />
              <button type="submit" className="login-btn">
                Oturum Aç
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Right Control Panel */}
      <div className="login-controls">
        <Wifi size={18} className="login-control-icon" />
        <Volume2 size={18} className="login-control-icon" />
        <span
          title="Yeniden Başlat"
          onClick={(e) => {
            e.stopPropagation();
            restartSystem();
          }}
          style={{ display: "flex", alignItems: "center" }}
        >
          <Power size={18} className="login-control-icon" />
        </span>
      </div>
    </div>
  );
};

export default LoginScreen;
