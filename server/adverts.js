"use strict"

/**
 * File to contain data about adverts
 */

const util = require('./utility');

/**
 * Contains information about adverts, and their assosiated 
 */
const adverts = [
    {
        id: 1,
        shopId: 1,
        title: "50% OFF ALL GOODS AND SERVICES! LIMITED TIME!",
        body: "Come shop at game for a limited time only, get 50% off all games and consoles when you buy 5 Xboxes!",
        dateAdded: util.getFormattedDate()
    }
]

/**
 * Adds an advert to the system
 * @param {Number} shopId The ID of the shop the advert is for
 * @param {String} title The title of the advert
 * @param {String} body The information about the advert 
 */
function addAdvert(shopId, title, body) {
    const advertId = util.getMaxId(adverts) + 1;

    adverts.push({
        id: advertId,
        shopId,
        title,
        body,
        dateAdded: util.getFormattedDate()
    });
    return advertId;
}

/**
 * Gets a advert based on advert ID. Returns null if it cannot find it.
 * @param {Number} advertId The ID of the advert to get information about
 */
function getAdvert(advertId) {
    const index = adverts.findIndex(
        advert => advert.id == advertId
    );

    if (index >= 0) {
        return adverts[index];
    } else {
        return null;
    }
}

/**
 * Gets all the adverts
 */
function getAllAdverts() {
    return adverts;
}

module.exports = {
    addAdvert,
    getAdvert,
    getAllAdverts
};