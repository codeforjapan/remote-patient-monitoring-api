"use strict";
import { v4 as uuid } from "uuid";
import { APIGatewayProxyHandler } from "aws-lambda";
import AWS, { DynamoDB } from "aws-sdk";
import {
  Center,
  NurseParam,
  Status,
  PatientParam,
  TempLoginParam,
  TempLoginResult
} from "../lambda/definitions/types";
import { CognitoAdmin, Config } from "../aws/cognito_admin";
import { loadDynamoDBClient } from "../util/dynamodbclient";
import { SMSSender, LoginInfo } from "../util/smssender";

const docClient = loadDynamoDBClient();

AWS.config.update({
  region: process.env.region,
});
import CenterTable from "../aws/centerTable";
import PatientTable from "../aws/patientTable";
import Validator from "../util/validator";
import NurseTable from "../aws/nurseTable";
import TempLoginTable from "../aws/tempLoginTable";

const sendLoginURLSMS = async (param: {
  phone: string;
  loginKey: string;
}): Promise<{ status: string; messageId?: string }> => {
  // getIdToken using new user id/password
  const endpoint = process.env.SMS_ENDPOINT!;
  const logininfo: LoginInfo = {
    securityKey: process.env.SMS_SECURITYKEY || "",
    accessKey: process.env.SMS_ACCESSKEY || "",
  };
  let loginURL = "http://localhost:8000/#/login/";
  if (process.env.STAGE && (process.env.STAGE == "stg" || process.env.STAGE == "prd")) {
    loginURL = process.env.LOGINURL || loginURL;
    const smsSender = new SMSSender(endpoint, logininfo);
    console.log("Call SEND SMS");
    const url = loginURL + param.loginKey;
    const res = await smsSender.sendSMS(param.phone, `体調入力URL: ${url}`);
    return Promise.resolve(res);
  } else {
    return Promise.resolve({ status: "100", messageid: param.loginKey });
  }
};

/**
 * A data handler for  Patients
 */
