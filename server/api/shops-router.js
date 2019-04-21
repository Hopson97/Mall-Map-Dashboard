"use strict"

const express = require('express');
const bodyParser = require('body-parser');

const util = require('../utility');
const shops = require("../shops");

let wss;

const router = express.Router();
router.use(bodyParser.json());


router.get("/list", getShopList);
router.get("/info", getShopInformation);

router.post("/add", postShopInformation);

router.delete("/remove", deleteShop);

//========================
//   HTTP Post Requests
//========================

/**
 * Adds a shop to the list of shops, given that a shop with the name does not already exist
 * @param {express.Request} request Contain information about the shop name and type
 * @param {express.response} response The HTTP response will return the newly added shop on success
 */
function postShopInformation(request, response) {
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

//========================
//   HTTP Get Requests
//========================
/**
 * Gets the list of all the added shops and their assosiated information eg type
 * @param {express.response} response The HTTP request. Contains json containing information about every shop.
 */
function getShopList(_, response) {
    response.json(shops.getAllShops());
}

/**
 * Gets the list of all the added shops and their assosiated information eg type
 * @param {express.Request} request The HTTP request. Should contain URL query with the shop id to get information about (as ?id=<shop id>)
 * @param {express.response} response The HTTP request. Contains json containing information about the chosen shop
 */
function getShopInformation(request, response) {
    const shop = shops.getShopInformation(request.query.id);
    if (shop) {
        response.json(shop);
    } else {
        response.sendStatus(404);
    }
}

//========================
//   HTTP Delete Requests
//========================
/**
 * Deletes a shop from the server 
 * @param {express.Request} request Must contain JSON with {id: n} where n is the shop id to delete
 * @param {express.response} response 204 on success, 404 otherwise
 */
function deleteShop(request, response) {
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