module.exports = {
  tables: [{
      TableName: `RemotePatientMonitoringCenterTable`,
      KeySchema: [{
        AttributeName: 'centerId',
        KeyType: 'HASH'
      }],
      AttributeDefinitions: [{
        AttributeName: 'centerId',
        AttributeType: 'S'
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
    },
    {
      TableName: `RemotePatientMonitoringNurseTable`,
      KeySchema: [{
        AttributeName: 'nurseId',
        KeyType: 'HASH'
      }],
      AttributeDefinitions: [{
        AttributeName: 'nurseId',
        AttributeType: 'S'
      }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      },
    },
  ],
};