"use strict"

/**
 * This file is for general common utility functions and classes
 */

/**
 * Gets the width of the browser's inner window 
 */
export function getBrowserWidth() {
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
export function getBrowserHeight() {
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
export async function populateTable(listUrl, deleteUrl, callback, supportMobile = true) {
    //Get list of something from server
    const response = await fetch(listUrl);
    const list = await response.json();

    for (const item of list) {
        addTableRow(item, deleteUrl, callback, supportMobile);
    }
}

/**
 * Gets a list of table header names as an array of String
 */
export function getTableTitles() {
    const rowNamesEle = document.getElementById("table-rows");
    const nodes = rowNamesEle.childNodes;
    const rowNames = [];
    for (const index in nodes) {
        if (index % 2 == 1) {
            rowNames.push(nodes[index].textContent);
        }
    }
    return rowNames;
}

export function createDeleteButton() {
    const image = document.createElement("img");
    image.class = "grow-icon";
    image.src = "img/bin.png"
    return image;
}

/**
 * Creates a mobile friendly version of the table row
 * @param {HTMLTdElement[]} cells List of cells of the table row
 */
function createMobileRow(item, cells, deleteUrl, deleteButtonFromTable) {

    const mobileTable = document.getElementById("mobile-table");
    const rowNames = getTableTitles();

    const container = document.createElement("div");
    const innerContainer = document.createElement("div"); 

    // Create the header
    const header    = document.createElement("div");
    const dropdown  = document.createElement("img");
    const conTitle = document.createElement("h3");
    const delButton = createDeleteButton();
                
    header.classList.add("mtr-header");
    dropdown.src = "img/dropdown.png"
    dropdown.classList.add("quick-transition");
    conTitle.textContent = `${rowNames[0]}: ${cells[0].textContent}`;
             
    header.appendChild(dropdown);
    header.appendChild(conTitle);
    header.appendChild(delButton);
    

    //Popualte
    for (let i = 1; i < cells.length - 1; i++) {
        const rowContainer = document.createElement("div");
        const title = document.createElement("h3");
        const content = document.createElement("p");

        title.textContent = rowNames[i];
        content.textContent = cells[i].textContent;

        title.classList.add("mtr-row-title");

        rowContainer.appendChild(title);
        rowContainer.appendChild(content);
        innerContainer.appendChild(rowContainer);
    }

    //Finishing touches
    container.append(header);
    container.appendChild(innerContainer);
    mobileTable.appendChild(container);

    container.classList.add("mtr-container");
    innerContainer.classList.add("hidden");
    innerContainer.classList.add("mtr-inner-container");

    //Setup event listeners
    dropdown.addEventListener("click", e => {
        innerContainer.classList.toggle("hidden");
        dropdown.classList.toggle("flip");
    });

    delButton.addEventListener("click", () => {
        container.parentNode.removeChild(container);
        deleteRequestJson(deleteUrl, {
            id: item.id
        });
        const row = deleteButtonFromTable.parentNode.parentNode;
        const table = row.parentNode;
        table.removeChild(row);
    });

    return container;
}

/**
 * Adds a row to a table using the callback, inputting an item
 * @param {The item to add to the table} item 
 * @param {Function} callback The function to call to update table (item, tableCells, rowTemplateClone)
 */
export async function addTableRow(item, deleteUrl, callback, supportMobile = true) {
    const table = document.getElementById("table");
    const rowTemplate = document.getElementById("row");
    const rowClone = document.importNode(rowTemplate.content, true);
    const cells = rowClone.querySelectorAll("td");

    await callback(item, cells, rowClone);
    let mobileContainer;
    let deleteButton;
    if (deleteUrl) { 
        deleteButton = rowClone.querySelector("img");
    }
    if (supportMobile) {
        mobileContainer = createMobileRow(item, cells, deleteUrl, deleteButton);
    }
    //Handle the row being deleted
    if (deleteUrl) {
        deleteButton.addEventListener("click", async () => {
            deleteRequestJson(deleteUrl, {
                id: item.id
            });
            //Remove row from table
            const row = deleteButton.parentNode.parentNode;
            const table = row.parentNode;
            table.removeChild(row);

            if(mobileContainer) {
                mobileContainer.parentNode.removeChild(mobileContainer);
            }
        });
    }
    table.appendChild(rowClone);
}

/**
 * Sends JSON to server using the URL as a post request
 * @param {String} url The ulr of the post request
 * @param {Object} json The object to send to the post reuquest location    
 */
export async function postRequestJson(url, json) {
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
export async function deleteRequestJson(url, json) {
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
export function removeAllChildren(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}