import React, { useState, useEffect } from "react";
import { useWindow } from "../../context/WindowContext";
import {
  Cpu,
  HardDrive,
  ListCollapse,
  Activity,
  History,
  Network,
  Monitor,
} from "lucide-react";
import "./taskmgr.css";

export const TaskManagerApp: React.FC = () => {
  const { windows, closeWindow } = useWindow();
  const [activeTab, setActiveTab] = useState<
    "processes" | "performance" | "history"
  >("processes");

  // Performance telemetry states
  const [selectedPerfResource, setSelectedPerfResource] = useState<
    "cpu" | "memory" | "disk" | "network" | "gpu"
  >("cpu");
  const [cpuGraphMode, setCpuGraphMode] = useState<"overall" | "logical">(
    "logical",
  );
  const [logicalCoreLoads, setLogicalCoreLoads] = useState<number[]>(() =>
    Array.from({ length: 384 }, () => Math.floor(Math.random() * 8) + 1),
  );
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(30).fill(6));
  const [ramHistory, setRamHistory] = useState<number[]>(Array(30).fill(18));
  const [diskHistory, setDiskHistory] = useState<number[]>(Array(30).fill(1));
  const [netHistory, setNetHistory] = useState<number[]>(Array(30).fill(250)); // in Kbps
  const [gpuHistory, setGpuHistory] = useState<number[]>(Array(30).fill(4));

  const [currentCpu, setCurrentCpu] = useState(6);
  const [currentRam, setCurrentRam] = useState(18);
  const [currentDisk, setCurrentDisk] = useState(1);
  const [currentNet, setCurrentNet] = useState(250);
  const [currentGpu, setCurrentGpu] = useState(4);

  // System up time tracker
  const [upTimeStr, setUpTimeStr] = useState("00:00:00");
  const [processStats, setProcessStats] = useState<{
    [winId: string]: { cpu: string; ram: number };
  }>({});

  useEffect(() => {
    const updateStats = () => {
      setProcessStats((prev) => {
        const next: { [winId: string]: { cpu: string; ram: number } } = {};
        windows.forEach((win) => {
          const old = prev[win.id];
          const cpuVal = old
            ? Math.max(0.1, parseFloat(old.cpu) + (Math.random() * 0.4 - 0.2))
            : Math.random() * 0.8 + 0.1;
          const ramVal = old
            ? Math.max(30, old.ram + Math.floor(Math.random() * 6 - 3))
            : Math.floor(Math.random() * 40 + 50);
          next[win.id] = {
            cpu: cpuVal.toFixed(1),
            ram: ramVal,
          };
        });
        return next;
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [windows]);

  useEffect(() => {
    // Up Time Calculator
    const startTime = Date.now() - 324000; // Mock started 5.4 mins ago
    const timeInterval = setInterval(() => {
      const diffMs = Date.now() - startTime;
      const secs = Math.floor(diffMs / 1000) % 60;
      const mins = Math.floor(diffMs / 60000) % 60;
      const hours = Math.floor(diffMs / 3600000) % 24;

      const pad = (num: number) => String(num).padStart(2, "0");
      setUpTimeStr(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
    }, 1000);

    // Performance graph updater
    const statsInterval = setInterval(() => {
      const newCpu = Math.floor(Math.random() * 8) + 4; // 4% to 12% EPYC 9965
      const newRam = Math.floor(Math.random() * 2) + 18; // 18% to 20% memory utilization
      const newDisk =
        Math.random() < 0.25
          ? Math.floor(Math.random() * 35) + 5
          : Math.floor(Math.random() * 3);
      const newNet = Math.floor(Math.random() * 1200) + 100; // in Kbps
      const newGpu = Math.floor(Math.random() * 6) + 3;

      setCurrentCpu(newCpu);
      setCurrentRam(newRam);
      setCurrentDisk(newDisk);
      setCurrentNet(newNet);
      setCurrentGpu(newGpu);

      setCpuHistory((prev) => [...prev.slice(1), newCpu]);
      setRamHistory((prev) => [...prev.slice(1), newRam]);
      setDiskHistory((prev) => [...prev.slice(1), newDisk]);
      setNetHistory((prev) => [...prev.slice(1), newNet]);
      setGpuHistory((prev) => [...prev.slice(1), newGpu]);

      setLogicalCoreLoads(() =>
        Array.from({ length: 384 }, () => {
          const isSpiking = Math.random() < 0.05;
          return isSpiking
            ? Math.floor(Math.random() * 80) + 15
            : Math.floor(Math.random() * 8) + 1;
        }),
      );
    }, 1200);

    return () => {
      clearInterval(timeInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const handleEndTask = (id: string) => {
    closeWindow(id);
  };

  // Convert history array to SVG polyline coordinates
  const getSvgPoints = (
    history: number[],
    width = 280,
    height = 120,
    minVal = 0,
    maxVal = 100,
  ) => {
    const step = width / (history.length - 1);

    return history
      .map((val, idx) => {
        const x = idx * step;
        const percentage = (val - minVal) / (maxVal - minVal);
        const y = height - percentage * height;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="taskmgr-container">
      {/* Sidebar Navigation */}
      <div className="taskmgr-sidebar">
        <div
          className={`taskmgr-sidebar-item ${activeTab === "processes" ? "active" : ""}`}
          onClick={() => setActiveTab("processes")}
          title="İşlemler"
        >
          <ListCollapse size={18} />
          <span>İşlemler</span>
        </div>
        <div
          className={`taskmgr-sidebar-item ${activeTab === "performance" ? "active" : ""}`}
          onClick={() => setActiveTab("performance")}
          title="Performans"
        >
          <Activity size={18} />
          <span>Performans</span>
        </div>
        <div
          className={`taskmgr-sidebar-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
          title="Uygulama Geçmişi"
        >
          <History size={18} />
          <span>Uygulama Geçmişi</span>
        </div>
      </div>

      {/* Main Details Area */}
      <div className="taskmgr-main">
        {/* TAB: PROCESSES */}
        {activeTab === "processes" && (
          <div className="taskmgr-tab-view">
            <div className="taskmgr-header">
              <h2>Uygulama İşlemleri</h2>
              <span className="taskmgr-desc">
                Çalışan pencereleri ve kaynak kullanımlarını kontrol edin.
              </span>
            </div>

            <div className="processes-table-wrapper">
              <table className="processes-table">
                <thead>
                  <tr>
                    <th>Ad</th>
                    <th>PID</th>
                    <th>Durum</th>
                    <th>CPU</th>
                    <th>Bellek</th>
                    <th>Eylem</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Task Manager row (itself) */}
                  <tr className="system-row">
                    <td>
                      <span className="proc-icon">📊</span>
                      <strong>Görev Yöneticisi</strong>
                    </td>
                    <td>1084</td>
                    <td>
                      <span className="status-badge running">Çalışıyor</span>
                    </td>
                    <td>1.4%</td>
                    <td>42.5 MB</td>
                    <td>
                      <button disabled className="btn-endtask disabled">
                        Sistem
                      </button>
                    </td>
                  </tr>

                  {/* Windows mapping */}
                  {windows.map((win, idx) => (
                    <tr key={win.id}>
                      <td>
                        <span className="proc-icon">
                          {win.appId === "explorer" && "📁"}
                          {win.appId === "edge" && "🌐"}
                          {win.appId === "notepad" && "📝"}
                          {win.appId === "calculator" && "🧮"}
                          {win.appId === "cmd" && "💻"}
                          {win.appId === "settings" && "⚙️"}
                          {win.appId === "paint" && "🎨"}
                          {win.appId === "vscode" && "💻"}
                          {win.appId === "minesweeper" && "💣"}
                          {win.appId === "camera" && "📷"}
                          {win.appId === "imageviewer" && "🖼️"}
                          {win.appId === "store" && "👜"}
                          {win.appId === "copilot" && "🌀"}
                          {win.appId === "weather" && "🌦️"}
                          {win.appId === "bios" && "🛠️"}
                          {win.appId === "fdm" && "📥"}
                          {win.appId === "torrent" && "⚡"}
                          {![
                            "explorer",
                            "edge",
                            "notepad",
                            "calculator",
                            "cmd",
                            "settings",
                            "paint",
                            "vscode",
                            "minesweeper",
                            "camera",
                            "imageviewer",
                            "store",
                            "copilot",
                            "weather",
                            "bios",
                            "fdm",
                            "torrent",
                          ].includes(win.appId) && "📱"}
                        </span>
                        <span>{win.title}</span>
                      </td>
                      <td>{2000 + idx * 12}</td>
                      <td>
                        <span className="status-badge running">Çalışıyor</span>
                      </td>
                      <td>{processStats[win.id]?.cpu || "0.5"}%</td>
                      <td>{processStats[win.id]?.ram || 45} MB</td>
                      <td>
                        <button
                          className="btn-endtask active"
                          onClick={() => handleEndTask(win.id)}
                        >
                          Sonlandır
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PERFORMANCE */}
        {activeTab === "performance" && (
          <div className="taskmgr-tab-view performance">
            <div className="perf-split-layout">
              {/* Left sidebar: resource list */}
              <div className="perf-sidebar">
                {/* CPU card */}
                <div
                  className={`perf-sidebar-item ${selectedPerfResource === "cpu" ? "active" : ""}`}
                  onClick={() => setSelectedPerfResource("cpu")}
                >
                  <div className="perf-sidebar-item-meta">
                    <span className="perf-sidebar-item-title-box">
                      <Cpu size={12} className="perf-sidebar-icon" />
                      <span className="perf-sidebar-item-title">CPU</span>
                    </span>
                    <span className="perf-sidebar-item-percent">
                      {currentCpu}%
                    </span>
                  </div>
                  <div className="perf-sidebar-item-desc">
                    {(2.25 + currentCpu * 0.015).toFixed(2)} GHz
                  </div>
                  <div className="perf-sidebar-item-sparkline">
                    <svg
                      viewBox="0 0 120 30"
                      preserveAspectRatio="none"
                      className="sparkline-svg cpu"
                    >
                      <polyline
                        fill="rgba(96, 205, 255, 0.05)"
                        stroke="#60cdff"
                        strokeWidth="1.5"
                        points={`0,30 ${getSvgPoints(cpuHistory, 120, 30, 0, 100)} 120,30`}
                      />
                    </svg>
                  </div>
                </div>

                {/* Memory card */}
                <div
                  className={`perf-sidebar-item ${selectedPerfResource === "memory" ? "active" : ""}`}
                  onClick={() => setSelectedPerfResource("memory")}
                >
                  <div className="perf-sidebar-item-meta">
                    <span className="perf-sidebar-item-title-box">
                      <HardDrive size={12} className="perf-sidebar-icon" />
                      <span className="perf-sidebar-item-title">Bellek</span>
                    </span>
                    <span className="perf-sidebar-item-percent">
                      {currentRam}%
                    </span>
                  </div>
                  <div className="perf-sidebar-item-desc">
                    {((256 * currentRam) / 100).toFixed(1)}/256 GB
                  </div>
                  <div className="perf-sidebar-item-sparkline">
                    <svg
                      viewBox="0 0 120 30"
                      preserveAspectRatio="none"
                      className="sparkline-svg memory"
                    >
                      <polyline
                        fill="rgba(224, 64, 251, 0.05)"
                        stroke="#e040fb"
                        strokeWidth="1.5"
                        points={`0,30 ${getSvgPoints(ramHistory, 120, 30, 0, 100)} 120,30`}
                      />
                    </svg>
                  </div>
                </div>

                {/* Disk card */}
                <div
                  className={`perf-sidebar-item ${selectedPerfResource === "disk" ? "active" : ""}`}
                  onClick={() => setSelectedPerfResource("disk")}
                >
                  <div className="perf-sidebar-item-meta">
                    <span className="perf-sidebar-item-title-box">
                      <HardDrive size={12} className="perf-sidebar-icon" />
                      <span className="perf-sidebar-item-title">
                        Disk 0 (C:)
                      </span>
                    </span>
                    <span className="perf-sidebar-item-percent">
                      {currentDisk}%
                    </span>
                  </div>
                  <div className="perf-sidebar-item-desc">SSD</div>
                  <div className="perf-sidebar-item-sparkline">
                    <svg
                      viewBox="0 0 120 30"
                      preserveAspectRatio="none"
                      className="sparkline-svg disk"
                    >
                      <polyline
                        fill="rgba(76, 217, 100, 0.05)"
                        stroke="#4cd964"
                        strokeWidth="1.5"
                        points={`0,30 ${getSvgPoints(diskHistory, 120, 30, 0, 100)} 120,30`}
                      />
                    </svg>
                  </div>
                </div>

                {/* Network card */}
                <div
                  className={`perf-sidebar-item ${selectedPerfResource === "network" ? "active" : ""}`}
                  onClick={() => setSelectedPerfResource("network")}
                >
                  <div className="perf-sidebar-item-meta">
                    <span className="perf-sidebar-item-title-box">
                      <Network size={12} className="perf-sidebar-icon" />
                      <span className="perf-sidebar-item-title">Ethernet</span>
                    </span>
                    <span className="perf-sidebar-item-percent">
                      {currentNet > 1024
                        ? `${(currentNet / 1024).toFixed(0)} Mbps`
                        : `${currentNet} Kbps`}
                    </span>
                  </div>
                  <div className="perf-sidebar-item-desc">SFP+</div>
                  <div className="perf-sidebar-item-sparkline">
                    <svg
                      viewBox="0 0 120 30"
                      preserveAspectRatio="none"
                      className="sparkline-svg network"
                    >
                      <polyline
                        fill="rgba(255, 140, 0, 0.05)"
                        stroke="#ff8c00"
                        strokeWidth="1.5"
                        points={`0,30 ${getSvgPoints(netHistory, 120, 30, 0, 1500)} 120,30`}
                      />
                    </svg>
                  </div>
                </div>

                {/* GPU card */}
                <div
                  className={`perf-sidebar-item ${selectedPerfResource === "gpu" ? "active" : ""}`}
                  onClick={() => setSelectedPerfResource("gpu")}
                >
                  <div className="perf-sidebar-item-meta">
                    <span className="perf-sidebar-item-title-box">
                      <Monitor size={12} className="perf-sidebar-icon" />
                      <span className="perf-sidebar-item-title">GPU 0</span>
                    </span>
                    <span className="perf-sidebar-item-percent">
                      {currentGpu}%
                    </span>
                  </div>
                  <div className="perf-sidebar-item-desc">NVIDIA RTX 6000</div>
                  <div className="perf-sidebar-item-sparkline">
                    <svg
                      viewBox="0 0 120 30"
                      preserveAspectRatio="none"
                      className="sparkline-svg gpu"
                    >
                      <polyline
                        fill="rgba(0, 229, 255, 0.05)"
                        stroke="#00e5ff"
                        strokeWidth="1.5"
                        points={`0,30 ${getSvgPoints(gpuHistory, 120, 30, 0, 100)} 120,30`}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right panel: Details and specifications */}
              <div className="perf-details-panel">
                {/* 1. CPU PANEL */}
                {selectedPerfResource === "cpu" && (
                  <div className="perf-resource-panel animate-fade-in">
                    <div className="perf-resource-header">
                      <div>
                        <div className="perf-resource-name">CPU</div>
                        <div className="perf-resource-model">
                          AMD EPYC 9965 192-Core Processor
                        </div>
                      </div>
                      <button
                        className="perf-graph-toggle-btn"
                        onClick={() =>
                          setCpuGraphMode((m) =>
                            m === "overall" ? "logical" : "overall",
                          )
                        }
                      >
                        {cpuGraphMode === "overall"
                          ? "Mantıksal İşlemcileri Göster"
                          : "Genel Kullanımı Göster"}
                      </button>
                    </div>
                    <div className="perf-graph-container cpu">
                      {cpuGraphMode === "logical" ? (
                        <div className="cores-grid">
                          {logicalCoreLoads.map((coreLoad, idx) => (
                            <div
                              key={idx}
                              className="core-cell"
                              style={{
                                backgroundColor: `rgba(96, 205, 255, ${0.05 + (coreLoad / 100) * 0.95})`,
                              }}
                              title={`Çekirdek ${idx + 1}: %${coreLoad}`}
                            />
                          ))}
                        </div>
                      ) : (
                        <svg viewBox="0 0 450 180" className="perf-large-svg">
                          <line
                            x1="0"
                            y1="45"
                            x2="450"
                            y2="45"
                            className="grid-line"
                            strokeDasharray="2,2"
                          />
                          <line
                            x1="0"
                            y1="90"
                            x2="450"
                            y2="90"
                            className="grid-line"
                            strokeDasharray="2,2"
                          />
                          <line
                            x1="0"
                            y1="135"
                            x2="450"
                            y2="135"
                            className="grid-line"
                            strokeDasharray="2,2"
                          />
                          <line
                            x1="90"
                            y1="0"
                            x2="90"
                            y2="180"
                            className="grid-line"
                            strokeDasharray="2,2"
                          />
                          <line
                            x1="180"
                            y1="0"
                            x2="180"
                            y2="180"
                            className="grid-line"
                            strokeDasharray="2,2"
                          />
                          <line
                            x1="270"
                            y1="0"
                            x2="270"
                            y2="180"
                            className="grid-line"
                            strokeDasharray="2,2"
                          />
                          <line
                            x1="360"
                            y1="0"
                            x2="360"
                            y2="180"
                            className="grid-line"
                            strokeDasharray="2,2"
                          />
                          <polyline
                            fill="rgba(96, 205, 255, 0.08)"
                            stroke="#60cdff"
                            strokeWidth="2"
                            points={`0,180 ${getSvgPoints(cpuHistory, 450, 180, 0, 100)} 450,180`}
                          />
                        </svg>
                      )}
                      <div className="perf-graph-label">
                        {cpuGraphMode === "logical"
                          ? "384 mantıksal çekirdek"
                          : "60 saniye"}
                      </div>
                      <div className="perf-graph-overlay-percent">
                        % Kullanım: {currentCpu}%
                      </div>
                    </div>

                    <div className="perf-specs-grid">
                      <div className="perf-stats-dashboard">
                        <div className="stats-row-top">
                          <div className="stat-box-large">
                            <span className="stat-box-label">Kullanım</span>
                            <span className="stat-box-value">
                              %{currentCpu}
                            </span>
                          </div>
                          <div className="stat-box-large">
                            <span className="stat-box-label">Hız</span>
                            <span className="stat-box-value">
                              {(2.25 + currentCpu * 0.015).toFixed(2)} GHz
                            </span>
                          </div>
                        </div>

                        <div className="stats-row-middle">
                          <div className="stat-box-medium">
                            <span className="stat-box-label">İşlemler</span>
                            <span className="stat-box-value">308</span>
                          </div>
                          <div className="stat-box-medium">
                            <span className="stat-box-label">
                              İş parçacıkları
                            </span>
                            <span className="stat-box-value">4519</span>
                          </div>
                          <div className="stat-box-medium">
                            <span className="stat-box-label">Tanıtıcılar</span>
                            <span className="stat-box-value">147336</span>
                          </div>
                        </div>

                        <div className="stats-row-bottom">
                          <div className="stat-box-large">
                            <span className="stat-box-label">
                              Çalışma süresi
                            </span>
                            <span className="stat-box-value">{upTimeStr}</span>
                          </div>
                        </div>
                      </div>

                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">Temel hız:</span>
                          <span className="spec-value">2,25 GHz</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Soketler:</span>
                          <span className="spec-value">1</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Çekirdekler:</span>
                          <span className="spec-value">192</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">
                            Mantıksal işlemciler:
                          </span>
                          <span className="spec-value">384</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Sanallaştırma:</span>
                          <span className="spec-value">Etkin</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">L1 önbellek:</span>
                          <span className="spec-value">12.0 MB</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">L2 önbellek:</span>
                          <span className="spec-value">192 MB</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">L3 önbellek:</span>
                          <span className="spec-value">768 MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MEMORY PANEL */}
                {selectedPerfResource === "memory" && (
                  <div className="perf-resource-panel animate-fade-in">
                    <div className="perf-resource-header">
                      <div className="perf-resource-name">Bellek</div>
                      <div className="perf-resource-model">
                        256 GB DDR5 ECC RDIMM Server Memory
                      </div>
                    </div>
                    <div className="perf-graph-container memory">
                      <svg viewBox="0 0 450 180" className="perf-large-svg">
                        <line
                          x1="0"
                          y1="45"
                          x2="450"
                          y2="45"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="0"
                          y1="90"
                          x2="450"
                          y2="90"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="0"
                          y1="135"
                          x2="450"
                          y2="135"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="90"
                          y1="0"
                          x2="90"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="180"
                          y1="0"
                          x2="180"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="270"
                          y1="0"
                          x2="270"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="360"
                          y1="0"
                          x2="360"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <polyline
                          fill="rgba(224, 64, 251, 0.08)"
                          stroke="#e040fb"
                          strokeWidth="2"
                          points={`0,180 ${getSvgPoints(ramHistory, 450, 180, 0, 100)} 450,180`}
                        />
                      </svg>
                      <div className="perf-graph-label">60 saniye</div>
                      <div className="perf-graph-overlay-percent">
                        Bellek Kullanımı:{" "}
                        {((256 * currentRam) / 100).toFixed(1)} GB (%
                        {currentRam})
                      </div>
                    </div>

                    <div className="perf-specs-grid">
                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">Kullanımda</span>
                          <span className="spec-value">
                            {((256 * currentRam) / 100).toFixed(1)} GB
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Kullanılabilir</span>
                          <span className="spec-value">
                            {(256 - (256 * currentRam) / 100).toFixed(1)} GB
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Taahhüt edilen</span>
                          <span className="spec-value">
                            {((256 * currentRam) / 100 + 4.2).toFixed(1)} / 312
                            GB
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Önbelleğe alınan</span>
                          <span className="spec-value">12.4 GB</span>
                        </div>
                      </div>

                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">Hız</span>
                          <span className="spec-value">4800 MHz</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Kullanılan yuvalar</span>
                          <span className="spec-value">
                            8 / 16 (DDR5 RDIMM)
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Form faktörü</span>
                          <span className="spec-value">RDIMM</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Donanıma ayrılmış</span>
                          <span className="spec-value">1.2 GB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DISK PANEL */}
                {selectedPerfResource === "disk" && (
                  <div className="perf-resource-panel animate-fade-in">
                    <div className="perf-resource-header">
                      <div className="perf-resource-name">Disk 0 (C:)</div>
                      <div className="perf-resource-model">
                        Samsung MZ-V8P2T0 NVMe M.2 2.0 TB
                      </div>
                    </div>
                    <div className="perf-graph-container disk">
                      <svg viewBox="0 0 450 180" className="perf-large-svg">
                        <line
                          x1="0"
                          y1="45"
                          x2="450"
                          y2="45"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="0"
                          y1="90"
                          x2="450"
                          y2="90"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="0"
                          y1="135"
                          x2="450"
                          y2="135"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="90"
                          y1="0"
                          x2="90"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="180"
                          y1="0"
                          x2="180"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="270"
                          y1="0"
                          x2="270"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="360"
                          y1="0"
                          x2="360"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <polyline
                          fill="rgba(76, 217, 100, 0.08)"
                          stroke="#4cd964"
                          strokeWidth="2"
                          points={`0,180 ${getSvgPoints(diskHistory, 450, 180, 0, 100)} 450,180`}
                        />
                      </svg>
                      <div className="perf-graph-label">60 saniye</div>
                      <div className="perf-graph-overlay-percent">
                        Aktif Süre: %{currentDisk}
                      </div>
                    </div>

                    <div className="perf-specs-grid">
                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">Aktif süre</span>
                          <span className="spec-value">%{currentDisk}</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">
                            Ortalama yanıt süresi
                          </span>
                          <span className="spec-value">
                            {currentDisk > 0
                              ? (0.8 + currentDisk * 0.15).toFixed(1)
                              : "0.1"}{" "}
                            ms
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Okuma hızı</span>
                          <span className="spec-value">
                            {currentDisk > 1
                              ? (currentDisk * 24.5).toFixed(1)
                              : "0.0"}{" "}
                            MB/sn
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Yazma hızı</span>
                          <span className="spec-value">
                            {currentDisk > 2
                              ? (currentDisk * 12.8).toFixed(1)
                              : "0.0"}{" "}
                            MB/sn
                          </span>
                        </div>
                      </div>

                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">Kapasite</span>
                          <span className="spec-value">1.86 TB</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Sistem diski</span>
                          <span className="spec-value">Evet (C:)</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Bölüm stili</span>
                          <span className="spec-value">
                            GPT (NVMe PCIe Gen 5)
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Sıcaklık</span>
                          <span className="spec-value">42°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. NETWORK PANEL */}
                {selectedPerfResource === "network" && (
                  <div className="perf-resource-panel animate-fade-in">
                    <div className="perf-resource-header">
                      <div className="perf-resource-name">Ethernet</div>
                      <div className="perf-resource-model">
                        Mellanox ConnectX-6 Dx 10G SFP+ Adapter
                      </div>
                    </div>
                    <div className="perf-graph-container network">
                      <svg viewBox="0 0 450 180" className="perf-large-svg">
                        <line
                          x1="0"
                          y1="45"
                          x2="450"
                          y2="45"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="0"
                          y1="90"
                          x2="450"
                          y2="90"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="0"
                          y1="135"
                          x2="450"
                          y2="135"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="90"
                          y1="0"
                          x2="90"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="180"
                          y1="0"
                          x2="180"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="270"
                          y1="0"
                          x2="270"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="360"
                          y1="0"
                          x2="360"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <polyline
                          fill="rgba(255, 140, 0, 0.08)"
                          stroke="#ff8c00"
                          strokeWidth="2"
                          points={`0,180 ${getSvgPoints(netHistory, 450, 180, 0, 1500)} 450,180`}
                        />
                      </svg>
                      <div className="perf-graph-label">60 saniye</div>
                      <div className="perf-graph-overlay-percent">
                        Aktarım Hızı:{" "}
                        {currentNet > 1024
                          ? `${(currentNet / 1024).toFixed(1)} Mbps`
                          : `${currentNet} Kbps`}
                      </div>
                    </div>

                    <div className="perf-specs-grid">
                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">Alım hızı</span>
                          <span className="spec-value">
                            {currentNet > 1024
                              ? `${(currentNet / 1024).toFixed(1)} Mbps`
                              : `${currentNet} Kbps`}
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Gönderim hızı</span>
                          <span className="spec-value">
                            {(currentNet * 0.08).toFixed(1)} Kbps
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Bağdaştırıcı hızı</span>
                          <span className="spec-value">
                            10 Gbps (SFP+ Fiber)
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Bağlantı tipi</span>
                          <span className="spec-value">
                            Ethernet (Full Duplex)
                          </span>
                        </div>
                      </div>

                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">IPv4 adresi</span>
                          <span className="spec-value">192.168.1.104</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">IPv6 adresi</span>
                          <span className="spec-value">
                            fe80::4c22:3eff:fe05:22b2%4
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Denetleyici</span>
                          <span className="spec-value">
                            Mellanox ConnectX-6 Dx 10G
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Durum</span>
                          <span className="spec-value">Bağlı</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GPU PANEL */}
                {selectedPerfResource === "gpu" && (
                  <div className="perf-resource-panel animate-fade-in">
                    <div className="perf-resource-header">
                      <div className="perf-resource-name">GPU 0</div>
                      <div className="perf-resource-model">
                        NVIDIA RTX 6000 Ada Generation
                      </div>
                    </div>
                    <div className="perf-graph-container gpu">
                      <svg viewBox="0 0 450 180" className="perf-large-svg">
                        <line
                          x1="0"
                          y1="45"
                          x2="450"
                          y2="45"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="0"
                          y1="90"
                          x2="450"
                          y2="90"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="0"
                          y1="135"
                          x2="450"
                          y2="135"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="90"
                          y1="0"
                          x2="90"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="180"
                          y1="0"
                          x2="180"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="270"
                          y1="0"
                          x2="270"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <line
                          x1="360"
                          y1="0"
                          x2="360"
                          y2="180"
                          className="grid-line"
                          strokeDasharray="2,2"
                        />
                        <polyline
                          fill="rgba(0, 229, 255, 0.08)"
                          stroke="#00e5ff"
                          strokeWidth="2"
                          points={`0,180 ${getSvgPoints(gpuHistory, 450, 180, 0, 100)} 450,180`}
                        />
                      </svg>
                      <div className="perf-graph-label">60 saniye</div>
                      <div className="perf-graph-overlay-percent">
                        GPU Kullanımı: %{currentGpu} | Sıcaklık: 58°C
                      </div>
                    </div>

                    <div className="perf-specs-grid">
                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">GPU Kullanımı</span>
                          <span className="spec-value">%{currentGpu}</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">
                            Ayrılmış GPU belleği
                          </span>
                          <span className="spec-value">
                            {((48 * currentGpu) / 100).toFixed(1)} / 48.0 GB
                            GDDR6
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">
                            Paylaşılan GPU belleği
                          </span>
                          <span className="spec-value">
                            {((128 * currentRam) / 100).toFixed(1)} / 128.0 GB
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Toplam GPU belleği</span>
                          <span className="spec-value">
                            {(
                              (48 * currentGpu) / 100 +
                              (128 * currentRam) / 100
                            ).toFixed(1)}{" "}
                            / 176.0 GB
                          </span>
                        </div>
                      </div>

                      <div className="perf-spec-column">
                        <div className="perf-spec-row">
                          <span className="spec-label">Sürücü sürümü</span>
                          <span className="spec-value">552.22</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Sürücü tarihi</span>
                          <span className="spec-value">16.04.2026</span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">DirectX sürümü</span>
                          <span className="spec-value">
                            12 (Feature Level 12_2)
                          </span>
                        </div>
                        <div className="perf-spec-row">
                          <span className="spec-label">Fiziksel Konum</span>
                          <span className="spec-value">
                            PCI Bus 1, Device 0, Function 0
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === "history" && (
          <div className="taskmgr-tab-view">
            <div className="taskmgr-header">
              <h2>Uygulama Geçmişi</h2>
              <span className="taskmgr-desc">
                Bu oturumdaki toplam kaynak tüketimleri.
              </span>
            </div>

            <div className="processes-table-wrapper">
              <table className="processes-table">
                <thead>
                  <tr>
                    <th>Uygulama</th>
                    <th>CPU Süresi</th>
                    <th>Ağ Kullanımı</th>
                    <th>Öncelik</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🌐 Google Chrome</td>
                    <td>14 dk 22 sn</td>
                    <td>125.4 MB</td>
                    <td>Normal</td>
                  </tr>
                  <tr>
                    <td>🎨 MS Paint</td>
                    <td>2 dk 15 sn</td>
                    <td>0 KB</td>
                    <td>Normal</td>
                  </tr>
                  <tr>
                    <td>💻 VS Code</td>
                    <td>8 dk 40 sn</td>
                    <td>12.8 MB</td>
                    <td>Yüksek</td>
                  </tr>
                  <tr>
                    <td>💣 Mayın Tarlası</td>
                    <td>45 sn</td>
                    <td>0 KB</td>
                    <td>Düşük</td>
                  </tr>
                  <tr>
                    <td>📝 Not Defteri</td>
                    <td>1 dk 4 sn</td>
                    <td>0 KB</td>
                    <td>Normal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagerApp;
