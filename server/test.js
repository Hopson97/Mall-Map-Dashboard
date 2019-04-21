"use strict"

const fetch = require('node-fetch');

require('./index'); //Start the server

const URL = 'http://localhost:8080';

const paths = {
    shop: URL + "/api/shops",
    map: URL +"/api/map",
    commercial: URL +"/api/commercials"
}

//Data that will be used for the testing
const testData = {
    //Used for testing the returns from POST calls
    shop: {
        id: -1,
        item: {
            //Obfuscated shop name as to not conflict with existing shops
            shopName: ",mnbhjxnjufchvruf-0987890p;.auhvwahcf",
            shopType: "Food/Drink"
        }
    },
    commercial: {
        id: -1,
        item: {
            shopId: 1,
            title: "Test title",
            body: "Test body"
        }
    },
    map: {
        id: -1,
        item: {
            roomId: 0,
            shopId: 0
        }
    }
}

/**
 *  ---------------------------------
 *      Test for the generic API
 *  ---------------------------------
 */
function testPostRequestIsSuccess(data, apiPath, keyword) {
    QUnit.test(
        `${keyword}s should be able to be added`,
        async assert => {
            const response = await postRequestJson(`${apiPath}/add`, data.item);
            assert.deepEqual(response.status, 201, "The post request should respond with success");
            const json = await response.json();
            data.id = json.id;
        }
    );
}

function testDeleteIsSuccess(data, apiPath, keyword) {
    QUnit.test(
        `${keyword}s should be able to be deleted`,
        async assert => {
            const response = await deleteRequestJson(`${apiPath}/remove`, {
                id: data.id
            });
            assert.deepEqual(response.status, 204, 
                "The delete function should return HTTP for 204 saying it was a success");
        }
    );
}

function testGetIsFailure(data, apiPath, keyword) {
    QUnit.test(
        `After deletion, the ${keyword.toLowerCase()} should not be able to be found`,
        async assert => {
            const response = await fetch(`${apiPath}/get?id=${data.id}`);
            assert.deepEqual(response.status,
            404,
            "The response should return 404 as the shop was just deleted");
        }
    );
}

/**
 *  ---------------------------------
 *      Test for the shops API
 *  ---------------------------------
 */
const shopArgs = [testData.shop, paths.shop, "Shop"];
testPostRequestIsSuccess(...shopArgs);

QUnit.test(
    "Shops should be able to be recieved",
    async assert => {
        const respone = await fetch(`${paths.shop}/get?id=${testData.shop.id}`);
        const json = await respone.json();
        assert.deepEqual({
            shopName: json.name,
            shopType: json.type
        },
        testData.shop.item,
        "The response should return the shop that was just posted");
    }
); 

QUnit.test(
    "The same shop should not be able to be added again",
    async assert => {
        const response = await postRequestJson(`${paths.shop}/add`, testData.shop.item);
        assert.deepEqual(response.status, 409, "The post request should respond with failure");
    }
);

testDeleteIsSuccess(...shopArgs);
testGetIsFailure(...shopArgs);

/**
 *  ---------------------------------
 *      Test for the commercial API
 *  ---------------------------------
 */
const commercialArgs = [testData.commercial, paths.commercial, "Commercial"];
testPostRequestIsSuccess(...commercialArgs);

QUnit.test(
    "Commercial should be able to be recieved",
    async assert => {
        const respone = await fetch(`${paths.commercial}/get?id=${testData.commercial.id}`);
        const json = await respone.json();
        assert.deepEqual({
            shopId: json.shopId,
            title: json.title,
            body: json.body
        },
        testData.commercial.item,
        "The response should return the shop that was just posted");
    }
)

testDeleteIsSuccess(...commercialArgs);
testGetIsFailure(...commercialArgs);


/**
 *  ---------------------------------
 *      Test for the maps API
 *  ---------------------------------
 */
QUnit.test(
    "Updating room information should return true for success",
    async assert => {
        const response = await postRequestJson(`${paths.map}/add`, testData.map.item);
        assert.deepEqual(response.status, 201, "Should be true for success");
    }
);

QUnit.test(
    "Should be able to delete room",
    async assert => {
        const deleteResponse = await deleteRequestJson(`${paths.map}/remove`, {
            id: testData.map.item.roomId
        });
        assert.deepEqual(deleteResponse.status, 204, "The delete function should return HTTP for 204 saying it was a success");
    }
);


/**
 *  ---------------------------------
 *     Helper Functions/ Utilities
 *  ---------------------------------
 */

 /**
  * Does a post request using JSON as the body
  * @param {String} url The URL to send the post request to
  * @param {Object} json The JSON to send to the URL
  */
async function postRequestJson(url, json) {
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
  * Does a delete request using JSON as the body
  * @param {String} url The URL to send the delete request to
  * @param {Object} json The JSON to send to the URL
  */
async function deleteRequestJson(url, json) {
    const response = await fetch(url, {
        method: "delete",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(json)
    });
    return response;
}