"use strict"

window.addEventListener("load", e => {
    const nav = document.getElementById("navbar");

    const addButton = (name, url, image) => {
        const sect = document.getElementById("nav-section");
        const clone = document.importNode(sect.content, true);
        clone.querySelector('a').href = url;
        clone.querySelectorAll('div')[1].textContent = name;

        nav.appendChild(clone);
    };

    addButton("Edit Map", 'input-map');
    addButton("Announcements", 'input-announcements');
    addButton("Add Stores", 'input-stores');
    addButton("Add Adverts", 'input-adverts');
});