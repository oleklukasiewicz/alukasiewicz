//features for nodes, nodes lists and objects
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (let i = this.length - 1; i >= 0; i--)
        this[i].parentElement.removeChild(this[i]);
};

//resource classes declaration
let Resource = function (src, type, hash = createHash(src), props = {}) {
    return { src, type, hash, props }
}
let ResourceGroup = function (resourcesList = [], selectedResourceHash) {
    return { resources: resourcesList, selected: selectedResourceHash }
}
let ResourceDictionary = function (resourcesGroups = []) {
    return resourcesGroups;
}

//view class declaration
let View = function (id, url, data = {}, event = {}, rootNode = null, isRegisterDelayed = false, loadingMode = ViewController.loadingModes.single) {
    return {
        id,
        url,
        data,
        event,
        rootNode,
        isRegisterDelayed,
        loadingMode
    }
}

//history item class declaration
let HistoryItem = function (id, index, arg) {
    return {
        id,
        index,
        arg
    }
}

//error class declaration
let ErrorClass = function (id, title, message, triggerErrorsList = [], refreshRequire = true) {
    return {
        id,
        title,
        message,
        triggerErrorsList,
        refreshRequire
    }
}

//hashing algorythm
const createHash = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    let _s = 4294967296 * (2097151 & h2) + (h1 >>> 0);
    return _s;
};

//controllers declarations
let ViewController = (function () {
    let _controller = {};
    let _views = [];
    let _currentHistoryIndex = -1;
    let _defaultViewHistoryIndex = -1;
    let _defaultView;
    let _currentView;
    let _previousView;
    EventController.call(_controller, ["navigateToView", "navigationRequest", "navigateFromView", "navigateDefault", "historyEdit"]);
    //integrated error controller
    let _errors = [];
    let _errorHistory = [];
    let _currentGlobalError;

    _controller.addError = function (error) {
        if (_errors.findIndex((_error) => error.id == _error.id) == -1)
            _errors.push(error);
    }
    _controller.invokeError = function (errorId, globalInvoke = false) {
        let __error = _errors.find((_error) => (errorId == _error.id) || (errorId.id == _error.id));
        let _errorCanBeInvoked = true;
        __error.triggerErrorsList.forEach((err) => {
            if (_errorHistory.includes(err))
                _errorCanBeInvoked = false;
        });
        if (_errorCanBeInvoked) {
            if (globalInvoke) {
                _views.forEach((view) => view.registered ? view.event?.onError.call(view, __error) : "");
                _currentGlobalError = __error;
            }
            else
                _currentView.event?.onError.call(_currentView, __error);
            _errorHistory.push(__error.id);
        }
    }

    //view controller methods
    let _getViewById = (id) => _views.find((view) => view.id == id) || _defaultView;
    let _registerDelayedView = function (view) {
        if (view.isRegisterDelayed && !view.registered) {
            if (_currentGlobalError)
                view.event?.onError.call(view, _currentGlobalError);
            view.event.onRegister?.call(view);
            view.registered = true;
        }
    }
    let _generateRootNode = function (view) {
        if (typeof (view.rootNode) == "string")
            view.rootNode = getById(view.rootNode);
    }
    let _unLoadView = function (view) {
        if (view.loadingMode == _controller.loadingModes.always)
            view.isLoaded = false;
    }
    let _invokeLoadEvent = async function (view, arg) {
        if (!view.isLoading && !view.isLoaded) {
            view.isLoading = true;
            await view.event.onLoad?.call(view, arg);
        }
        return view;
    }
    let _invokeLoadFinishEvent = async function (view) {
        if (view.isLoading && !view.isLoaded) {
            view.isLoading = false;
            view.isLoaded = true;
            await view.event.onLoadFinish?.call(view);
        }
    }
    _controller.navigate = async function (id, arg = {}) {

        _controller.invokeEvent("navigationRequest", [id, _currentView]);
        let _lastRouteArg = _currentView?.lastNavigationArguments?.routeArg || [];

        //canceling navigation when is navigating to the same view with the same routeArg
        if (id == _currentView?.id && (arg.routeArg?.join("/") == _lastRouteArg.join("/")))
            return;

        //getting view
        let _target = _getViewById(id);

        //unloading old view if exist
        if (_currentView) {
            //finishing loading view if needed, unloading and generating node if needed
            _invokeLoadFinishEvent(_currentView);
            _unLoadView(_currentView);
            _generateRootNode(_currentView);

            //navigating
            _currentView.event.onNavigateFrom?.call(_currentView, arg);
            _controller.invokeEvent("navigateFromView", [_currentView, arg]);
            _previousView = _currentView;
        }

        //changing url and adding history state
        if (!arg.noHistoryPush) {
            _currentHistoryIndex++;
            if (_target == _defaultView)
                _defaultViewHistoryIndex = _currentHistoryIndex;

            //invoking history edit event
            _controller.invokeEvent("historyEdit", [
                Object.assign(new HistoryItem(_target.id, _currentHistoryIndex, {
                    routeArg: arg.routeArg
                }), {
                    defaultViewHistoryIndex: _defaultViewHistoryIndex
                }), _target]
            );
        }

        //setting current view
        _currentView = _target;
        _currentView.lastNavigationArguments = arg;
        _generateRootNode(_currentView);

        //registering and invoking navigate event
        await _registerDelayedView(_currentView);
        _controller.invokeEvent("navigateToView", [_currentView, _previousView, arg]);
        await _currentView.event.onNavigate?.call(_currentView, arg);

        //loading view if needed
        if (_currentView.loadingMode != _controller.loadingModes.never)
            await _invokeLoadEvent(_currentView, arg).then((view) => _invokeLoadFinishEvent(view))
    }
    _controller.register = async function (view, isDefault = false) {
        _views.push(view);
        if (!view.isRegisterDelayed)
            view.event.onRegister?.call(view);
        if (isDefault) _defaultView = view;
    }
    _controller.navigateToDefaultView = function (arg) {
        if (_currentView != _defaultView)
            _controller.invokeEvent("navigateDefault", [arg]);
    }
    _controller.back = function () {
        if (history.state.index == 0)
            _controller.navigateToDefaultView();
        else
            history.back();
    }
    _controller.loadingModes = {
        single: "single",
        always: "always",
        never: "never"
    }
    _controller.navigateFromHistory = function (historyItem) {
        _currentHistoryIndex = historyItem.index;
        _defaultViewHistoryIndex = historyItem.defaultViewHistoryIndex;
        _controller.navigate(historyItem.id, Object.assign({
            noHistoryPush: true
        }, historyItem.arg));
    }
    return _controller;
}());

