import {config} from './config';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

const optionDefinitions = [
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

function hello(name: string): string {
  return `Hello, ${name}!`;
}

console.log(config);
console.log(hello(config.cognito.identityPoolId));