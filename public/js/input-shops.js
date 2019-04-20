"use strict"

window.addEventListener("load", async e => {
    await populateTable();
});

async function populateTable() {
    const shopTable = document.getElementById("shop-table");

    //Get list of shops from server
    const response = await fetch("/api/shops/list");
    const shopList = await response.json();
    
    //Create table from the shop list
    const tableRowTemplate = document.getElementById("row");
    for (const shop of shopList) {
        const clone = document.importNode(tableRowTemplate.content, true);
        const cells = clone.querySelectorAll("td");
        cells[0].textContent = shop.name;
        cells[1].textContent = shop.type;
        cells[2].textContent = shop.dateAdded;

        const editButton = clone.querySelector("a");
        editButton.href = `edit-shop?id=${shop.id}`;

        //TODO make it so there is prompt first?
        const deleteButton = clone.querySelectorAll("img")[1];
        deleteButton.addEventListener("click", async() => {
            await fetch("/api/shops/shop", {
                method: "delete",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id: shop.id})
            });
            location.reload(); //TODO is there a better way?
        });


        
        shopTable.appendChild(clone);
    }
}