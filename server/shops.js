"use strict"

/**
 * This file is for handling the shop data
 */
const util = require('./utility');
const shopRooms = require('./shop-rooms');

/**
 * Contains data about all shops that be added into mall rooms
 * Contains data for shop id, shop name, shop type, and the date it was added
 */
const shops = [{
        id: 1,
        name: "Game",
        type: "Entertainment",
        dateAdded: util.getFormattedDate()
    },
    {
        id: 2,
        name: "Greggs",
        type: "Food/Drink",
        dateAdded: util.getFormattedDate()
    },
    {
        id: 3,
        name: "Next",
        type: "Clothes",
        dateAdded: util.getFormattedDate()
    }
];

/**
 * Tries to add a shop. Returns new shop ID, shop id of -1 on failure (eg shop with same name already exists)
 * @param {String} name The name of the shop to add
 * @param {String} type The type of shop. Must be one of "Entertainment", "Food/Drink", "Clothes"
 */
function addShop(name, type) {
    //Check if shop with same name already exists
    const index = shops.findIndex(
        shop => shop.name == name
    );
    if (index >= 0) {
        return -1;
    }

    //Get the new ID by getting maximum ID value + 1
    const shopId = Math.max(...shops.map(shop => shop.id)) + 1;
    //Add the shop
    shops.push({
        id: shopId,
        name,
        type,
        dateAdded: util.getFormattedDate()
    });
    //Return ID
    return shopId;
}

/**
 * Tries to find a shop with the ID "shopId". 
 * Returns null if the shop cannot be found.
 * @param {Number} shopId The shop ID to get info about
 */
function getShopInformation(shopId) {
    const index = shops.findIndex(
        shop => shop.id == shopId
    );

    if (index >= 0) {
        return shops[index];
    } else {
        return null;
    }
}

function tryDeleteShop(shopId) {
    const index = shops.findIndex(
        shop => shop.id == shopId
    );
    if (index >= 0) {
        shops.splice(index, 1);
        shopRooms.tryDeleteShopRoomByShopId(shopId);
        return true;
    }
    else {
        return false;
    }

}

/**
 * Gets a list of all the shops
 */
function getAllShops() {
    return shops;
}

module.exports = {
    addShop,
    getShopInformation,
    tryDeleteShop,
    getAllShops
}