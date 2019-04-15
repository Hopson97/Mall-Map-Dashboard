"use strict"

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

router.post("/sect-data", postSectionData);
router.get("/sect-data", getSectionData);

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
    rooms[roomId] = storeId;;

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
 * 
 * @param {express.Request} request The HTTP request. 
 * @param {express.Response} response The HTTP response. Contains the JSON with information about all the rooms (room ID, and what store is assosiated with it)
 */
function getSectionData(request, response) {
    response.json(rooms);
}

module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};