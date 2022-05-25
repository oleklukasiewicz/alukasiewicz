//global views ids
const VIEW = {
    landing: "landing",
    item: "item",
    profile: "about",
    group: "group",
    resource: "resource"
};

//global app variables
const APP = {
    name: "Olek Łukasiewicz",
    version: "2.2.1.0",
    url: {
        landing: "",
        item: "posts",
        profile: "about",
        group: "group",
        resource: "image"
    },
    itemFolder: "/item",
    resourceFolder: "/resources",
    itemContentFileName: "/content.json"
};

//global app classes
const GLOBAL = {
    item: "item",
    group: "group",
    loading: "loading",
    hidden: "hidden",
    loaded: "loaded",
    error: "error",
    disabled: "disabled",
    activeView: "active-view",
    dataNode: "data-node"
};

//website start url
const START_URL = (window.location.pathname + (window.location.pathname.substr(-1) == "/" ? "" : "/")).substring(1).split("/");