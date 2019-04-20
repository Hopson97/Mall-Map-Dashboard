"use strict"

const express = require('express');
const bodyParser = require('body-parser');

const util = require('./utility');

let wss;

const router = express.Router();
router.use(bodyParser.json());


//Temp, TODO

const stores = [{
        id: 1,
        name: "Game",
        type: "Entertainment"
    },
    {
        id: 2,
        name: "Greggs",
        type: "Food/Drink"
    },
    {
        id: 3,
        name: "Next",
        type: "Clothes"
    }
];

const adverts = [

]

router.get("/list", getStoreList);
router.get("/store-info", getStoreInformation);
router.get("/advert-list", getAdvertList);
router.get("/get-advert", getAdvert);


router.post("/add-store", postStoreInformation);
router.post("/add-advert", postAdvert);

//========================
//
//   HTTP Post Requests
//
//========================

/**
 * 
 * @param {express.Request} request Contain information about the store name and type
 * @param {express.response} response The HTTP response will return the newly added store
 */
function postStoreInformation(request, response) {
    const storeName = request.body.storeName;
    const storeType = request.body.storeType;

    let storeId = 1;
    if (stores.length > 0) {
        for (const store of stores) {
            //Set this store id number to be largest
            if (store.id >= storeId) {
                storeId = store.id + 1;
            }

            //If the store name exists, then do not allow it to be added
            if (store.name === storeName) {
                response.json({
                    success: false,
                    reason: "store with name already exists"
                });
                return;
            }
        }
    }

    //Add the store and return it to client
    const store = {
        id: storeId,
        name: storeName,
        type: storeType,
        added: util.getFormattedDate()
    };
    stores.push(store);

    response.json({
        success: true,
        store
    });
}


function postAdvert(request, response) {
    const storeId = request.body.storeId;
    const adTitle = request.body.title;
    const adBody = request.body.body;

    let advetId = 1;
    if (stores.length > 0) {
        for (const advert of adverts) {
            //Set this advert id number to be largest
            if (advert.id >= advetId) {
                advetId = advert.id + 1;
            }
        }
    }

    //Add the advert and return it to client
    const advert = {
        id: advetId,
        storeId: storeId,
        title: adTitle,
        body: adBody,
        added: util.getFormattedDate()
    };
    adverts.push(advert);

    response.json({
        success: true,
        advert
    });
}

//========================
//
//   HTTP Get Requests
//
//========================
/**
 * Gets the list of all the added stores and their assosiated information eg type
 * @param {express.response} response The HTTP request. Contains json containing information about every store.
 */
function getStoreList(_, response) {
    response.json(stores);
}

/**
 * Gets the list of all the added stores and their assosiated information eg type
 * @param {express.Request} request The HTTP request. Should contain URL query with the store id to get information about (as ?id=<store id>)
 * @param {express.response} response The HTTP request. Contains json containing information about the chosen store
 */
function getStoreInformation(request, response) {
    const id = request.query.id;
    for (const store of stores) {
        if (store.id == id) {
            response.json(store);
            return;
        }
    }

    //Store not found
    response.sendStatus(404);
}

function getAdvertList(request, response) {
    response.json(adverts);
}

function getAdvert(request, response) {
    const id = request.query.id;
    for (const ad of adverts) {
        if (ad.id == id) {
            response.json({
                success: true,
                advert: ad
            });
            return;
        }
    }
    response.json({
        success: false,
        reason: `Unable to find advert with ID: ${id}`
    });
}

//Exports
module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};