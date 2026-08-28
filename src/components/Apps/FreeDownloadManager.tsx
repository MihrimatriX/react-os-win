import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Settings,
  FolderOpen,
  Download,
  ArrowDown,
} from "lucide-react";
import "./fdm.css";

interface DownloadItem {
  id: string;
  name: string;
  url: string;
  size: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number; // 0 to 100
  status: "downloading" | "completed" | "paused" | "error";
  speed: number; // in KB/s
  addedAt: string;
}

export const FreeDownloadManagerApp: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: "1",
      name: "ubuntu-24.04-desktop-amd64.iso",
      url: "https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso",
      size: "4.12 GB",
      totalBytes: 4423680000,
      downloadedBytes: 4423680000,
      progress: 100,
      status: "completed",
      speed: 0,
      addedAt: "2026-05-26 10:30",
    },
    {
      id: "2",
      name: "blender-4.1.1-windows-x64.msi",
      url: "https://download.blender.org/release/Blender4.1/blender-4.1.1-windows-x64.msi",
      size: "315 MB",
      totalBytes: 330301440,
      downloadedBytes: 330301440,
      progress: 100,
      status: "completed",
      speed: 0,
      addedAt: "2026-05-26 11:15",
    },
    {
      id: "3",
      name: "node-v20.13.1-x64.msi",
      url: "https://nodejs.org/dist/v20.13.1/node-v20.13.1-x64.msi",
      size: "30.4 MB",
      totalBytes: 31876710,
      downloadedBytes: 12750684,
      progress: 40,
      status: "paused",
      speed: 0,
      addedAt: "2026-05-26 12:45",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<
    "all" | "downloading" | "completed" | "paused"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  // Real-time speed history for SVG graph (last 20 points)
  const [speedHistory, setSpeedHistory] = useState<number[]>(Array(20).fill(0));
  const activeDownloadsCount = downloads.filter(
    (d) => d.status === "downloading",
  ).length;

  // Simulator interval for progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.status !== "downloading") return item;

          const nextDownloaded = item.downloadedBytes + item.speed * 1024;
          const nextProgress = Math.floor(
            (nextDownloaded / item.totalBytes) * 100,
          );

          if (nextProgress >= 100) {
            return {
              ...item,
              progress: 100,
              downloadedBytes: item.totalBytes,
              status: "completed",
              speed: 0,
            };
          }

          // Random speed variance slightly
          const baseSpeed = item.id === "3" ? 1200 : 4500; // KB/s
          const speedVariance = Math.floor((Math.random() - 0.5) * 500);

          return {
            ...item,
            downloadedBytes: nextDownloaded,
            progress: nextProgress,
            speed: Math.max(100, baseSpeed + speedVariance),
          };
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update speed history graph
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTotalSpeed = downloads
        .filter((d) => d.status === "downloading")
        .reduce((sum, d) => sum + d.speed, 0);

      setSpeedHistory((prev) => {
        const next = [...prev.slice(1), currentTotalSpeed];
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [downloads]);

  // Actions
  const handleAddDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadUrl.trim()) return;

    // Try to parse filename from URL
    let filename = "indirme_dosyasi";
    try {
      const parsedUrl = new URL(downloadUrl);
      const pathname = parsedUrl.pathname;
      const lastSegment = pathname.substring(pathname.lastIndexOf("/") + 1);
      if (lastSegment) {
        filename = decodeURIComponent(lastSegment);
      }
    } catch {
      filename = downloadUrl.split("/").pop() || "indirme_dosyasi";
    }

    // Set a mock file size (e.g. 550 MB)
    const mockTotalBytes = 576716800; // 550 MB

    const newItem: DownloadItem = {
      id: Date.now().toString(),
      name: filename,
      url: downloadUrl,
      size: "550 MB",
      totalBytes: mockTotalBytes,
      downloadedBytes: 0,
      progress: 0,
      status: "downloading",
      speed: 4800, // 4.8 MB/s initial
      addedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    setDownloads((prev) => [newItem, ...prev]);
    setDownloadUrl("");
    setIsModalOpen(false);
  };

  const handleTogglePlay = (id: string) => {
    setDownloads((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.status === "downloading") {
            return { ...item, status: "paused", speed: 0 };
          } else if (item.status === "paused") {
            return { ...item, status: "downloading", speed: 3500 };
          }
        }
        return item;
      }),
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu indirme kaydını silmek istediğinizden emin misiniz?")) {
      setDownloads((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handlePauseAll = () => {
    setDownloads((prev) =>
      prev.map((d) =>
        d.status === "downloading" ? { ...d, status: "paused", speed: 0 } : d,
      ),
    );
  };

  const handleResumeAll = () => {
    setDownloads((prev) =>
      prev.map((d) =>
        d.status === "paused"
          ? { ...d, status: "downloading", speed: 3000 }
          : d,
      ),
    );
  };

  const getFilteredDownloads = () => {
    switch (activeFilter) {
      case "downloading":
        return downloads.filter((d) => d.status === "downloading");
      case "completed":
        return downloads.filter((d) => d.status === "completed");
      case "paused":
        return downloads.filter((d) => d.status === "paused");
      default:
        return downloads;
    }
  };

  // Helper formatting download speeds
  const formatSpeed = (kbps: number) => {
    if (kbps === 0) return "0 KB/s";
    if (kbps > 1024) return `${(kbps / 1024).toFixed(1)} MB/s`;
    return `${kbps} KB/s`;
  };

  // Helper remaining calculation
  const calculateETA = (item: DownloadItem) => {
    if (item.status === "completed") return "Tamamlandı";
    if (item.status === "paused") return "Duraklatıldı";
    if (item.speed === 0) return "Hesaplanıyor...";

    const remainingBytes = item.totalBytes - item.downloadedBytes;
    const remainingSeconds = remainingBytes / (item.speed * 1024);

    if (remainingSeconds > 3600) {
      const hrs = Math.floor(remainingSeconds / 3600);
      const mins = Math.floor((remainingSeconds % 3600) / 60);
      return `${hrs} sa ${mins} dk`;
    }
    if (remainingSeconds > 60) {
      const mins = Math.floor(remainingSeconds / 60);
      const secs = Math.floor(remainingSeconds % 60);
      return `${mins} dk ${secs} sn`;
    }
    return `${Math.floor(remainingSeconds)} sn`;
  };

  // Render SVG charts
  const renderChartPath = () => {
    const maxVal = Math.max(...speedHistory, 5000); // minimum scale 5MB/s
    const width = 450;
    const height = 100;

    const points = speedHistory
      .map((val, idx) => {
        const x = (idx / 19) * width;
        const y = height - (val / maxVal) * (height - 10);
        return `${x},${y}`;
      })
      .join(" ");

    return points;
  };

  const totalSpeed = downloads
    .filter((d) => d.status === "downloading")
    .reduce((sum, d) => sum + d.speed, 0);

  return (
    <div className="fdm-container">
      {/* Header Toolbar */}
      <div className="fdm-toolbar">
        <button
          className="fdm-tool-btn btn-add"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          <span>Yeni İndirme</span>
        </button>
        <div className="torrent-tool-separator" />
        <button className="fdm-tool-btn" onClick={handleResumeAll}>
          <Play size={14} />
          <span>Hepsini Başlat</span>
        </button>
        <button className="fdm-tool-btn" onClick={handlePauseAll}>
          <Pause size={14} />
          <span>Hepsini Durdur</span>
        </button>
        <div className="torrent-tool-separator" />
        <button className="fdm-tool-btn" style={{ marginLeft: "auto" }}>
          <Settings size={14} />
          <span>Ayarlar</span>
        </button>
      </div>

      {/* Main Panel */}
      <div className="fdm-main">
        {/* Sidebar Filter Trees */}
        <div className="fdm-sidebar">
          <div
            className={`fdm-sidebar-item ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            <span>Tümü</span>
            <span className="fdm-badge">{downloads.length}</span>
          </div>
          <div
            className={`fdm-sidebar-item ${activeFilter === "downloading" ? "active" : ""}`}
            onClick={() => setActiveFilter("downloading")}
          >
            <span>İndirilenler</span>
            <span className="fdm-badge">
              {downloads.filter((d) => d.status === "downloading").length}
            </span>
          </div>
          <div
            className={`fdm-sidebar-item ${activeFilter === "completed" ? "active" : ""}`}
            onClick={() => setActiveFilter("completed")}
          >
            <span>Tamamlananlar</span>
            <span className="fdm-badge">
              {downloads.filter((d) => d.status === "completed").length}
            </span>
          </div>
          <div
            className={`fdm-sidebar-item ${activeFilter === "paused" ? "active" : ""}`}
            onClick={() => setActiveFilter("paused")}
          >
            <span>Duraklatılanlar</span>
            <span className="fdm-badge">
              {downloads.filter((d) => d.status === "paused").length}
            </span>
          </div>
        </div>

        {/* Content Listing Grid */}
        <div className="fdm-content">
          <div className="fdm-list-header">
            <span>Dosya Adı</span>
            <span>Boyut</span>
            <span>İlerleme</span>
            <span>Hız / Durum</span>
            <span>İşlemler</span>
          </div>

          <div className="fdm-list">
            {getFilteredDownloads().length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  opacity: 0.4,
                }}
              >
                <Download size={48} style={{ marginBottom: "10px" }} />
                <span>İndirme Kaydı Yok</span>
              </div>
            ) : (
              getFilteredDownloads().map((item) => (
                <div key={item.id} className="fdm-item">
                  <div className="fdm-name-col">
                    <span className="fdm-file-title" title={item.name}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#7a7d8d",
                        wordBreak: "break-all",
                      }}
                      title={item.url}
                    >
                      {item.url}
                    </span>
                  </div>
                  <div>{item.size}</div>
                  <div className="fdm-progress-col">
                    <div className="fdm-progress-container">
                      <div className="fdm-progress-bar-wrapper">
                        <div
                          className="fdm-progress-bar-fill"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="fdm-progress-percent">
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="fdm-status-col">
                    {item.status === "downloading" ? (
                      <span className="fdm-status-text downloading">
                        {formatSpeed(item.speed)}
                      </span>
                    ) : item.status === "completed" ? (
                      <span className="fdm-status-text completed">
                        Tamamlandı
                      </span>
                    ) : item.status === "paused" ? (
                      <span className="fdm-status-text paused">
                        Duraklatıldı
                      </span>
                    ) : (
                      <span className="fdm-status-text error">Hata</span>
                    )}
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#7a7d8d",
                        marginTop: "2px",
                      }}
                    >
                      {item.status === "downloading"
                        ? `Kalan: ${calculateETA(item)}`
                        : item.addedAt}
                    </div>
                  </div>
                  <div className="fdm-actions-col">
                    {item.status !== "completed" && (
                      <button
                        className="fdm-action-icon-btn"
                        onClick={() => handleTogglePlay(item.id)}
                        title={
                          item.status === "downloading"
                            ? "Duraklat"
                            : "Devam Et"
                        }
                      >
                        {item.status === "downloading" ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )}
                      </button>
                    )}
                    <button className="fdm-action-icon-btn" title="Klasörü Aç">
                      <FolderOpen size={14} />
                    </button>
                    <button
                      className="fdm-action-icon-btn"
                      onClick={() => handleDelete(item.id)}
                      title="Sil"
                      style={{ color: "#ff3b30" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details Chart Footer */}
          <div className="fdm-footer">
            <div className="fdm-footer-stats">
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <ArrowDown size={14} style={{ color: "#00d2fc" }} />
                <span>Toplam İndirme Hızı:</span>
              </div>
              <div
                style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}
              >
                {formatSpeed(totalSpeed)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#61657a", marginTop: "4px" }}
              >
                Aktif İndirmeler: {activeDownloadsCount} adet
              </div>
            </div>

            <div className="fdm-chart-container">
              <svg className="fdm-chart-svg">
                {/* Grid horizontal guidelines */}
                <line
                  x1="0"
                  y1="25"
                  x2="100%"
                  y2="25"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="50"
                  x2="100%"
                  y2="50"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="75"
                  x2="100%"
                  y2="75"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />

                <polyline
                  fill="none"
                  stroke="#007cc7"
                  strokeWidth="2"
                  points={renderChartPath()}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Add Download Dialog Popup */}
      {isModalOpen && (
        <div className="fdm-modal-overlay">
          <form className="fdm-modal glass" onSubmit={handleAddDownload}>
            <h3 className="fdm-modal-title">Yeni İndirme Başlat</h3>
            <div
              style={{
                fontSize: "12px",
                color: "#a6a9b6",
                marginBottom: "8px",
              }}
            >
              Lütfen indirmek istediğiniz dosyanın URL bağlantısını girin:
            </div>
            <input
              type="text"
              className="fdm-input"
              placeholder="http://, https://, ftp://..."
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              autoFocus
            />
            <div className="fdm-modal-buttons">
              <button
                type="button"
                className="fdm-btn btn-cancel"
                onClick={() => setIsModalOpen(false)}
              >
                İptal
              </button>
              <button type="submit" className="fdm-btn btn-submit">
                İndirmeyi Ekle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default FreeDownloadManagerApp;
