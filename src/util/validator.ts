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
    console.log('validate post status');
    return this.checkRequestBody(res, requiredParams);
  }

  checkPatientStatusSymptomBody(res: any): boolean {
    // symptomは任意パラメータなので未定義の場合はtrue
    if (res == null) {
      return true;
    }
    if (res != null && typeof res !== 'object') {
      console.log('symptom invalid type');
      return false;
    }

    // 任意パラメータのチェック
    const remarks = res.remarks;
    if (remarks != null && typeof remarks !== 'string') {
      console.log('remarks invalid type');
      return false;
    }

    //　必須パラメータのチェック
    const requiredParams: { name: string; type: string }[] = [
      { name: 'cough', type: 'boolean' },
      { name: 'phlegm', type: 'boolean' },
      { name: 'suffocation', type: 'boolean' },
      { name: 'headache', type: 'boolean' },
      { name: 'sore_throat', type: 'boolean' },
    ];
    console.log('validate post status.symptom');
    return this.checkRequestBody(res, requiredParams);
  }

  checkRequestBody(res: { [key: string]: string }, requiredParams: { name: string; type: string }[]): boolean {
    for (let i = 0; i < requiredParams.length; i++) {
      const name = requiredParams[i].name;
      const type = requiredParams[i].type;
      if (res[name] != null && typeof res[name] === type) {
        continue;
      } else {
        // 対象のパラメータのkeyが未定義の場合
        // 対象のパラメータのkeyがあり、valueが未指定の場合
        // 対象のvalueが想定した型と異なる場合
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
