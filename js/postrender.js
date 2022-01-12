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
RouteController.add(new RouteClass(VIEW.landing, VIEW.landing, true));
RouteController.add(new RouteClass(VIEW.item));
RouteController.add(new RouteClass(VIEW.profile));
RouteController.add(new RouteClass(VIEW.group));
RouteController.add(new RouteClass(VIEW.resource));

//loading start view
const START_ROUTE = RouteController.resolve(START_URL[0]);
getById(START_ROUTE.target).classList.add(GLOBAL.activeView);
APP_NODE.classList.add(START_ROUTE.target);


