const storageGroups = () => [
  {
    id: "home",
    aliases: ["landing"],
    arg: {
      groupsOrder: ["featured", "organic-group", "architecture", "all"],
    },
  },
  {
    id: "featured",
    title: "Featured art",
    createDate: {
      day: 5,
      month: 11,
      year: 2021,
    },
    groups: ["home"],
    arg: {
      itemsOrder: ["temple", "orchid", "lily"],
    },
    locale: {
      "en-US": {
        title: "Featured projects",
      },
      "pl-PL": {
        title: "Wyróżnione prace",
      },
    },
  },
  {
    id: "organic-group",
    title: "Organic collection",
    groups: ["home"],
    arg: {
      itemsOrder: ["crocus", "lily", "tree"],
    },
    locale: {
      "en-US": {
        title: "Organic collection",
      },
      "pl-PL": {
        title: "Kolekcja organiczna",
      },
    },
  },
  {
    id: "architecture",
    title: "Architecture",
    groups: ["home"],
    locale: {
      "en-US": {
        title: "Architecture",
      },
      "pl-PL": {
        title: "Architektura",
      },
    },
  },
  {
    id: "all",
    aliases: ["work"],
    title: "All projects",
    groups: ["home"],
    isDefault: true,
    locale: {
      "en-US": {
        title: "All projects",
      },
      "pl-PL": {
        title: "Wszystkie projekty",
      },
    },
  },
  {
    id: "dungeons-builds",
    aliases: ["builds"],
    dev: true,
    title: "Minecraft Dungeons Builds",
    locale: {
      "en-US": {
        title: "Minecraft Dungeons Builds",
      },
      "pl-PL": {
        title: "Budowle Minecraft Dungeons",
      },
    },
  },
  {
    id: "projects",
    dev: true,
    title: "Projects",
    groups: ["home"],
    arg: {
      itemsOrder: ["fluent-pad", "ancient-temple", "fluent-design-system"],
    },
    locale: {
      "en-US": {
        title: "Projects",
      },
      "pl-PL": {
        title: "Projekty",
      },
    },
  },
];
const storageItems = () => [
  {
    id: "ancient-temple",
    aliases: ["temple"],
    folder: "/temple",
    isLink: "https://www.instagram.com/p/DAOHMGxIv6j/",
    title: "Old Times",
    tile: {
      image: "/temple-alt.webp",
      content:
        "Ancient temple at sunset, surrounded by nature. Classic architecture combining simplicity and elegance.",
    },
    groups: ["featured", "architecture"],
    createDate: {
      day: 22,
      month: 9,
      year: 2024,
    },
    locale: {
      "en-US": {
        title: "Ancient Temple",
        content:
          "Ancient temple at sunset, surrounded by nature. Classic architecture combining simplicity and elegance.",
      },
      "pl-PL": {
        title: "Starożytna Świątynia",
        content:
          "Starożytna świątynia o zachodzie słońca, otoczona naturą. Klasyczna architektura łącząca prostotę i elegancję.",
      },
    },
  },
  {
    id: "adventure",
    folder: "/adventure",
    isLink: "https://www.instagram.com/p/CCmAJKGBWeb/",
    title: "Let the journey begin",
    tile: {
      content: "Don't wait for the adventure's start - begin it by yourself!",
      image: "/adventure.webp",
    },
    createDate: {
      day: 13,
      month: 7,
      year: 2020,
    },
    locale: {
      "en-US": {
        title: "Adventure Begins",
        content: "Don't wait for the adventure's start - begin it by yourself!",
      },
      "pl-PL": {
        title: "Przygoda się zaczyna",
        content: "Nie czekaj na początek przygody - zacznij ją samodzielnie!",
      },
    },
  },
  {
    id: "airship",
    folder: "/airship",
    isLink: "https://www.instagram.com/p/CMXFzXihSGw/",
    title: "Ocean of Clouds",
    tile: {
      content:
        "The great adventure does not have to take place at sea. Now with new frame and improved clouds!",
      image: "/airship-v2.webp",
    },
    createDate: {
      day: 27,
      month: 10,
      year: 2020,
    },
    modifyDate: {
      day: 13,
      month: 3,
      year: 2021,
    },
    locale: {
      "en-US": {
        title: "Airship Adventure",
        content:
          "The great adventure does not have to take place at sea. Now with new frame and improved clouds!",
      },
      "pl-PL": {
        title: "Przygoda na statku powietrznym",
        content:
          "Wielka przygoda nie musi odbywać się na morzu. Teraz z nową ramką i ulepszonymi chmurami!",
      },
    },
  },
  {
    id: "crocus",
    folder: "/crocus",
    isLink: "https://www.instagram.com/p/CdqCxFOq1fh/",
    title: "The Crocus",
    tile: {
      content:
        "One of the first signs of spring - crocus, also know as the source of one of the most expensive spice.",
      image: "/crocus-base.webp",
    },
    groups: ["featured", "organic-group"],
    createDate: {
      day: 17,
      month: 5,
      year: 2022,
    },
    locale: {
      "en-US": {
        title: "Crocus",
        content:
          "One of the first signs of spring - crocus, also known as the source of one of the most expensive spices.",
      },
      "pl-PL": {
        title: "Krokus",
        content:
          "Jeden z pierwszych znaków wiosny - krokus, znany również jako źródło jednego z najdroższych przypraw.",
      },
    },
  },
  {
    id: "isometric-castle",
    folder: "/isometric",
    isLink: "https://www.instagram.com/p/CLEOiDiBDey/",
    title: "Procedural World",
    tile: {
      content:
        "The world is full of patterns. Here it is represented as a set of tiles.",
      image: "/isometric_castle.webp",
    },
    groups: ["featured", "architecture"],
    createDate: {
      day: 9,
      month: 2,
      year: 2021,
    },
    locale: {
      "en-US": {
        title: "Isometric Castle",
        content:
          "The world is full of patterns. Here it is represented as a set of tiles.",
      },
      "pl-PL": {
        title: "Izometryczny Zamek",
        content:
          "Świat jest pełen wzorów. Tutaj jest przedstawiony jako zestaw kafelków.",
      },
    },
  },
  {
    id: "lighthouse",
    folder: "/lighthouse",
    isLink: "https://www.instagram.com/p/CcIPscSKKyE/",
    title: "Lighthouse",
    tile: {
      content: "Alone lighthouse on the night sea with a sky full of stars.",
      image: "/lighthouse.webp",
    },
    groups: ["featured", "architecture"],
    createDate: {
      day: 16,
      month: 3,
      year: 2022,
    },
    locale: {
      "en-US": {
        title: "Lighthouse",
        content: "Alone lighthouse on the night sea with a sky full of stars.",
      },
      "pl-PL": {
        title: "Latarnia Morska",
        content:
          "Samotna latarnia morska na nocnym morzu z niebem pełnym gwiazd.",
      },
    },
  },
  {
    id: "lily",
    folder: "/lily",
    isLink: "https://www.instagram.com/p/CXlcDShooxu/",
    title: "Water Lily",
    tile: {
      content:
        "Mandatory element in almost every organic picture of river or lake.",
      image: "/lily-blank.webp",
    },
    groups: ["featured", "organic-group"],
    createDate: {
      day: 10,
      month: 12,
      year: 2021,
    },
    locale: {
      "en-US": {
        title: "Water Lily",
        content:
          "Mandatory element in almost every organic picture of river or lake.",
      },
      "pl-PL": {
        title: "Lilia Wodna",
        content:
          "Obowiązkowy element w prawie każdym organicznym obrazie rzeki lub jeziora.",
      },
    },
  },
  {
    id: "orchid",
    folder: "/orchid",
    isLink: "https://www.instagram.com/p/Cd3DiBBqvOR/",
    title: "The Orchid",
    tile: {
      content:
        "A flower considered a symbol of beauty and love that grows on trees or between rocks rather than directly in the ground.",
      image: "/orchid.webp",
    },
    groups: ["featured", "organic-group"],
    createDate: {
      day: 22,
      month: 5,
      year: 2022,
    },
    locale: {
      "en-US": {
        title: "Orchid",
        content:
          "A flower considered a symbol of beauty and love that grows on trees or between rocks rather than directly in the ground.",
      },
      "pl-PL": {
        title: "Orchidea",
        content:
          "Kwiat uważany za symbol piękna i miłości, który rośnie na drzewach lub między skałami, a nie bezpośrednio w ziemi.",
      },
    },
  },
  {
    id: "person-practise",
    folder: "/person",
    isLink: "https://www.instagram.com/p/COAYwduB3jc/",
    title: "Character practise",
    tile: {
      content:
        "The first result of learning to draw pixel characters. Based on tutorial by Slynyrd.",
      image: "/person_practise.webp",
    },
    createDate: {
      day: 23,
      month: 4,
      year: 2021,
    },
    locale: {
      "en-US": {
        title: "Character Practise",
        content:
          "The first result of learning to draw pixel characters. Based on tutorial by Slynyrd.",
      },
      "pl-PL": {
        title: "Praktyka postaci",
        content:
          "Pierwszy rezultat nauki rysowania postaci pikselowych. Oparty na samouczku Slynyrd.",
      },
    },
  },
  {
    id: "rose",
    folder: "/rose",
    isLink: "https://www.instagram.com/p/CMZkmJaBhd1/",
    title: "The digital blossom",
    tile: {
      content:
        "A simple red rose. Slightly improved with new colours and details.",
      image: "/rose_plant.webp",
    },
    groups: ["organic-group"],
    createDate: {
      day: 9,
      month: 12,
      year: 2020,
    },
    modifyDate: {
      day: 14,
      month: 3,
      year: 2021,
    },
    locale: {
      "en-US": {
        title: "Rose",
        content:
          "A simple red rose. Slightly improved with new colours and details.",
      },
      "pl-PL": {
        title: "Róża",
        content:
          "Prosta czerwona róża. Nieco ulepszona o nowe kolory i detale.",
      },
    },
  },
  {
    id: "tree",
    folder: "/tree-on-rock",
    isLink: "https://www.instagram.com/p/CPSx-X8hdVM/",
    title: "Organic pixels",
    tile: {
      content:
        "One of the most iconic plants on the planet - a tree! Here growing on a giant rock.",
      image: "/tree-on-rock.webp",
    },
    groups: ["featured", "organic-group"],
    createDate: {
      day: 23,
      month: 5,
      year: 2021,
    },
    locale: {
      "en-US": {
        title: "Tree on Rock",
        content:
          "One of the most iconic plants on the planet - a tree! Here growing on a giant rock.",
      },
      "pl-PL": {
        title: "Drzewo na Skale",
        content:
          "Jedna z najbardziej ikonicznych roślin na planecie - drzewo! Tutaj rośnie na gigantycznej skale.",
      },
    },
  },
  {
    id: "fluent-design-system",
    folder: "/beta",
    dev: true,
    title: "Fluent Design System",
    tile: {
      image: "/fluent.webp",
      content:
        "Reflections on our design history, the progression, and the potential of how we collectively design for the future.",
    },
    createDate: {
      day: 27,
      month: 10,
      year: 2020,
    },
    modifyDate: {
      day: 23,
      month: 5,
      year: 2022,
    },
    groups: ["projects"],
    locale: {
      "en-US": {
        title: "Fluent Design System",
        content:
          "Reflections on our design history, the progression, and the potential of how we collectively design for the future.",
      },
      "pl-PL": {
        title: "Fluent Design System",
        content:
          "Refleksje nad naszą historią projektowania, postępem i potencjałem tego, jak wspólnie projektujemy przyszłość.",
      },
    },
  },
  {
    id: "sparkler-build",
    dev: true,
    folder: "/sparkler",
    format: "md",
    title: "The Sparkler",
    tile: {
      image: "/sparkler.webp",
      content:
        "Healing and damage focused build for Minecraft Dungeons made in spooky theme.",
    },
    createDate: {
      day: 21,
      month: 10,
      year: 2022,
    },
    groups: ["builds"],
    locale: {
      "en-US": {
        title: "The Sparkler",
        content:
          "Healing and damage focused build for Minecraft Dungeons made in spooky theme.",
      },
      "pl-PL": {
        title: "Iskierka",
        content:
          "Budowa skoncentrowana na leczeniu i obrażeniach w Minecraft Dungeons, wykonana w mrocznym motywie.",
      },
    },
  },
  {
    id: "fluent-pad",
    dev: true,
    folder: "/fluent-pad",
    title: "Fluent pad",
    isLink: "https://fluent-pad.vercel.app",
    tile: {
      image: "/vite-js-logo.webp",
      content:
        "A simple notepad app with git-like version control system. Made with Svelte, Fluent-Svelte and Firebase.",
    },
    createDate: {
      day: 7,
      month: 8,
      year: 2023,
    },
    groups: ["projects"],
    locale: {
      "en-US": {
        title: "Fluent Pad",
        content:
          "A simple notepad app with git-like version control system. Made with Svelte, Fluent-Svelte and Firebase.",
      },
      "pl-PL": {
        title: "Fluent Pad",
        content:
          "Prosta aplikacja notatnika z systemem kontroli wersji podobnym do gita. Wykonana w Svelte, Fluent-Svelte i Firebase.",
      },
    },
  },
  {
    id: "minerobe",
    dev: true,
    folder: "/minerobe",
    title: "Minerobe",
    isLink: "https://minerobe.alukasiewicz.online",
    tile: {
      image: "/minerobe.webp",
      content:
        "Digital wardrobe for your Minecraft skin. Create your own outfits and use them in the game.",
    },
    createDate: {
      day: 7,
      month: 8,
      year: 2022,
    },
    groups: ["projects"],
    locale: {
      "en-US": {
        title: "Minerobe",
        content:
          "Digital wardrobe for your Minecraft skin. Create your own outfits and use them in the game.",
      },
      "pl-PL": {
        title: "Minerobe",
        content:
          "Cyfrowa garderoba dla twojej skórki Minecraft. Twórz własne stroje i używaj ich w grze.",
      },
    },
  },
];
