"use strict";

window.addEventListener("load", e => {
    

    const socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("message", handleMessage);
}); 


function handleMessage (event) {
    const data = JSON.parse(event.data);
    console.log(data);
    switch(data.type) {

    }
}