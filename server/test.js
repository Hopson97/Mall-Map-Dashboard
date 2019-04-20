"use strict"

const fetch = require('node-fetch');

require('./index'); //Start the server

const URL = 'http://localhost:8080';
const SHOP_PATH = URL + "/api/shops";
const MAP_PATH = URL + "/api/map"

async function postJson(url, json) {
    const response = await fetch(url, {
        method: "post",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
    })
    return response;
}

//========================
//
//   QUint Tests for the shop API for the shops
//
//========================

/**
 * Testing POST /api/shops/add-shop
 */
QUnit.test(
    "shops should be able to be added via POST add-shop",
    async assert => {
        //Obfuscated shop name as to not conflict with existing shops
        const shop = {
            shopName: "xnjufchvrufchwaufhwauhwauhvwahcf",
            shopType: "Food/Drink"
        };

        //Test for posting a shop
        {
            const response = await postJson(`${SHOP_PATH}/add-shop`, shop);
            const json = await response.json();

            assert.deepEqual(response.status, 201, "The post should return successful");

            assert.deepEqual({
                    shopName: json.name,
                    shopType: json.type
                },
                shop,
                "The respone should return the shop that was just added");
        }

        //Test for posting the same shop, should not work
        {
            const response = await postJson(`${SHOP_PATH}/add-shop`, shop);
            assert.deepEqual(response.status, 409, "The post should return not succesful with the same shop name added again");
        }
    });


let shopId;
/**
 * Testing GET /api/shops/shop-info
 */
QUnit.test(
    "After adding a shop, the information about the shop should be able to be recieved via GET shop-info?id=<id>",
    async assert => {
        //Obfuscated shop name as to not conflict with existing shops
        const shop = {
            shopName: "kjdsfcjdwakjrcwarkuwar",
            shopType: "Food/Drink"
        };
        //Get shop ID after adding a new shop
        const response = await postJson(`${SHOP_PATH}/add-shop`, shop);
        const json = await response.json();
        shopId = json.id;

        const getReqResponse = await fetch(`${SHOP_PATH}/shop-info?id=${shopId}`);
        const getReqJson = await getReqResponse.json();
        assert.deepEqual(getReqJson.id, shopId, "The ID should be the same");
        assert.deepEqual({
                shopName: getReqJson.name,
                shopType: getReqJson.type
            },
            shop,
            "The respone should return the shop that was just added");
    });

/**
 * Testing DELETE /api/shops/shop
 */
QUnit.test(
    "shops should be able to be deleted",
    async assert => {
        //Obfuscated shop name as to not conflict with existing shops
        const shop = {
            shopName: "afgdhtdfylkujyhtgrfsdf",
            shopType: "Food/Drink"
        };
        //Get shop ID after adding a new shop
        const response = await postJson(`${SHOP_PATH}/add-shop`, shop);
        const json = await response.json();
        const shopId = json.id;
        //Test the delete request
        const deleteResponse = await fetch(`${SHOP_PATH}/shop`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: shopId
            })
        });

        assert.deepEqual(deleteResponse.status, 204, "The delete function should return HTTP for 204 saying it was a success");

        //Should no longer be able to find the shop
        {
            const response = await fetch(`${SHOP_PATH}/shop-info?id=${shopId}`);
            assert.deepEqual(response.status, 404, "The shop should not be able to be found");
        }
    });
/**
 * Test posting and getting adverts
 *
QUnit.test(
    "API should allow for the posting and recieving of adverts for shops",
    async assert => {
        const advert = {
            shopId: shopId,
            title: "50% OFF!",
            body: "ONLY FOR A LIMITED TIME GET 50% OFF ALL ITEMS AT shop"
        };

        let advertId;
        //Testing for POST /api/shops/add-advert
        {
            const response = await postJson(`${SHOP_PATH}/add-advert`, advert);
            const json = await response.json();
            advertId = json.id;
            assert.deepEqual(response.status, 201, "Should return HTTP 201 for a sucessful post");
            assert.deepEqual({
                    shopId: json.shopId,
                    title: json.title,
                    body: json.body
                },
                advert,
                "The returned advert should contain same info as the one posted");
        }
        //Testing for GET /api/shops/get-advert?id=advertId
        {
            const response = await fetch(`${SHOP_PATH}/get-advert?id=${advertId}`);
            const json = await response.json();
            assert.deepEqual(response.status, 200, "Should be able to find the advert just posted");
            assert.deepEqual({
                    shopId: json.shopId,
                    title: json.title,
                    body: json.body
                },
                advert,
                "Should be able to find advert that contains the same info as the one posted");
        }

        //Testing for GET /api/shops/get-advert?id=advertId invalid case
        {
            const response = await fetch(`${SHOP_PATH}/get-advert?id=${-50}`);
            assert.deepEqual(response.status, 404, "Should not be able to find advert with invalid id");
        }
    });
*/

//========================
//
//   QUint Tests for the map API
//
//========================
QUnit.test(
    "Updating room information should return true for success",
    async assert => {
        const info = {
            roomId: 0,
            shopId: 0
        };

        const response = await postJson(`${MAP_PATH}/room-update`, info);
        assert.deepEqual(response.status, 201, "Should be true for success");
    });

QUnit.test(
    "Should be able to delete room",
    async assert => {
        const deleteResponse = await fetch(`${MAP_PATH}/remove-room`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 0
            })
        });
        assert.deepEqual(deleteResponse.status, 204, "The delete function should return HTTP for 204 saying it was a success");
    });