const APPNODE = document.getElementById("app");
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
RouteController.add(new RouteClass(VIEW.landing, VIEW.landing, true));
RouteController.add(new RouteClass(VIEW.item));
RouteController.add(new RouteClass(VIEW.profile));
RouteController.add(new RouteClass(VIEW.group));
//loading start view
const START_ROUTE = RouteController.resolve(START_URL[0]);
getById(START_ROUTE.target).classList.add(GLOBAL.activeView);
APPNODE.classList.add(START_ROUTE.target);
let themeButton = getById("main-theme-toggle-button");
let homeButton = getById("home-button");
themeButton.classList.toggle(GLOBAL.toggled, ThemeController.theme.isDark);
ThemeController.addEventListener("themeSet", (theme) => themeButton.classList.toggle(GLOBAL.toggled, theme.isDark))
themeButton.addEventListener("click", () => ThemeController.set(!themeButton.classList.contains(GLOBAL.toggled)));
homeButton.addEventListener("click", () => ViewController.navigateToDefaultView());