let ItemController = (function () {
    let _routes = [];
    let _storage = [];
    let _itemsLoaded = false;
    let _groupRoutes = [];
    let _groupsLoaded = false;
    let _defaultGroup;
    let _controller = {};
    EventController.call(_controller, ["fetchGroup", "fetchGroupFinish", "fetchItem", "fetchItemFinish"]);

    //adding error types for item and group not errors
    ViewController.addError(new ErrorClass("item_not_found", "Item don't exist", "We don't have what you're looking for", [
        "item_outdated",
        "item_load_error",
        "group_not_found"
    ]));
    ViewController.addError(new ErrorClass("group_not_found", "Group don't exist", "We don't have what you're looking for", [
        "item_outdated",
        "item_load_error"
    ]));
    ViewController.addError(new ErrorClass("item_not_fetched", "Item cannot be loaded", "Check your internet connection"));
    let _getResourceGroupByHash = function (dictionary, hash) {
        let targetResource;
        let target = dictionary.find((resGroup) => {
            targetResource = resGroup.resources.find((res => res.hash === hash))
            return targetResource ? true : false;
        });
        target.selected = targetResource;
        return target;
    }
    let _downloadViaAJAX = async function (item) {
        return new Promise((resolve, reject) => {
            let xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

            //loading item content
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200)
                        resolve(JSON.parse(this.responseText));
                    else {
                        ViewController.invokeError("item_not_fetched", false);
                        reject("Error in AJAX request");
                    }
                }
            };

            //sending
            xmlhttp.open("GET", APP.itemFolder + item.folder + APP.resourceFolder + APP.itemContentFileName, true);
            xmlhttp.send();
        });
    }
    //loading full item content
    let _loadFullItem = async function (item) {
        if (!item) {
            ViewController.invokeError("item_not_found");
            return;
        }

        //TODO: check if components.js and components.css are downloaded id not -> download
        if (!item.isItemLinkToWeb && !item.isContentCached) {
            //getting item content
            let _content = await _downloadViaAJAX(item, item.folder);

            //TODO: check content component version if newer -> download new version of components.css and js

            //creating resource dictionary and adding content.json file into it
            Object.assign(item, _content, {
                resources: new ResourceDictionary([
                    new ResourceGroup([
                        new Resource(APP.itemContentFileName, "item", null)])])
            });

            //building item structure
            ItemBuilder(item);

            if (_content?.version == APP.version)
                item.isContentCached = true;
        }
        return item;
    }
    let _generateId = (id) => encodeURIComponent(id.toLowerCase().replaceAll(" ", "-"));
    let _generateValidStorageObject = function (obj) {
        obj.id = obj.id || _generateId(obj.title);
        obj.createDate = new ItemDate(obj.createDate);
        if (obj.modifyDate)
            obj.modifyDate = new ItemDate(obj.modifyDate);
    }
    let _generateGroup = function (group) {
        group.content = [];
        group.type = GLOBAL.group;
        _generateValidStorageObject(group);
        _groupRoutes.push(new Route(group.id, group));
        return group;
    }
    let _getGroupByRoute = (id) => _groupRoutes.find((route) => route.source == id)?.target;
    let _getItemByRoute = (id) => _routes.find((route) => route.source == id)?.target;
    _controller.fetchGroups = async function (groups) {
        await Promise.all(groups.map(async (group) => {
            _generateGroup(group);
            _storage.push(group);
            group.aliases?.forEach((source) => _groupRoutes.push(new Route(source, group)));
            if (group.isDefault)
                _defaultGroup = group;
            await _controller.invokeEvent("fetchGroup", [group]);
        }));
        _storage.forEach((group) => group.groups?.forEach((_group) => _getGroupByRoute(_group)?.content.push(group)));
        await _controller.invokeEvent("fetchGroupFinish");
        _groupsLoaded = true;
    }
    _controller.fetchItems = async function (items) {
        await Promise.all(items.map(async (item) => {
            _generateValidStorageObject(item);
            item.type = GLOBAL.item;
            _routes.push(new Route(item.id, item));
        }));
        items.sort(itemsDefaultSort);
        await Promise.all(items.map(async (item) => {
            _defaultGroup.content.push(item);
            item.aliases?.forEach((source) => _routes.push(new Route(source, item)));
            item.groups?.forEach((group) => _getGroupByRoute(group)?.content.push(item));
            await _controller.invokeEvent("fetchItem", [item]);
        }));
        await _controller.invokeEvent("fetchItemFinish", []);
        _itemsLoaded = true;
    }
    _controller.loadModes = {
        group: "group",
        item: "item",
        allItems: "allitems",
        all: "all"
    }
    Object.defineProperties(_controller, {
        storage: {
            get: () => _storage
        },
        isItemsLoaded: {
            get: () => _itemsLoaded
        },
        isGroupsLoaded: {
            get: () => _groupsLoaded
        },
        getGroupById: {
            value: _getGroupByRoute
        },
        getItemSnapshotById: {
            value: (id) => _getItemByRoute(id)
        },
        getItemById: {
            value: async (id) => await _loadFullItem(_getItemByRoute(id))
        },
        findResourceByHash:
        {
            value: (resourceDictionary, hash) => _getResourceGroupByHash(resourceDictionary, hash)
        }
    });
    return _controller;
}());

