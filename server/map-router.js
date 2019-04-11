"use strict"

const express = require('express');
const bodyParser = require('body-parser');

let wss;

const router = express.Router();
router.use(bodyParser.json());

const rooms = {
    
};

router.post("/sect-data", (request, response) => {
    const name = request.body.name;
    const type = request.body.type;
    const id   = request.body.id;

    rooms[id] = {
        name, type
    }
    console.log(rooms);
    response.send(true);
});

router.get("/sect-data", (request, response) => {
    response.json(rooms);
});

module.exports = {
    router: router,
    setWss: _wss => {
        wss = _wss;
    }
};