export namespace Patient {
  const sliceStatus = (patient: PatientParam, limit = -1): PatientParam => {
    // ステータスを指定した件数に絞る
    if (patient.statuses) {
      patient.statuses = sortStatus(patient.statuses);
      if (limit > -1 && patient.statuses.length > limit) {
        patient.statuses.splice(limit, patient.statuses.length - limit);
      }
    }
    return patient;
  };
  export const sortStatus = (statuses: Status[]): Status[] => {
    // ステータスを指定した件数に絞る
    statuses.sort((a, b) => {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });
    return statuses;
  };
  const isCenterManagedByNurse = async (
    nurseId: string,
    centerId: string
  ): Promise<boolean> => {
    const nurseTable = new NurseTable(docClient);
    const ret = await nurseTable.getNurse(nurseId);
    const nurse: NurseParam = ret as NurseParam;
    return (
      nurse.manageCenters.findIndex((item) => item.centerId === centerId) > -1
    );
  };
  export const getPatients: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    try {
      if (!event.pathParameters || !event.pathParameters.centerId) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorCode: "RPM00001",
            errorMessage: "Center Not Found",
          }),
        };
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
          userPoolClientId: process.env.NURSE_POOL_CLIENT_ID!,
        };
        const admin = new CognitoAdmin(config);
        const nurseId = admin.getUserId(event);
        if (!nurseId) {
          throw new Error("nurseId is not found");
        }
        if (
          !(await isCenterManagedByNurse(
            nurseId,
            event.pathParameters.centerId
          ))
        ) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: "Forbidden",
            }),
          };
        }
      }
      const myres = res as DynamoDB.DocumentClient.ScanOutput;
      const items = myres.Items?.map((item: any) => {
        if (item.statuses) {
          item = sliceStatus(item, 20);
        }
        return item;
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ Count: myres.Count, Items: items }),
      };
    } catch (err) {
      console.log("getPatientTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  };

  export const postPatient: APIGatewayProxyHandler = async (event) => {
    console.log("called postPatient");
    const patientTable = new PatientTable(docClient);
    const tmpLoginTable = new TempLoginTable(docClient);
    const validator = new Validator();
    const bodyData: PatientParam = validator.jsonBody(event.body);
    bodyData.phone = validator.normalizePhone(bodyData.phone)
    if (!event.pathParameters || !event.pathParameters.centerId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          errorCode: "RPM00001",
          errorMessage: "Center Not Found",
        }),
      };
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
        userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!,
      };
      const admin = new CognitoAdmin(config);
      // check if the center is managable by this user
      if (validator.isNurseAPI(event)) {
        const nurseId = admin.getUserId(event);
        if (!nurseId) {
          throw new Error("nurseId is not found");
        }
        if (
          !(await isCenterManagedByNurse(
            nurseId,
            event.pathParameters.centerId
          ))
        ) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: "Forbidden",
            }),
          };
        }
      }
      const phoneExists = await patientTable.searchPhone(bodyData.phone);
      if (phoneExists) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            errorCode: "RPM00103",
            errorMessage: "Phone already exists",
          }),
        };
      }
      console.log("create new user");
      const patientId = bodyData.patientId || uuid();
      const newuser = await admin.signUp(patientId);
      console.log(newuser);
      const param: PatientParam = {
        patientId: patientId,
        phone: bodyData.phone,
        display: true,
        memo: bodyData.memo || "",
        policy_accepted: undefined,
        centerId: event.pathParameters.centerId,
        statuses: [],
      };
      try {
        await patientTable.postPatient(param);
        // テンポラリのログインコードを発行しSMSで送信する
        const ret = await tmpLoginTable.postToken({
          patientId: patientId,
          loginKey: uuid(),
          phone: bodyData.phone,
        });
        if (!ret) {
          return {
            statusCode: 500,
            body: JSON.stringify({
              errorCode: "RPM00999",
              errorMessage: "Something error occurred",
            }),
          };
        }
        if (bodyData.sendSMS === true) {
          const res = await sendLoginURLSMS({
            phone: bodyData.phone,
            loginKey: (ret as TempLoginResult).loginKey,
          });
          if (res.status !== "100") {
            console.log("SMS Failed");
            return {
              statusCode: 400,
              body: JSON.stringify({
                errorCode: "RPM00104",
                errorMessage: "User was created but sending SMS failed",
              }),
            };
          }
        }
        return {
          statusCode: 201,
          body: JSON.stringify({
            ...param,
            password: newuser.password,
            loginKey: (ret as TempLoginResult).loginKey,
          }),
        };
      } catch (err) {
        console.log("error occurred");
        console.log(err);
        return {
          statusCode: 400,
          body: err,
        };
      }
    } catch (err) {
      console.log("postPatientTable-index error");
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  };

  export const getPatient: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const centerTable = new CenterTable(docClient);
    const validator = new Validator();
    if (!event.pathParameters || !event.pathParameters.patientId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          errorCode: "RPM00001",
          errorMessage: "Not Found",
        }),
      };
    }
    const config: Config = {
      userPoolId: process.env.PATIENT_POOL_ID!,
      userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!,
    };
    const admin = new CognitoAdmin(config);
    try {
      if (validator.isPatientAPI(event)) {
        const patientId = admin.getUserId(event);
        if (patientId != event.pathParameters.patientId) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: "Forbidden",
            }),
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

        if (!nurseId) {
          throw new Error("nurseId is not found");
        }
        if (
          !(await isCenterManagedByNurse(
            nurseId,
            (res as PatientParam).centerId
          ))
        ) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: "Forbidden",
            }),
          };
        }
      }
      const patient = sliceStatus(res as PatientParam, 20);
      const center: Center = (await centerTable.getCenter(
        patient.centerId
      )) as Center;
      return {
        statusCode: 200,
        body: JSON.stringify({
          ...patient,
          centerId: center.centerId,
          centerName: center.centerName,
          emergencyPhone: center.emergencyPhone,
        }),
      };
    } catch (err) {
      console.log("getPatientTable-index error");
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  };

  export const putPatient: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    const bodyData: PatientParam = validator.jsonBody(event.body);
    bodyData.phone = validator.normalizePhone(bodyData.phone)
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
            errorMessage: "Not Found",
          }),
        };
      }
      const config: Config = {
        userPoolId: process.env.PATIENT_POOL_ID!,
        userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!,
      };
      const admin = new CognitoAdmin(config);
      if (validator.isNurseAPI(event)) {
        const nurseId = admin.getUserId(event);
        const res = await patientTable.getPatient(
          event.pathParameters.patientId
        );
        if (!nurseId) {
          throw new Error("nurseId is not found");
        }
        if (
          !(await isCenterManagedByNurse(
            nurseId,
            (res as PatientParam).centerId
          )) ||
          !(await isCenterManagedByNurse(nurseId, bodyData.centerId))
        ) {
          return {
            statusCode: 403,
            body: JSON.stringify({
              errorCode: "RPM00101",
              errorMessage: "Forbidden",
            }),
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
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  };

  export const acceptPolicy: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    try {
      if (!event.pathParameters || !event.pathParameters.patientId) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorCode: "RPM00001",
            errorMessage: "Not Found",
          }),
        };
      }
      if (!validator.isPatientAPI(event)) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            errorCode: "RPM00101",
            errorMessage: "Forbidden",
          }),
        };
      }
      const config: Config = {
        userPoolId: process.env.PATIENT_POOL_ID!,
        userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!,
      };
      const admin = new CognitoAdmin(config);
      const patientId = admin.getUserId(event);
      // 自分のポリシーしか accept できない
      if (event.pathParameters.patientId != patientId) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            errorCode: "RPM00101",
            errorMessage: "Forbidden",
          }),
        };
      }
      const res = await patientTable.acceptPolicy(
        event.pathParameters.patientId
      );
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (err) {
      console.log("acceptPolicy error");
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  };

  export const initialize: APIGatewayProxyHandler = async (event) => {
    const tempLoginTable = new TempLoginTable(docClient);
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    try {
      if (!validator.isPatientAPI(event)) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            errorCode: "RPM00101",
            errorMessage: "Forbidden",
          }),
        };
      }
      // ログインキーが保存されているか確認する
      const bodyParam: { loginKey: string } = validator.jsonBody(event.body);
      const loginResult = await tempLoginTable.searchPhone(bodyParam.loginKey);
      if (!loginResult) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            errorCode: "RPM00101",
            errorMessage: "Forbidden",
          }),
        };
      }
      let created = new Date(loginResult.created);
      created = new Date(created.getTime() + 24 * 60 * 60 * 1000);
      if (created.getTime() < new Date().getTime()) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            errorCode: "RPM00101",
            errorMessage: "Forbidden",
          }),
        };
      }
      const config: Config = {
        userPoolId: process.env.PATIENT_POOL_ID!,
        userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!,
      };
      const admin = new CognitoAdmin(config);
      const user = await admin.initialize(loginResult.patientId);
      const paticipant = await patientTable.getPatient(loginResult.patientId)
      return {
        statusCode: 200,
        body: JSON.stringify({...user, policy_accepted: (paticipant as PatientParam).policy_accepted}),
      };
    } catch (err) {
      console.log("acceptPolicy error");
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  };
  export const sendLoginURL: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const tmpLoginTable = new TempLoginTable(docClient);
    const validator = new Validator();
    if (!event.body) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          errorCode: "RPM00999",
          errorMessage: "Something errro occurred",
        }),
      };
    
    }
    const bodyData: TempLoginParam = validator.jsonBody(event.body);
    if (bodyData.phone) {
      bodyData.phone = validator.normalizePhone(bodyData.phone)
    }
    try {
      if (!validator.isPatientAPI(event)) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            errorCode: "RPM00101",
            errorMessage: "Forbidden",
          }),
        };
      }
      if (!bodyData.phone) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            errorCode: "RPM00101",
            errorMessage: "Forbidden",
          }),
        };
      }
      const patientId = await patientTable.searchPhone(bodyData.phone);
      if (!patientId) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorCode: "RPM00001",
            errorMessage: "Patient Not Found",
          }),
        };
      }
      const ret = await tmpLoginTable.postToken({
        patientId: patientId,
        loginKey: uuid(),
        phone: bodyData.phone,
      });
      if (!ret) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            errorCode: "RPM00999",
            errorMessage: "Something errro occurred",
          }),
        };
      }
      if (bodyData.sendSMS === true) {
        const res = await sendLoginURLSMS({
          phone: bodyData.phone,
          loginKey: (ret as TempLoginResult).loginKey,
        });
        if (res.status !== "100") {
          console.log("SMS Failed");
          return {
            statusCode: 400,
            body: JSON.stringify({
              errorCode: "RPM00104",
              errorMessage: "User was created but sending SMS failed",
            }),
          };
        }
      }
      // 本番環境の場合、loginKey は返さない
      if (process.env.STAGE && process.env.STAGE == "prd") {
        return {
          statusCode: 200,
          body: JSON.stringify({
            phone: bodyData.phone,
          }),
        };
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify({
            phone: bodyData.phone,
            loginKey: (ret as TempLoginResult).loginKey,
          }),
        };
      }
    } catch (err) {
      console.log("send login url error");
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err,
        }),
      };
    }
  };
}
