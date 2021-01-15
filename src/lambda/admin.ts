"use strict";
import { APIGatewayProxyHandler } from 'aws-lambda'
import { CognitoAdmin } from '../aws/cognito_admin'
import Validator from "../util/validator";

export namespace Admin {
  export const postAdminLogin: APIGatewayProxyHandler = async (event) => {
    try {
      console.log(event)
      const validator = new Validator();
      const bodyData = validator.jsonBody(event.body);

      const admin = new CognitoAdmin()
      const res = await admin.signIn(bodyData.username, bodyData.password);
      return {
        statusCode: 200,
        body: JSON.stringify({ username: bodyData.username, idToken: res?.AuthenticationResult?.IdToken! }),
      };
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