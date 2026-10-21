import { describe, expect, it } from "vitest";
import {
  DEFAULT_BROWSER_BOOKMARKS,
  mergeDefaultBookmarks,
  migrateLegacyUrl,
} from "./browserBookmarks";

describe("mergeDefaultBookmarks", () => {
  it("returns all defaults when saved list is empty", () => {
    const merged = mergeDefaultBookmarks([]);
    expect(merged.map((b) => b.name)).toEqual(
      DEFAULT_BROWSER_BOOKMARKS.map((b) => b.name),
    );
    expect(merged.some((b) => b.name === "Murat Yelol")).toBe(true);
  });

  it("appends Murat Yelol when stale localStorage omitted it", () => {
    const stale = DEFAULT_BROWSER_BOOKMARKS.filter(
      (b) => b.name !== "Murat Yelol",
    );
    expect(stale.some((b) => b.name === "Murat Yelol")).toBe(false);

    const merged = mergeDefaultBookmarks(stale);
    expect(merged.some((b) => b.name === "Murat Yelol")).toBe(true);
    expect(merged.find((b) => b.name === "Murat Yelol")?.url).toBe(
      "https://www.muratyelol.com/",
    );
    // Preserves existing entries and order prefix
    expect(merged.slice(0, stale.length)).toEqual(stale);
  });

  it("does not duplicate Murat when already present (www vs bare)", () => {
    const saved = [
      { name: "Custom Murat", url: "https://www.muratyelol.com/" },
      { name: "TKM", url: "https://tkm.ahmetfuzunkaya.com/" },
    ];
    const merged = mergeDefaultBookmarks(saved);
    const murats = merged.filter((b) =>
      /muratyelol\.com/i.test(b.url),
    );
    expect(murats).toHaveLength(1);
    expect(murats[0].name).toBe("Custom Murat");
  });


  it("appends Ecrin Su Arıtma when stale localStorage omitted it", () => {
    const stale = DEFAULT_BROWSER_BOOKMARKS.filter(
      (b) => b.name !== "Ecrin Su Arıtma",
    );
    expect(stale.some((b) => b.name === "Ecrin Su Arıtma")).toBe(false);

    const merged = mergeDefaultBookmarks(stale);
    expect(merged.some((b) => b.name === "Ecrin Su Arıtma")).toBe(true);
    expect(merged.find((b) => b.name === "Ecrin Su Arıtma")?.url).toBe(
      "https://www.ecrinsuaritma.com/",
    );
    expect(merged.slice(0, stale.length)).toEqual(stale);
  });

  it("keeps Murat Yelol and Windows 11 OS alongside Ecrin", () => {
    const merged = mergeDefaultBookmarks([]);
    expect(merged.some((b) => b.name === "Murat Yelol")).toBe(true);
    expect(merged.some((b) => b.name === "Ecrin Su Arıtma")).toBe(true);
    expect(merged.some((b) => b.name === "Windows 11 OS")).toBe(true);
  });

  it("keeps user-added bookmarks while filling missing defaults", () => {
    const saved = [
      { name: "My Blog", url: "https://example.com/blog/" },
      { name: "React Shop", url: "https://mihrimatrix.github.io/react-shop/" },
    ];
    const merged = mergeDefaultBookmarks(saved);
    expect(merged[0].name).toBe("My Blog");
    expect(merged.some((b) => b.name === "Murat Yelol")).toBe(true);
    expect(merged.some((b) => b.name === "Windows 11 OS")).toBe(true);
    expect(
      merged.filter((b) => b.url.includes("react-shop")).length,
    ).toBe(1);
  });
  it("appends Element API, Spider, Rick and Film Review when stale storage omitted them", () => {
    const names = [
      "Element API",
      "Spider Solitaire",
      "Rick and Morty",
      "Film Review",
    ];
    const stale = DEFAULT_BROWSER_BOOKMARKS.filter((b) => !names.includes(b.name));
    for (const n of names) {
      expect(stale.some((b) => b.name === n)).toBe(false);
    }
    const merged = mergeDefaultBookmarks(stale);
    expect(merged.find((b) => b.name === "Element API")?.url).toBe(
      "https://element-api.ahmetfuzunkaya.com/",
    );
    expect(merged.find((b) => b.name === "Spider Solitaire")?.url).toBe(
      "https://mihrimatrix.github.io/react-spider-solitaire/",
    );
    expect(merged.find((b) => b.name === "Rick and Morty")?.url).toBe(
      "https://mihrimatrix.github.io/react-rick-and-morty/",
    );
    expect(merged.find((b) => b.name === "Film Review")?.url).toBe(
      "https://mihrimatrix.github.io/film-review-movie/",
    );
    expect(merged.some((b) => b.name === "Murat Yelol")).toBe(true);
    expect(merged.some((b) => b.name === "Ecrin Su Arıtma")).toBe(true);
    expect(merged.some((b) => b.name === "Windows 11 OS")).toBe(true);
  });

  it("appends Photon Engine (GitHub primary) when stale storage omitted it", () => {
    const stale = DEFAULT_BROWSER_BOOKMARKS.filter(
      (b) => b.name !== "Photon Engine",
    );
    expect(stale.some((b) => b.name === "Photon Engine")).toBe(false);
    const merged = mergeDefaultBookmarks(stale);
    expect(merged.find((b) => b.name === "Photon Engine")?.url).toBe(
      "https://github.com/MihrimatriX/photon-engine",
    );
    expect(merged.some((b) => b.name === "Film Review")).toBe(true);
  });

  it("keeps a removed default removed once it was seen, but still adds unseen defaults", () => {
    const tkm = "https://tkm.ahmetfuzunkaya.com/";
    const photon = "https://github.com/MihrimatriX/photon-engine";
    const saved = DEFAULT_BROWSER_BOOKMARKS.filter(
      (b) => b.url !== tkm && b.url !== photon,
    );
    const seen = new Set([tkm.replace(/\/$/, "").toLowerCase()]);
    const merged = mergeDefaultBookmarks(saved, seen);
    expect(merged.some((b) => b.url === tkm)).toBe(false);
    expect(merged.some((b) => b.url === photon)).toBe(true);
  });
});

describe("migrateLegacyUrl", () => {
  it("moves old subdomains to GitHub Pages and leaves others alone", () => {
    expect(migrateLegacyUrl("https://react-shop.ahmetfuzunkaya.com/")).toBe(
      "https://mihrimatrix.github.io/react-shop/",
    );
    expect(migrateLegacyUrl("https://rick-morty.ahmetfuzunkaya.com")).toBe(
      "https://mihrimatrix.github.io/react-rick-and-morty/",
    );
    expect(migrateLegacyUrl("https://tkm.ahmetfuzunkaya.com/")).toBe(
      "https://tkm.ahmetfuzunkaya.com/",
    );
    expect(migrateLegacyUrl("https://example.com/blog/")).toBe(
      "https://example.com/blog/",
    );
  });
});
