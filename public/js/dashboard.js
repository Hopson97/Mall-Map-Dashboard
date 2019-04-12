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
    const gl = canvas.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //TEMP
    const shader = createShaderFromSource(
        gl, 
        vertexShaderSource, 
        fragmentShaderSource);
    gl.useProgram(shader);
    const positions = [
         0.0,  0.5, 
        -0.5, -0.5,
         0.5, -0.5
    ];

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const l = gl.getAttribLocation(shader, 'inVertexPosition');
    gl.vertexAttribPointer(
        l, 2, gl.FLOAT, false, 0, 0
    );
    gl.enableVertexAttribArray(l);

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
        [0.0, 0.0, -6.0]);

    const modelViewLocation  = gl.getUniformLocation(shader, 'modelViewMatrix');
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


function handleMessage (event) {
    const data = JSON.parse(event.data);
    console.log(data);
    switch(data.type) {

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

//Shader programs
const vertexShaderSource = 
`
    attribute vec3 inVertexPosition;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(inVertexPosition.xyz, 1.0);
    }
`;

const fragmentShaderSource = 
`
    void main() {
        gl_FragColor = vec4(1.0, 0.5, 1.0, 1.0);
    }
`;