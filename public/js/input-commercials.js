"use strict"

window.addEventListener("load", async () => {
    await populateTable("/api/commercials/list", addRowCallback);
});

async function addRowCallback(commercial, cells, row) {
    const response = await fetch(`/api/shops/info?id=${commercial.shopId}`);
    const shopInfo = await response.json();

    cells[0].textContent = shopInfo.name;
    cells[1].textContent = commercial.title;
    cells[2].textContent = commercial.body;
    cells[3].textContent = commercial.dateAdded;
}