"use strict"

import * as lib from './lib.js'

window.addEventListener("load", async () => {
    await lib.populateTable("/api/commercials/list", "/api/commercials/remove", addRowCallback);
    await createFormData();
    document.getElementById("add-commercial-form")
        .addEventListener("submit", onSubmitCommercial);
});

/**
 * 
 * @param {commercial} commercial The commercial to add
 * @param {[HTMLTableRowElement]} cells The table cells to add
 * @param {[HTMLDivElement]} row The row container to add data to
 */
async function addRowCallback(commercial, cells, row) {
    const response = await fetch(`/api/shops/get?id=${commercial.shopId}`);
    const shopInfo = await response.json();

    cells[0].textContent = shopInfo.name;
    cells[1].textContent = commercial.title;
    cells[2].textContent = commercial.body;
    cells[3].textContent = commercial.dateAdded;
}

async function createFormData() {
    const selectElement = document.getElementById("shop-id-selection");

    const response = await fetch("/api/shops/list");
    const shopList = await response.json();

    for (const shop of shopList) {
        const option = document.createElement("option");
        option.value = shop.id;
        option.textContent = shop.name;
        selectElement.appendChild(option);
    }
}


/**
 * Event handler for when the form is submitted
 * @param {Event} event The submit event
 */
async function onSubmitCommercial(event) {
    event.preventDefault();
    const shopIdElement = document.getElementById("shop-id-selection");
    const titleElement = document.getElementById("commercial-title");
    const bodyElement = document.getElementById("commercial-body");

    const shopId = shopIdElement.options[shopIdElement.selectedIndex].value;
    const title = titleElement.value;
    const body  = bodyElement.value;

    //Post it to the server
    const response = await lib.postRequestJson("/api/commercials/add", {
        shopId, title, body
    });

    //If it was added succesfully then update the table
    if (response.status === 201) {
        const commercial = await response.json();
        await lib.addTableRow(commercial, "/api/commercials/remove", addRowCallback);
    }

}