const landingView = new View(VIEW.landing, APP.url.landing, { scrollY: -1, itemsLoaded: false }, {
    onNavigate: function () {
        if (this.data.scrollY >= 0)
            window.scroll(0, this.data.scrollY)
        document.title = APP.name;
        if (!ItemController.isItemsLoaded)
            ViewController.invokeError("item_load_error");
    },
    onRegister: function () {
        let _pButton = getById("profile-link-button");
        _pButton.href = APP.url.profile;
        _pButton.addEventListener("click", () => {
            event.preventDefault();
            ViewController.navigate(VIEW.profile);
        });
        this.data.iList = getById("main-list");
    },
    onNavigateFrom: function () {
        this.data.scrollY = window.scrollY;
        this.rootNode.classList.remove(GLOBAL.error);
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
        this.data.iList.getElementsByClassName(GLOBAL.dataNode + " no-data").remove();
    },
    onLoad: async function () {
        this.rootNode.classList.add(GLOBAL.loading);
        if (ItemController.isItemsLoaded && ItemController.isGroupsLoaded)
            StorageResponseBuilder(await ItemController.getGroupById("landing"), this.data.iList, 1, -1)
    },
    onError: function (err) {
        this.rootNode.classList.add(GLOBAL.error);
        createErrorMsg(err, getById("landing-error-node"));
    }
}, VIEW.landing, true, ViewController.loadingModes.single);

