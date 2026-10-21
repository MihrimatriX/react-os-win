import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

/** Local assets under public/icons/ (Fluent color SVG + Icons8 Fluency PNG + brand logos). */
const ICON_SRC = {
  folder: `${import.meta.env.BASE_URL}icons/folder.png`,
  explorer: `${import.meta.env.BASE_URL}icons/explorer.png`,
  computer: `${import.meta.env.BASE_URL}icons/computer.png`,
  recycle: `${import.meta.env.BASE_URL}icons/recycle.png`,
  chrome: `${import.meta.env.BASE_URL}icons/chrome.svg`,
  notepad: `${import.meta.env.BASE_URL}icons/notepad.png`,
  settings: `${import.meta.env.BASE_URL}icons/settings.svg`,
  calculator: `${import.meta.env.BASE_URL}icons/calculator.png`,
  terminal: `${import.meta.env.BASE_URL}icons/terminal.png`,
  paint: `${import.meta.env.BASE_URL}icons/paint.png`,
  vscode: `${import.meta.env.BASE_URL}icons/vscode.svg`,
  store: `${import.meta.env.BASE_URL}icons/store.png`,
  camera: `${import.meta.env.BASE_URL}icons/camera.svg`,
  photos: `${import.meta.env.BASE_URL}icons/photos.png`,
  taskmgr: `${import.meta.env.BASE_URL}icons/taskmgr.png`,
  weather: `${import.meta.env.BASE_URL}icons/weather.png`,
  copilot: `${import.meta.env.BASE_URL}icons/copilot.png`,
  minesweeper: `${import.meta.env.BASE_URL}icons/minesweeper.png`,
  fdm: `${import.meta.env.BASE_URL}icons/fdm.png`,
  torrent: `${import.meta.env.BASE_URL}icons/torrent.svg`,
  bios: `${import.meta.env.BASE_URL}icons/bios.png`,
  projects: `${import.meta.env.BASE_URL}icons/folder.png`,
  document: `${import.meta.env.BASE_URL}icons/document.svg`,
  text: `${import.meta.env.BASE_URL}icons/text.png`,
  hdd: `${import.meta.env.BASE_URL}icons/hdd.png`,
  // System tray overflow apps
  onedrive: `${import.meta.env.BASE_URL}icons/onedrive.png`,
  defender: `${import.meta.env.BASE_URL}icons/defender.png`,
  discord: `${import.meta.env.BASE_URL}icons/discord.png`,
  spotify: `${import.meta.env.BASE_URL}icons/spotify.png`,
  steam: `${import.meta.env.BASE_URL}icons/steam.png`,
} as const;

/** appId → public icon path (edge = Chrome UI). */
const APP_ICON_SRC: Record<string, string> = {
  explorer: ICON_SRC.explorer,
  edge: ICON_SRC.chrome,
  notepad: ICON_SRC.notepad,
  calculator: ICON_SRC.calculator,
  cmd: ICON_SRC.terminal,
  settings: ICON_SRC.settings,
  paint: ICON_SRC.paint,
  vscode: ICON_SRC.vscode,
  minesweeper: ICON_SRC.minesweeper,
  camera: ICON_SRC.camera,
  imageviewer: ICON_SRC.photos,
  store: ICON_SRC.store,
  copilot: ICON_SRC.copilot,
  taskmgr: ICON_SRC.taskmgr,
  weather: ICON_SRC.weather,
  bios: ICON_SRC.bios,
  fdm: ICON_SRC.fdm,
  torrent: ICON_SRC.torrent,
  projects: ICON_SRC.projects,
};

const FALLBACK_SRC = ICON_SRC.document;

const GlyphImg: React.FC<IconProps & { src: string }> = ({
  size = 36,
  className,
  src,
}) => (
  <img
    src={src}
    alt=""
    width={size}
    height={size}
    draggable={false}
    className={className}
    decoding="async"
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      display: "block",
      userSelect: "none",
      pointerEvents: "none",
      imageRendering: "auto",
    }}
    onError={(event) => {
      const el = event.currentTarget;
      if (el.dataset.fallback === "1") return;
      el.dataset.fallback = "1";
      el.src = FALLBACK_SRC;
    }}
  />
);

export const FolderIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.folder} size={size} className={className} />
);
export const ComputerIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.computer} size={size} className={className} />
);
export const RecycleBinIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.recycle} size={size} className={className} />
);
export const EdgeIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.chrome} size={size} className={className} />
);
export const NotepadIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.notepad} size={size} className={className} />
);
export const SettingsIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.settings} size={size} className={className} />
);
export const CalculatorIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.calculator} size={size} className={className} />
);
export const TerminalIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.terminal} size={size} className={className} />
);
export const PaintIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.paint} size={size} className={className} />
);
export const VSCodeIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.vscode} size={size} className={className} />
);
export const StoreIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.store} size={size} className={className} />
);
export const CameraIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.camera} size={size} className={className} />
);
export const ImageViewerIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.photos} size={size} className={className} />
);
export const MinesweeperIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.minesweeper} size={size} className={className} />
);
export const TextFileIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.text} size={size} className={className} />
);
export const HardDriveIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <GlyphImg src={ICON_SRC.hdd} size={size} className={className} />
);

/** Tray overflow / notification-area brand icons */
export const OneDriveIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <GlyphImg src={ICON_SRC.onedrive} size={size} className={className} />
);
export const DefenderIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <GlyphImg src={ICON_SRC.defender} size={size} className={className} />
);
export const DiscordIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <GlyphImg src={ICON_SRC.discord} size={size} className={className} />
);
export const SpotifyIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <GlyphImg src={ICON_SRC.spotify} size={size} className={className} />
);
export const SteamIcon: React.FC<IconProps> = ({ size = 16, className }) => (
  <GlyphImg src={ICON_SRC.steam} size={size} className={className} />
);

interface AppWindowIconProps extends IconProps {
  appId: string;
}

/** Shared icon source for titlebar / Start / taskbar / desktop */
export const AppWindowIcon: React.FC<AppWindowIconProps> = ({
  appId,
  size = 16,
  className,
}) => {
  const src = APP_ICON_SRC[appId] ?? FALLBACK_SRC;
  return <GlyphImg src={src} size={size} className={className} />;
};
