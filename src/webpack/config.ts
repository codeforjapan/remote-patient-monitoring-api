// @ts-ignore
import configFile from './config.json';

export const config = configFile as Config;

export interface Config {
    region: string;
    cognito: {
        identityPoolId: string;
        adminUserPoolId?: string;
        adminUserPoolWebClientId: string;
        nurseUserPoolId: string;
        nurseUserPoolWebClientId: string;
        patientUserPoolId: string;
        patientUserPoolWebClientId: string;
        oauthDomain: string;
    };
    apiGateway: {
        restApiId: string;
        stageName: string;
    };
}

/*export function readConfig(stage: string) {
    return configFile.find(item => item.apiGateway.stageName === stage)
}*/
