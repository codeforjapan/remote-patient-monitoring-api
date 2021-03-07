"use strict";
import { APIGatewayProxyHandler } from 'aws-lambda'
import { CognitoAdmin, Config } from '../aws/cognito_admin'
import PatientTable from '../aws/patientTable'
import Validator from "../util/validator";
import { loadDynamoDBClient } from '../util/dynamodbclient'
import {Patient} from './definitions/types'

var docClient = loadDynamoDBClient()

export namespace Admin {
  export const postAdminLogin: APIGatewayProxyHandler = async (event) => {
    try {

      const validator = new Validator();
      const bodyData = validator.jsonBody(event.body);
      const config: Config = {
        userPoolId: process.env.USER_POOL_ID!,
        userPoolClientId: process.env.USER_POOL_CLIENT_ID!
      }
      const admin = new CognitoAdmin(config)
      const res = (bodyData.refreshToken) ? await admin.refreshToken(bodyData.refreshToken) : await admin.signIn(bodyData.username, bodyData.password);
      if (validator.isPatientAPI(event) && bodyData.username) {
        // patient テーブルが指定されている場合は、policy_accepted を返す
        const patientTable = new PatientTable(docClient);
        const patient = await patientTable.getPatient(bodyData.username);
        return {
          statusCode: 200,
          body: JSON.stringify({ username: bodyData.username, idToken: res?.AuthenticationResult?.IdToken!, refreshToken: res?.AuthenticationResult?.RefreshToken!, policy_accepted: (patient as Patient).policy_accepted }),
        };
      }else{
        return {
          statusCode: 200,
          body: JSON.stringify({ username: bodyData.username, idToken: res?.AuthenticationResult?.IdToken!, refreshToken: res?.AuthenticationResult?.RefreshToken! }),
        };
      }
    } catch (err) {
      console.log("putAdminLogin error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }
}