"use strict"

window.addEventListener("load", e => {
    const nav = document.getElementById("navbar");

    let count = 0;
    const addButton = (name, url, isLast, image) => {
        const sect = document.getElementById("nav-section");
        const clone = document.importNode(sect.content, true);
        const anchor = clone.querySelector('a');
        const divs = clone.querySelectorAll('div');
        anchor.href = url;
        divs[1].textContent = name;
        if (count == 0) {
            anchor.classList.add("left-most");
        }
        else if (isLast) {
            anchor.classList.add("right-most");
        }
        count++;
        nav.appendChild(clone);
    };

    addButton("Map Editor", 'input-map', false);
    addButton("Shop Editor", 'input-shops', false);
    addButton("Commercial Edtior", 'input-commercials', false);
    addButton("Announcement Editor", 'input-announcements', false);
    addButton("View Dashboard", 'dashboard', true);
});