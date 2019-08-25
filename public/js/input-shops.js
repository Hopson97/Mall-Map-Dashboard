"use strict"

import * as lib from './lib/lib.js';
import * as tables from './lib/tables.js';
import {makeTextBox} from './lib/text-box.js';

window.addEventListener("load", async () => {
    await tables.populateTable("/api/shops/list", "/api/shops/remove", addRowCallback);
    document.getElementById("add-store-form")
        .addEventListener("submit", onSubmitShop);

    //Set up the shop name to be a limited character text box
    makeTextBox(
        document.getElementById("shop-name"),
        document.getElementById("shop-name-count"),
        12
    );

    //Populate the category selector
    const select = document.getElementById("shop-type");
    const response = await fetch("/api/categories/list");
    const categories = await response.json();

    for (const category of categories) {
        if (category.name == "None") {
            continue; 
        }
        const optionElement = document.createElement("option");
        optionElement.textContent = category.name;
        optionElement.value = category.id;
        select.appendChild(optionElement);
    }
    document.getElementById("shop-type");
});

async function addRowCallback(shop, cells, row) {
    const response = await fetch("/api/categories/get?id=" + shop.categoryId);
    const categoryInfo = await response.json();

    cells[0].textContent = shop.name;
    cells[1].textContent = categoryInfo.name;
    cells[2].textContent = shop.dateAdded;
}


/**
 * Event handler for when the form is submitted
 * @param {Event} event The submit event
 */
async function onSubmitShop(event) {
    event.preventDefault();
    const shopNameElement = document.getElementById("shop-name");
    const categoryElement = document.getElementById("shop-type");

    const shopName = shopNameElement.value;
    const categoryId = categoryElement.options[categoryElement.selectedIndex].value;

    //Post it to the server
    const response = await lib.postRequestJson("/api/shops/add", {
        shopName, 
        categoryId 
    });

    //If it was added succesfully then update the table
    if (response.status === 201) {
        const shop = await response.json();
        await tables.addTableRow(shop, "/api/shops/remove", addRowCallback);
    }
}