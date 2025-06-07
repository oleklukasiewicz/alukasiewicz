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
  //load from cache
  if (LOCALE_CACHE.length > 0) {
    for (const item of LOCALE_CACHE) {
      var value = GetCurrentTranslationFromLocale(item.value);
      if (value) {
        AddTranslation(item.key, value);
      }
    }
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
  const translation = GetTranslation(path, LOCALE);
  if (translation) {
    //check if tranlation is array
    if (Array.isArray(translation)) {
      //replace text subnodes with translation
      const chilkdNodes = node.childNodes;
      if (chilkdNodes.length > 0) {
        let localeIndex = 0;
        chilkdNodes.forEach((childNode, index) => {
          //check if childNode is text node
          if (childNode.nodeType === Node.TEXT_NODE) {
            //replace text node with translation
            if (translation[localeIndex]) {
              childNode.textContent = translation[localeIndex];

              localeIndex++;
            }
          }
        });
      }
    } else {
      node.innerText = translation;
    }
    //add custom data attribute for the translation
  }
  node.setAttribute("data-translate", path);
};
const TranslateTitleNode = async function (node, path) {
  if (!node || !path) {
    console.error("Node or path not provided for title translation");
    return;
  }
  const translation = GetTranslation(path, LOCALE);
  if (translation) {
    node.setAttribute("title", translation);
    //add custom data attribute for the title translation
  }
  node.setAttribute("data-translate-title", path);
};
const AddTranslation = function (key, value) {
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
};
const AddTranslationWithCache = async function (key, value) {
  //check if existing translation is in cache
  const existing = LOCALE_CACHE.find((item) => item.key === key);
  if (existing) return existing.value;
  //if not, add to cache and to locale
  LOCALE_CACHE.push({ key, value });
  AddTranslation(key, GetCurrentTranslationFromLocale(value));
};
const GetTranslation = function (key, locale = LOCALE) {
  if (!LOCALE) {
    console.error("Locale not loaded, cannot get translation");
    return;
  }
  const keys = key.split(".");
  let translation = locale || LOCALE;
  for (let i = 0; i < keys.length; i++) {
    translation = translation[keys[i]];
    if (!translation) break;
  }
  if (translation) {
    return translation;
  }
  return null;
};
const GetCurrentTranslationFromLocale = function (locale) {
  if (!locale) {
    return;
  }
  locale[LOCALE.lang] = locale[LOCALE.lang] || locale["en-US"];
  const currentTranslation = locale[LOCALE.lang];
  if (!currentTranslation) {
    return;
  }
  return currentTranslation;
};
const FetchLocale = async function (lang) {
  if (!lang) {
    console.error("Language not provided for fetching locale");
    return;
  }
  const localeUrl = `/locales/${lang}.json`;
  try {
    const response = await fetch(localeUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    let data = {};
    try {
      data = await response.json();
    } catch (jsonError) {
      return;
    }
    return data;
  } catch (error) {
    console.error("Error fetching locale file:", error);
  }
};
let LANG =
  navigator.browserLanguage ||
  navigator.language ||
  navigator.userLanguage ||
  "en-US";
if (LANG != "en-US" && LANG != "pl-PL") {
  LANG = "en-US";
}
//fetch locale file
let LOCALE_CACHE = [];
let LOCALE = {};
FetchLocale(LANG).then(async (data) => {
  Object.assign(LOCALE, data);
  //check if dom is ready and stop rendering before transltion si scompelted
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => {
      await Translate(LOCALE);
    });
  } else {
    await Translate(LOCALE);
  }
});
