const VIEW = {
    landing: "landing",
    item: "item",
    profile: "about",
    group: "group",
    resource:"resource"
};
const APP = {
    name: "Aleksander Łukasiewicz",
    version: "0-0-0-3",
    url: {
        landing: "",
        item: VIEW.item,
        profile: VIEW.profile,
        group: VIEW.group,
        resource:VIEW.resource
    },
    itemFolder: "/item",
    resourceFolder: "/resources",
    itemContentFileName: "/content.json",
    date: (date, months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]) => (date.day + "&nbsp;" + months[date.month - 1] + ",&nbsp;" + date.year)
};
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
const START_URL = (window.location.pathname + (window.location.pathname.substr(-1) == "/" ? "" : "/")).substring(1).split("/");
const STORAGE = {
    itemDownload: "downloaded_items",
    itemPending: "pending_items",
    theme: "dark_theme_selected"
};
const ISDARKTHEME = (window.localStorage[STORAGE.theme]) ? (window.localStorage[STORAGE.theme] == "true") : (new Date().getHours() > 17 || new Date().getHours() < 8);
const getById = (id) => document.getElementById(id);
let RouteClass = function (source, target = source, isDefault = false) {
    return {
        source,
        target,
        isDefault
    }
}
let Theme = function (prop = [], isDark = false) {
    return {
        prop,
        isDark
    }
};
let themeProps = [
    "--color-theme",
    "--color-theme-A1",
    "--color-theme-A2",
    "--color-theme-A3",
    "--color-theme-A4",
    "--color-theme-A5",
    "--color-theme-A6",
    "--color-theme-hover",
    "--color-theme-active",
    "--color-theme-acrylic",
    "--color-font",
    "--color-font-disabled",
    "--color-logo",
    "--color-logo-A1",
    "--profile-image-src",
    "--color-font-accent",
    "--color-accent",
    "--color-accent-A1",
    "--color-accent-A2",
    "--color-accent-A3",
    "--color-accent-shadow",
    "--color-accent-shadow-A1",
    "--color-accent-shadow-A2"
]
let accentThemeProps = [
    "#FFFFFF",
    "#456789",
    "rgba(83, 124, 164, 1)",
    "rgba(100, 149, 197, 1)",
    "rgba(120, 179, 236, 1)",
    "rgba(69, 103, 137, 0.7)",
    "rgba(69, 103, 137, 0.8)",
    "rgba(69, 103, 137, 0.9)"
];
let darkTheme = new Theme([
    "#222222",
    "#2d2d2d",
    "#3a3a3a",
    "#4a4a4a",
    "#6a6a6a",
    "#8a8a8a",
    "#afafaf",
    "rgba(250,250,250,0.1)",
    "rgba(250,250,250,0.2)",
    "rgba(34,34,34,0.75)",
    "#e5e5e5",
    "#aaaaaa",
    "#d0d0d0",
    "#a0a0a0",
    "url(/img/profile-dark.webp)"
].concat(accentThemeProps), true);
let lightTheme = new Theme([
    "#fbfbfb",
    "#F4f4f4",
    "#E8E8E8",
    "#D8D8D8",
    "#c8c8c8",
    "#a8a8a8",
    "#606060",
    "rgba(60,60,60,0.1)",
    "rgba(60,60,60,0.2)",
    "rgba(250,250,250,0.60)",
    "#4f4f4f",
    "#aaaaaa",
    "#5f5f5f",
    "#404040",
    "url(/img/profile.webp)"
].concat(accentThemeProps), false);
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
        theme.isDark ?
            _darkTheme = theme
            :
            _lightTheme = theme;
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
    themeProps.forEach((value, index) => document.documentElement.style.setProperty(value, theme.prop[index]));
    document.querySelector("meta[name=theme-color]").setAttribute("content", theme.prop[0]);
});
ThemeController.addEventListener("themeSave", (theme) => window.localStorage.setItem(STORAGE.theme, theme.isDark));
ThemeController.registerTheme(darkTheme);
ThemeController.registerTheme(lightTheme);
ThemeController.load(ISDARKTHEME);