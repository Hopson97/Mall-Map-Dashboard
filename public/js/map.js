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
    

    //Top
    rooms.push(makeRoom(++id, 0, 0, 150, 150));
    rooms.push(makeRoom(++id, 150, 0, 150, 150));
    rooms.push(makeRoom(++id, 300, 0, 250, 100));
    rooms.push(makeRoom(++id, 550, 0, 250, 100));
    rooms.push(makeRoom(++id, 800, 0, 150, 150));
    rooms.push(makeRoom(++id, 950, 0, 150, 150));

    //Middle left
    rooms.push(makeRoom(++id, 0, 250, 150, 150));
    rooms.push(makeRoom(++id, 150, 250, 150, 150));
    rooms.push(makeRoom(++id, 300, 250, 150, 150));

    //Middle right
    rooms.push(makeRoom(++id, 650, 250, 150, 150));
    rooms.push(makeRoom(++id, 800, 250, 150, 150));
    rooms.push(makeRoom(++id, 950, 250, 150, 150));

    //Bottom
    rooms.push(makeRoom(++id, 300, 400, 150, 150));
    rooms.push(makeRoom(++id, 650, 400, 150, 150));

    paths.push(makeCorridor(0, 100, 1100, 150));
    paths.push(makeCorridor(450, 250, 200, 300));

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