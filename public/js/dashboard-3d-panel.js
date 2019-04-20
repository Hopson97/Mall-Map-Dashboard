"use strict";

//Scale down for the geometry
const scaleFactor = 15;

//Gap between rooms
const gapSize = 0.7;
const halfGap = gapSize / 2;

/**
 * Dashboard.js
 * JS file for the display board
 */

/*
 * ==================
 *      Classes
 * ==================
 */
/**
 * Renderer to assist with rendering 3D and 2D objects to browser window
 */
class Renderer {
    /**
     * Initilises WebGL and the 2D context
     */
    constructor() {
        //Get canvas objects
        const canvas3D = document.getElementById("map-canvas");
        const canvas2D = document.getElementById("text-canvas");

        //Get rendering contexts
        this.gl = canvas3D.getContext("webgl2");
        this.context = canvas2D.getContext("2d");

        //Set canvas size
        canvas3D.width = getBrowserWidth() * 0.8;
        canvas3D.height = getBrowserHeight() * 0.7;
        canvas2D.width = canvas3D.clientWidth;
        canvas2D.height = canvas3D.clientHeight;
        this.width = canvas3D.width;
        this.height = canvas3D.height;


        //Initilise WebGL
        this.gl.clearColor(0.05, 0.0, 0.1, 1.0);
        this.gl.viewport(0, 0, this.gl.canvas.clientWidth, this.gl.canvas.clientHeight);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        this.gl.depthMask(true);

        //Initilise the context
        this.context.fillStyle = "white";
        this.context.lineWidth = 3;
        this.context.font = `bold 9.5 sans-serif`;
    }

    /**
     * Clears the canvas windows
     */
    clear() {
        //Shorthand aliases
        const gl = this.gl;
        const c = this.context;

        //Clear both canvases
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    }

    /**
     * Draws a 3D object to canvas
     * @param {Drawable3D} drawable The object to draw
     */
    draw(drawable, mode = this.gl.TRIANGLES) {
        //Shorthand alias
        const gl = this.gl;
        gl.bindVertexArray(drawable.vao);
        gl.drawElements(mode, drawable.indicesCount, gl.UNSIGNED_SHORT, 0);
    }
}

/**
 * Represents an object in the world
 */
class Entity {
    /**
     * Construct the entity
     * @param {Vector3} position The position of the entity
     * @param {Vector3} rotation The roation of the entity
     */
    constructor(position, rotation) {
        this.position = position;
        this.rotation = rotation;
    }

    /**
     * Moves the entity's position by an offset
     * @param {Vector3} offset The amount to move the entity
     */
    move(offset) {
        this.position.add(offset);
    }

    /**
     * Rotates the entity by an offset
     * @param {Vector3} rotation The amount to rotate the entity
     */
    rotate(rotation) {
        this.rotation.add(rotation);
    }
}

/**
 * Represents a camera in the world, where the world should be rendered from
 */
class Camera extends Entity {
    /**
     * Construct the camera and the matrices
     * @param {Vector3} position The position of the entity
     * @param {Vector3} rotation The roation of the entity
     */
    constructor(gl, position, rotation) {
        super(position, rotation);
        this.projectionMatrix = createProjectionMatrix(90, gl);
        this.viewMatrix = mat4.create();
        this.projectionViewMatrix = mat4.create();
        this.update(new Vector3(), new Vector3());
    }

    /**
     * Moves the entity's position by an offset
     * @param {Vector3} offset The amount to move the entity
     * @param {Vector3} rotation The amount to rotate the entity
     */
    update(offset, rotation) {
        //Move and rotate camera
        super.move(offset);
        super.rotate(rotation);

        //Reset matrices
        this.viewMatrix = createViewMatrix(this.rotation, this.position);
        mat4.multiply(
            this.projectionViewMatrix,
            this.projectionMatrix,
            this.viewMatrix);
    }
}

/**
 * Class to represent a drawable 3D object
 */
class Drawable3D {
    constructor() {
        this.vao = 0;
        this.indicesCount = 0
        this.bufferList = []
        this.mesh = new Mesh();
    }

