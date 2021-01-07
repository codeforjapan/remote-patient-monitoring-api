"use strict";
var AWS = require("aws-sdk");
var cors = require('aws-lambda-cors');

AWS.config.update({
  region: process.env.region
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10"
});
var CenterTable = require("../aws/centerTable");
var Validator = require("../util/validator");
var Formatter = require("../util/formatter");

const origGetCenters = async (event, context, callback) => {
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
      body: JSON.stringify(res),
    });
  } catch (err) {
    console.log("getCenterTable-index error");
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: err
      }),
    });
  }
};

module.exports.getCenters = cors.cors({
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
})(origGetCenters);

const origPostCenter = async (event, context, callback) => {
  console.log('called postCenter');
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
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: err
      }),
    });
  }
};

module.exports.postCenter = cors.cors({
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
})(origPostCenter);

const origGetCenter = async (event, context, callback) => {
  const centerTable = new CenterTable(docClient);
  const validator = new Validator();
  const formatter = new Formatter();
  console.log('call getCenter with ' + event.pathParameters.centerId);
  try {
    const res = await centerTable.getCenter(event.pathParameters.centerId);
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
      body: JSON.stringify(res.Item),
    });
  } catch (err) {
    console.log("getCenterTable-index error");
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: err
      }),
    });
  }
};

module.exports.getCenter = cors.cors({
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
})(origGetCenter);

const origPutCenter = async (event, context, callback) => {
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
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        error: err
      }),
    });
  }
};

module.exports.putCenter = cors.cors({
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
})(origPutCenter);