"use strict"

import {createBuffer,
        createElementBuffer} from './webgl-utilities.js';

/**
 * Holds general information about a mesh
 */
export class Mesh {
    /**
     * Initialises the mesh arrays
     */
    constructor() {
        this.positions = [];
        this.colours = [];
        this.indices = [];
        this.normals = [];
        this.buffers = [];
        this.buffered = false;
    }

    /**
     * Deletes the mesh's vertex buffer objects
     * @param {WebGL2RenderingContext} gl The webgl context
     */
    deleteBuffers(gl) {
        if (this.buffered) {
            this.buffered = false;
            for (const buffer of this.buffers) {
                gl.deleteBuffer(buffer);
            }
        }
    }

    /**
     * Buffers the mesh data to gpu and returns the webgl buffer objects and vertex array object
     * @param {WebGL2RenderingContext} gl The WebGL context
     */
    createBuffers(gl) {
        this.deleteBuffers(gl);

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        this.buffers.push(
            createBuffer(gl, this.positions, 0, 3),
            createBuffer(gl, this.colours, 1, 3),
            createBuffer(gl, this.normals, 2, 3),
            createElementBuffer(gl, this.indices),
        );
        this.buffered = true;
        return {
            vao,
            buffers: this.buffers
        }
    }
}