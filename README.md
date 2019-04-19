# Dashboard
[WEBSCPT] Configurable remote display

## The idea

The information is designed to be shown in multiple public spaces in ageneric shopping mall called "Twin Pines Mall". From the display, the public is able to see a map of the mall, and the locations of all of the shops. Ontop of this, they are also able to any running promotions of the shops, as well as any annoncements from the mall, such as new shops opening.

## The Input

The input is spit across multiple pages....

## The Dashboard

...

## API

### Map API

`GET api/map/section-data`

Gets information about the rooms in JSON format, with the format:

```json
{
    <roomId>: <storeId>,
    <roomId>: <storeId>,
    <roomId>: <storeId>,
}

eg
{
    0: 5,
    2: 1,
}


## Libraries Used

### Backend

Express: used to create the HTTP server.
https://expressjs.com

ExpressWs: used to add websocket functionality ontop of the express server application.
https://www.npmjs.com/package/express-ws

### Frontend

gl-matrix: To assist with the matrix maths operations that are needed to effectively use WebGL
http://glmatrix.net/