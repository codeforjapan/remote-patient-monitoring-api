var {
  cors
} = require('aws-lambda-cors');

import {
  getCenters,
  getCenter,
  postCenter,
  putCenter
}
from 'center';
import {
  getPatients,
  getPatient,
  postPatient,
  putPatient
}
from 'patient';
import {
  getNurses,
  getNurse,
  postNurse,
  putNurse
}
from 'nurse';

cors_get = (funcname) => {
  cors({
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
  })(funcname);
};
cors_put = (funcname) => {
  cors({
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
  })(funcname);
};
cors_post = (funcname) => {
  cors({
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
  })(funcname);
};

// centers
module.exports.getCenters = cors_get(getCenters);
module.exports.getCenter = cors_get(getCenter);
module.exports.putCenter = cors_put(putCenter);
module.exports.postCenter = cors_POST(postCenter);
// patients
module.exports.getPatients = cors_get(getPatients);
module.exports.getPatient = cors_get(getPatient);
module.exports.putPatient = cors_put(putPatient);
module.exports.postPatient = cors_POST(postPatient);
// nurses
module.exports.getNurses = cors_get(getNurses);
module.exports.getNurse = cors_get(getNurse);
module.exports.putNurse = cors_put(putNurse);
module.exports.postNurse = cors_POST(postNurse);