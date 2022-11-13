//features for nodes, nodes lists and objects
Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (let i = this.length - 1; i >= 0; i--)
        this[i].parentElement.removeChild(this[i]);
};

//hashing algorythm
const CREATE_HASH = function (str, seed = 0) {
    let _h1 = 0xdeadbeef ^ seed;
    let _h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        _h1 = Math.imul(_h1 ^ ch, 2654435761);
        _h2 = Math.imul(_h2 ^ ch, 1597334677);
    }
    _h1 = Math.imul(_h1 ^ (_h1 >>> 16), 2246822507) ^ Math.imul(_h2 ^ (_h2 >>> 13), 3266489909);
    _h2 = Math.imul(_h2 ^ (_h2 >>> 16), 2246822507) ^ Math.imul(_h1 ^ (_h1 >>> 13), 3266489909);
    let _s = 4294967296 * (2097151 & _h2) + (_h1 >>> 0);
    return _s;
};

//resource classes declaration
let Resource = function (src, type, hash = CREATE_HASH(src), props = {}) {
    return { src, type, hash, props }
}
let ResourceGroup = function (resourcesList = [], selectedResourceHash) {
    this.addResource = function (resource) {
        if (Array.isArray(resource))
            resource.forEach(_res => resourcesList.push(_res));
        else
            resourcesList.push(resource);
    }
    this.resources = resourcesList;
    this.selected = selectedResourceHash;
}

let ResourceDictionary = function (resourcesGroups = []) {
    let _dictionary = this;
    this.addGroup = (group) => (_dictionary.push(group) - 1);

    resourcesGroups.forEach((item) => this.push(item));
}
ResourceDictionary.prototype = new Array;
ResourceDictionary.constructor = ResourceDictionary;

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
let ErrorClass = function (id, title, message, triggerErrorsList = [], refreshRequire = true) {
    return {
        id,
        title,
        message,
        triggerErrorsList,
        refreshRequire
    }
}
let HistoryItem = function (id, index, defaultViewHistoryIndex, arg) {
    return {
        id,
        index,
        defaultViewHistoryIndex,
        arg
    }
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
        return (months[this.month - 1] + "&nbsp;" + this.day + ",&nbsp;" + this.year)
    }
    this.toString = function () {
        return this.year.toString() + (this.month < 10 ? '0' + this.month.toString() : this.month.toString()) + (this.day < 10 ? '0' + this.day.toString() : this.day.toString());
    }
    this.compare = function (date) {
        let _intDate = parseInt(date);
        if (_intDate > parseInt(this.toString()))
            return -1;
        else
            if (_intDate < parseInt(this.toString()))
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

//event sub controller declaration
let EventController = function (eventsList = []) {
    let _events = {}

    eventsList.forEach((eventName) => _events[eventName] = []);

    this.addEventListener = (event, listener = function () { }) => _events[event].push(listener);
    this.invokeEvent = async (event, arg = []) => await Promise.all(_events[event].map((event) => event(...arg)));
}

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
        let _previousViewArgs = _currentView?.navigationArgs?.routeArg || [];

        //canceling navigation when is navigating to the same view with the same routeArg
        if (id == _currentView?.id && ((arg.routeArg?.join("/") || "") == _previousViewArgs.join("/")))
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

        //adding history default index
        if (!arg.noHistoryPush) {
            _currentHistoryIndex++;
            if (_target == _defaultView)
                _defaultViewHistoryIndex = _currentHistoryIndex;
        }

        let _historyItem = new HistoryItem(_target.id, _currentHistoryIndex, _defaultViewHistoryIndex, {
            routeArg: arg.routeArg
        });

        //setting current view
        _currentView = _target;
        _currentView.navigationArgs = arg;
        _currentView.navigationUrl = "/" + _currentView.url + ((arg.routeArg?.length > 0) ? ("/" + (arg.routeArg?.join('/') || '')) : "");
        _currentView.historyItem = _historyItem;

        _generateRootNode(_currentView);

        //invoking history and url edit event
        await _controller.invokeEvent("historyEdit",
            [_historyItem, _target]
        );

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
    }

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

    let _downloadViaAJAX = async function (item) {
        return new Promise((resolve, reject) => {
            let _xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

            //loading item content
            _xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        try {
                            resolve(JSON.parse(this.responseText));
                        } catch (e) {
                            console.error("JSON parse error: " + path);
                        }
                    }
                    else {
                        ViewController.invokeError("item_not_fetched", false);
                        reject("Error in AJAX request" + item.id);
                    }
                }
            }

            //sending
            _xmlhttp.open("GET", ITEM.folder + item.folder + ITEM.resourceFolder + "/" + ITEM.fileName, true);
            _xmlhttp.send();
        });
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
    let _getResourceGroupByHash = function (dictionary, hash) {
        let targetResource;
        let target = dictionary.find((resGroup) => {
            targetResource = resGroup.resources.find((res => res.hash == hash))
            return targetResource ? true : false;
        });

        target.selected = targetResource;
        return target;
    }

    let _fetchGroups = async function (groups) {
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
    let _fetchItems = async function (items, sortingMethod) {
        await Promise.all(items.map(async (item) => {
            _generateValidStorageObject(item);
            item.type = GLOBAL.item;
            _routes.push(new Route(item.id, item));
        }));
        items.sort(sortingMethod);
        await Promise.all(items.map(async (item) => {
            _defaultGroup.content.push(item);
            item.aliases?.forEach((source) => _routes.push(new Route(source, item)));
            item.groups?.forEach((group) => _getGroupByRoute(group)?.content.push(item));
            await _controller.invokeEvent("fetchItem", [item]);
        }));
        await _controller.invokeEvent("fetchItemFinish", []);
        _itemsLoaded = true;
    }
    //loading full item content
    let _fetchItemContent = async function (item) {
        if (!item) {
            ViewController.invokeError("item_not_found");
            return;
        }

        //TODO: check if item.js and item.css are downloaded if not -> download
        if (!item.isLink && !item.isContentCached) {
            //getting item content
            let _content = await _downloadViaAJAX(item, item.folder);

            //TODO: check content component version if newer -> download new version of item.css and js

            ItemStuctureBuilder(item, _content);

            //indicating content is cached
            item.isContentCached = true;
        }
        return item;
    }
    _controller.loadData = async function (groups, items, itemsSorting = _itemsSortingMethod) {
        if (!_groupsLoaded)
            await _fetchGroups(groups);
        if (!_itemsLoaded)
            await _fetchItems(items, itemsSorting);
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
            value: async (id) => await _fetchItemContent(_getItemByRoute(id))
        },
        findResourceByHash:
        {
            value: (resourceDictionary, hash) => _getResourceGroupByHash(resourceDictionary, hash)
        }
    });
    return _controller;
}());

