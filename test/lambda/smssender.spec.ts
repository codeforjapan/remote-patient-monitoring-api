import {SMSSender, LoginInfo} from '../../src/util/smssender'
import axios from 'axios'

describe('sms sender test', () => {
  it('send sms', async () => {
    process.env.SMS_ENDPOINT = 'smshost/send';
    process.env.SMS_SECURITYKEY = 'smskey'
    process.env.SMS_ACCESSKEY = 'accesskey'
    process.env.STAGE = "stg"
    const logininfo: LoginInfo = {
      securityKey: "securityKey",
      accessKey: "accessKey"
    }
    const smsSender = new SMSSender('endpoint', logininfo);
    const axiostest = jest.spyOn(axios, "post").mockImplementation(async (...args: unknown[]) => {
      console.log(args)
      return new Promise((resolve) => {
        resolve({ data: {messageId: "hoge", status: "100" }});
      })
    })
    const res = await smsSender.sendSMS(
      "090-0000-0000",
      "体調入力URL: https://hoge"
    );
    expect(res.status).toBe('100')
    expect(res.messageId).toBe('hoge')
  })
})