import {config} from './config';
/*const poolData = {
  UserPoolId: USER_POOL_ID, // your user pool ID
  ClientId: USER_POOL_CLIENT_ID, // generated in the AWS console
  Paranoia: PARANOIA_LEVEL // an integer between 1 - 10
};
const CognitoUserPoolWrapper = require('cognito-user-pool')(poolData);
*/
function hello(name: string): string {
  return `Hello, ${name}!`;
}

console.log(config);
console.log(hello(config.cognito.identityPoolId));