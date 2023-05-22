//shorthand for getElementById
const getById = (id) => document.getElementById(id);

//route class declaration
let Route = function (source, target = source) {
    return {
        source,
        target
    }
}

//route controller declaration
let RouteController = (function () {
    let _controller = {};
    let _routesList = [];
    let _defaultRoute;

    _controller.add = function (route, isDefault = false) {
        _routesList.push(route);
        _defaultRoute = isDefault ? route : _defaultRoute;
    }
    _controller.resolve = (arg) => _routesList.find((route) => route.source == arg) || _defaultRoute;

    return _controller;
}());

//adding views routes
RouteController.add(new Route(APP.url.landing, VIEW.landing), true);
RouteController.add(new Route(APP.url.item, VIEW.item));
RouteController.add(new Route(APP.url.profile, VIEW.profile));
RouteController.add(new Route(APP.url.group, VIEW.group));
RouteController.add(new Route(APP.url.resource, VIEW.resource));

//loading start view
const START_ROUTE = RouteController.resolve(APP.startUrl[0]);

//main app node declaration
const APP_NODE = getById("app");
if(DEVELOPMENT)
    APP_NODE.classList.add("dev");

// content node

const CONTENT_NODE = getById("content");

//navigation node
const NAV_NODE = getById("main-header-base");

//navigation close space node
const NAV_CLOSE_NODE = getById("main-header-navigation-close-space");

//navigation control methods
let isNavigationOpen = false;
let setNavigationState = function (isOpened) {
    NAV_NODE.classList.toggle("closed", !isOpened);
    isNavigationOpen = isOpened;
}
let toggleNavigationState = () => setNavigationState(!isNavigationOpen)
let closeNavigation = function () {
    if (isNavigationOpen)
        setNavigationState(false);
}

//adding navigation buttons methods
getById("main-header-nav-button").addEventListener("click", toggleNavigationState);

//adding nav close space methods
NAV_CLOSE_NODE.addEventListener("click", closeNavigation, { "passive": true });
NAV_CLOSE_NODE.addEventListener("touchstart", closeNavigation, { "passive": true });

//setting up start view
getById(START_ROUTE.target).classList.add(GLOBAL.activeView);
APP_NODE.classList.add(START_ROUTE.target);
