"use strict"

const express = require('express');
const bodyParser = require('body-parser');

let wss;

const router = express.Router();
router.use(bodyParser.json());


const stores = {
    0: {
        name: "Game",
        type: "Entertainment"
    }
};

router.get("/list", getStoreList);
router.get("/store-info", getStoreInformation);

//========================
//
//   HTTP Post Requests
//
//========================


//========================
//
//   HTTP Get Requests
//
//========================
/**
 * Gets the list of all the added stores and their assosiated information eg type
 * @param {express.Request} request The HTTP request
 * @param {express.response} response The HTTP request. Contains json containing information about every store.
 */
function getStoreList(request, response) {
    response.json(stores);
}

/**
 * Gets the list of all the added stores and their assosiated information eg type
 * @param {express.Request} request The HTTP request. Should contain URL query with the store id to get information about (as ?id=<store id>)
 * @param {express.response} response The HTTP request. Contains json containing information about the chosen store
 */
function getStoreInformation(request, response) {
    const id = request.query.id;
    ///@TODO Handle invalid request
    response.json(stores[id]);
}


//Exports
module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};