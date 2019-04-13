"use strict";

window.addEventListener("load", async e => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", handleMessage);

    const canvas = document.getElementById("map-canvas");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;

    await main(canvas);
});

async function main(canvas) {
    const gl = canvas.getContext("webgl2");
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    //gl.enable(gl.DEPTH_TEST);
    //gl.depthFunc(gl.LESS);
    //gl.depthMask(true);

    //TEMP
    const shader = createShaderFromSource(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(shader);

    const projection = createProjectionMatrix(90, gl);

    const camera = {
        position: new Vector3(0, 10, 20),
        rotation: new Vector3(60, 0, 0)
    };

    const modelMatrix = createModelMatrix(new Vector3(0, 0, 0), new Vector3(0, -5, 0));
    const projectionViewMatrix = mat4.create();
    const lightPosition = new Vector3(0, 10, 0);



    const projViewLocation = gl.getUniformLocation(shader, 'projViewMatrix');
    const modelMatrixLocation = gl.getUniformLocation(shader, 'modelMatrix');
    const lightPositionLocation = gl.getUniformLocation(shader, "lightPosition");


    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
    gl.uniform3fv(lightPositionLocation, lightPosition.toFloat32Array());

    const objects = await createMapMesh(gl);
    const modelRotation = new Vector3(0, 0, 0);
    window.requestAnimationFrame(mainloop);

    function mainloop() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const viewMatrix = createViewMatrix(camera.rotation, camera.position);
        mat4.multiply(projectionViewMatrix, projection, viewMatrix);
        gl.uniformMatrix4fv(projViewLocation, false, projectionViewMatrix);

        const modelMatrix = createModelMatrix(modelRotation, new Vector3(0, -5, 0));
        modelRotation.y += 0.05;
        gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

        for (const o of objects) {
            gl.bindVertexArray(o);
            gl.drawElements(gl.TRIANGLES, QUAD_COUNT * 6, gl.UNSIGNED_SHORT, 0);
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
const og = {};
const QUAD_COUNT = 5;
async function createMapMesh(gl) {
    const geometry = getMallLayout();
    const response = await fetch("/api/map/sect-data");
    const roomsJson = await response.json();

    console.log(geometry);


    const objects = [];
    const SCALE_FACTOR = 15;
    const GAP_SIZE = 0.5;

    og.x = geometry.bounds.maxX / SCALE_FACTOR / 2;
    og.y = geometry.bounds.maxX / SCALE_FACTOR / 2;
    for (const room of geometry.rooms) {
        const x = room.x / SCALE_FACTOR + GAP_SIZE;
        const z = room.y / SCALE_FACTOR + GAP_SIZE;
        const roomWidth = room.width / SCALE_FACTOR - GAP_SIZE;
        const roomDepth = room.height / SCALE_FACTOR - GAP_SIZE;

        const positions = [];
        positions.push(...createFloorQuadGeometry(x, 0, z, roomWidth, roomDepth));

        positions.push(...createFloorQuadGeometry(x - GAP_SIZE / 2, 0, z - GAP_SIZE / 2, roomWidth + GAP_SIZE, GAP_SIZE / 2));
        positions.push(...createFloorQuadGeometry(x - GAP_SIZE / 2, 0, z + roomDepth, roomWidth + GAP_SIZE, GAP_SIZE / 2));
        positions.push(...createFloorQuadGeometry(x - GAP_SIZE / 2, 0, z - GAP_SIZE / 2, GAP_SIZE / 2, roomDepth + GAP_SIZE));
        positions.push(...createFloorQuadGeometry(x + roomWidth, 0, z - GAP_SIZE / 2, GAP_SIZE / 2, roomDepth + GAP_SIZE));

        let colour;
        if (roomsJson[room.id]) {
            const response = await fetch("api/stores/store-info?id=" + roomsJson[room.id]);
            const info = await response.json();
            colour = typeToColour(info.type)
                .asNormalised();
        } else {
            colour = typeToColour("none")
                .asNormalised();
        }

        const colours = [];
        const indices = [];
        const normals = [];
        for (let i = 0; i < QUAD_COUNT; i++) {

            if (i != 0) {
                colour = new Colour(0.9, 0.9, 0.9);
            }
            for (let v = 0; v < 4; v++) {
                colours.push(colour.r, colour.g, colour.b);
                normals.push(0, 1, 0);
            }
            indices.push(
                i * 4, i * 4 + 1, i * 4 + 2,
                i * 4 + 2, i * 4 + 3, i * 4
            );
        }

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const posBuffer = createBuffer(gl, positions, 0, 3);
        const colBuffer = createBuffer(gl, colours, 1, 3);
        const norBuffer = createBuffer(gl, normals, 2, 3);
        const eleBuffer = createElementBuffer(gl, indices);
        objects.push(vao);
    }
    return objects;
}

/*
 * =========================================
 *
 *      WebGL Helper functions and classes

 * ==========================================
 */
/**
 * Class to represent a 3d position
 */
class Vector3 {
    /**
     * Creates a 3D vector
     * @param {Number} x The X component of the vector
     * @param {Number} y The Y component of the vector
     * @param {Number} z The Z component of the vector
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Gets the negative component of this vector
     */
    getNegation() {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    /**
     * Gets the gl.matrix libraries vec3 equalilivent of this vector
     */
    toGLMatrixVec3() {
        return vec3.fromValues(this.x, this.y, this.z);
    }

    toFloat32Array() {
        return new Float32Array([this.x, this.y, this.z]);
    }
}

//SHADERS
/**
 * Compiles and creates a shader
 * @param {WebGLRenderingContext} gl The openl/webgl rendering context
 * @param {String} source The source code of the shader
 * @param {Number} type The type of the shader (vertex/fragment)s
 */
function createShader(gl, source, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const isSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!isSuccess) {
        console.error("Could not compile shader");
        throw gl.getShaderInfoLog(shader);
    }
    return shader;
}

/**
 * Links two shaders together and creates a shader program
 * @param {WebGLRenderingContext} gl The openl/webgl rendering context
 * @param {WebGLShader} vertexShader The vertex shader
 * @param {WebGLShader} fragmentShader Thefragment shader
 */
function createShaderProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const isSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!isSuccess) {
        console.error("Could not link shaders");
        throw gl.getShaderInfoLog(program);
    }
    return program;
}

/**
 * Creates a WebGL shader
 * @param {WebGLRenderingContext} gl The OpenGL/WebGL render context
 * @param {String} vertexSource The source code of the vertex shader
 * @param {String} fragmentSource The sourcde code of the fragment shader
 */
function createShaderFromSource(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    return createShaderProgram(gl, vertexShader, fragmentShader);
}

//BUFFERS
/**
 * Creates a webgl vertex buffer object
 * @param {WebGLRenderingContext} gl The OpenGL/WebGL rendering context
 * @param {Array} data A array of floating point numbers 
 * @param {Number} attribLocation The location of the attribute in the vertex shader
 * @param {Number} dataPerVertex The amount of data per vertex (2d/3d/4d etc)
 */
function createBuffer(gl, data, attribLocation, dataPerVertex) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        attribLocation, dataPerVertex, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocation);
    return buffer;
}

