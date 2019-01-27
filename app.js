"use strict";

const express = require("express");
const path    = require("path");

const PORT = 8080;

const app = express();

//app.use .....


app.use(express.static(path.join(__dirname, `/public`)));

app.listen(PORT, () => {
    console.log(`Server started at ` + new Date());
});

