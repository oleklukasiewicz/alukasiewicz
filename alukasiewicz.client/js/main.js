//hashing algorythm
const CREATE_HASH = function (str, seed = 0) {
  let _h1 = 0xdeadbeef ^ seed;
  let _h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    _h1 = Math.imul(_h1 ^ ch, 2654435761);
    _h2 = Math.imul(_h2 ^ ch, 1597334677);
  }
  _h1 =
    Math.imul(_h1 ^ (_h1 >>> 16), 2246822507) ^
    Math.imul(_h2 ^ (_h2 >>> 13), 3266489909);
  _h2 =
    Math.imul(_h2 ^ (_h2 >>> 16), 2246822507) ^
    Math.imul(_h1 ^ (_h1 >>> 13), 3266489909);
  let _s = 4294967296 * (2097151 & _h2) + (_h1 >>> 0);
  return _s;
};
const GetResourcePath = (id) => "/api/Resources/" + id + "/content";

//resource classes declaration
const Resource = function (src, type, hash = CREATE_HASH(src), props = {}) {
  return { src, type, hash, props };
};
const ResourceGroup = function (resourcesList = [], selectedResourceHash) {
  this.addResource = function (resource) {
    if (Array.isArray(resource))
      resource.forEach((_res) => resourcesList.push(_res));
    else resourcesList.push(resource);
  };
  this.resources = resourcesList;
  this.selected = selectedResourceHash;
};

const ResourceDictionary = function (resourcesGroups = []) {
  let _dictionary = this;
  this.addGroup = (group) => _dictionary.push(group) - 1;

  resourcesGroups.forEach((item) => this.push(item));
};
ResourceDictionary.prototype = new Array();
ResourceDictionary.constructor = ResourceDictionary;

const View = function (
  routingData,
  data = {},
  event = {},
  isRegisterDelayed = false,
  loadingMode = ViewController.loadingModes.single
) {
  return {
    id: routingData.viewId,
    url: routingData.url,
    data,
    event,
    rootNode: routingData.rootNodeId,
    isRegisterDelayed,
    loadingMode,
  };
};
const ErrorClass = function (
  id,
  title,
  message,
  triggerErrorsList = [],
  refreshRequire = true
) {
  return {
    id,
    title,
    message,
    triggerErrorsList,
    refreshRequire,
  };
};
const HistoryItem = function (id, index, defaultViewHistoryIndex, arg) {
  return {
    id,
    index,
    defaultViewHistoryIndex,
    arg,
  };
};

