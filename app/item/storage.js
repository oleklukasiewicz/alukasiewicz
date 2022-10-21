let storageGroups = () =>
    [
        {
            id: "home",
            aliases:
                [
                    "landing"
                ],
            arg:
            {
                groupsOrder:
                    [
                        "featured",
                        "organic-group",
                        "all"
                    ]
            }
        },
        {
            id: "featured",
            title: "Featured art",
            createDate:
            {
                day: 5,
                month: 11,
                year: 2021
            },
            groups: ["home"],
            arg:
            {
                itemsOrder:
                    [
                        "orchid", "lighthouse", "lily"
                    ]
            }
        },
        {
            id: "organic-group",
            title: "Organic collection",
            groups:
                [
                    "home"
                ],
            arg:
            {
                itemsOrder: ["crocus", "lily", "tree"]
            }
        },
        {
            id: "all",
            aliases:
                [
                    "work"
                ],
            title: "All projects",
            groups: ["home"],
            isDefault: true
        },
        {
            id: "dungeons-builds",
            aliases:
                [
                    "builds"
                ],
            title: "Minecraft Dungeons Builds"
        }
    ]
let storageItems = () =>
    [
        {
            id: "adventure",
            folder: "/adventure",
            isLink: "https://www.instagram.com/p/CCmAJKGBWeb/",
            title: "Let the journey begin",
            tile: {
                content: "Don't wait for the adventure's start - begin it by yourself!",
                image: "/adventure.webp"
            },
            createDate: {
                day: 13,
                month: 7,
                year: 2020
            }
        },
        {
            id: "airship",
            folder: "/airship",
            isLink: "https://www.instagram.com/p/CMXFzXihSGw/",
            title: "Ocean of Clouds",
            tile: {
                content: "The great adventure does not have to take place at sea. Now with new frame and improved clouds!",
                image: "/airship-v2.webp"
            },
            createDate: {
                day: 27,
                month: 10,
                year: 2020
            },
            modifyDate: {
                day: 13,
                month: 3,
                year: 2021
            }
        },
        {
            id: "crocus",
            folder: "/crocus",
            isLink: "https://www.instagram.com/p/CdqCxFOq1fh/",
            title: "The Crocus",
            tile: {
                content: "One of the first signs of spring - crocus, also know as the source of one of the most expensive spice.",
                image: "/crocus-base.webp"
            },
            groups: [
                "featured",
                "organic-group"
            ],
            createDate: {
                day: 17,
                month: 5,
                year: 2022
            }
        },
        {
            id: "isometric-castle",
            folder: "/isometric",
            isLink: "https://www.instagram.com/p/CLEOiDiBDey/",
            title: "Procedural World",
            tile: {
                content: "The world is full of patterns. Here it is represented as a set of tiles.",
                image: "/isometric_castle.webp"
            },
            groups: [
                "featured"
            ],
            createDate: {
                day: 9,
                month: 2,
                year: 2021
            }
        },
        {
            id: "lighthouse",
            folder: "/lighthouse",
            isLink: "https://www.instagram.com/p/CcIPscSKKyE/",
            title: "Lighthouse",
            tile: {
                content: "Alone lighthouse on the night sea with a sky full of stars.",
                image: "/lighthouse.webp"
            },
            groups: [
                "featured"
            ],
            createDate: {
                day: 16,
                month: 3,
                year: 2022
            }
        },
        {
            id: "lily",
            folder: "/lily",
            isLink: "https://www.instagram.com/p/CXlcDShooxu/",
            title: "Water Lily",
            tile: {
                content: "Mandatory element in almost every organic picture of river or lake.",
                image: "/lily-blank.webp"
            },
            groups: [
                "featured",
                "organic-group"
            ],
            createDate: {
                day: 10,
                month: 12,
                year: 2021
            }
        },
        {
            id: "orchid",
            folder: "/orchid",
            isLink: "https://www.instagram.com/p/Cd3DiBBqvOR/",
            title: "The Orchid",
            tile: {
                content: "A flower considered a symbol of beauty and love that grows on trees or between rocks rather than directly in the ground.",
                image: "/orchid.webp"
            },
            groups: [
                "featured",
                "organic-group"
            ],
            createDate: {
                day: 22,
                month: 5,
                year: 2022
            }
        },
        {
            id: "person-practise",
            folder: "/person",
            isLink: "https://www.instagram.com/p/COAYwduB3jc/",
            title: "Character practise",
            tile: {
                content: "The first result of learning to draw pixel characters. Based on tutorial by Slynyrd.",
                image: "/person_practise.webp"
            },
            createDate: {
                day: 23,
                month: 4,
                year: 2021
            }
        },
        {
            id: "rose",
            folder: "/rose",
            isLink: "https://www.instagram.com/p/CMZkmJaBhd1/",
            title: "The digital blossom",
            tile: {
                content: "A simple red rose. Slightly improved with new colours and details.",
                image: "/rose_plant.webp"
            },
            groups: [
                "organic-group"
            ],
            createDate: {
                day: 9,
                month: 12,
                year: 2020
            },
            modifyDate: {
                day: 14,
                month: 3,
                year: 2021
            }
        },
        {
            id: "tree",
            folder: "/tree-on-rock",
            isLink: "https://www.instagram.com/p/CPSx-X8hdVM/",
            title: "Organic pixels",
            tile: {
                content: "One of the most iconic plants on the planet - a tree! Here growing on a giant rock.",
                image: "/tree-on-rock.webp"
            },
            groups: [
                "featured",
                "organic-group"
            ],
            createDate: {
                day: 23,
                month: 5,
                year: 2021
            }
        },
        {
            id: "fluent-design-system",
            folder: "/beta",
            title: "Fluent Design System",
            tile:
            {
                image: "/fluent.webp",
                content: "Reflections on our design history, the progression, and the potential of how we collectively design for the future."
            },
            createDate: {
                day: 27,
                month: 10,
                year: 2020
            },
            modifyDate: {
                day: 23,
                month: 5,
                year: 2022
            }
        },
        {
            id:"sparkler-build",
            folder:"/sparkler",
            title:"The Sparkler",
            tile:
            {
                image:"/sparkler.webp",
                content:"Healing and damage focused build for Minecraft Dungeons made in spooky theme."
            },
            createDate: {
                day: 21,
                month: 10,
                year: 2022
            },
            groups: [
                "builds"
            ],
        }
    ]