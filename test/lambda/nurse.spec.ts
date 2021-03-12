
describe('nurse test', () => {
  const handler = require('../../src/lambda/handler')
  process.env.NURSE_TABLE_NAME = 'RemotePatientMonitoring-NurseTable-dev'
  process.env.CENTER_TABLE_NAME = 'RemotePatientMonitoring-CenterTable-dev'
  it('return Nurse', async () => {
    const ret = await handler.getNurse({ pathParameters: { nurseId: "76ac82d7-6714-4c65-a703-ff6ba17e350c" } })
    expect(JSON.parse(ret.body)).toStrictEqual({
      "nurseId": "76ac82d7-6714-4c65-a703-ff6ba17e350c",
      "manageCenters": [
        {
          "centerName": "A保健所",
          "centerId": "942f71cf-5f19-45d2-846b-4e6609f48269"
        }
      ]
    })
  })
  it('return Nurses', async () => {
    const ret = await handler.getNurses({ pathParameters: { centerId: "942f71cf-5f19-45d2-846b-4e6609f48269" } })
    expect(JSON.parse(ret.body).Count).toBe(2)
  })
  it('update nurse', async () => {
    const params = {
      pathParameters: {
        nurseId: "76ac82d7-6714-4c65-a703-ff6ba17e350c"
      },
      body: {
        manageCenters: [
          { centerId: "942f71cf-5f19-45d2-846b-4e6609f48269" },
          { centerId: "942f71cf-5f19-45d2-846a-4e6609f48269" }]
      }
    }
    const ret = await handler.putNurse(params)
    expect(JSON.parse(ret.body).manageCenters.length).toBe(2)
  })
})