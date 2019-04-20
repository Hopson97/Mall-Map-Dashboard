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

        const days = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();

        return `${days}/${month}/${year}`;
    },

    getFormattedDateTime: () => {
        const date = new Date();

        const secs = date.getSeconds();
        const mins = date.getMinutes();
        const hours = date.getHours();
        
        return `${hours}:${mins}:${secs} ${getFormattedDate()}`;
    }
}