"use strict"

/**
 * File to contain data about commercials
 */

const util = require('./utility');
const fs   = require('fs');

function getAllCommercials() {
    const buffer = fs.readFileSync('./server/data/commercials.json');
    return JSON.parse(buffer);
} 

/**
 * Adds an commercial to the system
 * @param {Number} shopId The ID of the shop the commercial is for
 * @param {String} title The title of the commercial
 * @param {String} body The information about the commercial 
 */
function addCommercial(shopId, title, body) {
    const commercialId = util.getMaxId(getAllCommercials()) + 1;

    util.editJson(`commercials.json`, commercials => {
        commercials.push({
            id: commercialId,
            shopId,
            title,
            body,
            dateAdded: util.getFormattedDate()
        });
    });
    return commercialId;
}

/**
 * Gets a commercial based on commercial ID. Returns null if it cannot find it.
 * @param {Number} commercialId The ID of the commercial to get information about
 */
function getCommercial(commercialId) {
    const commercials = getAllCommercials();
    const index = commercials.findIndex(
        commercial => commercial.id == commercialId
    );
    console.log(commercialId);
    if (index >= 0) {
        return commercials[index];
    } else {
        console.log("\n\nFAILED TO FIND\n\n" + JSON.stringify(commercials) + "\n\n");
        return null;
    }
}

function tryDeleteCommercial(commercialId) {
    let result = false;
    util.editJson('commercials.json', (commercials) => {
        const index = commercials.findIndex(
            commercial => commercial.id == commercialId
        );
        if (index >= 0) {
            commercials.splice(index, 1);
            result = true;
        } else {
            result = false;
        }
    });
    return result;
}

/**
 * Deletes a commercial. Returns false if the room was not found
 * @param {Number} shopId The shop id to find the assosiated commericals with to delete
 */
function tryDeleteCommercialByShopId(shopId) {
    let found = false;

    util.editJson('commercials.json', (commercials) => {
        while (true) {
            const index = commercials.findIndex(
                commercial => commercial.shopId == shopId
            );
            if (index >= 0) {
                commercials.splice(index, 1);
                found = true;
            } else {
                break;
            }
        }
    });
    return found;
}


module.exports = {
    addCommercial,
    getCommercial,
    getAllCommercials,
    tryDeleteCommercial,
    tryDeleteCommercialByShopId
};