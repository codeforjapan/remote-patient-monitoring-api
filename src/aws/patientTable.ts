"use strict";
import uuid from 'uuid';
import { AWSError, DynamoDB } from 'aws-sdk'

export default class PatientTable {
  client:DynamoDB.DocumentClient;
  constructor(serviceClient) {
    this.client = serviceClient;
  }

  getPatients() {
    const params:DynamoDB.ScanInput = {
      TableName: process.env.PATIENT_TABLE_NAME!
    };
    return new Promise((resolve, reject) => {
      this.client.scan(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getPatient Success!");
          resolve(data);
        }
      });
    });
  }

  getPatient(patientId):Promise<DynamoDB.GetItemOutput | AWSError> {
    const params:DynamoDB.GetItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Key: {
        "patientId": patientId
      }
    };
    return new Promise((resolve, reject) => {
      this.client.get(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getPatient Success!");
          resolve(data);
        }
      });
    });
  }

  postPatient(body):Promise<DynamoDB.PutItemOutput | AWSError> {
    const patient = {
      ...body,
      patientId: uuid.v4(),
    };
    const params:DynamoDB.PutItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Item: patient,
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.put(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("postPatient Success!");
          resolve(patient);
        }
      });
    });
  }

  putPatient(patientId, body):Promise<DynamoDB.UpdateItemOutput | AWSError> {
    const patient = {
      ...body,
      patientId: patientId,
    };
    console.log(patient);
    const params:DynamoDB.UpdateItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Key: {
        patientId: patient.patientId
      },
      UpdateExpression: "set #patientName = :patientName",
      ExpressionAttributeNames: {
        "#patientName": "patientName"
      },
      ExpressionAttributeValues: {
        ":patientName": patient.patientName
      },
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.update(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("putPatient Success!");
          resolve(patient);
        }
      });
    });
  }
};