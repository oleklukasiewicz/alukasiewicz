const COMPONENTS_VERSION = 1;

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

    let _pushItem = (item) =>
        resources.push(new Resource(APP.itemFolder + item.folder + item.tile.image, "image", createHash(APP.itemFolder + item.folder + item.tile.image + componentId), component.props))
    switch (component.type) {
        case "group":
            let group = ItemController.getGroupById(component.id);

            //return if group don't exist
            if (!group) return resources;

            group.content.forEach((item) => {
                //ignoring images if are just placeholders
                if (!item.arg?.ignoreTileImageInGallery)
                    _pushItem(item);
            });
            break;
        case "image":
            resources.push(new Resource(targetFolder + component.src, "image", createHash(targetFolder + component.src + componentId), component.props))
            break;
        case "item":
            let item = ItemController.getItemSnapshotById(component.id);
            _pushItem(item);
            break;
        default:
            resources.push(component);
            break;
    }
    return resources;
}

//Item component builder for basic content components
let ItemComponentBuilder = async function (component, itemFolder, item) {
    if (typeof (component) === "string") return component;
    let _type = component.type;
    let _arg = component.props || {};
    let _finalComponent;
    if (component.dontRender) _type = "none";
    //generating nodes
    switch (_type) {
        default:
            _finalComponent = document.createElement("DIV");
            _finalComponent.className = "section";

            if (component.title) {
                let _title = document.createElement("DIV");
                _title.className = "section-title font-subtitle";
                _title.innerText = component.title;
                _finalComponent.append(_title);
            }

            if (typeof (component.content) === "string")
                _finalComponent.append(component.content);
            else
                component.content.forEach(async content => _finalComponent.append(await ItemComponentBuilder(content, itemFolder, item)));
            break;

        case "quote":
            _finalComponent = document.createElement("DIV");
            _finalComponent.className = "quote";

            let _quoteText = document.createElement("DIV");
            _quoteText.className = "font-header";
            _quoteText.innerHTML = component.content;

            let _quoteAuthor = document.createElement("SPAN");
            _quoteAuthor.className = "font-base";
            _quoteAuthor.innerHTML = component.author;

            _finalComponent.appendChild(_quoteText);
            _finalComponent.appendChild(_quoteAuthor);
            break;

        case "gallery":
            _finalComponent = document.createElement("DIV");
            _finalComponent.className = "gallery";

            //setting up images order and count
            let _loadingPromises = [];
            let _maxImagesCount = 5;
            let _displayImagesCount = (_arg.imagesCount && _arg.imagesCount <= _maxImagesCount) ? _arg.imagesCount : (component.resources.length < _maxImagesCount ? component.resources.length : _maxImagesCount);
            let _displayImages = new Array(_displayImagesCount);

            //set display items if resourceOrder arg exist
            if (_arg.resourceOrder) {
                let _insertedImages = 0;
                for (let _resIndex = 0; _resIndex < component.resources.length; _resIndex++) {
                    let resource = component.resources[_resIndex];
                    let _resourceOrderIndex = _arg.resourceOrder.findIndex((hash) => hash == resource.hash);

                    //if resource exist in resourceOrder - set tag and add to displayItems
                    if (_resourceOrderIndex != -1) {
                        _displayImages[_resourceOrderIndex] = resource;
                        resource.isDisplayed = true;
                        _insertedImages++;
                    }

                    if (_insertedImages == _arg.resourceOrder.length)
                        break;
                };

                //removing all empty resources from displayImages
                _displayImages = _displayImages.filter((res) => res);

                //filling with not displayed resources if displayItems count is smaller than images count to display
                if (_insertedImages < _displayImagesCount) {
                    let _toInsert = _displayImagesCount - _insertedImages;
                    let _toInsertResIndex = 0;

                    while (_toInsert > 0) {
                        if (!component.resources[_toInsertResIndex].isDisplayed) {
                            _displayImages[_displayImagesCount - _toInsert] = component.resources[_toInsertResIndex];
                            _toInsert--;
                        }
                        _toInsertResIndex++;
                    }
                }

            } else {

                //default: filling with resources from resources list
                for (let _resIndex = 0; _resIndex < _displayImagesCount; _resIndex++)
                    _displayImages[_resIndex] = component.resources[_resIndex];
            }

            if (!_arg.hideControls && component.resources.length > 1) {
                _finalComponent.innerHTML = "<div><b class='font-subtitle'>" + component.title + "</b></div>";
                _finalComponent.classList.add("show-controls");

                //show all button
                let _button = document.createElement("A");
                _button.innerHTML = "<i class='mi mi-Picture'></i><span>Show all</span>";
                _button.className = "button";
                _button.href = "/" + APP.url.resource + "/" + item.id + "/" + _displayImages[0].hash;

                _button.onclick = function (e) {
                    e.preventDefault();
                    ViewController.navigate(VIEW.resource, {
                        routeArg: [
                            item.id,
                            _displayImages[0].hash
                        ],
                        currentItem: item,
                    })
                }

                _finalComponent.children[0].appendChild(_button);
            }

            //generating list for images
            let _list = document.createElement("DIV");
            _list.className = "list";
            _finalComponent.appendChild(_list);

            //generating images
            for (let index = 0; index < _displayImagesCount; index++) {
                let res = _displayImages[index];
                let _img = document.createElement("IMG");
                _img.alt = res?.props?.alt || "";
                _img.src = res.src;
                _img.className = GLOBAL.loading;
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
                    (img) => img.classList.remove(GLOBAL.loading)
                ));
            }

            Promise.all(_loadingPromises.map(async _promise => await _promise));
            _finalComponent.classList.add("items-count-" + _displayImagesCount);

            if (component.props?.alt) {
                let _alt = document.createElement("span");
                let _altText = typeof (component.props.alt) === "boolean" ? component.resources[0].props.alt : component.props.alt;
                _alt.innerHTML = _altText;
                _alt.classList.add("img-alt");
                _finalComponent.appendChild(_alt);
            }
            break;

        case "link":
            _finalComponent = document.createElement("A");
            _finalComponent.className = "link";
            _finalComponent.innerHTML = component.content;
            _finalComponent.href = component.href;
            _finalComponent.target = component.target;
            break;
    }
    return _finalComponent;
}