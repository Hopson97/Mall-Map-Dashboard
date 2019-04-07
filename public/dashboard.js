
"use strict";

window.addEventListener("load", e => {
    const textElement = document.getElementById("text");

    const socket = new WebSocket("ws://localhost:8080");
    //socket.send("test");

    socket.addEventListener("message", e => {
        const data = JSON.parse(e.data);
        console.log(data);
        switch(data.type) {
            case "update":
                textElement.innerText = data.text;
                break;
        }
    });
}); 