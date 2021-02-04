import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { NurseParam, PatientParam, StatusParam } from '../lambda/definitions/types';
import { loadDynamoDBClient } from '../util/dynamodbclient';
import PatientTable from '../aws/patientTable';
import Validator from '../util/validator';
import NurseTable from '../aws/nurseTable';
import { CognitoAdmin, Config } from '../aws/cognito_admin';
const docClient = loadDynamoDBClient();

AWS.config.update({
  region: process.env.region,
});

export namespace Status {
  const isCenterManagedByNurse = async (nurseId: string, centerId: string): Promise<boolean> => {
    const nurseTable = new NurseTable(docClient);
    const ret = await nurseTable.getNurse(nurseId);
    const nurse: NurseParam = ret as NurseParam;
    return nurse.manageCenters.findIndex((item) => item.centerId === centerId) > -1;
  };

  export const postStatus: APIGatewayProxyHandler = async (event) => {
    const patientTable = new PatientTable(docClient);
    const validator = new Validator();
    const bodyData = validator.jsonBody(event.body);
    try {
      if (!event.pathParameters || !event.pathParameters.patientId) {
        const errorModel = {
          errorCode: 'PRM00001',
          errorMessage: 'Patient Not Found',
        };
        return {
          statusCode: 404,
          body: JSON.stringify(errorModel),
        };
      }
      const patientId = event.pathParameters.patientId;
      // patientIdから療養者の方が属する保健所のIdを取得する
      const patient = (await patientTable.getPatient(patientId)) as PatientParam;
      const centerId = patient.centerId;
      const config: Config = {
        userPoolId: process.env.PATIENT_POOL_ID!,
        userPoolClientId: process.env.PATIENT_POOL_CLIENT_ID!,
      };
      const admin = new CognitoAdmin(config);
      // /api/nurse の場合
      if (validator.isNurseAPI(event)) {
        const nurseId = admin.getUserId(event);
        if (centerId !== null) {
          const errorModel = {
            errorCode: 'RPM00001',
            errorMessage: 'Not Found',
          };
          return {
            statusCode: 404,
            body: JSON.stringify({
              errorModel,
            }),
          };
        }
        // 観察者の方が属する保健所以外の場合はエラー
        if (!(await isCenterManagedByNurse(nurseId, centerId))) {
          const errorModel = {
            errorCode: 'RPM00101',
            errorMessage: 'Forbidden',
          };
          return {
            statusCode: 403,
            body: JSON.stringify(errorModel),
          };
        }
      }
      // /api/patient の場合
      if (validator.isPatientAPI(event)) {
        const selfId = admin.getUserId(event);
        // 認証情報から取得した自身のIdと指定Idが異なる場合はエラー
        if (selfId !== patientId) {
          const errorModel = {
            errorCode: 'RPM00101',
            errorMessage: 'Forbidden',
          };
          return {
            statusCode: 403,
            body: JSON.stringify(errorModel),
          };
        }
      }

      if (!validator.checkPatientStatusBody(bodyData) || !validator.checkPatientStatusSymptomBody(bodyData.symptom)) {
        const errorModel = {
          errorCode: 'PRM00002',
          errorMessage: 'Invalid Body',
        };
        return {
          statusCode: 400,
          body: JSON.stringify(errorModel),
        };
      }
      const param: StatusParam = bodyData;
      const res = await patientTable.postPatientStatus(patientId, centerId, param);
      return {
        statusCode: 201,
        body: JSON.stringify(res),
      };
    } catch (err) {
      const errorModel = { error: err };
      return {
        statusCode: 500,
        body: JSON.stringify(errorModel),
      };
    }
  };
}
