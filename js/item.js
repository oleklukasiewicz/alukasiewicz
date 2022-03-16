const COMPONENTS_VERSION = 1;

//Item component builder for basic item content controls and sections
let ItemComponentBuilder = async function (component, itemFolder, item) {
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
            _component.append(component.content);
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

            if (!component.hideControls && component.resource.length > 1) {
                _component.innerHTML = "<div><b class='font-subtitle'>" + component.title + "</b></div>";

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

            //generating images
            let _loadingPromises = [];
            let _max = _arg.imagesCount || component.resource.length;
            _max = _max > 5 ? 5 : _max;
            for (let i = 0; i < _max; i++) {
                let res = component.resource[i];
                let _img = document.createElement("IMG");
                _img.alt = res.alt || "";
                _img.src = APP.itemFolder + itemFolder + APP.resourceFolder + res.src;
                _img.classList.add(GLOBAL.loading);
                _list.appendChild(_img);
                _loadingPromises.push(ImageHelper(_img,
                    function (img) {
                        img.onclick = function () {
                            ViewController.navigate(VIEW.resource, {
                                routeArg: [
                                    item.id,
                                    item.resources[component.resIndex + i].hash
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
    }
    return _component;
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