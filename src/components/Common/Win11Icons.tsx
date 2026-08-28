import React, { useId } from "react";

interface IconProps {
  size?: number;
  className?: string;
}

const gid = (id: string, name: string) => `${id}-${name}`;

// 1. Folder Icon (Yellow Windows 11 folder)
export const FolderIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Back flap */}
    <path
      d="M4 10C4 7.79086 5.79086 6 8 6H18.5858C19.6467 6 20.6641 6.42143 21.4142 7.17157L24.8284 10.5858C25.5786 11.3359 26.5959 11.7574 27.6569 11.7574H40C42.2091 11.7574 44 13.5482 44 15.7574V38C44 40.2091 42.2091 42 40 42H8C5.79086 42 4 40.2091 4 38V10Z"
      fill="url(#folder_back_grad)"
    />
    {/* Inner blue index page */}
    <rect
      x="8"
      y="11"
      width="32"
      height="15"
      rx="1.5"
      fill="#3b82f6"
      opacity="0.85"
    />
    <rect x="12" y="15" width="10" height="2" fill="#ffffff" opacity="0.6" />
    <rect x="12" y="19" width="16" height="2" fill="#ffffff" opacity="0.6" />
    {/* Front flap with shadow */}
    <path
      d="M4 17.5V38C4 40.2091 5.79086 42 8 42H40C42.2091 42 44 40.2091 44 38V17.5C44 16.1193 42.8807 15 41.5 15H6.5C5.11929 15 4 16.1193 4 17.5Z"
      fill="url(#folder_front_grad)"
    />
    <defs>
      <linearGradient
        id="folder_back_grad"
        x1="4"
        y1="6"
        x2="4"
        y2="42"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#ffe082" />
        <stop offset="100%" stopColor="#ffb300" />
      </linearGradient>
      <linearGradient
        id="folder_front_grad"
        x1="4"
        y1="15"
        x2="4"
        y2="42"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#fff8e1" />
        <stop offset="15%" stopColor="#ffe082" />
        <stop offset="100%" stopColor="#ffa000" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Computer Icon (This PC / Bu Bilgisayar)
export const ComputerIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Monitor Base and Stand */}
    <path
      d="M16 38H32V41C32 42.1046 31.1046 43 30 43H18C16.8954 43 16 42.1046 16 41V38Z"
      fill="#78909c"
    />
    <path d="M21 34H27V38H21V34Z" fill="#546e7a" />
    {/* Monitor Screen Frame */}
    <rect x="4" y="6" width="40" height="28" rx="3" fill="#263238" />
    <rect
      x="4"
      y="6"
      width="40"
      height="28"
      rx="3"
      stroke="#cfd8dc"
      strokeWidth="1"
    />
    {/* Display Glass Area */}
    <rect
      x="6"
      y="8"
      width="36"
      height="22"
      rx="1.5"
      fill="url(#screen_grad)"
    />
    {/* Simulated Windows desktop elements inside the display */}
    <rect
      x="9"
      y="11"
      width="3"
      height="3"
      rx="0.5"
      fill="#ffd54f"
      opacity="0.8"
    />
    <rect
      x="9"
      y="16"
      width="3"
      height="3"
      rx="0.5"
      fill="#42a5f5"
      opacity="0.8"
    />
    <rect
      x="14"
      y="11"
      width="3"
      height="3"
      rx="0.5"
      fill="#26a69a"
      opacity="0.8"
    />
    {/* Centered windows 11 taskbar inside the monitor display */}
    <rect x="19" y="27" width="10" height="1.5" fill="#ffffff" opacity="0.6" />
    <defs>
      <linearGradient
        id="screen_grad"
        x1="6"
        y1="8"
        x2="42"
        y2="30"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#1e88e5" />
        <stop offset="50%" stopColor="#1565c0" />
        <stop offset="100%" stopColor="#0d47a1" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Recycle Bin Icon (Geri Dönüşüm Kutusu)
