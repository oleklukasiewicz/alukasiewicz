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
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const key = target.getAttribute("data-translate");
    const keys = key.split(".");
    let translation = locale;
    for (let j = 0; j < keys.length; j++) {
      translation = translation[keys[j]];
      if (!translation) break;
    }
    if (translation) {
      target.innerHTML = translation;
    } else {
      console.warn(`Translation not found for key: ${key}`);
    }
  }
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
