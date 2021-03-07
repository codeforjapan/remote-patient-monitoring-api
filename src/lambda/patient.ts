"use strict";
import { v4 as uuid } from 'uuid'
import { APIGatewayProxyHandler } from "aws-lambda";
import AWS, { DynamoDB } from "aws-sdk";
import { NurseParam, PatientParam } from '../lambda/definitions/types'
import { CognitoAdmin, Config } from '../aws/cognito_admin'
import { loadDynamoDBClient } from '../util/dynamodbclient'
import { SMSSender } from '../util/smssender'

var docClient = loadDynamoDBClient()

AWS.config.update({
  region: process.env.region
});
import PatientTable from "../aws/patientTable";
import Validator from "../util/validator";
import NurseTable from "../aws/nurseTable";
import { SwaggerUIBundle } from "swagger-ui-dist";
/**
 * A data handler for  Patients
 */
export namespace Patient {
  const sliceStatus = (patient: PatientParam, limit: number = -1): PatientParam => {
    // ステータスを指定した件数に絞る
    if (patient.statuses) {
      if (limit > -1 && patient.statuses.length > limit) {
        patient.statuses.splice(limit, patient.statuses.length - limit)
      }
    }
    return patient
  }
  const isCenterManagedByNurse = async (nurseId: string, centerId: string): Promise<boolean> => {
    const nurseTable = new NurseTable(docClient);
    const ret = await nurseTable.getNurse(nurseId)
    const nurse: NurseParam = ret as NurseParam
    return nurse.manageCenters.findIndex(item => item.centerId === centerId) > -1
  }
  export const getPatients: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    try {
      if (!event.pathParameters || !event.pathParameters.centerId) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorCode: "RPM00001",
            errorMessage: 'Center Not Found'
          })
        }
      }
      const res = await patientTable.getPatients(event.pathParameters.centerId);
      if (validator.checkDyanmoQueryResultEmpty(res)) {
        const errorModel = {
          errorCode: "RPM00001",
          errorMessage: "Not Found",
        };
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorModel,
          }),
        };
      }
      // check if the center is managable by this user
      if (validator.isNurseAPI(event)) {
        // create new Patient User
        const config: Config = {
          userPoolId: process.env.NURSE_POOL_ID!,
          userPoolClientId: process.env.NURSE_POOL_CLIENT_ID!
        }
        const admin = new CognitoAdmin(config)
        const nurseId = admin.getUserId(event);
        if (!await isCenterManagedByNurse(nurseId, event.pathParameters!.centerId)) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: 'Forbidden'
            })
          };
        }
      }
      const myres = res as DynamoDB.DocumentClient.ScanOutput
      const items = myres.Items?.map((item: any) => {
        if (item.statuses) {
          item = sliceStatus(item, 20)
        }
        return item
      })
      return {
        statusCode: 200,
        body: JSON.stringify({ Count: myres.Count, Items: items }),
      };
    } catch (err) {
      console.log("getPatientTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const postPatient: APIGatewayProxyHandler = async (event) => {
    console.log('called postPatient');
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    const bodyData = validator.jsonBody(event.body);

    if (!event.pathParameters || !event.pathParameters.centerId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          errorCode: "RPM00001",
          errorMessage: 'Center Not Found'
        })
      }
    }

    try {
      if (!validator.checkPatientBody(bodyData)) {
        const errorModel = {
          errorCode: "RPM00002",
          errorMessage: "Invalid Body",
        };
        return {
          statusCode: 400,
          body: JSON.stringify({
            errorModel,
          }),
        };
      }
      // create new Patient User
      const config: Config = {
        userPoolId: process.env.PATIENT_POOL_ID!,
        userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!
      }
      const admin = new CognitoAdmin(config)
      // check if the center is managable by this user
      if (validator.isNurseAPI(event)) {
        const nurseId = admin.getUserId(event);
        if (!await isCenterManagedByNurse(nurseId, event.pathParameters!.centerId)) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: 'Forbidden'
            })
          };
        }
      }
      const phoneExists = await patientTable.searchPhone(bodyData.phone);
      if (phoneExists) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            errorCode: "RPM00103",
            errorMessage: 'Phone already exists'
          })
        };
      }
      console.log('create new user');
      const patientId = bodyData.patientId || uuid()
      const newuser = await admin.signUp(patientId)
      console.log(newuser);
      const param: PatientParam = {
        patientId: patientId,
        phone: bodyData.phone,
        display: true,
        policy_accepted: undefined,
        centerId: event.pathParameters.centerId,
        statuses:[]
      }
      try {
        await patientTable.postPatient(param);
        // add BASE64 encoded user/password as a login key
        const loginKey = Buffer.from(newuser.username + '/' + newuser.password).toString('base64')
        // send login url via SMS
        if (process.env.SMS_ENDPOINT) {
          //@TODO implementation
          const endpoint = process.env.SMS_ENDPOINT!
          const logininfo = { key: process.env.SMS_APIKEY }
          let loginURL = 'http://localhost:8000/login/'
          if (process.env.STAGE && process.env.STAGE == 'stg') {
            loginURL = process.env.SMS_LOGINURL!
          }
          const smsSender = new SMSSender(endpoint, logininfo)
          console.log(event)
          smsSender.sendSMS(param.phone, `体調入力URL: ${loginURL + loginKey}`)
        }
        return {
          statusCode: 201,
          body: JSON.stringify({ ...param, password: newuser.password, loginKey: loginKey })
        };
      } catch (err) {
        return {
          statusCode: 400,
          body: err
        };
      }
    } catch (err) {
      console.log("postPatientTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const getPatient: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    if (!event.pathParameters || !event.pathParameters.patientId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          errorCode: "RPM00001",
          errorMessage: 'Not Found'
        })
      }
    }
    const config: Config = {
      userPoolId: process.env.PATIENT_POOL_ID!,
      userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!
    }
    const admin = new CognitoAdmin(config)
    try {
      if (validator.isPatientAPI(event)) {
        const patientId = admin.getUserId(event);
        if (patientId != event.pathParameters.patientId) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: 'Forbidden'
            })
          };
        }
      }
      const res = await patientTable.getPatient(event.pathParameters.patientId);
      if (validator.checkDynamoGetResultEmpty(res)) {
        const errorModel = {
          errorCode: "RPM00001",
          errorMessage: "Not Found",
        };
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorModel,
          }),
        };
      }
      if (validator.isNurseAPI(event)) {
        const nurseId = admin.getUserId(event);

        if (!await isCenterManagedByNurse(nurseId, (res as PatientParam).centerId)) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: 'Forbidden'
            })
          };
        }
      }
      const patient = sliceStatus(res as PatientParam, 20)

      return {
        statusCode: 200,
        body: JSON.stringify(patient),
      };
    } catch (err) {
      console.log("getPatientTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const putPatient: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    const bodyData: PatientParam = validator.jsonBody(event.body);
    try {
      if (!event.body || !validator.checkPatientPutBody(bodyData)) {
        const errorModel = {
          errorCode: "RPM00002",
          errorMessage: "Invalid Body",
        };
        return {
          statusCode: 400,
          body: JSON.stringify({
            errorModel,
          }),
        };
      }
      if (!event.pathParameters || !event.pathParameters.patientId) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorCode: "RPM00001",
            errorMessage: 'Not Found'
          })
        }
      }
      const config: Config = {
        userPoolId: process.env.PATIENT_POOL_ID!,
        userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!
      }
      const admin = new CognitoAdmin(config)
      if (validator.isNurseAPI(event)) {
        const nurseId = admin.getUserId(event);
        const res = await patientTable.getPatient(event.pathParameters.patientId);

        if (!await isCenterManagedByNurse(nurseId, (res as PatientParam).centerId) ||
          !await isCenterManagedByNurse(nurseId, bodyData.centerId)) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: 'Forbidden'
            })
          };
        }
      }
      const res = await patientTable.putPatient(
        event.pathParameters.patientId,
        bodyData
      );
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (err) {
      console.log("putPatientTable-index error");
      console.log(err)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }
}
