"use strict"
import { config } from '../../src/webpack/config';
import { TruncateDB } from '../../util/truncatedb';
import { secret } from '../lib/secret';
import { v4 as uuid } from 'uuid'

const axios = require('axios')
let entry_point: string;
beforeAll(async () => {
  entry_point = `https://${config.apiGateway.restApiId}.execute-api.${config.region}.amazonaws.com/dev`;
  console.log(entry_point)
  await TruncateDB.truncate()
});

describe('get Centers', () => {
  it('raise 404 error when there is no data', async () => {
    expect.assertions(1);
    const t = async () => {
      console.log(entry_point + '/api/admin/center');
      const ret = await axios.get(entry_point + '/api/admin/center');
      return ret;
    }
    await expect(t).rejects.toThrow(/*404*/);
  })
})

describe('admin user login', () => {
  it('get Authkey', async () => {
    expect.assertions(1);
    console.log(entry_point + '/api/admin/login')
    const ret = await axios.post(entry_point + '/api/admin/login', { username: secret.auth_user, password: secret.auth_pass });
    expect(ret.data).toHaveProperty('idToken')
  })
})

const nurse_id: string = uuid();
let nurse_password: string

const patient_id: string = uuid();
let patient_password: string
const phone: string = '090-3333-3333'

describe('admin user', () => {
  let axios_admin: any;
  let center_id: string;
  let center_name: string;
  let center_id2: string;
  let nurse_item: any;
  beforeAll(async () => {
    console.log('login as an admin')
    const ret = await axios.post(entry_point + '/api/admin/login', { username: secret.auth_user, password: secret.auth_pass });
    const idToken = ret.data.idToken;
    axios_admin = axios.create({
      headers: {
        Authorization: idToken
      }
    })
  });

  it('create new center', async () => {
    const ret = await axios_admin.post(entry_point + '/api/admin/center', { centerName: 'A保健所' });
    expect(ret.data).toHaveProperty('centerId')
    center_id = ret.data.centerId;
  })

  it('read new center id', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/center/${center_id}`);
    expect(ret.data.centerName).toBe('A保健所')
  })

  it('update existing center', async () => {
    center_name = 'C保健所'
    const ret = await axios_admin.put(entry_point + `/api/admin/center/${center_id}`, { centerName: center_name });
    expect(ret.data.centerName).toBe(center_name)
  })

  it('create another center', async () => {
    const ret = await axios_admin.post(entry_point + '/api/admin/center', { centerName: 'B保健所' });
    expect(ret.data).toHaveProperty('centerId')
    center_id2 = ret.data.centerId;
  })

  it('get two centers', async () => {
    const ret = await axios_admin.get(entry_point + '/api/admin/center');
    expect(ret.data.Count).toBe(2)
    expect(ret.data.Items).toHaveLength(2)
  })

  it('raise 404 error when there is no center id', async () => {
    expect.assertions(1);
    const t = async () => {
      console.log(entry_point + '/api/admin/center/no-id');
      const ret = await axios.get(entry_point + '/api/admin/center/no-id');
      return ret;
    }
    await expect(t).rejects.toThrow(/*404*/);
  })

  it('raise error to post non-existing center', async () => {
    expect.assertions(1);
    const t = async () => {
      console.log(entry_point + '/api/admin/center/no-id/nurse');
      const ret = await axios_admin.post(entry_point + '/api/admin/center/no-id/nurse', { nurseId: 'nurseA' });
      return ret;
    }
    await expect(t).rejects.toThrow(/*404*/);
  })

  it('create new nurse to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/center/${center_id}/nurse`, { nurseId: nurse_id });
    expect(ret.data).toHaveProperty('nurseId')
    expect(ret.data).toHaveProperty('password')
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]))
    nurse_password = ret.data.password
  })

  it('raise error if existing id is going to be created', async () => {
    expect.assertions(1);
    console.log(entry_point + `/api/admin/center/${center_id}/nurse`, { nurseId: nurse_id })
    const t = async () => {
      const ret = await axios_admin.post(entry_point + `/api/admin/center/${center_id}/nurse`, { nurseId: nurse_id });
      return ret;
    }
    await expect(t).rejects.toThrow()
  })

  it('read new nurse id', async () => {
    console.log(entry_point + `/api/admin/nurse/${nurse_id}`)
    const ret = await axios_admin.get(entry_point + `/api/admin/nurse/${nurse_id}`);
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]))
    nurse_item = ret.data
  })

  it('create new nurse to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/center/${center_id}/nurse`, { nurseId: uuid() });
    expect(ret.data).toHaveProperty('nurseId')
    expect(ret.data).toHaveProperty('password')
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]))
    nurse_password = ret.data.password
  })

  it('get two nurses from the center', async () => {
    console.log(entry_point + `/api/admin/center/${center_id}/nurse`);
    const ret = await axios_admin.get(entry_point + `/api/admin/center/${center_id}/nurse`);
    expect(ret.data.Count).toBe(2)
    expect(ret.data.Items).toHaveLength(2)
  })

  it('update existing nurse', async () => {
    nurse_item.manageCenters.push({ centerId: center_id2 })
    const ret = await axios_admin.put(entry_point + `/api/admin/nurse/${nurse_id}`, nurse_item);
    expect(ret.data.manageCenters.length).toBe(2)
  })

  it.skip('create new patient to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/center/${center_id}/patient`, { patientId: patient_id, phone: phone });
    expect(ret.data.patientId).toBe(patient_id)
    expect(ret.data.centerId).toBe(center_id)
    expect(ret.data.phone).toBe(phone)
    expect(ret.data).toHaveProperty('password')
    patient_password = ret.data.password
  })

})