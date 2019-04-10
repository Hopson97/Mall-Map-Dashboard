"use strict"
const express = require('express');
const mapRouter = require('./map-router');
const storesRouter = require('./stores-router');

const router = express.Router();

//Set up routes
router.use("/map", mapRouter.router);
router.use("/stores", storesRouter.router);

//Gives routes the wss to use
module.exports = {
    router: router,
    setWss: wss => {
        mapRouter.setWss(wss);
        storesRouter.setWss(wss);
    }
}