"use strict";
import { v4 as uuid } from 'uuid'
import { AWSError, DynamoDB } from 'aws-sdk'

export default class CenterTable {
  client: DynamoDB.DocumentClient;
  constructor(serviceClient: DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }

  getCenters() {
    const params: DynamoDB.ScanInput = {
      TableName: process.env.CENTER_TABLE_NAME!
    };
    return new Promise((resolve, reject) => {
      this.client.scan(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getCenters Success!");
          resolve(data);
        }
      });
    });
  }

  getCenter(centerId: string): Promise<DynamoDB.DocumentClient.GetItemOutput | AWSError> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
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
          resolve(data.Item!);
        }
      });
    });
  }

  postCenter(body: { centerName: string }) {
    const center = {
      ...body,
      centerId: uuid(),
    };
    console.log(center);
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.CENTER_TABLE_NAME!,
      Item: center,
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.put(params, (err, data) => {
        console.log(data);
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

  putCenter(centerId: string, body: { centerName: string }) {
    const center = {
      ...body,
      centerId: centerId,
    };
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
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
        console.log(data);
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