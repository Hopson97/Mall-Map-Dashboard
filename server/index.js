const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');


const expressWs = require('express-ws')(express());
const app = expressWs.app;

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static(path.join(__dirname, `../public`), {
    extensions: "html"
}));

//Data
const dashboardData = {
    text: "none"
}

const socketServer = expressWs.getWss();

/**
 * Post the text
 */
app.post("/text", (request, response) => {
    dashboardData.text = request.body;
    for (const c of socketServer.clients) {
        c.send(JSON.stringify({
            type: "update",
            text: dashboardData.text
        }));
    }
});


app.ws('/', function (ws, req) {
    ws.on('message', (msg) => {
        console.log("Message:" + msg);
    });
    console.log('socket', req.testing);
});


/**
 * Get the text
 */
app.get("/text", (request, response) => {
    response.send(dashboardData.text);
})



app.listen(8080, e => {
    console.log("The server has started");
});