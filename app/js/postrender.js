//features for nodes, nodes lists and objects
Element.prototype.remove = function () {
  this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
  for (let i = this.length - 1; i >= 0; i--)
    this[i].parentElement.removeChild(this[i]);
};
//shorthand for getElementById
const getById = (id) => document.getElementById(id);

//route class declaration
let Route = function (source, target = source) {
  return {
    source,
    target,
  };
};

//route controller declaration
let RouteController = (function () {
  let _controller = {};
  let _routesList = [];
  let _defaultRoute;

  _controller.add = function (route, isDefault = false) {
    _routesList.push(route);
    _defaultRoute = isDefault ? route : _defaultRoute;
  };
  _controller.resolve = (arg) =>
    _routesList.find((route) => route.source == arg) || _defaultRoute;

  _controller.routes = () => _routesList;
  return _controller;
})();

//adding views routes
const ROUTES_KEYS = Object.keys(APP.route);
ROUTES_KEYS.forEach((route) => {
  RouteController.add(
    new Route(
      APP.route[route].url,
      APP.route[route].viewId,
      APP.route[route].isDefault
    )
  );
});

//loading start view
const START_ROUTE = RouteController.resolve(APP.startUrl[0]);

//main app node declaration
const APP_NODE = getById("app");
if (DEVELOPMENT) APP_NODE.classList.add("dev");

// content node
const CONTENT_NODE = getById("content");

//navigation node
const NAV_NODE = getById("main-header-base");

//navigation close space node
const NAV_CLOSE_NODE = getById("main-header-navigation-close-space");

//global variables
const DARK_THEME_MATCH = window.matchMedia("(prefers-color-scheme:dark)");
const IS_MOBILE_MATCH = window.matchMedia("(max-width:430px)");

const DEVICE_ORIENTATION = {
  x: null,
  y: null,
};

const INIT_DEVICE_ORIENTATION = () => {
  const data = {
    x: 0,
    y: 0,
  };
  if (window.DeviceOrientationEvent) {
    window.addEventListener(
      "deviceorientation",
      function () {
        data.x = event.beta;
        data.y = event.gamma;
        SET_DEVICE_ORIENTATION(data);
      },
      true
    );
  } else if (window.DeviceMotionEvent) {
    window.addEventListener(
      "devicemotion",
      function () {
        data.x = event.accelerationIncludingGravity.x * 5;
        data.y = event.accelerationIncludingGravity.y * 5;
        SET_DEVICE_ORIENTATION(data);
      },
      true
    );
  } else {
    window.addEventListener(
      "MozOrientation",
      function () {
        data.x = orientation.x * 50;
        data.y = orientation.y * 50;
        SET_DEVICE_ORIENTATION(data);
      },
      true
    );
  }
};
const SET_DEVICE_ORIENTATION = (coords) => {
  //if change is to big - ignore

  if (DEVICE_ORIENTATION.x && DEVICE_ORIENTATION.y) {
    if (
      Math.abs(coords.x - DEVICE_ORIENTATION.x) > 10 ||
      Math.abs(coords.y - DEVICE_ORIENTATION.y) > 10
    ) {
      DEVICE_ORIENTATION.x = null;
      DEVICE_ORIENTATION.y = null;
    }
  }

  DEVICE_ORIENTATION.x = coords.x;
  DEVICE_ORIENTATION.y = coords.y;
  const profileImage = getById("profile-image");
  if (coords.x && coords.y) {
    const childs = profileImage.children;
    Array.prototype.forEach.call(childs, (child) => {
      //normalize
      coords.x = (coords.x - 25) / 2;
      coords.y = coords.y / 2;

      const maxY = 20;
      const maxX = 100;
      const minY = maxY * -1;
      const minX = 0;
      if (coords.y > maxY) coords.y = maxY;
      if (coords.y < minY) coords.y = minY;
      if (coords.x > maxX) coords.x = maxX;
      if (coords.x < minX) coords.x = minX;
      console.log(coords.x, coords.y);
      child.style.transform =
        "translate(" + coords.y + "px," + coords.x + "px)";
    });
  }
};

//navigation control methods
let isNavigationOpen = false;
let setNavigationState = function (isOpened) {
  NAV_NODE.classList.toggle("closed", !isOpened);
  isNavigationOpen = isOpened;
};
let toggleNavigationState = () => setNavigationState(!isNavigationOpen);
let closeNavigation = function () {
  if (isNavigationOpen) setNavigationState(false);
};

//adding navigation buttons methods
getById("main-header-nav-button").addEventListener(
  "click",
  toggleNavigationState
);

//adding nav close space methods
NAV_CLOSE_NODE.addEventListener("click", closeNavigation, { passive: true });
NAV_CLOSE_NODE.addEventListener("touchstart", closeNavigation, {
  passive: true,
});

//setting up start view
getById(START_ROUTE.target).classList.add(GLOBAL.activeView);
APP_NODE.classList.add(START_ROUTE.target);
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
