"use strict"

const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');

const api = require('./api');

const expressWs = require('express-ws')(express());
const app = expressWs.app;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, `../public`), {
    extensions: "html"
}));
app.use('/api', api);

const socketServer = expressWs.getWss();

app.ws('/', function (ws, req) {
    ws.on('message', (msg) => {
        console.log("Message:" + msg);
    });
    console.log('socket', req.testing);
});


app.listen(8080, e => {
    console.log("The server has started");
});