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
    console.log(data);
    switch (data.type) {
        case "RoomUpdate":
            console.log("Updating room");
            console.log("room: " + data.roomId);
            console.log("store: " + data.storeId);
            for (const room of objects.rooms) {
                if (room.roomId === data.roomId) {
                    room.storeId = data.storeId;
                    await room.update();
                }
            }
    }
}