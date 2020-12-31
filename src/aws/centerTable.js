"use strict";
const uuid = require('node-uuid');

module.exports = class CenterTable {
  constructor(serviceClient) {
    this.client = serviceClient;
  }

  getCenters() {
    const params = {
      TableName: process.env.CENTER_TABLE_NAME,
      ProjectionExpression: "#hash, centerName"
    };
    return new Promise((resolve, reject) => {
      this.client.query(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getCenter Success!");
          resolve(data);
        }
      });
    });
  }

  getCenter(centerId) {
    const params = {
      TableName: process.env.CENTER_TABLE_NAME,
      KeyConditionExpression: "#hash = :centerId",
      ExpressionAttributeNames: {
        "#hash": "centerId",
      },
      ExpressionAttributeValues: {
        ":centerId": centerId,
      },
    };
    return new Promise((resolve, reject) => {
      this.client.query(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getCenter Success!");
          resolve(data);
        }
      });
    });
  }

  postCenter(body) {
    const center = {
      ...body,
      centerId: uuid.v4(),
    };
    const params = {
      TableName: process.env.CENTER_TABLE_NAME,
      Item: center,
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.put(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("postCenter Success!");
          resolve(center);
        }
      });
    });
  }

  putCenter(centerId, body) {
    const center = {
      ...body,
      centerId: centerId,
    };
    const params = {
      TableName: process.env.CENTER_TABLE_NAME,
      Key: {
        centerId: center.centerId,
        name: center.name,
      },
      UpdateExpression: "set #centerName = :centerName",
      ExpressionAttributeNames: {
        "#centerName": "centerName"
      },
      ExpressionAttributeValues: {
        ":centerName": center.centerName
      },
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.update(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("putCenter Success!");
          resolve(center);
        }
      });
    });
  }
};