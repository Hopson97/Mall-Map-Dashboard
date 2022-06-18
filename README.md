# Dashboard

[WEBSCPT] Configurable remote display, 76% achieved.

Demo: https://i.imgur.com/L3iP4WO.gifv

## The idea

The information is designed to be shown in multiple public spaces in a shopping center called "Twin Pines Mall". From the display, the public is able to see a map of the shopping center, and the locations of all of the shops. On top of this, they are also able to view any running promotions/commercials of the shops, as well as a shop legend.

## The Input

The input is spit across multiple pages:

* Map Input, where the user is able to input information about the map

* Shop input, where the user is able to add and remove shops

* Commercial Input, where the user is able to add and remove commercials about the shops

### Map Editor

This page displays a top-down map of the shopping centre.

You are able to press WASD to pan around, or use the arrow buttons above the map to move. The + and - buttons can be used to zoom in and out of the map respectively.

If you click on a room, you are able to change what shop the room is. (Which will also automatically update the dashboard in real-time).

### Shop Editor

This page displays the list of shops that you are able to add to the shopping centre rooms.

It will display the name, category, and the date the shop was added.

You are also able to add shops using the form at the bottom. You can also delete shops by clicking the respective bin icon. Doing do will also remove any commercials or shops from the shopping centre map which had that as their associated shop. This will also update the dashboard in real time.

### Commercial Editor

This page displays the list of commercials that are currently running on the dashboard

It will display the name, category, and the date the shop was added.

You are also able to add shops using the form at the bottom. You can also delete shops by clicking the respective bin icon. Doing do will also remove any commercials or shops from the shopping centre map which had that as their associated shop. This will also update the dashboard in real time.

## The Dashboard

The dashboard displays 3 separate pieces of information, on 3 panels. 

The main panel is the 3D render of the shopping center, which continuously rotates, allowing for a full 360 view of the shopping center. This also displays billboards, which says the name of each shop, as well as the category of the shop (Eg food, toys, etc).

The left panel is a basic information panel. This displays two pieces of information:

1. The time and the date, which is updated regularly to be accurate as possible

2. A legend, mapping the category names to their colours.

The bottom and final panel displays commercials. When there are more than 4 commercials, this panel will infinitely scroll, as to show the user every advert currently being ran through the shopping center.

These panels use the JSON files in the `/server/data/` directory. I have also provided sample data, which can be found in the `sample-data` directory at the project root, which can be used to replace some of the server data. 

## Libraries Used

### Backend

#### Normal Dependencies

##### Express

Used to create the HTTP server.

https://expressjs.com

___

##### express-ws
Used to add websocket functionality on top of the express server application.

https://www.npmjs.com/package/express-ws

___

#### Dev Dependencies

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

