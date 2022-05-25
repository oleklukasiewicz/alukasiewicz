//shortcut for getElementById
const getById = (id) => document.getElementById(id);

//main app node declaration
const APP_NODE = getById("app");

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
    let _routes = [];
    let _defaultRoute;

    _controller.add = function (route, isDefault = false) {
        _routes.push(route);
        _defaultRoute = isDefault ? route : _defaultRoute;
    }
    _controller.resolve = (arg) => _routes.find((route) => route.source == arg) || _defaultRoute;
    
    return _controller;
}());

//adding views routes
RouteController.add(new Route(APP.url.landing, VIEW.landing), true);
RouteController.add(new Route(APP.url.item, VIEW.item));
RouteController.add(new Route(APP.url.profile, VIEW.profile));
RouteController.add(new Route(APP.url.group, VIEW.group));
RouteController.add(new Route(APP.url.resource, VIEW.resource));

//loading start view
const START_ROUTE = RouteController.resolve(START_URL[0]);

getById(START_ROUTE.target).classList.add(GLOBAL.activeView);
APP_NODE.classList.add(START_ROUTE.target);

//getting navigation node
let navigationNode = getById("main-header-base");

//navigation control
let isNavigationOpen = false;
let setNavigationState = function (isOpened) {
    navigationNode.classList.toggle("closed", !isOpened);
    isNavigationOpen = isOpened;
}
let toggleNavigationState = () => setNavigationState(!isNavigationOpen)
let closeNavigation = function () {
    if (isNavigationOpen)
        setNavigationState(false);
}

//adding navigation buttons methods
getById("main-header-nav-button").addEventListener("click", toggleNavigationState);
let closeSpace = getById("main-header-navigation-close-space");
closeSpace.addEventListener("click", closeNavigation, { "passive": true });
closeSpace.addEventListener("touchstart", closeNavigation, { "passive": true });