const profileView = new View(VIEW.profile, APP.url.profile, {}, {
    onNavigate: () => {
        window.scroll(0, 0);
        document.title = "About me - " + APP.name
    }
}, VIEW.profile, false, ViewController.loadingModes.never);

const itemView = new View(VIEW.item, APP.url.item, { currentItem: null }, {
    onNavigate: () => window.scroll(0, 0),
    onNavigateFrom: function () {
        this.rootNode.classList.remove(GLOBAL.error);
    },
    onRegister: function () {
        //getting nodes
        this.data.iTitle = getById("item-title");
        this.data.iContent = getById("item-content");
        this.data.iInfo = getById("item-info");
    },
    onLoad: async function (arg) {
        this.rootNode.classList.add(GLOBAL.loading);
        if (ItemController.isItemsLoaded) {
            //getting 
            let item;
            try {
                item = await ItemController.getItemById(arg.routeArg[0]);
            } catch { return; }
            if (!item || this.data.currentItem == item)
                return;
            if (item.isItemLinkToWeb) {
                window.open(item.isItemLinkToWeb, '_blank').focus();
                ViewController.navigateToDefaultView();
                return;
            }
            this.data.currentItem = item;

            //preparing item info
            document.title = item.title + " - " + APP.name;
            this.data.iTitle.innerHTML = item.title;
            this.data.iInfo.innerHTML = item.createDate.toHTMLString() + ((item.modifyDate) ? " <u class='dotted-separator'></u> Updated " + item.modifyDate.toHTMLString() : "");

            //preparing content
            this.data.iContent.innerHTML = "";
            item.content.forEach(async (content) => this.data.iContent.append(await ItemComponentBuilder(content, item.folder, item)));
        } else
            ViewController.invokeError("item_load_error");
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
    },
    onError: function (err) {
        this.rootNode.classList.add(GLOBAL.error);
        createErrorMsg(err, getById("item-error-node"));
    }
}, VIEW.item, true, ViewController.loadingModes.always);

const groupView = new View(VIEW.group, APP.url.group, { scrollY: -1 }, {
    onRegister: function () {
        let _data = this.data;
        _data.groupData = getById("group-data")
        _data.groupList = getById("group-list");
        _data.groupTitle = getById("group-title");
        _data.groupInfo = getById("group-info");
    },
    onNavigate: () => window.scroll(0, 0),
    onNavigateFrom: function () {
        Array.prototype.forEach.call(this.data.groupList.getElementsByClassName(GLOBAL.dataNode), (node) =>
            node.classList.add("loading", "no-data"));
        this.rootNode.classList.remove(GLOBAL.error);
    },
    onLoad: async function (arg) {
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
        this.data.groupInfo.innerHTML = group.createDate.toHTMLString() + " <u class='dotted-separator'></u> " + group.content.length + "&nbsp;" + (group.content.length != 1 ? "items" : "item");
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
    }
}, VIEW.group, true, ViewController.loadingModes.always);

