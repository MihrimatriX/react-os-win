/** Single source for the simulated Windows user identity. */
export const OS_USER = {
  displayName: "John Doe",
  folderName: "JohnDoe",
  email: "john.doe@reactos.local",
  hostname: "DESKTOP-JOHNDOE",
  accountHint: "Yerel Hesap",
  accountRole: "Yerel Yönetici (Administrator)",
  promptHost: "johndoe@desktop-johndoe",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
} as const;

/** `C:\Users\JohnDoe\...` path segments for the VFS. */
export const userPath = (...rest: string[]): string[] => [
  "C:",
  "Users",
  OS_USER.folderName,
  ...rest,
];