    buffer(gl) {
        const buffers = this.mesh.createBuffers(gl);
        this.vao = buffers.vao;
        this.bufferList = buffers.buffers;
        this.indicesCount = this.mesh.indices.length;
    }
}

/**
 * Class to hold data about a room that can be drawn
 */
class Room extends Drawable3D {
    /**
     * Constructs the room data
     * @param {Number} roomId The ID of this room
     * @param {Number} x The X-Coordinate of this room
     * @param {Number} z The Z-Coordinate of this room
     * @param {Number} width The width of this room
     * @param {Number} depth The depth of this room
     */
    constructor(gl, roomId, x, z, width, depth) {
        super();
        this.gl = gl;
        this.roomId = roomId;
        this.storeId = -1;
        this.billboard = null;
        this.x = x;
        this.z = z;
        this.width = width;
        this.depth = depth;
        this.centerX = x + width / 2;
        this.centerZ = z + depth / 2;
        this.billboard = null;
    }

    /**
     * Updates the room colour and billboard information
     */
    async update() {
        let colour;
        if (this.storeId >= 0) {
            //Get information about the store
            const response = await fetch("api/stores/store-info?id=" + this.storeId);
            if (response.status === 404) {
                //handle?
                return;
            } else {
                const shopInformation = await response.json();
                this.billboard = new Billboard(
                    this.roomId,
                    shopInformation.name,
                    shopInformation.type);
                colour = typeToColour(shopInformation.type).asNormalised().asArray();
            }
        } else {
            colour = typeToColour("none").asNormalised().asArray();
            this.billboard = null;
        }
        //Loop through the 60 colours (5 faces * 4 vertex per face * 3 colour per vertex) 
        //to update it's colour to be that of the new store
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 3; j++) {
                this.mesh.colours[i * 3 + j] = colour[j];
            }
        }
        this.buffer(this.gl);
    }
}

/**
 * Class to to hold data about a pathway
 */
class Path extends Drawable3D {
    constructor(x, z, width, depth) {
        super();
        this.x = x;
        this.z = z;
        this.width = width;
        this.depth = depth;
    }
}

/**
 * Class to hold data for billboards
 * These are the things that hover above shops, saying what they are
 */
class Billboard {
    /**
     * Constructs the billboard with basic info
     * @param {Number} roomId The room ID this billboard assosiates with
     * @param {String} storeName The name of the store to display
     * @param {String} storeType The type of the store to display    
     */
    constructor(roomId, storeName, storeType) {
        this.roomId = roomId
        this.storeName = storeName
        this.storeType = storeType
    }
}

/**
 * A billboard that can be rendered
 */
class RenderableBillboard {
    /**
     * Constructs the billboad rendering info, by transforming the room's 3D world coords to 2D screen coords
     * @param {Renderer} renderer The renderer to render the board to
     * @param {Camera} camera The camera that is used for looking at the billboard
     * @param {Room} room The room the billboard is displayed above
     */
    constructor(renderer, camera, room) {
        const modelMatrix = createModelMatrix(
            new Vector3(0, 0, 0),
            new Vector3(room.centerX, 3, room.centerZ)
        );
        const transform = mat4.create();
        mat4.mul(transform, camera.projectionViewMatrix, modelMatrix);

        //Convert transform to clip space
        const clipX = transform[12] / transform[15]; //X divide W
        const clipY = transform[13] / transform[15]; //Y divide W

        //Convert clip space to screen space
        this.x = (clipX * 0.5 + 0.5) * renderer.width - 25;
        this.y = (clipY * -0.5 + 0.5) * renderer.height - 15;
        this.z = transform[14];

        //get data
        this.billboardData = room.billboard;
    }

