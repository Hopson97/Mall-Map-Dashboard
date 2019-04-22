"use strict"

/**
 * This file is for handling the shop data
 */
const fs = require('fs');

const util = require('./utility');
const shopRooms = require('./shop-rooms');
const commercials = require('./commercials')

/**
 * Tries to add a shop. Returns new shop ID, shop id of -1 on failure (eg shop with same name already exists)
 * @param {String} name The name of the shop to add
 * @param {String} type The type of shop. Must be one of "Entertainment", "Food/Drink", "Clothes"
 */
function addShop(name, type) {
    let shopId = -1;
    util.editJson("shops.json", shops => {
        //Check if shop with same name already exists
        const index = shops.findIndex(
            shop => shop.name == name
        );
        //findIndex retruns -1 if cannot find the shop
        if (index < 0) {
            //Get the new ID by getting maximum ID value + 1
            shopId = util.getMaxId(shops) + 1
            //Add the shop
            shops.push({
                id: shopId,
                name,
                type,
                dateAdded: util.getFormattedDate()
            });
        }
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
    const shops = getAllShops()
    const index = shops.findIndex(
        shop => shop.id == shopId
    );

    if (index >= 0) {
        return shops[index];
    } else {
        return null;
    }
}

/**
 * Deletes a shop, and any shoprooms, commericals assosiated with it
 * @param {Number} shopId The shopId of the stop to delete
 */
function tryDeleteShop(shopId) {
    let result = false;
    util.editJson("shops.json", shops => {
        const index = shops.findIndex(
            shop => shop.id == shopId
        );
        if (index >= 0) {
            shops.splice(index, 1);
            shopRooms.tryDeleteShopRoomByShopId(shopId);
            commercials.tryDeleteCommercialByShopId(shopId);
            result = true;
        }
    });
    return result;
}

/**
 * Gets a list of all the shops
 */
function getAllShops() {
    const buffer = fs.readFileSync("./server/data/shops.json");
    const shops = JSON.parse(buffer);
    return shops;
}

module.exports = {
    addShop,
    getShopInformation,
    tryDeleteShop,
    getAllShops
}