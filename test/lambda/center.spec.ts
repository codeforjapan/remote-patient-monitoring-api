
describe('center test', () => {
  const handler = require('../../src/lambda/handler')
  process.env.CENTER_TABLE_NAME = 'RemotePatientMonitoring-CenterTable-dev'
  it('return Center', async () => {
    const ret = await handler.getCenter({ pathParameters: { centerId: "942f71cf-5f19-45d2-846b-4e6609f48269" } })
    expect(JSON.parse(ret.body)).toStrictEqual({
      "centerId": "942f71cf-5f19-45d2-846b-4e6609f48269",
      "centerName": "A保健所",
      "emergencyPhone": "03-3333-4444"
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
  it('update Center\'s phone', async () => {
    const params = {
      pathParameters: {
        centerId: "942f71cf-5f19-45d2-846b-4e6609f48269"
      },
      body: {
        emergencyPhone: "03-2222-3333"
      }
    }
    console.log(params)
    const ret = await handler.putCenter(params)
    expect(JSON.parse(ret.body).emergencyPhone).toBe("03-2222-3333")
  })
  it('both update centerName and Center\'s phone', async () => {
    const params = {
      pathParameters: {
        centerId: "942f71cf-5f19-45d2-846b-4e6609f48269"
      },
      body: {
        centerName: "final保健所",
        emergencyPhone: "03-2222-9999"
      }
    }
    console.log(params)
    const ret = await handler.putCenter(params)
    expect(JSON.parse(ret.body).centerName).toBe("final保健所")
    expect(JSON.parse(ret.body).emergencyPhone).toBe("03-2222-9999")
  })
  it('create new Center', async () => {
    const params = {
      body: {
        centerName: "hugacenter",
        emergencyPhone: "03-9999-9999"
      }
    }
    const ret = await handler.postCenter(params)
    expect(JSON.parse(ret.body)).toHaveProperty('centerId')
    expect(JSON.parse(ret.body).centerName).toBe("hugacenter")
    expect(JSON.parse(ret.body).emergencyPhone).toBe("03-9999-9999")
  })
})