"use strict"

const express = require('express');
const bodyParser = require('body-parser');

const util = require('./utility');
const shops = require("./shops");

let wss;

const router = express.Router();
router.use(bodyParser.json());


//Temp, TODO//

const adverts = [

]

router.get("/list", getStoreList);
router.get("/store-info", getStoreInformation);
router.get("/advert-list", getAdvertList);
router.get("/get-advert", getAdvert);


router.post("/add-store", postStoreInformation);
router.post("/add-advert", postAdvert);

router.delete("/store", deleteStore);

//========================
//   HTTP Post Requests
//========================

/**
 * Adds a store to the list of stores, given that a store with the name does not already exist
 * @param {express.Request} request Contain information about the store name and type
 * @param {express.response} response The HTTP response will return the newly added store on success
 */
function postStoreInformation(request, response) {
    const storeName = request.body.storeName;
    const storeType = request.body.storeType;

    const shopId = shops.addShop(storeName, storeType);
    if (shopId === -1) {
        response.sendStatus(409);
    } else {
        const shop = shops.getShopInformation(shopId);
        response.status(201).json(shop);
    }
}
//TODO COMMENTS/ DOCS OR WHATEVER THEY ARE CALLED!!!
/**
 * 
 * @param {express.Request} request 
 * @param {express.response} response 
 */
function postAdvert(request, response) {
    const storeId = request.body.storeId;
    const adTitle = request.body.title;
    const adBody = request.body.body;

    //TODO spelling
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

    response.status(201).json(advert);
}

//========================
//   HTTP Get Requests
//========================
/**
 * Gets the list of all the added stores and their assosiated information eg type
 * @param {express.response} response The HTTP request. Contains json containing information about every store.
 */
function getStoreList(_, response) {
    response.json(shops.getAllShops());
}

/**
 * Gets the list of all the added stores and their assosiated information eg type
 * @param {express.Request} request The HTTP request. Should contain URL query with the store id to get information about (as ?id=<store id>)
 * @param {express.response} response The HTTP request. Contains json containing information about the chosen store
 */
function getStoreInformation(request, response) {
    const shop = shops.getShopInformation(request.query.id);
    if (shop) {
        response.json(shop);
    } else {
        response.sendStatus(404);
    }
}

/**
 * 
 * @param {express.Request} request 
 * @param {express.response} response
 */
function getAdvertList(request, response) {
    response.json(adverts);
}

/**
 * 
 * @param {express.Request} request 
 * @param {express.response} response 
 */
function getAdvert(request, response) {
    const id = request.query.id;
    for (const advert of adverts) {
        if (advert.id == id) {
            response.json(advert);
            return;
        }
    }
    response.sendStatus(404);
}

//========================
//   HTTP Delete Requests
//========================
/**
 * 
 * @param {*} request 
 * @param {*} response 
 */
function deleteStore(request, response) {
    const shopId = request.body.id;
    console.log("Deleting shop with id " + shopId);
    if (shops.tryDeleteShop(request.body.id)) {
        response.sendStatus(204);
        for (const client of wss.clients) {
            client.send(JSON.stringify({
                type: "ShopDelete",
                shopId,
            }));
        }
    } else {
        response.sendStatus(404);
    }
}

//Exports
module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};