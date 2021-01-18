"use strict";
import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";
import { PatientParam } from '../lambda/definitions/types'
var dynamodb = require('serverless-dynamodb-client');
import { CognitoAdmin, Config } from '../aws/cognito_admin'
var docClient = dynamodb.doc;

AWS.config.update({
  region: process.env.region
});
import PatientTable from "../aws/patientTable";
import Validator from "../util/validator";

export namespace Patient {
  export const getPatients: APIGatewayProxyHandler = async () => {
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    try {
      const res = await patientTable.getPatients();
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
      const newuser = await admin.signUp(bodyData.patientId)
      console.log(newuser);
      const param: PatientParam = {
        ...bodyData,
        display: true,
        policy_accepted: null,
        Statuses: [],
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
    console.log('call getPatient with ' + event.pathParameters.patientId);
    try {
      const res = await patientTable.getPatient(event.pathParameters.patientId);
      console.log(res);
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
      console.log(res);
      console.log(JSON.stringify(res));
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
      if (!event.body || !validator.checkPatientBody(bodyData)) {
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
      const res = await patientTable.putPatient(
        event.pathParameters.patientId,
        JSON.parse(event.body)
      );
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (err) {
      console.log("putPatientTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }
}