"use strict"

const fetch = require('node-fetch');

require('./index'); //Start the server

QUnit.test("1 + 1", assert => {
    assert.deepEqual(1 + 1, 2, "1 + 1 = 2 ?");
});


const URL = 'http://localhost:8080';
const STORE_PATH = URL + "/api/stores/";
const MAP_PATH   = URL + "/api/map/"

async function postJson(url, json) {
    const response = await fetch(url, {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
    })
    return response; await response.json();
}

//========================
//
//   QUint Tests for the store API for the shops
//
//========================

//------------
//
//  POST
//
//------------
/**
 * Testing POST /api/stores/add-store
 */
QUnit.test(
"Stores should be able to be added via POST add-store", 
async assert => {
    //Obfuscated store name as to not conflict with existing stores
    const store = {
        storeName: "cw8jr3rhy3ry3r8y83yxj8yr",
        storeType: "Food/Drink"
    };

    //Test for posting a store
    {
        const response = await postJson(`${STORE_PATH}/add-store`, store);
        const json = await response.json();

        assert.deepEqual(json.success, true, "The post should return successful");

        assert.deepEqual({
            storeName: json.store.name,
            storeType: json.store.type
        },
        store,
        "The respone should return the store that was just added");
    }

    //Test for posting the same store, should not work
    {
        const response = await postJson(`${STORE_PATH}/add-store`, store);
        const json = await response.json();
        
        assert.deepEqual(json.success, false, "The post should return not succesful with the same store name added again");
    }
});



//------------
//
//  GET
//
//------------
/**
 * Testing GET /api/stores/store-info
 */
QUnit.test(
"After adding a store, the information about the store should be able to be recieved via GET store-info?id=<id>", 
async assert => {
    //Obfuscated store name as to not conflict with existing stores
    const store = {
        storeName: "uu8ruv32q8jr8328r2",
        storeType: "Food/Drink"
    };
    //Get store ID after adding a new store
    const response = await postJson(`${STORE_PATH}/add-store`, store);
    const json = await response.json();
    const id = json.store.id;

    const getReqResponse = await fetch(`${STORE_PATH}/store-info?id=${id}`);
    const getReqJson = await getReqResponse.json();
    assert.deepEqual(getReqJson.id, id, "The ID should be the same");
    assert.deepEqual({
        storeName: getReqJson.name,
        storeType: getReqJson.type
    },
    store,
    "The respone should return the store that was just added");
});

//========================
//
//   QUint Tests for the map API
//
//========================
//------------
//
//  POST
//
//------------
QUnit.test(
"Updating room information should return that information",
async assert => {
    const info = {
        roomId: 0,
        storeId: 0
    };

    const response = await postJson(`${MAP_PATH}/room-update`, info);

});