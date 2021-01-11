"use strict";
import AWS from "aws-sdk";
var dynamodb = require('serverless-dynamodb-client');

AWS.config.update({
  region: process.env.region
});
var docClient = dynamodb.doc;
import CenterTable from "../aws/centerTable";
import Validator from "../util/validator";

export namespace Center {
  //@ts-ignore TS6133: 'event, context' is declared but its value is never read.
  export async function getCenters(event: any, context: any, callback: Function) {
    const centerTable = new CenterTable(docClient);
    const validator = new Validator();
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
  }

  //@ts-ignore TS6133: 'event, context' is declared but its value is never read.
  export async function postCenter(event: any, context: any, callback: Function) {
    console.log('called postCenter');
    const centerTable = new CenterTable(docClient);
    const validator = new Validator();
    console.log(event.body);
    const bodyData = validator.jsonBody(event.body);
    try {
      if (!validator.checkCenterBody(bodyData)) {
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
      const res = await centerTable.postCenter(bodyData);
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
  }

  //@ts-ignore TS6133: 'event, context' is declared but its value is never read.
  export async function getCenter(event: any, context: any, callback: Function) {
    const centerTable = new CenterTable(docClient);
    const validator = new Validator();
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
        body: JSON.stringify((res as AWS.DynamoDB.GetItemOutput).Item),
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
  }

  //@ts-ignore TS6133: 'event, context' is declared but its value is never read.
  export async function putCenter(event: any, context: any, callback: Function) {
    const centerTable = new CenterTable(docClient);
    const validator = new Validator();
    const bodyData = validator.jsonBody(event.body);
    try {
      if (!validator.checkCenterBody(bodyData)) {
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
        bodyData
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
  }
}