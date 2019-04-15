"use strict"

window.addEventListener("load", async e => {
    const storeTable = document.getElementById("store-table");

    const response = await fetch("/api/stores/list");
    const storeList = await response.json();
    console.log(storeList);

    const tableRowTemplate = document.getElementById("row");
    for (const store of storeList) {
        const name = store.name;
        const type = store.type;

        const clone = document.importNode(tableRowTemplate.content, true);
        const cells = clone.querySelectorAll("td");
        cells[0].textContent = name;
        cells[1].textContent = type;
        
        storeTable.append(clone);
    }
});