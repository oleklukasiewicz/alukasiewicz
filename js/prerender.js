const VIEW = {
    landing: "landing",
    item: "item",
    profile: "about",
    group: "group",
};
const APP = {
    name: "Aleksander Łukasiewicz",
    version: "0-0-0-3",
    url: {
        landing: "/",
        item: "/" + VIEW.item + "/",
        profile: "/" + VIEW.profile + "/",
        group: "/" + VIEW.group + "/",
    },
    itemFolder: "/item",
    resourceFolder:"/resources",
    date: (date, months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]) => (date.day + "&nbsp;" + months[date.month - 1] + ",&nbsp;" + date.year)
};
const GLOBAL = {
    toggled: "toggled",
    loading: "loading",
    loaded: "loaded",
    error: "error",
    offline: "offline",
    disabled: "disabled",
    activeView: "active-view",
    dataNode: "data-node",
    hidden: "hidden"
};
const START_URL = (window.location.pathname + (window.location.pathname.substr(-1) == "/" ? "" : "/")).substring(1).split("/");
const STORAGE = {
    itemDownload: "downloaded_items",
    theme: "dark_theme_selected"
};
const ERROR_CODE = {
    itemsNotLoaded: "ITEMS_NOT_LOADED",
    groupNotFound: "GROUP_NOT_FOUND",
    itemNotFound: "ITEM_NOT_FOUND",
    outdatedItems: "OUTDATED_ITEMS",
    undefinedError: "UNDEFINED_ERROR",
    noItemsInGroup: "NO_ITEMS_IN_GROUP",
}
const ISDARKTHEME = (window.localStorage[STORAGE.theme]) ? (window.localStorage[STORAGE.theme] == "true") : (new Date().getHours() > 17 || new Date().getHours() < 8);
const getById = (id) => document.getElementById(id);
let CSSVariable = function (prop, v) {
    return {
        prop,
        v
    }
}
let RouteClass = function (source, target = source, isDefault = false) {
    return {
        source,
        target,
        isDefault
    }
}
let Theme = function (themeColor, prop = [], isDark = false) {
    return {
        themeColor,
        prop,
        isDark
    }
};
let accentTheme = [
    new CSSVariable("--color-font-disabled", "#aaaaaa"),
    new CSSVariable("--color-accent", "#456789"),
    new CSSVariable("--color-font-accent", "#FFFFFF"),
    new CSSVariable("--color-accent-light-A1", "rgba(83, 124, 164, 1)"),
    new CSSVariable("--color-accent-light-A2", "rgba(100, 149, 197, 1)"),
    new CSSVariable("--color-accent-light-A3", "rgba(120, 179, 236, 1)"),
    new CSSVariable("--color-accent-shadow", "rgba(69, 103, 137, 0.7)"),
    new CSSVariable("--color-accent-shadow-A1", "rgba(69, 103, 137, 0.8)"),
    new CSSVariable("--color-accent-shadow-A2", "rgba(69, 103, 137, 0.9)")
];
let darkTheme = new Theme("#222222", accentTheme.concat([
    new CSSVariable("--color-theme", "#222222"),
    new CSSVariable("--color-font", "#e5e5e5"),
    new CSSVariable("--color-theme-A1", "#2d2d2d"),
    new CSSVariable("--color-theme-A2", "#3a3a3a"),
    new CSSVariable("--color-theme-A3", "#4a4a4a"),
    new CSSVariable("--color-theme-A4", "#6a6a6a"),
    new CSSVariable("--color-theme-A5", "#8a8a8a"),
    new CSSVariable("--color-theme-A6", "#afafaf"),
    new CSSVariable("--color-theme-hover", "rgba(250,250,250,0.1)"),
    new CSSVariable("--color-theme-active", "rgba(250,250,250,0.2)"),
    new CSSVariable("--color-theme-acrylic", "rgba(34,34,34,0.75)"),
    new CSSVariable("--color-logo-A1", "#a0a0a0"),
    new CSSVariable("--color-logo", "#d0d0d0"),
    new CSSVariable("--profile-image-src", "url(/img/profile-dark.webp)")
]), true);
let lightTheme = new Theme("#fbfbfb", accentTheme.concat([
    new CSSVariable("--color-theme", "#fbfbfb"),
    new CSSVariable("--color-font", "#4f4f4f"),
    new CSSVariable("--color-theme-A1", "#F1f1f1"),
    new CSSVariable("--color-theme-A2", "#E8E8E8"),
    new CSSVariable("--color-theme-A3", "#D8D8D8"),
    new CSSVariable("--color-theme-A4", "#c8c8c8"),
    new CSSVariable("--color-theme-A5", "#a8a8a8"),
    new CSSVariable("--color-theme-A6", "#606060"),
    new CSSVariable("--color-theme-hover", "rgba(60,60,60,0.1)"),
    new CSSVariable("--color-theme-active", "rgba(60,60,60,0.2)"),
    new CSSVariable("--color-theme-acrylic", "rgba(250,250,250,0.60)"),
    new CSSVariable("--color-logo-A1", "#404040"),
    new CSSVariable("--color-logo", "#5f5f5f"),
    new CSSVariable("--profile-image-src", "url(/img/profile.webp)")
]), false);
let EventController = function (events = []) {
    this.addEventListener = (event, listener = function () { }) => events[event].push(listener);
    this.invokeEvent = async (event, arg) => await Promise.all(events[event].map((event) => event(...arg)));
}
let ThemeController = (function () {
    let controller = {};
    EventController.call(controller, {
        "themeSet": [],
        "themeSave": []
    });
    let _lightTheme;
    let _darkTheme;
    controller.registerTheme = function (theme) {
        if (theme.isDark) _darkTheme = theme;
        else _lightTheme = theme;
    }
    controller.load = function (isDark) {
        controller.theme = isDark ? _darkTheme : _lightTheme;
        controller.invokeEvent("themeSet", [controller.theme]);
    }
    controller.set = function (dark) {
        controller.load(dark);
        controller.invokeEvent("themeSave", [controller.theme]);
    }
    return controller;
}());
ThemeController.addEventListener("themeSet", function (theme) {
    document.querySelector("meta[name=theme-color]").setAttribute("content", theme.themeColor);
    theme.prop.forEach((property) => document.documentElement.style.setProperty(property.prop, property.v));
});
ThemeController.addEventListener("themeSave", (theme) => window.localStorage.setItem(STORAGE.theme, theme.isDark));
ThemeController.registerTheme(darkTheme);
ThemeController.registerTheme(lightTheme);
ThemeController.load(ISDARKTHEME);