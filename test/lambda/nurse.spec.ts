const handler = require('../../src/lambda/handler')

describe('nurse test', () => {
  it('return Nurse', async () => {
    process.env.NURSE_TABLE_NAME = 'RemotePatientMonitoring-NurseTable-dev'
    const ret = await handler.getNurse({ pathParameters: { nurseId: "76ac82d7-6714-4c65-a703-ff6ba17e350c" } })
    expect(JSON.parse(ret.body)).toStrictEqual({
      "nurseId": "76ac82d7-6714-4c65-a703-ff6ba17e350c",
      "manageCenters": [
        {
          "centerId": "942f71cf-5f19-45d2-846b-4e6609f48269"
        }
      ]
    })
  })
  it('return Nurses', async () => {
    process.env.NURSE_TABLE_NAME = 'RemotePatientMonitoring-NurseTable-dev'
    const ret = await handler.getNurses({ pathParameters: { centerId: "942f71cf-5f19-45d2-846b-4e6609f48269" } })
    expect(JSON.parse(ret.body).Count).toBe(2)
  })
})