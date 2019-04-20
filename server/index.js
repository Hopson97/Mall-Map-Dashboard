"use strict"

const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');

const api = require('./api/api');

//Start the server using Express with websocket
const expressWs = require('express-ws')(express());
const app = expressWs.app;

//Set up middleware and routers
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, `../public`), {
    extensions: "html"
}));
app.use('/api', api.router);

//Set up the web socket sever across all routers
const wss = expressWs.getWss();
api.setWss(wss);

//For handling incoming websocket messages
app.ws('/', function (ws, req) {
    ws.on('message', (msg) => {
        console.log("Message:" + msg);
    });
    console.log('socket', req.testing);
});

//Start server
app.listen(8080, e => {
    console.log("The server has started");
});