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

            if (!_arg.hideControls && component.resource.length > 1) {
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

// Item component converter and parser
let ItemConverter = async function (component, index, itemFolder, item) {
    if (component.resource) {

        //converting into valid resources
        for (let index = 0; index < component.resource.length; index++) {
            let resource = component.resource[index];
            switch (resource.type) {
                case "group":
                    let group = ItemController.getGroupById(resource.id);
                    group.content.forEach((item, itemIndex) => {
                        component.resource.splice((index + itemIndex), 0,
                            {
                                type: "image",
                                src: APP.itemFolder + item.folder + item.tile.image,
                                alt: item.title
                            });
                    });
                    index += (group.content.length - 1);
                    component.resource.splice(index + 1, 1);
                    break;
                case "image":
                    if (!resource.globalPath)
                        resource.src = APP.itemFolder + itemFolder + APP.resourceFolder + resource.src;
                    break;
            }
        };

        //getting resources data for hash
        component.resIndex = item.resources.length;
        component.resLastIndex = item.resources.length + component.resource.length - 1;

        //generating hash and adding into item resources list
        component.resource.forEach(res => item.resources.push(new ResourceMap(res, createHash(index + component.resIndex + item.folder + res.src), component.resIndex, component.resLastIndex)))
    }
}