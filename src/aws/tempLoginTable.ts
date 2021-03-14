"use strict";
import { AWSError, DynamoDB } from "aws-sdk";
import { v4 as uuid } from "uuid";
import { TempLoginParam, TempLoginResult } from "../lambda/definitions/types";
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
              phone: phone,
              token: data.Item.token,
              created: data.Item.created,
            });
          }
        }
      });
    });
  }

  searchPhone(token: string): Promise<TempLoginResult | undefined> {
    const query: DynamoDB.DocumentClient.QueryInput = {
      TableName: process.env.TEMPLOGIN_TABLE_NAME!,
      IndexName: "RemotePatientMonitoringTempLoginTableGSIToken",
      KeyConditionExpression: "token = :token",
      ExpressionAttributeValues: { ":token": token },
      ProjectionExpression: "phone, created",
    };
    return new Promise((resolve) => {
      this.client.query(query, (err, data) => {
        if (err) {
          console.log(err);
          resolve(undefined);
        } else {
          if (data.Count! > 0) {
            const item = data.Items![0];
            resolve({ phone: item.phone, token: token, created: item.created });
          } else {
            resolve(undefined);
          }
        }
      });
    });
  }

  async postToken(item: TempLoginParam): Promise<TempLoginParam | AWSError> {
    const token = await this.getToken(item.phone);
    if (token) {
      const putret = await this.deleteToken(item.phone);
      if (!putret) {
        throw new Error("token already exists but we couldn't delte it");
      }
    }
    const newitem = {
      phone: item.phone,
      token: uuid(),
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

  putToken(item: TempLoginParam): Promise<TempLoginParam | AWSError> {
    if (!item.token) {
      throw new Error("token is not set");
    }
    const updateExpression = "set token = :token";

    const expressionAttributeValues: any = {
      ":token": item.token,
    };
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.TEMPLOGIN_TABLE_NAME!,
      Key: {
        phone: item.phone,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.update(params, (err, data) => {
        console.log(data);
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(item);
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
