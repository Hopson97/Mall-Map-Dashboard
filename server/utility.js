"use strict"

/*
 * File to contain common utility functions
 */

 /**
  * Gets a date with format SS:MM:HH DD-MM-YYYY
  */
function getFormattedDate() {
    const date = new Date();

    const secs = date.getSeconds();
    const mins = date.getMinutes();
    const hours = date.getHours();

    const days = date.getDate();
    const month = date.getMonth();
    const year  = date.getFullYear();

    return `${secs}:${mins}:${hours} ${days}-${month}-${year}`;
}