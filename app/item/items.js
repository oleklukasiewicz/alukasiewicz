const ITEM_VERSION = "0-0-0-3";
const ITEM_ENVIROMENT = "beta";
let getGroups = () => [
    new Group("featured", ["best", "best-pixel"], "Featured art", new ItemDate(5, 11, 2021), null, ["home"], { displayItems: [0,1,2] }),
    new Group("all", ["other", "", "work"], "All projects", new ItemDate(), null, ["home"], {displayItems:[3,5,6]}, true),
    new Group("blog", [], "Blog", new ItemDate(), null, ["home"]),
    new Group("home-group", ["home", "landing"], "Home Group"),
    new Group("organic-group",[],"Organic collection",new Item(26,4,2022))
];
let getItems = () => [
    new Item(null,[],"https://www.instagram.com/p/CcIPscSKKyE/","/crocus","The Crocus","/crocus-base.webp","One of the first signs of spring - crocus, also know as the source of one of the most expensive spice.",new ItemDate(1,5,2022),undefined,["featured","organic-group"]),
    new Item(null, [], "https://www.instagram.com/p/CcIPscSKKyE/", "/lighthouse", "Lighthouse", "/lighthouse.webp", "Alone lighthouse on the night sea with a sky full of stars.", new ItemDate(16, 3, 2022), null, ["featured"]),
    new Item("lily", [], "https://www.instagram.com/p/CXlcDShooxu/", "/lily", "Water lily", "/lily-blank.webp", "Mandatory element in every organic picture of river or lake.", new ItemDate(10, 12, 2021), null, ["best","organic-group"]),
    new Item(null, [], "https://www.instagram.com/p/CPSx-X8hdVM/", "/tree-on-rock", "Organic pixels", "/tree-on-rock.webp", "One of the most iconic plants on the planet - a tree! Here growing on a giant rock.", new ItemDate(23, 5, 2021), null, ["best","organic-group"]),
    new Item(null, [], "https://www.instagram.com/p/CMXFzXihSGw/", "/airship", "Ocean of clouds", "/airship-v2.webp", "The great adventure does not have to take place at sea. Now with new frame and clouds!", new ItemDate(27, 10, 2020), new ItemDate(13, 3, 2021), ["best"]),
    new Item(null, [], "https://www.instagram.com/p/COAYwduB3jc/", "/person", "Character practise", "/person_practise.webp", "The first result of learning to draw pixel characters. Based on tutorial by Slynyrd.", new ItemDate(23, 4, 2021), null, ["best"]),
    new Item(null, ["pixel-rose"], "https://www.instagram.com/p/CMZkmJaBhd1/", "/rose", "The digital blossom", "/rose_plant.webp", "A simple red rose. Slightly improved with new colours and details.", new ItemDate(9, 12, 2020), new ItemDate(14, 3, 2021), ["best","organic-group"]),
    new Item(null, [], "https://www.instagram.com/p/CLEOiDiBDey/", "/isometric", "Procedural world", "/isometric_castle.webp", "The world is full of patterns. Here it is represented as a set of tiles.", new ItemDate(9, 2, 2021), null, ["best"]),
    new Item("let-the-adventure-begin", [], "https://www.instagram.com/p/CCmAJKGBWeb/", "/adventure", "Let the journey begin!", "/adventure.webp", "Don't wait for the adventure's start - begin it by yourself.", new ItemDate(13, 07, 2020), null, [], { tileImageStyle: "object-position:0% 100%;" }),
    new Item(null, ["ms-fluent", "fluent", "ms"], false, "/beta", "Fluent Design System", "/fluent.webp", "Reflections on our design history, the progression, and the potential of how we collectively design for the future.", new ItemDate(27, 10, 2020), new ItemDate(5, 11, 2021), ["blog"]),
   new Item("organic-collection",[],false,"/organic-collection","Organic Collection","/lily-blank.webp",`Since ancient times, it has been believed in various cultures and traditions that plants have deep spiritual meaning.`,new ItemDate(26,4,2022),undefined,["blog"])
];