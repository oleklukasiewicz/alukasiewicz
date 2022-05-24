//main app node declaration
const APP_NODE = document.getElementById("app");

//route controller declaration
let AppRoutes = (function () {
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
AppRoutes.add(new Route(APP.url.landing, VIEW.landing, true));
AppRoutes.add(new Route(APP.url.item,VIEW.item));
AppRoutes.add(new Route(APP.url.profile, VIEW.profile));
AppRoutes.add(new Route(APP.url.group,VIEW.group));
AppRoutes.add(new Route(APP.url.resource,VIEW.resource));

//loading start view from url
const START_ROUTE = AppRoutes.resolve(START_URL[0]);

//adding classes to display start view
getById(START_ROUTE.target).classList.add(GLOBAL.activeView);
APP_NODE.classList.add(START_ROUTE.target);

//getting navigation node
let navigationNode = getById("main-header-base");

//navigation control
let isNavigationMenuOpen = false;
let setNavigationMenuState = function (isOpened) {
    //set app menu state - open/closed
    navigationNode.classList.toggle("closed", !isOpened);
    isNavigationMenuOpen = isOpened;
}
let toggleNavigationMenuState = () => setNavigationMenuState(!isNavigationMenuOpen)
let closeNavigationMenu = function () {
    if (isNavigationMenuOpen)
        setNavigationMenuState(false);
}

//adding navigation buttons methods
getById("main-header-nav-button").addEventListener("click", toggleNavigationMenuState);

let closeSpace = getById("main-header-navigation-close-space");
closeSpace.addEventListener("click", closeNavigationMenu, { "passive": true });
closeSpace.addEventListener("touchstart", closeNavigationMenu, { "passive": true });