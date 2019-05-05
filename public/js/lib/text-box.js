"use strict"

/**
 * Sets up a textbox such that the user can type a limited number of characters
 * @param {HTMLElement} textBoxElement The element that the user will be typing in to
 * @param {HTMLElement} counterElement The element that will show how maany characters left to type
 * @param {Number} maxCharacters The maximum characters the user can type into the text box
 */
export function makeTextBox(textBoxElement, counterElement, maxCharacters) {
    const update = _ => counterElement.textContent = `Characters Left: ${maxCharacters - textBoxElement.value.length}`;
    update();
    textBoxElement.addEventListener("input", e => {
        if (maxCharacters - textBoxElement.value.length <= 0) {
            textBoxElement.value = textBoxElement.value.slice(0, maxCharacters);
        }
        update();
    });


}