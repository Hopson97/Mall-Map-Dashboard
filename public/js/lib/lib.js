"use strict"

/**
 * This file is for general common utility functions and classes
 */

/**
 * Gets the width of the browser's inner window 
 */
export function getBrowserWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

/**
 * Gets the height of the browser's inner window 
 */
export function getBrowserHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
}

/**
 * Sends JSON to server using the URL as a post request
 * @param {String} url The ulr of the post request
 * @param {Object} json The object to send to the post reuquest location    
 */
export async function postRequestJson(url, json) {
    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(json)
    });
    return response;
}

/**
 * Sends JSON to server using the URL as a delete request
 * @param {String} url The ulr of the delete request
 * @param {Object} json The object to send to the post reuquest location    
 */
export async function deleteRequestJson(url, json) {
    const response = await fetch(url, {
        method: "delete",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(json)
    });
    return response;
}

/**
 * Removes all child nodes from node
 * @param {HTMLElement} node The node to delete children from
 */
export function removeAllChildren(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}