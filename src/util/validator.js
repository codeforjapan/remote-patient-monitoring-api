"use strict";

module.exports = class Validator {
  checkDynamoGetResultEmpty(res) {
    if (res == undefined) return true;
    if (Object.keys(res).length == 0) return true;
    return false;
  }
  checkDyanmoQueryResultEmpty(res) {
    console.log(res.Item);
    if (!Object.keys(res.Items).length) {
      return true;
    } else {
      return false;
    }
  }

  checkCenterBody(res) {
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
  checkNurseBody(res) {
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
  checkPatientBody(res) {
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