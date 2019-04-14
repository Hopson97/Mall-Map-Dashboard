"use strict";

/**
 * Dashboard.js
 * JS file for the display board
 */

/**
 * Renderer to assist with rendering 3D and 2D objects to browser window
 */
class Renderer {
    /**
     * Initilises WebGL and the 2D context
     */
    constructor() {
        //Get canvas objects
        const canvas3D = document.getElementById("map-canvas");
        const canvas2D = document.getElementById("text-canvas");

        //Get rendering contexts
        this.gl = canvas3D.getContext("webgl2");
        this.context = canvas2D.getContext("2d");

        //Set canvas size
        canvas3D.width = window.innerWidth * 0.8;
        canvas3D.height = window.innerHeight * 0.8;
        canvas2D.width = canvas3D.width;
        canvas2D.height = canvas3D.height;

        //Initilise WebGL
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.viewport(0, 0, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        this.gl.depthMask(true);

        //Initilise the context
        this.context.fillStyle = "white";
        this.context.font = `bold 9.5 sans-serif`;
    }

    /**
     * Clears the canvas windows
     */
    clear() {
        this.gl.clear(
            this.gl.COLOR_BUFFER_BIT |
            this.gl.DEPTH_BUFFER_BIT);
        this.context.clearRect(
            0, 0,
            this.context.canvas.width, this.context.canvas.height);
    }
}

/**
 * Represents an object in the world
 */
class Entity {
    //Private fields

    /**
     * Construct the entity
     * @param {Vector3} position The position of the entity
     * @param {Vector3} rotation The roation of the entity
     */
    constructor(position, rotation) {
        this.position = position;
        this.rotation = rotation;
    }

    /**
     * Moves the entity's position by an offset
     * @param {Vector3} offset The amount to move the entity
     */
    move(offset) {
        this.position.add(offset);
    }

    /**
     * Rotates the entity by an offset
     * @param {Vector3} rotation The amount to rotate the entity
     */
    rotate(rotation) {
        this.rotation.add(rotation);
    }
}

/**
 * Represents a camera in the world, where the world should be rendered from
 */
class Camera extends Entity {
    /**
     * Construct the camera and the matrices
     * @param {Vector3} position The position of the entity
     * @param {Vector3} rotation The roation of the entity
     */
    constructor(gl, position, rotation) {
        super(position, rotation);
        this.projectionMatrix = createProjectionMatrix(90, gl);
        this.viewMatrix = mat4.create();
        this.projectionViewmatrix = mat4.create();
        this.update(new Vector3(), new Vector3());
    }

