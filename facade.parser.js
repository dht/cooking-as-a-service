const config = require("poe-utils/config");

const trim = (obj, arr) => {
    return Object.keys(obj)
        .filter(key => arr.indexOf(key) === -1)
        .reduce((output, key) => {
            output[key] = obj[key];
            return output;
        }, {});
};

const parseImage = url => {
    return `${config.socketsUrl}/image?url=${encodeURIComponent(
        url.replace("webp", "jpg"),
    )}`;
};

const parseRecipes = recipes => {
    return (recipes || []).reduce((output, recipe) => {
        const { id = "", image = "" } = recipe || {};

        output[id] = {
            ...trim(recipe, ["image"]),
            imageUrl: parseImage(image),
        };

        return output;
    }, {});
};

const parseRecipe = recipe => {
    if (!recipe) return null;

    const {
        image = "",
        ingredients = [],
        instructions = [],
        nutritionImageUrl,
    } = recipe || {};

    const paragraphs1 = [
        {
            title: "מצרכים",
            content: "",
            list: ingredients,
            listType: "ul",
        },
    ];

    const paragraphs2 = [
        {
            title: "הוראות הכנה",
            content: "",
            list: instructions,
            listType: "ol",
        },
    ];

    return {
        ...trim(recipe, [
            "image",
            "ingredients",
            "instructions",
            "nutritionImageUrl",
        ]),
        imageUrl: parseImage(image),
        sideImageUrl: nutritionImageUrl,
        paragraphs1,
        paragraphs2,
    };
};

module.exports = {
    parseRecipes,
    parseRecipe,
};
