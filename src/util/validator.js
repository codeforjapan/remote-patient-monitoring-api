"use strict";

module.exports = class Validator {
  checkDyanmoQueryResultEmpty(res) {
    console.log(res.Item);
    if (!Object.keys(res.Items).length) {
      return true;
    } else {
      return false;
    }
  }

  checkClientBody(res) {
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
};