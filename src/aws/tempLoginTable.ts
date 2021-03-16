"use strict";
import { AWSError, DynamoDB } from "aws-sdk";
import { TempLoginInput, TempLoginResult } from "../lambda/definitions/types";
export default class TempLoginTable {
  client: DynamoDB.DocumentClient;
  constructor(serviceClient: DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }

  getToken(phone: string): Promise<TempLoginResult | undefined> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: process.env.TEMPLOGIN_TABLE_NAME!,
      Key: {
        phone: phone,
      },
    };
    return new Promise((resolve, reject) => {
      this.client.get(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          if (!data.Item) {
            resolve(undefined);
          } else {
            resolve({
              patientId: data.Item.patientId,
              phone: phone,
              loginKey: data.Item.loginKey,
              created: data.Item.created,
            });
          }
        }
      });
    });
  }

  searchPhone(loginKey: string): Promise<TempLoginResult | undefined> {
    const query: DynamoDB.DocumentClient.QueryInput = {
      TableName: process.env.TEMPLOGIN_TABLE_NAME!,
      IndexName: "RemotePatientMonitoringTempLoginTableGSIToken",
      KeyConditionExpression: "loginKey = :loginKey",
      ExpressionAttributeValues: { ":loginKey": loginKey },
      ProjectionExpression: "patientId, phone, created",
    };
    return new Promise((resolve) => {
      this.client.query(query, (err, data) => {
        if (err) {
          console.log(err);
          resolve(undefined);
        } else {
          if (data.Count! > 0) {
            const item = data.Items![0];
            resolve({
              patientId: item.patientId,
              phone: item.phone,
              loginKey: loginKey,
              created: item.created,
            });
          } else {
            resolve(undefined);
          }
        }
      });
    });
  }

  async postToken(item: TempLoginInput): Promise<TempLoginResult | AWSError> {
    const token = await this.getToken(item.phone);
    if (token) {
      const putret = await this.deleteToken(item.phone);
      if (!putret) {
        throw new Error("token already exists but we couldn't delte it");
      }
    }
    const newitem = {
      patientId: item.patientId,
      phone: item.phone,
      loginKey: item.loginKey,
      created: new Date().toISOString(),
    };
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.TEMPLOGIN_TABLE_NAME!,
      Item: newitem,
    };
    return new Promise((resolve, reject) => {
      this.client.put(params, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(newitem);
        }
      });
    });
  }

  async deleteToken(phone: string): Promise<boolean | AWSError> {
    const token = await this.getToken(phone);
    if (!token) {
      return Promise.resolve(false);
    } else {
      const params: DynamoDB.DocumentClient.DeleteItemInput = {
        TableName: process.env.TEMPLOGIN_TABLE_NAME!,
        Key: {
          phone: phone,
        },
      };
      return new Promise((resolve, reject) => {
        this.client.delete(params, (err) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    }
  }
}
