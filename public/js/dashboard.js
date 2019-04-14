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

    const textCanvas = document.getElementById("text-canvas");
    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;

    await main(canvas, textCanvas);
});

function initGl(gl) {
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
}

function initCtx(ctx) {
    ctx.fillStyle = "white";
    ctx.font = `bold 9.25px sans-serif`;
}

async function main(canvas3d, canvas2d) {
    const gl = canvas3d.getContext("webgl2");
    const ctx = canvas2d.getContext("2d");
    initGl(gl);
    initCtx(ctx);

    const camera = {
        position: new Vector3(15, 10, 30.5),
        rotation: new Vector3(30, 0, 0)
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

    const mapShader = new Shader(gl, shaders.mapVertex, shaders.mapFragment);
    mapShader.use(gl);
    mapShader.loadUniformMatrix4(gl, "projViewMatrix", matrix.projectionView);
    mapShader.loadUniformMatrix4(gl, "modelMatrix", matrix.model);
    mapShader.loadUniformVector3(gl, "lightPosition", new Vector3(15, 10, 15));

    const basicShader = new Shader(gl, shaders.basicVertex, shaders.basicFragment);
    basicShader.use(gl);
    basicShader.loadUniformMatrix4(gl, "projViewMatrix", matrix.projectionView);

    const objects = await createMapMesh(gl);
    window.requestAnimationFrame(mainloop);

    function mainloop() {
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
        //Clear
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        mapShader.use(gl);
        matrix.view = createViewMatrix(camera.rotation, camera.position)
        mat4.multiply(matrix.projectionView, matrix.perspective, matrix.view);
        mapShader.loadUniformMatrix4(gl, "projViewMatrix", matrix.projectionView);

        //Render rooms
        for (const room of objects.rooms) {
            mapShader.use(gl);
            gl.bindVertexArray(room.vao);
            gl.drawElements(gl.TRIANGLES, room.indices, gl.UNSIGNED_SHORT, 0);

            if (room.billboard) {
                const board = room.billboard;
                basicShader.use(gl);
                basicShader.loadUniformMatrix4(gl, "projViewMatrix", matrix.projectionView);

                const rx = (room.center.x + 2);
                const rz = (room.center.z + 2);
                const dx = rx - camera.position.x;
                const dz = rz - camera.position.z;
                const rot = 180 + toDegrees(Math.atan2(dx, dz));

                const modelMatrix = createModelMatrix(
                    new Vector3(0, rot, 0), 
                    new Vector3(room.center.x, 3, room.center.z)
                );
                basicShader.loadUniformMatrix4(gl, "modelMatrix", modelMatrix);

                gl.bindVertexArray(board.vao);
                gl.drawElements(gl.TRIANGLES, board.indices, gl.UNSIGNED_SHORT, 0);
                
                //For rendering the text, use the matrices to calculate the screen coordinates to
                //render it to
                const pos = mat4.create();
                mat4.mul(pos, matrix.projectionView, modelMatrix);

                //Convert from opengl coords to screen coords
                const x = ((pos[12] / pos[15]) * 0.5 + 0.5)  * gl.canvas.width + (1 / pos[14]) * 256;
                const y = ((pos[13] / pos[15]) * -0.5 + 0.5) * gl.canvas.height - (1 / pos[14]) * 512;

                const z = pos[14];
                if (z < 25) {

                



                
                ctx.fillText(`Room ${board.roomid}`, x, y);
                ctx.fillText(`Store: ${board.storeName}`, x, y + 12);
                ctx.fillText(`${board.storeType}`, x, y + 24);
                }
            }
        }

        mapShader.use(gl);
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
 * Creates vertex positions and normals of a basic quad shape
 * @param {Number} width The width of the quad
 * @param {Number} height The height of the quad
 */
function createQuadPositions(width, height) {
    return [
        0, -1, 0,
        width, 0, 0,
        width, height, 0,
        0, height, 0
    ]
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
    const roomHeight = 2;
    const halfGap = gapSize / 2;
    for (const room of roomGeometry) {
        //Scale the data down
        const x = room.x / scaleFactor + gapSize;
        const z = room.y / scaleFactor + gapSize;
        const roomWidth = room.width / scaleFactor - gapSize;
        const roomDepth = room.height / scaleFactor - gapSize;

        const mesh = new Mesh();

        //Adds normal and vertex data to the mesh
        function addMeshData(geometry) {
            mesh.positions.push(...geometry.positions);
            mesh.normals.push(...geometry.normals);
        }

        //Object that will be added onto in this function
        //Contains information about this room
        const roomObject = {
            roomid: room.id,
            center: {
                x: x + roomWidth / 2,
                z: z + roomDepth / 2
            }
        }

        //Calculate positions of the vertricies to make the floor and the room's outline

        //Create ceiling geometry
        addMeshData(createFloorQuadGeometry(x, roomHeight, z, roomWidth, roomDepth));

        //Create inner-wall geometry
        addMeshData(createWallZPlane(x, 0, z, roomWidth, roomHeight, -halfGap, -1));
        addMeshData(createWallZPlane(x, 0, z, roomWidth, roomHeight, roomDepth + halfGap, 1));
        addMeshData(createWallXPlane(x, 0, z, roomDepth, roomHeight, -halfGap, -1));
        addMeshData(createWallXPlane(x, 0, z, roomDepth, roomHeight, roomWidth + halfGap, 1));

        //Calculate the outline wall geometry
        addMeshData(createWallZPlane(x - halfGap, 0, z, halfGap, roomHeight, roomDepth + halfGap, 1));
        addMeshData(createWallZPlane(x + roomWidth, 0, z, halfGap, roomHeight, roomDepth + halfGap, 1));
        addMeshData(createWallZPlane(x + roomWidth, 0, z, halfGap, roomHeight, -halfGap, -1));
        addMeshData(createWallZPlane(x - halfGap, 0, z, halfGap, roomHeight, -halfGap, -1));
        addMeshData(createWallXPlane(x, 0, z - halfGap, halfGap, roomHeight, -halfGap, 1));
        addMeshData(createWallXPlane(x, 0, z + roomDepth, halfGap, roomHeight, -halfGap, 1));
        addMeshData(createWallXPlane(x, 0, z - halfGap, halfGap, roomHeight, roomWidth + halfGap, -1));
        addMeshData(createWallXPlane(x, 0, z + roomDepth, halfGap, roomHeight, roomWidth + halfGap, -1));

        //Calculate outline of ceiling geometry
        addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z - halfGap, roomWidth + gapSize, halfGap));
        addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z + roomDepth, roomWidth + gapSize, halfGap));
        addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z - halfGap, halfGap, roomDepth + gapSize));
        addMeshData(createFloorQuadGeometry(x + roomWidth, roomHeight, z - halfGap, halfGap, roomDepth + gapSize));

        let colour;
        //Do extra things if the room has an assosiated store
        if (roomsData[room.id]) {
            roomObject.storeid = roomsData[room.id];
            const response = await fetch("api/stores/store-info?id=" + roomObject.storeid);
            const info = await response.json();
            colour = typeToColour(info.type).asNormalised().asArray();
            roomObject.billboard = makeRoomBillboard(gl, roomObject, info);
        } else {
            colour = typeToColour("none").asNormalised().asArray();
        }

        createColourIndicesData(mesh, new Colour(0.8, 0.8, 0.8));

        //Change colour of the inner-quad and walls to be the store colour
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 3; j++) {
                mesh.colours[i * 3 + j] = colour[j];
            }
        }
        const buffers = mesh.createBuffers(gl);

        roomObject.vao = buffers.vao;
        roomObject.buffers = buffers.buffers;
        roomObject.indices = mesh.indices.length;

        rooms.push(roomObject);
    }
    return rooms;
}

