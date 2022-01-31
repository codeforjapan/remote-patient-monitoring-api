"use strict";
import { AWSError, DynamoDB } from "aws-sdk";
import { v4 as uuid } from "uuid";
import {
  PatientParam,
  Status,
  StatusParam,
  Patient,
} from "../lambda/definitions/types";
export default class PatientTable {
  client: DynamoDB.DocumentClient;
  constructor(serviceClient: DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }

  async getPatients(
    centerId: string
  ): Promise<DynamoDB.DocumentClient.ScanOutput | AWSError> {
    const params: DynamoDB.ScanInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
    };
    const items: DynamoDB.DocumentClient.ItemList = [];
    let result: DynamoDB.DocumentClient.ScanOutput;
    do {
      result = await this.client.scan(params).promise()
      items.push(...result.Items!)
    } while (result.LastEvaluatedKey)
    const filtered = items.filter(
      (item) => item.centerId === centerId
    );
    return ({ Count: filtered.length, Items: filtered})
  }

  getPatient(patientId: string): Promise<Patient | AWSError> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Key: {
        patientId: patientId,
      },
    };
    return new Promise((resolve, reject) => {
      this.client.get(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(data.Item! as Patient);
        }
      });
    });
  }

  searchPhone(phone: string): Promise<string | undefined> {
    const query: DynamoDB.DocumentClient.QueryInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      IndexName: "RemotePatientMonitoringPatientTableGSIPhone",
      KeyConditionExpression: "phone = :phone",
      ExpressionAttributeValues: { ":phone": phone },
      ProjectionExpression: "patientId",
    };
    return new Promise((resolve) => {
      this.client.query(query, (err, data) => {
        if (err) {
          console.log(err);
          resolve(undefined);
        } else {
          if (data.Count! > 0) {
            resolve(data.Items![0].patientId);
          } else {
            resolve(undefined);
          }
        }
      });
    });
  }
  async postPatient(patient: PatientParam): Promise<PatientParam | AWSError> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Item: patient,
    };
    const ret = await this.searchPhone(patient.phone);
    return new Promise((resolve, reject) => {
      if (ret) {
        reject({ message: "phone already exists" });
      } else {
        this.client.put(params, (err) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(patient);
          }
        });
      }
    });
  }

  putPatient(
    patientId: string,
    patient: PatientParam
  ): Promise<PatientParam | AWSError> {
    let updateExpression =
      "set phone = :phone, display = :display, centerId = :centerId";

    const expressionAttributeValues: any = {
      ":phone": patient.phone,
      ":display": patient.display,
      ":centerId": patient.centerId,
      ":statuses": patient.statuses,
    };

    if (patient.policy_accepted !== undefined) {
      updateExpression += ", policy_accepted = :policy_accepted";
      expressionAttributeValues[":policy_accepted"] = patient.policy_accepted;
    }
    if (patient.memo !== undefined) {
      updateExpression += ", memo = :memo";
      expressionAttributeValues[":memo"] = patient.memo;
    }
    if (patient.statuses) {
      updateExpression += ", statuses = :statuses";
      expressionAttributeValues[":statuses"] = patient.statuses;
    }
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Key: {
        patientId: patientId,
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
          resolve(patient);
        }
      });
    });
  }

  acceptPolicy(patientId: string): Promise<any> {
    const updateExpression = "set policy_accepted = :policy_accepted";
    const policy_accepted_time = new Date().toISOString()
    const expressionAttributeValues: any = {
      ":policy_accepted": policy_accepted_time,
    };
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Key: {
        patientId: patientId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    };
    return new Promise((resolve, reject) => {
      this.client.update(params, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve({ result: "OK", policy_accepted: policy_accepted_time });
        }
      });
    });
  }
  async postPatientStatus(
    patientId: string,
    centerId: string,
    param: StatusParam
  ): Promise<Status> {
    try {
      const requestBody: Status = {
        patientId: patientId,
        statusId: uuid(),
        centerId: centerId,
        created: param.created || new Date().toISOString(),
        SpO2: param.SpO2,
        body_temperature: param.body_temperature,
        pulse: param.pulse,
      };
      if (param.symptom) {
        requestBody.symptom = {
          ...param.symptom,
          symptomId: uuid(),
        };
      }
      const params: DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: process.env.PATIENT_TABLE_NAME!,
        Key: {
          patientId: patientId,
        },
        UpdateExpression:
          "set #statuses = list_append(:status, if_not_exists(#statuses, :emptyList))",
        ExpressionAttributeNames: {
          "#statuses": "statuses",
        },
        ExpressionAttributeValues: {
          ":status": [requestBody],
          ":emptyList": [],
        },
      };
      await this.client.update(params).promise();
      return Promise.resolve(requestBody);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async deletePatientStatus(
    patientId: string,
    statusId: string
  ): Promise<PatientParam | AWSError> {
    try {
      const ret = await this.getPatient(patientId);

      const patient = ret as Patient;
      if (patient.statuses) {
        if (
          patient.statuses.findIndex((item) => item.statusId === statusId) ===
          -1
        ) {
          throw new Error("no status found");
        }
        patient.statuses.splice(
          patient.statuses.findIndex((item) => item.statusId === statusId),
          1
        );
      }
      const ret2 = await this.putPatient(patientId, patient);
      return Promise.resolve(ret2);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
