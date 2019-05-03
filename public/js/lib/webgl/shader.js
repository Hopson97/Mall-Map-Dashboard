/**
 * Class to hold a WebGL shder program and
 */
export class Shader {
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
export function createShaderFromSource(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    return createShaderProgram(gl, vertexShader, fragmentShader);
}