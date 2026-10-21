import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSystem } from "../../context/SystemContext";
import { OS_USER } from "../../osUser";
import { Wifi, Volume2, Power } from "lucide-react";
import LiveWallpaper from "../Desktop/LiveWallpaper";
import { isLiveWallpaper } from "../../wallpapers";
import {
  UNLOCK_DELAY_MS,
  TYPEWRITER_START_MS,
  TYPEWRITER_CHAR_MS,
  POST_TYPE_PAUSE_MS,
} from "./bootTimings";
import "./login.css";

/** Auto-login password typed char-by-char (see bootTimings for cadence). */
const AUTO_PASSWORD = "AhmetUzunkaya";

export const LoginScreen: React.FC = () => {
  const { setBootStage, wallpaper, restartSystem, energySaver } = useSystem();
  const live = isLiveWallpaper(wallpaper);
  const [isLocked, setIsLocked] = useState(true);
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const cancelledRef = useRef(false);
  const typewriterStartedRef = useRef(false);
  const unlockedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const setBootStageRef = useRef(setBootStage);
  useEffect(() => {
    setBootStageRef.current = setBootStage;
  }, [setBootStage]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const cancelTypewriter = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setTime(`${hours}:${minutes}`);
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

  const completeLogin = useCallback(() => {
    setBootStageRef.current("desktop");
  }, []);

  const beginTypewriter = useCallback(() => {
    if (typewriterStartedRef.current || cancelledRef.current) return;
    typewriterStartedRef.current = true;

    let charIndex = 0;

    const typeNext = () => {
      if (cancelledRef.current) return;

      if (charIndex < AUTO_PASSWORD.length) {
        charIndex += 1;
        setPassword(AUTO_PASSWORD.slice(0, charIndex));
        schedule(typeNext, TYPEWRITER_CHAR_MS);
        return;
      }

      schedule(() => {
        if (cancelledRef.current) return;
        setIsSigningIn(true);
        completeLogin();
      }, POST_TYPE_PAUSE_MS);
    };

    schedule(typeNext, TYPEWRITER_START_MS);
  }, [completeLogin, schedule]);

  const unlock = useCallback(() => {
    if (!unlockedRef.current) {
      unlockedRef.current = true;
      setIsLocked(false);
    }
    beginTypewriter();
  }, [beginTypewriter]);

  // Auto-unlock once after mount, then typewriter fills the password.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (cancelledRef.current) return;
      unlock();
    }, UNLOCK_DELAY_MS);

    return () => {
      window.clearTimeout(id);
      clearTimers();
    };
    // Mount-only auto-login sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlockClick = () => {
    unlock();
  };

  const handleKeyPress = useCallback(() => {
    if (isLocked) {
      unlock();
    }
  }, [isLocked, unlock]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Manual typing cancels the auto typewriter / auto-login.
    cancelTypewriter();
    setIsSigningIn(false);
    setPassword(e.target.value);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    cancelTypewriter();
    setIsSigningIn(true);
    completeLogin();
  };

  return (
    <div
      className={`login-container${live ? " login-container--live" : ""}`}
      style={live ? undefined : { backgroundImage: `url(${wallpaper})` }}
      onClick={isLocked ? handleUnlockClick : undefined}
    >
      {live && <LiveWallpaper variant="login" paused={energySaver} />}
      <div className={`login-overlay ${!isLocked ? "blurred" : ""}`} />

      {isLocked && (
        <div className="lock-screen-content">
          <div className="lock-time">{time}</div>
          <div className="lock-date">{dateStr}</div>
          <div className="lock-tip">
            Geçiş yapmak için herhangi bir yere tıklayın veya bir tuşa basın
          </div>
        </div>
      )}

      {!isLocked && (
        <div className="login-form-container">
          <div className="profile-container">
            <div className="user-avatar">
              <img src={OS_USER.avatarUrl} alt={OS_USER.displayName} />
            </div>
            <h2 className="user-name">{OS_USER.displayName}</h2>

            <form onSubmit={handleLogin} className="password-form" data-auto-password-len={AUTO_PASSWORD.length}>
              <input
                type="password"
                placeholder="Parola"
                value={password}
                onChange={handlePasswordChange}
                autoFocus={!isSigningIn}
                className="password-input"
                readOnly={isSigningIn}
                aria-label="Parola"
                data-typewriter-len={password.length}
              />
              <button type="submit" className="login-btn" disabled={isSigningIn}>
                {isSigningIn ? "Oturum açılıyor…" : "Oturum Aç"}
              </button>
            </form>
          </div>
        </div>
      )}

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
