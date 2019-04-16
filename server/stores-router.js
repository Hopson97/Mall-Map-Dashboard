"use strict"

const express = require('express');
const bodyParser = require('body-parser');

const util = require('./utility');

let wss;

const router = express.Router();
router.use(bodyParser.json());


//Temp, TODO

const stores = [
    {
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

router.get("/list", getStoreList);
router.get("/store-info", getStoreInformation);

router.post("/add-store", postStoreInformation);

//========================
//
//   HTTP Post Requests
//
//========================

/**
 * 
 * @param {*} request Contain information about the store name and type
 * @param {*} response The HTTP response will return the newly added store
 */
function postStoreInformation(request, response) {
    const storeName = request.body.storeName;
    const storeType = request.body.stroeType;

    let storeId = 1;
    //Cannot have duplicate store names
    if (stores.length > 0) {
        for (const store of stores) {
            //Set this store id number to be largest
            if (store.id >= storeId) {
                storeId = store.id + 1;
            }

            //If the store name exists, then it is a failure
            if (store.name === storeName) {
                response.json({
                    success: false,
                    reason: "store with name already exists"
                });
                return;
            }
        }
    }

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
        console.log(store);
        if (store.id == id) {
            response.json(store);
            return;
        }
    }

    //Store not found
    response.sendStatus(404);
}


//Exports
module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};