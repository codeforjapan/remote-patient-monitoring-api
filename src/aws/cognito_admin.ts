"use strict";

import { APIGatewayProxyEvent } from "aws-lambda";
import AWS, { CognitoIdentityServiceProvider } from "aws-sdk";

export interface Config {
  userPoolId: string;
  userPoolClientId: string;
}
//import { CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js';

// import Auth from '@aws-amplify/auth';
// import { ICredentials } from '@aws-amplify/core';
// import configFile from '../config/dev.json';

AWS.config.update({
  region: "ap-northeast-1",
});

export class CognitoAdmin {
  cognito: CognitoIdentityServiceProvider;
  user: CognitoIdentityServiceProvider.AdminInitiateAuthResponse | undefined;
  config: Config;
  constructor(config: Config) {
    this.cognito = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
    });
    this.config = config;
    this.user = undefined;
  }
  /**
   * Signup
   * @param username user name
   */
  async signUp(
    username: string,
    password?: string
  ): Promise<{
    username: string;
    password: string;
    user: CognitoIdentityServiceProvider.AdminSetUserPasswordResponse;
  }> {
    const userPoolId = this.config.userPoolId;
    // サインイン
    const user = await this.cognito
      .adminCreateUser({
        UserPoolId: userPoolId,
        Username: username,
      })
      .promise();
    console.log("登録完了", JSON.stringify(user, null, 4));
    // if password is not specified, create random password
    if (password == undefined) {
      password = this.makePassword();
    }
    // 作成したばかりのユーザーはステータス FORCE_CHANGE_PASSWORD なのでパスワード変更
    // べつに一時パスワードと同じパスワードでもエラーにはならない
    await this.cognito
      .adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: username,
        Password: password,
        Permanent: true,
      })
      .promise();
    console.log("パスワード変更完了");
    return { username: username, password: password, user: user };
  }
  /**
   *  サインイン
   *  @param username user name
   *  @param password password
   */
  async signIn(username: string, password: string): Promise<CognitoIdentityServiceProvider.AdminInitiateAuthResponse> {
    const userPoolId = this.config.userPoolId;
    const clientId = this.config.userPoolClientId;
    // サインイン
    this.user = await this.cognito
      .adminInitiateAuth({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: "ADMIN_NO_SRP_AUTH",
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      })
      .promise();
    console.log("サインイン完了", JSON.stringify(this.user, null, 4));
    return this.user;
  }
  /**
   *  refreshToken でログインし直し
   *  @param refreshToken refresh token
   */
  async refreshToken(refreshToken: string): Promise<CognitoIdentityServiceProvider.AdminInitiateAuthResponse> {
    const userPoolId = this.config.userPoolId;
    const clientId = this.config.userPoolClientId;
    // サインイン
    this.user = await this.cognito
      .adminInitiateAuth({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: "REFRESH_TOKEN_AUTH",
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
        },
      })
      .promise();
    console.log("サインイン完了", JSON.stringify(this.user, null, 4));
    return this.user;
  }
  // パスワードを生成する
  makePassword(): string {
    let pwd = Math.random().toString(36).substr(2, 8);
    let count = 0;
    // 数字とアルファベット両方入っているかチェックする
    while ((pwd.match(/[a-zA-Z]/) && pwd.match(/\d/)) == null) {
      if (count > 100) break;
      pwd = Math.random().toString(36).substr(2, 8);
      count = count + 1;
    }
    return pwd;
  }
  /**
   * return UserID from Authorization header striing
   * @param authHeader Authorization: header
   */
  getUserId(event: APIGatewayProxyEvent): string {
    if (!event.headers["Authorization"]) return null;
    const authHeader = event.headers["Authorization"];
    const payload = Buffer.from(authHeader.split(".")[1], "base64").toString(
      "ascii"
    );
    console.log(payload);
    return JSON.parse(payload)["cognito:username"];
  }
}