//views declarations
const landingView = new View(VIEW.landing, APP.url.landing, { scrollY: -1, itemsLoaded: false }, {
    onNavigate: function () {
        //restoring scroll
        if (this.data.scrollY >= 0)
            window.scroll(0, this.data.scrollY)
        document.title = APP.name;

        //error if items are not loaded before view is displayed
        if (!ItemController.isItemsLoaded)
            ViewController.invokeError("item_load_error");
    },
    onRegister: function () {

        //set "About me" button
        let _pButton = getById("profile-link-button");
        _pButton.href = APP.url.profile;
        _pButton.addEventListener("click", () => {
            event.preventDefault();
            ViewController.navigate(VIEW.profile);
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
        this.data.iList.getElementsByClassName(GLOBAL.dataNode + " no-data").remove();
    },
    onLoad: async function () {
        this.rootNode.classList.add(GLOBAL.loading);

        //display items from landing group
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
}, VIEW.profile, true, ViewController.loadingModes.never);
const itemView = new View(VIEW.item, APP.url.item, { currentItem: null }, {
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
        if (ItemController.isItemsLoaded) {
            //getting item
            let item;
            //if item is loaded into view -> skip rendering 
            //TODO: dynamic item content change
            if (this.data.currentItem?.id != arg.routeArg[0]) {
                try {
                    item = await ItemController.getItemById(arg.routeArg[0]);
                } catch (e) { console.error(e); return; }

                //display error and return if item is not found
                if (!item) {
                    ViewController.invokeError("item_not_found");
                    return;
                }

                //if it's link -> redirect into page
                if (item.isLink) {
                    window.open(item.isLink, '_blank').focus();
                    ViewController.navigateToDefaultView();
                    return;
                }

                //save into view cache
                this.data.currentItem = item;

                //preparing item info
                document.title = item.title + " - " + APP.name;
                this.data.iTitle.innerHTML = item.title;
                this.data.iInfo.innerHTML = item.createDate.toHTMLString() + ((item.modifyDate) ? " <u class='dotted-separator'></u> Updated " + item.modifyDate.toHTMLString() : "");

                //clear content
                this.data.iContent.innerHTML = "";

                //render item
                this.data.iContent.append(await ItemComponentBuilder(item.content, item.folder, item));
            }
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
        //get children nodes
        let _data = this.data;
        _data.groupData = getById("group-data")
        _data.groupList = getById("group-list");
        _data.groupTitle = getById("group-title");
        _data.groupInfo = getById("group-info");
    },
    onNavigate: () => window.scroll(0, 0),
    onNavigateFrom: function () {
        //set all group items into loading state
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
            this.data.resSlider.addEventListener("render", async function (res, index, resHistory, nextIndexRes, nextIndex, previousIndexRes, previousIndex, direction) {

                //setting classes for items to render
                let _resChilds = _resList.children;
                let _currentChild = _resChilds[index];

                _currentChild.children[0].src = res.src;

                _resChilds[nextIndex].children[0].src = nextIndexRes.src;
                _resChilds[previousIndex].children[0].src = previousIndexRes.src;

                _resChilds[resHistory[1]?.index]?.classList.remove("previous", "next", "old");

                _resChilds[index].classList.add(direction == 1 ? "next" : "previous", GLOBAL.activeView);

                _resChilds[resHistory[0]?.index]?.classList.remove("next", "previous", "start", GLOBAL.activeView);
                _resChilds[resHistory[0]?.index]?.classList.add(direction == 1 ? "next" : "previous", "old");

                history.state.arg.routeArg = [_sender.data.currentItem.id, res.hash];
                history.replaceState(history.state, '', "/" + _sender.url + "/" + _sender.data.currentItem.id + "/" + res.hash);

                await ImageHelper(_currentChild.children[0], undefined, undefined, function () {
                    _currentChild.classList.remove(GLOBAL.loading);
                });
            });
            this.data.resSlider.addEventListener("load", async function () {
                let _container = document.createElement("DIV");
                _container.classList.add(GLOBAL.loading, "img");
                let _img = document.createElement("IMG");
                _container.appendChild(_img)
                _resList.appendChild(_container);
            });
            this.data.resSlider.addEventListener("loadFinish", (res) =>
                _setButtonsDisplay(res.length < 2))
            this.data.resSlider.addEventListener("close", () => {
                _resList.innerHTML = "";
                _setButtonsDisplay(true);
            });

            //adding gestures for navigation
            GestureBuilder(this.rootNode, {
                right: this.data.resSlider.next,
                left: this.data.resSlider.previous,
                up: this.data.resSlider.next,
                down: this.data.resSlider.previous
            });
        },
        onLoad: async function (arg) {
            //loading item and resource group
            this.data.currentItem = arg.currentItem || await ItemController.getItemById(arg.routeArg[0]);
            let resourceGroup = ItemController.findResourceByHash(this.data.currentItem.resourcesDictionary, arg.routeArg[1]);

            //if resource group is mising -> display error
            if (!resourceGroup) {
                ViewController.invokeError("image_not_found", false);
                return;
            }
            //loading resources to slider
            await this.data.resSlider.loadResources(resourceGroup.resources, resourceGroup.selected, false);
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
    //preparing history
    if (historyItem.index == 0 || view.navigationArgs.noHistoryPush)
        history.replaceState(historyItem, '', view.navigationUrl);
    else
        history.pushState(historyItem, '', view.navigationUrl);
});
ViewController.addEventListener("navigateDefault", (arg) => {
    //navigating to nearest landing page history index
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
ViewController.addEventListener("navigationRequest", () => closeNavigation());

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
        await ItemController.loadData(storageGroups(), storageItems());
    } catch (e) {
        ViewController.invokeError("item_load_error", true);
        console.error(e);
    }

    //navigating to view based by url or by history state
    if (history.state)
        ViewController.navigateFromHistory(history.state);
    else
        await ViewController.navigate(START_ROUTE.target, {
            routeArg: APP.startUrl.slice(1, APP.startUrl.length - 1)
        });
    APP_NODE.classList.add(GLOBAL.loaded);
});
window.addEventListener("popstate", (event) => ViewController.navigateFromHistory(event.state));
window.onresize = () => document.body.classList.toggle("scroll-fix", !isScrollbarVisible());

//item tile creating method
let createItemTile = async function (node, item) {
    if (node.nodeName != "A") {
        let oldNode = node;
        node = document.createElement("A");
        oldNode.parentElement.replaceChild(node, oldNode);
    }
    let imageSrc = ITEM.folder + item.folder + item.tile.image;
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

    let nodeButton = createButton(item.isLink ? "mi-OpenInNewWindow" : "mi-BackMirrored", item.isLink ? "Open link" : "Read more", "DIV", true);

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
        item.isLink ?
            window.open(item.isLink, '_blank').focus()
            :
            ViewController.navigate(VIEW.item, { routeArg: [item.id] });
    };
    node.href = item.isLink || APP.url.item + "/" + item.id;

    //loading item
    setTimeout(() => node.classList.remove(GLOBAL.loaded), 300);
    return node;
}
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
    node.children[1].href = APP.url.group + "/" + group.id;
    return node;
}

//storage response display helpers
let StorageResponseIndexer = function (response, depth = 1, limit = 3, startIndex = 0, limitOfDepth = 3) {
    let _indexedItems = [];
    let _groupItemIndex = 0;
    let _groupIndex = 0;
    let _currentIndex = startIndex;

    let _addIntoResponse = function (entry) {
        if (!entry || entry.hidden) return;
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

//universal slider class for resourceMap objects
let ResourceSlider = function () {
    let _res = [];
    let _currentIndex;

    let _history = [];
    let _historyLimit = 2;

    let _nextIndex;
    let _previousIndex;

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

    let _renderIndex = async function (index, direction) {
        _history.unshift({ resource: _res[_currentIndex], index: _currentIndex });
        if (_history.length > _historyLimit)
            _history.pop();

        _currentIndex = index;

        _nextIndex = _currentIndex + 1
        if (_nextIndex >= _res.length)
            _nextIndex = 0;

        _previousIndex = _currentIndex - 1;
        if (_previousIndex < 0)
            _previousIndex = _res.length - 1;

        _res[_currentIndex].isLoaded = true;

        await _sender.invokeEvent("render", [_res[_currentIndex]?.resource, _currentIndex, _history, _res[_nextIndex]?.resource, _nextIndex, _res[_previousIndex]?.resource, _previousIndex, direction]);
    }
    this.loadResources = async function (resourcesList, current) {
        _res = resourcesList.map(_resource => ({ resource: _resource, isLoaded: false }));
        await Promise.all(_res.map(async (res, index) => await _sender.invokeEvent("load", [res.resource, index])));
        await _renderIndex(current ? _res.findIndex((res) => res.resource.hash == current.hash) : 0, 0);
        await this.invokeEvent("loadFinish", [_res]);
    }
    this.close = async () => {
        _currentIndex = -1;
        await _sender.invokeEvent("close")
    };
    this.next = async function () {
        if (_res.length > 1) {
            await _renderIndex(_nextIndex, 1);
            await _sender.invokeEvent("next", [_res[_currentIndex]?.resource, _nextIndex])
        }
    }
    this.previous = async function () {
        if (_res.length > 1) {
            await _renderIndex(_previousIndex, -1);
            await _sender.invokeEvent("previous", [_res[_currentIndex]?.resource, _previousIndex])
        }
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
            return _directions.down;
        if (endY < startY && _isVertical && _distY >= MIN_DIST)
            return _directions.up;
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
let ImageHelper = function (image, onload = () => { }, onerror = () => { }, onfinish = () => { }) {
    if (!image.src)
        return;
    let imageIsNotLoaded = function () {
        image.src = "/img/image_error.webp";
        image.onload = function () { }
        onerror(image);
        onfinish(image);
    }
    let imageLoaded = function () {
        onload(image);
        onfinish(image);
    }
    return new Promise((resolve) => {
        image.onload = () => resolve(imageLoaded());
        image.onerror = () => resolve(imageIsNotLoaded());
    });
}

//check if scrollbar is visible
let isScrollbarVisible = (element = document.body) => element.scrollHeight > element.clientHeight;