const resourceView = new View(VIEW.resource, APP.url.resource, {},
    {
        onNavigate: function () {
            document.title = "Gallery - " + APP.name
        },
        onRegister: function () {
            //adding image errors
            ViewController.addError(new ErrorClass("image_not_found", "Image not found", "Try refresh page", [
                "item_not_found",
                "item_outdated",
                "item_load_error"
            ], true));
            let _sender = this;

            //creating slider
            this.data.resSlider = new ResourceSlider();

            //getting nodes
            let _resList = this.data.resList = getById("image-viewer-list");
            let _prevBtn = getById("image-viewer-prev");
            let _nextBtn = getById("image-viewer-next");
            _nextBtn.addEventListener("click", this.data.resSlider.next);
            _prevBtn.addEventListener("click", this.data.resSlider.previous);

            //adding close button
            getById("image-viewer-close").addEventListener("click", ViewController.back);
            let _setButtonsDisplay = function (isHidden) {
                _nextBtn.classList.toggle(GLOBAL.hidden, isHidden);
                _prevBtn.classList.toggle(GLOBAL.hidden, isHidden);
            }

            //adding event to slider
            this.data.resSlider.addEventListener("render", function (res, index, oldres, old) {
                _resList.children[index].classList.add(GLOBAL.activeView);
                _resList.children[old]?.classList.remove(GLOBAL.activeView);
                history.state.arg.routeArg = [_sender.data.currentItem.id, res.hash];
                history.replaceState(history.state, '', "/" + _sender.url + "/" + _sender.data.currentItem.id + "/" + res.hash);
            });
            this.data.resSlider.addEventListener("load", async function (res) {
                let _img = document.createElement("IMG");
                _img.src = res.src;
                _resList.appendChild(_img);
                await ImageHelper(_img);
            });
            this.data.resSlider.addEventListener("loadFinish", (res) =>
                _setButtonsDisplay(res.length < 2))
            this.data.resSlider.addEventListener("close", () => {
                _resList.innerHTML = "";
                _setButtonsDisplay(true);
            });

            GestureBuilder(this.rootNode, {
                right: this.data.resSlider.next,
                left: this.data.resSlider.previous
            });
        },
        onLoad: async function (arg) {

            //setting timeout for loading animation
            setTimeout(function (_sender) {
                if (!_sender.isLoaded)
                    _sender.rootNode.classList.add(GLOBAL.loading);
            }, 300, this);

            //loading item and resource group
            this.data.currentItem = arg.currentItem || await ItemController.getItemById(arg.routeArg[0]);
            let resourceGroup = ItemController.findResourceByHash(this.data.currentItem.resources, arg.routeArg[1]);
            if (!resourceGroup) {
                ViewController.invokeError("image_not_found", false);
                return;
            }
            //loading resources to slider
            await this.data.resSlider.loadResources(resourceGroup.resources, resourceGroup.selected);
        },
        onLoadFinish: function () {
            this.rootNode.classList.remove(GLOBAL.loading);
        },
        onNavigateFrom: function () {
            this.rootNode.classList.remove(GLOBAL.error);
            this.data.resSlider.close();
        },
        onError: function (err) {
            this.rootNode.classList.add(GLOBAL.error);
            createErrorMsg(err, getById("resources-error-node"));
        }
    }, VIEW.resource, true, ViewController.loadingModes.always);

//registering views
ViewController.register(landingView, true);
ViewController.register(profileView);
ViewController.register(itemView);
ViewController.register(groupView);
ViewController.register(resourceView);

//view controller events
ViewController.addEventListener("historyEdit", (historyItem, view) => {
    //url params are getted from navigation controller from navigate() arg
    let _url = "/" + view.url + ((historyItem.arg.routeArg?.length > 0) ? ("/" + (historyItem.arg.routeArg?.join('/') || '')) : "");
    if (historyItem.index == 0)
        history.replaceState(historyItem, '', _url)
    else
        history.pushState(historyItem, '', _url);
});
ViewController.addEventListener("navigationRequest", () => hideNavigation());
ViewController.addEventListener("navigateDefault", (arg) => {
    let _homeIndex = history.state.defaultViewHistoryIndex;
    let _indexDelta = _homeIndex - history.state.index;
    if (_homeIndex != -1 && _indexDelta != 0)
        history.go(_indexDelta);
    else
        ViewController.navigate(null, arg);
});
ViewController.addEventListener("navigateToView", (view, lastView) => {
    view.rootNode.classList.add(GLOBAL.activeView);
    APP_NODE.classList.replace(lastView?.id, view.id);
    document.body.classList.toggle("scroll-fix", !isScrollbarVisible());
    setNavigationState(false);
});
ViewController.addEventListener("navigateFromView", (lastView) => lastView.rootNode.classList.remove(GLOBAL.activeView));

