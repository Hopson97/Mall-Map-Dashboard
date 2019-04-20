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

#### GET section data

`GET /api/map/section-data`

Gets information about the rooms in JSON format, with the format:

```
{
    <roomId>: <storeId>,
    <roomId>: <storeId>,
    <roomId>: <storeId>,
}
```
For example, if store ID of 2 was assosiated with the store with an ID of 5:
```
{
    2: 5,
}
```

#### GET map layout

`GET /api/map/layout`

Gets the layout information of the mall as JSON with the format

```
{
    "rooms": [{
            "id": 1,
            "x": 1100,
            "y": 900,
            "width": 200,
            "depth": 200,
            "height": 2,
            "type": "none"
        },
        .....
    ],
    "paths": [{
        "x": 150,
        "y": 450,
        "width": 1650,
        "depth": 250
        },
        .......
    ]
}
```

This data is the x and y (or z in 3D space) coordinates of the rooms, as well as their width and depth. 

"Room" refers to the shops of the malls, hence type, which refers to the type of shop it is (eg Entertainment, clothes etc).

"Path" referes to the space between the shops where people can walk.

#### POST section data

`POST /api/map/section-data`

Updates a room with a new shop for the room to be assosiated with. The POST request body must be JSON with the format:

```
{
    roomId: <n>,
    storeId: <n2>
}
```
Where n is the room ID, and the n2 is the shop ID that the room, n, will now be assosiated with and will display information about on the dashboard.

___

### Store API

#### GET list of shops

`GET /api/stores/list`

Gets a list of all the shops added as JSON in the format

```
[
    {
        id: 1,
        name: <Shop Name>,
        type: <Shop Type>
    },
    {
        id: 2,
        name: <Shop Name>,
        type: <Shop Type>
    },
    ...
]
```

#### GET information about one shop

`GET /api/stores/store-info?id=<shop id>`

Gets information about a single store in JSON format using the shop ID as a URL query.

For example, if you were to `GET /api/stores/store-info?id=7`, you would get in response:

```
{
    id: 7,
    name: <Shop Name>,
    type: <Shop Type>
}
```

#### POST Add a new shops

`POST /api/stores/add-store`

## Libraries Used

### Backend

#### Normal Dependancies

##### Express

Used to create the HTTP server.

https://expressjs.com

##### express-ws
Used to add websocket functionality ontop of the express server application.

https://www.npmjs.com/package/express-ws

#### Dev Dependancies

##### QUnit

Used for unit testing the API

https://qunitjs.com

##### node-fetch

Used for interacting with the server API from the unit test files

https://www.npmjs.com/package/node-fetch

##### cross-env

Used for cross-platform npm scripts

https://www.npmjs.com/package/cross-env


### Frontend

gl-matrix: To assist with the matrix maths operations that are needed to effectively use WebGL

http://glmatrix.net/