export const RecycleBinIcon: React.FC<IconProps> = ({
  size = 36,
  className,
}) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M17 10L19 7H22.5L21 10H17Z" fill="#cfd8dc" />
      <path d="M26 10L28 6.5H32L30 10H26Z" fill="#eceff1" />
      <ellipse cx="24" cy="11" rx="15" ry="3.2" fill="#1565c0" />
      <ellipse cx="24" cy="10.6" rx="12.5" ry="2" fill="#64b5f6" />
      <path
        d="M10 12H38L34.2 40.2C34 41.2 33.1 42 32.1 42H15.9C14.9 42 14 41.2 13.8 40.2L10 12Z"
        fill={`url(#${gid(id, "bin")})`}
        stroke="#90caf9"
        strokeWidth="1.2"
      />
      {/* Recycle arrows */}
      <path
        d="M24 18.5c-3.2 0-5.8 2.1-6.6 5h2.2c.6-1.7 2.3-2.9 4.4-2.9 1.5 0 2.8.7 3.7 1.7l-1.6 1.6H32l-1.2-5.8-1.7 1.7A6.6 6.6 0 0 0 24 18.5Z"
        fill="#1565c0"
      />
      <path
        d="M30.2 27.2c-.5 1.9-2.2 3.3-4.2 3.3-1.4 0-2.6-.6-3.5-1.5l1.5-1.5H18.2l1.2 5.7 1.7-1.7a6.6 6.6 0 0 0 8.8-1.3l-1.7-1.5c-.4.4-.9.7-1.5.9l1.5-2.9Z"
        fill="#1565c0"
      />
      <defs>
        <linearGradient
          id={gid(id, "bin")}
          x1="10"
          y1="12"
          x2="38"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#e3f2fd" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#90caf9" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 4. Notepad Icon (Not Defteri)
export const NotepadIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Notepad Back cover */}
    <rect x="6" y="5" width="36" height="38" rx="3.5" fill="#0d47a1" />
    {/* Yellow Pencil back accent */}
    <path d="M34 4L37 7L18 26L15 23L34 4Z" fill="#ffb300" opacity="0.6" />
    {/* White Notepad Pages */}
    <rect x="10" y="7" width="30" height="34" rx="2" fill="#ffffff" />
    {/* Left blue margins bar */}
    <rect x="14" y="7" width="2" height="34" fill="#ff8a80" opacity="0.5" />
    {/* Lines of text */}
    <line
      x1="18"
      y1="13"
      x2="34"
      y2="13"
      stroke="#b0bec5"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="19"
      x2="32"
      y2="19"
      stroke="#b0bec5"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="25"
      x2="35"
      y2="25"
      stroke="#b0bec5"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="31"
      x2="28"
      y2="31"
      stroke="#b0bec5"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Spiral rings on the left edge */}
    <circle cx="8" cy="11" r="2" fill="#78909c" />
    <circle cx="8" cy="19" r="2" fill="#78909c" />
    <circle cx="8" cy="27" r="2" fill="#78909c" />
    <circle cx="8" cy="35" r="2" fill="#78909c" />
  </svg>
);

// 5. Google Chrome Icon
export const EdgeIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="24" cy="24" r="20" fill="#fff" />
    <path
      d="M24 4a20 20 0 0 1 17.32 10H24a10 10 0 0 0-8.66 5L7.68 9.18A20 20 0 0 1 24 4Z"
      fill="#EA4335"
    />
    <path
      d="M41.32 14A20 20 0 0 1 30.9 41.18L22.56 26.8A10 10 0 0 0 24 14h17.32Z"
      fill="#FBBC05"
    />
    <path
      d="M30.9 41.18A20 20 0 0 1 7.68 9.18l7.66 9.82A10 10 0 0 0 22.56 26.8l8.34 14.38Z"
      fill="#34A853"
    />
    <circle cx="24" cy="24" r="9" fill="#fff" />
    <circle cx="24" cy="24" r="7" fill="#4285F4" />
  </svg>
);

