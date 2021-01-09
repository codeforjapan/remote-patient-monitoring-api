"use strict";
var {
  cors
} = require('aws-lambda-cors');

const center = require('./center');
const patient = require('./patient');
const nurse = require('./nurse');;

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
module.exports.getCenters = cors(cors_get)(center.getCenters);
module.exports.getCenter = cors(cors_get)(center.getCenter);
module.exports.putCenter = cors(cors_put)(center.putCenter);
module.exports.postCenter = cors(cors_post)(center.postCenter);

// patients
module.exports.getPatients = cors(cors_get)(patient.getPatients);
module.exports.getPatient = cors(cors_get)(patient.getPatient);
module.exports.putPatient = cors(cors_put)(patient.putPatient);
module.exports.postPatient = cors(cors_post)(patient.postPatient);

// nurses
module.exports.getNurses = cors(cors_get)(nurse.getNurses);
module.exports.getNurse = cors(cors_get)(nurse.getNurse);
module.exports.putNurse = cors(cors_put)(nurse.putNurse);
module.exports.postNurse = cors(cors_post)(nurse.postNurse);