//DOM events
window.addEventListener("load", async function () {
    //adding errors
    ViewController.addError(new ErrorClass("item_load_error", "Items cannot be loaded", "Try refreshing the page"));
    ViewController.addError(new ErrorClass("item_outdated", "Items are outdated", "Try refreshing the page"));

    //adding home button event
    getById("home-button").addEventListener("click", (e) => {
        e.preventDefault();
        ViewController.navigateToDefaultView();
    });
    getById("main-header-about-button").addEventListener("click", (e) => {
        e.preventDefault();
        ViewController.navigate(VIEW.profile);
    });
    getById("main-header-work-button").addEventListener("click", (e) => {
        e.preventDefault();
        ViewController.navigate(VIEW.group, { routeArg: ["work"] });
    });

    //loading items and groups
    try {
        await ItemController.fetchGroups(storageGroups()).then(() => ItemController.fetchItems(storageItems()));
    } catch (e) {
        ViewController.invokeError("item_load_error", true);
        console.error(e);
    }

    //navigating to view based by url or by history state
    if (history.state)
        ViewController.navigateFromHistory(history.state);
    else
        await ViewController.navigate(START_ROUTE.target, {
            routeArg: START_URL.slice(1, START_URL.length - 1)
        });
});
window.addEventListener("popstate", (event) =>
    ViewController.navigateFromHistory(event.state));
window.onresize = () =>
    document.body.classList.toggle("scroll-fix", !isScrollbarVisible());

//check if scrollbar is visible
let isScrollbarVisible = (element = document.body) => element.scrollHeight > element.clientHeight;

//default sort method for items
let itemsDefaultSort = function (a, b) {
    let aDate = a.modifyDate || a.createDate;
    let bDate = b.modifyDate || b.createDate;
    return bDate.compare(aDate);
}

//item tile creating method
let createItemTile = async function (node, item) {
    if (node.nodeName != "A") {
        let oldNode = node;
        node = document.createElement("A");
        oldNode.parentElement.replaceChild(node, oldNode);
    }
    let imageSrc = APP.itemFolder + item.folder + item.tile.image;
    node.className = "item " + GLOBAL.dataNode + " " + GLOBAL.loading + " index-" + item.responseIndex;

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

    let nodeContent = document.createElement("SPAN");
    nodeContent.classList.add("font-base");
    nodeContent.innerHTML = item.tile.content;

    let nodeLabels = document.createElement("DIV");
    nodeLabels.classList.add("labels");

    let nodeButton = createButton(item.isItemLinkToWeb ? "mi-OpenInNewWindow" : "mi-BackMirrored", item.isItemLinkToWeb ? "Open link" : "Read more", "DIV", true);

    nodeLabels.appendChild(nodeButton);

    let date = item.modifyDate || item.createDate;
    let nodeUpdateLabel = document.createElement("DIV");
    nodeUpdateLabel.classList.add("label", "font-caption");
    let nodeUpdateLabelIcon = document.createElement("I");
    if (item.modifyDate)
        nodeUpdateLabelIcon.classList.add("mi", "mi-Update");
    nodeUpdateLabel.innerHTML = " &nbsp;&nbsp;" + date.toHTMLString();
    nodeUpdateLabel.insertBefore(nodeUpdateLabelIcon, nodeUpdateLabel.firstChild);
    nodeLabels.appendChild(nodeUpdateLabel);
    node.appendChild(nodeImgContainer);
    node.appendChild(nodeTitle);
    node.appendChild(nodeContent);
    node.appendChild(nodeLabels);

    //loading image of tile
    await new ImageHelper(_iImage, () => {
        _iImage.style = item.arg?.tileImageStyle || "";
    }, () => {
        item.isTileImageNotLoaded = true;
        removeResourceFromCache(imageSrc);
    });

    //settings up events
    node.classList.replace(GLOBAL.loading, GLOBAL.loaded);
    node.onclick = function () {
        event.preventDefault();
        item.isItemLinkToWeb ?
            window.open(item.isItemLinkToWeb, '_blank').focus()
            :
            ViewController.navigate(VIEW.item, { routeArg: [item.id] });
    };
    node.href = item.isItemLinkToWeb || APP.url.item + item.id;

    //loading item
    setTimeout(() => node.classList.remove(GLOBAL.loaded), 300);
    return node;
}