// 6. Settings Icon — Fluent gear on blue disc
export const SettingsIcon: React.FC<IconProps> = ({ size = 36, className }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill={`url(#${gid(id, "bg")})`} />
      {/* 6-tooth gear */}
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M20.2 9.4h7.6l1.1 4.2 3.7 1.5 3.6-2.4 5.4 5.4-2.4 3.6 1.5 3.7 4.2 1.1v7.6l-4.2 1.1-1.5 3.7 2.4 3.6-5.4 5.4-3.6-2.4-3.7 1.5-1.1 4.2h-7.6l-1.1-4.2-3.7-1.5-3.6 2.4-5.4-5.4 2.4-3.6-1.5-3.7L5.4 27.8v-7.6l4.2-1.1 1.5-3.7-2.4-3.6 5.4-5.4 3.6 2.4 3.7-1.5 1.1-4.2ZM24 17a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 3.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Z"
      />
      <defs>
        <linearGradient
          id={gid(id, "bg")}
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6ec6ff" />
          <stop offset="45%" stopColor="#0078d4" />
          <stop offset="100%" stopColor="#005a9e" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 7. Calculator Icon — Win11 light calc
export const CalculatorIcon: React.FC<IconProps> = ({
  size = 36,
  className,
}) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="8"
        y="4"
        width="32"
        height="40"
        rx="6"
        fill={`url(#${gid(id, "body")})`}
      />
      <rect x="12" y="9" width="24" height="8" rx="2" fill="#202020" />
      <rect x="28" y="12" width="5" height="2.5" rx="0.6" fill="#f3f3f3" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={12 + col * 8.2}
            y={21 + row * 5.4}
            width="6.6"
            height="4.2"
            rx="1"
            fill={col === 2 ? "#0078d4" : "#3b3b3b"}
          />
        )),
      )}
      <defs>
        <linearGradient
          id={gid(id, "body")}
          x1="8"
          y1="4"
          x2="40"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#2b2b2b" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 8. Terminal (Windows Terminal style)
export const TerminalIcon: React.FC<IconProps> = ({ size = 36, className }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="4"
        y="6"
        width="40"
        height="36"
        rx="6"
        fill={`url(#${gid(id, "bg")})`}
      />
      <path
        d="M12 17l7 7-7 7"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 31h12"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={gid(id, "bg")}
          x1="4"
          y1="6"
          x2="44"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2b2b2b" />
          <stop offset="100%" stopColor="#0f0f0f" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 9. Text File Icon (.txt)
export const TextFileIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Paper body with folded top-right corner */}
    <path
      d="M8 6C8 4.89543 8.89543 4 10 4H30L40 14V42C40 43.1046 39.1046 44 38 44H10C8.89543 44 8 43.1046 8 42V6Z"
      fill="url(#txt_body_grad)"
      stroke="#90caf9"
      strokeWidth="1"
    />
    {/* Dog-eared folded corner */}
    <path d="M30 4V14H40L30 4Z" fill="#bbdefb" />
    <path d="M30 14H40L30 4V14Z" stroke="#90caf9" strokeWidth="1" />
    {/* Lines of text */}
    <line
      x1="14"
      y1="20"
      x2="34"
      y2="20"
      stroke="#90caf9"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="26"
      x2="32"
      y2="26"
      stroke="#90caf9"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="32"
      x2="34"
      y2="32"
      stroke="#90caf9"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="38"
      x2="26"
      y2="38"
      stroke="#90caf9"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="txt_body_grad"
        x1="8"
        y1="4"
        x2="40"
        y2="44"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e3f2fd" />
      </linearGradient>
    </defs>
  </svg>
);