function makeRoomBillboard(gl, roomObject, storeInfo) {
    const billboard = { };
    
    const billboardMesh = new Mesh();
    billboardMesh.positions = createQuadPositions(4, 3);
    billboardMesh.indices   = [0, 1, 2, 2, 3, 0];

    const buffers = billboardMesh.createBuffers(gl);
    billboard.vao     = buffers.vao;
    billboard.buffers = buffers.buffers;
    billboard.indices = billboardMesh.indices.length;
    billboard.height = 3;

    billboard.roomid = roomObject.roomid;
    billboard.storeName = storeInfo.name;
    billboard.storeType = storeInfo.type;

    return billboard;
}

//Shader programs
const shaders = {
    //Verex and fragment shader for the map
    mapVertex:
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
    }`,
    mapFragment:
    `#version 300 es
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

    basicVertex:
    `#version 300 es
    in vec3 inVertexPosition;

    out float y;

    uniform mat4 modelMatrix;
    uniform mat4 projViewMatrix;

    void main() {
        gl_Position = projViewMatrix * modelMatrix * vec4(inVertexPosition.xyz, 1.0);
        y = inVertexPosition.y + 5.0;
    }`,

    basicFragment:
    `#version 300 es
    precision highp float;

    out vec4 colour;
    in float y;

    void main() {
        colour = vec4(1.0/y, 1.0/y, (1.0/y) * 2.0, 1.0);
    }`,
}














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