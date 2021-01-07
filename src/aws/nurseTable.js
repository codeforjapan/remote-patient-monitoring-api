"use strict";
const uuid = require('uuid');

module.exports = class NurseTable {
  constructor(serviceClient) {
    this.client = serviceClient;
  }

  getNurses() {
    const params = {
      TableName: process.env.NURSE_TABLE_NAME
    };
    return new Promise((resolve, reject) => {
      this.client.scan(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getNurse Success!");
          resolve(data);
        }
      });
    });
  }

  getNurse(nurseId) {
    const params = {
      TableName: process.env.NURSE_TABLE_NAME,
      Key: {
        "nurseId": nurseId
      }
    };
    return new Promise((resolve, reject) => {
      this.client.get(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getNurse Success!");
          resolve(data);
        }
      });
    });
  }

  postNurse(body) {
    const nurse = {
      ...body,
      nurseId: uuid.v4(),
    };
    const params = {
      TableName: process.env.NURSE_TABLE_NAME,
      Item: nurse,
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.put(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("postNurse Success!");
          resolve(nurse);
        }
      });
    });
  }

  putNurse(nurseId, body) {
    const nurse = {
      ...body,
      nurseId: nurseId,
    };
    console.log(nurse);
    const params = {
      TableName: process.env.NURSE_TABLE_NAME,
      Key: {
        nurseId: nurse.nurseId
      },
      UpdateExpression: "set #nurseName = :nurseName",
      ExpressionAttributeNames: {
        "#nurseName": "nurseName"
      },
      ExpressionAttributeValues: {
        ":nurseName": nurse.nurseName
      },
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.update(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("putNurse Success!");
          resolve(nurse);
        }
      });
    });
  }
};