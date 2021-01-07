"use strict";
const uuid = require('uuid');

module.exports = class ObserverTable {
  constructor(serviceClient) {
    this.client = serviceClient;
  }

  getObservers() {
    const params = {
      TableName: process.env.OBSERVER_TABLE_NAME
    };
    return new Promise((resolve, reject) => {
      this.client.scan(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getObserver Success!");
          resolve(data);
        }
      });
    });
  }

  getObserver(observerId) {
    const params = {
      TableName: process.env.OBSERVER_TABLE_NAME,
      Key: {
        "observerId": observerId
      }
    };
    return new Promise((resolve, reject) => {
      this.client.get(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getObserver Success!");
          resolve(data);
        }
      });
    });
  }

  postObserver(body) {
    const observer = {
      ...body,
      observerId: uuid.v4(),
    };
    const params = {
      TableName: process.env.OBSERVER_TABLE_NAME,
      Item: observer,
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.put(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("postObserver Success!");
          resolve(observer);
        }
      });
    });
  }

  putObserver(observerId, body) {
    const observer = {
      ...body,
      observerId: observerId,
    };
    console.log(observer);
    const params = {
      TableName: process.env.OBSERVER_TABLE_NAME,
      Key: {
        observerId: observer.observerId
      },
      UpdateExpression: "set #observerName = :observerName",
      ExpressionAttributeNames: {
        "#observerName": "observerName"
      },
      ExpressionAttributeValues: {
        ":observerName": observer.observerName
      },
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.update(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("putObserver Success!");
          resolve(observer);
        }
      });
    });
  }
};