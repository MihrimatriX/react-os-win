import { describe, expect, it } from "vitest";
import {
  collectProjectCards,
  hostLabel,
  PROJECT_GITHUB_PRIMARY,
} from "./projectsCatalog";

describe("collectProjectCards", () => {
  it("merges bookmarks and desktop shortcuts without URL duplicates", () => {
    const cards = collectProjectCards(
      [
        { name: "React Shop", url: "https://mihrimatrix.github.io/react-shop/" },
        { name: "TKM", url: "https://tkm.ahmetfuzunkaya.com/" },
      ],
      [
        {
          name: "React Shop Desktop",
          type: "shortcut",
          url: "https://mihrimatrix.github.io/react-shop/",
        },
        {
          name: "Vid Report",
          type: "shortcut",
          url: "https://vid-report.ahmetfuzunkaya.com/",
        },
        { name: "Notepad", type: "app" },
      ],
    );

    expect(cards.map((c) => c.name).sort()).toEqual(
      ["React Shop", "TKM", "Vid Report"].sort(),
    );
    expect(cards.find((c) => c.name === "React Shop")?.source).toBe("bookmark");
    expect(cards.find((c) => c.name === "Vid Report")?.source).toBe("desktop");
  });

  it("attaches known GitHub and preview assets for AFU hosts", () => {
    const cards = collectProjectCards(
      [
        { name: "React Shop", url: "https://mihrimatrix.github.io/react-shop/" },
        {
          name: "Easy Pomodoro",
          url: "https://mihrimatrix.github.io/easy-pomodoro/",
        },
      ],
      [],
    );
    const shop = cards.find((c) => c.name === "React Shop");
    expect(shop?.githubUrl).toBe(
      "https://github.com/MihrimatriX/react-shop",
    );
    expect(shop?.preview).toContain("shot-react-shop.png");
    expect(shop?.previewFallback).toContain("preview-react-shop.svg");
    expect(
      cards.find((c) => c.name === "Easy Pomodoro")?.githubUrl,
    ).toContain("MihrimatriX/easy-pomodoro");
  });

  it("adds freelance Murat Yelol with preview and without GitHub", () => {
    const cards = collectProjectCards(
      [{ name: "Murat Yelol", url: "https://www.muratyelol.com/" }],
      [],
    );
    const card = cards.find((c) => c.name === "Murat Yelol");
    expect(card).toBeTruthy();
    expect(card?.githubUrl).toBeUndefined();
    expect(card?.preview).toContain("shot-muratyelol.png");
    expect(card?.previewFallback).toContain("preview-muratyelol.svg");
    expect(card?.icon).toContain("muratyelol.svg");
  });

  it("adds Windows 11 OS with live demo, GitHub and shot preview", () => {
    const cards = collectProjectCards(
      [
        {
          name: "Windows 11 OS",
          url: "https://win11-react.ahmetfuzunkaya.com/",
        },
      ],
      [],
    );
    const card = cards.find((c) => c.name === "Windows 11 OS");
    expect(card).toBeTruthy();
    expect(card?.githubUrl).toBe(
      "https://github.com/MihrimatriX/react-os-win",
    );
    expect(card?.preview).toContain("shot-react-os-win.png");
    expect(card?.previewFallback).toContain("preview-react-os-win.svg");
    expect(card?.icon).toContain("react-os-win.svg");
  });


  it("adds freelance Ecrin Su Arıtma with preview and without GitHub", () => {
    const cards = collectProjectCards(
      [{ name: "Ecrin Su Arıtma", url: "https://www.ecrinsuaritma.com/" }],
      [],
    );
    const card = cards.find((c) => c.name === "Ecrin Su Arıtma");
    expect(card).toBeTruthy();
    expect(card?.githubUrl).toBeUndefined();
    expect(card?.preview).toContain("shot-ecrinsuaritma.png");
    expect(card?.previewFallback).toContain("preview-ecrinsuaritma.svg");
    expect(card?.icon).toContain("ecrinsuaritma.svg");
  });

  it("keeps Murat Yelol, Ecrin and Windows 11 OS together", () => {
    const cards = collectProjectCards(
      [
        { name: "Murat Yelol", url: "https://www.muratyelol.com/" },
        { name: "Ecrin Su Arıtma", url: "https://www.ecrinsuaritma.com/" },
        {
          name: "Windows 11 OS",
          url: "https://win11-react.ahmetfuzunkaya.com/",
        },
      ],
      [],
    );
    expect(cards.map((c) => c.name).sort()).toEqual(
      ["Ecrin Su Arıtma", "Murat Yelol", "Windows 11 OS"].sort(),
    );
    expect(cards.find((c) => c.name === "Ecrin Su Arıtma")?.githubUrl).toBeUndefined();
    expect(cards.find((c) => c.name === "Murat Yelol")?.githubUrl).toBeUndefined();
  });

  it("keeps Murat Yelol when Windows 11 OS is also present", () => {
    const cards = collectProjectCards(
      [
        { name: "Murat Yelol", url: "https://www.muratyelol.com/" },
        {
          name: "Windows 11 OS",
          url: "https://win11-react.ahmetfuzunkaya.com/",
        },
      ],
      [],
    );
    expect(cards.map((c) => c.name).sort()).toEqual(
      ["Murat Yelol", "Windows 11 OS"].sort(),
    );
    expect(cards.find((c) => c.name === "Murat Yelol")?.githubUrl).toBeUndefined();
  });
  it("adds Element API, Spider Solitaire, Rick and Morty and Film Review with GitHub + shots", () => {
    const cards = collectProjectCards(
      [
        { name: "Element API", url: "https://element-api.ahmetfuzunkaya.com/" },
        {
          name: "Spider Solitaire",
          url: "https://mihrimatrix.github.io/react-spider-solitaire/",
        },
        { name: "Rick and Morty", url: "https://mihrimatrix.github.io/react-rick-and-morty/" },
        { name: "Film Review", url: "https://mihrimatrix.github.io/film-review-movie/" },
      ],
      [],
    );
    const element = cards.find((c) => c.name === "Element API");
    expect(element?.githubUrl).toBe(
      "https://github.com/MihrimatriX/element-api",
    );
    expect(element?.preview).toContain("shot-element-api.png");
    expect(element?.previewFallback).toContain("preview-element-api.svg");
    expect(element?.icon).toContain("element-api.svg");

    const spider = cards.find((c) => c.name === "Spider Solitaire");
    expect(spider?.githubUrl).toContain("react-spider-solitaire");
    expect(spider?.preview).toContain("shot-spider-solitaire.png");
    expect(spider?.icon).toContain("spider-solitaire.svg");

    const rick = cards.find((c) => c.name === "Rick and Morty");
    expect(rick?.githubUrl).toContain("react-rick-and-morty");
    expect(rick?.preview).toContain("shot-rick-morty.png");
    expect(rick?.icon).toContain("rick-morty.svg");

    const film = cards.find((c) => c.name === "Film Review");
    expect(film?.githubUrl).toContain("film-review-movie");
    expect(film?.preview).toContain("shot-filmrev-movie.png");
    expect(film?.icon).toContain("filmrev-movie.svg");
  });

  it("keeps Murat, Ecrin, Win11 and the four new AFU projects together", () => {
    const cards = collectProjectCards(
      [
        { name: "Murat Yelol", url: "https://www.muratyelol.com/" },
        { name: "Ecrin Su Arıtma", url: "https://www.ecrinsuaritma.com/" },
        {
          name: "Windows 11 OS",
          url: "https://win11-react.ahmetfuzunkaya.com/",
        },
        { name: "Element API", url: "https://element-api.ahmetfuzunkaya.com/" },
        {
          name: "Spider Solitaire",
          url: "https://mihrimatrix.github.io/react-spider-solitaire/",
        },
        { name: "Rick and Morty", url: "https://mihrimatrix.github.io/react-rick-and-morty/" },
        { name: "Film Review", url: "https://mihrimatrix.github.io/film-review-movie/" },
      ],
      [],
    );
    expect(cards.map((c) => c.name).sort()).toEqual(
      [
        "Ecrin Su Arıtma",
        "Element API",
        "Film Review",
        "Murat Yelol",
        "Rick and Morty",
        "Spider Solitaire",
        "Windows 11 OS",
      ].sort(),
    );
  });

  it("adds Photon Engine as GitHub-primary with special photon effect", () => {
    const cards = collectProjectCards(
      [
        {
          name: "Photon Engine",
          url: "https://github.com/MihrimatriX/photon-engine",
        },
      ],
      [],
    );
    const card = cards.find((c) => c.name === "Photon Engine");
    expect(card).toBeTruthy();
    expect(card?.url).toContain("github.com/MihrimatriX/photon-engine");
    expect(card?.githubUrl).toBe(
      PROJECT_GITHUB_PRIMARY["mihrimatrix/photon-engine"].githubUrl,
    );
    expect(card?.preview).toContain("shot-photon-engine.png");
    expect(card?.previewFallback).toContain("preview-photon-engine.svg");
    expect(card?.icon).toContain("photon-engine.svg");
    expect(card?.specialEffect).toBe("photon");
  });

});

describe("GitHub Pages projects", () => {
  it("derives repo, distinct icon and path label from *.github.io URLs", () => {
    const cards = collectProjectCards(
      [
        { name: "Windows XP", url: "https://mihrimatrix.github.io/xp-clone-react/" },
        { name: "Temp Shop", url: "https://mihrimatrix.github.io/Temp-Shop/" },
      ],
      [],
    );
    const xp = cards.find((c) => c.name === "Windows XP");
    const shop = cards.find((c) => c.name === "Temp Shop");
    expect(xp?.githubUrl).toBe("https://github.com/MihrimatriX/xp-clone-react");
    expect(shop?.githubUrl).toBe("https://github.com/MihrimatriX/Temp-Shop");
    expect(xp?.icon).toBe("/icons/projects/xp-clone-react.svg");
    expect(shop?.icon).toBe("/icons/projects/temp-shop.ico");
    expect(hostLabel(xp!.url)).toBe("mihrimatrix.github.io/xp-clone-react");
  });
});
