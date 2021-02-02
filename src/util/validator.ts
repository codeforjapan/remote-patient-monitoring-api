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
    const requiredParamList = ['SpO2', 'body_temperature', 'pulse'];
    for (let i = 0; i < requiredParamList.length; i++) {
      if (res.hasOwnProperty(requiredParamList[i])) {
        continue;
      } else {
        console.log('check PatientStatusBody False');
        return false;
      }
    }
    console.log('check PatientStatusBody True');
    return true;
  }

  checkPatientStatusSymptomBody(res: any) {
    // symptomが指定されていない場合はパラメータチェックをしない
    if (res == null) {
      return true;
    }
    const requiredParamList = ['cough', 'phlegm', 'suffocation', 'headache', 'sore_throat'];
    for (let i = 0; i < requiredParamList.length; i++) {
      if (res.hasOwnProperty(requiredParamList[i])) {
        console.log('check PatientStatusSymptomBody False');
        continue;
      } else {
        return false;
      }
    }
    console.log('check PatientStatusSymptomBody True');
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
