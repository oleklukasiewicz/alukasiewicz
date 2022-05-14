const COMPONENTS_VERSION = 1;

//Item component builder for basic item content controls and sections
let ItemComponentBuilder = async function (component, itemFolder, item) {
    if (typeof (component) === "string") return component;
    let _type = component.type;
    let _arg = component.arguments || {};
    let _component;
    if (component.dontRender) _type = "none";
    //generating nodes
    switch (_type) {
        default:
            _component = document.createElement("DIV");
            _component.classList.add("section");
            if (component.title) {
                let _title = document.createElement("DIV");
                _title.className = "section-title font-subtitle";
                _title.innerText = component.title;
                _component.append(_title);
            }
            if (typeof (component.content) === "string")
                _component.append(component.content);
            else
                component.content.forEach(async content => _component.append(await ItemComponentBuilder(content, itemFolder, item)));
            break;
        case "quote":
            _component = document.createElement("DIV");
            _component.className = "quote";

            let _quoteText = document.createElement("DIV");
            _quoteText.className = "font-header";
            _quoteText.innerHTML = component.content;

            let _quoteAuthor = document.createElement("SPAN");
            _quoteAuthor.className = "font-base";
            _quoteAuthor.innerHTML = component.author;

            _component.appendChild(_quoteText);
            _component.appendChild(_quoteAuthor);
            break;
        case "gallery":
            _component = document.createElement("DIV");
            _component.classList.add("gallery");

            //setting up images order and count
            let _loadingPromises = [];
            let _maxImagesCount = 5;
            let _displayImagesCount = (_arg.imagesCount && _arg.imagesCount <= _maxImagesCount) ? _arg.imagesCount : (component.resources.length < _maxImagesCount ? component.resources.length : _maxImagesCount);
            let _displayImages = new Array(_displayImagesCount);

            //getting indexes from resourceOrder argument
            if (_arg.resourceOrder) {
                let _insertedImages = 0;
                for (let _resIndex = 0; _resIndex < component.resources.length; _resIndex++) {
                    let resource = component.resources[_resIndex];
                    let _resourceOrderIndex = _arg.resourceOrder.findIndex((hash) => hash == resource.hash);

                    if (_resourceOrderIndex != -1) {
                        _displayImages[_resourceOrderIndex] = resource;
                        _insertedImages++;
                    }
                    if (_insertedImages == _arg.resourceOrder.length)
                        break;
                };
            } else {
                for (let _resIndex = 0; _resIndex < _displayImagesCount; _resIndex++)
                    _displayImages[_resIndex] = component.resources[_resIndex];
            }

            if (!_arg.hideControls && component.resources.length > 1) {
                _component.innerHTML = "<div><b class='font-subtitle'>" + component.title + "</b></div>";
                _component.classList.add("show-controls");
                //show all button
                let _button = document.createElement("A");
                _button.innerHTML = "<i class='mi mi-Picture'></i><span>Show all</span>";
                _button.classList.add("button");
                _button.onclick = function () {
                    ViewController.navigate(VIEW.resource, {
                        routeArg: [
                            item.id,
                            item.resources[component.resourceGroupIndex].resources[_order[0]].hash
                        ],
                        currentItem: item,
                    })
                }
                _component.children[0].appendChild(_button);
            }

            let _list = document.createElement("DIV");
            _list.classList.add("list");
            _component.appendChild(_list);

            //generating images
            for (let index = 0; index < _displayImagesCount; index++) {
                let res = _displayImages[index];
                let _img = document.createElement("IMG");
                _img.alt = res?.props?.alt || "";
                _img.src = res.src;
                _img.classList.add(GLOBAL.loading);
                _list.appendChild(_img);
                _loadingPromises.push(ImageHelper(_img,
                    function (img) {
                        img.onclick = function () {
                            ViewController.navigate(VIEW.resource, {
                                routeArg: [
                                    item.id,
                                    res.hash
                                ],
                                currentItem: item
                            })
                        }
                        img.classList.remove(GLOBAL.loading);
                    },
                    function (img) {
                        img.classList.remove(GLOBAL.loading);
                    }
                ));
            }

            Promise.all(_loadingPromises.map(async _promise => await _promise));

            _component.classList.add("items-count-" + _displayImagesCount);

            if (component.arguments?.alt) {
                let _alt = document.createElement("span");
                let _altText = typeof (component.arguments.alt) === "boolean" ? component.resources[0].props.alt : component.arguments.alt;
                _alt.innerHTML = _altText;
                _alt.classList.add("img-alt");
                _component.appendChild(_alt);
            }
            break;
        case "link":
            _component = document.createElement("A");
            _component.classList.add("link");
            _component.innerHTML = component.content;
            _component.href = component.href;
            _component.target = component.target;
            break;
    }
    return _component;
}

// Item structure builder
let ItemBuilder = function (item) {
    let itemFolder = item.folder;
    item.content.map(async function (component, componentIndex) {
        if (component.resources) {

            //converting into valid resources
            let index = 0;
            while (index < component.resources.length) {

                //converting into valid resources
                let _validResource = ResourceConverter(component.resources[index], APP.itemFolder + itemFolder + APP.resourceFolder, component.id || componentIndex);
                component.resources.splice(index, 1, ..._validResource);
                index += _validResource.length;
            }

            //adding link into resource group
            component.resourceGroupIndex = item.resources.length;

            //adding into item resources list
            item.resources.push(new ResourceGroup(component.resources));
        }
    });
    if (item.debug)
        console.log(item);
}
//Converting components into valid resources for searching, indexing and more
let ResourceConverter = function (component, targetFolder, componentId) {
    let resources = [];
    switch (component.type) {
        case "group":
            let group = ItemController.getGroupById(component.id);
            group.content.forEach((item) => {

                //ignoring images if are just placeholders
                if (!item.arg.ignoreTileImageInGallery)
                    resources.push(new Resource(APP.itemFolder + item.folder + item.tile.image, "image", createHash(APP.itemFolder + item.folder + item.tile.image + componentId), component.props))
            });
            break;
        case "image":
            resources.push(new Resource(targetFolder + component.src, "image", createHash(targetFolder + component.src + componentId), component.props))
            break;
        case "item":
            let item = ItemController.getItemSnapshotById(component.id);
            resources.push(new Resource(APP.itemFolder + item.folder + item.tile.image, "image", createHash(APP.itemFolder + item.folder + item.tile.image + componentId), component.props))
            break;
        default:
            resources.push(component);
            break;
    }
    return resources;
}