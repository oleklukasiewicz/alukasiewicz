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
            if (!_arg.hideControls && component.resource.length > 1) {
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
                            item.resources[component.resIndex].hash
                        ],
                        currentItem: item,
                    })
                }
                _component.children[0].appendChild(_button);
            }

            let _list = document.createElement("DIV");
            _list.classList.add("list");
            _component.appendChild(_list);

            //setting up images order and count
            let _loadingPromises = [];
            let _max = _arg.imagesCount || component.resource.length;
            _max = _max > 5 ? 5 : _max;
            let _order = _arg.resourceOrder || [...Array(5).keys()];
            if (_order.length < _max)
                for (let orderIndex = _order.length - 1; orderIndex < _max; orderIndex++)
                    _order[orderIndex] = orderIndex;

            //generating images
            for (let index = 0; index < _max; index++) {
                let i = _order[index];
                let res = component.resource[i];
                let _img = document.createElement("IMG");
                _img.alt = res.alt || "";
                _img.src = res.src;
                _img.classList.add(GLOBAL.loading);
                _list.appendChild(_img);
                _loadingPromises.push(ImageHelper(_img,
                    function (img) {
                        img.onclick = function () {
                            ViewController.navigate(VIEW.resource, {
                                routeArg: [
                                    item.id,
                                    item.resources[component.resourceGroupIndex].resources[i].hash
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

            _component.classList.add("items-count-" + _max);

            if (component.alt) {
                let _alt = document.createElement("span");
                _alt.innerHTML = component.alt;
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

// Item complex data converter into simple components
let ItemConverter = async function (component, componentIndex, itemFolder, item) {
    if (component.resource) {

        //converting into valid resources
        let index = 0;
        while (index < component.resource.length) {
            
            //converting into valid resources
            let _validResource = await ResourceConverter(component.resource[index], APP.itemFolder + itemFolder + APP.resourceFolder, componentIndex);
            component.resource.splice(index, 1, ..._validResource);
            index += _validResource.length;
        }

        //adding link into resource group
        component.resourceGroupIndex = item.resources.length;

        //adding into item resources list
        item.resources.push(new ResourceGroup(component.resource));
    }
    return component;
}
//Converting components into valid resources for searching, indexing and more
let ResourceConverter = async function (component, targetFolder, componentId) {
    let resources = [];

    switch (component.type) {
        case "group":
            let group = ItemController.getGroupById(component.id);
            group.content.forEach((item) => {

                //ignoring images if are just placeholders
                if (!item.arg.ignoreTileImageInGallery)
                    resources.push(new Resource(APP.itemFolder + item.folder + item.tile.image, "image", createHash(APP.itemFolder + item.folder + item.tile.image + componentId), { alt: item.title }))
            });
            break;
        case "image":
            resources.push(new Resource(targetFolder + component.src, "image", createHash(targetFolder + component.src + componentId), { alt: component.alt }))
            break;
        default:
            resources.push(component);
            break;
    }
    return resources;
}