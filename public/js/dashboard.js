"use strict";


window.addEventListener("load", async e => {
    //Setup the websocket
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", handleMessage);
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