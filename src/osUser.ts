/** Single source for the simulated Windows user identity. */
export const OS_USER = {
  displayName: "Ahmet Faruk Uzunkaya",
  folderName: "AhmetFarukUzunkaya",
  email: "ahmet@local",
  hostname: "DESKTOP-AFU",
  accountHint: "Yerel Hesap",
  accountRole: "Yerel Yönetici (Administrator)",
  promptHost: "ahmet@desktop-afu",
  avatarUrl: `${import.meta.env.BASE_URL}avatar.svg`,
} as const;

/** `C:\Users\AhmetFarukUzunkaya\...` path segments for the VFS. */
export const userPath = (...rest: string[]): string[] => [
  "C:",
  "Users",
  OS_USER.folderName,
  ...rest,
];
