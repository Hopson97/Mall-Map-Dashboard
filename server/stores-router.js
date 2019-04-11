"use strict"

const express = require('express');
const bodyParser = require('body-parser');

let wss;

const router = express.Router();
router.use(bodyParser.json());


const stores = [
    {name: "Game", type: "Entertainment"}
];

router.get("/list", (req, res) => {
    res.json(stores);
});

module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};