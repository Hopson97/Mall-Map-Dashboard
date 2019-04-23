"use strict"

/**
 * This file is for general common utility functions and classes
 */

/**
 * Represents a RGB colour value
 */
class Colour {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    
    /**
     * Converts the RGB into an array
     */
    asArray() {
        return [
            this.r, this.g, this.b
        ]
    }

    /**
     * Normalises the colours so they are between 0.0 and 1.0
     * This is for use with WebGL2
     */
    asNormalised() {
        return new Colour(
            this.r / 255, this.g / 255, this.b / 255
        );
    }

    /**
     * Converts the RGB value into CSS String with the format 'rgb(r, g, b)
     */
    asCSSString() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }
}

/**
 * Gets the width of the browser's inner window 
 */
function getBrowserWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

/**
 * Gets the height of the browser's inner window 
 */
function getBrowserHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
}


/**
 * Populates a table using a list of items from a URL
 * @param {String} listUrl The URL where a list of item can be recieved via GET
 * @param {Function} callback The function to call to update table (item, tableCells, rowTemplateClone)
 */
async function populateTable(listUrl, deleteUrl, callback) {
    //Get list of something from server
    const response = await fetch(listUrl);
    const list = await response.json();

    //Add the shops
    console.log(list);
    for (const item of list) {
        addTableRow(item, deleteUrl, callback);
    }
}

/**
 * Adds a row to a table using the callback, inputting an item
 * @param {The item to add to the table} item 
 * @param {Function} callback The function to call to update table (item, tableCells, rowTemplateClone)
 */
async function addTableRow(item, deleteUrl, callback) {
    const table = document.getElementById("table");
    const rowTemplate  = document.getElementById("row");
    const rowClone = document.importNode(rowTemplate.content, true);
    const cells = rowClone.querySelectorAll("td");

    await callback(item, cells, rowClone);

    //Handle the row being deleted
    const deleteButton = rowClone.querySelector("img");
    deleteButton.addEventListener("click", async () => {
        deleteRequestJson(deleteUrl, {
            id: item.id
        });
        //Remove row from table
        const row = deleteButton.parentNode.parentNode;
        const table = row.parentNode;
        table.removeChild(row);
    });

    table.appendChild(rowClone);
}

/**
 * Sends JSON to server using the URL as a post request
 * @param {String} url The ulr of the post request
 * @param {Object} json The object to send to the post reuquest location    
 */
async function postRequestJson(url, json) {
    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(json)
    });
    return response;
}

/**
 * Sends JSON to server using the URL as a delete request
 * @param {String} url The ulr of the delete request
 * @param {Object} json The object to send to the post reuquest location    
 */
async function deleteRequestJson(url, json) {
    const response = await fetch(url, {
        method: "delete",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(json)
    });
    return response;
}

/**
 * Removes all child nodes from node
 * @param {HTMLElement} node The node to delete children from
 */
function removeAllChildren(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}