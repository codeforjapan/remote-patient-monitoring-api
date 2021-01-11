'use strict'

import AWS, { CognitoIdentityServiceProvider } from 'aws-sdk';
import { config } from '../../src/webpack/config';
import secret from '../../util/.secret.json';

//import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';

// import Auth from '@aws-amplify/auth';
// import { ICredentials } from '@aws-amplify/core';
// import configFile from '../config/dev.json';

AWS.config.update({
  region: 'ap-northeast-1',
});


export class AdminUser {
  cognito: CognitoIdentityServiceProvider
  user: CognitoIdentityServiceProvider.AdminInitiateAuthResponse
  constructor() {
    this.cognito = new AWS.CognitoIdentityServiceProvider({
      apiVersion: '2016-04-18'
    });

  }
  async signIn() {
    const userPoolId = config.cognito.userPoolId;
    const clientId = config.cognito.userPoolWebClientId;
    const username = secret.auth_user;
    const password = secret.auth_pass;
    try {
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
    }
    catch (err) {
      console.log(err);
      if (err.code == 'UserNotFoundException') {
        // ユーザーが存在しない場合
      } else if (err.code == 'NotAuthorizedException') {
        // パスワードが間違ってる場合
      } else {
        // その他のエラー
      }
    }
  }
  getKey() {
    return this.user.AuthenticationResult?.IdToken!;
  }
}