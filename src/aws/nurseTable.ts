"use strict";
import { v4 as uuid } from 'uuid';
import { AWSError, DynamoDB } from 'aws-sdk'

export default class NurseTable {
  client: DynamoDB.DocumentClient;
  constructor(serviceClient: DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }

  getNurses() {
    const params: DynamoDB.ScanInput = {
      TableName: process.env.NURSE_TABLE_NAME!
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

  getNurse(nurseId: string): Promise<DynamoDB.DocumentClient.GetItemOutput | AWSError> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: process.env.NURSE_TABLE_NAME!,
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

  postNurse(body: { nurseName: string }) {
    const nurse = {
      ...body,
      nurseId: uuid(),
    };
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.NURSE_TABLE_NAME!,
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

  putNurse(nurseId: string, body: { nurseName: string }) {
    const nurse = {
      ...body,
      nurseId: nurseId,
    };
    console.log(nurse);
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.NURSE_TABLE_NAME!,
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