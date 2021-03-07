
describe('center test', () => {
  const handler = require('../../src/lambda/handler')
  process.env.CENTER_TABLE_NAME = 'RemotePatientMonitoring-CenterTable-dev'
  it('return Center', async () => {
    const ret = await handler.getCenter({ pathParameters: { centerId: "942f71cf-5f19-45d2-846b-4e6609f48269" } })
    expect(JSON.parse(ret.body)).toStrictEqual({
      "centerId": "942f71cf-5f19-45d2-846b-4e6609f48269",
      "centerName": "A保健所"
    })
  })
  it('update Center', async () => {
    const params = {
      pathParameters: {
        centerId: "942f71cf-5f19-45d2-846b-4e6609f48269"
      },
      body: {
        centerName: "new保健所"
      }
    }
    const ret = await handler.putCenter(params)
    expect(JSON.parse(ret.body).centerName).toBe("new保健所")
  })
})