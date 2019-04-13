"use strict";

/**
 * Dashboard.js
 * JS file for the display board
 */

window.addEventListener("load", async e => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", handleMessage);

    const canvas = document.getElementById("map-canvas");
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    await main(canvas);
});

function initGl(gl) {
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
}  

async function main(canvas) {
    const gl = canvas.getContext("webgl2");
    initGl(gl);

    const camera = {
        position: new Vector3(15, 15, 35.5),
        rotation: new Vector3(60, 0, 0)
    };

    //TEMP
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    //TEMP

    const matrix = {
        model: createModelMatrix(new Vector3(0, 0, 0), new Vector3(0, -1, 0)),
        view: createViewMatrix(camera.rotation, camera.position),
        perspective: createProjectionMatrix(90, gl),
        projectionView: mat4.create()
    };
    mat4.multiply(matrix.projectionView, matrix.perspective, matrix.view);

    const lightPosition = new Vector3(0, 10, 0);
    const shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
    shader.use(gl);

    shader.loadUniformMatrix4(gl, "projViewMatrix", matrix.projectionView);
    shader.loadUniformMatrix4(gl, "modelMatrix", matrix.model);
    shader.loadUniformVector3(gl, "lightPosition", lightPosition);

    const objects = await createMapMesh(gl);
    window.requestAnimationFrame(mainloop);

    function mainloop() {
        //TEMP
        const speed = 0.1;
        if (keydown["s"]) {
            camera.position.x += Math.cos(toRadians(camera.rotation.y + 90)) * speed;
            camera.position.z += Math.sin(toRadians(camera.rotation.y + 90)) * speed;
        }
        else if (keydown["w"]){
            camera.position.x += -Math.cos(toRadians(camera.rotation.y + 90)) * speed;
            camera.position.z += -Math.sin(toRadians(camera.rotation.y + 90)) * speed;
        }
        if (keydown["a"]) {
            camera.rotation.y -= 1;
        }
        else if (keydown["d"]) {
            camera.rotation.y += 1;
        }
        if (keydown["p"]) {
            console.log(camera);
        }
        //TEMP


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //camera.rotation.y += 0.25;

        matrix.view = createViewMatrix(camera.rotation, camera.position)
        mat4.multiply(matrix.projectionView, matrix.perspective, matrix.view);
        shader.loadUniformMatrix4(gl, "projViewMatrix", matrix.projectionView);

        //Render rooms
        for (const room of objects.rooms) {
            gl.bindVertexArray(room.VAO);
            gl.drawElements(gl.TRIANGLES, room.indices, gl.UNSIGNED_SHORT, 0);
        }

        //Render paths
        for (const path of objects.paths) {
            gl.bindVertexArray(path.VAO);
            gl.drawElements(gl.TRIANGLES, path.indices, gl.UNSIGNED_SHORT, 0);
        }
        window.requestAnimationFrame(mainloop);
    }
}


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
        positions:[
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

function createWallZPlane(x, y, z, width, height, zOffset, normalDirection) {
    return {
        positions:[
            x,          y,          z + zOffset,
            x + width,  y,          z + zOffset,
            x + width,  y + height, z + zOffset,
            x,          y + height, z + zOffset
        ],
        normals: [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]
    };
}

function createWallXPlane(x, y, z, width, height, xOffset, normalDirection) {
    return {
        positions:[
            x + xOffset,    y,          z,
            x + xOffset,    y,          z + width,
            x + xOffset,    y + height, z + width,
            x + xOffset,    y + height, z
        ],
        normals: [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]
    };
}

/**
 * Fills the mesh data with the same basic data for every vertex based on the number of vertices already added
 * @param {Mesh} mesh The mesh to add the data to
 * @param {Colour} colour The colour set the colour data
 */
function createColourNormalIndicesData (mesh, colour) {
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
    for (const path of  pathData) {
        const mesh = new Mesh();

        //Scale the data down
        const x = path.x / scaleFactor + halfGap;;
        const z = path.y / scaleFactor + halfGap;
        const width = path.width / scaleFactor;
        const height = path.height / scaleFactor;

        const geometry = createFloorQuadGeometry(x, 0, z, width, height);
        mesh.positions.push(...geometry.positions);
        mesh.normals.push(...geometry.normals);
        
        createColourNormalIndicesData(mesh, new Colour(1, 1, 1));
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
    const roomHeight = 2;
    const halfGap = gapSize / 2;
    for (const room of roomGeometry) {
        //Scale the data down
        const x = room.x / scaleFactor + gapSize;
        const z = room.y / scaleFactor + gapSize;
        const roomWidth = room.width / scaleFactor - gapSize;
        const roomDepth = room.height / scaleFactor - gapSize;

        const mesh = new Mesh();
        function addMeshData(geometry) {
            mesh.positions.push(...geometry.positions);
            mesh.normals.push(...geometry.normals);
        }

        //Calculate positions of the vertricies to make the floor and the room's outline

        //Create ceiling geometry
        addMeshData(createFloorQuadGeometry(x, roomHeight, z, roomWidth, roomDepth));

        //Create inner-wall geometry
        addMeshData(createWallZPlane(x, 0, z, roomWidth, roomHeight, -halfGap));
        addMeshData(createWallZPlane(x, 0, z, roomWidth, roomHeight, roomDepth + halfGap));
        addMeshData(createWallXPlane(x, 0, z, roomDepth, roomHeight, -halfGap));
        addMeshData(createWallXPlane(x, 0, z, roomDepth, roomHeight, roomWidth + halfGap));

        //Calculate the outline wall geometry
        addMeshData(createWallZPlane(x - halfGap, 0, z, halfGap, roomHeight, roomDepth + halfGap));
        addMeshData(createWallZPlane(x + roomWidth, 0, z, halfGap, roomHeight, roomDepth + halfGap));
        addMeshData(createWallZPlane(x + roomWidth, 0, z, halfGap, roomHeight, -halfGap));
        addMeshData(createWallZPlane(x - halfGap, 0, z, halfGap, roomHeight, -halfGap));
        addMeshData(createWallXPlane(x, 0, z - halfGap, halfGap, roomHeight, -halfGap));
        addMeshData(createWallXPlane(x, 0, z + roomDepth, halfGap, roomHeight, -halfGap));
        addMeshData(createWallXPlane(x, 0, z - halfGap, halfGap, roomHeight, roomWidth + halfGap));
        addMeshData(createWallXPlane(x, 0, z + roomDepth, halfGap, roomHeight, roomWidth + halfGap));

        //Calculate outline of ceiling geometry
        addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z - halfGap, roomWidth + gapSize, halfGap));
        addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z + roomDepth, roomWidth + gapSize, halfGap));
        addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z - halfGap, halfGap, roomDepth + gapSize));
        addMeshData(createFloorQuadGeometry(x + roomWidth, roomHeight, z - halfGap, halfGap, roomDepth + gapSize));

        let colour;
        let storeid = -1;

        //Colour in the room if the room is occupied by a store
        if (roomsData[room.id]) {
            storeid = roomsData[room.id];
            const response = await fetch("api/stores/store-info?id=" + storeid);
            const info = await response.json();
            colour = typeToColour(info.type).asNormalised().asArray();
        } else {
            colour = typeToColour("none").asNormalised().asArray();
        }

        createColourNormalIndicesData(mesh, new Colour(0.8, 0.8, 0.8));

        //Change colour of the inner-quad and walls to be the store colour
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 3; j++) {
                mesh.colours[i * 3 + j] = colour[j];
            }
        }
        const buffers = mesh.createBuffers(gl);
        rooms.push({
            VAO: buffers.vao,
            buffers: buffers.buffers,
            indices: mesh.indices.length,
            roomid: room.id,
            storeid: storeid,
            center: {
                x: x + roomWidth / 2,
                z: z + roomDepth / 2
            }
        });
    }
    return rooms;
}


//Shader programs
const vertexShaderSource =
    `#version 300 es
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
    }
`;

const fragmentShaderSource =
    `#version 300 es
    precision highp float;

    in vec3 passColour;
    in vec3 passNormal;
    in vec3 passFragmentPosition;

    out vec4 colour;

    uniform vec3 lightPosition;

    void main() {
        vec3 lightDirection = normalize(lightPosition - passFragmentPosition);
        float diff = max(dot(passNormal, lightDirection), 0.1);
        vec3  finalColour = passColour * diff;
        colour = vec4(finalColour.xyz, 1.0);
    }
`;

//temp
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