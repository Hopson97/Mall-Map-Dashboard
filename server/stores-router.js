"use strict"

const express = require('express');
const bodyParser = require('body-parser');

let wss;

const router = express.Router();
router.use(bodyParser.json());

module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};