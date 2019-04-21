"use strict";

const dashboardStats = {
    commercialCount: 0
}

window.addEventListener("load", async e => {
    //Setup the websocket
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", handleMessage);
    
    initCommercialPanel();

    await begin3DRenderer();
});

/**
 * Handles incoming messages from web socket
 * @param {Event} event The event to handle
 */
async function handleMessage(event) {
    const data = JSON.parse(event.data);
    console.log(`Message received from web socket: ${data}`);
    switch (data.type) {
        case "RoomUpdate":
            for (const room of objects.rooms) {
                if (room.roomId === data.roomId) {
                    room.shopId = data.shopId;
                    await room.update();
                }
            }
            break;

        case "ShopDelete":
            for (const room of objects.rooms) {
                if (room.shopId === data.shopId) {
                    room.shopId = -1;
                    await room.update();
                }
            }
            break;
    }
}

function addCommerical(commercial) {
    const commercials = document.getElementById("commercial-panel");
    const temp = document.getElementById("commercial-template");
    const clone = document.importNode(temp.content, true);
    
    clone.querySelector('h2').textContent = commercial.title;
    clone.querySelector('p').textContent = commercial.body;

    commercials.appendChild(clone);
    dashboardStats.commercialCount++;
}

function addCommericals(commercialList) {
    for (const commercial of commercialList) {
        addCommerical(commercial);
    }
}

async function initCommercialPanel() {
    const response = await fetch("/api/commercials/list");
    const commercialList = await response.json();

    addCommericals(commercialList);
    if (dashboardStats.commercialCount >= 4) {
        addCommericals(commercialList);
        document.getElementById("keyframe").textContent = 
        `
        .commercials-container .commercial {
            animation: commercials-slideshow ${10 + dashboardStats.commercialCount * 1.5}s linear infinite;
        }
        @keyframes commercials-slideshow {
            100% {
                transform: translateX(-${(dashboardStats.commercialCount / 2) * 100}%);
            }
        }
        `
        console.log(`transform: translateX(-${dashboardStats.commercialCount / 2 * 100}%);`)

    }
    else {
        //No animation needed for 4 or less adverts
        document.getElementById("keyframe").textContent = 
        `@keyframes commercials-slideshow {}`
    }
}