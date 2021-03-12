"use strict";
import { AWSError, DynamoDB } from "aws-sdk";
import { NurseParam } from "../lambda/definitions/types";
import { Center } from "../lambda/definitions/types";

export default class NurseTable {
  client: DynamoDB.DocumentClient;
  constructor(serviceClient: DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }
  getNurses(centerId: string) {
    const params: DynamoDB.ScanInput = {
      TableName: process.env.NURSE_TABLE_NAME!,
    };
    return new Promise((resolve, reject) => {
      this.client.scan(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getNurse Success!");
          const filtered = data.Items!.filter(
            (item) =>
              item.manageCenters.findIndex(
                (center: Center) => center.centerId === centerId
              ) > -1
          );
          resolve({ Count: filtered.length, Items: filtered });
        }
      });
    });
  }

  getNurse(
    nurseId: string
  ): Promise<DynamoDB.DocumentClient.GetItemOutput | AWSError> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: process.env.NURSE_TABLE_NAME!,
      Key: {
        nurseId: nurseId,
      },
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.get(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getNurse Success!");
          console.log(data.Item);
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
      this.client.put(params, (err, data) => {
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

  putNurse(nurseId: string, body: { manageCenters: Center[] }) {
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.NURSE_TABLE_NAME!,
      Key: {
        nurseId: nurseId,
      },
      UpdateExpression: "set manageCenters = :c",
      ExpressionAttributeValues: {
        ":c": body.manageCenters,
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
          console.log("putNurse Success!");
          resolve({ nurseId: nurseId, manageCenters: body.manageCenters });
        }
      });
    });
  }
}
