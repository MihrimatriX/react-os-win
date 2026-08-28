import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Settings,
  FolderOpen,
  FileText,
  Activity,
  Globe,
  Database,
} from "lucide-react";
import "./torrent.css";

interface TorrentItem {
  id: string;
  name: string;
  size: string;
  totalBytes: number;
  downloadedBytes: number;
  uploadedBytes: number;
  progress: number; // 0 to 100
  status: "downloading" | "seeding" | "paused" | "stalled";
  seedsConnected: number;
  seedsTotal: number;
  peersConnected: number;
  peersTotal: number;
  downSpeed: number; // in KB/s
  upSpeed: number; // in KB/s
  eta: string;
  hash: string;
  files: { name: string; size: string; progress: number }[];
  trackers: { url: string; status: string; peers: number; msg: string }[];
  peers: {
    ip: string;
    client: string;
    progress: number;
    downSpeed: number;
    upSpeed: number;
    country: string;
  }[];
}

export const TorrentClientApp: React.FC = () => {
  const [torrents, setTorrents] = useState<TorrentItem[]>([
    {
      id: "1",
      name: "ubuntu-24.04-desktop-amd64.iso.torrent",
      size: "4.12 GB",
      totalBytes: 4423680000,
      downloadedBytes: 4423680000,
      uploadedBytes: 1546188800, // 1.4 GB uploaded
      progress: 100,
      status: "seeding",
      seedsConnected: 18,
      seedsTotal: 124,
      peersConnected: 8,
      peersTotal: 54,
      downSpeed: 0,
      upSpeed: 145, // 145 KB/s upload
      eta: "Sonsuz",
      hash: "B4D8E9F6C8A237416A34F5C029BD1C7F32E27B1A",
      files: [
        {
          name: "ubuntu-24.04-desktop-amd64.iso",
          size: "4.12 GB",
          progress: 100,
        },
      ],
      trackers: [
        {
          url: "udp://tracker.opentrackr.org:1337/announce",
          status: "Çalışıyor",
          peers: 178,
          msg: "Başarılı",
        },
        {
          url: "udp://tracker.coppersurfer.tk:6969/announce",
          status: "Çalışıyor",
          peers: 120,
          msg: "Başarılı",
        },
        {
          url: "udp://open.stealth.si:80/announce",
          status: "Çevrimdışı",
          peers: 0,
          msg: "Bağlantı zaman aşımı",
        },
      ],
      peers: [
        {
          ip: "85.105.42.112",
          client: "qBittorrent/4.6.3",
          progress: 84.5,
          downSpeed: 0,
          upSpeed: 45,
          country: "TR",
        },
        {
          ip: "192.168.1.55",
          client: "uTorrent/3.5.5",
          progress: 99.2,
          downSpeed: 0,
          upSpeed: 80,
          country: "US",
        },
        {
          ip: "46.229.168.32",
          client: "Transmission/4.0.2",
          progress: 41.2,
          downSpeed: 0,
          upSpeed: 20,
          country: "DE",
        },
      ],
    },
    {
      id: "2",
      name: "debian-12.5.0-amd64-netinst.iso.torrent",
      size: "628 MB",
      totalBytes: 658505728,
      downloadedBytes: 395103436, // 60% done
      uploadedBytes: 42106880,
      progress: 60,
      status: "downloading",
      seedsConnected: 42,
      seedsTotal: 340,
      peersConnected: 68,
      peersTotal: 850,
      downSpeed: 8450, // 8.4 MB/s down
      upSpeed: 210, // 210 KB/s up
      eta: "25 sn",
      hash: "C7CF12AA2190AF2C2D8C3E59B01CEF6D8A29DE2B",
      files: [
        {
          name: "debian-12.5.0-amd64-netinst.iso",
          size: "628 MB",
          progress: 60,
        },
      ],
      trackers: [
        {
          url: "udp://tracker.opentrackr.org:1337/announce",
          status: "Çalışıyor",
          peers: 1190,
          msg: "Başarılı",
        },
        {
          url: "udp://tracker.coppersurfer.tk:6969/announce",
          status: "Çalışıyor",
          peers: 840,
          msg: "Başarılı",
        },
      ],
      peers: [
        {
          ip: "88.230.12.98",
          client: "qBittorrent/4.6.3",
          progress: 100,
          downSpeed: 2400,
          upSpeed: 10,
          country: "TR",
        },
        {
          ip: "172.56.21.233",
          client: "uTorrent/2.2.1",
          progress: 74.3,
          downSpeed: 4200,
          upSpeed: 50,
          country: "US",
        },
        {
          ip: "194.25.101.4",
          client: "Deluge/2.1.1",
          progress: 58.1,
          downSpeed: 1850,
          upSpeed: 150,
          country: "DE",
        },
      ],
    },
  ]);

  const [selectedTorrentId, setSelectedTorrentId] = useState<string>("2");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "downloading" | "seeding" | "paused"
  >("all");
  const [activeDetailTab, setActiveDetailTab] = useState<
    "general" | "trackers" | "peers" | "speed" | "files"
  >("general");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [magnetLink, setMagnetLink] = useState("");

  // SVG speed graph history (last 20 values for down and up speeds)
  const [downSpeedHistory, setDownSpeedHistory] = useState<number[]>(
    Array(20).fill(0),
  );
  const [upSpeedHistory, setUpSpeedHistory] = useState<number[]>(
    Array(20).fill(0),
  );

  // Simulator interval
  useEffect(() => {
    const interval = setInterval(() => {
      setTorrents((prev) =>
        prev.map((t) => {
          if (t.status !== "downloading") {
            // If seeding, just simulate up speed variance
            if (t.status === "seeding") {
              const variance = Math.floor((Math.random() - 0.5) * 20);
              return {
                ...t,
                upSpeed: Math.max(10, 150 + variance),
                uploadedBytes:
                  t.uploadedBytes + Math.max(10, 150 + variance) * 1024,
              };
            }
            return t;
          }

          const nextDownloaded = t.downloadedBytes + t.downSpeed * 1024;
          let nextProgress = Math.floor((nextDownloaded / t.totalBytes) * 100);

          if (nextProgress >= 100) {
            nextProgress = 100;
            return {
              ...t,
              progress: 100,
              downloadedBytes: t.totalBytes,
              status: "seeding",
              downSpeed: 0,
              upSpeed: 180,
              eta: "Sonsuz",
            };
          }

          // Variate speeds
          const baseDownSpeed = 8200; // KB/s
          const downVariance = Math.floor((Math.random() - 0.5) * 1000);
          const currentDownSpeed = Math.max(500, baseDownSpeed + downVariance);

          const baseUpSpeed = 190;
          const upVariance = Math.floor((Math.random() - 0.5) * 50);
          const currentUpSpeed = Math.max(10, baseUpSpeed + upVariance);

          // Recalculate ETA
          const remainingSecs =
            (t.totalBytes - nextDownloaded) / (currentDownSpeed * 1024);
          const etaStr =
            remainingSecs > 60
              ? `${Math.floor(remainingSecs / 60)} dk ${Math.floor(remainingSecs % 60)} sn`
              : `${Math.floor(remainingSecs)} sn`;

          // Update detailed lists
          const updatedPeers = t.peers.map((p) => {
            const pVariance = Math.floor((Math.random() - 0.5) * 100);
            return {
              ...p,
              progress: Math.min(100, p.progress + currentDownSpeed / 80000),
              downSpeed: Math.max(0, p.downSpeed + pVariance),
            };
          });

          return {
            ...t,
            downloadedBytes: nextDownloaded,
            progress: nextProgress,
            downSpeed: currentDownSpeed,
            upSpeed: currentUpSpeed,
            eta: etaStr,
            peers: updatedPeers,
            files: t.files.map((f) => ({ ...f, progress: nextProgress })),
          };
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update speed graph histories
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDown = torrents.reduce((sum, t) => sum + t.downSpeed, 0);
      const currentUp = torrents.reduce((sum, t) => sum + t.upSpeed, 0);

      setDownSpeedHistory((prev) => [...prev.slice(1), currentDown]);
      setUpSpeedHistory((prev) => [...prev.slice(1), currentUp]);
    }, 1000);

    return () => clearInterval(interval);
  }, [torrents]);

  // Actions
  const handleAddTorrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!magnetLink.trim()) return;

    let torrentName = "yeni_indirme.torrent";
    if (magnetLink.includes("dn=")) {
      const match = magnetLink.match(/dn=([^&]+)/);
      if (match) {
        torrentName =
          decodeURIComponent(match[1].replace(/\+/g, " ")) + ".torrent";
      }
    } else if (magnetLink.startsWith("http")) {
      torrentName = magnetLink.split("/").pop() || "yeni_indirme.torrent";
    }

    const mockTotalBytes = 1450000000; // ~1.35 GB

    const newTorrent: TorrentItem = {
      id: Date.now().toString(),
      name: torrentName,
      size: "1.35 GB",
      totalBytes: mockTotalBytes,
      downloadedBytes: 0,
      uploadedBytes: 0,
      progress: 0,
      status: "downloading",
      seedsConnected: 25,
      seedsTotal: 180,
      peersConnected: 35,
      peersTotal: 420,
      downSpeed: 6400, // 6.4 MB/s
      upSpeed: 180,
      eta: "3 dk",
      hash: Math.random().toString(16).substring(2, 42).toUpperCase(),
      files: [
        {
          name: torrentName.replace(".torrent", ".iso"),
          size: "1.35 GB",
          progress: 0,
        },
      ],
      trackers: [
        {
          url: "udp://tracker.opentrackr.org:1337/announce",
          status: "Çalışıyor",
          peers: 840,
          msg: "Başarılı",
        },
        {
          url: "udp://tracker.coppersurfer.tk:6969/announce",
          status: "Çalışıyor",
          peers: 420,
          msg: "Başarılı",
        },
      ],
      peers: [
        {
          ip: "78.160.85.22",
          client: "qBittorrent/4.6.3",
          progress: 98.4,
          downSpeed: 3400,
          upSpeed: 12,
          country: "TR",
        },
        {
          ip: "82.222.10.155",
          client: "uTorrent/3.5.5",
          progress: 12.3,
          downSpeed: 1800,
          upSpeed: 40,
          country: "DE",
        },
      ],
    };

    setTorrents((prev) => [newTorrent, ...prev]);
    setSelectedTorrentId(newTorrent.id);
    setMagnetLink("");
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setTorrents((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (t.status === "downloading") {
            return {
              ...t,
              status: "paused",
              downSpeed: 0,
              upSpeed: 0,
              eta: "Duraklatıldı",
            };
          } else if (t.status === "paused") {
            return {
              ...t,
              status: t.progress === 100 ? "seeding" : "downloading",
              downSpeed: 5000,
              upSpeed: 100,
            };
          } else if (t.status === "seeding") {
            return {
              ...t,
              status: "paused",
              downSpeed: 0,
              upSpeed: 0,
              eta: "Duraklatıldı",
            };
          }
        }
        return t;
      }),
    );
  };

  const handleDeleteTorrent = (id: string) => {
    if (
      confirm(
        "Seçili torrent dosyasını ve indirilen verileri diskten kaldırmak istediğinize emin misiniz?",
      )
    ) {
      setTorrents((prev) => prev.filter((t) => t.id !== id));
      if (selectedTorrentId === id) {
        setSelectedTorrentId("");
      }
    }
  };

  const getFilteredTorrents = () => {
    switch (activeFilter) {
      case "downloading":
        return torrents.filter((t) => t.status === "downloading");
      case "seeding":
        return torrents.filter((t) => t.status === "seeding");
      case "paused":
        return torrents.filter((t) => t.status === "paused");
      default:
        return torrents;
    }
  };

  const selectedTorrent =
    torrents.find((t) => t.id === selectedTorrentId) || torrents[0];

  const formatSpeed = (kbps: number) => {
    if (kbps === 0) return "0 KB/s";
    if (kbps > 1024) return `${(kbps / 1024).toFixed(1)} MB/s`;
    return `${kbps} KB/s`;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // SVG Chart path calculation
  const renderChartPath = (history: number[]) => {
    const maxVal = Math.max(...downSpeedHistory, ...upSpeedHistory, 3000); // scale up
    const width = 600;
    const height = 100;

    const points = history
      .map((val, idx) => {
        const x = (idx / 19) * width;
        const y = height - (val / maxVal) * (height - 10);
        return `${x},${y}`;
      })
      .join(" ");

    return points;
  };

  return (
    <div className="torrent-container">
      {/* Top menu bar */}
      <div className="torrent-toolbar">
        <button
          className="torrent-tool-btn"
          onClick={() => setIsModalOpen(true)}
          title="Magnet Link Ekle"
        >
          <Plus size={18} style={{ color: "#0078d4" }} />
        </button>
        <button
          className="torrent-tool-btn"
          onClick={() =>
            selectedTorrent && handleToggleStatus(selectedTorrent.id)
          }
          title="Başlat / Duraklat"
        >
          {selectedTorrent?.status === "paused" ? (
            <Play size={16} style={{ color: "#107c41" }} />
          ) : (
            <Pause size={16} style={{ color: "#d83b01" }} />
          )}
        </button>
        <button
          className="torrent-tool-btn"
          onClick={() =>
            selectedTorrent && handleDeleteTorrent(selectedTorrent.id)
          }
          title="Torrenti Kaldır"
        >
          <Trash2 size={16} style={{ color: "#ff3b30" }} />
        </button>
        <div className="torrent-tool-separator" />
        <button className="torrent-tool-btn" title="Ayarlar">
          <Settings size={16} />
        </button>
      </div>

      {/* Main split dashboard */}
      <div className="torrent-main">
        {/* Left Tree sidebar */}
        <div className="torrent-sidebar">
          <div>
            <div className="torrent-sidebar-section-title">Durumlar</div>
            <div className="torrent-sidebar-list">
              <div
                className={`torrent-sidebar-item ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                <span>Tümü</span>
                <span className="torrent-sidebar-badge">{torrents.length}</span>
              </div>
              <div
                className={`torrent-sidebar-item ${activeFilter === "downloading" ? "active" : ""}`}
                onClick={() => setActiveFilter("downloading")}
              >
                <span>İndirilenler</span>
                <span className="torrent-sidebar-badge">
                  {torrents.filter((t) => t.status === "downloading").length}
                </span>
              </div>
              <div
                className={`torrent-sidebar-item ${activeFilter === "seeding" ? "active" : ""}`}
                onClick={() => setActiveFilter("seeding")}
              >
                <span>Gönderilenler</span>
                <span className="torrent-sidebar-badge">
                  {torrents.filter((t) => t.status === "seeding").length}
                </span>
              </div>
              <div
                className={`torrent-sidebar-item ${activeFilter === "paused" ? "active" : ""}`}
                onClick={() => setActiveFilter("paused")}
              >
                <span>Duraklatılanlar</span>
                <span className="torrent-sidebar-badge">
                  {torrents.filter((t) => t.status === "paused").length}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="torrent-sidebar-section-title">İzleyiciler</div>
            <div className="torrent-sidebar-list">
              <div className="torrent-sidebar-item">
                <span>Aktif İzleyiciler</span>
                <span className="torrent-sidebar-badge">2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right content grids */}
        <div className="torrent-content">
          {/* Torrent grid table list */}
          <div className="torrent-grid-container">
            <table className="torrent-table">
              <thead>
                <tr>
                  <th>Adı</th>
                  <th>Boyut</th>
                  <th>Tamamlandı %</th>
                  <th>Durum</th>
                  <th>Eşler (Seeds/Peers)</th>
                  <th>İndirme Hızı</th>
                  <th>Gönderme Hızı</th>
                  <th>Kalan Süre</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredTorrents().map((t) => (
                  <tr
                    key={t.id}
                    className={selectedTorrentId === t.id ? "selected" : ""}
                    onClick={() => setSelectedTorrentId(t.id)}
                    onDoubleClick={() => handleToggleStatus(t.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td style={{ fontWeight: "500" }}>{t.name}</td>
                    <td>{t.size}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          className="fdm-progress-bar-wrapper"
                          style={{ width: "60px", height: "10px" }}
                        >
                          <div
                            className={`fdm-progress-bar-fill ${t.status === "seeding" ? "seeding" : ""}`}
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                        <span>{t.progress}%</span>
                      </div>
                    </td>
                    <td>
                      {t.status === "downloading" ? (
                        <span className="torrent-status-text downloading">
                          İndiriliyor
                        </span>
                      ) : t.status === "seeding" ? (
                        <span className="torrent-status-text seeding">
                          Gönderiliyor
                        </span>
                      ) : t.status === "paused" ? (
                        <span className="torrent-status-text paused">
                          Duraklatıldı
                        </span>
                      ) : (
                        <span className="torrent-status-text stalled">
                          Bekliyor
                        </span>
                      )}
                    </td>
                    <td>{`${t.seedsConnected} (${t.seedsTotal}) / ${t.peersConnected} (${t.peersTotal})`}</td>
                    <td
                      style={{
                        color:
                          t.status === "downloading" ? "#00d2fc" : "inherit",
                      }}
                    >
                      {formatSpeed(t.downSpeed)}
                    </td>
                    <td
                      style={{
                        color:
                          t.status === "seeding" || t.upSpeed > 0
                            ? "#4cd964"
                            : "inherit",
                      }}
                    >
                      {formatSpeed(t.upSpeed)}
                    </td>
                    <td>{t.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Details tabbed panel at bottom */}
          {selectedTorrent && (
            <div className="torrent-details">
              <div className="torrent-details-tabs">
                <button
                  className={`torrent-details-tab ${activeDetailTab === "general" ? "active" : ""}`}
                  onClick={() => setActiveDetailTab("general")}
                >
                  <FileText size={12} style={{ marginRight: "4px" }} /> Genel
                </button>
                <button
                  className={`torrent-details-tab ${activeDetailTab === "trackers" ? "active" : ""}`}
                  onClick={() => setActiveDetailTab("trackers")}
                >
                  <Database size={12} style={{ marginRight: "4px" }} />{" "}
                  İzleyiciler
                </button>
                <button
                  className={`torrent-details-tab ${activeDetailTab === "peers" ? "active" : ""}`}
                  onClick={() => setActiveDetailTab("peers")}
                >
                  <Globe size={12} style={{ marginRight: "4px" }} /> Eşler
                  (Peers)
                </button>
                <button
                  className={`torrent-details-tab ${activeDetailTab === "speed" ? "active" : ""}`}
                  onClick={() => setActiveDetailTab("speed")}
                >
                  <Activity size={12} style={{ marginRight: "4px" }} /> Hız
                  Grafiği
                </button>
                <button
                  className={`torrent-details-tab ${activeDetailTab === "files" ? "active" : ""}`}
                  onClick={() => setActiveDetailTab("files")}
                >
                  <FolderOpen size={12} style={{ marginRight: "4px" }} />{" "}
                  Dosyalar
                </button>
              </div>

              <div className="torrent-details-content">
                {activeDetailTab === "general" && (
                  <table className="torrent-detail-table">
                    <tbody>
                      <tr>
                        <td className="torrent-prop-label">İndirme Klasörü:</td>
                        <td>C:\Users\JohnDoe\Downloads</td>
                        <td className="torrent-prop-label">Hash Kod:</td>
                        <td style={{ fontFamily: "monospace" }}>
                          {selectedTorrent.hash}
                        </td>
                      </tr>
                      <tr>
                        <td className="torrent-prop-label">
                          Tamamlanan Boyut:
                        </td>
                        <td>
                          {formatSize(selectedTorrent.downloadedBytes)} /{" "}
                          {selectedTorrent.size}
                        </td>
                        <td className="torrent-prop-label">
                          Gönderilen Boyut:
                        </td>
                        <td>{formatSize(selectedTorrent.uploadedBytes)}</td>
                      </tr>
                      <tr>
                        <td className="torrent-prop-label">
                          Seeds Bağlantısı:
                        </td>
                        <td>
                          {selectedTorrent.seedsConnected} bağlı (
                          {selectedTorrent.seedsTotal} toplam)
                        </td>
                        <td className="torrent-prop-label">
                          Peers Bağlantısı:
                        </td>
                        <td>
                          {selectedTorrent.peersConnected} bağlı (
                          {selectedTorrent.peersTotal} toplam)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeDetailTab === "trackers" && (
                  <table className="torrent-detail-list-table">
                    <thead>
                      <tr>
                        <th>İzleyici URL</th>
                        <th>Durum</th>
                        <th>Aktif Eş Sayısı</th>
                        <th>Mesaj</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTorrent.trackers.map((tr, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: "monospace" }}>{tr.url}</td>
                          <td
                            style={{
                              color:
                                tr.status === "Çalışıyor"
                                  ? "#4cd964"
                                  : "#ff3b30",
                            }}
                          >
                            {tr.status}
                          </td>
                          <td>{tr.peers}</td>
                          <td>{tr.msg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeDetailTab === "peers" && (
                  <table className="torrent-detail-list-table">
                    <thead>
                      <tr>
                        <th>IP Adresi</th>
                        <th>İstemci Programı</th>
                        <th>Eş İlerleme %</th>
                        <th>İndirme (Down)</th>
                        <th>Gönderme (Up)</th>
                        <th>Bayrak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTorrent.peers.map((peer, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: "monospace" }}>{peer.ip}</td>
                          <td>{peer.client}</td>
                          <td>{peer.progress.toFixed(1)}%</td>
                          <td
                            style={{
                              color: peer.downSpeed > 0 ? "#00d2fc" : "inherit",
                            }}
                          >
                            {formatSpeed(peer.downSpeed)}
                          </td>
                          <td
                            style={{
                              color: peer.upSpeed > 0 ? "#4cd964" : "inherit",
                            }}
                          >
                            {formatSpeed(peer.upSpeed)}
                          </td>
                          <td style={{ fontWeight: "bold" }}>{peer.country}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeDetailTab === "speed" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        fontSize: "11px",
                        color: "#aaa",
                        marginBottom: "3px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "4px",
                            backgroundColor: "#00d2fc",
                          }}
                        />
                        <span>
                          İndirme Hızı (Down):{" "}
                          {formatSpeed(selectedTorrent.downSpeed)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "4px",
                            backgroundColor: "#4cd964",
                          }}
                        />
                        <span>
                          Gönderme Hızı (Up):{" "}
                          {formatSpeed(selectedTorrent.upSpeed)}
                        </span>
                      </div>
                    </div>
                    <div className="torrent-speed-chart">
                      <svg width="100%" height="100%">
                        <polyline
                          fill="none"
                          stroke="#00d2fc"
                          strokeWidth="2.5"
                          points={renderChartPath(downSpeedHistory)}
                        />
                        <polyline
                          fill="none"
                          stroke="#4cd964"
                          strokeWidth="2.5"
                          points={renderChartPath(upSpeedHistory)}
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {activeDetailTab === "files" && (
                  <table className="torrent-detail-list-table">
                    <thead>
                      <tr>
                        <th>Dosya İsmi</th>
                        <th>Boyut</th>
                        <th>İlerleme Oranı</th>
                        <th>Öncelik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTorrent.files.map((file, i) => (
                        <tr key={i}>
                          <td>{file.name}</td>
                          <td>{file.size}</td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div
                                className="fdm-progress-bar-wrapper"
                                style={{ width: "60px", height: "8px" }}
                              >
                                <div
                                  className="fdm-progress-bar-fill"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                              <span>{file.progress}%</span>
                            </div>
                          </td>
                          <td style={{ color: "#4cd964", fontWeight: "500" }}>
                            Yüksek (High)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Torrent URL popup modal */}
      {isModalOpen && (
        <div className="fdm-modal-overlay">
          <form
            className="fdm-modal glass"
            style={{ width: "480px" }}
            onSubmit={handleAddTorrent}
          >
            <h3 className="fdm-modal-title">
              Magnet Link veya Torrent URL Ekle
            </h3>
            <div
              style={{
                fontSize: "12px",
                color: "#a6a9b6",
                marginBottom: "8px",
              }}
            >
              Magnet baglantisini (magnet:?xt=urn:btih:...) buraya yapistirin:
            </div>
            <textarea
              className="fdm-input"
              placeholder="magnet:?xt=urn:btih:..."
              value={magnetLink}
              onChange={(e) => setMagnetLink(e.target.value)}
              style={{
                minHeight: "80px",
                fontFamily: "monospace",
                resize: "vertical",
              }}
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
                Yükle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default TorrentClientApp;
