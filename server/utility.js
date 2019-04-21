"use strict"

const fs = require("fs");

/*
 * File to contain common utility functions
 */

/**
 * Gets a date with format SS:MM:HH DD/MM/YYYY
 */
function getFormattedDate() {
    const date = new Date();

    const days = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return `${days}/${month}/${year}`;
}

/**
 * Gets a date with format DD/MM/YYYY
 */
function getFormattedDateTime() {
    const date = new Date();

    const secs = date.getSeconds();
    const mins = date.getMinutes();
    const hours = date.getHours();

    return `${hours}:${mins}:${secs} ${getFormattedDate()}`;
}

/**
 * Finds the largest ID number in a list of objects
 * @param {Object} list List of objects containing an ID element
 */
function getMaxId(list) {
    if (list.length == 0) {
        return 0;
    }
    return Math.max(...list.map(obj => obj.id));
}

/**
 * Opens a json file allowing edits via callback, and then rewrites the file
 * @param {String} fileName The JSON data file to edit
 * @param {Function} editCallback The function to edit the JSON file
 */
function editJson(fileName, editCallback) {
    const path = `./server/data/${fileName}`;
    const data = fs.readFileSync(path);
    const json = JSON.parse(data);
    editCallback(json);
    fs.writeFileSync(path, JSON.stringify(json, null, 4));
}

module.exports = {
    getFormattedDate,
    getFormattedDateTime,
    getMaxId,
    editJson
}