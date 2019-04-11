"use strict"
let offsetX = 10;
let offsetY = 10;
const PAN_SPEED = 5;
const keydown = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
};
const buttonPressed = {
    'up': false,
    'down': false,
    'left': false,
    'right': false
}

const mapData = {
    geometry: []
}
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
    }
} //Class renderer


window.addEventListener("load", e => {
    const canvas = document.getElementById("map-canvas");
    console.log(canvas);
    const ctx = canvas.getContext("2d");
    //Set canvas size based on the size of the device
    if (window.innerWidth >= 1280) {
        //Canvas fills 80% of window
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
    } else {
        canvas.width = window.innerWidth - window.innerWidth * 0.3;
        canvas.height = canvas.width;
    }
    //Setup event listeners
    canvas.addEventListener("click", handleCanvasClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

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

    //Begin the main loop
    loop(canvas, ctx);
});

/**
 * The main loop for drawing the map/ animations
 * @param {Canvas} canvas The canvas to draw onto
 * @param {2DRenderingContext} context The context used for drawing onto the canvas
 */
function loop(canvas, context) {
    const renderer = new Renderer(canvas, context);
    mapData.geometry = getRooms();
    context.lineWidth = 2;
    context.strokeStyle = "white";
    window.requestAnimationFrame(mainloop);

    function mainloop() {
        handleInput();
        renderer.clear();
        for (const room of mapData.geometry) {
            renderer.renderRect(room.x, room.y, room.width, room.height);
        }
        context.stroke();
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
}

/**
 * Handles the click event on the canvas
 * @param {Event} e The click event
 */
async function handleCanvasClick(e) {
        //Convert the browser coordinates to canvas/world coordinates
        const x = e.clientX - e.target.offsetLeft - offsetX;
        const y = e.clientY - e.target.offsetTop - offsetY;
        for (const room of mapData.geometry) {
            if (x > room.x && x < room.x + room.width && y > room.y && y < room.y + room.height) {
                console.log(`Room clicked: ${room.id}`);
                const popup = document.getElementById("store-select-popup");
                //popup.style.display = block;
                /*
                const response = await fetch("/api/stores/list");
                const data     = await response.json();
                console.log(data);
                */
                const data = {
                    name: "Game",
                    type: "Entertainment",
                    id: room.id
                }
                const response = await fetch("api/map/sect-data", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });
                }
            }
        }

        /**
         * Sets the key down event for the key pressed to true
         * @param {Event} e The key down event
         */
        function handleKeyDown(e) {
            keydown[e.key] = true;
        }

        /**
         * Sets the key down event for the key pressed to false
         * @param {Event} e The key down event
         */
        function handleKeyUp(e) {
            keydown[e.key] = false;
        }