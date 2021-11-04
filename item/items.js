const ITEM_VERSION = "0-0-0-2";
let getGroups = () => [
    new Group(null, "Best pixel art", new ItemDate(3, 6, 2021), { route: ["best_pixel", "pixel"] }),
    new Group("isometric-world", "Isometric world", new ItemDate(27, 8, 2021)),
    new Group(null, "Microsoft Projects", new ItemDate(3, 6, 2021), { route: ["microsoft", "ms"] }),
    new Group("pixel-plants", "Pixel flowers and plants", new ItemDate(20, 11, 2021)),
    new Group("beta","Beta projects - do not release",new ItemDate(31,10,2021))
];
let getItems = () => [
    new Item(null, "Pixel tree", "https://www.instagram.com/p/CPSx-X8hdVM/", {
        image: "tree-on-rock/tree-on-rock.webp",
        content: "One of the most iconic plants on the planet - a tree! Here growing on a giant rock."
    }, new ItemDate(23, 5, 2021), { group: ["best_pixel", "isometric-world","pixel-plants"] }),
    new Item(null, "Character practise", "https://www.instagram.com/p/COAYwduB3jc/", {
        image: "person/person_practise.webp",
        content: "The first result of learning to draw pixel characters. Based on tutorial by Slynyrd."
    }, new ItemDate(23, 4, 2021), { group: ["best_pixel"] }),
    new Item(null, "The digital blossom", "https://www.instagram.com/p/CMZkmJaBhd1/", {
        image: "rose/rose_plant.webp",
        content: "A simple red rose. Slightly improved with new colours and details."
    }, new ItemDate(9, 12, 2020), {
        modifyDate: new ItemDate(14, 3, 2021),
        group: ["best_pixel","pixel-plants"]
    }),
    new Item(null, "Ocean of clouds", "https://www.instagram.com/p/CMXFzXihSGw/", {
        image: "airship/airship-v2.webp",
        content: "The great adventure does not have to take place at sea. Now with new frame and clouds!"
    }, new ItemDate(27, 10, 2020), {
        modifyDate: new ItemDate(13, 3, 2021),
        group: ["best_pixel"],
    }),
    new Item(null, "Procedural world", "https://www.instagram.com/p/CLEOiDiBDey/", {
        image: "isometric/isometric_castle.webp",
        content: "The world is full of patterns. Here it is represented as a set of tiles."
    }, new ItemDate(9, 2, 2021), { group: ["best_pixel", "isometric-world"] }),
    new Item(null, "Let the journey begin!", "https://www.instagram.com/p/CCmAJKGBWeb/", {
        image: "adventure/adventure.webp",
        content: "Don't wait for the adventure's start - begin it by yourself."
    }, new ItemDate(13, 07, 2020), {
        tileImageStyle: "object-position:0% 100%;"
    }),
    new Item(null, "Fluent Design System", [
        new Section("", [new ItemQuote("Natural on every device", "Microsoft")], { noTitle: true }),
        new Section("Design at scale", [`The idea of establishing a design system at Microsoft started a decade ago when several product teams merged and a handful of design pioneers started working together. Their work gave rise to our first shared design language — a bold achievement given that design was in its infancy at Microsoft and the company’s success at that time was built on a myriad of siloed products.`, '', `These early efforts toward a shared design language built a better creative environment and fostered stronger partnerships between teams.`, new ItemImage("beta/resources/airship.webp", "Ocean of clouds"), `The Fluent Design System continues this work. Fluent is evolving to be more than a set of outcomes and will define the process by which we collectively design and build products. It represents the growth and influence of design thinking within Microsoft.`, '',`It’s a living thing that continues to evolve. And like any living thing, it has basic needs to grow and flourish.`, '', `Fluent becomes the best version of itself when there is clarity around what it is, what it could be, and why that’s important. Today, we aspire to make Fluent a collective, open design system that connects us, inspiring and influencing everything we create.`
        ]),
        new Section("Designing how we design", [`The value of Fluent’s collective approach is becoming more evident as we build coherence across products and platforms. A rich unified search experience, people experience across products, our recent brand iconography efforts, and alignment around the universal language of illustration are just the beginning of Fluent’s impact.`
        ]),
        new Section("A collective design system", [`Fluent Design System builds on the momentum of great things already happening at Microsoft, standing on shoulders without stepping on toes. It celebrates those who contribute to what we collectively do, regardless of what team they work on. It borrows from engineering workflows to help us be efficient where we can, saving creative energy for where it’s most needed.`,new ItemImage("beta/resources/airship-v2.webp", "Ocean of clouds"), `Rising to this challenge will take a lot of time and effort, and we all have day jobs in specific products. But it’s going to pay dividends along the way. Over time it can bring our culture, our business, our technology, and our experiences together.`]),
        new Section("Partner with Microsoft Design", ["The Fluent Design System improves with your input. We learn and improve the system based on feedback we receive from our customers, partners, and community of developers and designers. If you have something to share about Fluent design, get in touch with us here."])
    ], {
        image: "airship.webp",
        content: "Reflections on our design history, the progression, and the potential of how we collectively design for the future."
    }, new ItemDate(27, 10, 2020), {
        route: ["fluent"],
        group: ["microsoft"],
        modifyDate: new ItemDate(10, 2, 2021),
        downloadResources: { folder: "/beta", resources: ["airship.webp"] }
    }),
    new Item(null, "Wonderfull spice", "https://www.instagram.com/p/CMXFzXihSGw/", {
        image: "crocus/crocus-base.webp",
        content: "One of the most common summer plant - Crocus but also the most expensive spice in the world!"
    }, new ItemDate(20, 10, 2021), {
        group: ["best_pixel","beta"],
    }),
];