// 10. Hard Drive Icon (Yerel Disk C:)
export const HardDriveIcon: React.FC<IconProps> = ({
  size = 36,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="10"
      y="6"
      width="28"
      height="36"
      rx="4"
      fill="url(#disk_body_grad)"
      stroke="#90a4ae"
      strokeWidth="1.5"
    />
    <rect
      x="14"
      y="10"
      width="20"
      height="22"
      rx="2"
      fill="#cfd8dc"
      opacity="0.3"
    />
    <circle cx="24" cy="36" r="3" fill="#90a4ae" />
    <rect x="22" y="14" width="4" height="2" fill="#1e88e5" />
    <defs>
      <linearGradient
        id="disk_body_grad"
        x1="10"
        y1="6"
        x2="38"
        y2="42"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#eceff1" />
        <stop offset="100%" stopColor="#b0bec5" />
      </linearGradient>
    </defs>
  </svg>
);

// 11. Paint Icon (Palette with brush)
export const PaintIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Paint Palette Body */}
    <path
      d="M12 6C7.58172 6 4 9.58172 4 14V34C4 38.4183 7.58172 42 12 42H36C40.4183 42 44 38.4183 44 34V22C44 19.7909 42.2091 18 40 18C37.7909 18 36 16.2091 36 14C36 9.58172 32.4183 6 28 6H12Z"
      fill="url(#paint_palette_grad)"
    />
    {/* Colorful wells */}
    <circle cx="12" cy="14" r="3.5" fill="#e91e63" /> {/* Red */}
    <circle cx="20" cy="14" r="3.5" fill="#ffeb3b" /> {/* Yellow */}
    <circle cx="28" cy="14" r="3.5" fill="#2196f3" /> {/* Blue */}
    <circle cx="12" cy="24" r="3.5" fill="#4caf50" /> {/* Green */}
    <circle cx="20" cy="24" r="3.5" fill="#9c27b0" /> {/* Purple */}
    <circle cx="12" cy="34" r="3.5" fill="#ff9800" /> {/* Orange */}
    {/* Thumb Hole */}
    <ellipse cx="28" cy="32" rx="4.5" ry="3" fill="#ffffff" opacity="0.9" />
    <ellipse cx="28" cy="32" rx="4.5" ry="3" stroke="#b0bec5" strokeWidth="1" />
    {/* Brush overlaying */}
    <path d="M38 10L42 6L44 8L40 12L38 10Z" fill="#8d6e63" />
    <path d="M33 15L38 10L40 12L35 17L33 15Z" fill="#ffb74d" />
    <path
      d="M31 19L33 15L35 17L33 21C32.5 22 31 23 30 22C29 21 30 19.5 31 19Z"
      fill="#37474f"
    />
    <defs>
      <linearGradient
        id="paint_palette_grad"
        x1="4"
        y1="6"
        x2="44"
        y2="42"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#fff9c4" />
        <stop offset="100%" stopColor="#f5f5f5" />
      </linearGradient>
    </defs>
  </svg>
);

// 12. VS Code Icon — classic ribbon / angle-bracket mark
export const VSCodeIcon: React.FC<IconProps> = ({ size = 36, className }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 8.5c0-1.4 1.5-2.3 2.8-1.6L38.5 20c1.2.6 1.2 2.3 0 3L12.8 36.1c-1.3.7-2.8-.2-2.8-1.6V8.5Z"
        fill={`url(#${gid(id, "wing")})`}
      />
      <path
        d="M10 14.2 28.8 24 10 33.8V14.2Z"
        fill="#0065a9"
        opacity="0.55"
      />
      <path
        d="M6.5 16.2c0-.9.7-1.5 1.5-1.2l5.2 2.2v13.6l-5.2 2.2c-.8.3-1.5-.3-1.5-1.2V16.2Z"
        fill={`url(#${gid(id, "tip")})`}
      />
      <path
        d="M34.2 10.5 41 14.2c.9.5.9 1.7 0 2.2l-6.8 3.7V10.5Zm0 17.4L41 31.6c.9.5.9 1.7 0 2.2l-6.8 3.7V27.9Z"
        fill="#1BA1E2"
      />
      <defs>
        <linearGradient
          id={gid(id, "wing")}
          x1="10"
          y1="7"
          x2="40"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#32bfff" />
          <stop offset="55%" stopColor="#0078d4" />
          <stop offset="100%" stopColor="#005a9e" />
        </linearGradient>
        <linearGradient
          id={gid(id, "tip")}
          x1="6"
          y1="15"
          x2="14"
          y2="33"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#29b6f6" />
          <stop offset="100%" stopColor="#0065a9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 13. Minesweeper Icon (Nostalgic mine)
export const MinesweeperIcon: React.FC<IconProps> = ({
  size = 36,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="24" cy="24" r="21" fill="url(#mines_bg)" />
    {/* Mine Body */}
    <circle cx="24" cy="24" r="11" fill="#37474f" />
    {/* Mine Spikes */}
    <rect x="22" y="7" width="4" height="6" rx="1.5" fill="#263238" />
    <rect x="22" y="35" width="4" height="6" rx="1.5" fill="#263238" />
    <rect x="7" y="22" width="6" height="4" rx="1.5" fill="#263238" />
    <rect x="35" y="22" width="6" height="4" rx="1.5" fill="#263238" />

    {/* Diagonal Spikes */}
    <path
      d="M11 11L15 15"
      stroke="#263238"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M33 33L37 37"
      stroke="#263238"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M11 37L15 33"
      stroke="#263238"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M33 15L37 11"
      stroke="#263238"
      strokeWidth="4"
      strokeLinecap="round"
    />

    {/* Mine Highlight */}
    <circle cx="20" cy="20" r="3" fill="#ffffff" opacity="0.3" />

    {/* Little red flashing led */}
    <circle cx="24" cy="24" r="2.5" fill="#ff1744" />
    <defs>
      <linearGradient
        id="mines_bg"
        x1="3"
        y1="3"
        x2="45"
        y2="45"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#cfd8dc" />
        <stop offset="100%" stopColor="#90a4ae" />
      </linearGradient>
    </defs>
  </svg>
);

// 14. Camera Icon (Sleek camera)
export const CameraIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Lens Flash Peak */}
    <path d="M18 12H30L32 16H16L18 12Z" fill="#37474f" />
    {/* Camera Body */}
    <rect
      x="6"
      y="16"
      width="36"
      height="24"
      rx="4"
      fill="url(#camera_body_grad)"
      stroke="#90a4ae"
      strokeWidth="1"
    />
    {/* Lens Ring */}
    <circle cx="24" cy="28" r="8" fill="#263238" />
    <circle cx="24" cy="28" r="6.5" fill="url(#lens_glass_grad)" />
    <circle cx="24" cy="28" r="4" fill="#0d47a1" />
    {/* Flash Led */}
    <circle cx="36" cy="20" r="2" fill="#ffeb3b" />
    {/* Shutter Button */}
    <rect x="10" y="14" width="4" height="2" rx="0.5" fill="#e0e0e0" />
    <defs>
      <linearGradient
        id="camera_body_grad"
        x1="6"
        y1="16"
        x2="42"
        y2="40"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#78909c" />
        <stop offset="100%" stopColor="#455a64" />
      </linearGradient>
      <linearGradient
        id="lens_glass_grad"
        x1="17.5"
        y1="21.5"
        x2="30.5"
        y2="34.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#81d4fa" />
        <stop offset="100%" stopColor="#0288d1" />
      </linearGradient>
    </defs>
  </svg>
);

