const COMPONENTS_VERSION = 1;

// Item structure builder (recurence)
let ItemBuilder = function (item, folder = item.folder, resourceItem) {
    let itemFolder = folder;
    let componentIndex = 0;

    //search child components for resources
    for (component of item.content) {
        
        //ignore string and number childs
        if (typeof (component) === "object") {
            if (component.resources || component.src) {

                //converting into valid resources
                let index = 0;

                //converting src prop into resource array
                if (component.src)
                    component.resources = [{ src: component.src, type: "image" }];

                while (index < component.resources.length) {

                    //converting into valid resources
                    let _validResource = ResourceConverter(component.resources[index], ITEM.folder + itemFolder + ITEM.resourceFolder, component.id || componentIndex);
                    component.resources.splice(index, 1, ..._validResource);
                    index += _validResource.length;
                }
            
                //adding link into resource group
                component.resourceGroupIndex = resourceItem.resources.length;

                //adding into item resources list
                resourceItem.resources.push(new ResourceGroup(component.resources));
            }
            //if child component contains child elements 
            // -> check for resources in child components
            if (component.content)
                ItemBuilder(component, itemFolder, resourceItem);

            componentIndex++;
        }
    };

    //debug
    if (item.debug)
        console.log(item);
}

//Converting components into valid resources for searching, indexing and more (invoked from ItemBuilder)
let ResourceConverter = function (component, targetFolder, componentId) {
    let resources = [];

    let _pushItem = (item) =>
        resources.push(new Resource(ITEM.folder + item.folder + item.tile.image, "image", createHash(ITEM.folder + item.folder + item.tile.image + componentId), component.props))
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

//Item component builder for basic content components (recurence)
let ItemComponentBuilder = async function (component, itemFolder, item) {
    if (typeof (component) === "string") return component;
    let _type = component.type;
    let _arg = component.props ||component.arg|| {};
    let _finalComponent;
    if (component.dontRender) _type = "none";
    //generating nodes
    switch (_type) {
        default:
            _finalComponent = document.createElement("DIV");
            _finalComponent.className = "section";

            let _text;
            //checking if component is string or array (content with multiple childs)
            if (typeof (component) === "string" || Array.isArray(component)) {
                _text = component;
            } else {
                //if not -> set target data to component content
                _text = component.content;
                if (component.title) {
                    let _title = document.createElement("DIV");
                    _title.classList.add("section-title", "font-subtitle");
                    _title.innerText = component.title;
                    _finalComponent.append(_title);
                }
            }
            if (typeof (_text) === "string")
                _finalComponent.append(_text);
            else
                for (content of _text)
                    _finalComponent.append(await ItemComponentBuilder(content, itemFolder, item));
            break;
        case "quote":
            _finalComponent = document.createElement("DIV");
            _finalComponent.className = "quote";

            let _quoteText = document.createElement("DIV");
            _quoteText.className = "font-header";
            _quoteText.innerHTML = component.content;

            let _quoteAuthor = document.createElement("SPAN");
            _quoteAuthor.className = "font-base";
            _quoteAuthor.innerHTML = component.author||"";

            _finalComponent.append(_quoteText, _quoteAuthor);
            break;
        case "gallery":

            _finalComponent = document.createElement("DIV");
            _finalComponent.className = "gallery";

            //setting up images order and count
            
            //promises array for images loading
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

            //display controls
            if (component.title && (!_arg.hideControls && component.resources.length > 1)) {
                _finalComponent.innerHTML = "<div><b class='font-subtitle'>" + component.title + "</b></div>";
                _finalComponent.classList.add("show-controls");

                //show all button
                let _button = document.createElement("A");
                _button.innerHTML = "<i class='mi mi-Picture'></i><span>Show all</span>";
                _button.className = "button";
                _button.href = "/" + APP.url.resource + "/" + item.id + "/" + _displayImages[0].hash;

                //add action to navigate into resources view
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

                res.props.node = _img;
            }

            // resolve all promises
            Promise.all(_loadingPromises.map(async _promise => await _promise));
            _finalComponent.classList.add("items-count-" + _displayImagesCount);

            //add alternative text
            if (_arg.alt) {
                let _alt = document.createElement("span");
                let _altText = typeof (_arg.alt) === "boolean" ? component.resources[0].props.alt : _arg.alt;
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
        case "decoration": case "bold": case "b": case "underline": case "u": case "italic": case "i": case "sup": case "sub":
            let _nodeType;
            let _style = component.style || component.type;
            switch (_style) {
                case "bold": case "b":
                    _nodeType = "b";
                    break;
                case "underline": case "u":
                    _nodeType = "u";
                    break;
                case "italic": case "i":
                    _nodeType = "i";
                    break;
                case "sup":
                    _nodeType = "sup";
                    break;
                case "sub":
                    _nodeType = "sub";
                    break;
                default:
                    _nodeType = "span";
                    break;
            }
            _finalComponent = document.createElement(_nodeType);
            _finalComponent.append(await ItemComponentBuilder(component.content))
            break;
        case "note":
            _finalComponent = document.createElement("DIV");
            _finalComponent.classList.add("note");
            
            if (component.title) {
                let _title = document.createElement("B");
                _title.innerText = component.title;
                _finalComponent.appendChild(_title);
            }

            _finalComponent.append(await ItemComponentBuilder(component.content));
            break;
        case "list":
            let _type = component.ordered ? "ol" : "ul";
            _finalComponent = document.createElement(_type);
            
            for (item of component.content) {
                let _itemNode = document.createElement("LI");
                _itemNode.append(await ItemComponentBuilder(item));
                _finalComponent.appendChild(_itemNode);
            }
            break;
        case "image":
            _finalComponent = document.createElement("IMG");
            _finalComponent.alt = component.resources[0].props?.alt || "";
            _finalComponent.src = component.resources[0].src;
            _finalComponent.className = GLOBAL.loading;

            ImageHelper(_finalComponent,
                (img) => img.classList.remove(GLOBAL.loading),
                (img) => img.classList.remove(GLOBAL.loading)
            );
            break;
    }
    _finalComponent.style = component.style;
    component.node = _finalComponent;
    return _finalComponent;
}