"use strict"

let offsetX = 10;
let offsetY = 10;
const PAN_SPEED = 4;

//Keys currently pressed
const keydown = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
};

//Arrow buttons on screen; false meaning they are not being pressed
const buttonPressed = {
    'up': false,
    'down': false,
    'left': false,
    'right': false
}

//Object to store map data
const mapData = {} 

//The highlighted room currently being edited 
let selectedStore = -1; 

/**
 * Class to abstract the rendering of the map
 * It uses the offset vector to draw objects in the correct location
 */
class Renderer {
    /**
     * Constructs the Renderer object
     * @param {Canvas} canvas The canvas for the renderer to draw onto
     * @param {2DRenderingContext} context The context used for rendering
     */
    constructor(canvas, context) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = context;
    }

    /**
     * Clears the canvas to full black
     */
    clear() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Draws a rectangle to the canvas
     * @param {Number} x The world-x coordinate to draw the rectangle to
     * @param {Number} y The world y-coordinate to draw the rectangle to
     * @param {Number} w The width of the rectangle
     * @param {Number} h The height of the rectangle
     */
    renderRect(x, y, w, h) {
        this.context.strokeRect(x + offsetX, y + offsetY, w, h);
        this.context.fillRect(x + offsetX, y + offsetY, w, h);
    }
} //Class renderer


window.addEventListener("load", async () => {
    const canvas = document.getElementById("map-canvas");
    console.log(canvas);
    const ctx = canvas.getContext("2d");
    //Set canvas size based on the size of the device
    if (window.innerWidth >= 1280) {
        //Canvas fills 70% of window
        canvas.width = window.innerWidth * 0.7;
        canvas.height = window.innerHeight * 0.7;
    } else {
        canvas.width = window.innerWidth * 0.6;
        canvas.height = canvas.width;
    }

    /*
        Event listener setup
    */
    //Setup input for the canvas
    canvas.addEventListener("click", handleCanvasClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    /**
     * Sets up one of the input buttons to allow for touch controls
     * @param {HTMLImageElement} element The image to add the event listener to
     * @param {String} direction The direction the arrow is pointing in
     */
    function setUpButton(element, direction) {
        element.addEventListener("mousedown", () => buttonPressed[direction] = true);
        element.addEventListener("mouseup", () => buttonPressed[direction] = false);
        element.addEventListener("mouseout", () => buttonPressed[direction] = false);
        element.addEventListener("touchstart", () => buttonPressed[direction] = true);
        element.addEventListener("touchend", () => buttonPressed[direction] = false);
    }

    setUpButton(document.getElementById("up-arrow"), 'up');
    setUpButton(document.getElementById("left-arrow"), 'left');
    setUpButton(document.getElementById("right-arrow"), 'right');
    setUpButton(document.getElementById("down-arrow"), 'down');

    //Build various DOM sections and initilize some data
    buildStoreDOM();
    await initMapData();

    //Begin the main loop
    loop(canvas, ctx);
});

async function initMapData() {
    const geometry = getMallLayout();
    mapData.rooms = geometry.rooms;
    mapData.paths = geometry.paths;
    mapData.bounds = geometry.bounds;

    const response = await fetch("api/map/sect-data");
    const json = await response.json();

    for (const roomData of json) {
        for (const room of mapData.rooms) {
            if (room.id == roomData.id) {
                room.name = roomData.name;
                room.type = roomData.type;
            }
        }
    }

    console.log(json);
}

/**
 * The main loop for drawing the map/ animations
 * @param {Canvas} canvas The canvas to draw onto
 * @param {2DRenderingContext} context The context used for drawing onto the canvas
 */
function loop(canvas, context) {
    const renderer = new Renderer(canvas, context);
    context.lineWidth = 2;
    context.strokeStyle = "white";
    mapData.width = canvas.width;
    mapData.height = canvas.height;

    window.requestAnimationFrame(mainloop);

    function mainloop() {
        handleInput();
        renderer.clear();

        for (const room of mapData.rooms) {
            if (selectedStore.id == room.id) {
                context.fillStyle = "lime";
            }
            else {
                context.fillStyle = typeToColour(room.type);
            }
            renderer.renderRect(room.x, room.y, room.width, room.height);
        }
        context.fillStyle = "white";
        for (const path of mapData.paths) {
            renderer.renderRect(path.x, path.y, path.width, path.height);
        }
        context.stroke();
        context.fill();
        window.requestAnimationFrame(mainloop);
    }
}

/**
 * Function for handling keyboard input (if any)
 */
function handleInput() {
    if (keydown["w"] || buttonPressed.up) {
        offsetY -= PAN_SPEED;
    } else if (keydown["s"] || buttonPressed.down) {
        offsetY += PAN_SPEED;
    }

    if (keydown["a"] || buttonPressed.left) {
        offsetX -= PAN_SPEED;
    } else if (keydown["d"] || buttonPressed.right) {
        offsetX += PAN_SPEED;
    }

    //Prevent out of bounds of world
    offsetX = Math.min(offsetX, mapData.width - 10);
    offsetX = Math.max(offsetX, -mapData.bounds.maxX + 10);

    offsetY = Math.min(offsetY, mapData.height - 10);
    offsetY = Math.max(offsetY, -mapData.bounds.maxY + 10);
}


/**popup.style.display = block;
 * Handles the click event on the canvas
 * @param {Event} event The click event
 */
function handleCanvasClick(event) {
    //Convert the browser coordinates to canvas/world coordinates
    const x = event.clientX - event.target.offsetLeft - offsetX;
    const y = event.clientY - event.target.offsetTop - offsetY;
    for (const room of mapData.rooms) {
        if (x > room.x && x < room.x + room.width && y > room.y && y < room.y + room.height) {
            console.log(`Room clicked: ${room.id}`);
            const popup = document.getElementById("popup");
            popup.classList.remove("hidden");
            selectedStore = room; 
        }
    }
}

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

async function buildStoreDOM() {
    const storeList = document.getElementById("store-list");
    const storeListSect = document.getElementById("store-list-section");
    const response = await fetch("/api/stores/list");
    const json     = await response.json();
    for (const store of json) {
        const clone = document.importNode(storeListSect.content, true);
        const container = clone.querySelector("div");
        const contentElements = clone.querySelectorAll('p');
        contentElements[0].textContent = store.name;
        contentElements[2].textContent = store.type;

        //Listens for the click event on the buttons
        container.addEventListener("click", async () => {
            const data = {
                name: store.name,
                type: store.type,
                id: selectedStore.id
            };
            const response = await fetch("api/map/sect-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const success = await response.text();
            if (success) {
                selectedStore.type = data.type;
                selectedStore = -1;
                const popup = document.getElementById("popup");
                popup.classList.add("hidden");
            }
        });
        storeList.append(clone);
    }
}