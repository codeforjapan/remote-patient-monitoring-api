"use strict";

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
    if (
      res.hasOwnProperty("centerName")
    ) {
      console.log("checkCenterBody True");
      return true;
    } else {
      console.log("checkCenterBody False");
      return false;
    }
  }
  checkNurseBody(res: any) {
    if (
      res.hasOwnProperty("nurseId")
    ) {
      console.log("checkNurseId True");
      return true;
    } else {
      console.log("checkNurseId False");
      return false;
    }
  }
  checkPatientBody(res: any) {
    if (
      res.hasOwnProperty("patientId")
      && res.hasOwnProperty("phone")
    ) {
      console.log("checkPatientBody True");
      return true;
    } else {
      console.log("checkPatientBody False");
      return false;
    }
  }
};