"use strict"

/**
 * This file is for handling the shop room data
 * This is the rooms of the mall, and their assosiated shop ID
 */

 /**
  * Contains data about each room of the map and the 
  * shop that it is assosiated with
  */
const shopRooms = [];

//========================
//
//   Functions
//
//========================
/**
 * Adds a shop room
 * @param {Number} roomId The room ID
 * @param {Number} shopId The shop ID
 */
function addShopRoom(roomId, shopId) {
    shopRooms.push({roomId, shopId: shopId});
}

/**
 * Deletes a shop room. Returns false if the room was not found
 * @param {Number} roomId The room ID to delete 
 */
function tryDeleteShopRoomByRoomId(roomId) {
    const index = shopRooms.findIndex(
        shopRoom => shopRoom.roomId == roomId
    );
    if (index >= 0) {
        shopRooms.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Deletes a shop room. Returns false if the room was not found
 * @param {Number} roomId The room ID to delete 
 */
function tryDeleteShopRoomByShopId(shopId) {
    const index = shopRooms.findIndex(
        shopRoom => shopRoom.shopId == shopId
    );
    if (index >= 0) {
        shopRooms.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Returns all of the shop rooms
 */
function getAllShopRooms() {
    return shopRooms;
}

module.exports = {
    addShopRoom,
    tryDeleteShopRoomByRoomId,
    tryDeleteShopRoomByShopId,
    getAllShopRooms
}