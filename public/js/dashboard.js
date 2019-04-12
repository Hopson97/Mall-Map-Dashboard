"use strict";

window.addEventListener("load", e => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", handleMessage);

    const canvas = document.getElementById("map-canvas");
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    beginRendering(canvas);
});

function beginRendering(canvas) {
    const gl = canvas.getContext("webgl2");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //TEMP
    const shader = createShaderFromSource(
        gl,
        vertexShaderSource,
        fragmentShaderSource);
    gl.useProgram(shader);
    const positions = [
        0.0, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
    ];
    const colours = [
        0.0, 1.0, 0.0,
        1.0, 0.0, 0.0,
        0.0, 0.0, 1.0,
    ];
    const positionLocation = gl.getAttribLocation(shader, 'inVertexPosition');
    const colourLocation   = gl.getAttribLocation(shader, 'inColour');

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const posBuffer = createBuffer(gl, positions, positionLocation, 3);
    const colBuffer = createBuffer(gl, colours, colourLocation, 3);

    const projection = mat4.create();
    mat4.perspective(
        projection,
        60 * Math.PI / 180.0,
        gl.canvas.clientWidth / gl.canvas.clientHeight,
        0.0,
        100.0);

    const modelViewMatrix = mat4.create();
    mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        [0.0, 0.0, -3.0]);

    const modelViewLocation = gl.getUniformLocation(shader, 'modelViewMatrix');
    const projectionLocation = gl.getUniformLocation(shader, 'projectionMatrix');

    gl.uniformMatrix4fv(
        modelViewLocation, false, modelViewMatrix
    );

    gl.uniformMatrix4fv(
        projectionLocation, false, projection
    );

    window.requestAnimationFrame(mainloop);

    function mainloop() {
        gl.clear(gl.COLOR_BUFFER_BIT);


        gl.drawArrays(gl.TRIANGLES, 0, 3);

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
 * OpenGL Helper functions
 */

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
 * 
 * @param {WebGLRenderingContext} gl The OpenGL/WebGL render context
 * @param {String} vertexSource The source code of the vertex shader
 * @param {String} fragmentSource The sourcde code of the fragment shader
 */
function createShaderFromSource(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    return createShaderProgram(gl, vertexShader, fragmentShader);
}

function createBuffer(gl, data, attribLocation, dataPerVertex) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(data),
        gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        attribLocation,
        dataPerVertex,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.enableVertexAttribArray(attribLocation);
    return buffer;
}
//Shader programs
const vertexShaderSource =
    `#version 300 es
    in vec3 inVertexPosition;
    in vec3 inColour;
    
    out vec3 passColour;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(inVertexPosition.xyz, 1.0);
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