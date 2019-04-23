"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const util = require('../utility');
const fs = require("fs");

let wss;

const router = express.Router();
router.use(bodyParser.json());

router.get("/list", getCategoryList);
router.get("/get", getCategoryInfo);

function getCategoryList(request, response) {
    const buffer = fs.readFileSync("./server/data/categories.json");
    const categories = JSON.parse(buffer);
    return categories;
}

/**
 * Gets the list of all the added shops and their assosiated information eg type
 * @param {express.Request} request The HTTP request. Should contain URL query with the category id to get information about (as ?id=<category id>)
 * @param {express.response} response The HTTP request. Contains json containing information about the chosen category
 */
function getCategoryInfo(request, response) {
    const buffer = fs.readFileSync("./server/data/categories.json");
    const categories = JSON.parse(buffer);
    const index = categories.findIndex(
        category => category.id == request.query.id
    );
    if (index >= 0) {
        response.json(categories[index]);
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