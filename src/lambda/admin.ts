"use strict";
import { CognitoAdmin } from '../aws/cognito_admin'


export namespace Admin {
  //@ts-ignore TS6133: 'event, context' is declared but its value is never read.
  export async function postAdminLogin(event: any, context: any, callback: Function) {
    try {
      const admin = new CognitoAdmin()
      const res = await admin.signIn(event.body.username, event.body.password);
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(res),
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