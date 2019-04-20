"use strict"

const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser');

const adverts = require('../adverts');

let wss;

const router = express.Router();
router.use(bodyParser.json());

//Requests

router.get("/advert-list", getAdvertList);
router.get("/get-advert", getAdvert);
router.post("/add-advert", postAdvert);



//========================
//
//   HTTP Post Requests
//
//========================
/**
 * Adds an advert to the mall
 * @param {express.Request} request Must contain JSON with shopId, title, and body for the advert
 * @param {express.response} response JSON with the newly added advert
 */
function postAdvert(request, response) {
    const shopId = request.body.shopId;
    const adTitle = request.body.title;
    const adBody = request.body.body;

    const advertId = adverts.addAdvert(
        shopId, 
        adTitle, 
        adBody
    );

    const advert = adverts.getAdvert(advertId);
    response.status(201).json(advert);
}

//========================
//
//   HTTP Delete Requests
//
//========================


//========================
//
//   HTTP Get Requests
//
//========================
/**
 * Gets a list of adverts
 * @param {express.Request} request 
 * @param {express.response} response
 */
function getAdvertList(request, response) {
    response.json(adverts.getAllAdverts());
}

/**
 * Gets a single advert using query of `?id=n` where n is the advert Id
 * @param {express.Request} request Must have query of `?id=n` where n is the advert Id
 * @param {express.response} response Contains JSON with the advert information in it. 404 if not found
 */
function getAdvert(request, response) {
    const id = request.query.id;
    const advert = adverts.getAdvert(id)
    if (advert) {
        response.json(advert);
        return;
    }
    response.sendStatus(404);
}


module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};