    /**
     * Moves the entity's position by an offset
     * @param {Vector3} offset The amount to move the entity
     * @param {Vector3} rotation The amount to rotate the entity
     */
    update(offset, rotation) {
        //Move and rotate camera
        super.move(offset);
        super.rotate(rotation);

        //Reset matrices
        this.viewMatrix = createViewMatrix(this.rotation, this.position);
        mat4.multiply(
            this.projectionViewmatrix,
            this.projectionMatrix,
            this.viewMatrix);
    }
}

class Room {

}

class Path {

}

class Billboard {

}

/**
 * Entry point for the dashboard
 * 
 */
window.addEventListener("load", async e => {
    //Setup the websocket
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", handleMessage);
    //TEMP
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    //TEMP

    const renderer = new Renderer();
    const camera = new Camera(renderer.gl, new Vector3(65, 25, 140), new Vector3(50, 0, 0))

    //TODO do I really need this?
    const modelMatrix = createModelMatrix(new Vector3(0, 0, 0), new Vector3(0, -1, 0));

    //Create shader for rendering the map
    const mapShader = new Shader(renderer.gl, shaders.mapVertex, shaders.mapFragment);
    mapShader.use(renderer.gl);
    mapShader.loadUniformMatrix4(renderer.gl, "modelMatrix", modelMatrix);

    //Get lists of objects to render
    const objects = await createMapMesh(renderer.gl);

    //Begin main rendering of stuff
    window.requestAnimationFrame(loop);
    function loop() {
        inputStuff(camera); //VERY VERY TEMP TODO
        renderer.clear();

        //Orbit the camera around the map of the mall
        const speed = 0.125;
        camera.update(
            new Vector3(
                Math.cos(toRadians(camera.rotation.y)) * speed,
                0,
                Math.sin(toRadians(camera.rotation.y)) * speed),
            new Vector3(0, -0.1, 0)
        );

        //Load uniform variables to shader
        mapShader.loadUniformVector3(renderer.gl, "lightPosition", camera.position);
        mapShader.loadUniformMatrix4(renderer.gl, "projViewMatrix", camera.projectionViewmatrix);

        render(renderer.gl, renderer.context, objects, camera.projectionViewmatrix);

        window.requestAnimationFrame(loop);
    }
});

/**
 * Renders the map
 * @param {WebGLRenderContext} gl The WebGL rendering context
 * @param {Context} ctx The context for rendering 2D
 * @param {Object} objects Object containing objects to draw    
 * @param {mat4} projectionViewMatrix Projection view matrix
 */
function render(gl, ctx, objects, projectionViewMatrix) {
    //List to hold any billboards above rooms. This must be a defered render as they 
    //must be sorted by their z-distance to the camera
    const billboardRenderInfo = [];
    //Render rooms
    for (const room of objects.rooms) {

        gl.bindVertexArray(room.vao);
        gl.drawElements(gl.TRIANGLES, room.indices, gl.UNSIGNED_SHORT, 0);

        if (room.billboard) {
            const modelMatrix = createModelMatrix(
                new Vector3(0, 0, 0),
                new Vector3(room.center.x, 3, room.center.z)
            );

            //For rendering the text, use the matrices to calculate the screen coordinates to
            //render it to
            const pos = mat4.create();
            mat4.mul(pos, projectionViewMatrix, modelMatrix);

            //Transform world coordinates into screen coordinates
            const offsetX = 25;
            const offsetY = 10;
            const x = ((pos[12] / pos[15]) * 0.5 + 0.5) * gl.canvas.width - offsetX;
            const y = ((pos[13] / pos[15]) * -0.5 + 0.5) * gl.canvas.height - offsetY;
            const z = pos[14];

            //Don't bother rendering the billboards that are very far away
            if (z > 60) {
                continue;
            }

            //Add the billboard to the list
            billboardRenderInfo.push({
                x,
                y,
                z,
                data: room.billboard
            });
        }
    }

    //Render paths
    for (const path of objects.paths) {
        gl.bindVertexArray(path.VAO);
        gl.drawElements(gl.TRIANGLES, path.indices, gl.UNSIGNED_SHORT, 0);
    }

    //Sort the billboards by the Z-coordinates
    billboardRenderInfo.sort((a, b) => {
        return b.z - a.z;
    });

    //Render the boards
    for (const board of billboardRenderInfo) {
        drawBillboard(ctx, board);
    }
}

/**
 * Renders a billboard
 * @param {RenderContext2D} ctx The 2D rendering context to render board to
 * @param {Object} board The board to render
 */
function drawBillboard(ctx, board) {
    //TODO Use billboard store stats to fit the billboard size accordingly
    //Draw billboard thing
    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(board.x + 25, board.y + 25);
    ctx.lineTo(board.x + 10, board.y + 10);
    ctx.lineTo(board.x - 10, board.y + 5);
    ctx.lineTo(board.x - 10, board.y - 35);
    ctx.lineTo(board.x + 70, board.y - 35);
    ctx.lineTo(board.x + 70, board.y + 5);
    ctx.lineTo(board.x + 35, board.y + 10);
    ctx.lineTo(board.x + 25, board.y + 25);
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(`Room ${board.data.roomid}`, board.x, board.y - 24);
    ctx.fillText(`Store: ${board.data.storeName}`, board.x, board.y - 12);
    ctx.fillText(`${board.data.storeType}`, board.x, board.y);
}

/**
 * Handles incoming messages from web socket
 * @param {Event} event The event to handle
 */
function handleMessage(event) {
    const data = JSON.parse(event.data);
    console.log(data);
    switch (data.type) {

    }
}

async function createMapMesh(gl) {
    const geometry = getMallLayout();
    const response = await fetch("/api/map/sect-data");
    const roomsData = await response.json();

    const scaleFactor = 15;
    const gapSize = 0.1;
    const objects = {
        rooms: await buildRoomsGeometry(gl, scaleFactor, gapSize, geometry.rooms, roomsData),
        paths: buildPathGeometry(gl, scaleFactor, gapSize, geometry.paths),
    };


    return objects;
}

//GEOMETRY FUNCTIONS
/**
 * Creates vertex positions and vertex normals for a quad in the Y-plane
 * @param {Number} x The x-coordinate to begin the floor
 * @param {Number} y The y-coordinate of the floor
 * @param {Number} z The z-coordinate to begin the floor
 * @param {Number} width The width of the wall
 * @param {Number} depth The height(depth) of the wall
 */
function createFloorQuadGeometry(x, y, z, width, depth) {
    return {
        positions: [
            x, y, z,
            x + width, y, z,
            x + width, y, z + depth,
            x, y, z + depth
        ],
        normals: [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]
    }
}

/**
 * Creates the vertex positions and normals for a wall in the Z-Plane
 * @param {Number} x X-Coordinate to start wall at
 * @param {Number} y Y-Coordinate to start wall at
 * @param {Number} z Z-Coordinate to start wall at
 * @param {Number} width The width of the walls
 * @param {Number} height The height of the wall
 * @param {Number} zOffset How far along the Z-Axis to offset the wall
 * @param {Number} normalDirection The direction that the face normal is
 */
function createWallZPlane(x, y, z, width, height, zOffset, normalDirection) {
    return {
        positions: [
            x, y, z + zOffset,
            x + width, y, z + zOffset,
            x + width, y + height, z + zOffset,
            x, y + height, z + zOffset
        ],
        normals: [
            0, 0, normalDirection,
            0, 0, normalDirection,
            0, 0, normalDirection,
            0, 0, normalDirection
        ]
    };
}
/**
 * Creates the vertex positions and normals for a wall in the X-Plane
 * @param {Number} x X-Coordinate to start wall at
 * @param {Number} y Y-Coordinate to start wall at
 * @param {Number} z Z-Coordinate to start wall at
 * @param {Number} width The width of the walls
 * @param {Number} height The height of the wall
 * @param {Number} xOffset How far along the X-Axis to offset the wall
 * @param {Number} normalDirection The direction that the face normal is
 */
function createWallXPlane(x, y, z, width, height, xOffset, normalDirection) {
    return {
        positions: [
            x + xOffset, y, z,
            x + xOffset, y, z + width,
            x + xOffset, y + height, z + width,
            x + xOffset, y + height, z
        ],
        normals: [
            normalDirection, 0, 0,
            normalDirection, 0, 0,
            normalDirection, 0, 0,
            normalDirection, 0, 0
        ]
    };
}

/**
 * Fills the mesh data with the same basic data for every vertex based on the number of vertices already added
 * @param {Mesh} mesh The mesh to add the data to
 * @param {Colour} colour The colour set the colour data
 */
function createColourIndicesData(mesh, colour) {
    for (let i = 0; i < mesh.positions.length / 12; i++) {
        for (let v = 0; v < 4; v++) {
            mesh.colours.push(colour.r, colour.g, colour.b);
        }
        mesh.indices.push(
            i * 4, i * 4 + 1, i * 4 + 2,
            i * 4 + 2, i * 4 + 3, i * 4
        );
    }
}

/**
 * Creates WebGL geometric data (inc VAOs and VBOs) based on 2D layout of the map for the paths
 * @param {WebGLRenderContext} gl The WebGL Context
 * @param {Number} scaleFactor Scale factor for how much to make the geometry smaller down from the actual geometric data
 * @param {Number} gapSize The "opengl units" between each room (gap)
 * @param {Object} pathData Object containing 2D data about each of the paths
 */
function buildPathGeometry(gl, scaleFactor, gapSize, pathData) {
    const paths = [];
    const halfGap = gapSize / 2;
    for (const path of pathData) {
        const mesh = new Mesh();

        //Scale the data down
        const x = path.x / scaleFactor + halfGap;;
        const z = path.y / scaleFactor + halfGap;
        const width = path.width / scaleFactor;
        const height = path.height / scaleFactor;

        const geometry = createFloorQuadGeometry(x, 0, z, width, height);
        mesh.positions.push(...geometry.positions);
        mesh.normals.push(...geometry.normals);

        createColourIndicesData(mesh, new Colour(1, 1, 1));
        const buffers = mesh.createBuffers(gl);

        paths.push({
            VAO: buffers.vao,
            buffers: buffers.buffers,
            indices: mesh.indices.length,
        });
    }
    return paths;
}

/**
 * 
 * @param {WebGLRenderContext} gl The WebGL Context
 * @param {Number} scaleFactor Scale factor for how much to make the geometry smaller down from the actual geometric data
 * @param {Number} gapSize The "opengl units" between each room (gap)
 * @param {Object} roomGeometry Object containing 2D data about each of the rooms
 * @param {Object} roomsData Object containing information about the room ID and their assosiated store IDs
 */
async function buildRoomsGeometry(gl, scaleFactor, gapSize, roomGeometry, roomsData) {
    const rooms = [];
    for (const room of roomGeometry) {
        //Scale the data down
        const x = room.x / scaleFactor + gapSize;
        const z = room.y / scaleFactor + gapSize;
        const roomWidth = room.width / scaleFactor - gapSize;
        const roomDepth = room.height / scaleFactor - gapSize;

        rooms.push(await createRoomGeometry(gl, room, roomsData, x, z, roomWidth, roomDepth, gapSize));
    }
    return rooms;
}

/**
 * 
 * @param {WebGLRenderContext} gl The WebGL render context
 * @param {Object} roomInfo Object to contain info about the room having geometry made for
 * @param {Object} roomsData Object containing info about all rooms
 * @param {Number} x X position of the room
 * @param {Number} z Z position of the room
 * @param {Number} width Width of the room
 * @param {Number} depth Depth of the room
 * @param {Number} gapSize WebGL units between each room
 */
async function createRoomGeometry(gl, roomInfo, roomsData, x, z, width, depth, gapSize) {
    const roomHeight = 3;
    const halfGap = gapSize / 2;

    const mesh = new Mesh();


    //Adds normal and vertex data to the mesh
    function addMeshData(geometry) {
        mesh.positions.push(...geometry.positions);
        mesh.normals.push(...geometry.normals);
    }

    //Contains information about this room, also is return of this function
    const roomObject = {
        mesh: mesh,
        roomid: roomInfo.id,
        center: {
            x: x + width / 2,
            z: z + depth / 2
        }
    }

    //Create ceiling geometry
    addMeshData(createFloorQuadGeometry(x, roomHeight, z, width, depth));

    //Create inner-wall geometry
    addMeshData(createWallZPlane(x, 0, z, width, roomHeight, -halfGap, -1));
    addMeshData(createWallZPlane(x, 0, z, width, roomHeight, depth + halfGap, 1));
    addMeshData(createWallXPlane(x, 0, z, depth, roomHeight, -halfGap, -1));
    addMeshData(createWallXPlane(x, 0, z, depth, roomHeight, width + halfGap, 1));

    //Calculate the outline wall geometry
    addMeshData(createWallZPlane(x - halfGap, 0, z, halfGap, roomHeight, depth + halfGap, 1));
    addMeshData(createWallZPlane(x + width, 0, z, halfGap, roomHeight, depth + halfGap, 1));
    addMeshData(createWallZPlane(x + width, 0, z, halfGap, roomHeight, -halfGap, -1));
    addMeshData(createWallZPlane(x - halfGap, 0, z, halfGap, roomHeight, -halfGap, -1));
    addMeshData(createWallXPlane(x, 0, z - halfGap, halfGap, roomHeight, -halfGap, 1));
    addMeshData(createWallXPlane(x, 0, z + depth, halfGap, roomHeight, -halfGap, 1));
    addMeshData(createWallXPlane(x, 0, z - halfGap, halfGap, roomHeight, width + halfGap, -1));
    addMeshData(createWallXPlane(x, 0, z + depth, halfGap, roomHeight, width + halfGap, -1));

    //Calculate outline of ceiling geometry
    addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z - halfGap, width + gapSize, halfGap));
    addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z + depth, width + gapSize, halfGap));
    addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z - halfGap, halfGap, depth + gapSize));
    addMeshData(createFloorQuadGeometry(x + width, roomHeight, z - halfGap, halfGap, depth + gapSize));

    createColourIndicesData(mesh, new Colour(0.8, 0.8, 0.8));

    let colour;
    //Do extra things if the room has an assosiated store
    if (roomsData[roomInfo.id]) {
        roomObject.storeid = roomsData[roomInfo.id];

        const response = await fetch("api/stores/store-info?id=" + roomObject.storeid);
        const info = await response.json();

        roomObject.billboard = makeRoomBillboard(gl, roomObject, info);
        colour = typeToColour(info.type).asNormalised().asArray();
    } else {
        colour = typeToColour("none").asNormalised().asArray();
    }

    //Update the room's colour
    updateRoom(roomObject, colour, true, gl);

    return roomObject;
}

