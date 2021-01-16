'use strict'

import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';

export interface Config {
  userPoolId: string;
  userPoolClientId: string;
}
//import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';

// import Auth from '@aws-amplify/auth';
// import { ICredentials } from '@aws-amplify/core';
// import configFile from '../config/dev.json';

AWS.config.update({
  region: 'ap-northeast-1',
});


export class CognitoAdmin {
  cognito: CognitoIdentityServiceProvider
  user: CognitoIdentityServiceProvider.AdminInitiateAuthResponse | undefined
  config: Config
  constructor(config: Config) {
    this.cognito = new AWS.CognitoIdentityServiceProvider({
      apiVersion: '2016-04-18'
    });
    this.config = config;
    this.user = undefined;
  }
  async signIn(username: string, password: string) {
    const userPoolId = this.config.userPoolId;
    const clientId = this.config.userPoolClientId;
    // サインイン
    this.user = await this.cognito.adminInitiateAuth({
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    }).promise();
    console.log('サインイン完了', JSON.stringify(this.user, null, 4));
    return this.user;
  }
}