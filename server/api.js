"use strict"
const express = require('express');
const mapRouter = require('./map-router');

const router = express.Router();


router.use("/map", mapRouter);





module.exports = router;