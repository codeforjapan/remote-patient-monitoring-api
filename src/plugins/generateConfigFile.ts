/* global serverless, options */
'use strict';

const fs = require('fs');

//@ts-ignore
const provider = serverless.service.provider;
//@ts-ignore
const awsProvider = serverless.getProvider('aws');
const CONFIG_FILE = './src/webpack/config.json';

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
  distribution: {
    SwaggerUIDistribution: getPhysicalId(stackResources, 'SwaggerDistribution')
  }
});

const isFileExists = (path: string) => {
  try {
    fs.statSync(path);
    return true
  } catch (e) {
    return false
  }
}
const mergeConfigResources = (config: any) => {
  console.log('mergeConfigResources');
  if (isFileExists(CONFIG_FILE)) {
    console.log('file exists');
    const configs = JSON.parse(fs.readFileSync(CONFIG_FILE))
    if (configs.constructor === Array && configs.findIndex((item: any) => item.apiGateway.stageName === config.apiGateway.stageName) > -1) {
      return configs.splice(configs.findIndex((item: any) => item.apiGateway.stageName === config.apiGateway.stageName), 1, config)
    } else {
      configs.push(config);
      return configs;
    }
  } else {
    return [config];
  }
}

const getPhysicalId = (stackResources: any, logicalId: string) => {
  return stackResources.find((r: any) => r.LogicalResourceId === logicalId).PhysicalResourceId || '';
};

const writeConfigFile = (configs: any) => {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(configs));
  fs.writeFileSync('./util/config.json', JSON.stringify(configs));
};

listStackResources()
  .then(createConfig)
  .then(mergeConfigResources)
  .then(writeConfigFile);