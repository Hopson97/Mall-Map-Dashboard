"use strict";

import {removeAllChildren}  from './lib/lib.js';
import {Colour}             from './lib/colour.js';
import {populateTable}      from './lib/tables.js';
import {begin3DRenderer, 
        getObjects}         from './dashboard-3d-panel.js';

const dashboardStats = {
    commercialCount: 0
}

window.addEventListener("load", async e => {
    //Setup the websocket
    const socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("message", handleMessage);

    await initCommercialPanel();
    await initLegendPanel();
    await begin3DRenderer();
});


/**
 * Handles incoming messages from web socket
 * @param {Event} event The event to handle
 */
async function handleMessage(event) {
    const data = JSON.parse(event.data);
    const objects = getObjects();

    /**
     * Updates a room using the roomID as a search query, giving it the new shop id
     * @param {Number} roomId The room ID to search for
     * @param {Number} shopID The shop ID to search for
     */
    async function updateRooms(roomId, shopID) {
        for (const room of objects.rooms) {
            if (room.roomId  === roomId) {
                room.shopId = shopID;
                await room.update();
                break;
            }
        }
    }
    switch (data.type) {
        case "RoomUpdate":
            await updateRooms(data.roomId, data.shopId);
            break;

        case "RoomRemove":
            await updateRooms(data.roomId, -1);
            break;

        case "ShopDelete":
            await initCommercialPanel();
            for (const room of objects.rooms) {
                if (room.shopId === data.shopId) {
                    room.shopId = -1;
                    await room.update();
                }
            }
            break;

        case "CommercialUpdate":
            await initCommercialPanel();
            break;
    }
}

/*
=====================================
    Commercial Panel
=====================================
*/
async function addCommerical(commercial) {
    const commercials = document.getElementById("commercial-panel");
    const temp = document.getElementById("commercial-template");
    const clone = document.importNode(temp.content, true);

    const response = await fetch("/api/shops/get?id=" + commercial.shopId);
    const shopInfo = await response.json();

    clone.querySelector('h1').textContent = shopInfo.name;
    clone.querySelector('h2').textContent = commercial.title;
    clone.querySelector('h2').textContent = commercial.title;
    clone.querySelector('p').textContent = commercial.body;

    commercials.appendChild(clone);
    dashboardStats.commercialCount++;
}

/**
 * Adds the commericals to the commerical panel
 * @param {Object[]} commercialList The list of commericals to add
 */
async function addCommericals(commercialList) {
    for (const commercial of commercialList) {
        await addCommerical(commercial);
    }
}

/**
 * Sets up the data for the commerical panel and sets up the animations for the adverts
 */
async function initCommercialPanel() {
    dashboardStats.commercialCount = 0;
    removeAllChildren(document.getElementById("commercial-panel"));
    const response = await fetch("/api/commercials/list");
    const commercialList = await response.json();

    await addCommericals(commercialList);
    //If there are more than 4 commercials, then it means they go 
    //past screen width, hence needs to scroll animation to see all of them,
    if (dashboardStats.commercialCount > 4) {
        addCommericals(commercialList);
        //Set up the scrolling animation times and speed based on number of elements added
        document.getElementById("keyframe").textContent =
        `
        .commercials-container .commercial {
            animation: commercials-slideshow ${10 + dashboardStats.commercialCount * 2.5}s linear infinite;
        }
        @keyframes commercials-slideshow {
            100% {
                transform: translateX(-${(dashboardStats.commercialCount ) * 100}%);
            }
        }
        `;
    } else {
        //No animation needed for 4 or less adverts
        document.getElementById("keyframe").textContent =
            `@keyframes commercials-slideshow {}`
    }
}

/*
=====================================
    Legnd/Title panel
=====================================
*/

/**
 * Inits the legend/title panel (left side)
 */
async function initLegendPanel() {
    updateTime();

    //Updates the time every 15s (4 times minute)
    setInterval(updateTime, 15000);

    populateTable("/api/categories/list", null, (item, cells) => {
        cells[0].style.background = new Colour(...item.colour).asCSSString();
        cells[1].textContent = item.name;
    }, false);


}


/**
 * Updates the time display 
 */
function updateTime() {
    const days = [
        "Monday", "Tuesday", "Wednessday", "Thursday", "Friday",
        "Saturday", "Sunday"
    ];
    const months = [
        "January", "February", "March", "April", 
        "May", "June", "July", "August", "September", 
        "October", "November",  "December"
    ]

    const dateElement = document.getElementById("date");
    const timeElement = document.getElementById("time");

    const date = new Date();
    const day = date.getDay();
    const dayN = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const hour = date.getHours();
    const mins = date.getMinutes();

    dateElement.textContent = `${days[day]} ${dayN} ${months[month]} ${year}`;
    timeElement.textContent = `${hour}:${mins < 10 ? "0" + mins : mins}`;
}