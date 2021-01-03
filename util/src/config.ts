import configFile from './config.json';
console.log('hoge');
export const config = configFile as Config;

export interface Config {
    region: string;
    cognito: {
        identityPoolId: string;
        userPoolId: string;
        userPoolWebClientId: string;
    }
}