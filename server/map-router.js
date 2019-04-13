"use strict"

const express = require('express');
const bodyParser = require('body-parser');

let wss;

const router = express.Router();
router.use(bodyParser.json());

/**
 * Contains data about each room, eg roomid and the assosiated storeid
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
    const roomid   = request.body.roomid;
    const storeid  = request.body.storeid;
    console.log(roomid);
    rooms[roomid] = storeid;
    console.log(rooms);

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