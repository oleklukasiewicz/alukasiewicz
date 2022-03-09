//Item component builder for basic item content controls and sections
let ItemComponentBuilder = function (component, itemFolder, item) {
    let _type = component.type;
    let _arg = component.arguments || {};
    let _component;
    if (component.dontRender) _type = "none";
    //generating nodes
    switch (_type) {
        case "section":
            _component = document.createElement("DIV");
            _component.classList.add("section");
            if (component.title) {
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

            //generating img
            let _img = document.createElement("IMG");
            _img.src = APP.itemFolder + itemFolder + APP.resourceFolder + component.resource[0].src;
            _img.alt = component.resource[0].alt || "";
            ImageHelper(_img, function () {
                _img.onclick = function () {
                    ViewController.navigate(VIEW.resource, {
                        routeArg: [item.id, item.resources[component.resIndex].hash],
                        currentItem: item
                    })
                }
            });

            //generating alt text
            let _alt = document.createElement("SPAN");
            _alt.className = "img-alt";
            _alt.innerHTML = component.alt || "";

            //building
            _component.appendChild(_img);
            _component.appendChild(_alt);
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
            _component.innerHTML = "<div><b class='font-subtitle'>" + component.title + "</b></div><div class='list'></div>";

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

            //generating images
            let _max = _arg.imagesCount || component.resource.length;
            _max = _max > 5 ? 5 : _max;
            for (let i = 0; i < _max; i++) {
                let res = component.resource[i];
                let _img = document.createElement("IMG");
                _img.alt = res.alt || "";
                _img.src = APP.itemFolder + itemFolder + APP.resourceFolder + res.src;
                _component.children[1].appendChild(_img);
                ImageHelper(_img, function () {
                    _img.onclick = function () {
                        ViewController.navigate(VIEW.resource, {
                            routeArg: [
                                item.id,
                                item.resources[component.resIndex + i].hash
                            ],
                            currentItem: item
                        })
                    }
                });
            }
            _component.classList.add("items-count-" + _max);
            break;
        case "cover":
            _component = document.createElement("DIV");
            _component.classList.add("cover");

            let _coverImg = document.createElement("IMG");
            _coverImg.src = APP.itemFolder + itemFolder + component.image;
            ImageHelper(_coverImg);

            _component.appendChild(_coverImg);
            let _dataNode = document.createElement("DIV");
            _component.appendChild(_dataNode);
            if (component.title) {
                let _title = document.createElement("DIV");
                _title.className = "font-subtitle";
                _title.innerText = component.title;
                _dataNode.append(_title);
            }
            component.actions.forEach((action) => {
                let _action = document.createElement("A");
                _action.classList.add("icon-button");

                let _icon_code = action.icon.substring(1);
                let _rule = '.mi-' + _icon_code + ':before { content:"' + action.icon + '" }';
                document.styleSheets[1].insertRule(_rule, 0);

                let _icon = document.createElement("I");
                _icon.classList.add("mi");
                _icon.classList.add("mi-" + _icon_code);

                ActionResolver(action.action, _action);

                _action.appendChild(_icon);
                _action.append(action.text);
                _dataNode.appendChild(_action);
            })
            break;
        case "item-cover":
            let _item = ItemController.getItemSnapshotById(component.id);
            let _isLinkToWeb = _item.isItemLinkToWeb;
            let _action = _isLinkToWeb ? { text: "Link", icon: "\\ED1D", action: { type: "link", arguments: [_isLinkToWeb] } } : { text: "View item", icon: "\\ED63", action: { type: "navigate", arguments: ["item", _item.id] } };
            let _coverComponent =
            {
                type: "cover",
                title: _item.title,
                image: _item.tile.image,
                actions: [_action]
            }
            return ItemComponentBuilder(_coverComponent, _item.folder, item);
            break;
        default:
            _component = document.createElement("DIV");
    }
    return _component
}
let ActionResolver = function (action, node) {
    switch (action.type) {
        case "link":
            node.href = action.arguments[0];
            node.addEventListener("click", function (e) {
                e.preventDefault();
                window.open(action.arguments[0], '_blank').focus()
            });
            break;
        case "navigate":
            node.ref = action.arguments.join("/");
            node.addEventListener("click", function (e) {
                e.preventDefault();
                ViewController.navigate(action.arguments[0], { routeArg: action.arguments.slice(1) });
            })
            break;
    }
}
let ImageHelper = async function (image, onload = () => { }) {
    let imageIsNotLoaded = function () {
        image.src = "/img/image_error.webp";
        image.onload = function () { }
    }
    await new Promise((resolve) => {
        image.onload = () => resolve(onload());
        image.onerror = () => resolve(imageIsNotLoaded());
    });
}