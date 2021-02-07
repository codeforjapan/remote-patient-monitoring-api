import { APIGatewayProxyEvent } from 'aws-lambda'
import { CognitoAdmin } from '../../src/aws/cognito_admin'
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { ResolvePlugin } from 'webpack';

describe('patient test', () => {
  const handler = require('../../src/lambda/handler')
  process.env.PATIENT_TABLE_NAME = 'RemotePatientMonitoring-PatientTable-dev'

  it('return Patient', async () => {
    const ret = await handler.getPatient({ pathParameters: { patientId: "dc9958a2-bcba-41db-99c1-290b3ed2a074" } })
    console.log(ret)
    expect(JSON.parse(ret.body)).toStrictEqual({
      "patientId": "dc9958a2-bcba-41db-99c1-290b3ed2a074",
      "centerId": "942f71cf-5f19-45d2-846b-4e6609f48269",
      "phone": "090-3333-3333",
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
        "policy_accepted": datestr,
        "display": true
      }
    }
    const ret = await handler.putPatient(params)
    expect(JSON.parse(ret.body).policy_accepted).toBe(datestr)
  })
  it('create new patient to the center', async () => {
    const signUp = jest.spyOn(CognitoAdmin.prototype, "signUp").mockImplementation(async (username: string, password: string) => {
      return { username: username, password: password!, user: {} }
    })
    const params = {
      pathParameters: {
        centerId: "942f71cf-5f19-45d2-846b-4e6609f48269"
      },
      body: {
        "patientId": "halsk",
        "phone": "090-1234-5678",
        "display": true
      }
    }
    const ret = await handler.postPatient(params)
    expect(JSON.parse(ret.body).phone).toBe("090-1234-5678")
  });
  it('fails to create patient which has a same phone', async () => {
    jest.clearAllMocks();
    const signUp = jest.spyOn(CognitoAdmin.prototype, "signUp").mockImplementation(async (username: string, password: string) => {
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