"use strict";

export default class Formatter {
  getCenterFormatter(queryResult: any) {
    return queryResult.Items[0];
  }
};