// @ts-ignore
import configFile from '../../util/.secret.json';
export const secret = configFile as Secret;

export interface Secret {
  auth_user: string;
  auth_pass: string;
}