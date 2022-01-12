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
    version: "0-0-0-3",
    url: {
        landing: "",
        item: VIEW.item,
        profile: VIEW.profile,
        group: VIEW.group,
        resource: VIEW.resource
    },
    itemFolder: "/item",
    resourceFolder: "/resources",
    itemContentFileName: "/content.json"
};

//global app classes
const GLOBAL = {
    toggled: "toggled",
    pending: "pending",
    progress: "progress",
    item: "item",
    group: "group",
    loading: "loading",
    loaded: "loaded",
    error: "error",
    offline: "offline",
    disabled: "disabled",
    activeView: "active-view",
    dataNode: "data-node"
};

//website start url
const START_URL = (window.location.pathname + (window.location.pathname.substr(-1) == "/" ? "" : "/")).substring(1).split("/");

//local storage folders names
const LOCAL_STORAGE = {
    itemDownload: "downloaded_items",
    itemPending: "pending_items",
};

//shortcut for getElementById
const getById = (id) => document.getElementById(id);

//route class declaration
let RouteClass = function (source, target = source, isDefault = false) {
    return {
        source,
        target,
        isDefault
    }
}
//event sub controller declaration
let EventController = function (events = []) {
    this.addEventListener = (event, listener = function () { }) => events[event].push(listener);
    this.invokeEvent = async (event, arg) => await Promise.all(events[event].map((event) => event(...arg)));
}