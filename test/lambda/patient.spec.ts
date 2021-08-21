import { APIGatewayProxyEvent } from 'aws-lambda'
import { CognitoAdmin } from '../../src/aws/cognito_admin'
import { SMSSender } from '../../src/util/smssender'
import { CognitoIdentityServiceProvider, SMS } from 'aws-sdk';
import { ResolvePlugin } from 'webpack';

const replaceAll = (string: string, search: string, replace: string):string => {
  return string.split(search).join(replace);
}  
describe('patient test', () => {
  const handler = require('../../src/lambda/handler')
  process.env.CENTER_TABLE_NAME = 'RemotePatientMonitoring-CenterTable-dev'
  process.env.PATIENT_TABLE_NAME = 'RemotePatientMonitoring-PatientTable-dev'
  process.env.TEMPLOGIN_TABLE_NAME = 'RemotePatientMonitoring-TempLoginTable-dev'

  it('return Patient', async () => {
    const ret = await handler.getPatient({ pathParameters: { patientId: "dc9958a2-bcba-41db-99c1-290b3ed2a074" } })
    console.log(ret)
    expect(JSON.parse(ret.body)).toStrictEqual({
      "patientId": "dc9958a2-bcba-41db-99c1-290b3ed2a074",
      "centerId": "942f71cf-5f19-45d2-846b-4e6609f48269",
      "centerName": "A保健所",
      "emergencyPhone": "0333334444",
      "phone": "09033333333",
      "memo": "hoge",
      "display": true
    })
  })
  it('return Patients', async () => {
    const ret = await handler.getPatients({ pathParameters: { centerId: "942f71cf-5f19-45d2-846b-4e6609f48269" } })
    expect(JSON.parse(ret.body).Count).toBe(2)
  })
  it('update patient', async () => {
    const datestr = new Date().toISOString()
    const params = {
      pathParameters: {
        patientId: "dc9958a2-bcba-41db-99c1-290b3ed2a074"
      },
      body: {
        "centerId": "942f71cf-5f19-45d2-846b-4e6609f48269",
        "phone": "090-3333-3333",
        "memo": "メモ2",
        "policy_accepted": datestr,
        "display": true
      }
    }
    const ret = await handler.putPatient(params)
    expect(JSON.parse(ret.body).policy_accepted).toBe(datestr)
    expect(JSON.parse(ret.body).memo).toBe("メモ2")
  })
  it('create new patient to the center', async () => {
    process.env.SMS_LOGINURL = "https://client.mnt.stopcovid19.jp/login"
    process.env.SMS_ENDPOINT = "localhost"
    process.env.SMS_APIKEY = "apikey"
    process.env.STAGE = 'stg'

    const signUp = jest.spyOn(CognitoAdmin.prototype, "signUp").mockImplementation(async (username: string, password?: string) => {
      console.log(password)
      return { username: username, password: 'hoge', user: {} }
    })
    const signIn = jest.spyOn(CognitoAdmin.prototype, "signIn").mockImplementation(async (username: string, password: string) => {
      console.log(username,password)
      return {AuthenticationResult: {IdToken: "hoge"}}
    })
    const sms = jest.spyOn(SMSSender.prototype, "sendSMS").mockImplementation((to: string, text: string) => {
      console.log(to, text)
      return new Promise((resolve) => {
        resolve({messageId: "", status: "100"})
      })
    })
    const params = {
      pathParameters: {
        centerId: "942f71cf-5f19-45d2-846b-4e6609f48269"
      },
      body: {
        "patientId": "halsk",
        "phone": "090-1234-5678",
        "memo": "メモメモ",
        "display": true,
        "sendSMS": true
      }
    }
    const ret = await handler.postPatient(params)
    console.log(ret.body)
    expect(JSON.parse(ret.body).phone).toBe("09012345678")
    expect(JSON.parse(ret.body)).toHaveProperty('loginKey')
    expect(JSON.parse(ret.body).memo).toBe('メモメモ')
    expect(sms).toHaveBeenCalled()
  });
  it('fails to create patient which has a same phone', async () => {
    jest.clearAllMocks();
    const signUp = jest.spyOn(CognitoAdmin.prototype, "signUp").mockImplementation(async (username: string, password?: string) => {
      return { username: username, password: password!, user: {} }
    })
    const params = {
      pathParameters: {
        centerId: "942f71cf-5f19-45d2-846b-4e6609f48269"
      },
      body: {
        "patientId": "halsk2",
        "phone": "090-1234-5678",
        "display": true
      }
    }
    const ret = await handler.postPatient(params)
    expect(signUp).not.toHaveBeenCalled()
    expect(ret.statusCode).toBe(400)
  });
})