/**
 * 
 * @param {WebGLContext} gl The OpenGL/WebGL2 rendering context
 * @param {*} data 
 */
function createElementBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    return buffer;
}

//MATHS
/**
 * Creates a model matrix
 * @param {Vector3} rotation The rotation of the model
 * @param {Vector3} translation The translation of the model
 */
function createModelMatrix(rotation, translation) {
    const matrix = mat4.create();

    mat4.translate(matrix, matrix, translation.toGLMatrixVec3());
    mat4.rotate(matrix, matrix, toRadians(rotation.x), [1, 0, 0]);
    mat4.rotate(matrix, matrix, toRadians(rotation.y), [0, 1, 0]);
    mat4.rotate(matrix, matrix, toRadians(rotation.z), [0, 0, 1]);
    mat4.translate(matrix, matrix, vec3.fromValues(-og.x, 0, -og.y));
    return matrix;
}

/**
 * Creates a view matrix
 * @param {Vector3} rotation The rotation of the model
 * @param {Vector3} translation The translation of the model
 */
function createViewMatrix(rotation, translation) {
    const matrix = mat4.create();
    mat4.rotate(matrix, matrix, toRadians(rotation.x), [1, 0, 0]);
    mat4.rotate(matrix, matrix, toRadians(rotation.y), [0, 1, 0]);
    mat4.rotate(matrix, matrix, toRadians(rotation.z), [0, 0, 1]);

    mat4.translate(matrix, matrix, translation.getNegation().toGLMatrixVec3());

    return matrix;
}

function createProjectionMatrix(fov, gl) {
    const projection = mat4.create();


    mat4.perspective(
        projection,
        toRadians(fov),
        gl.canvas.clientWidth / gl.canvas.clientHeight,
        0.0,
        100.0);
    return projection;
}

/**
 * Converts degrees to radians
 * @param {Number} degrees The number to convert in degrees
 */
function toRadians(degrees) {
    return degrees * Math.PI / 180.0;
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