Element.prototype.remove = function () { this.parentElement.removeChild(this); };
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () { for (let i = this.length - 1; i >= 0; i--)this[i].parentElement.removeChild(this[i]); };
let Item = function (id, aliases = [], isItemLinkToWeb = false, folder = "/" + id, title, tileImage, tileContent, createDate, modifyDate, groups = [], arg = {}) {
    return {
        id, aliases,
        title,
        tile: { image: tileImage, content: tileContent },
        date: { create: createDate, modify: modifyDate },
        groups,
        isItemLinkToWeb, folder, arg
    }
}
let Group = function (id, aliases = [], title, createDate, modifyDate, arg = {}) {
    return {
        id, aliases, arg, title,
        date: { create: createDate, modify: modifyDate }
    }
}
let Stream = function (event) { return { event } }
let View = function (id, url, data = {}, event = {}, rootNode = null, delayRegister = false, loadingMode = ViewController.loadingModes.single) {
    return {
        id,
        url,
        data,
        event,
        rootNode,
        delayRegister,
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
    let controller = {};
    EventController.call(controller, {
        "navigateToView": [],
        "navigateFromView": [],
        "navigateDefault": [],
        "historyPush": [],
    });
    let _views = [];
    let _currentView;
    let _currentHistoryIndex = -1;
    let _defaultViewIndex = -1;
    let _getViewById = (id) => _views.find((view) => view.id == id) || _defaultView;
    let _defaultView;
    let _previousView;
    let _registerDelayedView = function (view) {
        if (view.delayRegister && !view.registered) {
            view.event.onRegister?.call(view);
            view.registered = true;
        }
    }
    let _loadView = function (view, arg) {
        switch (view.loadingMode) {
            case controller.loadingModes.always:
                _invokeLoadEvent(view, arg);
                break;
            case controller.loadingModes.never:
                break;
            case controller.loadingModes.single:
                _invokeLoadEvent(view, arg);
                break;
        }
    }
    let _unLoadView = function (view) {
        if (view.loadingMode == controller.loadingModes.always)
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
    controller.navigateAndWait = function (id, arg = {}) {
        let _target = _getViewById(id);
        if (_currentView) {
            _currentView.event.onNavigateFrom?.call(_currentView, arg);
            controller.invokeEvent("navigateFromView", [_currentView, arg]);
            _unLoadView(_currentView);
            _previousView = _currentView;
        }
        if (!arg.noHistoryPush) {
            _currentHistoryIndex++;
            if (_target == _defaultView) _defaultViewIndex = _currentHistoryIndex;
            controller.invokeEvent("historyPush", [Object.assign(new HistoryItem(_target.id, _currentHistoryIndex, { routeArg: arg.routeArg, historyArg: arg.historyArg }), {
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
        controller.invokeEvent("navigateToView", [_currentView, _previousView, arg]);
        return _trigger;
    }
    controller.navigate = (id, arg = {}) => controller.navigateAndWait(id, arg)(arg)
    controller.register = function (view, isDefault = false) {
        _views.push(view);
        if (!view.delayRegister)
            view.event.onRegister?.call(view);
        if (isDefault) _defaultView = view;
    }
    controller.navigateToDefaultView = function (arg) {
        if (_currentView != _defaultView) {
            controller.navigate(_defaultView.id, arg);
            controller.invokeEvent("navigateDefault", [arg]);
        }
    }
    controller.back = function () {
        if (history.state.index == 0)
            controller.navigateToDefaultView();
        else
            history.back();
    }
    controller.moveModes = {
        forward: 1,
        back: 0
    }
    controller.loadingModes = {
        single: "single",
        always: "always",
        never: "never"
    }
    controller.move = function (move, historyItem) {
        if (move == controller.moveModes.forward) _currentHistoryIndex++;
        else _currentHistoryIndex--;
        controller.navigate(historyItem.id, Object.assign({
            noHistoryPush: true
        }, historyItem.arg));
    }
    controller.finishLoadView = (view = _currentView) => _invokeLoadFinishEvent(view)
    Object.defineProperties(controller, {
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
    return controller;
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
        group.items = [];
        group.id = group.id || _generateId(group.title);
        _groupRoutes.push(new RouteClass(group.id, group));
        return group;
    }
    let _downloadViaAJAX = async function (item) {
        return new Promise((resolve, reject) => {
            let xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200)
                    resolve(JSON.parse(this.responseText));
            };
            xmlhttp.open("GET", APP.itemFolder + item.folder + APP.resourceFolder + "/" + "content.json", true);
            xmlhttp.send();
        });
    }
    let _today = new Date();
    let _defaultGroup = _generateGroup(new Group("all", ["", "other"], "All projects", { day: _today.getDate(), month: _today.getMonth() + 1, year: _today.getFullYear() }));
    _storage.push(_defaultGroup);
    let _getGroupByRoute = (id) => _groupRoutes.find((route) => route.source == id)?.target;
    let _getItemByRoute = (id) => _routes.find((route) => route.source == id)?.target;
    _controller.fetchGroups = async function (groups) {
        await Promise.all(groups.map(async (group) => {
            _generateGroup(group);
            _storage.push(group);
            group.aliases.forEach((source) => _groupRoutes.push(new RouteClass(source, group)));
            await _controller.invokeEvent("fetchGroup", [group]);
        }));
        await _controller.invokeEvent("fetchGroupFinish");
        _groupsLoaded = true;
    }
    _controller.fetchItems = async function (items) {
        await Promise.all(items.map(async (item) => {
            item.id = item.id || _generateId(item.title);
            _routes.push(new RouteClass(item.id, item));
            _defaultGroup.items.push(item);
            item.aliases.forEach((source) => _routes.push(new RouteClass(source, item)));
            item.groups.forEach((group) => _getGroupByRoute(group)?.items.push(item));
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
                let _targetItem = _getItemByRoute(arg);
                if (!_targetItem.isItemLinkToWeb && !_targetItem.isContentCached) {
                    let _content = await _downloadViaAJAX(_targetItem, _targetItem.folder);
                    _targetItem.content = _content;
                    _targetItem.isContentCached = true;
                }
                await stream.event.load?.call(sender, _targetItem, 0, mode);
                break;
            case _controller.loadModes.group:
                await stream.event.load?.call(sender, _getGroupByRoute(arg), 0, mode);
                break;
            case _controller.loadModes.allItems:
                await _loadAllFunc(_defaultGroup.items);
                break;
            default:
                await _loadAllFunc(_storage);
                break;
        }
        await stream.event.loadfinish?.call(sender);
    }
    Object.defineProperties(_controller, { storage: { get: () => _storage }, isItemsLoaded: { get: () => _itemsLoaded }, isGroupsLoaded: { get: () => _groupsLoaded } });
    return _controller;
}());
let ItemDownloadController = (function () {
    let _controller = {};
    let _downloadedItems = [];
    EventController.call(_controller, {
        "download": [],
        "saveDownloads": [],
        "removeDownloads": []
    });
    _controller.isDownloaded = (id) => _downloadedItems.includes(id);
    _controller.load = (items) => _downloadedItems = items;
    _controller.download = function (item) {
        item.isDownloaded = true;
        _downloadedItems.push(item.id);
        _controller.invokeEvent("download", [item]);
        _controller.invokeEvent("saveDownloads", [_downloadedItems]);
    }
    _controller.remove = function (item) {
        item.isDownloaded = false;
        _downloadedItems.splice(_downloadedItems.findIndex((id) => id == item.id), 1);
        _controller.invokeEvent("removeDownloads", [item]);
        _controller.invokeEvent("saveDownloads", [_downloadedItems]);
    }
    _controller.toggle = function (item) {
        let _isDownloaded = _controller.isDownloaded(item.id);
        if (_isDownloaded)
            _controller.remove(item);
        else
            _controller.download(item);
        return !_isDownloaded;
    }
    _controller.modifyResourcesByItemId = (item, state, whatToDo = function () { }) => {
        item.isDownloaded = state;
        console.log(item)
        item.content.resources.forEach(async (file) => await whatToDo(APP.itemFolder + item.folder + APP.resourceFolder + file));
    }
    return _controller;
}())
const landingView = new View(VIEW.landing, APP.url.landing, { scrollY: -1, itemsLoaded: false }, {
    onNavigate: async function () {
        if (this.data.scrollY >= 0)
            window.scroll(0, this.data.scrollY)
        document.title = APP.name;
        if (!this.data.itemsLoaded)
            await ItemController.load(this.data.itemStream, ItemController.loadModes.all, {}, this);
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
        let _items = [..._data.iList.getElementsByClassName(GLOBAL.dataNode)];
        this.data.itemStream = new Stream({
            load: async (item, index, mode) => {
                if (mode == ItemController.loadModes.allItems) {
                    await createItemTile(_items[index] || _data.iList.appendChild(document.createElement("A")), item);
                } else {
                    let gItems = item.items.filter((gItem) => !gItem.isDisplayedInLanding).slice(0, 3);
                    if (gItems.length < 3 && item.items.length > gItems.length)
                        gItems = gItems.concat(item.items.filter((gItem) => gItem.isDisplayedInLanding).slice(0, 3 - gItems.length));
                    gItems.forEach((gItem) => gItem.isDisplayedInLanding = true);
                    let gNode = await createGroupTile(_items[index * 4] || _data.iList.appendChild(document.createElement("div")), item);
                    let gNodeSibling = gNode.nextSibling;
                    await Promise.all(gItems.map(async (value, i) => {
                        await createItemTile(_items[(index * 4) + (i + 1)] || _data.iList.insertBefore(document.createElement("A"), gNodeSibling), value, item)
                    }));
                }
            },
            loadfinish: () => _data.itemsLoaded = true
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
}, getById(VIEW.landing), true, ViewController.loadingModes.single);
const profileView = new View(VIEW.profile, APP.url.profile, {}, {
    onNavigate: () => document.title = "About me - " + APP.name
}, getById(VIEW.profile), false, ViewController.loadingModes.never);
const itemView = new View(VIEW.item, APP.url.item, { currentItem: null }, {
    onNavigate: async function (arg) {
        if (ItemController.isItemsLoaded)
            await ItemController.load(this.data.itemStream, ItemController.loadModes.item, arg.routeArg[0], this);
        window.scroll(0, 0);
    },
    onRegister: function () {
        let _data = this.data;
        let _setIDBState = function (isDownloaded = _data.currentItem.isDownloaded, isOnline = navigator.onLine) {
            if (isDownloaded)
                _iDB.classList.add(GLOBAL.toggled);
            else {
                _iDB.classList.remove(GLOBAL.toggled);
                _iDB.classList.toggle(GLOBAL.disabled, !isOnline)
            }
        }
        let _iTitle = getById("item-title");
        let _iContent = getById("item-content");
        let _iInfo = getById("item-info");
        let _iDB = getById("item-download-button");
        _iDB.addEventListener("click", () => ItemDownloadController.toggle(_data.currentItem));
        ViewController.addErrorType(new ErrorType(ERROR_CODE.itemNotFound, "Item is not available."));
        _data.itemStream = new Stream({
            load: function (item) {
                if (item.isItemLinkToWeb) {
                    window.open(item.isItemLinkToWeb, '_blank').focus();
                    ViewController.navigateToDefaultView();
                    return;
                }
                _data.currentItem = item;
                _setIDBState(item.isDownloaded, navigator.onLine);
                _iDB.style.display = "flex";
                document.title = item.title + " - " + APP.name;
                incrementVisitors(APP.itemFolder + "/" + item.id, true);
                _iTitle.innerHTML = item.title;
                _iInfo.innerHTML = APP.date(item.date.create) + ((item.date.modify) ? " <u class='dotted-separator'></u> Updated " + APP.date(item.date.modify) : "");
                _iContent.innerHTML = "";
                item.content.content.forEach((content) => _iContent.append(new ItemComponentBuilder(content, item.folder, item)));
            }
        });
        window.addEventListener("online", () => _setIDBState())
        window.addEventListener("offline", () => _setIDBState());
        ItemDownloadController.addEventListener("download", () => _setIDBState(true));
        ItemDownloadController.addEventListener("removeDownloads", () => _setIDBState(false));
    },
    onLoad: function () {
        this.rootNode.classList.add(GLOBAL.loading);
    },
    onLoadFinish: function () {
        this.rootNode.classList.remove(GLOBAL.loading);
    }
}, getById(VIEW.item), true, ViewController.loadingModes.always);
const groupView = new View(VIEW.group, APP.url.group, { scrollY: -1 }, {
    onRegister: function () {
        let _groupTitle = getById("group-title");
        let _groupInfo = getById("group-info");
        let _data = this.data;
        _data._groupData = getById("group-data")
        _data._groupList = getById("group-list");
        ViewController.addErrorType(new ErrorType(ERROR_CODE.groupNotFound, "This group is not available."));
        ViewController.addErrorType(new ErrorType(ERROR_CODE.noItemsInGroup, "This group is empty"));
        this.data.itemStream = new Stream({
            load: async function (group) {
                _data.currentGroup = group;
                _groupTitle.innerHTML = "";
                _groupInfo.innerHTML = "";
                let _items = _data._groupList.getElementsByClassName(VIEW.item);
                _groupTitle.innerHTML = group.title;
                document.title = group.title + " - " + APP.name;
                _groupInfo.innerHTML = APP.date(group.date.create) + " <u class='dotted-separator'></u> " + group.items.length + "&nbsp;" + (group.items.length != 1 ? "items" : "item");
                _data._groupData.classList.remove(GLOBAL.loading);
                await Promise.all(group.items.map(async (item, index) => await createItemTile(_items[index] || _data._groupList.appendChild(document.createElement("a")), item)));
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
        this.data._groupList.getElementsByClassName("item loading").remove();
    }
}, getById(VIEW.group), true, ViewController.loadingModes.always);
ViewController.register(landingView, true);
ViewController.register(profileView);
ViewController.register(itemView);
ViewController.register(groupView);
ViewController.addEventListener("historyPush", function (historyItem, view) {
    if (historyItem.index == 0)
        history.replaceState(historyItem, '', view.url + (historyItem.arg.routeArg?.join('/') || ''));
    else
        history.pushState(historyItem, '', view.url + (historyItem.arg.routeArg?.join('/') || ''));
});
ViewController.addEventListener("navigateDefault", function () {
    if (history.state.defaultViewIndex != -1 && (history.state.defaultViewIndex - history.state.index) != 0)
        history.go(history.state.defaultViewIndex - history.state.index);
});
ViewController.addEventListener("navigateToView", (view, lastView) => { view.rootNode.classList.add(GLOBAL.activeView); APPNODE.classList.replace(lastView?.id, view.id) });
ViewController.addEventListener("navigateFromView", (lastView) => lastView.rootNode.classList.remove(GLOBAL.activeView));
ItemController.addEventListener("fetchItem", function (item) {
    item.isDownloaded = ItemDownloadController.isDownloaded(item.id);
});
ItemDownloadController.addEventListener("saveDownloads", (items) => window.localStorage[STORAGE.itemDownload] = JSON.stringify(items));
ItemDownloadController.addEventListener("download", (id) => ItemDownloadController.modifyResourcesByItemId(id, true, cacheResource));
ItemDownloadController.addEventListener("removeDownloads", (id) => ItemDownloadController.modifyResourcesByItemId(id, false, removeResourceFromCache));
window.addEventListener("load", async function () {
    ItemDownloadController.load(window.localStorage[STORAGE.itemDownload] ? JSON.parse(window.localStorage[STORAGE.itemDownload]) : []);
    await ItemController.fetchGroups(getGroups());
    await ItemController.fetchItems(getItems());
    ViewController.navigate(START_ROUTE.target, { routeArg: START_URL.slice(1, START_URL.length - 1) })
    APPNODE.classList.toggle(GLOBAL.offline, !navigator.onLine);
    setTimeout(() => document.body.classList.remove("first-start"), 300);
});
window.addEventListener("online", () => APPNODE.classList.remove(GLOBAL.offline));
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
    let _onClick = function () {
        event.preventDefault();
        if (item.isItemLinkToWeb)
            window.open(item.isItemLinkToWeb, '_blank').focus();
        else
            ViewController.navigate(VIEW.item, { routeArg: [item.id] });
    };
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
    node.href = item.isItemLinkToWeb || APP.url.item + item.id;
    node.onclick = _onClick;
    setTimeout(() => node.classList.remove(GLOBAL.loaded), 300);
    return node;
}
let createGroupTile = async function (node, group) {
    node.className = "group " + GLOBAL.dataNode + " " + GLOBAL.loading;
    node.innerHTML = "<span class='font-title'></span><a class='button'><i class='mi mi-ShowAll'></i> <span>Show all</span></a>";
    node.children[0].innerHTML = group.title;
    let _onClick = function () {
        event.preventDefault();
        ViewController.navigate(VIEW.group, { routeArg: [group.id] });
    };
    node.children[1].href = APP.url.group + group.id;
    node.classList.replace(GLOBAL.loading, GLOBAL.loaded);
    node.children[1].onclick = _onClick;
    setTimeout(() => node.classList.remove(GLOBAL.loaded), 300);
    return node;
}
let ItemDate = function (day, month, year) { return { day, month, year }; };
let ItemComponentBuilder = function (component, itemFolder, item) {
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
            let _img = document.createElement("IMG");
            _img.src = APP.itemFolder + itemFolder + APP.resourceFolder + component.source;
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
    }
    return _component
}

