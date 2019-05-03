"use strict"

/**
 * File for general WebGL functions
 */


/*
 * ==========================================
 *      WebGL Shaders
 * ==========================================
 */


/*
 * ==========================================
 *      WebGL Buffers
 * ==========================================
 */
/**
 * Creates a webgl vertex buffer object
 * @param {WebGLRenderingContext} gl The OpenGL/WebGL rendering context
 * @param {Array} data A array of floating point numbers 
 * @param {Number} attribLocation The location of the attribute in the vertex shader
 * @param {Number} dataPerVertex The amount of data per vertex (2d/3d/4d etc)
 */
export function createBuffer(gl, data, attribLocation, dataPerVertex) {
    if (data.length > 0) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.vertexAttribPointer(
            attribLocation, dataPerVertex, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribLocation);
        return buffer;
    }
    return 0;
}

/**
 * 
 * @param {WebGLContext} gl The OpenGL/WebGL2 rendering context
 * @param {Array} data The indices which make up this index buffer
 */
export function createElementBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    return buffer;
}