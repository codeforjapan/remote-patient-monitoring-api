var uuid = require('node-uuid');
var AWS = require('aws-sdk');
var db = new AWS.DynamoDB();

function mapCenterItem(item) {
  return {
    "uid": item.uid.S,
    "name": item.name.S
  };
}
exports.getCenters = function (event, cb) {
  console.log("getUsers", JSON.stringify(event));
  var params = {
    "TableName": "health-center",
    "Limit": event.parameters.limit || 10
  };
  if (event.parameters.next) {
    params.ExclusiveStartKey = {
      "uid": {
        "S": event.parameters.next
      }
    };
  }
  db.scan(params, function (err, data) {
    if (err) {
      cb(err);
    } else {
      var res = {
        "body": data.Items.map(mapCenterItem)
      };
      if (data.LastEvaluatedKey !== undefined) {
        res.headers = {
          "next": data.LastEvaluatedKey.uid.S
        };
      }
      cb(null, res);
    }
  });
};

exports.postCenter = function (event, cb) {
  console.log("postCenter", JSON.stringify(event));
  var uid = uuid.v4();
  var params = {
    "Item": {
      "uid": {
        "S": uid
      },
      "name": {
        "S": event.body.name
      }
    },
    "TableName": "health-center",
    "ConditionExpression": "attribute_not_exists(uid)"
  };
  db.putItem(params, function (err) {
    if (err) {
      cb(err);
    } else {
      cb(null, {
        "headers": {
          "uid": uid
        },
        "body": mapCenterItem(params.Item)
      });
    }
  });
};

exports.getCenter = function (event, cb) {
  console.log("getCenter", JSON.stringify(event));
  var params = {
    "Key": {
      "uid": {
        "S": event.parameters.centerId
      }
    },
    "TableName": "health-center"
  };
  db.getItem(params, function (err, data) {
    if (err) {
      cb(err);
    } else {
      if (data.Item) {
        cb(null, {
          "body": mapCenterItem(data.Item)
        });
      } else {
        cb(new Error('not found'));
      }
    }
  });
};

exports.putCenter = function (event, cb) {
  console.log("putCenter", JSON.stringify(event));

};