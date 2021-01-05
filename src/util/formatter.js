"use strict";

module.exports = class Formatter {
  getCenterFormatter(queryResult) {
    return queryResult.Items[0];
  }
};