    /**
     * Renders the billboard 
     * @param {Rederer} renderer The renderer to render the billboard to
     */
    draw(renderer) {
        //TODO Use billboard store stats to fit the billboard size accordingly
        //Draw billboard thing
        const c = renderer.context;
        c.strokeStyle = "white";
        c.fillStyle = "black";
        c.beginPath();
        c.moveTo(this.x + 25, this.y + 25);
        c.lineTo(this.x + 10, this.y + 10);
        c.lineTo(this.x - 10, this.y + 5);
        c.lineTo(this.x - 10, this.y - 35);
        c.lineTo(this.x + 70, this.y - 35);
        c.lineTo(this.x + 70, this.y + 5);
        c.lineTo(this.x + 35, this.y + 10);
        c.lineTo(this.x + 25, this.y + 25);
        c.stroke();
        c.fill();
        c.fillStyle = "white";
        c.fillText(`Room ${this.billboardData.roomId}`, this.x, this.y - 24);
        c.fillText(`Store: ${this.billboardData.storeName}`, this.x, this.y - 12);
        c.fillText(`${this.billboardData.storeType}`, this.x, this.y);
    }
}

/*
 * ==================
 *      Functions
 * ==================
 */
/**
 * Entry point for the dashboard
 * 
 */
let objects;
async function begin3DRenderer() {
    //TEMP
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    //TEMP

    const renderer = new Renderer();
    const camera = new Camera(renderer.gl, new Vector3(65, 25, 140), new Vector3(50, 0, 0))

    const modelMatrix = createModelMatrix(new Vector3(0, 0, 0), new Vector3(0, -1, 0));

    //Create shader for rendering the map
    const mapShader = new Shader(renderer.gl, shaders.mapVertex, shaders.mapFragment);
    mapShader.use(renderer.gl);
    mapShader.loadUniformMatrix4(renderer.gl, "modelMatrix", modelMatrix);

    //Get lists of objects to render
    objects = await createMapMesh(renderer.gl);

    //Terrain
    const terrain = makeTerrainMesh(renderer.gl, 50, 50, 20, 20, 12);

    //Begin main rendering of stuff
    window.requestAnimationFrame(loop);

    function loop() {
        //TEMP
        inputStuff(camera); //VERY VERY TEMP TODO
        //TEMP

        renderer.clear();

        //Orbit the camera around the map of the mall
        const speed = 0.065;
        camera.update(
            new Vector3(
                Math.cos(toRadians(camera.rotation.y)) * speed,
                0,
                Math.sin(toRadians(camera.rotation.y)) * speed),
            new Vector3(0, -0.05, 0)
        );

        //Load uniform variables to shader
        mapShader.loadUniformVector3(renderer.gl, "lightPosition", camera.position);
        mapShader.loadUniformMatrix4(renderer.gl, "projViewMatrix", camera.projectionViewMatrix);

        renderObjects(renderer, camera);
        renderer.draw(terrain, renderer.gl.LINES);

        window.requestAnimationFrame(loop);
    }
};

/**
 * Renders the map objects
 * @param {WebGLRenderContext} gl The WebGL rendering context
 * @param {Context} ctx The context for rendering 2D
 * @param {Object} objects Object containing objects to draw    
 * @param {mat4} projectionViewMatrix Projection view matrix
 */
function renderObjects(renderer, camera) {
    //List to hold any billboards above rooms. This must be a defered render as they 
    //must be sorted by their z-distance to the camera
    const billboardRenderInfo = [];
    //Render rooms
    for (const room of objects.rooms) {

        renderer.draw(room);
        if (room.billboard) {
            const renderableBillboard = new RenderableBillboard(renderer, camera, room);
            //Do not draw billboards that are very far away
            if (renderableBillboard.z < 60) {
                billboardRenderInfo.push(renderableBillboard);
            }
        }
    }

    //Render paths
    for (const path of objects.paths) {
        renderer.draw(path);
    }

    //Sort the billboards by the Z-coordinates
    billboardRenderInfo.sort((a, b) => {
        return b.z - a.z;
    });

    //Render the boards
    for (const board of billboardRenderInfo) {
        board.draw(renderer);
    }
}

/**
 * Creates the geometry of the map
 * @param {WebGLRenderContext} gl The WebGL rendering conetext
 */
