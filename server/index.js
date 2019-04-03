const express = require('express')
const path = require('path');
const bodyParser = require('body-parser');


const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, `../public`), {
    extensions: "html"
}));

app.listen(8080, e => {
    console.log("The server has started");
});