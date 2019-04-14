"use strict"

/**
 * File for general WebGL functions
 */

/**
 * Holds general information about a mesh
 */
class Mesh {
    /**
     * Initialises the mesh arrays
     */
    constructor() {
        this.positions = [];
        this.colours = [];
        this.indices = [];
        this.normals = [];
    }

    /**
     * Buffers the mesh data to gpu and returns the webgl buffer objects and vertex array object
     * @param {WebGL2RenderingContext} gl The WebGL context
     */
    createBuffers(gl) {
        const buffers = [];
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        buffers.push(
            createBuffer(gl, this.positions, 0, 3),
            createBuffer(gl, this.colours, 1, 3),
            createBuffer(gl, this.normals, 2, 3),
            createElementBuffer(gl, this.indices),
        );
        return {
            vao,
            buffers
        }
    }
}

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

    /**
     * Converts the vector into a float32 array for sending to shaders
     */
    toFloat32Array() {
        return new Float32Array([this.x, this.y, this.z]);
    }
}

/*
 * ==========================================
 *      WebGL Shaders
 * ==========================================
 */
/**
 * Class to hold a WebGL shder program and
 */
class Shader {
    /**
     * Compiles a shader to construct this object
     * @param {WebGLRenderContext} gl The WebGL context
     * @param {String} vertexSource The source code of the vertex shader
     * @param {String} fragmentSource The source code of the fragment shder
     */
    constructor(gl, vertexSource, fragmentSource) {
        const vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

        this.shaderId = createShaderProgram(gl, vertexShader, fragmentShader);
        this.uniformLocations = {}; //Maps uniform names to uniform locations
    }

    /**
     * Sets the WebGL state to use this shader program  
     * @param {WebGLRenderContext} gl The WebGL context
     */
    use(gl) {
        gl.useProgram(this.shaderId)
    }

    /**
     * Gets the location of the uniform variable inside of a shader, and caches the result
     * @param {WebGLRenderContext} gl The WebGL Context
     * @param {String} name The name of the uniform variable in the shader source
     */
    getUniformLocation(gl, name) {
        if (!this.uniformLocations[name]) {
            this.uniformLocations[name] =
                gl.getUniformLocation(this.shaderId, name);
        }
        return this.uniformLocations[name];
    }

    /**
     * Loads a matrix4 to a webgl uniform location of this shader
     * @param {WebGLRenderContext} gl The WebGL Context
     * @param {String} name The name of the uniform variable in the shader source
     * @param {mat4} matrix The matrix to load to the webgl shader
     */
    loadUniformMatrix4(gl, name, matrix) {
        const location = this.getUniformLocation(gl, name);
        gl.uniformMatrix4fv(location, false, matrix);
    }

    /**
     * Loads a vectpr3 to a webgl uniform location of this shader
     * @param {WebGLRenderContext} gl The WebGL Context
     * @param {String} name The name of the uniform variable in the shader source
     * @param {mat4} matrix The matrix to load to the webgl shader
     */
    loadUniformVector3(gl, name, vector3) {
        const location = this.getUniformLocation(gl, name);
        gl.uniform3fv(location, vector3.toFloat32Array());
    }
}

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
function createBuffer(gl, data, attribLocation, dataPerVertex) {
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
 * @param {*} data The indices which make up this index buffer
 */
function createElementBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    return buffer;
}

/*
 * ==========================================
 *      WebGL Maths (using glmatrix library)
 * ==========================================
 */
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
        0.1,
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

/**
 * Converts radians to degrees
 * @param {Number} radians The number to convert in radians
 */
function toDegrees(degrees) {
    return degrees * 180 / Math.PI;
}

function transformVector(matrix, vector) {
    const result = new Float32Array(4);
    for (let y = 0; y < 4; y++) {
        result[y] = 0.0;
        for (let x = 0; x < 4; x++) {
            result[y] += vector[x] * matrix[x * 4 + y];
        }
    }
    return result;
}