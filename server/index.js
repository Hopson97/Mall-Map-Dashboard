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

const clients = [];

/**
 * Post the text
 */
app.post("/text", (request, response) => {
    dashboardData.text = request.body;
    for (const c of clients) {
        c.send(JSON.stringify({
            type: "update",
            text: dashboardData.text
        }))
    }
});


app.ws('/', function (ws, req) {
    ws.on('message', function (msg) {
        console.log("Message:" + msg);
    });
    console.log('socket', req.testing);
    clients.push(ws);
    console.log(clients.length);
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