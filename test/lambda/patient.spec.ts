
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
})