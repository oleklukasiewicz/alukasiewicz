Element.prototype.remove = function () { this.parentElement.removeChild(this); };
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () { for (let i = this.length - 1; i >= 0; i--)this[i].parentElement.removeChild(this[i]); };
let Item = function (id, aliases = [], isItemLinkToWeb = false, folder = "/" + id, title, tileImage, tileContent, createDate, modifyDate, groups = [], arg = {}) {
    return {
        id, aliases,
        title,
        tile: { image: tileImage, content: tileContent },
        date: { create: createDate, modify: modifyDate },
        groups,
        isItemLinkToWeb, folder, arg,
        type: GLOBAL.item
    }
}
let ItemDate = function (day, month, year) { return { day, month, year }; };
let Group = function (id, aliases = [], title, createDate, modifyDate, groups = [], arg = {}, isDefault = false) {
    return {
        id, aliases, arg, title, groups, isDefault,
        date: { create: createDate, modify: modifyDate }, type: GLOBAL.group
    }
}
let Stream = function (event) { return { event } }
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
let HistoryItem = function (id, index, arg) {
    return {
        id,
        index,
        arg
    }
}
let ViewController = (function () {
    let _controller = {};
    EventController.call(_controller, {
        "navigateToView": [],
        "navigateFromView": [],
        "navigateDefault": [],
        "historyEdit": [],
    });
    let _views = [];
    let _currentView;
    let _currentHistoryIndex = -1;
    let _defaultViewIndex = -1;
    let _getViewById = (id) => _views.find((view) => view.id == id) || _defaultView;
    let _defaultView;
    let _previousView;
    let _registerDelayedView = function (view) {
        if (view.isRegisterDelayed && !view.registered) {
            view.event.onRegister?.call(view);
            view.registered = true;
        }
    }
    let _loadView = function (view, arg) {
        switch (view.loadingMode) {
            case _controller.loadingModes.always:
                _invokeLoadEvent(view, arg);
                break;
            case _controller.loadingModes.never:
                break;
            case _controller.loadingModes.single:
                _invokeLoadEvent(view, arg);
                break;
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
    let _invokeLoadEvent = function (view, arg) {
        if (!view.isLoading && !view.isLoaded) {
            view.isLoading = true;
            view.event.onLoad?.call(view, arg);
        }
    }
    let _invokeLoadFinishEvent = function (view) {
        if (view.isLoading && !view.isLoaded) {
            view.isLoading = false;
            view.isLoaded = true;
            view.event.onLoadFinish?.call(view);
        }
    }
    _controller.navigateAndWait = function (id, arg = {}) {
        let _target = _getViewById(id);
        if (_currentView) {
            _generateRootNode(_currentView);
            _currentView.event.onNavigateFrom?.call(_currentView, arg);
            _controller.invokeEvent("navigateFromView", [_currentView, arg]);
            _unLoadView(_currentView);
            _previousView = _currentView;
        }
        if (!arg.noHistoryPush) {
            _currentHistoryIndex++;
            if (_target == _defaultView) _defaultViewIndex = _currentHistoryIndex;
            _controller.invokeEvent("historyEdit", [Object.assign(new HistoryItem(_target.id, _currentHistoryIndex, { routeArg: arg.routeArg, historyArg: arg.historyArg }), {
                defaultViewIndex: _defaultViewIndex
            }), _target]);
        }
        let _trigger = async function (_arg) {
            let __arg = Object.assign(arg, _arg)
            await _registerDelayedView(_currentView);
            _loadView(_currentView, __arg);
            await _currentView.event.onNavigate?.call(_currentView, __arg);
            _invokeLoadFinishEvent(_currentView);
        }
        _currentView = _target;
        _generateRootNode(_currentView);
        _controller.invokeEvent("navigateToView", [_currentView, _previousView, arg]);
        return _trigger;
    }
    _controller.navigate = (id, arg = {}) => _controller.navigateAndWait(id, arg)(arg)
    _controller.register = function (view, isDefault = false) {
        _views.push(view);
        if (!view.isRegisterDelayed)
            view.event.onRegister?.call(view);
        if (isDefault) _defaultView = view;
    }
    _controller.navigateToDefaultView = function (arg) {
        if (_currentView != _defaultView) {
            _controller.navigate(_defaultView.id, arg);
            _controller.invokeEvent("navigateDefault", [arg]);
        }
    }
    _controller.back = function () {
        if (history.state.index == 0)
            _controller.navigateToDefaultView();
        else
            history.back();
    }
    _controller.moveModes = {
        forward: 1,
        back: 0
    }
    _controller.loadingModes = {
        single: "single",
        always: "always",
        never: "never"
    }
    _controller.move = function (move, historyItem) {
        if (move == _controller.moveModes.forward) _currentHistoryIndex++;
        else _currentHistoryIndex--;
        _controller.navigate(historyItem.id, Object.assign({
            noHistoryPush: true
        }, historyItem.arg));
    }
    _controller.finishLoadEventOfView = (view = _currentView) => _invokeLoadFinishEvent(view)
    Object.defineProperties(_controller, {
        defaultView: {
            get: () => _defaultView
        },
        previousView: {
            get: () => _previousView
        },
        currentView: {
            get: () => _currentView
        },
        currentHistoryIndex: {
            get: () => _currentHistoryIndex
        }
    });
    return _controller;
}());
let ItemController = (function () {
    let _routes = [];
    let _groupRoutes = [];
    let _storage = [];
    let _groupsLoaded = false;
    let _itemsLoaded = false;
    let _controller = {};
    EventController.call(_controller, {
        "fetchGroup": [],
        "fetchGroupFinish": [],
        "fetchItem": [],
        "fetchItemFinish": []
    });
    let _generateId = (id) => encodeURIComponent(id.toLowerCase().replaceAll(" ", "-"));
    let _generateGroup = function (group) {
        group.content = [];
        group.id = group.id || _generateId(group.title);
        _groupRoutes.push(new RouteClass(group.id, group));
        return group;
    }
    let _downloadViaAJAX = async function (item) {
        return new Promise((resolve, reject) => {
            let xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200)
                        resolve(JSON.parse(this.responseText));
                    else
                        reject("Error in AJAX request");
                }
            };
            xmlhttp.open("GET", APP.itemFolder + item.folder + APP.resourceFolder + APP.itemContentFileName, true);
            xmlhttp.send();
        });
    }
    let _loadFullItem = async function (item) {
        //check is components.js and components.css are downloaded id not -> download
        if (!item.isItemLinkToWeb && !item.isContentCached) {
            let _content = await _downloadViaAJAX(item, item.folder);
            Object.assign(item, _content, { resources: [] });
            item.resources.push(APP.itemContentFileName);
            item.content.forEach((component) => component.resource ? item.resources.push(...component.resource) : "");
            if (_content?.version == APP.version)
                item.isContentCached = true;
            //check content component version if newer -> download new version of components.css and js
        }
        return item;
    }
    let _defaultGroup;
    let _getGroupByRoute = (id) => _groupRoutes.find((route) => route.source == id)?.target;
    let _getItemByRoute = (id) => _routes.find((route) => route.source == id)?.target;
    _controller.fetchGroups = async function (groups) {
        await Promise.all(groups.map(async (group) => {
            _generateGroup(group);
            _storage.push(group);
            group.aliases.forEach((source) => _groupRoutes.push(new RouteClass(source, group)));
            if (group.isDefault) _defaultGroup = group;
            await _controller.invokeEvent("fetchGroup", [group]);
        }));
        _storage.forEach((group) => group.groups?.forEach((_group) => _getGroupByRoute(_group)?.content.push(group)));
        await _controller.invokeEvent("fetchGroupFinish");
        _groupsLoaded = true;
    }
    _controller.fetchItems = async function (items) {
        await Promise.all(items.map(async (item) => {
            item.id = item.id || _generateId(item.title);
            _routes.push(new RouteClass(item.id, item));
            _defaultGroup.content.push(item);
            item.aliases.forEach((source) => _routes.push(new RouteClass(source, item)));
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
    _controller.load = async function (stream = new Stream(), mode = _controller.loadModes.all, arg = {}, sender = stream) {
        let _loadAllFunc = async (source) => Promise.all(source.filter(arg.streamFilter || (() => true)).sort(arg.streamSorter).map(async (item, index) => await stream.event.load?.call(sender, item, index, mode)))
        switch (mode) {
            case _controller.loadModes.item:
                await stream.event.load?.call(sender, await _controller.getItemById(arg), 0, mode);
                break;
            case _controller.loadModes.group:
                await stream.event.load?.call(sender, _getGroupByRoute(arg), 0, mode);
                break;
            case _controller.loadModes.allItems:
                await _loadAllFunc(_defaultGroup.content);
                break;
            default:
                await _loadAllFunc(_storage);
                break;
        }
        await stream.event.loadFinish?.call(sender);
    }
    Object.defineProperties(_controller, {
        storage: { get: () => _storage }, isItemsLoaded: { get: () => _itemsLoaded }, isGroupsLoaded: { get: () => _groupsLoaded }, getItemSnapshotById: { value: _getItemByRoute }, getGroupById: { value: _getGroupByRoute }, getItemById: { value: async (id) => await _loadFullItem(_getItemByRoute(id)) }
    });
    return _controller;
}());
let ResourceDownloadController = (function () {
    let _controller = {};
    let _downloadedItems = [];
    let _pendingItems = [];
    let _pendingItemsObj = [];
    EventController.call(_controller, {
        "downloadStart": [],
        "download": [],
        "downloadFinish": [],
        "save": [],
        "savePending": [],
        "removeStart": [],
        "remove": [],
        "removeFinish": []
    });
    _controller.isDownloaded = (id) => _downloadedItems.includes(id);
    _controller.load = (items) => _downloadedItems = items;
    _controller.loadPending = async (items) => {
        _pendingItems = items;
        await Promise.all(_pendingItems.map(async (id) => {
            let item = await ItemController.getItemById(id);
            item.isPending = true;
            _pendingItemsObj.push(item);
        }))
    };
    _controller.downloadPending = async function () {
        await Promise.all(_pendingItems.map(async (itemId, index) => {
            if (!_downloadedItems.includes(itemId))
                await _controller.download(_pendingItemsObj[index]);
        }
        ));
        _pendingItems = [];
        _pendingItemsObj = [];
        _controller.invokeEvent("savePending", [{}, _pendingItems]);
    }
    _controller.addToPending = (item) => {
        if (!_pendingItems.includes(item.id)) {
            _pendingItems.push(item.id);
            item.isPending = true;
            _pendingItemsObj.push(item);
            _controller.invokeEvent("savePending", [item, _pendingItems]);
        }
    }
    _controller.downloadWhenAvailble = async function (item) {
        if (navigator.onLine)
            await _controller.download(item);
        else
            await _controller.addToPending(item);
    }
    _controller.removeFromPending = (item) => {
        if (_pendingItems.includes(item.id)) {
            let _index = _pendingItems.findIndex((id) => id == item.id);
            _pendingItems.splice(_index, 1);
            item.isPending = false;
            _pendingItemsObj.splice(_index, 1);
            _controller.invokeEvent("savePending", [item, _pendingItems]);
        }
    }
    _controller.download = async function (item) {
        item.isDownloading = true;
        _downloadedItems.push(item.id);
        _controller.invokeEvent("downloadStart", [item]);
        await Promise.all(item.resources.map(async (resource, index) => await _controller.invokeEvent("download", [item, resource, index])));
        item.isDownloading = false;
        item.isDownloaded = true;
        item.isPending = false;
        _controller.invokeEvent("downloadFinish", [item]);
        _controller.invokeEvent("save", [item, _downloadedItems]);
    }
    _controller.remove = async function (item) {
        item.isDownloaded = false;
        _downloadedItems.splice(_downloadedItems.findIndex((id) => id == item.id), 1);
        _controller.invokeEvent("removeStart", [item]);
        await Promise.all(item.resources.map(async (resource) => await _controller.invokeEvent("remove", [item, resource])));
        _controller.invokeEvent("removeFinish", [item]);
        _controller.invokeEvent("save", [item, _downloadedItems]);
    }
    return _controller;
}())
const landingView = new View(VIEW.landing, APP.url.landing, { scrollY: -1, itemsLoaded: false }, {
    onNavigate: async function () {
        if (this.data.scrollY >= 0)
            window.scroll(0, this.data.scrollY)
        document.title = APP.name;
        if (!this.isLoaded)
            await ItemController.load(this.data.itemStream, ItemController.loadModes.group, "home", this);
    },
    onRegister: function () {
        let _data = this.data;
        let _pButton = getById("profile-link-button");
        _pButton.href = APP.url.profile;
        _pButton.addEventListener("click", () => {
            event.preventDefault();
            ViewController.navigate(VIEW.profile);
        });
        _data.iList = getById("main-list");
        this.data.itemStream = new Stream({
            load: async (item) => StorageResponseBuilder(item, _data.iList, 1, -1)
        })
    },
    onNavigateFrom: function () {
        this.data.scrollY = window.scrollY
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
        this.data.iList.getElementsByClassName(GLOBAL.dataNode + " loading").remove();
    },
    onLoad: function () {
        this.rootNode.classList.add(GLOBAL.loading);
    }
}, VIEW.landing, true, ViewController.loadingModes.single);
const profileView = new View(VIEW.profile, APP.url.profile, {}, {
    onNavigate: () => document.title = "About me - " + APP.name
}, VIEW.profile, false, ViewController.loadingModes.never);
const itemView = new View(VIEW.item, APP.url.item, { currentItem: null }, {
    onNavigate: async function (arg) {
        window.scroll(0, 0);
        if (ItemController.isItemsLoaded)
            await ItemController.load(this.data.itemStream, ItemController.loadModes.item, arg.routeArg[0], this);
    },
    onRegister: function () {
        let _data = this.data;
        let _setIDBState = function (item) {
            if (item.id == _data.currentItem.id) {
                _iDB.classList.remove(GLOBAL.toggled);
                _iDB.classList.remove(GLOBAL.pending);
                _iDB.classList.remove(GLOBAL.progress);
                if (_data.currentItem.isDownloaded)
                    _iDB.classList.add(GLOBAL.toggled);
                else {
                    if (_data.currentItem.isDownloading)
                        _iDB.classList.add(GLOBAL.progress);
                    else
                        if (_data.currentItem.isPending)
                            _iDB.classList.add(GLOBAL.pending);
                }
            }
        }
        let _iTitle = getById("item-title");
        let _iContent = getById("item-content");
        let _iInfo = getById("item-info");
        let _iDB = getById("item-download-button");
        _iDB.addEventListener("click", () => {
            if (_data.currentItem.isDownloaded)
                ResourceDownloadController.remove(_data.currentItem);
            else {
                if (_data.currentItem.isPending)
                    ResourceDownloadController.removeFromPending(_data.currentItem);
                else
                    ResourceDownloadController.downloadWhenAvailble(_data.currentItem);
            }
        });
        ResourceDownloadController.addEventListener("downloadStart", _setIDBState);
        ResourceDownloadController.addEventListener("downloadFinish", _setIDBState);
        _data.itemStream = new Stream({
            load: function (item) {
                if (item.isItemLinkToWeb) {
                    window.open(item.isItemLinkToWeb, '_blank').focus();
                    ViewController.navigateToDefaultView();
                    return;
                }
                _data.currentItem = item;
                _setIDBState(item);
                document.title = item.title + " - " + APP.name;
                incrementVisitors(APP.itemFolder + "/" + item.id, true);
                _iTitle.innerHTML = item.title;
                _iInfo.innerHTML = APP.date(item.date.create) + ((item.date.modify) ? " <u class='dotted-separator'></u> Updated " + APP.date(item.date.modify) : "");
                _iContent.innerHTML = "";
                item.content.forEach((content) => _iContent.append(new ItemComponentBuilder(content, item.folder, item)));
            }
        });
        ResourceDownloadController.addEventListener("remove", _setIDBState);
        ResourceDownloadController.addEventListener("savePending", _setIDBState);
    },
    onLoad: function () {
        this.rootNode.classList.add(GLOBAL.loading);
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
    }
}, VIEW.item, true, ViewController.loadingModes.always);
const groupView = new View(VIEW.group, APP.url.group, { scrollY: -1 }, {
    onRegister: function () {
        let _groupTitle = getById("group-title");
        let _groupInfo = getById("group-info");
        let _data = this.data;
        _data._groupData = getById("group-data")
        _data._groupList = getById("group-list");
        this.data.itemStream = new Stream({
            load: async function (group) {
                _data.currentGroup = group;
                _groupTitle.innerHTML = group.title;
                document.title = group.title + " - " + APP.name;
                _groupInfo.innerHTML = APP.date(group.date.create) + " <u class='dotted-separator'></u> " + group.content.length + "&nbsp;" + (group.content.length != 1 ? "items" : "item");
                this.data._groupData.classList.remove(GLOBAL.loading);
                await StorageResponseBuilder(group, _data._groupList, 1, -1);
            }
        })
    },
    onNavigate: async function (arg) {
        window.scroll(0, 0);
        if (ItemController.isItemsLoaded)
            await ItemController.load(this.data.itemStream, ItemController.loadModes.group, arg.routeArg[0], this);
    },
    onNavigateFrom: function () {
        Array.prototype.forEach.call(this.data._groupList.getElementsByClassName(GLOBAL.dataNode), (node) => node.classList.add("loading"));
    },
    onLoad: function () {
        this.rootNode.classList.add(GLOBAL.loading);
        this.data._groupData.classList.add(GLOBAL.loading);
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
        this.data._groupList.getElementsByClassName("loading").remove();
    }
}, VIEW.group, true, ViewController.loadingModes.always);
ResourceDownloadController.addEventListener("download", async (item, file) => await cacheResource(APP.itemFolder + item.folder + APP.resourceFolder + file));
ResourceDownloadController.addEventListener("remove", async (item, file) => await removeResourceFromCache(APP.itemFolder + item.folder + APP.resourceFolder + file));
ViewController.register(landingView, true);
ViewController.register(profileView);
ViewController.register(itemView);
ViewController.register(groupView);
ViewController.addEventListener("historyEdit", (historyItem, view) => (historyItem.index == 0) ? history.replaceState(historyItem, '', view.url + (historyItem.arg.routeArg?.join('/') || '')) :
    history.pushState(historyItem, '', view.url + (historyItem.arg.routeArg?.join('/') || '')));
ViewController.addEventListener("navigateDefault", () => (history.state.defaultViewIndex != -1 && (history.state.defaultViewIndex - history.state.index) != 0) ? history.go(history.state.defaultViewIndex - history.state.index) : "");
ViewController.addEventListener("navigateToView", (view, lastView) => { view.rootNode.classList.add(GLOBAL.activeView); APPNODE.classList.replace(lastView?.id, view.id) });
ViewController.addEventListener("navigateFromView", (lastView) => lastView.rootNode.classList.remove(GLOBAL.activeView));
ItemController.addEventListener("fetchItem", (item) => item.isDownloaded = ResourceDownloadController.isDownloaded(item.id));
ResourceDownloadController.addEventListener("save", (item, items) => window.localStorage[STORAGE.itemDownload] = JSON.stringify(items));
ResourceDownloadController.addEventListener("savePending", (item, items) => window.localStorage[STORAGE.itemPending] = JSON.stringify(items));
window.addEventListener("load", async function () {
    ResourceDownloadController.load(LocalStorageArrayParser(STORAGE.itemDownload));
    await ItemController.fetchGroups(getGroups()).then(() => ItemController.fetchItems(getItems()));
    await ViewController.navigate(START_ROUTE.target, { routeArg: START_URL.slice(1, START_URL.length - 1) });
    APPNODE.classList.toggle(GLOBAL.offline, !navigator.onLine);
    await ResourceDownloadController.loadPending(LocalStorageArrayParser(STORAGE.itemPending));
    if (this.navigator.onLine)
        ResourceDownloadController.downloadPending();
    setTimeout(() => document.body.classList.remove("first-start"), 300);
});
window.addEventListener("online", () => {
    APPNODE.classList.remove(GLOBAL.offline);
    ResourceDownloadController.loadPending(LocalStorageArrayParser(STORAGE.itemPending));
    ResourceDownloadController.downloadPending();
});
window.addEventListener("offline", () => APPNODE.classList.add(GLOBAL.offline));
window.addEventListener("popstate", (event) => ViewController.move(((ViewController.currentHistoryIndex) - event.state.index <= 0), event.state));
let createRefreshButton = function () {
    let _bt = document.createElement("a");
    _bt.className = "button";
    _bt.innerHTML = "<i class='mi mi-Update'></i><span>Refresh page</span>";
    _bt.onclick = function () { window.location.reload(true); }
    return _bt;
}
let createItemTile = async function (node, item) {
    if (node.nodeName != "A") {
        let oldNode = node;
        node = document.createElement("A");
        oldNode.parentElement.replaceChild(node, oldNode);
    }
    node.className = "item " + GLOBAL.dataNode + " " + GLOBAL.loading;
    node.innerHTML = "<div class='img'><img src='" + APP.itemFolder + item.folder + item.tile.image + "' alt='" + item.title + "'/></div><b class='font-subtitle'>" + item.title + "</b><span class='font-base'>" + item.tile.content + "</span><div class='labels'><div class='button'>" + (item.isItemLinkToWeb ? "Open link <i class='mi mi-OpenInNewWindow'></i>" : "Read more <i class='mi mi-BackMirrored'></i>") + "</div>" + (item.date.modify ? "<div class='label font-caption'><i class='mi mi-Update'></i> &nbsp;&nbsp;" + APP.date(item.date.modify) + "</div>" : "") + "</div>";
    let _iImage = node.children[0].children[0],
        imageLoaded = function () {
            if (item.arg.tileImageStyle)
                _iImage.style = item.arg.tileImageStyle;
            cacheResource(APP.itemFolder + item.folder + item.tile.image);
        }, imageIsNotLoaded = function () {
            item.isTileImageNotLoaded = true;
            _iImage.src = "/img/image_error.webp";
            _iImage.onload = function () { }
        }
    await new Promise((resolve) => {
        _iImage.onload = () => resolve(imageLoaded());
        _iImage.onerror = () => resolve(imageIsNotLoaded());
    });
    node.classList.replace(GLOBAL.loading, GLOBAL.loaded);
    node.onclick = function () {
        event.preventDefault();
        if (item.isItemLinkToWeb)
            window.open(item.isItemLinkToWeb, '_blank').focus();
        else
            ViewController.navigate(VIEW.item, { routeArg: [item.id] });
    };
    node.href = item.isItemLinkToWeb || APP.url.item + item.id;
    setTimeout(() => node.classList.remove(GLOBAL.loaded), 300);
    return node;
}
let createGroupTile = function (node, group) {
    node.className = "group " + GLOBAL.dataNode;
    node.innerHTML = "<span class='font-title'></span><a class='button'><i class='mi mi-ShowAll'></i> <span>Show all</span></a>";
    node.children[0].innerHTML = group.title;
    node.children[1].onclick = function () {
        event.preventDefault();
        ViewController.navigate(VIEW.group, { routeArg: [group.id] });
    };
    node.children[1].href = APP.url.group + group.id;
    return node;
}
let ItemComponentBuilder = function (component, itemFolder) {
    let _type = component.type;
    let _arg = component.arguments || {};
    let _component
    switch (_type) {
        case "section":
            _component = document.createElement("DIV");
            _component.classList.add("section");
            if (!_arg.noTitle) {
                let _title = document.createElement("DIV");
                _title.className = "section-title font-subtitle";
                _title.innerText = component.title;
                _component.append(_title);
            }
            _component.append(component.content);
            break;
        case "image":
            _component = document.createElement("DIV");
            _component.classList.add("image");
            let _img = document.createElement("IMG");
            _img.src = APP.itemFolder + itemFolder + APP.resourceFolder + component.resource[0];
            let _alt = document.createElement("SPAN");
            _alt.className = "img-alt";
            _alt.innerHTML = component.alt || "";
            _component.appendChild(_img);
            _component.appendChild(_alt);
            _img.onerror = function () { _img.onload = function () { }; _img.src = "/img/image_error.webp"; _img.classList.add("no-image"); }
            _img.onload = function () { };
            break;
        case "quote":
            _component = document.createElement("DIV");
            let _quoteText = document.createElement("DIV");
            let _quoteAuthor = document.createElement("SPAN");
            _component.className = "quote";
            _quoteText.className = "font-header";
            _quoteAuthor.className = "font-base";
            _quoteText.innerHTML = component.content;
            _quoteAuthor.innerHTML = component.author;
            _component.appendChild(_quoteText);
            _component.appendChild(_quoteAuthor);
            break;
        case "text":
            _component = document.createElement("DIV");
            _component.innerHTML = component.content;
            break;
        case "multi-section":
            _component = document.createElement("DIV");
            _component.classList.add("section");
            if (!_arg.noTitle) {
                let _title = document.createElement("DIV");
                _title.className = "section-title font-subtitle";
                _title.innerText = title;
                _component.append(_title);
            }
            _component.forEach((content) => _component.append(new ItemComponentBuilder(content, itemFolder)))
            break;
        case "gallery":
            _component = document.createElement("DIV");
            _component.classList.add("gallery");
            _component.innerHTML = "<div><b class='font-subtitle'>"+component.title+"</b></div><div class='list'></div>";
            let _button =document.createElement("A");
            _button.innerHTML="<i class='mi mi-Picture'></i><span>Show all</span>";
            _button.classList.add("button")
            _component.children[0].appendChild(_button);
            let _max = component.resource.length > 5 ? 5 : component.resource.length;
            for (let i = 0; i < _max; i++) {
                let res = component.resource[i];
                let _img = document.createElement("IMG");
                _img.src = APP.itemFolder + itemFolder + APP.resourceFolder + res;
                _component.children[1].appendChild(_img);
            };
            break;
        default:
            _component = document.createElement("DIV");
    }
    return _component
}
let StorageResponseIndexer = function (response, depth = 1, limit = 3, startIndex = 0, limitOfDepth = 3) {
    let _indexedItems = [];
    response.content?.forEach((entry, index) => {
        if (entry.type == GLOBAL.group) {
            if (depth > 0) {
                _indexedItems.push({ index: startIndex, entry: entry });
                _indexedItems = _indexedItems.concat(StorageResponseIndexer(entry, depth - 1, limitOfDepth, startIndex + 1));
                startIndex = _indexedItems[_indexedItems.length - 1].index + 1;
            }
        } else {
            if (((limit > 0) && (!entry.isIndexed || (response.content.length - index) <= limit)) || limit == -1) {
                entry.isIndexed = true;
                _indexedItems.push({ index: startIndex, entry: entry });
                if (limit > 0)
                    limit -= 1;
                startIndex += 1;
            }
        }
    });
    return _indexedItems;
}
let StorageResponseBuilder = async function (response, targetNode = document.createElement("DIV"), depth = 1, limit = 3) {
    let _items = [...targetNode.getElementsByClassName(GLOBAL.dataNode)];
    let _indexedItems = StorageResponseIndexer(response, depth, limit, 0);
    await Promise.all(_indexedItems.map(async (entry) => {
        entry.entry.isIndexed = false;
        if (entry.entry.type == GLOBAL.group)
            createGroupTile(_items[entry.index] || targetNode.appendChild(document.createElement("div")), entry.entry);
        else
            await createItemTile(_items[entry.index] || targetNode.appendChild(document.createElement("a")), entry.entry);
    }));
}
let LocalStorageArrayParser = (name, _default = []) => window.localStorage[name] ? JSON.parse(window.localStorage[name]) : _default;