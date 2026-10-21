import { describe, expect, it } from "vitest";
import {
  LIVE_WALLPAPER_ID,
  WALLPAPERS,
  isLiveWallpaper,
  resolveInitialWallpaper,
  STATIC_WALLPAPERS,
} from "./wallpapers";

describe("wallpapers", () => {
  it("lists live wallpaper first", () => {
    expect(WALLPAPERS[0]).toBe(LIVE_WALLPAPER_ID);
    expect(WALLPAPERS.length).toBe(STATIC_WALLPAPERS.length + 1);
  });

  it("detects live wallpaper ids", () => {
    expect(isLiveWallpaper(LIVE_WALLPAPER_ID)).toBe(true);
    expect(isLiveWallpaper("live:other")).toBe(true);
    expect(isLiveWallpaper("/wallpaper.png")).toBe(false);
    expect(isLiveWallpaper(null)).toBe(false);
  });

  it("defaults fresh installs to live bloom", () => {
    expect(resolveInitialWallpaper(null)).toBe(LIVE_WALLPAPER_ID);
  });

  it("preserves saved static and live choices", () => {
    expect(resolveInitialWallpaper(LIVE_WALLPAPER_ID)).toBe(LIVE_WALLPAPER_ID);
    expect(resolveInitialWallpaper("/wallpaper.png")).toBe("/wallpaper.png");
    expect(
      resolveInitialWallpaper(
        "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1920&q=80",
      ),
    ).toBe(
      "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1920&q=80",
    );
  });

  it("keeps a photo set as wallpaper (data URL) across reloads", () => {
    expect(resolveInitialWallpaper("data:image/png;base64,AAAA")).toBe(
      "data:image/png;base64,AAAA",
    );
    expect(resolveInitialWallpaper("javascript:alert(1)")).toBe(
      LIVE_WALLPAPER_ID,
    );
  });

  it("keeps unknown http/path URLs as custom static", () => {
    expect(resolveInitialWallpaper("https://example.com/x.jpg")).toBe(
      "https://example.com/x.jpg",
    );
    expect(resolveInitialWallpaper("/custom.png")).toBe("/custom.png");
  });
});
