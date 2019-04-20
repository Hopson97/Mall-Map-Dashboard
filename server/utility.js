"use strict"

/*
 * File to contain common utility functions
 */


module.exports = {
    /**
     * Gets a date with format SS:MM:HH DD-MM-YYYY
     */
    getFormattedDate: () => {
        const date = new Date();

        const secs = date.getSeconds();
        const mins = date.getMinutes();
        const hours = date.getHours();

        const days = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        return `${hours}:${mins}:${secs} ${days}-${month}-${year}`;
    }
}