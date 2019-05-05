# Dashboard

[WEBSCPT] Configurable remote display

## The idea

The information is designed to be shown in multiple public spaces in ageneric shopping mall called "Twin Pines Mall". From the display, the public is able to see a map of the mall, and the locations of all of the shops. Ontop of this, they are also able to any running promotions/commercials of the shops, as well as a shop legend.

## The Input

The input is spit across multiple pages:

* Map Input, where the user is able to input information about the map

* Shop input, where the user is able to add and remove shops

* Commercial Input, where the user is able to add and remove commericals about the shops

### Map Editor

This page displays a top-down map of the shopping centre.

You are able to press WASD to pan around, or use the arrow buttons above the map to move. The + and - buttons can be used to zoom in and out of the map respectively.

If you click on a room, you are able to change what shop the room is. (Which will also automatically update the dashboard in real-time).

### Shop Editor

This page displays the list of shops that you are able to add to the shopping centre rooms.

It will display the name, category, and the date the shop was added.

You are also able to add shops using the form at the bottom. You can also delete shops by clicking the respective bin icon. Doing do will also remove any commericals or shops from the shopping centre map which had that as their assosiated shop. This will also update the dashboard in real time.

### Commercial Editor

This page displays the list of commericals that are currently running on the dashboard

It will display the name, category, and the date the shop was added.

You are also able to add shops using the form at the bottom. You can also delete shops by clicking the respective bin icon. Doing do will also remove any commericals or shops from the shopping centre map which had that as their assosiated shop. This will also update the dashboard in real time.

## The Dashboard



## Libraries Used

### Backend

#### Normal Dependancies

##### Express

Used to create the HTTP server.

https://expressjs.com

___

##### express-ws
Used to add websocket functionality ontop of the express server application.

https://www.npmjs.com/package/express-ws

___

#### Dev Dependancies

##### QUnit

Used for unit testing the API

https://qunitjs.com

___

##### node-fetch

Used for interacting with the server API from the unit test files

https://www.npmjs.com/package/node-fetch

___

##### cross-env

Used for cross-platform npm scripts

https://www.npmjs.com/package/cross-env

___


### Frontend

gl-matrix: To assist with the matrix maths operations that are needed to effectively use WebGL

http://glmatrix.net/

___