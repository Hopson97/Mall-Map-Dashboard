"use strict"
const express = require('express');
const mapRouter = require('./map-router');

const router = express.Router();

//Set up routes
router.use("/map", mapRouter.router);

//Gives routes the wss to use
module.exports = {
    router: router,
    setWss: wss => {
        mapRouter.setWss(wss);
    }
}