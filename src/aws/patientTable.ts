'use strict';
import { AWSError, DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import { PatientParam, Status, StatusParam, Patient } from '../lambda/definitions/types';
export default class PatientTable {
  client: DynamoDB.DocumentClient;
  constructor(serviceClient: DynamoDB.DocumentClient) {
    this.client = serviceClient;
  }

  getPatients(centerId: string) {
    const params: DynamoDB.ScanInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
    };
    return new Promise((resolve, reject) => {
      this.client.scan(params, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log('getPatient Success!');
          const filtered = data.Items!.filter((item) => item.centerId === centerId);
          resolve({ Count: filtered.length, Items: filtered });
        }
      });
    });
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
          console.log('getPatient Success!');
          console.log(data.Item);
          resolve(data.Item! as Patient);
        }
      });
    });
  }

  searchPhone(phone: string) {
    const query: DynamoDB.DocumentClient.QueryInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      KeyConditionExpression: 'phone = :phone',
      ExpressionAttributeValues: { ':phone': phone },
    };
    console.log(query);
    return new Promise((resolve) => {
      this.client.query(query, (err, data) => {
        if (err) {
          console.log(err);
          resolve(undefined);
        } else {
          resolve(data);
        }
      });
    });
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
          console.log('postPatient Success!');
          resolve(patient);
        }
      });
    });
  }

  putPatient(patientId: string, patient: PatientParam) {
    let updateExpression = 'set phone = :phone, display = :display, centerId = :centerId'
    let expressionAttributeValues: any = {
      ':phone': patient.phone,
      ':display': patient.display,
      ':centerId': patient.centerId,
      ":statuses": patient.statuses
    }
    if (patient.policy_accepted) {
      updateExpression += ', policy_accepted = :policy_accepted'
      expressionAttributeValues[':policy_accepted'] = patient.policy_accepted
    }
    if (patient.statuses) {
      updateExpression += ', statuses = :statuses'
      expressionAttributeValues[':statuses'] = patient.statuses
    }
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: process.env.PATIENT_TABLE_NAME!,
      Key: {
        patientId: patientId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues
    };
    console.log(params);
    return new Promise((resolve, reject) => {
      this.client.update(params, (err, data) => {
        console.log(data);
        if (err) {
          console.log(err);
          reject(err);
        } else {
          console.log('putPatient Success!');
          resolve(patient);
        }
      });
    });
  }

  async postPatientStatus(patientId: string, centerId: string, param: StatusParam): Promise<Status> {
    try {
      console.log(patientId);
      console.log(centerId);
      console.log(param);
      const requestBody: Status = {
        patientId: patientId,
        statusId: uuid(),
        centerId: centerId,
        created: new Date().toISOString(),
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
        UpdateExpression: 'set #statuses = list_append(if_not_exists(#statuses, :emptyList), :status)',
        ExpressionAttributeNames: {
          '#statuses': 'statuses',
        },
        ExpressionAttributeValues: {
          ':status': [requestBody],
          ':emptyList': [],
        },
      };
      await this.client.update(params).promise();
      return Promise.resolve(requestBody);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async deletePatientStatus(patientId: string, statusId: string) {
    try {
      const ret = await this.getPatient(patientId)

      const patient = ret as Patient
      if (patient.statuses) {
        patient.statuses.splice(patient.statuses.findIndex(item => item.statusId === statusId), 1)
      }
      const ret2 = await this.putPatient(patientId, patient)
      return Promise.resolve(ret2);
    } catch (err) {
      console.log(err);
      throw err
    }
  }
}
