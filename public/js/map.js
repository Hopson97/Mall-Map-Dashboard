"use strict"

/**
 * Converts the room's type into a colour
 * @param {String} type The type that the room is
 *
function typeToColour(type) {
    const typeLowerCase = type.toLowerCase();
    switch (typeLowerCase) {
        case "entertainment":
            return new Colour(128, 0, 128);

        case "food/drink":
            return new Colour(0, 128, 100);

        case "clothes":
            return new Colour(250, 100, 75);

        case "restaurant":
            return new Colour(50, 50, 188);

        case "bar": 
            return new Colour(210, 180, 140);

        case "toy":
            return new Colour(0, 166, 255);

        default://none
            return new Colour(50, 50, 50);
    }
}

/**
 * Gets the map layout from the server and calculats the maximum X and Y values of it before returning it
 */
async function getMallLayout() {
    const response = await fetch("/api/map/layout");
    const {
        rooms,
        paths
    } = await response.json();

    let maxY = 0xFFFFFFF;
    let maxX = -0xFFFFFFF;
    for (const room of rooms) {
        maxX = Math.max(room.x + room.width, maxX);
        maxY = Math.max(room.y + room.depth, maxY);
    }

    return {
        rooms,
        paths,
        bounds: {
            maxX,
            maxY
        }
    };
}