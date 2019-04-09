 "use strict"

let isMouseDown = false;
let offsetX = 200;
let offsetY = 0;

window.addEventListener("load", e => {
    const canvas = document.getElementById("map-canvas");
    if (window.innerWidth >= 1280) {
        canvas.width = 1000;
        canvas.height = 600;
        console.log("Desktop");
    }
    else {
        canvas.width = window.innerWidth - window.innerWidth * 0.1;
        canvas.height = canvas.width * 2;
        console.log("Mobile");
    }
    const ctx = canvas.getContext("2d");

    loop(canvas, ctx);

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
});

/**
 * The main loop function for drawing the canvas
 * @param {*} canvas The HTML5 canvas element
 * @param {2DRenderingContext} context The context used for drawing
 */
function loop(canvas, context) {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const BG_COLOUR = "black";

    /**
     * 
     */
    function draw() {
        context.fillStyle = BG_COLOUR;
        context.strokeStyle = "white";
        context.fillRect(0, 0, WIDTH, HEIGHT);
        //Set up
        context.lineWidth = 2;
        context.strokeRect(100 + offsetX, 100 + offsetY, 200, 200);
        context.stroke();

        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
}

function handleCanvasClick(e) {
    const clientX = e.clientX - e.target.offsetLeft;//.x;
    const clientY = e.clientY - e.target.offsetTop;//.y;
    console.log(`${clientX} ${clientY}`);
}

function handleMouseDown(e) {
    console.log("Mouse down");
    isMouseDown = true;
}

function handleMouseUp(e) {
    console.log("Mouse up");
    isMouseDown = false;
}

function handleMouseMove(e) {
    
}