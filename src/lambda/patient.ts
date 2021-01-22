"use strict";
import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";
import { NurseParam, PatientParam } from '../lambda/definitions/types'
import { CognitoAdmin, Config } from '../aws/cognito_admin'
import { loadDynamoDBClient } from '../util/dynamodbclient'
var docClient = loadDynamoDBClient()

AWS.config.update({
  region: process.env.region
});
import PatientTable from "../aws/patientTable";
import Validator from "../util/validator";
import NurseTable from "../aws/nurseTable";


export namespace Patient {
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
      return {
        statusCode: 200,
        body: JSON.stringify(res),
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
      console.log('create new user');
      const newuser = await admin.signUp(bodyData.patientId)
      console.log(newuser);
      const param: PatientParam = {
        ...bodyData,
        display: true,
        policy_accepted: undefined,
        centerId: event.pathParameters.centerId
      }
      const res = await patientTable.postPatient(param);
      console.log(res)
      return {
        statusCode: 201,
        body: JSON.stringify({ ...param, password: newuser.password })
      };
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
      console.log(JSON.stringify(res));
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

      return {
        statusCode: 200,
        body: JSON.stringify(res),
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
    const bodyData = validator.jsonBody(event.body);
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