"use strict";
import { cors } from "aws-lambda-cors";
import { Admin } from "./admin";
import { Center } from "./center";
import { Patient } from "./patient";
import { Nurse } from "./nurse";
import { Status } from "./status";

const cors_get = {
  allowCredentials: true,
  allowOrigins: "*",
  allowMethods: ["OPTIONS", "HEAD", "GET"],
  allowHeaders: ["Authorization", "Content-Type"],
};
const cors_put = {
  allowCredentials: true,
  allowOrigins: "*",
  allowMethods: ["OPTIONS", "HEAD", "PUT"],
  allowHeaders: ["Authorization", "Content-Type"],
};

const cors_post = {
  allowCredentials: true,
  allowOrigins: "*",
  allowMethods: ["OPTIONS", "HEAD", "POST"],
  allowHeaders: ["Authorization", "Content-Type"],
};
// login
export const postAdminLogin = cors(cors_post)(Admin.postAdminLogin);
export const postNurseLogin = cors(cors_post)(Admin.postAdminLogin);
export const postPatientLogin = cors(cors_post)(Admin.postAdminLogin);

// centers
export const getCenters = cors(cors_get)(Center.getCenters);

export const getCenter = cors(cors_get)(Center.getCenter);
export const putCenter = cors(cors_put)(Center.putCenter);
export const postCenter = cors(cors_post)(Center.postCenter);

// patients
export const getPatients = cors(cors_get)(Patient.getPatients);

export const getPatient = cors(cors_get)(Patient.getPatient);
export const putPatient = cors(cors_put)(Patient.putPatient);
export const postPatient = cors(cors_post)(Patient.postPatient);
export const postAcceptPolicy = cors(cors_post)(Patient.acceptPolicy);
export const postInitializePatient = cors(cors_post)(Patient.initialize);

// nurses
export const getNurses = cors(cors_get)(Nurse.getNurses);

export const getNurse = cors(cors_get)(Nurse.getNurse);
export const putNurse = cors(cors_put)(Nurse.putNurse);
export const postNurse = cors(cors_post)(Nurse.postNurse);

// statuses
export const postStatus = cors(cors_post)(Status.postStatus);
export const getStatuses = cors(cors_post)(Status.getStatuses);
export const deleteStatus = cors(cors_post)(Status.deleteStatus);