//group tile creating method
let createGroupTile = function (node, group) {
    if (node.nodeName != "DIV") {
        let oldNode = node;
        node = document.createElement("DIV");
        oldNode.parentElement.replaceChild(node, oldNode);
    }
    node.innerHTML = "";
    node.className = "group " + GLOBAL.dataNode;

    let nodeTitle = document.createElement("SPAN");
    nodeTitle.classList.add("font-title");
    nodeTitle.innerHTML = group.title;

    let nodeButton = createButton("mi-ShowAll", "Show all");

    node.appendChild(nodeTitle);
    node.appendChild(nodeButton);


    //settings up tile events
    node.children[1].onclick = function () {
        event.preventDefault();
        ViewController.navigate(VIEW.group, { routeArg: [group.id] });
    };
    node.children[1].href = APP.url.group + group.id;
    return node;
}

//universal slider class for resourceMap objects
let ResourceSlider = function () {
    let _res = [];
    let _currentIndex;
    let _oldIndex;
    EventController.call(this, ["load", "loadFinish", "next", "previous", "render", "remove", "close"]);
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

    let _renderIndex = async function (index) {
        _oldIndex = _currentIndex;
        _currentIndex = index;
        await _sender.invokeEvent("render", [_res[_currentIndex], _currentIndex, _res[_oldIndex], _oldIndex]);
    }
    this.loadResources = async function (resourcesList, current) {
        _res = resourcesList;
        await Promise.all(_res.map(async (res, index) => await _sender.invokeEvent("load", [res, index])));
        _renderIndex(current ? _res.findIndex((res) => res.hash == current.hash) : 0);
        await this.invokeEvent("loadFinish", [_res]);
    }
    this.close = async () => {
        _oldIndex = -1;
        _currentIndex = -1;
        await _sender.invokeEvent("close", [_res[_currentIndex], _currentIndex])
    };
    this.next = async function () {
        let _index = _currentIndex + 1;
        if (_index >= _res.length)
            _index = 0;
        if (_currentIndex == _index)
            return;
        await _renderIndex(_index);
        await _sender.invokeEvent("next", [_res[_currentIndex], _index])
    }
    this.previous = async function () {
        let _index = _currentIndex - 1;
        if (_index < 0)
            _index = _res.length - 1;
        if (_currentIndex == _index)
            return;
        await _renderIndex(_index);
        await _sender.invokeEvent("previous", [_res[_currentIndex], _index])
    }
}

//gesture support for element
let GestureBuilder = function (node, event = {}) {

    const _directions = {
        up: "up",
        down: "down",
        left: "left",
        right: "right"
    };

    let _startPos = {};
    let _endPos = {};

    const MIN_DIST = 100;

    let _directionSolver = function (startX, startY, endX, endY) {
        let _distX = Math.abs(endX - startX);
        let _distY = Math.abs(endY - startY);

        let _isVertical = (_distX < _distY)

        if (startX < endX && !_isVertical && _distX >= MIN_DIST)
            return _directions.left;
        if (endX < startX && !_isVertical && _distX >= MIN_DIST)
            return _directions.right;
        if (startY < endY && _isVertical && _distY >= MIN_DIST)
            return _directions.up;
        if (endY < startY && _isVertical && _distY >= MIN_DIST)
            return _directions.down;
    }
    node.addEventListener("touchstart", (e) => {
        _startPos.x = e.touches[0].clientX;
        _startPos.y = e.touches[0].clientY;
    });

    node.addEventListener("touchend", (e) => {
        _endPos.x = e.changedTouches[0].clientX;
        _endPos.y = e.changedTouches[0].clientY;
        let _direction = _directionSolver(_startPos.x, _startPos.y, _endPos.x, _endPos.y);
        event[_direction]?.call(node);
    });

}

