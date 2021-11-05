const ITEM_VERSION = "0-0-0-2";
let getGroups = () => [
    new Group("pixel-flower",["pixel-plants"],"Pixel plants and bloossom",new ItemDate(5,11,2021)),
    new Group("best-pixelart",["best","best-pixel"],"Best pixelart projects",new ItemDate(5,11,2021)),
];
let getItems = () => [
    new Item("fluent-design-system",["ms-fluent","fluent"],false,"/beta","Fluent design System",false,"Making design system more intuitive",new ItemDate(5,11,2021))
];