async function createMapMesh(gl) {
    const geometry = await getMallLayout();
    return {
        rooms: await buildRoomsGeometry(gl, geometry.rooms),
        paths: buildPathGeometry(gl, geometry.paths),
    };
}

/*
 * =======================================

 *      Geometry Generation Functions
 * 
 * =======================================
 */
/**
 * Creates vertex positions and vertex normals for a quad in the Y-plane
 * @param {Number} x The x-coordinate to begin the floor
 * @param {Number} y The y-coordinate of the floor
 * @param {Number} z The z-coordinate to begin the floor
 * @param {Number} width The width of the wall
 * @param {Number} depth The height(depth) of the wall
 */
function createFloorQuadGeometry(x, y, z, width, depth) {
    return {
        positions: [
            x, y, z,
            x + width, y, z,
            x + width, y, z + depth,
            x, y, z + depth
        ],
        normals: [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
        ]
    }
}

/**
 * Creates the vertex positions and normals for a wall in the Z-Plane
 * @param {Number} x X-Coordinate to start wall at
 * @param {Number} y Y-Coordinate to start wall at
 * @param {Number} z Z-Coordinate to start wall at
 * @param {Number} width The width of the walls
 * @param {Number} height The height of the wall
 * @param {Number} zOffset How far along the Z-Axis to offset the wall
 * @param {Number} normalDirection The direction that the face normal is
 */
function createWallZPlane(x, y, z, width, height, zOffset, normalDirection) {
    return {
        positions: [
            x, y, z + zOffset,
            x + width, y, z + zOffset,
            x + width, y + height, z + zOffset,
            x, y + height, z + zOffset
        ],
        normals: [
            0, 0, normalDirection,
            0, 0, normalDirection,
            0, 0, normalDirection,
            0, 0, normalDirection
        ]
    };
}
/**
 * Creates the vertex positions and normals for a wall in the X-Plane
 * @param {Number} x X-Coordinate to start wall at
 * @param {Number} y Y-Coordinate to start wall at
 * @param {Number} z Z-Coordinate to start wall at
 * @param {Number} width The width of the walls
 * @param {Number} height The height of the wall
 * @param {Number} xOffset How far along the X-Axis to offset the wall
 * @param {Number} normalDirection The direction that the face normal is
 */
function createWallXPlane(x, y, z, width, height, xOffset, normalDirection) {
    return {
        positions: [
            x + xOffset, y, z,
            x + xOffset, y, z + width,
            x + xOffset, y + height, z + width,
            x + xOffset, y + height, z
        ],
        normals: [
            normalDirection, 0, 0,
            normalDirection, 0, 0,
            normalDirection, 0, 0,
            normalDirection, 0, 0
        ]
    };
}

/**
 * Fills the mesh data with the same basic data for every vertex based on the number of vertices already added
 * @param {Mesh} mesh The mesh to add the data to
 * @param {Colour} colour The colour set the colour data
 */
function createColourIndicesData(mesh, colour) {
    for (let i = 0; i < mesh.positions.length / 12; i++) {
        for (let v = 0; v < 4; v++) {
            mesh.colours.push(colour.r, colour.g, colour.b);
        }
        mesh.indices.push(
            i * 4, i * 4 + 1, i * 4 + 2,
            i * 4 + 2, i * 4 + 3, i * 4
        );
    }
}

/**
 * Creates WebGL geometric data (inc VAOs and VBOs) based on 2D layout of the map for the paths
 * @param {WebGLRenderContext} gl The WebGL Context
 * @param {Object} pathData Object containing 2D data about each of the paths
 */
function buildPathGeometry(gl, pathData) {
    const paths = [];

    for (const pathLayout of pathData) {
        const path = new Path(
            pathLayout.x / scaleFactor + halfGap,
            pathLayout.y / scaleFactor + halfGap,
            pathLayout.width / scaleFactor,
            pathLayout.depth / scaleFactor
        );

        const geometry = createFloorQuadGeometry(path.x, 0, path.z, path.width, path.depth);
        path.mesh.positions.push(...geometry.positions);
        path.mesh.normals.push(...geometry.normals);

        createColourIndicesData(path.mesh, new Colour(1, 1, 1));

        path.buffer(gl);
        paths.push(path);
    }
    return paths;
}

