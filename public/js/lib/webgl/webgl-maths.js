"use strict"

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
export function createModelMatrix(rotation, translation) {
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
export function createViewMatrix(rotation, translation) {
    const matrix = mat4.create();

    mat4.rotate(matrix, matrix, toRadians(rotation.x), [1, 0, 0]);
    mat4.rotate(matrix, matrix, toRadians(rotation.y), [0, 1, 0]);
    mat4.rotate(matrix, matrix, toRadians(rotation.z), [0, 0, 1]);

    mat4.translate(matrix, matrix, translation.getNegation().toGLMatrixVec3());

    return matrix;
}

/**
 * Creates a perspective projection matrix
 * @param {Number} fov Field of version
 * @param {WebGLRenderingContext} gl The OpenGL/WebGL rendering context
 */
export function createProjectionMatrix(fov, gl) {
    const projection = mat4.create();
    mat4.perspective(
        projection,
        toRadians(fov),
        gl.canvas.clientWidth / gl.canvas.clientHeight,
        5,
        150.0);
    return projection;
}

/**
 * Converts degrees to radians
 * @param {Number} degrees The number to convert in degrees
 */
export function toRadians(degrees) {
    return degrees * Math.PI / 180.0;
}

/**
 * Converts radians to degrees
 * @param {Number} radians The number to convert in radians
 */
export function toDegrees(degrees) {
    return degrees * 180 / Math.PI;
}