/**
 * Updates room based on the store it has either already had or been updated to
 * @param {Object} room Object containing info about room to update
 * @param {Colour} colour Colour to change its colour to
 * @param {boolean} buffer whether the function should update the buffer as well
 * @param {WebGLContext} gl The webgl render context
 */
function updateRoom(room, colour, shouldBuffer, gl) {
    const mesh = room.mesh;
    //Change colour of the inner-quad and walls to be the store colour
    //20 refers to 4 * 5 (5 faces * 4 verticies per face)
    for (let i = 0; i < 20; i++) {
        //Cycle RGB
        for (let j = 0; j < 3; j++) {
            mesh.colours[i * 3 + j] = colour[j];
        }
    }

    if (shouldBuffer) {
        const buffers = mesh.createBuffers(gl);
        room.vao = buffers.vao;
        room.buffers = buffers.buffers;
        room.indices = mesh.indices.length;
    }
}

function makeRoomBillboard(gl, roomObject, storeInfo) {
    const billboard = {};

    billboard.height = 3;
    billboard.roomid = roomObject.roomid;
    billboard.storeName = storeInfo.name;
    billboard.storeType = storeInfo.type;

    return billboard;
}

//Shader programs
const shaders = {
    //Verex and fragment shader for the map
    mapVertex: `#version 300 es
    in vec3 inVertexPosition;
    in vec3 inColour;
    in vec3 inNormal;
    
    out vec3 passColour;
    out vec3 passNormal;
    out vec3 passFragmentPosition;

    uniform mat4 modelMatrix;
    uniform mat4 projViewMatrix;

    void main() {
        gl_Position = projViewMatrix * modelMatrix * vec4(inVertexPosition.xyz, 1.0);
        
        passColour = inColour;
        passNormal = inNormal;
        passFragmentPosition = vec3(modelMatrix * vec4(inVertexPosition, 1.0));
    }`,
    mapFragment: `#version 300 es
    precision highp float;

    in vec3 passColour;
    in vec3 passNormal;
    in vec3 passFragmentPosition;

    out vec4 colour;

    uniform vec3 lightPosition;

    void main() {
        vec3 lightDirection = normalize(lightPosition - passFragmentPosition);
        float diff = max(dot(passNormal, lightDirection), 0.2);
        vec3  finalColour = passColour * diff * 2.0;
        colour = vec4(finalColour.xyz, 1.0);
    }`,
}














//temp

function inputStuff(camera) {
    //TEMP
    const speed = 0.1;
    if (keydown["s"]) {
        camera.position.x += Math.cos(toRadians(camera.rotation.y + 90)) * speed;
        camera.position.z += Math.sin(toRadians(camera.rotation.y + 90)) * speed;
    } else if (keydown["w"]) {
        camera.position.x += -Math.cos(toRadians(camera.rotation.y + 90)) * speed;
        camera.position.z += -Math.sin(toRadians(camera.rotation.y + 90)) * speed;
    }
    if (keydown["a"]) {
        camera.rotation.y -= 1;
    } else if (keydown["d"]) {
        camera.rotation.y += 1;
    }
    if (keydown["p"]) {
        console.log(camera);
    }
    //TEMP
}



const keydown = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
};

/**
 * Sets the key down event for the key pressed to true
 * @param {Event} event The key down event
 */
function handleKeyDown(event) {
    keydown[event.key] = true;
}

/**
 * Sets the key down event for the key pressed to false
 * @param {Event} event The key down event
 */
function handleKeyUp(event) {
    keydown[event.key] = false;
}