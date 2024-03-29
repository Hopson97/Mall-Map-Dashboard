"use strict"

const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser');

const commercials = require('../commercials');

let wss;

const router = express.Router();
router.use(bodyParser.json());

//Requests
router.get("/list", getCommercialList);
router.get("/get", getCommercial);
router.post("/add", postCommercial);
router.delete("/remove", deleteCommercial);

// Post Requests
/**
 * Adds an commercial to the mall
 * @param {express.Request} request Must contain JSON with shopId, title, and body for the commercial
 * @param {express.response} response JSON with the newly added commercial
 */
function postCommercial(request, response) {
    const shopId = request.body.shopId;
    const adTitle = request.body.title;
    const adBody = request.body.body;

    const commercialId = commercials.addCommercial(
        shopId,
        adTitle,
        adBody
    );
    for (const client of wss.clients) {
        client.send(JSON.stringify({
            type: "CommercialUpdate"
        }));
    }

    const commercial = commercials.getCommercial(commercialId);
    response.status(201).json(commercial);
}


// Delete Requests
/**
 * Deletes a commercial using commericial id as a param
 * @param {express.Request} request 
 * @param {express.response} response
 */
function deleteCommercial(request, response) {
    if (commercials.tryDeleteCommercial(request.body.id)) {
        response.sendStatus(204);
        for (const client of wss.clients) {
            client.send(JSON.stringify({
                type: "CommercialUpdate"
            }));
        }
    } 
    else {
        response.sendStatus(404);
    }
}


// Get Requests

/**
 * Gets a list of commercials
 * @param {express.Request} request 
 * @param {express.response} response
 */
function getCommercialList(request, response) {
    response.json(commercials.getAllCommercials());
}

/**
 * Gets a single commercial using query of `?id=n` where n is the commercial Id
 * @param {express.Request} request Must have query of `?id=n` where n is the commercial Id
 * @param {express.response} response Contains JSON with the commercial information in it. 404 if not found
 */
function getCommercial(request, response) {
    const id = request.query.id;
    const commercial = commercials.getCommercial(id)
    if (commercial) {
        response.json(commercial);
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