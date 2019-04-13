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
        position: new Vector3(15, 10, 30),
        rotation: new Vector3(60, 0, 0)
    };

    const matrix = {
        model: createModelMatrix(new Vector3(0, 0, 0), new Vector3(0, -5, 0)),
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
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
 * Creates vertex positions for a quad in the Y-plane
 * @param {Number} x The x-coordinate to begin the floor
 * @param {Number} y The y-coordinate of the floor
 * @param {Number} z The z-coordinate to begin the floor
 * @param {Number} width The width of the wall
 * @param {Number} depth The height(depth) of the wall
 */
function createFloorQuadGeometry(x, y, z, width, depth) {
    return [
        x, y, z,
        x + width, y, z,
        x + width, y, z + depth,
        x, y, z + depth,
    ];
}

function createColourNormalIndicesData (mesh, colour) {
    for (let i = 0; i < mesh.positions.length / 12; i++) {
        for (let v = 0; v < 4; v++) {
            mesh.colours.push(colour.r, colour.g, colour.b);
            mesh.normals.push(0, 1, 0);
        }
        mesh.indices.push(
            i * 4, i * 4 + 1, i * 4 + 2,
            i * 4 + 2, i * 4 + 3, i * 4
        );
    }
}

function buildPathGeometry(gl, scaleFactor, gapSize, pathData) {
    const paths = [];
    for (const path of  pathData) {
        const mesh = new Mesh();

        const x = path.x / scaleFactor + gapSize / 2;;
        const z = path.y / scaleFactor + gapSize / 2;
        const width = path.width / scaleFactor;
        const height = path.height / scaleFactor;

        mesh.positions.push(...createFloorQuadGeometry(x, 0, z, width, height));
        
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


async function buildRoomsGeometry(gl, scaleFactor, gapSize, roomGeometry, roomsData) {
    const rooms = [];
    const roomHeight = 2;
    for (const room of roomGeometry) {
        const x = room.x / scaleFactor + gapSize;
        const z = room.y / scaleFactor + gapSize;
        const roomWidth = room.width / scaleFactor - gapSize;
        const roomDepth = room.height / scaleFactor - gapSize;

        const mesh = new Mesh();
        //Calculate positions of the vertricies to make the floor and the room's outline
        mesh.positions.push(...createFloorQuadGeometry(x, roomHeight, z, roomWidth, roomDepth));
        mesh.positions.push(...createFloorQuadGeometry(x - gapSize / 2, roomHeight, z - gapSize / 2, roomWidth + gapSize, gapSize / 2));
        mesh.positions.push(...createFloorQuadGeometry(x - gapSize / 2, roomHeight, z + roomDepth, roomWidth + gapSize, gapSize / 2));
        mesh.positions.push(...createFloorQuadGeometry(x - gapSize / 2, roomHeight, z - gapSize / 2, gapSize / 2, roomDepth + gapSize));
        mesh.positions.push(...createFloorQuadGeometry(x + roomWidth, roomHeight, z - gapSize / 2, gapSize / 2, roomDepth + gapSize));

        let colour;
        let storeid = -1;
        //Colour in the rooms if the room is occupied
        if (roomsData[room.id]) {
            storeid = roomsData[room.id];
            const response = await fetch("api/stores/store-info?id=" + storeid);
            const info = await response.json();
            colour = typeToColour(info.type).asNormalised().asArray();
        } else {
            colour = typeToColour("none").asNormalised().asArray();
        }

        createColourNormalIndicesData(mesh, new Colour(0.8, 0.8, 0.8));

        //Change colour of the inner-quad to be the store colour
        for (let i = 0; i < 4; i++) {
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