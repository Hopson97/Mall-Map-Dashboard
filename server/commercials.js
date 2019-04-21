"use strict"

/**
 * File to contain data about commercials
 */

const util = require('./utility');

/**
 * Contains information about commercials, and their assosiated 
 */
const commercials = [
    {
        id: 1,
        shopId: 1,
        title: "50% OFF ALL GOODS AND SERVICES! LIMITED TIME!",
        body: "Come shop at game for a limited time only, get 50% off all games and consoles when you buy 5 Xboxes!",
        dateAdded: util.getFormattedDate()
    },
    {
        id: 2,
        shopId: 1,
        title: "commercial 2",
        body: "Lorem ipsum....",
        dateAdded: util.getFormattedDate()
    },
    {
        id: 3,
        shopId: 1,
        title: "commercial 3",
        body: "Lorem ipsum....",
        dateAdded: util.getFormattedDate()
    },
    {//
        id: 4,
        shopId: 1,
        title: "commercial 4",
        body: "Lorem ipsum....",
        dateAdded: util.getFormattedDate()
    },
    {
        id: 5,
        shopId: 1,
        title: "commercial 5",
        body: "Lorem ipsum....",
        dateAdded: util.getFormattedDate()
    },
    {
        id: 6,
        shopId: 1,
        title: "commercial 6",
        body: "Lorem ipsum....",
        dateAdded: util.getFormattedDate()
    },
]

/**
 * Adds an commercial to the system
 * @param {Number} shopId The ID of the shop the commercial is for
 * @param {String} title The title of the commercial
 * @param {String} body The information about the commercial 
 */
function addCommercial(shopId, title, body) {
    const commercialId = util.getMaxId(commercials) + 1;

    commercials.push({
        id: commercialId,
        shopId,
        title,
        body,
        dateAdded: util.getFormattedDate()
    });
    return commercialId;
}

/**
 * Gets a commercial based on commercial ID. Returns null if it cannot find it.
 * @param {Number} commercialId The ID of the commercial to get information about
 */
function getCommercial(commercialId) {
    const index = commercials.findIndex(
        commercial => commercial.id == commercialId
    );

    if (index >= 0) {
        return commercials[index];
    } else {
        return null;
    }
}

/**
 * Gets all the commercials
 */
function getAllCommercials() {
    return commercials;
}

module.exports = {
    addCommercial,
    getCommercial,
    getAllCommercials
};