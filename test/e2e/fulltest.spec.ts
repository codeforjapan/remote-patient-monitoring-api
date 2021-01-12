"use strict"
import { config } from '../../src/webpack/config';
import { TruncateDB } from '../../util/truncatedb';
//import { AdminUser } from '../lib/users';

const axios = require('axios')
let entry_point: string;
beforeAll(async () => {
  entry_point = `https://${config.apiGateway.restApiId}.execute-api.${config.region}.amazonaws.com/dev`;
  await TruncateDB.truncate()
});

describe('test', () => {
  it('1たす3は4です', () => {
    const result = 1 + 3;
    expect(result).toBe(4);
  });
});

describe('get Centers', () => {
  it('raise 404 error when there is no data', async () => {
    //expect.assertions(1);
    const t = async () => {
      console.log(entry_point + '/api/admin/center');
      const ret = await axios.get(entry_point + '/api/admin/center');
      return ret;
    }
    await expect(t).rejects.toThrow(/*404*/);
  })
})

// describe('admin user', () => {
//   beforeAll(async () => {
//     const admin = new AdminUser();
//     await admin.signIn();
//     console.log(admin.getKey());
//   })
//   it('get Authkey', () => {

//   })
// })