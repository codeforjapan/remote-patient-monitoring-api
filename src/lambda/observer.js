"use strict";
var AWS = require("aws-sdk");
var cors = require('aws-lambda-cors');

AWS.config.update({
  region: process.env.region
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10"
});
var ObserverTable = require("../aws/observerTable");
var Validator = require("../util/validator");
var Formatter = require("../util/formatter");

const origGetObservers = async (event, context, callback) => {
  const observerTable = new ObserverTable(docClient);
  const validator = new Validator();
  const formatter = new Formatter();
  try {
    const res = await observerTable.getObservers();
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
      body: JSON.stringify(res),
    });
  } catch (err) {
    console.log("getObserverTable-index error");
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: err
      }),
    });
  }
};

module.exports.getObservers = cors.cors({
  allowCredentials: true,
  allowOrigins: "*",
  allowMethods: [
    'OPTIONS',
    'HEAD',
    'GET'
  ],
  allowHeaders: [
    'Authorization',
    'Content-Type',
  ]
})(origGetObservers);

const origPostObserver = async (event, context, callback) => {
  console.log('called postObserver');
  const observerTable = new ObserverTable(docClient);
  const validator = new Validator();
  try {
    if (!validator.checkObserverBody(JSON.parse(event.body))) {
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
    const res = await observerTable.postObserver(JSON.parse(event.body));
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(res),
    });
  } catch (err) {
    console.log("postObserverTable-index error");
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: err
      }),
    });
  }
};

module.exports.postObserver = cors.cors({
  allowCredentials: true,
  allowOrigins: "*",
  allowMethods: [
    'OPTIONS',
    'HEAD',
    'POST'
  ],
  allowHeaders: [
    'Authorization',
    'Content-Type',
  ]
})(origPostObserver);

const origGetObserver = async (event, context, callback) => {
  const observerTable = new ObserverTable(docClient);
  const validator = new Validator();
  const formatter = new Formatter();
  console.log('call getObserver with ' + event.pathParameters.observerId);
  try {
    const res = await observerTable.getObserver(event.pathParameters.observerId);
    console.log(res);
    if (validator.checkDynamoGetResultEmpty(res)) {
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
    console.log(res);
    console.log(JSON.stringify(res));
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(res),
    });
  } catch (err) {
    console.log("getObserverTable-index error");
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: err
      }),
    });
  }
};

module.exports.getObserver = cors.cors({
  allowCredentials: true,
  allowOrigins: "*",
  allowMethods: [
    'OPTIONS',
    'HEAD',
    'GET'
  ],
  allowHeaders: [
    'Authorization',
    'Content-Type',
  ]
})(origGetObserver);

const origPutObserver = async (event, context, callback) => {
  const observerTable = new ObserverTable(docClient);
  const validator = new Validator();
  try {
    if (!validator.checkObserverBody(JSON.parse(event.body))) {
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
    const res = await observerTable.putObserver(
      event.pathParameters.observerId,
      JSON.parse(event.body)
    );
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(res),
    });
  } catch (err) {
    console.log("putObserverTable-index error");
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: err
      }),
    });
  }
};

module.exports.putObserver = cors.cors({
  allowCredentials: true,
  allowOrigins: "*",
  allowMethods: [
    'OPTIONS',
    'HEAD',
    'PUT'
  ],
  allowHeaders: [
    'Authorization',
    'Content-Type',
  ]
})(origPutObserver);