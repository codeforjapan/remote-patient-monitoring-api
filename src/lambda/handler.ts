"use strict";
import { cors } from 'aws-lambda-cors';
import { Center } from './center';
import { Patient } from './patient';
import { Nurse } from './nurse';

const cors_get = {
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
};
const cors_put = {
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
};

const cors_post = {
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
};

// centers
export var getCenters = cors(cors_get)(Center.getCenters);

export var getCenter = cors(cors_get)(Center.getCenter);
export var putCenter = cors(cors_put)(Center.putCenter);
export var postCenter = cors(cors_post)(Center.postCenter);

// patients
export var getPatients = cors(cors_get)(Patient.getPatients);

export var getPatient = cors(cors_get)(Patient.getPatient);
export var putPatient = cors(cors_put)(Patient.putPatient);
export var postPatient = cors(cors_post)(Patient.postPatient);

// nurses
export var getNurses = cors(cors_get)(Nurse.getNurses);

export var getNurse = cors(cors_get)(Nurse.getNurse);
export var putNurse = cors(cors_put)(Nurse.putNurse);
export var postNurse = cors(cors_post)(Nurse.postNurse);
