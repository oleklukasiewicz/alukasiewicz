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
const Route = function (source, target = source) {
  return {
    source,
    target,
  };
};

//route controller declaration
const RouteController = (function () {
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
    ),
    APP.route[route].isDefault
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

//matcher
IS_MOBILE_MATCH.addEventListener(
  "change",
  (e) => {
    if (!isSearchOpen) {
      setNavigationState(false);
    }
  },
  {
    passive: true,
  }
);

//navigation control methods
let isNavigationOpen = false;
const setNavigationState = function (isOpened) {
  closeSearch();
  NAV_NODE.classList.toggle("closed", !isOpened);
  NAV_NODE.classList.toggle("opened", isOpened);
  APP_NODE.classList.toggle("dialog-opened", isOpened);
  isNavigationOpen = isOpened;
};
const toggleNavigationState = () => setNavigationState(!isNavigationOpen);
const closeNavigation = function () {
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

//setup offline
let IS_OFFLINE = navigator.onLine ? false : true;
if (IS_OFFLINE) {
  APP_NODE.classList.add("offline");
}
window.addEventListener(
  "offline",
  () => {
    IS_OFFLINE = true;
    APP_NODE.classList.add("offline");
  },
  { passive: true }
);
window.addEventListener(
  "online",
  () => {
    IS_OFFLINE = false;
    APP_NODE.classList.remove("offline");
  },
  { passive: true }
);
//add search
let isSearchOpen = false;
const SEARCH_NODE = getById("search");
const openSearch = function () {
  setNavigationState(false);
  SEARCH_NODE.classList.add("opened");
  APP_NODE.classList.add("dialog-opened");
  const searchInput = getById("search-text");
  searchInput.focus();
  searchInput.select();
  isSearchOpen = true;
};
const closeSearch = function () {
  SEARCH_NODE.classList.remove("opened");
  APP_NODE.classList.remove("dialog-opened");
  isSearchOpen = false;
};
const toggleSearch = function () {
  if (isSearchOpen) closeSearch();
  else openSearch();
};
NAV_CLOSE_NODE.addEventListener("click", closeSearch, { passive: true });
NAV_CLOSE_NODE.addEventListener("touchstart", closeSearch, {
  passive: true,
});
getById("main-header-search").addEventListener("click", toggleSearch);
