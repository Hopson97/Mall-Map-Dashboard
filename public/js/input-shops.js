"use strict"

window.addEventListener("load", async () => {
    await populateTable("/api/shops/list", "/api/shops/remove", addRowCallback);
    document.getElementById("add-store-form")
        .addEventListener("submit", onSubmitShop);
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
    const typeElement = document.getElementById("shop-type");

    const shopName = shopNameElement.value;
    const shopType = typeElement.options[typeElement.selectedIndex].text;

    //Post it to the server
    const response = await postRequestJson("/api/shops/add", {
        shopName, 
        shopType 
    });

    //If it was added succesfully then update the table
    if (response.status === 201) {
        const shop = await response.json();
        console.log(shop);
        await addTableRow(shop, "/api/shops/remove", addRowCallback);
    }

}