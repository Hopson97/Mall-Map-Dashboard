"use strict"

/**
 * File to contain data about adverts
 */

const util = require('./utility');

const adverts = []

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

function getAllAdverts() {
    return adverts;
}

module.exports = {
    addAdvert,
    getAdvert,
    getAllAdverts
};