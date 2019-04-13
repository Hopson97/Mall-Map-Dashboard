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

router.get("/list", (req, res) => {
    res.json(stores);
});

router.get("/store-info", getStoreInformation);

function getStoreInformation(request, response) {
    const id = request.query.id;
    console.log("Getting store information...");
    console.log(id);
    console.log(stores);
    console.log(stores[id]);

    response.json(stores[id]);
}

module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};