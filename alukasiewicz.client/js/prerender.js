//global app variables
const APP = {
  name: "Olek Łukasiewicz",
  version: "2.2.1.0",
  route: {
    landing: {
      url: "",
      viewId: "landing",
      isDefault: true,
      rootNodeId: "landing",
    },
    item: {
      url: "posts",
      viewId: "item",
      rootNodeId: "item",
    },
    profile: {
      url: "about",
      viewId: "about",
      rootNodeId: "about",
    },
    group: {
      url: "group",
      viewId: "group",
      rootNodeId: "group",
    },
    resource: {
      url: "image",
      viewId: "resource",
      rootNodeId: "resource",
    },
  },
  startUrl: (
    window.location.pathname +
    (window.location.pathname.substr(-1) == "/" ? "" : "/")
  )
    .substring(1)
    .split("/"),
};

//global item variables
const ITEM = {
  folder: "/item",
  resourceFolder: "/resources",
  fileName: "content.json",
  fileNameMd: "content.md",
};

//global css/app classes
const GLOBAL = {
  item: "item",
  group: "group",
  loading: "loading",
  loaded: "loaded",
  hidden: "hidden",
  hiddenOpacity: "hidden-opacity",
  error: "error",
  disabled: "disabled",
  activeView: "active-view",
  dataNode: "data-node",
  reveal: "reveal",
};

const DEVELOPMENT =
  !window.location.hostname.includes(".online") ||
  window.location.hostname.includes("127.0.0.1") ||
  window.location.hostname.includes("dev");

const Translate = async function (locale) {
  if (!locale) {
    console.error("Locale not found");
    return;
  }
  const targets = document.querySelectorAll("[data-translate]");
  for (const target of targets) {
    const path = target.getAttribute("data-translate");
    if (path) {
      await TranslateNode(target, path);
    } else {
      console.warn("No translation path found for node:", target);
    }
  }
  const titleTargets = document.querySelectorAll("[data-translate-title]");
  for (const target of titleTargets) {
    const path = target.getAttribute("data-translate-title");
    if (path) {
      await TranslateTitleNode(target, path);
    } else {
      console.warn("No title translation path found for node:", target);
    }
  }
};
const TranslateNode = async function (node, path) {
  if (!node || !path) {
    console.error("Node or path not provided for translation");
    return;
  }
  const keys = path.split(".");
  let translation = LOCALE;
  for (let i = 0; i < keys.length; i++) {
    translation = translation[keys[i]];
    if (!translation) break;
  }
  if (translation) {
    node.innerText = translation;
  } else {
    console.warn(`Translation not found for path: ${path}`);
  }
};
const TranslateTitleNode = async function (node, path) {
  if (!node || !path) {
    console.error("Node or path not provided for title translation");
    return;
  }
  const keys = path.split(".");
  let translation = LOCALE;
  for (let i = 0; i < keys.length; i++) {
    translation = translation[keys[i]];
    if (!translation) break;
  }
  if (translation) {
    node.setAttribute("title", translation);
  } else {
    console.warn(`Title translation not found for path: ${path}`);
  }
};
const AddTranslation = async function (key, value) {
  if (!LOCALE) {
    console.error("Locale not loaded, cannot add translation");
    return;
  }
  const keys = key.split(".");
  let current = LOCALE;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  console.log(`Added translation: ${key} -> ${value}`);
};
const GetCurrentTranslationFromLocale = async function (locale) {
  if (!locale) {
    return;
  }
  locale[LANG] = locale[LANG] || locale["en-US"];
  const currentTranslation = locale[LANG];
  if (!currentTranslation) {
    console.error(`No translation found for language: ${LANG}`);
    return;
  }
  return currentTranslation;
};
const LANG =
  navigator.browserLanguage ||
  navigator.language ||
  navigator.userLanguage ||
  "en-US";
//fetch locale file
const LOCALE = {};
const LOCALE_URL = `locales/${LANG}.json`;
fetch(LOCALE_URL)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then(async (data) => {
    Object.assign(LOCALE, data);

    //check if dom is ready and stop rendering before transltion si scompelted
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", async () => {
        await Translate(LOCALE);
      });
    } else {
      await Translate(LOCALE);
    }
  })
  .catch((error) => {
    console.error("Error fetching locale file:", error);
  });