// 15. Image Viewer / Photos Icon (Landscape mountains)
export const ImageViewerIcon: React.FC<IconProps> = ({
  size = 36,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Frame */}
    <rect
      x="5"
      y="6"
      width="38"
      height="36"
      rx="4.5"
      fill="url(#photo_frame_grad)"
      stroke="#81d4fa"
      strokeWidth="1"
    />
    {/* Mountains */}
    <path
      d="M5 34L17 21L27 31L35 24L43 33V39.5C43 40.8807 41.8807 42 40.5 42H7.5C6.11929 42 5 40.8807 5 39.5V34Z"
      fill="url(#photo_mountain_grad)"
    />
    {/* Sun */}
    <circle cx="31" cy="15" r="4.5" fill="#ffeb3b" />
    <defs>
      <linearGradient
        id="photo_frame_grad"
        x1="5"
        y1="6"
        x2="43"
        y2="42"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#e3f2fd" />
        <stop offset="100%" stopColor="#bbdefb" />
      </linearGradient>
      <linearGradient
        id="photo_mountain_grad"
        x1="5"
        y1="21"
        x2="43"
        y2="42"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#4caf50" />
        <stop offset="100%" stopColor="#2e7d32" />
      </linearGradient>
    </defs>
  </svg>
);

// 16. Store Icon
export const StoreIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 12V8C12 5.79086 13.7909 4 16 4H32C34.2091 4 36 5.79086 36 8V12"
      stroke="url(#store_handle_grad)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <rect
      x="6"
      y="11"
      width="36"
      height="33"
      rx="5"
      fill="url(#store_bag_grad)"
    />
    {/* Microsoft Store Logo Grid */}
    <rect x="18" y="21" width="5.5" height="5.5" fill="#f25022" />
    <rect x="24.5" y="21" width="5.5" height="5.5" fill="#7fba00" />
    <rect x="18" y="27.5" width="5.5" height="5.5" fill="#00a4ef" />
    <rect x="24.5" y="27.5" width="5.5" height="5.5" fill="#ffb900" />
    <defs>
      <linearGradient
        id="store_handle_grad"
        x1="12"
        y1="4"
        x2="36"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#cfd8dc" />
        <stop offset="100%" stopColor="#78909c" />
      </linearGradient>
      <linearGradient
        id="store_bag_grad"
        x1="6"
        y1="11"
        x2="42"
        y2="44"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#4fc3f7" />
        <stop offset="100%" stopColor="#0288d1" />
      </linearGradient>
    </defs>
  </svg>
);

