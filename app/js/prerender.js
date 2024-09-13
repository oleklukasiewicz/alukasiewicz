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
