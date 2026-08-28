import React, { useEffect } from "react";
import { useSystem } from "../../context/SystemContext";
import "./loading.css";

export const LoadingScreen: React.FC = () => {
  const { setBootStage } = useSystem();

  useEffect(() => {
    const timer = setTimeout(() => {
      setBootStage("login");
    }, 3000); // 3 seconds spinner loading

    return () => clearTimeout(timer);
  }, [setBootStage]);

  return (
    <div className="win-loader-container">
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
      <div className="spinner-container">
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
    </div>
  );
};
export default LoadingScreen;
