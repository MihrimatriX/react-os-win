export interface AppDefinition {
  id: string;
  title: string;
  width: number;
  height: number;
  singleInstance?: boolean;
}

export const APP_CATALOG: AppDefinition[] = [
  { id: "explorer", title: "Dosya Gezgini", width: 800, height: 500 },
  { id: "edge", title: "Google Chrome", width: 920, height: 590 },
  { id: "notepad", title: "Not Defteri", width: 620, height: 430 },
  {
    id: "calculator",
    title: "Hesap Makinesi",
    width: 340,
    height: 520,
    singleInstance: true,
  },
  { id: "cmd", title: "Terminal", width: 700, height: 440 },
  {
    id: "settings",
    title: "Ayarlar",
    width: 940,
    height: 640,
    singleInstance: true,
  },
  { id: "paint", title: "MS Paint", width: 880, height: 620 },
  { id: "vscode", title: "Visual Studio Code", width: 1060, height: 700 },
  {
    id: "minesweeper",
    title: "Mayın Tarlası",
    width: 360,
    height: 510,
    singleInstance: true,
  },
  {
    id: "camera",
    title: "Kamera",
    width: 660,
    height: 540,
    singleInstance: true,
  },
  { id: "imageviewer", title: "Fotoğraflar", width: 740, height: 560 },
  {
    id: "store",
    title: "Microsoft Store",
    width: 880,
    height: 600,
    singleInstance: true,
  },
  {
    id: "copilot",
    title: "Windows Copilot",
    width: 380,
    height: 620,
    singleInstance: true,
  },
  {
    id: "taskmgr",
    title: "Görev Yöneticisi",
    width: 720,
    height: 510,
    singleInstance: true,
  },
  {
    id: "weather",
    title: "Hava Durumu",
    width: 720,
    height: 520,
    singleInstance: true,
  },
  {
    id: "bios",
    title: "MSI CLICK BIOS 5",
    width: 980,
    height: 680,
    singleInstance: true,
  },
  {
    id: "fdm",
    title: "Free Download Manager",
    width: 840,
    height: 540,
    singleInstance: true,
  },
  {
    id: "torrent",
    title: "qBittorrent v4.6.3",
    width: 920,
    height: 600,
    singleInstance: true,
  },
];

export const APP_BY_ID = Object.fromEntries(
  APP_CATALOG.map((app) => [app.id, app]),
) as Record<string, AppDefinition>;

export const TASKBAR_PINNED_APP_IDS = [
  "explorer",
  "edge",
  "notepad",
  "calculator",
  "cmd",
  "settings",
] as const;

export const DEFAULT_INSTALLED_APP_IDS = [
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
  "bios",
  "taskmgr",
  "fdm",
  "torrent",
] as const;

export const getAppDefinition = (appId: string): AppDefinition =>
  APP_BY_ID[appId] ?? {
    id: appId,
    title: "Uygulama",
    width: 640,
    height: 440,
  };
