'use strict';
import { APIGatewayProxyEvent } from 'aws-lambda';

export default class Validator {
  jsonBody(bodyData: any) {
    if (typeof bodyData === 'string') {
      return JSON.parse(bodyData);
    } else {
      return bodyData;
    }
  }
  checkDynamoGetResultEmpty(res: any) {
    if (res == undefined) return true;
    if (Object.keys(res).length == 0) return true;
    return false;
  }
  checkDyanmoQueryResultEmpty(res: any) {
    console.log(res.Items);
    if (!Object.keys(res.Items).length) {
      return true;
    } else {
      return false;
    }
  }

  checkCenterBody(res: any) {
    if (res.hasOwnProperty('centerName')) {
      console.log('checkCenterBody True');
      return true;
    } else {
      console.log('checkCenterBody False');
      return false;
    }
  }
  checkNurseBody(res: any) {
    if (res.hasOwnProperty('nurseId')) {
      console.log('checkNurseId True');
      return true;
    } else {
      console.log('checkNurseId False');
      return false;
    }
  }
  checkPatientBody(res: any) {
    if (res.hasOwnProperty('patientId') && res.hasOwnProperty('phone')) {
      console.log('checkPatientBody True');
      return true;
    } else {
      console.log('checkPatientBody False');
      return false;
    }
  }
  checkPatientPutBody(res: any) {
    if (res.hasOwnProperty('phone')) {
      console.log('checkPatientBody True');
      return true;
    } else {
      console.log('checkPatientBody False');
      return false;
    }
  }

  checkPatientStatusBody(res: any) {
    if (res == null || typeof res !== 'object') {
      return false;
    }
    // 必須パラメータのチェック
    const requiredParams = [
      { name: 'SpO2', type: 'number' },
      { name: 'body_temperature', type: 'number' },
      { name: 'pulse', type: 'number' },
    ];
    return this.checkRequestBody(res, requiredParams);
  }

  checkPatientStatusSymptomBody(res: any): boolean {
    if (res == null || typeof res !== 'object') {
      return false;
    }

    // 任意パラメータのチェック
    if (res.remarks !== null && typeof res.remarks !== 'string') {
      return false;
    }

    //　必須パラメータのチェック
    const requiredParams = [
      { name: 'cough', type: 'boolean' },
      { name: 'phlegm', type: 'boolean' },
      { name: 'suffocation', type: 'boolean' },
      { name: 'headache', type: 'boolean' },
      { name: 'sore_throat', type: 'boolean' },
    ];
    return this.checkRequestBody(res, requiredParams);
  }

  checkRequestBody(res: object, requiredParams: { name: string; type: string }[]): boolean {
    for (let i = 0; i < requiredParams.length; i++) {
      const targetName = requiredParams[i].name;
      const targetType = requiredParams[i].type;
      if (res[targetName] !== null && typeof res[targetName] === targetType) {
        continue;
      } else {
        // 対象のパラメータのkeyが未定義の場合
        // 対象のパラメータのkeyがあり、valueが未指定の場合
        // 対象のValueが想定した型と異なる場合
        return false;
      }
    }
    return true;
  }

  isNurseAPI(event: APIGatewayProxyEvent) {
    console.log('isNurseAPI called');
    if (!event.path) return false;
    return event.path.startsWith('/api/nurse/');
  }

  isPatientAPI(event: APIGatewayProxyEvent) {
    console.log('isPatientAPI called');
    if (!event.path) return false;
    return event.path.startsWith('/api/patient/');
  }
}
