/* global serverless, options */
'use strict';

const fs = require('fs');

//@ts-ignore
const provider = serverless.service.provider;
//@ts-ignore
const awsProvider = serverless.getProvider('aws');

const listStackResources = async (resources?: any, nextToken?: string): Promise<any> => {
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

const createConfig = (stackResources: any) => ({
  region: provider.region,
  stage: provider.stage,
  cognito: {
    identityPoolId: getPhysicalId(stackResources, 'RPMAdminIdentityProvider'),
    adminUserPoolId: getPhysicalId(stackResources, 'RPMAdminUserPool'),
    adminUserPoolWebClientId: getPhysicalId(stackResources, 'RPMAdminAppClient'),
    nurseUserPoolId: getPhysicalId(stackResources, 'RPMNurseUserPool'),
    nurseUserPoolWebClientId: getPhysicalId(stackResources, 'RPMNurseAppClient'),
    patientUserPoolId: getPhysicalId(stackResources, 'RPMPatientUserPool'),
    patientUserPoolWebClientId: getPhysicalId(stackResources, 'RPMPatientAppClient'),
    oauthDomain: `${getPhysicalId(stackResources, 'AdminUserPoolDomain')}.auth.${provider.region}.amazoncognito.com`,
  },
  apiGateway: {
    restApiId: getPhysicalId(stackResources, 'ApiGatewayRestApi'),
    stageName: provider.stage,
  },
});

const getPhysicalId = (stackResources: any, logicalId: string) => {
  return stackResources.find((r: any) => r.LogicalResourceId === logicalId).PhysicalResourceId || '';
};

const writeConfigFile = (config: any) => {
  fs.writeFileSync('./src/webpack/config.json', JSON.stringify(config));
};

listStackResources()
  .then(createConfig)
  .then(writeConfigFile);