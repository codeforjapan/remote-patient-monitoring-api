"use strict";
import { AWSError, DynamoDB } from 'aws-sdk'
import { PatientParam } from '../lambda/definitions/types'
export default class PatientTable {
  client: DynamoDB.DocumentClient;
  constructor(serviceClient: DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }

  getPatients(centerId: string) {
    const params: DynamoDB.ScanInput = {
      TableName: process.env.PATIENT_TABLE_NAME!
    };
    return new Promise((resolve, reject) => {
      this.client.scan(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log("getPatient Success!");
          const filtered = data.Items!.filter(item => item.centerId === centerId);
          resolve({ Count: filtered.length, Items: filtered });
        }
      });
    });
  }

  getPatient(patientId: string): Promise<DynamoDB.GetItemOutput | AWSError> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
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
          console.log(data.Item);
          resolve(data.Item!);
        }
      });
    });
  }
  searchPhone(phone: string) {
    const query: DynamoDB.DocumentClient.QueryInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      KeyConditionExpression: "phone = :phone",
      ExpressionAttributeValues: { ":phone": phone }
    };
    console.log(query);
    return new Promise((resolve) => {
      this.client.query(query, (err, data) => {
        if (err) {
          console.log(err)
          resolve(undefined);
        } else {
          resolve(data)
        }
      })
    })
  }
  postPatient(patient: PatientParam) {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Item: patient,
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.put(params, (err, data) => {
        console.log(data);
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

  putPatient(patientId: string, patient: PatientParam) {
    console.log(patient);
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Key: {
        patientId: patientId
      },
      UpdateExpression: "set phone = :phone, display = :display, policy_accepted = :policy_accepted, centerId = :centerId",
      ExpressionAttributeValues: {
        ":phone": patient.phone,
        ":display": patient.display,
        ":policy_accepted": patient.policy_accepted,
        ":centerId": patient.centerId
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
          console.log("putPatient Success!");
          resolve(patient);
        }
      });
    });
  }
};