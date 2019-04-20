"use strict"

window.addEventListener("load", async e => {
    await populateTable();
});

async function populateTable() {
    const storeTable = document.getElementById("store-table");

    //Get list of stores from server
    const response = await fetch("/api/stores/list");
    const storeList = await response.json();
    
    //Create table from the store list
    const tableRowTemplate = document.getElementById("row");
    for (const store of storeList) {
        const clone = document.importNode(tableRowTemplate.content, true);
        const cells = clone.querySelectorAll("td");
        cells[0].textContent = store.name;
        cells[1].textContent = store.type;
        cells[2].textContent = store.dateAdded;

        const editButton = clone.querySelector("a");
        editButton.href = `edit-store?id=${store.id}`;

        //TODO make it so there is prompt first?
        const deleteButton = clone.querySelectorAll("img")[1];
        deleteButton.addEventListener("click", async() => {
            const response = await fetch("/api/stores/store", {
                method: "delete",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id: store.id})
            })
        });


        
        storeTable.appendChild(clone);
    }
}