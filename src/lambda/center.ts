"use strict";
import AWS from "aws-sdk";
import { APIGatewayProxyHandler } from 'aws-lambda'
var dynamodb = require('serverless-dynamodb-client');

AWS.config.update({
  region: process.env.region
});
var docClient = dynamodb.doc;
import CenterTable from "../aws/centerTable";
import Validator from "../util/validator";

export namespace Center {
  export const getCenters: APIGatewayProxyHandler = async () => {
    const centerTable = new CenterTable(docClient);
    const validator = new Validator();
    try {
      const res = await centerTable.getCenters();
      if (validator.checkDyanmoQueryResultEmpty(res)) {
        const errorModel = {
          errorCode: "RPM00001",
          errorMessage: "Not Found",
        };
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorModel,
          }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (err) {
      console.log("getCenterTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const postCenter: APIGatewayProxyHandler = async (event) => {
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
        return {
          statusCode: 400,
          body: JSON.stringify({
            errorModel,
          }),
        };
      }
      const res = await centerTable.postCenter(bodyData);
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (err) {
      console.log("postCenterTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const getCenter: APIGatewayProxyHandler = async (event) => {
    const centerTable = new CenterTable(docClient);
    const validator = new Validator();
    if (!event.pathParameters || !event.pathParameters.centerId) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          errorCode: "RPM00001",
          errorMessage: 'Not Found'
        })
      }
    }
    console.log('call getCenter with ' + event.pathParameters.centerId);
    try {
      const res = await centerTable.getCenter(event.pathParameters.centerId);
      console.log(res);
      if (validator.checkDynamoGetResultEmpty(res)) {
        const errorModel = {
          errorCode: "RPM00001",
          errorMessage: "Not Found",
        };
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorModel,
          }),
        };
      }
      console.log(res);
      console.log(JSON.stringify(res));
      return {
        statusCode: 200,
        body: JSON.stringify((res as AWS.DynamoDB.GetItemOutput).Item),
      };
    } catch (err) {
      console.log("getCenterTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }

  export const putCenter: APIGatewayProxyHandler = async (event) => {
    const centerTable = new CenterTable(docClient);
    const validator = new Validator();
    const bodyData = validator.jsonBody(event.body);
    try {
      if (!validator.checkCenterBody(bodyData)) {
        const errorModel = {
          errorCode: "RPM00002",
          errorMessage: "Invalid Body",
        };
        return {
          statusCode: 400,
          body: JSON.stringify({
            errorModel,
          }),
        };
      }
      if (!event.pathParameters || !event.pathParameters.centerId) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            errorCode: "RPM00001",
            errorMessage: 'Not Found'
          })
        }
      }
      const res = await centerTable.putCenter(
        event.pathParameters.centerId,
        bodyData
      );
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (err) {
      console.log("putCenterTable-index error");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err
        }),
      };
    }
  }
}