/**
 * Creates WebGL geometric data (inc VAOs and VBOs) based on 2D layout of the map for the rooms/shops
 * @param {WebGLRenderContext} gl The WebGL Context
 * @param {Object} roomGeometry Object containing 2D data about each of the rooms
 * @param {Object} roomsData Object containing information about the room ID and their assosiated store IDs
 */
async function buildRoomsGeometry(gl, roomGeometry) {
    const rooms = [];
    const response = await fetch("/api/map/section-data");
    const roomsData = await response.json();
    for (const room of roomGeometry) {
        //Scale the data down
        const x = room.x / scaleFactor + gapSize;
        const z = room.y / scaleFactor + gapSize;
        const roomWidth = room.width / scaleFactor - gapSize;
        const roomDepth = room.depth / scaleFactor - gapSize;

        rooms.push(await createRoomGeometry(gl, room, roomsData, x, z, roomWidth, roomDepth, gapSize));
    }
    return rooms;
}

/**
 * Creates WebGL geometric data for a single room of the map
 * @param {WebGLRenderContext} gl The WebGL render context
 * @param {Object} roomInfo Object to contain info about the room having geometry made for
 * @param {Object} roomsData Object containing info about all rooms
 * @param {Number} x X position of the room
 * @param {Number} z Z position of the room
 * @param {Number} width Width of the room
 * @param {Number} depth Depth of the room
 */
async function createRoomGeometry(gl, roomInfo, roomsData, x, z, width, depth) {
    const roomHeight = roomInfo.height;


    //Contains information about this room, also is return of this function
    const room = new Room(gl, roomInfo.id, x, z, width, depth);

    //Adds normal and vertex data to the mesh
    function addMeshData(geometry) {
        room.mesh.positions.push(...geometry.positions);
        room.mesh.normals.push(...geometry.normals);
    }

    //Create ceiling geometry
    addMeshData(createFloorQuadGeometry(x, roomHeight, z, width, depth));

    //Create inner-wall geometry
    addMeshData(createWallZPlane(x, 0, z, width, roomHeight, -halfGap, -1));
    addMeshData(createWallZPlane(x, 0, z, width, roomHeight, depth + halfGap, 1));
    addMeshData(createWallXPlane(x, 0, z, depth, roomHeight, -halfGap, -1));
    addMeshData(createWallXPlane(x, 0, z, depth, roomHeight, width + halfGap, 1));

    //Calculate the outline wall geometry
    addMeshData(createWallZPlane(x - halfGap, 0, z, halfGap, roomHeight, depth + halfGap, 1));
    addMeshData(createWallZPlane(x + width, 0, z, halfGap, roomHeight, depth + halfGap, 1));
    addMeshData(createWallZPlane(x + width, 0, z, halfGap, roomHeight, -halfGap, -1));
    addMeshData(createWallZPlane(x - halfGap, 0, z, halfGap, roomHeight, -halfGap, -1));
    addMeshData(createWallXPlane(x, 0, z - halfGap, halfGap, roomHeight, -halfGap, 1));
    addMeshData(createWallXPlane(x, 0, z + depth, halfGap, roomHeight, -halfGap, 1));
    addMeshData(createWallXPlane(x, 0, z - halfGap, halfGap, roomHeight, width + halfGap, -1));
    addMeshData(createWallXPlane(x, 0, z + depth, halfGap, roomHeight, width + halfGap, -1));

    //Calculate outline of ceiling geometry
    addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z - halfGap, width + gapSize, halfGap));
    addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z + depth, width + gapSize, halfGap));
    addMeshData(createFloorQuadGeometry(x - halfGap, roomHeight, z - halfGap, halfGap, depth + gapSize));
    addMeshData(createFloorQuadGeometry(x + width, roomHeight, z - halfGap, halfGap, depth + gapSize));

    createColourIndicesData(room.mesh, new Colour(0.8, 0.8, 0.8));

    //Do extra things if the room has an assosiated store
    const index = roomsData.findIndex(shopRoom => {
        return shopRoom.roomId == roomInfo.id;
    })
    if (index > -1) {
        room.storeId = roomsData[index].storeId;
    }
    await room.update();

    return room;
}