// 17. Copilot Icon (Fluent butterfly)
export const CopilotIcon: React.FC<IconProps> = ({ size = 36, className }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="10"
        fill={`url(#${gid(id, "bg")})`}
      />
      <path
        d="M15 28c0-6 4-10 9-10 2.5 0 4.5 1 6 2.5C28 14 24 10 18.5 10 12 10 8 15.5 8 22c0 5 2.5 8.5 7 10Z"
        fill={`url(#${gid(id, "wingL")})`}
      />
      <path
        d="M33 20c0 6-4 10-9 10-2.5 0-4.5-1-6-2.5C20 34 24 38 29.5 38 36 38 40 32.5 40 26c0-5-2.5-8.5-7-10Z"
        fill={`url(#${gid(id, "wingR")})`}
      />
      <ellipse cx="24" cy="24" rx="3.2" ry="8" fill="#fff" opacity="0.95" />
      <defs>
        <linearGradient
          id={gid(id, "bg")}
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1b1b2f" />
          <stop offset="100%" stopColor="#0d1b2a" />
        </linearGradient>
        <linearGradient
          id={gid(id, "wingL")}
          x1="8"
          y1="10"
          x2="30"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient
          id={gid(id, "wingR")}
          x1="18"
          y1="18"
          x2="40"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 18. Task Manager Icon
export const TaskManagerIcon: React.FC<IconProps> = ({
  size = 36,
  className,
}) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="5"
        y="5"
        width="38"
        height="38"
        rx="8"
        fill={`url(#${gid(id, "bg")})`}
      />
      <path
        d="M8 30h6l3-12 5 18 4-14 3 8h11"
        stroke="#00e5ff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M8 30h32"
        stroke="#fff"
        strokeOpacity="0.15"
        strokeWidth="1.2"
      />
      <defs>
        <linearGradient
          id={gid(id, "bg")}
          x1="5"
          y1="5"
          x2="43"
          y2="43"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#37474f" />
          <stop offset="100%" stopColor="#102027" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 19. Weather Icon
export const WeatherIcon: React.FC<IconProps> = ({ size = 36, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Sun */}
    <circle cx="30" cy="18" r="9" fill="url(#weather_sun_grad)" />
    {/* Cloud Body */}
    <path
      d="M12 36C8.68629 36 6 33.3137 6 30C6 27.0824 8.0818 24.6521 10.8719 24.1206C12.0125 19.0601 16.5647 15.3333 22 15.3333C26.5494 15.3333 30.5054 18.0674 32.2227 22.0298C32.4764 22.0101 32.7317 22 33 22C36.866 22 40 25.134 40 29C40 32.866 36.866 36 33 36H12Z"
      fill="url(#weather_cloud_grad)"
      opacity="0.9"
    />
    <defs>
      <linearGradient
        id="weather_sun_grad"
        x1="21"
        y1="9"
        x2="39"
        y2="27"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#ffeb3b" />
        <stop offset="100%" stopColor="#f57c00" />
      </linearGradient>
      <linearGradient
        id="weather_cloud_grad"
        x1="6"
        y1="15.3333"
        x2="40"
        y2="36"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#eceff1" />
        <stop offset="100%" stopColor="#b0bec5" />
      </linearGradient>
    </defs>
  </svg>
);

// 20. MSI BIOS Icon (dragon shield)
export const MSIBiosIcon: React.FC<IconProps> = ({ size = 36, className }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M24 4C34 4 42 7.5 43 13c0 14-5 25-19 31C10 38 5 27 5 13 6 7.5 14 4 24 4Z"
        fill={`url(#${gid(id, "shield")})`}
      />
      <path
        d="M24 10c5.5 0 9.5 2.2 10.5 5.2 0 9.5-3.5 16.5-10.5 20.3C17 31.7 13.5 24.7 13.5 15.2 14.5 12.2 18.5 10 24 10Z"
        fill="#1a0000"
        opacity="0.25"
      />
      {/* Stylized dragon head silhouette */}
      <path
        d="M18 22c1.5-4 5-6.5 9.5-6 2.2.2 4 1.4 5 3.2.3.6-.3 1.2-.9 1l-1.8-.5c-1.5 3.2-3.8 5.2-7.3 6.2-.8.2-1.5-.5-1.3-1.3.4-1.4.6-2.8.8-4.1-1.2.6-2.3 1.5-3.2 2.8-.4.6-1.3.4-1.5-.3-.2-.8 0-1.5.7-2Z"
        fill="#fff"
      />
      <circle cx="28.2" cy="19.2" r="1.1" fill="#ff0000" />
      <path
        d="M22 28.5c2.2 1.4 4.8 2.2 7.5 2.2.8 0 1.2 1 .6 1.5-2 .9-4.2 1.2-6.5.7-1.2-.3-1.8-1.8-1.6-2.8.1-.6.6-1.1 1.2-1.1.3 0 .6.1.8.3Z"
        fill="#fff"
        opacity="0.9"
      />
      <defs>
        <linearGradient
          id={gid(id, "shield")}
          x1="5"
          y1="4"
          x2="43"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ff3b3b" />
          <stop offset="55%" stopColor="#e10600" />
          <stop offset="100%" stopColor="#8b0000" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 21. Free Download Manager Icon
export const FdmIcon: React.FC<IconProps> = ({ size = 36, className }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="10"
        fill={`url(#${gid(id, "bg")})`}
      />
      <path
        d="M24 12v16m0 0-7-7m7 7 7-7"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 35h22"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={gid(id, "bg")}
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#29b6f6" />
          <stop offset="100%" stopColor="#01579b" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// 22. Torrent Icon (magnet / peer swap)
export const TorrentIcon: React.FC<IconProps> = ({ size = 36, className }) => {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="24" r="20" fill={`url(#${gid(id, "bg")})`} />
      <path
        d="M16 18v6c0 4.4 3.6 8 8 8s8-3.6 8-8v-6"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <rect x="13" y="14" width="6" height="7" rx="1.5" fill="#ff5252" />
      <rect x="29" y="14" width="6" height="7" rx="1.5" fill="#448aff" />
      <path
        d="M20 30h8"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      <defs>
        <linearGradient
          id={gid(id, "bg")}
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#66bb6a" />
          <stop offset="100%" stopColor="#1b5e20" />
        </linearGradient>
      </defs>
    </svg>
  );
};

interface AppWindowIconProps extends IconProps {
  appId: string;
}

/** Small titlebar icon for app windows */
export const AppWindowIcon: React.FC<AppWindowIconProps> = ({
  appId,
  size = 16,
  className,
}) => {
  switch (appId) {
    case "explorer":
      return <FolderIcon size={size} className={className} />;
    case "edge":
      return <EdgeIcon size={size} className={className} />;
    case "notepad":
      return <NotepadIcon size={size} className={className} />;
    case "calculator":
      return <CalculatorIcon size={size} className={className} />;
    case "cmd":
      return <TerminalIcon size={size} className={className} />;
    case "settings":
      return <SettingsIcon size={size} className={className} />;
    case "paint":
      return <PaintIcon size={size} className={className} />;
    case "vscode":
      return <VSCodeIcon size={size} className={className} />;
    case "minesweeper":
      return <MinesweeperIcon size={size} className={className} />;
    case "camera":
      return <CameraIcon size={size} className={className} />;
    case "imageviewer":
      return <ImageViewerIcon size={size} className={className} />;
    case "store":
      return <StoreIcon size={size} className={className} />;
    case "copilot":
      return <CopilotIcon size={size} className={className} />;
    case "taskmgr":
      return <TaskManagerIcon size={size} className={className} />;
    case "weather":
      return <WeatherIcon size={size} className={className} />;
    case "bios":
      return <MSIBiosIcon size={size} className={className} />;
    case "fdm":
      return <FdmIcon size={size} className={className} />;
    case "torrent":
      return <TorrentIcon size={size} className={className} />;
    default:
      return <TextFileIcon size={size} className={className} />;
  }
};
