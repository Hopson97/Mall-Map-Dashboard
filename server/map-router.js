"use strict"

const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser');

let wss;

const router = express.Router();
router.use(bodyParser.json());

/**
 * Contains data about each room, eg roomId and the assosiated storeId
 */
const rooms = {  
};

router.post("/section-data", postSectionData);
router.get("/section-data", getSectionData);
router.get("/layout", getLayout);

//========================
//
//   HTTP Post Requests
//
//========================
/**
 * Sets the information about a room in the mall. 
 * @param {express.request} request The HTTP request. Body should contain JSON with the room's ID, with the store name and type assosiated with it
 * @param {express.Response} response The HTTP response. Response is true on success.
 */
function postSectionData(request, response) {
    const roomId   = request.body.roomId;
    const storeId  = request.body.storeId;
    rooms[roomId] = storeId;

    //Send info to all clients about the updated room
    for (const client of wss.clients) {
        console.log("Sending data");
        client.send(JSON.stringify({
            type: "RoomUpdate",
            roomId,
            storeId
        }));
    }

    response.send(true);
}

//========================
//
//   HTTP Get Requests
//
//========================
/**
 * Gets the data about the rooms, eg what their assosiated store is
 * @param {express.Request} request The HTTP request. 
 * @param {express.Response} response The HTTP response. Contains the JSON with information about all the rooms (room ID, and what store is assosiated with it)
 */
function getSectionData(request, response) {
    response.json(rooms);
}

/**
 * Gets the x, y, width, depth, height etc information about all the rooms, and the x, y, width and depth data about all paths
 * @param {express.Request} request The HTTP request. 
 * @param {express.Response} response The HTTP response. Contains the JSON with information about all the rooms (room ID, and what store is assosiated with it)
 */
function getLayout(request, response) {
    fs.readFile('./server/data/map-layout.json', (err, json) => {
        const layout = JSON.parse(json);
        response.json(layout);
    });
}


module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};