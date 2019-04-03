const express = require('express')
        const app = express();

        app.use(bodyParser.json());
        app.use(express.static(path.join(__dirname, `../public`), {
            extensions: "html"
        }));