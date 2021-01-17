const handler = require('../../src/lambda/handler')

describe('unit test', () => {
  it('return Nurse', async () => {
    process.env.NURSE_TABLE_NAME = 'RemotePatientMonitoring-NurseTable-dev'
    const ret = await handler.getNurse({ pathParameters: { nurseId: "76ac82d7-6714-4c65-a703-ff6ba17e350c" } })
    expect(ret).toBe({
      "nurseId": "76ac82d7-6714-4c65-a703-ff6ba17e350c",
      "manageCenters": [
        {
          "centerId": "942f71cf-5f19-45d2-846b-4e6609f48269"
        }
      ]
    })
  })
})