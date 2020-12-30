"use strict";

const center = require('./center.js');

function cbw(cb) {
  return function (err, res) {
    if (err) {
      cb(err);
    } else {
      if (typeof res === 'object' && res.hasOwnProperty('body')) {
        cb(null, res.body);
      } else {
        cb(null, {});
      }
    }
  };
}

module.exports.getCenters = (event, context, cb) => center.getCenters({
  parameters: {
    limit: event.query.limit,
    next: event.query.next
  }
}, cbw(cb));

module.exports.postCenter = (event, context, cb) => center.postCenter({
  body: event.body
}, cbw(cb));

module.exports.getCenter = (event, context, cb) => center.getCenter({
  parameters: {
    userId: event.path.centerId
  }
}, cbw(cb));

module.exports.putCenter = (event, context, cb) => center.putCenter({
  parameters: {
    userId: event.path.centerId,
    body: event.body
  }
}, cbw(cb));