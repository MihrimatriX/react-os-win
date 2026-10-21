import React, { useEffect } from "react";
import { useSystem } from "../../context/SystemContext";
import { BOOT_SPLASH_MS } from "./bootTimings";
import "./loading.css";

export const LoadingScreen: React.FC = () => {
  const { setBootStage } = useSystem();

  useEffect(() => {
    const timer = setTimeout(() => setBootStage("login"), BOOT_SPLASH_MS);
    return () => clearTimeout(timer);
  }, [setBootStage]);

  return (
    <div
      className="win-loader-container"
      data-boot-splash-ms={BOOT_SPLASH_MS}
    >
      {/* Windows 11 Flat Light-Blue Logo */}
      <div className="win-logo">
        <svg viewBox="0 0 100 100" width="100" height="100">
          <rect x="10" y="10" width="38" height="38" fill="#00adef" />
          <rect x="52" y="10" width="38" height="38" fill="#00adef" />
          <rect x="10" y="52" width="38" height="38" fill="#00adef" />
          <rect x="52" y="52" width="38" height="38" fill="#00adef" />
        </svg>
      </div>

      {/* Classic Dotted Spinner */}
      <div className="spinner-container" data-boot-dots="5" aria-hidden="true">
        <div className="spinner-dot" data-dot="1"></div>
        <div className="spinner-dot" data-dot="2"></div>
        <div className="spinner-dot" data-dot="3"></div>
        <div className="spinner-dot" data-dot="4"></div>
        <div className="spinner-dot" data-dot="5"></div>
      </div>
    </div>
  );
};
export default LoadingScreen;
