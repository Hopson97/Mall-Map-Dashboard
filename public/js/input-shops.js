"use strict"

window.addEventListener("load", async e => {
    await populateTable();

    document.getElementById("add-store-form")
        .addEventListener("submit", onSubmitShop);
});

/**
 * Populates the table with shops that have already been added
 */
async function populateTable() {

    //Get list of shops from server
    const response = await fetch("/api/shops/list");
    const shopList = await response.json();

    //Add the shops
    for (const shop of shopList) {
        addTableRow(shop);
    }
}

/**
 * Adds a row of shop data to the table
 * @param {Object} shop Object containing the shop name, type, and the date it was added
 */
function addTableRow(shop) {
    const shopTable = document.getElementById("shop-table");
    const tableRowTemplate = document.getElementById("row");

    const clone = document.importNode(tableRowTemplate.content, true);
    const cells = clone.querySelectorAll("td");
    cells[0].textContent = shop.name;
    cells[1].textContent = shop.type;
    cells[2].textContent = shop.dateAdded;

    const editButton = clone.querySelector("a");
    editButton.href = `edit-shop?id=${shop.id}`;

    //TODO make it so there is prompt first?
    const deleteButton = clone.querySelectorAll("img")[1];
    deleteButton.addEventListener("click", async () => {
        await fetch("/api/shops/shop", {
            method: "delete",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: shop.id
            })
        });
        location.reload(); //TODO is there a better way?
    });
    shopTable.appendChild(clone);
}

/**
 * Event handler for when the form is submitted
 * @param {Event} event The submit event
 */
async function onSubmitShop(event) {
    event.preventDefault();
    const shopNameElement = document.getElementById("shop-name");
    const typeElement = document.getElementById("shop-type");

    const shopName = shopNameElement.value;
    const shopType = typeElement.options[typeElement.selectedIndex].text;

    //Post it to the server
    const response = await fetch("/api/shops/add-shop", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            shopName, shopType 
        })
    });

    //If it was added succesfully then update the table
    if (response.status === 201) {
        const shop = await response.json();
        console.log(shop);
        addTableRow(shop);
    }

}