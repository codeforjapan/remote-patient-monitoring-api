"use strict";
import uuid from 'uuid';
import { AWSError, DynamoDB } from 'aws-sdk'

export default class CenterTable {
  client:DynamoDB.DocumentClient;
  constructor(serviceClient:DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }

  getCenters() {
    const params:DynamoDB.ScanInput = {
      TableName: process.env.CENTER_TABLE_NAME!
    };
    return new Promise((resolve, reject) => {
      this.client.scan(params, (err, data) => {
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

  getCenter(centerId):Promise<DynamoDB.GetItemOutput | AWSError> {
    const params:DynamoDB.GetItemInput = {
      TableName: process.env.CENTER_TABLE_NAME!,
      Key: {
        "centerId": centerId
      }
    };
    return new Promise((resolve, reject) => {
      this.client.get(params, (err, data) => {
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
    const params:DynamoDB.PutItemInput = {
      TableName: process.env.CENTER_TABLE_NAME!,
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
    console.log(center);
    const params:DynamoDB.UpdateItemInput = {
      TableName: process.env.CENTER_TABLE_NAME!,
      Key: {
        centerId: center.centerId
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