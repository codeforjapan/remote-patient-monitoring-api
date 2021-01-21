/*global serverless */
'use strict';

const fs = require('fs');

const provider = serverless.service.provider;
const awsProvider = serverless.getProvider('aws');

const listStackResources = async (resources, nextToken) => {
  resources = resources || [];
  const response = await awsProvider.request('CloudFormation', 'listStackResources', {
    StackName: awsProvider.naming.getStackName(),
    NextToken: nextToken
  });
  resources.push(...response.StackResourceSummaries);

  if (response.NextToken) {
    return listStackResources(resources, response.NextToken);
  }

  return resources;
};

const createConfig = stackResources => ({
  region: provider.region,
  cognito: {
    identityPoolId: getPhysicalId(stackResources, 'RPMAdminIdentityProvider'),
    adminUserPoolId: getPhysicalId(stackResources, 'RPMAdminUserPool'),
    adminUserPoolWebClientId: getPhysicalId(stackResources, 'RPMAdminAppClient'),
    nurseUserPoolId: getPhysicalId(stackResources, 'RPMNurseUserPool'),
    nurseUserPoolWebClientId: getPhysicalId(stackResources, 'RPMNurseAppClient'),
    patientUserPoolId: getPhysicalId(stackResources, 'RPMPatientUserPool'),
    patientUserPoolWebClientId: getPhysicalId(stackResources, 'RPMPatientAppClient')
  },
  distribution: {
    SwaggerUIDistribution: getPhysicalId(stackResources, 'SwaggerDistribution')
  }
});

const getPhysicalId = (stackResources, logicalId) => {
  return stackResources.find(r => r.LogicalResourceId === logicalId).PhysicalResourceId || '';
};

const writeConfigFile = config => {
  fs.writeFileSync('./util/config.json', JSON.stringify(config));
};

listStackResources()
  .then(createConfig)
  .then(writeConfigFile);