/**
 * Generates a grid of terrain tiles
 * @param {WebGLRenderingContext} gl The WebGL context
 * @param {Number} xBegin The X-Coordinate to start the terrain at
 * @param {Number} zBegin The Z-Coordinate to start the terrsain at
 * @param {Number} width The width of the terrain in terrain squares
 * @param {Number} depth The height of the terrain in terrain squares
 * @param {Number} quadSize The width/height of each quad
 */
function makeTerrainMesh(gl, xBegin, zBegin, width, depth, quadSize) {
    const terrain = new Drawable3D();
    const y = -10;
    for (let z = 0; z < depth; z++) {
        for (let x = 0; x < width; x++) {
            terrain.mesh.positions.push(
                x * quadSize - xBegin,
                y + ((z <= 1 || x <= 1 || z >= depth - 2 || x >= width - 2) ? 30 : 1),
                z * quadSize - zBegin);
            terrain.mesh.colours.push(0.2, 0, 0.4);
            terrain.mesh.normals.push(0, 1, 0);
        }
    }

    for (let z = 0; z < depth - 1; z++) {
        for (let x = 0; x < width - 1; x++) {
            const i = x + z * width;
            terrain.mesh.indices.push(
                i, i + width, i + width + 1,
                i + width + 1, i + 1, i
            );
        }
    }
    terrain.buffer(gl);
    return terrain;
}

/*
 * =======================
 *      Shader Programs
 * =======================
 */
const shaders = {
    //Verex and fragment shader for the map
    mapVertex: `#version 300 es
        in vec3 inVertexPosition;
        in vec3 inColour;
        in vec3 inNormal;
        
        out vec3 passColour;
        out vec3 passNormal;
        out vec3 passFragmentPosition;

        uniform mat4 modelMatrix;
        uniform mat4 projViewMatrix;

        void main() {
            gl_Position = projViewMatrix * modelMatrix * vec4(inVertexPosition.xyz, 1.0);
            
            passColour = inColour;
            passNormal = inNormal;
            passFragmentPosition = vec3(modelMatrix * vec4(inVertexPosition, 1.0));
        }`,
    mapFragment: `#version 300 es
        precision highp float;

        in vec3 passColour;
        in vec3 passNormal;
        in vec3 passFragmentPosition;

        out vec4 colour;

        uniform vec3 lightPosition;

        void main() {
            vec3 lightDirection = normalize(lightPosition - passFragmentPosition);
            float diff = max(dot(passNormal, lightDirection), 0.2);
            vec3  finalColour = passColour * diff * 2.0;
            colour = vec4(finalColour.xyz, 1.0);
        }`,
}














//temp

function inputStuff(camera) {
    //TEMP
    const speed = 0.1;
    if (keydown["s"]) {
        camera.position.x += Math.cos(toRadians(camera.rotation.y + 90)) * speed;
        camera.position.z += Math.sin(toRadians(camera.rotation.y + 90)) * speed;
    } else if (keydown["w"]) {
        camera.position.x += -Math.cos(toRadians(camera.rotation.y + 90)) * speed;
        camera.position.z += -Math.sin(toRadians(camera.rotation.y + 90)) * speed;
    }
    if (keydown["a"]) {
        camera.rotation.y -= 1;
    } else if (keydown["d"]) {
        camera.rotation.y += 1;
    }
    if (keydown["p"]) {
        console.log(camera);
    }
    //TEMP
}



const keydown = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
};

/**
 * Sets the key down event for the key pressed to true
 * @param {Event} event The key down event
 */
function handleKeyDown(event) {
    keydown[event.key] = true;
}

/**
 * Sets the key down event for the key pressed to false
 * @param {Event} event The key down event
 */
function handleKeyUp(event) {
    keydown[event.key] = false;
}