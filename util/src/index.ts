import {config} from './config';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';


const optionDefinitions = [
  {
    name: 'type',
    alias: 't',
    type: String,
    desctiption: 'confirm '
  },
  {
    name: 'username',
    alias: 'u',
    type: String,
    description: 'Username'
  },
  {
    name: 'password',
    alias: 'p',
    type: String,
    description: 'Password'
  },
  {
    name: 'loginCode',
    alias: 'l',
    type: String,
    description: 'Login Code'
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'show help'
  }
];

const sections = [
  {
    header: 'Create AWS Cognito user',
    content: 'Create AWS Cognito user for Remote Patient Monitoring system API.'
  },
  {
    header: 'Options',
    optionList: optionDefinitions
  }
];

const options = commandLineArgs(optionDefinitions);
if(options.help) {
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(0);
}

console.log(options);

if (options.username == undefined || options.password == undefined ||  options.type == undefined ) {
  const usage = commandLineUsage(sections);
  console.log(usage);
  process.exit(0);
} else {
  function hello(name: string): string {
    return `Hello, ${name}!`;
  }
}


const poolData = {
  UserPoolId: config.cognito.userPoolId, // your user pool ID
  ClientId: config.cognito.userPoolWebClientId, // generated in the AWS console
  Paranoia: 7 // an integer between 1 - 10
};
console.log(poolData);
const CognitoUserPoolWrapper = require('cognito-user-pool')(poolData);
if (options.type === 'confirm'){
  const params = {
    "username": options.username,
    "loginSession": options.loginCode,
    "newPassword": options.password
  }
  console.log(params);

  CognitoUserPoolWrapper.loginNewPasswordRequired(params, (res:any) => {
    console.log(res);
  });
};