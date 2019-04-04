"use strict"

window.addEventListener("load", e => {
    const formElement = document.getElementById("form");
    formElement.addEventListener("submit", async e => {
        e.preventDefault();
        const text = document.getElementById("text-box").value;
        console.log(text);
        await fetch("text", {
            method: "POST",
            headers: {
                'Content-Type':'text/plain'
            },
            body: text
        });
    });
})