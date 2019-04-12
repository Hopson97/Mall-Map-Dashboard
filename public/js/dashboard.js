"use strict";

window.addEventListener("load", e => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", handleMessage);

    const canvas = document.getElementById("map-canvas");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.9;

    main(canvas);
});

function main(canvas) {
    const gl = canvas.getContext("webgl2");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

    //TEMP
    const shader = createShaderFromSource(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(shader);
    const positions = [
        0, 0, 0,
        1, 0, 0,
        1, 0, -1,
        0, 0, -1,

        0, 0, 0,
        0, -1, 0,
        0, -1, -1,
        0, 0, -1,
    ];
    const colours = [

    ];

    const indices = [
        0, 1, 2, 2, 3, 0,
        4, 5, 6, 6, 7, 4
    ]

    for (let i = 0; i < positions.length; i++) {
        colours.push(Math.random());
    }



    


    const positionLocation = gl.getAttribLocation(shader, 'inVertexPosition');
    const colourLocation = gl.getAttribLocation(shader, 'inColour');

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posBuffer = createBuffer(gl, positions, positionLocation, 3);
    const colBuffer = createBuffer(gl, colours, colourLocation, 3);
    const eleBuffer = createElementBuffer(gl, indices);

    const projection = mat4.create();
    mat4.perspective(
        projection,
        60 * Math.PI / 180.0,
        gl.canvas.clientWidth / gl.canvas.clientHeight,
        0.0,
        100.0);

    const rot = new Vector3(0, 0, 0);
    const pos = new Vector3(0,-1, 0);

    const viewMatrix = createViewMatrix(
        new Vector3(0, 0, 0),
        new Vector3(0, 0, 7));

    const projectionViewMatrix = mat4.create();
    mat4.multiply(projectionViewMatrix, projection, viewMatrix);

    const projViewLocation = gl.getUniformLocation(shader, 'projViewMatrix');
    const modelMatrixLocation = gl.getUniformLocation(shader, 'modelMatrix');

    gl.uniformMatrix4fv(
        projViewLocation, false, projectionViewMatrix
    );


    window.requestAnimationFrame(mainloop);

    function mainloop() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        rot.y += 1;
        pos.x = Math.sin(toRadians(rot.y)) * 2;
        pos.z = Math.cos(toRadians(rot.y)) * 2;

        const modelMatrix = createModelMatrix(
            rot,
            pos);
        gl.uniformMatrix4fv(
            modelMatrixLocation, false, modelMatrix
        );
        
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        window.requestAnimationFrame(mainloop);
    }
}


function handleMessage(event) {
    const data = JSON.parse(event.data);
    console.log(data);
    switch (data.type) {

    }
}

/*
 * =========================
 * OpenGL Helper functions and classes
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

    getNegation() {
        return new Vector3(-this.x, -this.y, -this.z);
    }

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
    return createModelMatrix(rotation, translation.getNegation());
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