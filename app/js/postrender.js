//main app node declaration
const APP_NODE = document.getElementById("app");

//route controller declaration
let RouteController = (function () {
    let _controller = {};
    let _routes = [];
    let _defaultRoute;

    _controller.add = function (route) {
        _routes.push(route);
        _defaultRoute = route.isDefault ? route : _defaultRoute;
    }
    _controller.resolve = (arg) => _routes.find((route) => route.source == arg) || _defaultRoute;
    return _controller;
}());

//adding views routes
RouteController.add(new Route(VIEW.landing, VIEW.landing, true));
RouteController.add(new Route(VIEW.item));
RouteController.add(new Route(VIEW.profile));
RouteController.add(new Route(VIEW.group));
RouteController.add(new Route(VIEW.resource));

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
let hideNavigation = function () {
    if (isNavigationOpen)
        setNavigationState(false);
}

//adding navigation buttons methods
getById("main-header-nav-button").addEventListener("click", toggleNavigationState);
let closeSpace = getById("main-header-navigation-close-space");
closeSpace.addEventListener("click", hideNavigation, { "passive": true });
closeSpace.addEventListener("touchstart", hideNavigation, { "passive": true });