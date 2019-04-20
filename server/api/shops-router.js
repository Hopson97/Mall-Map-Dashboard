"use strict"

const express = require('express');
const bodyParser = require('body-parser');

const util = require('../utility');
const shops = require("../shops");

let wss;

const router = express.Router();
router.use(bodyParser.json());


//Temp, TODO//

const adverts = [

]

router.get("/list", getshopList);
router.get("/shop-info", getshopInformation);
router.get("/advert-list", getAdvertList);
router.get("/get-advert", getAdvert);


router.post("/add-shop", postshopInformation);
router.post("/add-advert", postAdvert);

router.delete("/shop", deleteshop);

//========================
//   HTTP Post Requests
//========================

/**
 * Adds a shop to the list of shops, given that a shop with the name does not already exist
 * @param {express.Request} request Contain information about the shop name and type
 * @param {express.response} response The HTTP response will return the newly added shop on success
 */
function postshopInformation(request, response) {
    const shopName = request.body.shopName;
    const shopType = request.body.shopType;

    const shopId = shops.addShop(shopName, shopType);
    if (shopId === -1) {
        response.sendStatus(409);
    } else {
        const shop = shops.getShopInformation(shopId);
        response.status(201).json(shop);
    }
}

/**
 * Adds an advert to the mall
 * @param {express.Request} request Must contain JSON with shopId, title, and body for the advert
 * @param {express.response} response JSON with the newly added advert
 */
function postAdvert(request, response) {
    const shopId = request.body.shopId;
    const adTitle = request.body.title;
    const adBody = request.body.body;

    //TODO spelling
    let advetId = 1;
    if (shops.length > 0) {
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
        shopId: shopId,
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
 * Gets the list of all the added shops and their assosiated information eg type
 * @param {express.response} response The HTTP request. Contains json containing information about every shop.
 */
function getshopList(_, response) {
    response.json(shops.getAllShops());
}

/**
 * Gets the list of all the added shops and their assosiated information eg type
 * @param {express.Request} request The HTTP request. Should contain URL query with the shop id to get information about (as ?id=<shop id>)
 * @param {express.response} response The HTTP request. Contains json containing information about the chosen shop
 */
function getshopInformation(request, response) {
    const shop = shops.getShopInformation(request.query.id);
    if (shop) {
        response.json(shop);
    } else {
        response.sendStatus(404);
    }
}

/**
 * Gets a list of adverts
 * @param {express.Request} request 
 * @param {express.response} response
 */
function getAdvertList(request, response) {
    response.json(adverts);
}

/**
 * Gets a single advert using query of `?id=n` where n is the advert Id
 * @param {express.Request} request Must have query of `?id=n` where n is the advert Id
 * @param {express.response} response Contains JSON with the advert information in it
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
 * Deletes a shop from the server 
 * @param {express.Request} request Must contain JSON with {id: n} where n is the shop id to delete
 * @param {express.response} response 204 on success, 404 otherwise
 */
function deleteshop(request, response) {
    const shopId = request.body.id;
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