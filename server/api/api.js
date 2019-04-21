"use strict"
const express = require('express');
const mapRouter = require('./map-router');
const shopsRouter = require('./shops-router');
const commercialRouter = require('./commercial-router');

const router = express.Router();

//Set up routes
router.use("/map", mapRouter.router);
router.use("/shops", shopsRouter.router);
router.use("/commercials", commercialRouter.router )

//Gives routes the wss to use
module.exports = {
    router: router,
    setWss: wss => {
        mapRouter.setWss(wss);
        shopsRouter.setWss(wss);
        commercialRouter.setWss(wss);
    }
}