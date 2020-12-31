"use strict";
var AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.region
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10"
});
var CenterTable = require("../aws/centerTable");
var Validator = require("../util/validator");
var Formatter = require("../util/formatter");

module.exports.getCenters = async (event, context, callback) => {
  const centerTable = new CenterTable(docClient);
  const validator = new Validator();
  const formatter = new Formatter();
  try {
    const res = await centerTable.getCenters();
    if (validator.checkDyanmoQueryResultEmpty(res)) {
      const errorModel = {
        errorCode: "RPM00001",
        errorMessage: "Not Found",
      };
      callback(null, {
        statusCode: 404,
        body: JSON.stringify({
          errorModel,
        }),
      });
    }
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(formatter.getCenterFormatter(res)),
    });
  } catch (err) {
    console.log("getCenterTable-index error");
  }
};

module.exports.postCenter = async (event, context, callback) => {
  const centerTable = new CenterTable(docClient);
  const validator = new Validator();
  try {
    if (!validator.checkCenterBody(JSON.parse(event.body))) {
      const errorModel = {
        errorCode: "RPM00002",
        errorMessage: "Invalid Body",
      };
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          errorModel,
        }),
      });
    }
    const res = await centerTable.postCenter(JSON.parse(event.body));
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(res),
    });
  } catch (err) {
    console.log("postCenterTable-index error");
  }
};

module.exports.getCenter = async (event, context, callback) => {
  const centerTable = new CenterTable(docClient);
  const validator = new Validator();
  const formatter = new Formatter();
  try {
    const res = await centerTable.getCenters(event.pathParameters.centerId);
    if (validator.checkDyanmoQueryResultEmpty(res)) {
      const errorModel = {
        errorCode: "RPM00001",
        errorMessage: "Not Found",
      };
      callback(null, {
        statusCode: 404,
        body: JSON.stringify({
          errorModel,
        }),
      });
    }
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(formatter.getCenterFormatter(res)),
    });
  } catch (err) {
    console.log("getCenterTable-index error");
  }
};

module.exports.putCenter = async (event, context, callback) => {
  const centerTable = new CenterTable(docClient);
  const validator = new Validator();
  try {
    if (!validator.checkCenterBody(JSON.parse(event.body))) {
      const errorModel = {
        errorCode: "RPM00002",
        errorMessage: "Invalid Body",
      };
      callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          errorModel,
        }),
      });
    }
    const res = await centerTable.putCenter(
      event.pathParameters.centerId,
      JSON.parse(event.body)
    );
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(res),
    });
  } catch (err) {
    console.log("putCenterTable-index error");
  }
};