//item date class declaration
const ItemDate = function (day, month, year) {
  this.toHTMLString = function (
    months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
  ) {
    return months[this.month - 1] + "&nbsp;" + this.day + ",&nbsp;" + this.year;
  };
  this.toNormalizedString = function (date) {
    var year = date.year;
    var month = date.month < 10 ? "0" + date.month : date.month;
    var day = date.day < 10 ? "0" + date.day : date.day;
    return "" + year + month + day;
  };
  this.toDate = function () {
    return new Date(this.year, this.month - 1, this.day);
  };
  this.compare = function (date) {
    const aDate = this.toNormalizedString(date);
    const bDate = this.toNormalizedString(this);

    let _intDate = parseInt(aDate);
    if (_intDate > parseInt(bDate)) return -1;
    else if (_intDate < parseInt(bDate)) return 1;
    else return 0;
  };
  this.fromDate = function (date) {
    if (typeof date == "string") date = new Date(date);
    this.day = date.getDate();
    this.month = date.getMonth() + 1;
    this.year = date.getFullYear();
    return this;
  };
  this.diff = function (date) {
    let _date = this.toDate();
    let _diff = date - _date;
    const days = Math.floor(_diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    return { days, months, years };
  };
  if (typeof arguments[0] === "object") {
    this.day = arguments[0].day;
    this.month = arguments[0].month;
    this.year = arguments[0].year;
  } else {
    let _today = new Date();
    this.day = day || _today.getDate();
    this.month = month || _today.getMonth() + 1;
    this.year = year || _today.getFullYear();
  }
};

//event sub controller declaration
const EventController = function (eventsList = []) {
  let _events = {};

  eventsList.forEach((eventName) => (_events[eventName] = []));

  this.addEventListener = (event, listener = function () {}) =>
    _events[event].push(listener);
  this.invokeEvent = async (event, arg = []) =>
    await Promise.all(_events[event].map((event) => event(...arg)));
};

//controllers declarations
const ViewController = (function () {
  let _controller = {};
  let _views = [];
  let _currentHistoryIndex = -1;
  let _defaultViewHistoryIndex = -1;
  let _defaultView;

  let _currentView;

  let _previousView;

  let _backTempNavigationArgs = {};

  EventController.call(_controller, [
    "navigateToView",
    "navigationRequest",
    "navigateFromView",
    "navigateDefault",
    "historyEdit",
  ]);
  //integrated error controller
  let _errors = [];
  let _errorHistory = [];
  let _currentGLOBALError;

  _controller.addError = function (error) {
    if (_errors.findIndex((_error) => error.id == _error.id) == -1)
      _errors.push(error);
  };
  _controller.invokeError = function (errorId, GLOBALInvoke = false) {
    let __error = _errors.find(
      (_error) => errorId == _error.id || errorId.id == _error.id
    );
    let _errorCanBeInvoked = true;
    __error.triggerErrorsList.forEach((err) => {
      if (_errorHistory.includes(err)) _errorCanBeInvoked = false;
    });
    if (_errorCanBeInvoked) {
      if (GLOBALInvoke) {
        _views.forEach((view) =>
          view.registered ? view.event?.onError.call(view, __error) : ""
        );
        _currentGLOBALError = __error;
      } else _currentView.event?.onError.call(_currentView, __error);
      _errorHistory.push(__error.id);
    }
  };

  //view controller methods
  const _getViewById = (id) =>
    _views.find((view) => view.id == id) || _defaultView;
  const _registerDelayedView = function (view) {
    if (view.isRegisterDelayed && !view.registered) {
      if (_currentGLOBALError)
        view.event?.onError.call(view, _currentGLOBALError);
      view.event.onRegister?.call(view);
      view.registered = true;
    }
  };
  const _generateRootNode = function (view) {
    if (typeof view.rootNode == "string")
      view.rootNode = getById(view.rootNode);
  };
  const _unLoadView = function (view) {
    if (view.loadingMode == _controller.loadingModes.always)
      view.isLoaded = false;
  };
  const _invokeLoadEvent = async function (view, arg) {
    if (!view.isLoading && !view.isLoaded) {
      view.isLoading = true;
      await view.event.onLoad?.call(view, arg);
    }
    return view;
  };
  const _invokeLoadFinishEvent = async function (view, arg) {
    if (view.isLoading && !view.isLoaded) {
      view.isLoading = false;
      view.isLoaded = true;
      await view.event.onLoadFinish?.call(view, arg);
    }
  };
  _controller.navigate = async function (id, arg = {}) {
    await _controller.invokeEvent("navigationRequest", [id, _currentView]);
    let _previousViewArgs = _currentView?.navigationArgs?.routeArg || [];

    //canceling navigation when is navigating to the same view with the same routeArg
    if (
      id == _currentView?.id &&
      (arg.routeArg?.join("/") || "") == _previousViewArgs.join("/")
    )
      return;

    //getting view
    let _target = _getViewById(id);

    //unloading old view if exist
    if (_currentView) {
      //finishing loading view if needed, unloading and generating node if needed
      _invokeLoadFinishEvent(_currentView);
      _unLoadView(_currentView);

      //navigating
      _currentView.event.onNavigateFrom?.call(_currentView, arg);
      await _controller.invokeEvent("navigateFromView", [_currentView, arg]);
      _previousView = _currentView;
    }

    //adding history default index
    if (!arg.noHistoryPush) {
      _currentHistoryIndex++;
      if (_target == _defaultView)
        _defaultViewHistoryIndex = _currentHistoryIndex;
    }

    let _historyItem = new HistoryItem(
      _target.id,
      _currentHistoryIndex,
      _defaultViewHistoryIndex,
      {
        routeArg: arg.routeArg,
      }
    );

    //setting current view
    _currentView = _target;
    _currentView.navigationArgs = arg;
    _currentView.navigationUrl =
      "/" +
      _currentView.url +
      (arg.routeArg?.length > 0 ? "/" + (arg.routeArg?.join("/") || "") : "");
    _currentView.historyItem = _historyItem;

    _generateRootNode(_currentView);

    //invoking history and url edit event
    await _controller.invokeEvent("historyEdit", [_historyItem, _target]);

    //registering and invoking navigate event
    await _registerDelayedView(_currentView);
    await _controller.invokeEvent("navigateToView", [
      _currentView,
      _previousView,
      arg,
    ]);
    await _currentView.event.onNavigate?.call(_currentView, arg);

    //loading view if needed
    if (_currentView.loadingMode != _controller.loadingModes.never)
      await _invokeLoadEvent(_currentView, arg).then((view) =>
        _invokeLoadFinishEvent(view, arg)
      );
  };
  _controller.register = function (view, isDefault = false) {
    _views.push(view);
    if (!view.isRegisterDelayed) view.event.onRegister?.call(view);
    if (isDefault) _defaultView = view;
  };
  _controller.navigateToDefaultView = async function (arg) {
    if (_currentView == _defaultView) return;

    await _controller.invokeEvent("navigateDefault", [arg]);

    //navigating to nearest landing page history index
    let _homeIndex = history.state.defaultViewHistoryIndex;
    let _indexDelta = _homeIndex - history.state.index;
    if (_homeIndex != -1 && _indexDelta != 0) history.go(_indexDelta);
    else ViewController.navigate(null, arg);
  };
  _controller.back = function (arg = {}) {
    _backTempNavigationArgs = arg;

    if (history.state.index == 0) _controller.navigateToDefaultView();
    else history.back();
  };
  _controller.loadingModes = {
    single: "single",
    always: "always",
    never: "never",
  };
  _controller.navigateFromHistory = function (
    historyItem,
    arg = _backTempNavigationArgs
  ) {
    _currentHistoryIndex = historyItem.index;
    _defaultViewHistoryIndex = historyItem.defaultViewHistoryIndex;

    let _args = Object.assign(
      {
        noHistoryPush: true,
      },
      historyItem.arg,
      arg
    );

    _controller.navigate(historyItem.id, _args);

    _backTempNavigationArgs = {};
  };
  return _controller;
})();
const ItemController = (function () {
  let _routes = [];
  let _groupRoutes = [];
  let _storage = [];

  let _itemsLoaded = false;
  let _groupsLoaded = false;

  let _defaultGroup;
  let _controller = {};

  let _itemsSortingMethod = function (a, b) {
    let aDate = a.modifyDate || a.createDate;
    let bDate = b.modifyDate || b.createDate;
    return bDate.compare(aDate);
  };

  EventController.call(_controller, [
    "fetchGroup",
    "fetchGroupFinish",
    "fetchItem",
    "fetchItemFinish",
  ]);
  //adding error types for item and group not errors
  ViewController.addError(
    new ErrorClass(
      "item_not_found",
      "Item don't exist",
      "We don't have what you're looking for",
      ["item_outdated", "item_load_error", "group_not_found"]
    )
  );
  ViewController.addError(
    new ErrorClass(
      "group_not_found",
      "Group don't exist",
      "We don't have what you're looking for",
      ["item_outdated", "item_load_error"]
    )
  );
  ViewController.addError(
    new ErrorClass(
      "item_not_fetched",
      "Item cannot be loaded",
      "Check your internet connection"
    )
  );

  const _downloadItemContent = async function (item) {
    return new Promise((resolve, reject) =>
      fetch(
        ITEM.folder +
          item.folder +
          ITEM.resourceFolder +
          "/" +
          (item.format == "md" ? ITEM.fileNameMd : ITEM.fileName)
      )
        .then((respond) => {
          if (item.format == "md") return resolve(respond.text());
          resolve(respond.json());
        })
        .catch((err) => {
          reject(err);
        })
    );
  };

  const _generateId = (id) =>
    encodeURIComponent(id.toLowerCase().replaceAll(" ", "-"));
  const _generateValidStorageObject = function (obj) {
    obj.id = obj.id || _generateId(obj.title);
    obj.createDate = new ItemDate(obj.createDate);
    if (obj.modifyDate) obj.modifyDate = new ItemDate(obj.modifyDate);
  };
  const _generateGroup = function (group) {
    group.content = [];
    group.type = GLOBAL.group;
    _generateValidStorageObject(group);
    _groupRoutes.push(new Route(group.id, group));
    return group;
  };

  const _getGroupByRoute = (id) =>
    _groupRoutes.find((route) => route.source == id)?.target;
  const _getItemByRoute = (id) =>
    _routes.find((route) => route.source == id)?.target;
  const _getResourceGroupByHash = function (dictionary, hash) {
    let targetResource;
    let target = dictionary.find((resGroup) => {
      targetResource = resGroup.resources.find((res) => res.hash == hash);
      return targetResource ? true : false;
    });

    target.selected = targetResource;
    return target;
  };

  const _fetchGroups = async function (groups) {
    await Promise.all(
      groups.map(async (group) => {
        if (group.dev === true && !DEVELOPMENT) return;
        _generateGroup(group);
        _storage.push(group);
        group.aliases?.forEach((source) =>
          _groupRoutes.push(new Route(source, group))
        );
        if (group.isDefault) _defaultGroup = group;
        await _controller.invokeEvent("fetchGroup", [group]);
      })
    );
    _storage.forEach((group) =>
      group.groups?.forEach((_group) =>
        _getGroupByRoute(_group)?.content.push(group)
      )
    );
    await _controller.invokeEvent("fetchGroupFinish");
    _groupsLoaded = true;
  };
  const _fetchItems = async function (items, sortingMethod) {
    await Promise.all(
      items.map(async (item) => {
        _generateValidStorageObject(item);
        item.type = GLOBAL.item;
        _routes.push(new Route(item.id, item));
      })
    );
    items.sort(sortingMethod);
    await Promise.all(
      items.map(async (item) => {
        if (item.dev === true && !DEVELOPMENT) return;
        _defaultGroup.content.push(item);
        item.aliases?.forEach((source) =>
          _routes.push(new Route(source, item))
        );
        item.groups?.forEach((group) =>
          _getGroupByRoute(group)?.content.push(item)
        );
        await _controller.invokeEvent("fetchItem", [item]);
      })
    );
    await _controller.invokeEvent("fetchItemFinish", []);
    _itemsLoaded = true;
  };
  //loading full item content
  const _fetchItemContent = async function (item) {
    if (!item) {
      ViewController.invokeError("item_not_found");
      return;
    }

    //TODO: check if item.js and item.css are downloaded if not -> download
    if (!item.isLink && !item.isContentCached) {
      //getting item content
      let _content = await _downloadItemContent(item, item.folder);
      //TODO: check content component version if newer -> download new version of item.css and js
      if (item.format == "md") item.content = ItemMarkdownBuilder(_content);
      else ItemStuctureBuilder(item, _content);

      //indicating content is cached
      item.isContentCached = true;
    }
    return item;
  };
  _controller.loadData = async function (
    groups,
    items,
    itemsSorting = _itemsSortingMethod
  ) {
    if (!_groupsLoaded) await _fetchGroups(groups);
    if (!_itemsLoaded) await _fetchItems(items, itemsSorting);
  };

  Object.defineProperties(_controller, {
    storage: {
      get: () => _storage,
    },
    isItemsLoaded: {
      get: () => _itemsLoaded,
    },
    isGroupsLoaded: {
      get: () => _groupsLoaded,
    },
    getGroupById: {
      value: _getGroupByRoute,
    },
    getItemSnapshotById: {
      value: (id) => _getItemByRoute(id),
    },
    getItemById: {
      value: async (id) => await _fetchItemContent(_getItemByRoute(id)),
    },
    findResourceByHash: {
      value: (resourceDictionary, hash) =>
        _getResourceGroupByHash(resourceDictionary, hash),
    },
  });
  return _controller;
})();

//views declarations
const landingView = new View(
  APP.route.landing,
  { scrollY: -1, itemsLoaded: false },
  {
    onNavigate: function () {
      //restoring scroll
      if (this.data.scrollY >= 0) window.scroll(0, this.data.scrollY);
      document.title = APP.name;

      //error if items are not loaded before view is displayed
      if (!ItemController.isItemsLoaded)
        ViewController.invokeError("item_load_error");
    },
    onRegister: function () {
      let profileImage = getById("profile-image");

      const renderProfileImage = async function (isDark = false, targetNode) {
        let imagesList = ["/bg1.webp", "/profile-picture.webp"];
        let folder = isDark
          ? "/img/dark/landing-banner"
          : "/img/light/landing-banner";

        await MultipleImagesRenderer(
          imagesList.map((img) => folder + img),
          targetNode
        );
      };
      DARK_THEME_MATCH.addEventListener("change", (e) =>
        renderProfileImage(e.matches, profileImage)
      );
      renderProfileImage(DARK_THEME_MATCH.matches, profileImage);

      //set "About me" button
      let _pButton = getById("profile-link-button");
      //Effect.reveal.add(_pButton, undefined, undefined, true);
      _pButton.classList.remove(GLOBAL.disabled);
      _pButton.href = APP.route.profile.url;
      _pButton.addEventListener("click", () => {
        event.preventDefault();
        ViewController.navigate(APP.route.profile.viewId);
      });
      this.data.iList = getById("main-list");
    },
    onNavigateFrom: function () {
      //save scroll
      this.data.scrollY = window.scrollY;
      this.rootNode.classList.remove(GLOBAL.error);
    },
    onLoadFinish: function () {
      this.rootNode.classList.remove(GLOBAL.loading);
      this.data.iList
        .getElementsByClassName(GLOBAL.dataNode + " no-data")
        .remove();
    },
    onLoad: async function () {
      this.rootNode.classList.add(GLOBAL.loading);

      const homeGroup = await GetDefaultGroup();
      StorageResponseBuilder(homeGroup, this.data.iList, 1, -1);
      //display items from landing group
    },
    onError: function (err) {
      this.rootNode.classList.add(GLOBAL.error);
      createErrorMsg(err, getById("landing-error-node"));
    },
  },
  true,
  ViewController.loadingModes.always
);
const profileView = new View(
  APP.route.profile,
  {},
  {
    onNavigate: () => {
      window.scroll(0, 0);
      document.title = "About me - " + APP.name;
    },
    onRegister: function () {
      let profileImage = getById("about-img");

      let renderProfileImage = async function (isDark = false, targetNode) {
        let imagesList = [
          "/bg-l1.webp",
          "/bg-l2.webp",
          "/bg-l3.webp",
          "/stars-l1.webp",
          "/stars-l2.webp",
          "/tree-l1.webp",
        ];
        let folder = isDark
          ? "/img/dark/about-banner"
          : "/img/light/about-banner";

        await MultipleImagesRenderer(
          imagesList.map((img) => folder + img),
          targetNode
        );
      };
      DARK_THEME_MATCH.addEventListener("change", (e) =>
        renderProfileImage(e.matches, profileImage)
      );
      renderProfileImage(DARK_THEME_MATCH.matches, profileImage);
    },
  },
  true,
  ViewController.loadingModes.never
);
const itemView = new View(
  APP.route.item,
  { currentItem: null },
  {
    onNavigate: () => window.scroll(0, 0),
    onNavigateFrom: function () {
      this.rootNode.classList.remove(GLOBAL.error);
    },
    onRegister: function () {
      //getting children nodes
      this.data.iTitle = getById("item-title");
      this.data.iContent = getById("item-content");
      this.data.iInfo = getById("item-info");
    },
    onLoad: async function (arg) {
      this.rootNode.classList.add(GLOBAL.loading);

      if (!ItemController.isItemsLoaded) {
        ViewController.invokeError("item_load_error");
        return;
      }

      //getting item
      let item;
      //if item is loaded into view -> skip rendering
      //TODO: dynamic item content change
      if (this.data.currentItem?.id == arg.routeArg[0]) {
        document.title = this.data.currentItem.title + " - " + APP.name;
        return;
      }

      try {
        item = await ItemController.getItemById(arg.routeArg[0]);
      } catch (e) {
        ViewController.invokeError("item_not_fetched", false);
        console.error(e);
        return;
      }

      //display error and return if item is not found
      if (!item) {
        ViewController.invokeError("item_not_found");
        return;
      }

      //if it's link -> redirect into page
      if (item.isLink) {
        window.open(item.isLink, "_blank").focus();
        ViewController.navigateToDefaultView();
        return;
      }

      //save into view cache
      this.data.currentItem = item;

      //preparing item info
      document.title = item.title + " - " + APP.name;
      this.data.iTitle.innerHTML = item.title;
      this.data.iInfo.innerHTML =
        item.createDate.toHTMLString() +
        (item.modifyDate
          ? " <u class='dotted-separator'></u> Updated " +
            item.modifyDate.toHTMLString()
          : "");

      //clear content
      this.data.iContent.classList.remove("markdown");
      this.data.iContent.innerHTML = "";

      //render item
      if (item.format == "md") {
        this.data.iContent.classList.add("markdown");
        this.data.iContent.innerHTML = item.content;
        return;
      }
      this.data.iContent.append(
        await ItemComponentBuilder(item.content, item.folder, item)
      );
    },
    onLoadFinish: function (arg) {
      this.rootNode.classList.remove(GLOBAL.loading);
    },
    onError: function (err) {
      this.rootNode.classList.add(GLOBAL.error);
      createErrorMsg(err, getById("item-error-node"));
    },
  },
  true,
  ViewController.loadingModes.always
);
const groupView = new View(
  APP.route.group,
  { scrollY: -1 },
  {
    onRegister: function () {
      //get children nodes
      let _data = this.data;
      _data.groupData = getById("group-data");
      _data.groupList = getById("group-list");
      _data.groupTitle = getById("group-title");
      _data.groupInfo = getById("group-info");
    },
    onNavigate: () => window.scroll(0, 0),
    onLoad: async function (arg) {
      //set all group items into loading state
      Array.prototype.forEach.call(
        this.data.groupList.getElementsByClassName(GLOBAL.dataNode),
        (node) => {
          node.classList.add("loading", "no-data");

          const revealLayer = node.children[4];
          if (revealLayer) {
            const s = Effect.reveal.remove(revealLayer);
          }
        }
      );
      this.rootNode.classList.remove(GLOBAL.error);

      this.rootNode.classList.add(GLOBAL.loading);
      this.data.groupData.classList.add(GLOBAL.loading);
      if (!ItemController.isItemsLoaded)
        ViewController.invokeError("item_load_error");
      //getting group
      let group = await ItemController.getGroupById(arg.routeArg[0]);
      if (!group) {
        ViewController.invokeError("group_not_found");
        return;
      }

      //preparing group info
      this.data.currentGroup = group;
      this.data.groupTitle.innerHTML = group.title;
      document.title = group.title + " - " + APP.name;
      this.data.groupInfo.innerHTML =
        group.createDate.toHTMLString() +
        " <u class='dotted-separator'></u> " +
        group.content.length +
        "&nbsp;" +
        (group.content.length != 1 ? "items" : "item");
      this.data.groupData.classList.remove(GLOBAL.loading);

      //loading items of group
      await StorageResponseBuilder(group, this.data.groupList, 1, -1);
    },
    onLoadFinish: function () {
      this.rootNode.classList.remove(GLOBAL.loading);
      this.data.groupList.getElementsByClassName("no-data").remove();
    },
    onError: function (err) {
      this.rootNode.classList.add(GLOBAL.error);
      createErrorMsg(err, getById("group-error-node"));
    },
  },
  true,
  ViewController.loadingModes.always
);
const resourceView = new View(
  APP.route.resource,
  {},
  {
    onNavigate: function () {
      document.title = "Gallery - " + APP.name;
    },
    onRegister: function () {
      //adding image errors
      ViewController.addError(
        new ErrorClass(
          "image_not_found",
          "Image not found",
          "Try refresh page",
          ["item_not_found", "item_outdated", "item_load_error"],
          true
        )
      );
      let _sender = this;

      //creating slider
      this.data.resSlider = new ResourceSlider();

      //getting nodes
      let _resList = (this.data.resList = getById("image-viewer-list"));
      let _prevBtn = getById("image-viewer-prev");
      let _nextBtn = getById("image-viewer-next");
      _nextBtn.addEventListener("click", this.data.resSlider.next);
      _prevBtn.addEventListener("click", this.data.resSlider.previous);

      //adding close button
      getById("image-viewer-close").addEventListener(
        "click",
        ViewController.back
      );

      const _setButtonsDisplay = function (isHidden) {
        _nextBtn.classList.toggle(GLOBAL.hidden, isHidden);
        _prevBtn.classList.toggle(GLOBAL.hidden, isHidden);
      };

      //adding event to slider
      this.data.resSlider.addEventListener(
        "render",
        async function (
          res,
          index,
          resHistory,
          nextIndexRes,
          nextIndex,
          previousIndexRes,
          previousIndex,
          direction
        ) {
          //setting classes for items to render
          let _resChilds = _resList.children;
          let _currentChild = _resChilds[index];

          _currentChild.children[0].src = res.src;

          _resChilds[nextIndex].children[0].src = nextIndexRes.src;
          _resChilds[previousIndex].children[0].src = previousIndexRes.src;

          _resChilds[resHistory[1]?.index]?.classList.remove(
            "previous",
            "next",
            "old"
          );

          _resChilds[index].classList.add(
            direction == 1 ? "next" : "previous",
            GLOBAL.activeView
          );

          _resChilds[resHistory[0]?.index]?.classList.remove(
            "next",
            "previous",
            "start",
            GLOBAL.activeView
          );
          _resChilds[resHistory[0]?.index]?.classList.add(
            direction == 1 ? "next" : "previous",
            "old"
          );

          history.state.arg.routeArg = [_sender.data.currentItem.id, res.hash];
          history.replaceState(
            history.state,
            "",
            "/" +
              _sender.url +
              "/" +
              _sender.data.currentItem.id +
              "/" +
              res.hash
          );
          try {
            await ImageHelper(
              _currentChild.children[0],
              undefined,
              undefined,
              function () {
                _currentChild.classList.remove(GLOBAL.loading);
              }
            );
          } catch (e) {
            console.error(e);
          }
        }
      );
      this.data.resSlider.addEventListener("load", function () {
        let _container = document.createElement("DIV");
        _container.classList.add(GLOBAL.loading, "img");
        let _img = document.createElement("IMG");
        _container.appendChild(_img);
        _resList.appendChild(_container);
      });
      this.data.resSlider.addEventListener("loadFinish", (res) =>
        _setButtonsDisplay(res.length < 2)
      );
      this.data.resSlider.addEventListener("close", () => {
        _resList.innerHTML = "";
        _setButtonsDisplay(true);
      });

      //adding gestures for navigation
      GestureBuilder(this.rootNode, {
        right: this.data.resSlider.next,
        left: this.data.resSlider.previous,
        up: this.data.resSlider.next,
        down: this.data.resSlider.previous,
      });
    },
    onLoad: async function (arg) {
      //loading item and resource group
      this.data.currentItem =
        arg.currentItem || (await ItemController.getItemById(arg.routeArg[0]));
      let resourceGroup = ItemController.findResourceByHash(
        this.data.currentItem.resourcesDictionary,
        arg.routeArg[1]
      );

      //if resource group is mising -> display error
      if (!resourceGroup) {
        ViewController.invokeError("image_not_found", false);
        return;
      }

      //loading resources to slider
      await this.data.resSlider.loadResources(
        resourceGroup.resources,
        resourceGroup.selected,
        false
      );
    },
    onNavigateFrom: function () {
      this.rootNode.classList.remove(GLOBAL.error);
      this.data.resSlider.close();
    },
    onError: function (err) {
      this.rootNode.classList.add(GLOBAL.error);
      createErrorMsg(err, getById("resources-error-node"));
    },
  },
  true,
  ViewController.loadingModes.always
);

//item tile creating method
const createItemTile = async function (node, item) {
  if (node.nodeName != "A") {
    let oldNode = node;
    node = document.createElement("A");
    oldNode.parentElement.replaceChild(node, oldNode);
  }
  let imageSrc = GetResourcePath(item.tileImageResourceId);
  node.className =
    "item " +
    GLOBAL.dataNode +
    " " +
    GLOBAL.loading +
    " index-" +
    item.responseIndex;

  node.innerHTML = "";

  let nodeImgContainer = document.createElement("DIV");
  nodeImgContainer.classList.add("img");

  let _iImage = document.createElement("IMG");
  _iImage.src = imageSrc;
  _iImage.alt = item.title;
  nodeImgContainer.appendChild(_iImage);

  let nodeTitle = document.createElement("B");
  nodeTitle.classList.add("font-subtitle");
  nodeTitle.innerHTML = item.title;

  if (item.isPublished == false) {
    let _betabadge = document.createElement("SPAN");
    _betabadge.classList.add("dev-badge");
    _betabadge.classList.add("badge");
    _betabadge.innerHTML = "BETA";
    nodeTitle.appendChild(_betabadge);
  }
  const targetDate = new ItemDate().fromDate(item.updatedAt || item.createdAt);

  const dateDiffrence = targetDate.diff(new Date());
  if (dateDiffrence.days < 30) {
    let _betabadge = document.createElement("SPAN");
    _betabadge.classList.add("badge");
    _betabadge.innerHTML = "NEW";
    nodeTitle.appendChild(_betabadge);
  }

  let nodeContent = document.createElement("SPAN");
  nodeContent.classList.add("font-base");
  nodeContent.innerHTML = item.description;

  let nodeLabels = document.createElement("DIV");
  nodeLabels.classList.add("labels");

  let nodeButton = createButton(
    item.isLink ? "mi-OpenInNewWindow" : "mi-BackMirrored",
    item.isLink ? "Open link" : "Read more",
    "DIV",
    true
  );

  nodeLabels.appendChild(nodeButton);

  let nodeUpdateLabel = document.createElement("DIV");
  nodeUpdateLabel.classList.add("label", "font-caption");
  let nodeUpdateLabelIcon = document.createElement("I");

  if (item.modifyDate) nodeUpdateLabelIcon.classList.add("mi", "mi-Update");

  nodeUpdateLabel.innerHTML = " &nbsp;&nbsp;" + targetDate.toHTMLString();
  nodeUpdateLabel.insertBefore(nodeUpdateLabelIcon, nodeUpdateLabel.firstChild);
  nodeLabels.appendChild(nodeUpdateLabel);

  let revealLayer = document.createElement("DIV");
  revealLayer.classList.add("reveal-layer");

  node.appendChild(nodeImgContainer);
  node.appendChild(nodeTitle);
  node.appendChild(nodeContent);
  node.appendChild(nodeLabels);
  node.appendChild(revealLayer);

  //loading image of tile
  try {
    await new ImageHelper(
      _iImage,
      function () {
        _iImage.style = item.arg?.tileImageStyle || "";
      },
      function () {
        item.isTileImageNotLoaded = true;
        removeResourceFromCache(imageSrc);
      }
    );
  } catch (e) {
    if (item.tileImageResourceId)
      console.error(`Cannot load image ${item.tileImageResourceId}`);
  }

  //settings up events
  node.classList.replace(GLOBAL.loading, GLOBAL.loaded);
  node.onclick = function () {
    event.preventDefault();
    if (item.isLink) window.open(item.isLink, "_blank").focus();
    else
      ViewController.navigate(APP.route.item.viewId, { routeArg: [item.id] });
  };
  node.href = item.isLink || APP.route.item.url + "/" + item.id;

  //loading item
  setTimeout(() => node.classList.remove(GLOBAL.loaded), 300);
  Effect.reveal.add(revealLayer, true);
  return node;
};
const createGroupTile = function (node, group) {
  if (node.nodeName != "DIV") {
    let oldNode = node;
    node = document.createElement("DIV");
    oldNode.parentElement.replaceChild(node, oldNode);
  }
  node.innerHTML = "";
  node.className = "group " + GLOBAL.dataNode;

  let nodeTitle = document.createElement("SPAN");
  nodeTitle.classList.add("font-title");
  nodeTitle.innerHTML = group.name;

  let nodeButton = createButton("mi-ShowAll", "Show all");

  node.appendChild(nodeTitle);
  node.appendChild(nodeButton);

  //settings up tile events
  node.children[1].onclick = function () {
    event.preventDefault();
    ViewController.navigate(APP.route.group.viewId, { routeArg: [group.id] });
  };
  node.children[1].href = APP.route.group.url + "/" + group.id;
  return node;
};

//storage response display helpers
const StorageResponseIndexer = function (response) {
  let _indexedItems = [];
  const _groups = response.subGroups;
  const _items = response.items;
  for (let i = 0; i < _groups.length; i++) {
    let group = _groups[i];
    const indexedContent = StorageResponseIndexer(group, _indexedItems.length);
    _indexedItems.push({
      type: GLOBAL.group,
      entity: group,
    });
    if (indexedContent.length > 0) _indexedItems.push(...indexedContent);
  }
  for (let i = 0; i < _items.length; i++) {
    let item = _items[i];
    _indexedItems.push({
      type: GLOBAL.item,
      entity: item,
    });
  }
  //add indexes
  _indexedItems.forEach((entry, index) => {
    entry.index = index;
  });
  return _indexedItems;
};
const StorageResponseBuilder = async function (
  response,
  targetNode = document.createElement("DIV")
) {
  let _items = [...targetNode.getElementsByClassName(GLOBAL.dataNode)];
  let _indexedItems = StorageResponseIndexer(response);
  await Promise.all(
    _indexedItems.map(async (entry) => {
      entry.type == GLOBAL.group
        ? await createGroupTile(
            _items[entry.index] ||
              targetNode.appendChild(document.createElement("div")),
            entry.entity
          )
        : await createItemTile(
            _items[entry.index] ||
              targetNode.appendChild(document.createElement("a")),
            entry.entity
          );
    })
  );
};

//universal slider class for resourceMap objects
const ResourceSlider = function () {
  let _res = [];
  let _currentIndex;

  let _history = [];
  let _historyLimit = 2;

  let _nextIndex;
  let _previousIndex;

  EventController.call(this, [
    "load",
    "loadFinish",
    "next",
    "previous",
    "render",
    "remove",
    "close",
  ]);
  let _sender = this;

  window.addEventListener("keyup", function (event) {
    switch (event.keyCode) {
      case 39:
        _sender.next();
        break;
      case 37:
        _sender.previous();
        break;
    }
  });

  const _renderIndex = async function (index, direction) {
    _history.unshift({ resource: _res[_currentIndex], index: _currentIndex });
    if (_history.length > _historyLimit) _history.pop();

    _currentIndex = index;

    _nextIndex = _currentIndex + 1;
    if (_nextIndex >= _res.length) _nextIndex = 0;

    _previousIndex = _currentIndex - 1;
    if (_previousIndex < 0) _previousIndex = _res.length - 1;

    _res[_currentIndex].isLoaded = true;

    await _sender.invokeEvent("render", [
      _res[_currentIndex]?.resource,
      _currentIndex,
      _history,
      _res[_nextIndex]?.resource,
      _nextIndex,
      _res[_previousIndex]?.resource,
      _previousIndex,
      direction,
    ]);
  };
  this.loadResources = async function (resourcesList, current) {
    _res = resourcesList.map((_resource) => ({
      resource: _resource,
      isLoaded: false,
    }));
    await Promise.all(
      _res.map(
        async (res, index) =>
          await _sender.invokeEvent("load", [res.resource, index])
      )
    );
    await _renderIndex(
      current ? _res.findIndex((res) => res.resource.hash == current.hash) : 0,
      0
    );
    await this.invokeEvent("loadFinish", [_res]);
    return _currentIndex;
  };
  this.close = async () => {
    _currentIndex = -1;
    await _sender.invokeEvent("close");
  };
  this.next = async function () {
    if (_res.length > 1) {
      await _renderIndex(_nextIndex, 1);
      await _sender.invokeEvent("next", [
        _res[_currentIndex]?.resource,
        _nextIndex,
      ]);
    }
  };
  this.previous = async function () {
    if (_res.length > 1) {
      await _renderIndex(_previousIndex, -1);
      await _sender.invokeEvent("previous", [
        _res[_currentIndex]?.resource,
        _previousIndex,
      ]);
    }
  };
};

//gesture support for element
const GestureBuilder = function (node, event = {}) {
  const _directions = {
    up: "up",
    down: "down",
    left: "left",
    right: "right",
  };

  let _startPos = {};
  let _endPos = {};

  const MIN_DIST = 100;

  const _directionSolver = function (startX, startY, endX, endY) {
    let _distX = Math.abs(endX - startX);
    let _distY = Math.abs(endY - startY);

    let _isVertical = _distX < _distY;

    if (startX < endX && !_isVertical && _distX >= MIN_DIST)
      return _directions.left;
    if (endX < startX && !_isVertical && _distX >= MIN_DIST)
      return _directions.right;
    if (startY < endY && _isVertical && _distY >= MIN_DIST)
      return _directions.down;
    if (endY < startY && _isVertical && _distY >= MIN_DIST)
      return _directions.up;
  };
  node.addEventListener("touchstart", (e) => {
    _startPos.x = e.touches[0].clientX;
    _startPos.y = e.touches[0].clientY;
  });

  node.addEventListener("touchend", (e) => {
    _endPos.x = e.changedTouches[0].clientX;
    _endPos.y = e.changedTouches[0].clientY;
    let _direction = _directionSolver(
      _startPos.x,
      _startPos.y,
      _endPos.x,
      _endPos.y
    );
    event[_direction]?.call(node);
  });
};

//error message node builder
const createErrorMsg = function (err, node, customImage) {
  node.innerHTML = "";
  let errorImg;
  if (!customImage) {
    errorImg = document.createElement("i");
    errorImg.classList.add("mi", "mi-Error", "font-header");
  } else {
    errorImg = document.createElement("IMG");
    errorImg.src = customImage;
  }

  let errorTitle = document.createElement("DIV");
  errorTitle.classList.add("font-title");
  errorTitle.innerHTML = err.title;

  let errorMessage = document.createElement("SPAN");
  errorMessage.classList.add("font-base");
  errorMessage.innerHTML = err.message;

  node.appendChild(errorImg);
  node.appendChild(errorTitle);
  node.appendChild(errorMessage);

  if (err.refreshRequire) {
    let _but = createButton("mi-Refresh", "Refresh page");
    _but.addEventListener("click", () => window.location.reload(true));
    node.appendChild(_but);
  }
};
const createButton = function (icon, label, tagName = "A", rightLabel = false) {
  let _button = document.createElement(tagName);
  _button.classList.add("button");

  let _buttonIcon = document.createElement("I");
  _buttonIcon.classList.add("mi", icon);

  let _buttonContent = document.createElement("SPAN");
  _buttonContent.innerHTML = label;

  if (!rightLabel) _button.appendChild(_buttonIcon);
  if (label != null && label != undefined) _button.appendChild(_buttonContent);
  if (rightLabel) _button.appendChild(_buttonIcon);
  return _button;
};

//check if scrollbar is visible
const isScrollbarVisible = (element = document.body) =>
  element.scrollHeight > element.clientHeight;

//views unloading animation
const PlayViewUnLoadingAnimation = async function () {
  CONTENT_NODE.classList.add("closing");

  //awaiting for animation to end
  await new Promise((resolve) => setTimeout(resolve, 300));
};

//Image helper for images
const ImageHelper = function (
  image,
  onload = () => {},
  onerror = () => {},
  onfinish = () => {}
) {
  if (!image.src) return;
  const imageIsNotLoaded = function () {
    image.src = "/img/image_error.webp";
    image.onload = function () {};
    onerror(image);
    onfinish(image);
  };
  const imageLoaded = function () {
    image.classList.add(GLOBAL.loaded);
    onload(image);
    onfinish(image);
  };
  return new Promise((resolve, reject) => {
    image.onload = () => resolve(imageLoaded());
    image.onerror = () => {
      imageIsNotLoaded();
      reject();
    };
  });
};
const MultipleImagesHelper = function (
  images,
  onload = () => {},
  onerror = () => {},
  onfinish = () => {},
  onloadsingle = () => {},
  onerrorsingle = () => {},
  onfinishsingle = () => {}
) {
  let promises = images.map((img) => {
    try {
      return new ImageHelper(img, onloadsingle, onerrorsingle, onfinishsingle);
    } catch (e) {
      console.error(e);
    }
  });

  return new Promise(async (resolve, reject) => {
    let result = await Promise.allSettled([Promise.all(promises)]);
    onfinish();
    if (result[0].status == "rejected") {
      onerror();
      reject();
    } else {
      onload();
      resolve();
    }
  });
};
const MultipleImagesRenderer = async function (imagesList, targetNode) {
  targetNode.innerHTML = "";

  let nodes = imagesList.map((image, index) => {
    let imgNode = document.createElement("IMG");
    //if (image.includes("bg")) imgNode.classList.add("bg");
    imgNode.alt = "img-" + index;
    imgNode.src = image;
    targetNode.appendChild(imgNode);
    return imgNode;
  });

  await MultipleImagesHelper(
    nodes,
    function () {
      targetNode.classList.replace(GLOBAL.loading, GLOBAL.loaded);
    },
    function () {
      targetNode.classList.replace(GLOBAL.loading, GLOBAL.error);
    }
  );
};

const Effect = {
  reveal: (function () {
    _isEnabled = false;
    var rev = {
      list: new Array(),
      render: function (
        element,
        highlight_effect = false,
        reveal_effect = true,
        gradients = "rgba(130,130,130,0.85)",
        hover_gradients = "rgba(130,130,130,0.0)",
        gradient_width = 128,
        gradient_hover_width = 128
      ) {
        if (Effect.reveal.isEnabled && element.style.display != "none") {
          var positionInfo = element.getBoundingClientRect();
          var menuWidth = positionInfo.width;
          var menuHeight = positionInfo.height;
          var mousePositionX = event.clientX - positionInfo.left;
          var mousePositionY = event.clientY - positionInfo.top;
          const limit = gradient_width;
          if (
            mousePositionX > -1 * limit &&
            mousePositionX < menuWidth + limit &&
            mousePositionY > -1 * limit &&
            mousePositionY < menuHeight + limit
          ) {
            var percentageX = (mousePositionX / menuWidth) * 100;
            var percentageY = (mousePositionY / menuHeight) * 100;
            if (
              percentageX > 0 &&
              percentageX < 100 &&
              percentageY > 0 &&
              percentageY < 100
            ) {
              if (reveal_effect)
                element.style.borderImage = `radial-gradient(circle at ${percentageX}% ${percentageY}%,${gradients},${hover_gradients} ${gradient_hover_width}px) 1`;
              if (highlight_effect)
                element.style.backgroundImage = `radial-gradient(circle at ${percentageX}% ${percentageY}%,rgba(128,128,128,0.1),transparent 256px)`;

              return;
            } else {
              element.style.backgroundImage = "";
            }
            if (reveal_effect)
              element.style.borderImage = `radial-gradient(circle at ${percentageX}% ${percentageY}%, ${gradients}, transparent ${gradient_width}px) 1`;
            return;
          }
        }
        element.style.borderImage = "";
        element.style.backgroundImage = "";
      },
      add: function (element, hightlight = false, reveal = true) {
        if (!element.classList.contains(GLOBAL.reveal)) {
          element.classList.add(GLOBAL.reveal);
          Effect.reveal.list.push({
            elem: element,
            arg: { hightlight, reveal },
          });
        }
      },
      remove: function (element) {
        element.classList.remove(GLOBAL.reveal);
        var s = Effect.reveal.list.findIndex(function (ele) {
          return ele.elem == element;
        });
        if (s != -1) this.list.splice(s, 1);
        return s;
      },
      start: function () {
        document.addEventListener("mousemove", function (event) {
          Effect.reveal.list.forEach((element) => {
            Effect.reveal.render(
              element.elem,
              element.arg.hightlight,
              element.arg.reveal
            );
          });
        });
      },
      discover: function () {
        const discovered = [
          ...document.body.getElementsByClassName(GLOBAL.reveal),
        ];
        discovered.forEach((element) => {
          Effect.reveal.list.push({
            elem: element,
            arg: { hightlight: false, reveal: true },
          });
        });
      },
      get isEnabled() {
        return _isEnabled;
      },
      set isEnabled(val) {
        _isEnabled = val;
        if (!val) {
          Effect.reveal.list.forEach((element) => {
            Effect.reveal.render(element.elem, element.arg.hightlight);
          });
        }
      },
    };
    return rev;
  })(),
};

const ConfigureDefaultErrors = function () {
  ViewController.addError(
    new ErrorClass(
      "item_load_error",
      "Items cannot be loaded",
      "Try refreshing the page"
    )
  );
  ViewController.addError(
    new ErrorClass(
      "item_outdated",
      "Items are outdated",
      "Try refreshing the page"
    )
  );
};

const ConfigureDOM = function () {
  getById("home-button").addEventListener("click", (e) => {
    e.preventDefault();
    ViewController.navigateToDefaultView();
  });

  getById("main-header-icons").classList.remove(GLOBAL.disabled);

  const aboutButton = getById("main-header-about-button");
  //Effect.reveal.add(aboutButton);
  aboutButton.addEventListener("click", (e) => {
    e.preventDefault();

    ViewController.navigate(APP.route.profile.viewId);
  });
  const workButton = getById("main-header-work-button");
  //Effect.reveal.add(workButton,undefined,undefined,true);
  workButton.addEventListener("click", (e) => {
    e.preventDefault();
    ViewController.navigate(APP.route.group.viewId, { routeArg: ["work"] });
  });
};
//registering views
ViewController.register(landingView, true);
ViewController.register(profileView);
ViewController.register(itemView);
ViewController.register(groupView);
ViewController.register(resourceView);

//view controller events
ViewController.addEventListener("historyEdit", (historyItem, view) => {
  //preparing history
  if (historyItem.index == 0 || view.navigationArgs.noHistoryPush)
    history.replaceState(historyItem, "", view.navigationUrl);
  else history.pushState(historyItem, "", view.navigationUrl);
});

ViewController.addEventListener("navigateToView", (view, lastView) => {
  CONTENT_NODE.classList.remove("closing");
  view.rootNode.classList.add(GLOBAL.activeView);
  APP_NODE.classList.replace(lastView?.id, view.id);
  document.body.classList.toggle("scroll-fix", !isScrollbarVisible());
});
ViewController.addEventListener("navigateFromView", async (lastView) => {
  await PlayViewUnLoadingAnimation();
  lastView.rootNode.classList.remove(GLOBAL.activeView);
});
ViewController.addEventListener("navigationRequest", () => {
  closeNavigation();
  closeSearch();
});

window.addEventListener("popstate", (event) =>
  ViewController.navigateFromHistory(event.state)
);
window.onresize = () => {
  document.body.classList.toggle("scroll-fix", !isScrollbarVisible());
};
window.addEventListener("mousemove", (event) => {
  Effect.reveal.isEnabled = true;
});
window.addEventListener("touchstart", (event) => {
  Effect.reveal.isEnabled = false;
});

//DOM events
window.addEventListener("load", async function () {
  Effect.reveal.discover();

  ConfigureDefaultErrors();
  ConfigureDOM();

  //loading items and groups
  try {
    await ItemController.loadData(storageGroups(), storageItems());
  } catch (e) {
    ViewController.invokeError("item_load_error", true);
    console.error(e);
  }

  //navigating to view based by url or by history state
  if (history.state) ViewController.navigateFromHistory(history.state);
  else
    await ViewController.navigate(START_ROUTE.target, {
      routeArg: APP.startUrl.slice(1, APP.startUrl.length - 1),
    });
  this.setTimeout(function () {
    APP_NODE.classList.replace("first-view", GLOBAL.loaded);
  }, 600);

  Effect.reveal.start();
});
