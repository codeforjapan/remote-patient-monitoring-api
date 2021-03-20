export interface ServerConfig {
  [key: string]: string | undefined;
  AuthAdminUserPoolDomain: string;
  AuthNurseUserPoolDomain: string;
  AuthPatientUserPoolDomain: string;
  OauthCallbackURL: string;
  OauthSignoutURL: string;
  Bucket: string;
  DebugMode: string;
  DBPrefix: string;
  LOGINURL: string;
  AdminUserEmail?: string | undefined;
  AdminUserName?: string | undefined;
  SMS_ENDPOINT?: string | undefined;
  SMS_SECURITYKEY?: string | undefined;
  SMS_ACCESSKEY?: string | undefined;
}