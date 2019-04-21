"use strict"

/*
 * File to contain common utility functions
 */


module.exports = {
    /**
     * Gets a date with format SS:MM:HH DD/MM/YYYY
     */
    getFormattedDate: () => {
        const date = new Date();

        const days = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        return `${days}/${month}/${year}`;
    },

    /**
     * Gets a date with format DD/MM/YYYY
     */
    getFormattedDateTime: () => {
        const date = new Date();

        const secs = date.getSeconds();
        const mins = date.getMinutes();
        const hours = date.getHours();
        
        return `${hours}:${mins}:${secs} ${getFormattedDate()}`;
    },

    /**
     * Finds the largest ID number in a list of objects
     * @param {Object} list List of objects containing an ID element
     */
    getMaxId(list) {
        if (list.length == 0) {
            return 0;
        }
        return Math.max(...list.map(obj => obj.id));
    }
}