"use strict";
import AWS from "aws-sdk";

AWS.config.update({
  region: process.env.region
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10"
});
import CenterTable from "../aws/centerTable";
import Validator from "../util/validator";
import Formatter from "../util/formatter";

export namespace Center {
  export async function getCenters(event: any, context: any, callback: Function) {
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
  }

  export async function postCenter(event: any, context: any, callback: Function) {
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
  }

  export async function getCenter(event: any, context: any, callback: Function) {
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

  export async function putCenter(event: any, context: any, callback: Function) {
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
  }
}