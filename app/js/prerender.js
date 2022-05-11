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
    toggled: "toggled",
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

//shortcut for getElementById
const getById = (id) => document.getElementById(id);

//route class declaration
let Route = function (source, target = source, isDefault = false) {
    return {
        source,
        target,
        isDefault
    }
}
//event sub controller declaration
let EventController = function (eventsList = []) {
    let _events = {}
    eventsList.forEach((eventName) => _events[eventName] = []);
    this.addEventListener = (event, listener = function () { }) => _events[event].push(listener);
    this.invokeEvent = async (event, arg) => await Promise.all(_events[event].map((event) => event(...arg)));
}