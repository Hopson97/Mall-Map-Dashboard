"use strict"

/**
 * Class to represent a 3d position
 */
export class Vector3 {
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

    /**
     * Adds this vector together with another one
     * @param {Vector3} vec Vector to add this one to
     */
    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
    }
}