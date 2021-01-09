"use strict";

export default class Formatter {
  getCenterFormatter(queryResult) {
    return queryResult.Items[0];
  }
};