
"use strict";

window.addEventListener("load", e => {
    const textElement = document.getElementById("text");
    setInterval(async () => {
        const result = await fetch("/text");
        const text   = await result.text();
        textElement.innerText = text;
    }, 1000);
}); 