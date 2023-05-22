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
    startUrl: (window.location.pathname + (window.location.pathname.substr(-1) == "/" ? "" : "/")).substring(1).split("/")
};

//global views ids
const VIEW = {
    landing: "landing",
    item: "item",
    profile: "about",
    group: "group",
    resource: "resource"
};

//global item variables
const ITEM =
{
    folder: "/item",
    resourceFolder: "/resources",
    fileName: "content.json"
}

//global css/app classes
const GLOBAL = {
    item: "item",
    group: "group",
    loading: "loading",
    loaded: "loaded",
    hidden: "hidden",
    hiddenOpacity:"hidden-opacity",
    error: "error",
    disabled: "disabled",
    activeView: "active-view",
    dataNode: "data-node"
};

const DEVELOPMENT = false;