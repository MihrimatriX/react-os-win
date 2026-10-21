/** Shared wallpaper IDs — used by SystemContext, Desktop, Settings, Login. */

export const LIVE_WALLPAPER_ID = "live:bloom" as const;

export const STATIC_WALLPAPERS = [
  `${import.meta.env.BASE_URL}wallpaper.png`,
  "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1920&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&q=80",
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1920&q=80",
] as const;

/** Live first so it is the default for fresh installs and easy to pick in Settings. */
export const WALLPAPERS: readonly string[] = [
  LIVE_WALLPAPER_ID,
  ...STATIC_WALLPAPERS,
];

export function isLiveWallpaper(id: string | null | undefined): boolean {
  return typeof id === "string" && id.startsWith("live:");
}

export function resolveInitialWallpaper(saved: string | null): string {
  if (!saved) return LIVE_WALLPAPER_ID;
  if (
    saved === LIVE_WALLPAPER_ID ||
    (STATIC_WALLPAPERS as readonly string[]).includes(saved)
  ) {
    return saved;
  }
  // Unknown / legacy URL or a Camera/Paint photo — keep as custom static
  if (/^(https?:|\/|data:image\/)/.test(saved)) return saved;
  return LIVE_WALLPAPER_ID;
}
