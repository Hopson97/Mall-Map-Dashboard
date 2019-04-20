"use strict"
const express = require('express');
const mapRouter = require('./map-router');
const shopsRouter = require('./shops-router');
const advertRouter = require('./advert-router');

const router = express.Router();

//Set up routes
router.use("/map", mapRouter.router);
router.use("/shops", shopsRouter.router);
router.use("/adverts", advertRouter.router )

//Gives routes the wss to use
module.exports = {
    router: router,
    setWss: wss => {
        mapRouter.setWss(wss);
        shopsRouter.setWss(wss);
        advertRouter.setWss(wss);
    }
}