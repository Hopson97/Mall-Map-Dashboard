"use strict"

window.addEventListener("load", e => {
    const nav = document.getElementById("navbar");


    const addButton = (name, url, image) => {
        const sect = document.getElementById("nav-section");
        const clone = document.importNode(sect.content, true);
        const anchor = clone.querySelector('a');
        const divs = clone.querySelectorAll('div');
        const img  = clone.querySelector("img");
        img.src = image;
        anchor.href = url;
        divs[1].textContent = name;

        nav.appendChild(clone);
    };

    addButton("Map Editor", 'input-map', 'img/nav-map.png');
    addButton("Shop Editor", 'input-shops', 'img/nav-shop.png');
    addButton("Commercial Edtior", 'input-commercials', 'img/nav-commercial.png');
    addButton("Announcement Editor", 'input-announcements', 'img/nav-map.png');
    addButton("View Dashboard", 'dashboard', 'img/nav-dashboard.png');
});