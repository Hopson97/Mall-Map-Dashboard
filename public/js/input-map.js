 "use strict"

let offsetX = 0;
let offsetY = 0;
const keydown = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
};

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
}


window.addEventListener("load", e => {
    const canvas = document.getElementById("map-canvas");
    const ctx = canvas.getContext("2d");

    //Set canvas size based on the size of the device
    if (window.innerWidth >= 1280) {
        canvas.width = 800;
        canvas.height = 800;
        console.log("Desktop");
    }
    else {
        canvas.width = window.innerWidth - window.innerWidth * 0.1;
        canvas.height = canvas.width;
        console.log("Mobile");
    }

    //Setup event listeners
    canvas.addEventListener("click", handleCanvasClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

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
    context.lineWidth = 2;
    context.strokeStyle = "white";

    window.requestAnimationFrame(mainloop);
    function mainloop() {
        handleInput();

        renderer.clear();
        for (let i = 0; i < 10; i++) {
            renderer.renderRect(100 + i * 50, 100, 50, 100);
            renderer.renderRect(100 + i * 50, 300, 50, 100);
        }

        context.stroke();
        window.requestAnimationFrame(mainloop);
    }
}

/**
 * Function for handling keyboard input (if any)
 */
function handleInput() {
    const offset = 5;
    if(keydown["w"]) offsetY -= offset; 
    else if(keydown["s"]) offsetY += offset;

    if(keydown["a"]) offsetX -= offset; 
    else if(keydown["d"]) offsetX += offset; 
}

/**
 * Handles the click event on the canvas
 * @param {Event} e The click event
 */
function handleCanvasClick(e) {
    //Convert the browser coordinates to canvas/world coordinates
    const clientX = e.clientX - e.target.offsetLeft - offsetX;
    const clientY = e.clientY - e.target.offsetTop - offsetY;
    console.log(`${clientX} ${clientY}`);
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