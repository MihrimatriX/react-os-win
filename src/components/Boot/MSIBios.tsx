import React, { useEffect, useState, useCallback } from "react";
import { useSystem } from "../../context/SystemContext";
import {
  HardDrive,
  Usb,
  Disc,
  Network,
  RefreshCw,
  Camera,
  Search,
  Globe,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import "./bios.css";
import { OS_USER } from "../../osUser";

interface BIOSSetupProps {
  onExit: () => void;
  isWindowed?: boolean;
}

export const MSIBIOSSetup: React.FC<BIOSSetupProps> = ({
  onExit,
  isWindowed = false,
}) => {
  const [gameBoost, setGameBoost] = useState(false);
  const [axmp, setAxmp] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [activeTab, setActiveTab] = useState<
    "home" | "settings" | "mflash" | "monitor" | "security"
  >("home");
  const [helpText, setHelpText] = useState(
    "Yardım almak istediğiniz seçeneğin üzerine gelin veya sol menüden bir kategori seçin.",
  );

  // Settings Tab states
  const [secureBoot, setSecureBoot] = useState(true);
  const [fastBoot, setFastBoot] = useState(false);
  const [biosMode, setBiosMode] = useState<"UEFI" | "CSM">("UEFI");
  const [selectedLang, setSelectedLang] = useState<"En" | "Tr">("Tr");

  // Security Tab states
  const [adminPassword, setAdminPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [passModalType, setPassModalType] = useState<"admin" | "user" | null>(
    null,
  );

  // Hardware Monitor Fan Nodes (4 points: Temp in C, Speed in %)
  const [fanNodes, setFanNodes] = useState([
    { temp: 20, speed: 20 },
    { temp: 45, speed: 45 },
    { temp: 65, speed: 70 },
    { temp: 85, speed: 100 },
  ]);

  // Boot Priority
  const [bootDevices, setBootDevices] = useState([
    {
      id: "ssd",
      name: "UEFI Hard Disk: Windows Boot Manager (SSD)",
      type: "ssd",
    },
    { id: "usb", name: "USB Key: Generic Flash Drive", type: "usb" },
    { id: "cd", name: "CD/DVD Drive", type: "cd" },
    { id: "net", name: "Network Boot (PXE)", type: "net" },
  ]);
  const [activeBootIdx, setActiveBootIdx] = useState(0);

  // Easter Eggs
  const [screenshotFlash, setScreenshotFlash] = useState(false);
  const [mflashLoading, setMflashLoading] = useState(false);

  const triggerScreenshot = useCallback(() => {
    setScreenshotFlash(true);
    setTimeout(() => {
      setScreenshotFlash(false);
      alert(
        selectedLang === "Tr"
          ? `Ekran görüntüsü başarıyla C:/Users/${OS_USER.folderName}/Pictures/ klasörüne kaydedildi!`
          : `Screenshot successfully saved to C:/Users/${OS_USER.folderName}/Pictures/!`,
      );
    }, 150);
  }, [selectedLang]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      const months = [
        "Oca",
        "Şub",
        "Mar",
        "Nis",
        "May",
        "Haz",
        "Tem",
        "Ağu",
        "Eyl",
        "Eki",
        "Kas",
        "Ara",
      ];

      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];

      setDateStr(
        `${dayName}, ${now.getDate()} ${monthName} ${now.getFullYear()}`,
      );
      setTimeStr(now.toTimeString().split(" ")[0]);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hotkey triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        triggerScreenshot();
      } else if (e.key === "F10") {
        onExit();
      } else if (e.key === "Escape") {
        if (activeTab !== "home") setActiveTab("home");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, onExit, triggerScreenshot]);

  const handleBootOrderChange = (direction: "up" | "down") => {
    if (direction === "up" && activeBootIdx > 0) {
      const newList = [...bootDevices];
      const temp = newList[activeBootIdx];
      newList[activeBootIdx] = newList[activeBootIdx - 1];
      newList[activeBootIdx - 1] = temp;
      setBootDevices(newList);
      setActiveBootIdx(activeBootIdx - 1);
    } else if (direction === "down" && activeBootIdx < bootDevices.length - 1) {
      const newList = [...bootDevices];
      const temp = newList[activeBootIdx];
      newList[activeBootIdx] = newList[activeBootIdx + 1];
      newList[activeBootIdx + 1] = temp;
      setBootDevices(newList);
      setActiveBootIdx(activeBootIdx + 1);
    }
  };

  const startMflash = () => {
    setMflashLoading(true);
    setTimeout(() => {
      setMflashLoading(false);
      setActiveTab("home");
      alert(
        selectedLang === "Tr"
          ? "M-FLASH bios güncelleme aracı başarıyla çalıştırıldı (Simüle edildi)."
          : "M-FLASH bios update utility ran successfully (Simulated).",
      );
    }, 3000);
  };

  const renderBootIcon = (type: string) => {
    switch (type) {
      case "ssd":
        return <HardDrive size={18} />;
      case "usb":
        return <Usb size={18} />;
      case "cd":
        return <Disc size={18} />;
      default:
        return <Network size={18} />;
    }
  };

  if (mflashLoading) {
    return (
      <div
        style={{
          backgroundColor: "#000000",
          color: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#ff0000",
            marginBottom: "20px",
          }}
        >
          M-FLASH UTILITY
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <RefreshCw
            className="animate-spin"
            size={24}
            style={{ animation: "spin 2s linear infinite" }}
          />
          <span>
            Sistem M-Flash Modunda Yeniden Başlatılıyor... Lütfen Bekleyin.
          </span>
        </div>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="bios-setup-container"
      style={{
        width: "100%",
        height: "100%",
        minHeight: isWindowed ? "100%" : "100vh",
        maxHeight: isWindowed ? "100%" : "none",
        position: "relative",
      }}
    >
      {/* Screenshot flash overlay */}
      {screenshotFlash && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#ffffff",
            opacity: 0.95,
            zIndex: 999999,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top Header Bar */}
      <div className="bios-header">
        <div className="bios-header-left">
          <span className="bios-msi-text">msi</span>
          <span className="bios-clickbios-text">CLICK BIOS 5</span>
        </div>

        <div className="bios-header-right">
          <button
            className="bios-header-tool-btn"
            onClick={triggerScreenshot}
            onMouseEnter={() =>
              setHelpText(
                selectedLang === "Tr"
                  ? "BIOS ekran görüntüsü almak için tıklayın (F12)."
                  : "Click to take a BIOS screenshot (F12).",
              )
            }
          >
            <Camera size={14} style={{ color: "#ff0000" }} />
            <span>F12</span>
          </button>

          <button
            className="bios-header-tool-btn"
            onMouseEnter={() =>
              setHelpText(
                selectedLang === "Tr"
                  ? "BIOS ayarları içinde arama yapın."
                  : "Search inside BIOS settings.",
              )
            }
          >
            <Search size={14} />
          </button>

          <button
            className="bios-header-tool-btn"
            onClick={() => setSelectedLang((l) => (l === "Tr" ? "En" : "Tr"))}
            onMouseEnter={() =>
              setHelpText(
                selectedLang === "Tr"
                  ? "Sistem dilini değiştirin."
                  : "Change system language.",
              )
            }
          >
            <Globe size={14} />
            <span>
              {selectedLang === "Tr" ? "Türkçe (Tr)" : "English (En)"}
            </span>
          </button>

          <button
            className="bios-header-tool-btn active"
            onClick={onExit}
            onMouseEnter={() =>
              setHelpText(
                selectedLang === "Tr"
                  ? "Kaydet ve BIOS'tan çık (F10)."
                  : "Save and Exit BIOS (F10).",
              )
            }
          >
            <X size={14} />
            <span>ÇIKIŞ</span>
          </button>
        </div>
      </div>

      {/* Upper Dashboard Grid */}
      <div className="bios-dashboard">
        {/* Clock & Temp Panel */}
        <div className="bios-dashboard-panel bios-panel-left">
          <div className="bios-digital-clock-container">
            <div className="bios-digital-clock">{timeStr}</div>
            <div className="bios-digital-date">{dateStr}</div>
          </div>

          <div className="bios-digital-temps">
            <div
              className="bios-temp-row"
              onMouseEnter={() =>
                setHelpText(
                  selectedLang === "Tr"
                    ? "Mevcut CPU sıcaklık derecesi."
                    : "Current CPU temperature.",
                )
              }
            >
              <span className="bios-temp-label">CPU</span>
              <span className="bios-temp-value">
                {gameBoost ? "48" : "36"}°C
              </span>
            </div>
            <div
              className="bios-temp-row"
              onMouseEnter={() =>
                setHelpText(
                  selectedLang === "Tr"
                    ? "Mevcut anakart sıcaklık derecesi."
                    : "Current motherboard temperature.",
                )
              }
            >
              <span className="bios-temp-label">SİSTEM</span>
              <span className="bios-temp-value">
                {gameBoost ? "31" : "29"}°C
              </span>
            </div>
          </div>
        </div>

        {/* Speed & Boot Panel */}
        <div className="bios-dashboard-panel bios-panel-middle">
          <div className="bios-speed-info">
            <div
              className="bios-speed-item"
              onMouseEnter={() =>
                setHelpText(
                  selectedLang === "Tr"
                    ? "İşlemcinin (CPU) anlık saat frekansı."
                    : "Current processor (CPU) clock frequency.",
                )
              }
            >
              <span className="bios-speed-label">CPU Hızı</span>
              <span className="bios-speed-value">
                {gameBoost ? "3.70" : "2.25"} GHz
              </span>
            </div>
            <div
              className="bios-speed-item"
              onMouseEnter={() =>
                setHelpText(
                  selectedLang === "Tr"
                    ? "RAM belleklerin anlık çalışma frekansı."
                    : "Current memory (DDR) clock frequency.",
                )
              }
            >
              <span className="bios-speed-label">DDR Hızı</span>
              <span className="bios-speed-value">
                {axmp ? "4800" : "3200"} MHz
              </span>
            </div>
          </div>

          <div className="bios-boot-priority-container">
            <span className="bios-boot-label">Boot Önceliği</span>
            <div className="bios-boot-icons">
              {bootDevices.map((dev, idx) => (
                <div
                  key={dev.id}
                  className={`bios-boot-icon-wrapper ${activeBootIdx === idx ? "active" : ""}`}
                  onClick={() => setActiveBootIdx(idx)}
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? `Seçili aygıt: ${dev.name}. Öncelik sırasını değiştirmek için sağdaki yön oklarını kullanabilirsiniz.`
                        : `Selected device: ${dev.name}. Use the arrows on the right to change order.`,
                    )
                  }
                >
                  {renderBootIcon(dev.type)}
                  <span className="bios-boot-badge">{idx + 1}</span>
                </div>
              ))}
            </div>

            {/* Boot Priority Sorting Arrows */}
            <div style={{ display: "flex", gap: "3px", marginLeft: "5px" }}>
              <button
                onClick={() => handleBootOrderChange("up")}
                style={{
                  background: "#222",
                  border: "1px solid #444",
                  color: "#fff",
                  borderRadius: "3px",
                  cursor: "pointer",
                  padding: "2px 5px",
                }}
                title="Sıralamada Yukarı Taşı"
              >
                <ArrowUp size={10} />
              </button>
              <button
                onClick={() => handleBootOrderChange("down")}
                style={{
                  background: "#222",
                  border: "1px solid #444",
                  color: "#fff",
                  borderRadius: "3px",
                  cursor: "pointer",
                  padding: "2px 5px",
                }}
                title="Sıralamada Aşağı Taşı"
              >
                <ArrowDown size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* System Specs Panel */}
        <div className="bios-dashboard-panel bios-panel-right">
          <div>
            <strong>Sistem Bilgileri:</strong>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr",
              gap: "2px 10px",
              marginTop: "4px",
            }}
          >
            <span>Ürün:</span>
            <span style={{ color: "#fff" }}>
              MSI Server Board EPYC-D8 (MS-S996)
            </span>
            <span>İşlemci:</span>
            <span style={{ color: "#fff" }}>AMD EPYC 9965 192-Core</span>
            <span>Bellek:</span>
            <span style={{ color: "#fff" }}>262144 MB (DDR5)</span>
            <span>BIOS Ver:</span>
            <span style={{ color: "#fff" }}>E7S99AMS.1A0 (05/18/2026)</span>
          </div>
        </div>
      </div>

      {/* Lower Workspace Grid */}
      <div className="bios-workspace">
        {/* Left Sidebar */}
        <div className="bios-sidebar-left">
          <button
            className={`bios-menu-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
            onMouseEnter={() =>
              setHelpText(
                selectedLang === "Tr"
                  ? "Gelişmiş anakart ayarları, UEFI/CSM boot modları ve genel sistem seçeneklerini açar."
                  : "Opens advanced motherboard settings, UEFI/CSM boot modes and system configurations.",
              )
            }
          >
            <span className="bios-menu-btn-subtitle">Motherboard settings</span>
            <span className="bios-menu-btn-title">SETTINGS</span>
          </button>

          <button
            className={`bios-menu-btn ${activeTab === "mflash" ? "active" : ""}`}
            onClick={() => setActiveTab("mflash")}
            onMouseEnter={() =>
              setHelpText(
                selectedLang === "Tr"
                  ? "BIOS yazılımını güncellemek için sistemi flash güncelleme modunda başlatır."
                  : "Reboots the system into flash update mode to update the BIOS software.",
              )
            }
          >
            <span className="bios-menu-btn-subtitle">M-FLASH</span>
            <span className="bios-menu-btn-title">M-FLASH</span>
          </button>

          <button
            className={`bios-menu-btn ${activeTab === "monitor" ? "active" : ""}`}
            onClick={() => setActiveTab("monitor")}
            onMouseEnter={() =>
              setHelpText(
                selectedLang === "Tr"
                  ? "Kasa ve işlemci fan hızlarını, ısı eşiklerini ve grafik eğrilerini ayarlar."
                  : "Configures case and processor fan speeds, thermal curves and alerts.",
              )
            }
          >
            <span className="bios-menu-btn-subtitle">Monitoring & fan</span>
            <span className="bios-menu-btn-title">HARDWARE</span>
          </button>

          <button
            className={`bios-menu-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
            onMouseEnter={() =>
              setHelpText(
                selectedLang === "Tr"
                  ? "Yönetici şifreleri, kullanıcı yetkileri ve Secure Boot koruma seçenekleri."
                  : "Administrator passwords, user access control and Secure Boot.",
              )
            }
          >
            <span className="bios-menu-btn-subtitle">System protection</span>
            <span className="bios-menu-btn-title">SECURITY</span>
          </button>
        </div>

        {/* Center Screen */}
        <div className="bios-center-panel">
          {activeTab === "home" && (
            <div className="bios-neon-logo-container">
              <svg
                width="260"
                height="260"
                viewBox="0 0 120 120"
                fill="none"
                className="bios-neon-logo"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="neonDragonGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="50%" stopColor="#ff0080" />
                    <stop offset="100%" stopColor="#ff0000" />
                  </linearGradient>
                </defs>
                <path
                  d="M 60 8 C 87 8, 107 16, 110 28 C 110 65, 98 94, 60 112 C 22 94, 10 65, 10 28 C 13 16, 33 8, 60 8 Z"
                  fill="none"
                  stroke="url(#neonDragonGrad)"
                  strokeWidth="3"
                />
                <g transform="translate(38, 38) scale(1.8)">
                  <path
                    d="M16.362 10.042c-1.044.56-2.193 1.05-3.7 1.142a4.26 4.26 0 0 1-2.321-.556c-.155-.09-.51-.26-.503-.457.011-.242.582-.303.816-.306 5.262-.178 6.29-2.472 6.286-2.563 0-.083-.09.011-.09.011-1.38 1.777-4.937 1.973-4.937 1.973-.877.121-1.761-.08-2.215-.529a.794.794 0 0 1-.215-.39c-.102.122-.17.25-.291.379-.114.128-.458.499-.484.06-.019-.325.076-.393.2-.586a5.178 5.178 0 0 1 .193-.276c.374-.49.684-.997 1.123-1.402.037-.038.11-.075.09-.11a6.221 6.221 0 0 0-3.624 4.166 6.508 6.508 0 0 0-.23 1.72c0 .62.082 1.209.21 1.75.258 1.073.56 1.817 1.033 2.66.155-.211.219-.491.306-.752.098-.276.166-.642.302-.87.321-.528 2.079-.396 1.599-.763a3.613 3.613 0 0 1-.397-.359 7.083 7.083 0 0 1-.673-.831c-.412-.582-.756-1.285-.79-2.2.469 1.21 1.18 2.222 2.313 2.774.378.182.813.378 1.323.367-1.341-.253-2.162-1.285-2.717-2.374-.087-.17-.208-.332-.25-.476a.4.4 0 0 1-.011-.189c.076-.336.484-.17.726-.083a8.489 8.489 0 0 0 3.602.438 6.678 6.678 0 0 0 1.874-.476c.545-.227 1.04-.518 1.452-.896m-2.34 2.657a8.001 8.001 0 0 1-2.4-.189 3.969 3.969 0 0 1-1.754-.865c-.181-.166-.295-.469-.597-.397-.026.22.151.378.272.514a3.507 3.507 0 0 0 1.573.896c.835.257 2.003.283 2.906.038M11.35 10.22c-.178 0-.771-.098-.786.098-.012.121.245.212.381.25.53.136 1.255.086 1.784.037a8.515 8.515 0 0 0 2.098-.465c.99-.362 1.795-.88 2.457-1.55.181-.18.162-.234-.034-.067a6.365 6.365 0 0 1-1.769 1.032c-1.172.472-2.517.665-4.131.665m6.576-6.717c.136.034.299.027.37.068.133.08.133.273.224.431-.54.091-.718-.302-.972-.585.091.007.227.052.378.086M7.325 16.57c-.393-.613-2.39-3.19-.832-6.989 2.128-5.178 7.88-3.772 8.421-3.557.064-.434.257-.884.764-.994a1.712 1.712 0 0 1 .612 0c-.522.193-1.077.427-1.05.976.022.49.52.835.936.91 0 0 .33.072.567-.075a.019.019 0 0 0 .016-.012c.064-.037.12-.075.204-.105a.979.979 0 0 1 .529-.023c.049.011.143.09.227.087.052 0 .136-.076.211-.087.2-.038.397.072.582.147.125.053.465.099.488.273.011.12-.178.264-.28.34a1.765 1.765 0 0 1-.423.23c.56-.045 1.682-.48 1.512.246-.015.076-.057.14-.042.178.578-.197.76-.685.673-1.372-.076.022-.14.17-.2.215v-.004c0-.196.01-.491-.125-.612.068.359-.121.53-.382.654a6.176 6.176 0 0 0-.695-.975c-.027.113-.012.26-.046.37a.518.518 0 0 0-.438-.351c-.129-.02-.272.022-.427 0-.2-.034-.431-.174-.446-.325-.027-.25.423-.367.65-.428.049.163.117.295.17.45a1.693 1.693 0 0 1 .964-.43c.102 0 .329.037.363.113.079.162-.129.355-.19.427-.037.038-.098.08-.079.102.39-.102.567-.355.84-.544.143.189.196.59.173.858.31-.303.318-.824.291-1.376a1.761 1.761 0 0 1 .749.597 1.943 1.943 0 0 0-.68-.756c-.1-.064-.228-.094-.303-.166-.068-.068-.151-.303-.242-.322-.113-.022-.265.11-.397.118-.238.019-.367-.144-.416-.378-.578.158-.8-.197-.937-.632-.023-.075-.023-.18-.06-.264-.042-.106-.273-.212-.394-.257a1.092 1.092 0 0 0-.548-.068c-.17.026-.294.113-.491.12-.476.027-.971-.18-1.357-.37A8.289 8.289 0 0 1 12.896.113c-.03-.038-.053-.094-.11-.113.125.385.348.707.556 1.005.639.915 1.47 1.58 2.283 2.215a1.308 1.308 0 0 1-.805-.208 4.165 4.165 0 0 1-.65-.416c-.85.726-2.548.81-3.916 1.134.567-.019 1.417.163 1.916.246h-.015c-2.389.094-4.449.794-5.877 2.147.37-.136.706-.306 1.118-.405-.59.537-1.171 1.096-1.644 1.75-.468.647-.967 1.33-.986 2.404.287-.28.578-.642.979-.847a13.108 13.108 0 0 0-.85 2.268c-.197.718-.492 1.913-.02 2.582.03-.238.03-.51.19-.624.28.661.76 1.996 2.26 3.319m5.68-14.095c.114.102.333.273.465.265.208 0 .314-.189.458-.272-.719-.321-1.388-.786-2.034-1.168.098.151.227.28.355.435.239.272.477.506.756.74m-8.05 5.16c.075.155 0 .366.011.517.234-.635.688-1.134 1.119-1.572.023-.026.087-.08.049-.072-.227.11-.355.314-.665.34-.174-.196-.174-.793.06-.922.288.087.477-.162.446-.427-.056-.423-.578-.707-.816-.877.125.159.367.303.423.537.02.083.015.242-.075.268-.133.038-.208-.11-.34-.09-.114.018-.167.219-.19.359a2.76 2.76 0 0 0-.03.529c0 .087.034.219-.03.283-.08-.038-.098-.136-.132-.215-.125-.276-.34-.647-.254-1.013.057-.023.163.007.2-.03.02-.227-.143-.443-.29-.586a.983.983 0 0 0-.926-.227c.211.038.68.068.684.302 0 .087-.102.212-.129.28-.166.408.023.93.22 1.194.113.152.28.295.181.575-.128-.008-.246-.09-.363-.155-.166-.095-.34-.185-.423-.329-.083-.162-.09-.325-.204-.446-.284-.321-.896-.544-1.342-.272.378-.011.73.011.877.26a1.119 1.119 0 0 1 .12.454c.008.068-.01.16.023.208.057.098.235.083.34.144.14.08.227.298.382.435a1.02 1.02 0 0 0 .133.102c.242.143.816.196.937.446m3.046 10.057c-.578.306-.914.907-.986 1.67.113-.302.43-.46.767-.615.216-.099.601-.197.662-.397.053-.155.037-.405-.038-.507-.083-.113-.227-.147-.405-.15m1.406 2.683a1.708 1.708 0 0 0-.907 1.38c.117-.28.424-.398.734-.53.189-.076.517-.162.578-.317.045-.125.045-.326-.023-.416-.064-.095-.283-.167-.382-.121m1.701 1.625c-.321.287-.506.88-.476 1.444.08-.321.325-.446.605-.631.162-.102.491-.261.552-.42a.469.469 0 0 0-.118-.461c-.181-.151-.453-.026-.567.072m2.627.567c-.313.276-.415.831-.34 1.432.076-.302.238-.45.454-.635.128-.113.332-.264.374-.42.068-.256-.208-.51-.491-.377m.544-6.085c.174.022.34.113.476.158.011-.049-.05-.071-.08-.098-.385-.329-1.277-.196-1.473.208.034.072.155.076.173.162.016.091-.117.223-.185.295-.177.193-.344.303-.544.439-.098.068-.185.181-.302.17.06-.238.189-.333.29-.537.076-.136.25-.499.152-.646-.057-.095-.355-.046-.4-.151-.039-.087.03-.197.079-.25.14-.151.43-.234.687-.287-.393 0-1.103.132-1.27.457-.113.22-.015.53.231.556.095.306-.151.684-.333.824a.344.344 0 0 1-.15.083c-.303.038-.22-.31-.296-.53-.026-.075-.075-.139-.12-.2-.084.783.086 1.554.264 2.17-.019-.215.015-.43.151-.495.31-.151.726.075 1.089.098.378.019.597-.212.858-.22.136 0 .234.092.359.061.087-.022.159-.181.234-.28a1.017 1.017 0 0 1 .265-.256c.359-.208.73.075.967.208-.211-.39-.914-.688-1.451-.428-.113.053-.204.193-.336.265-.205.121-.48.087-.745.076-.09-.008-.189.019-.26-.042.067-.34.392-.351.634-.499.348-.208.68-.525.718-1.02 0-.068-.026-.163.027-.227.049-.068.174-.076.29-.06m3.138 5.204c-.136-.17-.446-.125-.488.087-.038.215.151.438.284.574a1.126 1.126 0 0 0 .514.36c.011 0 .019.018.022 0a1.01 1.01 0 0 1-.215-.477c-.038-.211-.026-.43-.12-.548m.585-9.343c.359.026.847.14.979.348-.087-.284-.631-1.867-3.156-1.758.503.151 1.077.321 1.512.597.132.08.325.204.302.405-.026.223-.446.434-.748.457-.325.023-.575-.128-.764-.227.321.409.847.715 1.591.635-.018-.094-.143-.204-.09-.347.038-.099.2-.125.374-.114m2.086 6.04c-.098.023-.219.163-.208.302.02.19.254.28.465.265a1.175 1.175 0 0 0 .718-.291c-.396.102-.672-.34-.975-.276m.34-.922c.235-.34.31-.896.393-1.414.042-.276.08-.529.16-.733.09-.22.241-.393.294-.616.05-.216-.038-.37-.113-.548-.174-.4-.348-.798-.673-1.002-.386-.245-.987-.177-1.535-.132a18.282 18.282 0 0 0-.767.076 5.216 5.216 0 0 1-.794.064c-1.096-.02-1.727-.548-1.848-1.542 0 0 0-.012-.011-.008-.151.99.408 1.576 1.21 1.75.064.136.21.257.162.446-.053.227-.424.234-.684.2a1.425 1.425 0 0 1-.658-.28 3.383 3.383 0 0 1-.854-1 2.699 2.699 0 0 0 2.721 1.836c.48-.034.919-.14 1.3-.287-.555 0-1.292.019-1.451-.367a.503.503 0 0 1 .06-.438c.47.056.889-.046 1.282-.068a2.744 2.744 0 0 1 .96.117 1.22 1.22 0 0 1 .642.438c.272.4.303.987.204 1.561a7.181 7.181 0 0 1-.453 1.41c-.37.922-1.111 2.317-1.697 2.835-.703.593-1.584.937-2.608 1.202a6.66 6.66 0 0 1-1.323.208c-1.054.045-1.901-.102-2.46-.598a2.445 2.445 0 0 1-.605-.914 6.474 6.474 0 0 1-.363-3.04c-.038-.007-.064.035-.083.046-.03.03-.057.065-.09.091-.371.333-1.146.813-1.834.488a.635.635 0 0 1-.314-.288c-.189-.363.095-.676.314-.846.162-.125.382-.284.654-.216.162.038.416.246.416.416 0 .098-.223.28-.394.28-.177 0-.29-.144-.377-.227-.016-.027-.046-.087-.087-.06-.19.83.986.8 1.39.404.348-.34.48-1.062.163-1.52-.189-.264-.54-.366-.93-.31-.347.053-.812.152-1.028.314-.302.235-.34.726-.46 1.111a3.651 3.651 0 0 1-.454.972c-.027.038-.072.064-.065.11.465.03.862.15 1.002.487a.907.907 0 0 1 .038.465c-.065.302-.238.555-.102.915.226.597 1.092.71 1.36 1.254.114.223.091.537.235.756.177.269.597.238.986.303.22.045.439.09.605.192.321.19.332.632.718.768.23.075.43-.038.624-.091.15-.042.31-.064.453-.09.337-.054.582.026.9.12a1.406 1.406 0 0 0 .895 0c.257-.098.443-.276.643-.438.408-.325.809-.631 1.353-.805.552-.174 1.21-.261 1.512-.643a2.124 2.124 0 0 0 .302-.839c.14-.631.344-1.202.639-1.652.151-.226.37-.4.525-.623m1.24-4.12c-.087.117-.28.132-.408.212-.027.46.476-.02.408-.216m.19 2.192c-.186.121-.553-.064-.711.095-.084.605.653.159.729-.068 0-.015 0-.03-.023-.027"
                    fill="url(#neonDragonGrad)"
                  />
                </g>
              </svg>
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="bios-page-title">ANAKART AYARLARI (SETTINGS)</div>

              <div className="bios-settings-grid">
                <div
                  className="bios-settings-row"
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? "BIOS başlatma modunu değiştirir. UEFI yeni nesil işletim sistemleri için önerilir."
                        : "Changes BIOS boot mode. UEFI is recommended for modern operating systems.",
                    )
                  }
                >
                  <div>
                    <div className="bios-settings-label">Boot Mod Seçimi</div>
                    <div className="bios-settings-desc">
                      Sistem yükleme arayüzü
                    </div>
                  </div>
                  <select
                    className="bios-select"
                    value={biosMode}
                    onChange={(e) =>
                      setBiosMode(e.target.value as "UEFI" | "CSM")
                    }
                  >
                    <option value="UEFI">UEFI</option>
                    <option value="CSM">Legacy (CSM)</option>
                  </select>
                </div>

                <div
                  className="bios-settings-row"
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? "Hızlı başlatma özelliği. Devreye alındığında bios POST ekranı atlanabilir."
                        : "Fast boot option. When enabled, BIOS POST screen can be bypassed.",
                    )
                  }
                >
                  <div>
                    <div className="bios-settings-label">
                      Fast Boot (Hızlı Önyükleme)
                    </div>
                    <div className="bios-settings-desc">
                      Sistemi daha hızlı yükleme seçeneği
                    </div>
                  </div>
                  <select
                    className="bios-select"
                    value={fastBoot ? "ON" : "OFF"}
                    onChange={(e) => setFastBoot(e.target.value === "ON")}
                  >
                    <option value="OFF">KAPALI (Disabled)</option>
                    <option value="ON">AKTİF (Enabled)</option>
                  </select>
                </div>

                <div
                  className="bios-settings-row"
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? "Otomatik işlemci overclock profili. CPU frekansını en üst seviyeye çıkartır."
                        : "Automatic CPU overclock profile. Boosts CPU clock speeds to maximum.",
                    )
                  }
                >
                  <div>
                    <div className="bios-settings-label">MSI GAME BOOST</div>
                    <div className="bios-settings-desc">
                      Otomatik işlemci hız aşırtma modu
                    </div>
                  </div>
                  <button
                    className="bios-button"
                    style={{ backgroundColor: gameBoost ? "#ff0000" : "#444" }}
                    onClick={() => setGameBoost(!gameBoost)}
                  >
                    {gameBoost ? "AKTİF (ON)" : "KAPALI (OFF)"}
                  </button>
                </div>

                <div
                  className="bios-settings-row"
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? "RAM belleklerin frekans hızlarını 3200MHz değerine sabitler."
                        : "Locks RAM operating frequencies to 3200MHz.",
                    )
                  }
                >
                  <div>
                    <div className="bios-settings-label">
                      A-XMP RAM Profil 1
                    </div>
                    <div className="bios-settings-desc">
                      Hafıza yüksek çalışma frekansı (3200MHz)
                    </div>
                  </div>
                  <button
                    className="bios-button"
                    style={{ backgroundColor: axmp ? "#ff0000" : "#444" }}
                    onClick={() => setAxmp(!axmp)}
                  >
                    {axmp ? "AKTİF (ON)" : "KAPALI (OFF)"}
                  </button>
                </div>

                <div
                  className="bios-settings-row"
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? "Değişiklikleri kaydederek bilgisayarı normal olarak başlatır."
                        : "Saves changes and boots the computer normally.",
                    )
                  }
                >
                  <div>
                    <div className="bios-settings-label">
                      Ayarları Kaydet ve Çık
                    </div>
                    <div className="bios-settings-desc">
                      F10 kısayolu ile aynı işlemi yapar
                    </div>
                  </div>
                  <button className="bios-button" onClick={onExit}>
                    Kaydet ve Çık (Save & Exit)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "mflash" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div className="bios-page-title" style={{ width: "100%" }}>
                M-FLASH FLASH UPDATE
              </div>

              <div
                style={{
                  border: "1px solid #ff0000",
                  padding: "25px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 0, 0, 0.05)",
                  maxWidth: "450px",
                  marginTop: "15px",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "#ff3b30",
                    marginBottom: "15px",
                  }}
                >
                  DİKKAT (WARNING)
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    lineHeight: "1.6",
                    color: "#dddddd",
                    marginBottom: "20px",
                  }}
                >
                  Sistem BIOS güncelleme arayüzüne (M-Flash) geçmek için
                  bilgisayarı yeniden başlatacaktır. Bu aşamada güç bağlantısını
                  kesmeyin. Devam etmek istiyor musunuz?
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                  }}
                >
                  <button className="bios-button" onClick={startMflash}>
                    EVET (YES)
                  </button>
                  <button
                    className="bios-button"
                    style={{ backgroundColor: "#444" }}
                    onClick={() => setActiveTab("home")}
                  >
                    HAYIR (NO)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "monitor" && (
            <div className="bios-fan-monitor">
              <div className="bios-page-title">
                FAN HIZ KONTROLÜ (HARDWARE MONITOR)
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                {/* Fan speed SVG graph */}
                <div className="bios-fan-graph-container" style={{ flex: 1 }}>
                  {/* Grid Lines */}
                  <div
                    className="bios-fan-grid-line"
                    style={{
                      left: "25%",
                      top: 0,
                      width: "1px",
                      height: "100%",
                    }}
                  />
                  <div
                    className="bios-fan-grid-line"
                    style={{
                      left: "50%",
                      top: 0,
                      width: "1px",
                      height: "100%",
                    }}
                  />
                  <div
                    className="bios-fan-grid-line"
                    style={{
                      left: "75%",
                      top: 0,
                      width: "1px",
                      height: "100%",
                    }}
                  />
                  <div
                    className="bios-fan-grid-line"
                    style={{
                      left: 0,
                      top: "25%",
                      width: "100%",
                      height: "1px",
                    }}
                  />
                  <div
                    className="bios-fan-grid-line"
                    style={{
                      left: 0,
                      top: "50%",
                      width: "100%",
                      height: "1px",
                    }}
                  />
                  <div
                    className="bios-fan-grid-line"
                    style={{
                      left: 0,
                      top: "75%",
                      width: "100%",
                      height: "1px",
                    }}
                  />

                  {/* SVG path mapping */}
                  <svg className="bios-fan-curve-svg">
                    <polyline
                      fill="none"
                      stroke="#ff0000"
                      strokeWidth="2.5"
                      points={fanNodes
                        .map((n) => `${n.temp * 2.8},${180 - n.speed * 1.8}`)
                        .join(" ")}
                    />
                  </svg>

                  {/* Render dot nodes */}
                  {fanNodes.map((node, idx) => (
                    <div
                      key={idx}
                      className="bios-fan-node"
                      style={{
                        left: `${node.temp * 2.8}px`,
                        top: `${180 - node.speed * 1.8}px`,
                      }}
                      title={`${node.temp}°C -> %${node.speed} Hız`}
                    />
                  ))}
                </div>

                {/* Info and stats card */}
                <div
                  style={{
                    flex: "0 0 160px",
                    backgroundColor: "#111",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #222",
                    fontSize: "11px",
                  }}
                >
                  <div>
                    <strong>CPU Fan Hızı:</strong>
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#ff3b30",
                      margin: "5px 0",
                    }}
                  >
                    1480 RPM
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #222",
                      paddingTop: "5px",
                      marginTop: "5px",
                    }}
                  >
                    <strong>Sıcaklık Değerleri:</strong>
                    <div style={{ color: "#aaa", marginTop: "3px" }}>
                      Node 1: 20°C
                      <br />
                      Node 2: 45°C
                      <br />
                      Node 3: 65°C
                      <br />
                      Node 4: 85°C
                    </div>
                  </div>
                </div>
              </div>

              {/* Adjust sliders to control nodes */}
              <div style={{ marginTop: "10px" }}>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Fan Profil Eğrisi Noktalarını Ayarla:
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {fanNodes.map((node, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#111",
                        padding: "6px 10px",
                        borderRadius: "3px",
                        border: "1px solid #222",
                      }}
                    >
                      <span style={{ fontSize: "11px" }}>
                        Nokta {idx + 1} ({node.temp}°C):
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={node.speed}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            const copy = [...fanNodes];
                            copy[idx].speed = val;
                            setFanNodes(copy);
                          }}
                          style={{
                            width: "80px",
                            accentColor: "#ff0000",
                            cursor: "pointer",
                          }}
                        />
                        <span
                          style={{
                            minWidth: "32px",
                            textAlign: "right",
                            fontWeight: "bold",
                            fontSize: "11px",
                          }}
                        >
                          %{node.speed}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="bios-page-title">
                SİSTEM GÜVENLİK AYARLARI (SECURITY)
              </div>

              <div className="bios-settings-grid">
                <div
                  className="bios-settings-row"
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? "BIOS ayarlarına girmek için yönetici şifresi belirler."
                        : "Sets password to access BIOS configuration settings.",
                    )
                  }
                >
                  <div>
                    <div className="bios-settings-label">
                      Yönetici Şifresi (Administrator Password)
                    </div>
                    <div className="bios-settings-desc">
                      {adminPassword
                        ? "AKTİF (PASSPORT SET)"
                        : "BELİRLENMEMİŞ (NOT SET)"}
                    </div>
                  </div>
                  <button
                    className="bios-button"
                    onClick={() => {
                      setPassModalType("admin");
                      setTempPassword(adminPassword);
                    }}
                  >
                    {adminPassword ? "Şifre Değiştir" : "Şifre Belirle"}
                  </button>
                </div>

                <div
                  className="bios-settings-row"
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? "Bilgisayar açılışında sorulacak kullanıcı şifresi."
                        : "Sets password required on computer boot up.",
                    )
                  }
                >
                  <div>
                    <div className="bios-settings-label">
                      Kullanıcı Şifresi (User Password)
                    </div>
                    <div className="bios-settings-desc">
                      {userPassword
                        ? "AKTİF (PASSPORT SET)"
                        : "BELİRLENMEMİŞ (NOT SET)"}
                    </div>
                  </div>
                  <button
                    className="bios-button"
                    onClick={() => {
                      setPassModalType("user");
                      setTempPassword(userPassword);
                    }}
                  >
                    {userPassword ? "Şifre Değiştir" : "Şifre Belirle"}
                  </button>
                </div>

                <div
                  className="bios-settings-row"
                  onMouseEnter={() =>
                    setHelpText(
                      selectedLang === "Tr"
                        ? "Güvenli önyükleme seçeneği. İşletim sistemi güvenliğini sağlar."
                        : "Secure Boot option. Protects OS loading sequence from malware.",
                    )
                  }
                >
                  <div>
                    <div className="bios-settings-label">Secure Boot Modu</div>
                    <div className="bios-settings-desc">
                      Yalnızca imzalı sürücülerin yüklenmesine izin verir
                    </div>
                  </div>
                  <select
                    className="bios-select"
                    value={secureBoot ? "ON" : "OFF"}
                    onChange={(e) => setSecureBoot(e.target.value === "ON")}
                  >
                    <option value="ON">AKTİF (Enabled)</option>
                    <option value="OFF">KAPALI (Disabled)</option>
                  </select>
                </div>
              </div>

              {/* Password Setting Dialog */}
              {passModalType && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#151515",
                      border: "2px solid #ff0000",
                      padding: "20px",
                      borderRadius: "6px",
                      width: "320px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "#ff0000",
                        fontWeight: "bold",
                        marginBottom: "15px",
                      }}
                    >
                      {passModalType === "admin"
                        ? "YÖNETİCİ ŞİFRESİ"
                        : "KULLANICI ŞİFRESİ"}{" "}
                      BELİRLE
                    </div>

                    <input
                      type="password"
                      placeholder="Yeni şifreyi yazın..."
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      style={{
                        width: "100%",
                        backgroundColor: "#000",
                        color: "#fff",
                        border: "1px solid #333",
                        padding: "8px",
                        marginBottom: "15px",
                        boxSizing: "border-box",
                        textAlign: "center",
                        fontSize: "14px",
                        fontFamily: "monospace",
                      }}
                      autoFocus
                    />

                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="bios-button"
                        onClick={() => {
                          if (passModalType === "admin")
                            setAdminPassword(tempPassword);
                          else setUserPassword(tempPassword);
                          setPassModalType(null);
                        }}
                      >
                        Kaydet
                      </button>
                      <button
                        className="bios-button"
                        style={{ backgroundColor: "#444" }}
                        onClick={() => setPassModalType(null)}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="bios-sidebar-right">
          <div className="bios-right-tabs">
            <button className="bios-right-tab active">YARDIM (HELP)</button>
            <button className="bios-right-tab">BİLGİ (INFO)</button>
          </div>

          <div className="bios-right-content">{helpText}</div>

          <div className="bios-right-keys">
            <div className="bios-key-row">
              <span>Yön Tuşları</span>
              <span className="bios-key-name">↑ ↓ ← →</span>
            </div>
            <div className="bios-key-row">
              <span>Seçim Yap</span>
              <span className="bios-key-name">ENTER</span>
            </div>
            <div className="bios-key-row">
              <span>Görüntü Al</span>
              <span className="bios-key-name">F12</span>
            </div>
            <div className="bios-key-row">
              <span>Kaydet & Çık</span>
              <span className="bios-key-name">F10</span>
            </div>
            <div className="bios-key-row">
              <span>Geri Dön</span>
              <span className="bios-key-name">ESC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MSIBios: React.FC = () => {
  const { setBootStage } = useSystem();
  const [showSetup, setShowSetup] = useState(false);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (showSetup) return;

    // BIOS POST console typing simulator
    const interval = setInterval(() => {
      setDots((d) => (d.length < 3 ? d + "." : ""));
    }, 500);

    // Auto transition to loading screen after 4.5 seconds if they don't enter BIOS
    const timeout = setTimeout(() => {
      setBootStage("loading");
    }, 4500);

    // Keydown listener for DEL key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Del") {
        setShowSetup(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSetup, setBootStage]);

  if (showSetup) {
    return <MSIBIOSSetup onExit={() => setBootStage("loading")} />;
  }

  return (
    <div
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.72)), url(/bbg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        width: "100vw",
        height: "100vh",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* MSI Logo removed - background and text only */}

      {/* POST Information */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "50px",
          textAlign: "left",
          fontSize: "13px",
          lineHeight: "1.8",
          color: "#aaaaaa",
        }}
      >
        <div>MSI Click BIOS 5 (E7S99AMS)</div>
        <div>AMD EPYC 9965 192-Core Processor</div>
        <div>DRAM DDR5 Speed: 3200MHz | Toplam Kapasite: 262144MB (256GB)</div>
        <div>PCIe M.2 NVMe SSD 2.0TB algılandı.</div>
        <div
          style={{ color: "#ff3b30", fontWeight: "bold", marginTop: "10px" }}
        >
          BIOS ayarlarına girmek için [DEL] veya [DELETE] tuşuna basın{dots}
        </div>
      </div>
    </div>
  );
};
