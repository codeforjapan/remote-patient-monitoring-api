"use strict";
import { CognitoAdmin } from '../aws/cognito_admin'

import Validator from "../util/validator";

export namespace Admin {
  //@ts-ignore TS6133: 'event, context' is declared but its value is never read.
  export async function postAdminLogin(event: any, context: any, callback: Function) {
    try {
      console.log(event)
      const validator = new Validator();
      const bodyData = validator.jsonBody(event.body);

      const admin = new CognitoAdmin()
      const res = await admin.signIn(bodyData.username, bodyData.password);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({ username: bodyData.username, idToken: res?.AuthenticationResult?.IdToken! }),
      });
    } catch (err) {
      console.log("putAdminLogin error");
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      });
    }
  }
}