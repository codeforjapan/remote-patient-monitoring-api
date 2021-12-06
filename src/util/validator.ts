"use strict";
import { APIGatewayProxyEvent } from "aws-lambda";
export default class Validator {
  replaceAll(string: string, search: string, replace: string): string {
    return string.split(search).join(replace);
  }
  normalizePhone(phone: string): string {
    return this.replaceAll(phone, "-", "");
  }
  hasProperty = (obj: any, key: string): boolean => {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
  };
  jsonBody(bodyData: any) {
    if (typeof bodyData === "string") {
      return JSON.parse(bodyData);
    } else {
      return bodyData;
    }
  }
  checkDynamoGetResultEmpty(res: any) {
    if (res == undefined) return true;
    if (Object.keys(res).length == 0) return true;
    return false;
  }
  checkDyanmoQueryResultEmpty(res: any) {
    if (!Object.keys(res.Items).length) {
      return true;
    } else {
      return false;
    }
  }

  checkCenterBody(res: any) {
    if (
      !this.hasProperty(res, "centerName") &&
      !this.hasProperty(res, "emergencyPhone")
    ) {
      return false;
    } else {
      return true;
    }
  }
  checkNurseBody(res: any) {
    if (this.hasProperty(res, "nurseId")) {
      return true;
    } else {
      return false;
    }
  }
  checkPatientBody(res: any) {
    if (this.hasProperty(res, "phone")) {
      return true;
    } else {
      return false;
    }
  }
  checkPatientPutBody(res: any) {
    if (this.hasProperty(res, "phone")) {
      return true;
    } else {
      return false;
    }
  }

  checkPatientStatusBody(res: any) {
    if (res == null || typeof res !== "object") {
      return false;
    }
    // 必須パラメータのチェック
    const requiredParams = [
      { name: "SpO2", type: "number" },
      { name: "body_temperature", type: "number" },
      { name: "pulse", type: "number" },
    ];
    return this.checkRequestBody(res, requiredParams);
  }

  checkPatientStatusSymptomBody(res: any): boolean {
    // symptomは任意パラメータなので未定義の場合はtrue
    if (res == null) {
      return true;
    }
    if (res != null && typeof res !== "object") {
      return false;
    }

    // 任意パラメータのチェック
    const remarks = res.remarks;
    if (remarks != null && typeof remarks !== "string") {
      return false;
    }

    // 必須パラメータのチェック
    const requiredParams: { name: string; type: string }[] = [
      { name: "cough", type: "boolean" },
      { name: "phlegm", type: "boolean" },
      { name: "suffocation", type: "boolean" },
      { name: "headache", type: "boolean" },
      { name: "sore_throat", type: "boolean" },
      { name: "malaise", type: "boolean" },
      { name: "nausea", type: "boolean" },
      { name: "diarrhea", type: "boolean" },
      { name: "difficulty_eating", type: "boolean" },
      { name: "no_urination", type: "boolean" },
    ];
    return this.checkRequestBody(res, requiredParams);
  }

  checkRequestBody(
    res: { [key: string]: string },
    requiredParams: { name: string; type: string }[]
  ): boolean {
    for (let i = 0; i < requiredParams.length; i++) {
      const name = requiredParams[i].name;
      const type = requiredParams[i].type;
      if (res[name] != null && typeof res[name] === type) {
        continue;
      } else {
        // 対象のパラメータのkeyが未定義の場合
        // 対象のパラメータのkeyがあり、valueが未指定の場合
        // 対象のvalueが想定した型と異なる場合
        return false;
      }
    }
    return true;
  }

  isNurseAPI(event: APIGatewayProxyEvent): boolean {
    if (!event.path) return false;
    return (
      event.path.startsWith("/api/nurse/") ||
      event.path.startsWith("/stg/api/nurse/") ||
      event.path.startsWith("/prd/api/nurse/")
    );
  }

  isPatientAPI(event: APIGatewayProxyEvent): boolean {
    if (!event.path) return false;
    return (
      event.path.startsWith("/api/patient/") ||
      event.path.startsWith("/stg/api/patient/") ||
      event.path.startsWith("/prd/api/patient/")
    );
  }
}
