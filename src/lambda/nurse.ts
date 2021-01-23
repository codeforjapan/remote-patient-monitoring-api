"use strict";
import AWS from "aws-sdk";
import { APIGatewayProxyHandler } from 'aws-lambda'
import { CognitoAdmin, Config } from '../aws/cognito_admin'
import { loadDynamoDBClient } from '../util/dynamodbclient'
var docClient = loadDynamoDBClient()

AWS.config.update({
  region: process.env.region
});
import NurseTable from "../aws/nurseTable";
import Validator from "../util/validator";
import Formatter from "../util/formatter";

export namespace Nurse {

  export const getNurses: APIGatewayProxyHandler = async (event) => {
    const nurseTable = new NurseTable(docClient);
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
      const res = await nurseTable.getNurses(event.pathParameters.centerId);
      console.log(res)
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
      console.log("getNurseTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const postNurse: APIGatewayProxyHandler = async (event) => {
    console.log('called postNurse');
    const nurseTable = new NurseTable(docClient);
    const validator = new Validator();
    const formatter = new Formatter();
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
      if (!validator.checkNurseBody(bodyData)) {
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
      // create new Nurse User
      const config: Config = {
        userPoolId: process.env.NURSE_POOL_ID!,
        userPoolClientId: process.env.NURSE_POOL_CLIENT_ID!
      }
      const admin = new CognitoAdmin(config)
      const newuser = await admin.signUp(bodyData.nurseId)
      console.log(newuser);
      const param = formatter.buildNurseParam(bodyData.nurseId, [event.pathParameters.centerId])
      const res = await nurseTable.postNurse(param);
      return {
        statusCode: 201,
        body: JSON.stringify({ nurseId: newuser.username, password: newuser.password, manageCenters: res.manageCenters })
      };
    } catch (err) {
      console.log("postNurseTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const getNurse: APIGatewayProxyHandler = async (event) => {
    const nurseTable = new NurseTable(docClient);
    const validator = new Validator();

    if (!event.pathParameters || !event.pathParameters.nurseId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          errorCode: "RPM00001",
          errorMessage: 'Not Found'
        })
      }
    }
    const config: Config = {
      userPoolId: process.env.NURSE_POOL_ID!,
      userPoolClientId: process.env.NURSE_POOL_CLIENT_ID!
    }
    console.log(config)
    const cognito = new CognitoAdmin(config);
    // check permission
    if (validator.isNurseAPI(event)) {
      const userid = cognito.getUserId(event);
      console.log(`user id is ${userid}`)
      if (userid !== event.pathParameters.nurseId) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            errorCode: "RPM00101",
            errorMessage: 'Forbidden'
          })
        }
      }
    }
    console.log('call getNurse with ' + event.pathParameters.nurseId);
    try {
      const res = await nurseTable.getNurse(event.pathParameters.nurseId);
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
      console.log("getNurseTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const putNurse: APIGatewayProxyHandler = async (event) => {
    const nurseTable = new NurseTable(docClient);
    const validator = new Validator();
    const bodyData = validator.jsonBody(event.body);
    console.log('!----')
    console.log(bodyData)
    try {
      if (!event.pathParameters || !event.pathParameters.nurseId) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorCode: "RPM00001",
            errorMessage: 'Not Found'
          })
        }
      }
      const res = await nurseTable.putNurse(
        event.pathParameters.nurseId,
        bodyData
      );
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (err) {
      console.log("putNurseTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }
}