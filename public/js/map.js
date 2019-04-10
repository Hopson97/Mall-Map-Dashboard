"use strict"

function makeRoom(id, x, y, width, height) {
    return {
        id, x, y, width, height
    }
}

function getRooms() {
    const rooms = [];
    let id = 0;
    rooms.push(makeRoom(++id, 0,    0, 50,  100));
    rooms.push(makeRoom(++id, 50,   0, 50,  100));
    rooms.push(makeRoom(++id, 100,  0, 50,  100));
    rooms.push(makeRoom(++id, 150,  0, 50,  100));
    rooms.push(makeRoom(++id, 200,  0, 100, 100));
    rooms.push(makeRoom(++id, 300,  0, 200, 300));

    rooms.push(makeRoom(++id, 0,    200, 50,    100));
    rooms.push(makeRoom(++id, 50,   200, 50,    100));
    rooms.push(makeRoom(++id, 150,  200, 100,   100));
    rooms.push(makeRoom(++id, 250,  200, 50,    100));

    rooms.push(makeRoom(++id, 0,    300, 100,   100));
    rooms.push(makeRoom(++id, 150,   300, 100,  100));
    rooms.push(makeRoom(++id, 250,   300, 250,  100));


    

    return rooms;
}