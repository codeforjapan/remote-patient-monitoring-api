"use strict";

export default class Validator {
  checkDynamoGetResultEmpty(res: any) {
    if (res == undefined) return true;
    if (Object.keys(res).length == 0) return true;
    return false;
  }
  checkDyanmoQueryResultEmpty(res: any) {
    console.log(res.Item);
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
      console.log("checkCenterBody Flase");
      return false;
    }
  }
  checkNurseBody(res: any) {
    if (
      res.hasOwnProperty("nurseName")
    ) {
      console.log("checkNurseBody True");
      return true;
    } else {
      console.log("checkNurseBody Flase");
      return false;
    }
  }
  checkPatientBody(res: any) {
    if (
      res.hasOwnProperty("patientName")
    ) {
      console.log("checkPatientBody True");
      return true;
    } else {
      console.log("checkPatientBody Flase");
      return false;
    }
  }
};