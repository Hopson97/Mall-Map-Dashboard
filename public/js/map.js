"use strict"

function makeRoom(id, x, y, width, height) {
    return {
        id,
        x,
        y,
        width,
        height,
        type: "none"
    }
}

/**
 * Converts the room's type into a colour
 * @param {String} type The type that the room is
 */
function typeToColour(type) {
    const typeLowerCase = type.toLowerCase();
    switch (typeLowerCase) {
        case "entertainment":
            return new Colour(128, 0, 128)

        default:
            return new Colour(50, 50, 50);
    }
}

function makeCorridor(x, y, width, height) {
    return {
        x,
        y,
        width,
        height
    }
}

function getMallLayout() {
    const rooms = [];
    const paths = [];
    let id = 0;
    rooms.push(makeRoom(++id, 0, 0, 50, 100));
    rooms.push(makeRoom(++id, 50, 0, 50, 100));
    rooms.push(makeRoom(++id, 100, 0, 50, 100));
    rooms.push(makeRoom(++id, 150, 0, 50, 100));
    rooms.push(makeRoom(++id, 200, 0, 100, 100));
    rooms.push(makeRoom(++id, 300, 0, 200, 300));

    rooms.push(makeRoom(++id, 0, 200, 50, 100));
    rooms.push(makeRoom(++id, 50, 200, 50, 100));
    rooms.push(makeRoom(++id, 150, 200, 100, 100));
    rooms.push(makeRoom(++id, 250, 200, 50, 100));

    rooms.push(makeRoom(++id, 0, 300, 100, 100));
    rooms.push(makeRoom(++id, 150, 300, 100, 100));
    rooms.push(makeRoom(++id, 250, 300, 250, 100));

    paths.push(makeCorridor(0, 100, 300, 100));
    paths.push(makeCorridor(100, 200, 50, 200));

    let minX = 0xFFFFFFF;
    let maxX = -0xFFFFFFF;
    let minY = minX;
    let maxY = maxX;
    for (const room of rooms) {
        minX = Math.min(room.x, minX);
        minY = Math.min(room.y, minY);
        maxX = Math.max(room.x + room.width, maxX);
        maxY = Math.max(room.y + room.height, maxY);
    }

    return {
        rooms,
        paths,
        bounds: {
            minX,
            minY,
            maxX,
            maxY
        }
    };
}