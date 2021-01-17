"use strict";
import { AWSError, DynamoDB } from 'aws-sdk'
import { NurseParam } from '../lambda/definitions/types'
import { Center } from '../lambda/definitions/types'

export default class NurseTable {
  client: DynamoDB.DocumentClient;
  constructor(serviceClient: DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }
  getDocClient() {
    console.log(this.client);
    return this.client
  }
  getNurses(centerId: string) {
    const params: DynamoDB.ScanInput = {
      TableName: process.env.NURSE_TABLE_NAME!
    };
    return new Promise((resolve, reject) => {
      this.getDocClient().scan(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getNurse Success!");
          console.log(JSON.stringify(data))
          const filtered = data.Items!.filter((item) => item.manageCenters.find((center: Center) => center.centerId === centerId));
          console.log(JSON.stringify(filtered))
          resolve(filtered);
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
    console.log(params)
    return new Promise((resolve, reject) => {
      this.getDocClient().get(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getNurse Success!");
          console.log(data.Item)
          resolve(data.Item!);
        }
      });
    });
  }

  postNurse(nurse: NurseParam): Promise<NurseParam> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.NURSE_TABLE_NAME!,
      Item: nurse,
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.getDocClient().put(params, (err, data) => {
        console.log(data);
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
      this.getDocClient().update(params, (err, data) => {
        console.log(data);
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