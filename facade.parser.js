const config = require("poe-utils/config");

const parseMatches = matches => {
    return (matches || []).reduce((output, match) => {
        const { id = "" } = match;

        output[id] = {
            ...match,
            title: match.name,
            subtitle: "בת " + match.age,
            isFull: false,
        };
        return output;
    }, {});
};

const parseProfile = profile => {
    const { essays = [], images = [] } = profile || {};

    if (!profile) return null;

    const paragraphs = essays.map(essay => {
        const { title, content } = essay || {};

        return {
            title,
            content,
        };
    });

    const _images = images.map(image => {
        return `${config.socketsUrl}/image?url=${encodeURIComponent(
            image.replace("webp", "jpg"),
        )}`;
    });

    const info = [
        profile.city,
        profile.looking,
        profile.info,
        profile.match,
    ].filter(i => i);

    return {
        images: _images,
        isGreen: profile.online,
        name: profile.username,
        paragraphs,
        info,
        isFull: true,
    };
};

module.exports = {
    parseMatches,
    parseProfile,
};
