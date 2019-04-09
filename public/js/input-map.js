 "use strict"

let offsetX = 0;
let offsetY = 0;
const keydown = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
};


class Renderer {
    constructor(canvas, context) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = context;
    }

    clear() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.width, this.height);
    }

    renderRect(x, y, w, h) {
        this.context.strokeRect(x + offsetX, y + offsetY, w, h);
    }
}


window.addEventListener("load", e => {
    const canvas = document.getElementById("map-canvas");
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
    const ctx = canvas.getContext("2d");

    loop(canvas, ctx);

    canvas.addEventListener("click", handleCanvasClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
});

function loop(canvas, context) {
    const renderer = new Renderer(canvas, context);
    context.lineWidth = 2;
    context.strokeStyle = "white";

    window.requestAnimationFrame(mainloop);
    function mainloop() {
        handleInput();

        renderer.clear();
        renderer.renderRect(100, 100, 200, 200);


        context.stroke();
        window.requestAnimationFrame(mainloop);
    }
}

function handleInput() {
    const offset = 5;
    if(keydown["w"]) offsetY -= offset; 
    else if(keydown["s"]) offsetY += offset;

    if(keydown["a"]) offsetX -= offset; 
    else if(keydown["d"]) offsetX += offset; 
}


function handleCanvasClick(e) {
    const clientX = e.clientX - e.target.offsetLeft - offsetX;//.x;
    const clientY = e.clientY - e.target.offsetTop - offsetY;//.y;
    console.log(`${clientX} ${clientY}`);
}

function handleKeyDown(e) {
    keydown[e.key] = true;
}

function handleKeyUp(e) {
    keydown[e.key] = false;
}