let StorageResponseIndexer = function (response, depth = 1, limit = 3, startIndex = 0, limitOfDepth = 3) {
    let _indexedItems = [];
    let _groupItemIndex = 0;
    let _groupIndex = 0;
    let _currentIndex = startIndex;
    let _addIntoResponse = function (entry) {
        if (!entry) return;
        entry.isIndexed = true;
        //adding item into response
        _indexedItems.push({ index: _currentIndex, obj: entry, groupItemIndex: _groupItemIndex });
        _groupItemIndex += 1;
        if (limit > 0)
            limit -= 1;
        _currentIndex += 1;
    }
    let _addGroupIntoResponse = function (entry) {
        if (!entry) return;
        _groupItemIndex = 0;
        _groupIndex += 1;
        entry.isIndexed = true;
        if (depth > 0) {
            //adding group into response
            _indexedItems.push({ index: _currentIndex, obj: entry, groupIndex: _groupIndex });
            //getting nested groups into response
            _indexedItems = _indexedItems.concat(StorageResponseIndexer(entry, depth - 1, limitOfDepth, _currentIndex + 1));
            //setting current index into index of last item from recursion
            _currentIndex = _indexedItems[_indexedItems.length - 1].index + 1;
        }
    }
    //display items or groups from arguments
    if (depth == 0)
        response.arg?.itemsOrder?.forEach((value, index) => _addIntoResponse(typeof (value) == "number" ? response.content[value] : ItemController.getItemSnapshotById(value)));
    response.arg?.groupsOrder?.forEach((value, index) => _addGroupIntoResponse(response.content.find(contentEntry => contentEntry.id == value && contentEntry.type == GLOBAL.group)));
    response.content?.forEach((entry, index) => {
        if (entry.type == GLOBAL.group) {
            if (!entry.isIndexed)
                _addGroupIntoResponse(entry);
        } else {
            //checking is item count in group display limit, getting only not indexed items or required to fill group
            if (((limit > 0) && (!entry.isIndexed || (response.content.length - index) <= limit)) || limit == -1)
                _addIntoResponse(entry);
        }
    });
    return _indexedItems;
}
let StorageResponseBuilder = async function (response, targetNode = document.createElement("DIV"), depth = 1, limit = 3) {
    let _items = [...targetNode.getElementsByClassName(GLOBAL.dataNode)];
    let _indexedItems = StorageResponseIndexer(response, depth, limit, 0);
    await Promise.all(_indexedItems.map(async (entry) => {
        entry.obj.isIndexed = false;
        entry.obj.responseIndex = (entry.groupItemIndex == undefined) ? entry.groupIndex : entry.groupItemIndex;
        entry.obj.type == GLOBAL.group ?
            await createGroupTile(_items[entry.index] || targetNode.appendChild(document.createElement("div")), entry.obj)
            :
            await createItemTile(_items[entry.index] || targetNode.appendChild(document.createElement("a")), entry.obj);
    }));
}

//error message node builder
let createErrorMsg = function (err, node, customImage) {
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
}
let createButton = function (icon, label, tagName = "A", rightLabel = false) {
    let _button = document.createElement(tagName);
    _button.classList.add("button");

    let _buttonIcon = document.createElement("I");
    _buttonIcon.classList.add("mi", icon);

    let _buttonContent = document.createElement("SPAN");
    _buttonContent.innerHTML = label;

    if (!rightLabel) _button.appendChild(_buttonIcon);
    _button.appendChild(_buttonContent);
    if (rightLabel) _button.appendChild(_buttonIcon);
    return _button;
}
//Image helper for images
let ImageHelper = function (image, onload = () => { }, onerror = () => { }) {
    let imageIsNotLoaded = function () {
        image.src = "/img/image_error.webp";
        image.onload = function () { }
        onerror(image);
    }
    return new Promise((resolve) => {
        image.onload = () => resolve(onload(image));
        image.onerror = () => resolve(imageIsNotLoaded());
    });
}

//item date class declaration
let ItemDate = function (day, month, year) {
    this.toHTMLString = function (months = [
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
        "Dec"
    ]) {
        return (this.day + "&nbsp;" + months[this.month - 1] + ",&nbsp;" + this.year)
    }
    this.toString = function () {
        return this.year.toString() + (this.month < 10 ? '0' + this.month.toString() : this.month.toString()) + (this.day < 10 ? '0' + this.day.toString() : this.day.toString());
    }
    this.compare = function (date) {
        let intDate = parseInt(date);
        if (intDate > parseInt(this.toString()))
            return -1;
        else
            if (intDate < parseInt(this.toString()))
                return 1;
            else
                return 0;
    }

    if (typeof (arguments[0]) === 'object') {
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