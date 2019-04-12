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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

    //TEMP
    const shader = createShaderFromSource(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(shader);

    const projection = createProjectionMatrix(90, gl);

    const rot = new Vector3(0, 0, 0);
    const pos = new Vector3(0,-1, 0);

    const viewMatrix = createViewMatrix(
        new Vector3(30, 0, 0),
        new Vector3(15, 10, 35));

    const projectionViewMatrix = mat4.create();
    mat4.multiply(projectionViewMatrix, projection, viewMatrix);

    const projViewLocation = gl.getUniformLocation(shader, 'projViewMatrix');
    const modelMatrixLocation = gl.getUniformLocation(shader, 'modelMatrix');

    gl.uniformMatrix4fv(
        projViewLocation, false, projectionViewMatrix
    );
    const modelMatrix = createModelMatrix(
        rot,
        pos);
    gl.uniformMatrix4fv(
        modelMatrixLocation, false, modelMatrix
    );

    const objects = await createMapMesh(gl);


    window.requestAnimationFrame(mainloop);


    function mainloop() {
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (const o of objects) {
            gl.bindVertexArray(o);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
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
    const roomsJson = await response.json();
    console.log(roomsJson);

    const objects = [];
    const scaleFactor = 15;
    for (const room of geometry.rooms) {
        const x = room.x / scaleFactor;
        const z = room.y / scaleFactor;
        const w = room.width / scaleFactor;
        const d = room.height / scaleFactor;

        const positions = [
            x,      0, z,
            x + w,  0, z,
            x + w,  0, z + d,
            x,      0, z + d
        ];
        const colours = [
            0, 1, 1,
            1, 1, 0,
            1, 0, 1,
            1, 1, 1
        ];
    
        const indices = [
            0, 1, 2, 2, 3, 0
        ]
    

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const posBuffer = createBuffer(gl, positions, 0, 3);
        const colBuffer = createBuffer(gl, colours, 1, 3);
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

//Shader programs
const vertexShaderSource =
    `#version 300 es
    in vec3 inVertexPosition;
    in vec3 inColour;
    
    out vec3 passColour;

    uniform mat4 modelMatrix;
    uniform mat4 projViewMatrix;

    void main() {
        gl_Position = projViewMatrix * modelMatrix * vec4(inVertexPosition.xyz, 1.0);
        passColour = inColour;
    }
`;

const fragmentShaderSource =
    `#version 300 es
    precision highp float;

    in vec3 passColour;
    out vec4 colour;

    void main() {
        colour = vec4(passColour.xyz, 1.0);
    }
`;