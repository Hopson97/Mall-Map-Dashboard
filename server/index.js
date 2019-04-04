const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.static(path.join(__dirname, `../public`), {
    extensions: "html"
}));

//Data
const dashboardData = {
    text: "none"
}

/**
 * Post the text
 */
app.post("/text", (request, response) => {
    dashboardData.text = request.body;
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