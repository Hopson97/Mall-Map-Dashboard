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
            return new Colour(128, 0, 128);

        case "food/drink":
            return new Colour(0, 128, 100);

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
    
    //Generates the x, y, width, and height values for all rooms and paths
    rooms.push(makeRoom(++id, 1100, 900, 200, 200));
    rooms.push(makeRoom(++id, 1300, 900, 200, 200));
    rooms.push(makeRoom(++id, 1500, 900, 200, 200));
    rooms.push(makeRoom(++id, 1700, 900, 200, 200));
    rooms.push(makeRoom(++id, 50, 900, 200, 200));
    rooms.push(makeRoom(++id, 250, 900, 200, 200));
    rooms.push(makeRoom(++id, 450, 900, 200, 200));
    rooms.push(makeRoom(++id, 650, 900, 200, 200));
    rooms.push(makeRoom(++id, 650, 1100, 200, 200));
    rooms.push(makeRoom(++id, 50, 1100, 600, 200));
    rooms.push(makeRoom(++id, 50, 1500, 600, 200));
    rooms.push(makeRoom(++id, 1300, 1100, 600, 200));
    rooms.push(makeRoom(++id, 1300, 1500, 600, 200));
    rooms.push(makeRoom(++id, 1100, 1500, 200, 450));
    rooms.push(makeRoom(++id, 650, 1500, 200, 450));
    rooms.push(makeRoom(++id, 1700, 1300, 200, 200));
    rooms.push(makeRoom(++id, 50, 1300, 200, 200));
    rooms.push(makeRoom(++id, 750, 0, 450, 450));
    rooms.push(makeRoom(++id, 1200, 300, 200, 200));
    rooms.push(makeRoom(++id, 1400, 350, 200, 200));
    rooms.push(makeRoom(++id, 1600, 400, 200, 200));
    rooms.push(makeRoom(++id, 1800, 550, 150, 150));
    rooms.push(makeRoom(++id, 550, 300, 200, 200));
    rooms.push(makeRoom(++id, 350, 350, 200, 200));
    rooms.push(makeRoom(++id, 150, 400, 200, 200));
    rooms.push(makeRoom(++id, 0, 550, 150, 150));
    rooms.push(makeRoom(++id, 1100, 1100, 200, 200));

    paths.push(makeCorridor(150, 450, 1650, 250));
    paths.push(makeCorridor(0, 700, 1950, 200));
    paths.push(makeCorridor(250, 900, 1450, 800));
    paths.push(makeCorridor(850, 1700, 250, 250));

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