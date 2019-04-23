"use strict"

const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser');

const shopRooms = require("../shop-rooms")

let wss;

const router = express.Router();
router.use(bodyParser.json());

//Requests
router.post("/add", postSectionData);
router.delete("/remove", deleteSectionData);
router.get("/shop-room-list", getSectionData);
router.get("/layout", getLayout);



// Post Requests
/**
 * Sets the information about a room in the mall. 
 * @param {express.request} request The HTTP request. Body should contain JSON with the room's ID, with the shop name and type assosiated with it
 * @param {express.Response} response The HTTP response. Response is true on success.
 */
function postSectionData(request, response) {
    const roomId = request.body.roomId;
    const shopId = request.body.shopId;

    shopRooms.addShopRoom(roomId, shopId);

    //Send info to all clients about the updated room
    for (const client of wss.clients) {
        client.send(JSON.stringify({
            type: "RoomUpdate",
            roomId,
            shopId
        }));
    }

    response.sendStatus(201);
}


// Delete Requests
/**
 * Deletes a shop room from
 * @param {express.Request} request The HTTP request. Must contain the roomID to remove in JSON body
 * @param {express.Response} response 204 for sucess, 404 for error aka can't find room you are trying to remove    
 */
function deleteSectionData(request, response) {
    const roomId = request.body.id;
    if (shopRooms.tryDeleteShopRoomByRoomId(roomId)) {
        response.sendStatus(204);
    } else {
        response.sendStatus(404);
    }
}


// Get Requests
/**
 * Gets the data about the rooms, eg what their assosiated shop is
 * @param {express.Request} request The HTTP request. 
 * @param {express.Response} response The HTTP response. Contains the JSON with information about all the rooms (room ID, and what shop is assosiated with it)
 */
function getSectionData(_, response) {
    response.json(shopRooms.getAllShopRooms());
}

/**
 * Gets the x, y, width, depth, height etc information about all the rooms, and the x, y, width and depth data about all paths
 * @param {express.Request} request The HTTP request. 
 * @param {express.Response} response The HTTP response. Contains the JSON with information about all the rooms (room ID, and what shop is assosiated with it)
 */
function getLayout(_, response) {
    fs.readFile('./server/data/map-layout.json', (err, json) => {
        const layout = JSON.parse(json);
        const {rooms, paths} = layout;
        let maxY = 0xFFFFFFF;
        let maxX = -0xFFFFFFF;
        for (const room of rooms) {
            maxX = Math.max(room.x + room.width, maxX);
            maxY = Math.max(room.y + room.depth, maxY);
        }

        response.json( {
            rooms,
            paths,
            bounds: {
                maxX,
                maxY
            }
        });
    });
}


module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};