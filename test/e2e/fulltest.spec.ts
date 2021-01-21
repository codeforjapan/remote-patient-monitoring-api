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
      console.log(entry_point + '/api/admin/centers');
      const ret = await axios.get(entry_point + '/api/admin/centers');
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

let center_id: string;

const nurse_id: string = uuid();
const nurse_id2: string = uuid();
let nurse_password: string

const patient_id: string = uuid();
let patient_password: string
const phone: string = '090-3333-3333'

describe('admin user', () => {
  let axios_admin: any;
  let center_name: string;
  let center_id2: string;
  let nurse_item: any;
  let patient_item: any;
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
    const ret = await axios_admin.post(entry_point + '/api/admin/centers', { centerName: 'A保健所' });
    expect(ret.data).toHaveProperty('centerId')
    center_id = ret.data.centerId;
  })

  it('read new center id', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/centers/${center_id}`);
    expect(ret.data.centerName).toBe('A保健所')
  })

  it('update existing center', async () => {
    center_name = 'C保健所'
    const ret = await axios_admin.put(entry_point + `/api/admin/centers/${center_id}`, { centerName: center_name });
    expect(ret.data.centerName).toBe(center_name)
  })

  it('create another center', async () => {
    const ret = await axios_admin.post(entry_point + '/api/admin/centers', { centerName: 'B保健所' });
    expect(ret.data).toHaveProperty('centerId')
    center_id2 = ret.data.centerId;
  })

  it('get two centers', async () => {
    const ret = await axios_admin.get(entry_point + '/api/admin/centers');
    expect(ret.data.Count).toBe(2)
    expect(ret.data.Items).toHaveLength(2)
  })

  it('raise 404 error when there is no center id', async () => {
    expect.assertions(1);
    const t = async () => {
      console.log(entry_point + '/api/admin/centers/no-id');
      const ret = await axios.get(entry_point + '/api/admin/centers/no-id');
      return ret;
    }
    await expect(t).rejects.toThrow(/*404*/);
  })

  it('raise error to post non-existing center', async () => {
    expect.assertions(1);
    const t = async () => {
      console.log(entry_point + '/api/admin/centers/no-id/nurses');
      const ret = await axios_admin.post(entry_point + '/api/admin/centers/no-id/nurses', { nurseId: 'nurseA' });
      return ret;
    }
    await expect(t).rejects.toThrow(/*404*/);
  })

  it('create new nurse to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/nurses`, { nurseId: nurse_id });
    expect(ret.data).toHaveProperty('nurseId')
    expect(ret.data).toHaveProperty('password')
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]))
    nurse_password = ret.data.password
  })

  it('raise error if existing id is going to be created', async () => {
    expect.assertions(1);
    console.log(entry_point + `/api/admin/centers/${center_id}/nurse`, { nurseId: nurse_id })
    const t = async () => {
      const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/nurses`, { nurseId: nurse_id });
      return ret;
    }
    await expect(t).rejects.toThrow()
  })

  it('read new nurse id', async () => {
    console.log(entry_point + `/api/admin/nurses/${nurse_id}`)
    const ret = await axios_admin.get(entry_point + `/api/admin/nurses/${nurse_id}`);
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]))
    nurse_item = ret.data
  })

  it('create another nurse to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/nurses`, { nurseId: nurse_id2 });
    expect(ret.data).toHaveProperty('nurseId')
    expect(ret.data).toHaveProperty('password')
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]))
  })

  it('get two nurses from the center', async () => {
    console.log(entry_point + `/api/admin/centers/${center_id}/nurses`);
    const ret = await axios_admin.get(entry_point + `/api/admin/centers/${center_id}/nurses`);
    expect(ret.data.Count).toBe(2)
    expect(ret.data.Items).toHaveLength(2)
  })

  it('update existing nurse', async () => {
    nurse_item.manageCenters.push({ centerId: center_id2 })
    const ret = await axios_admin.put(entry_point + `/api/admin/nurses/${nurse_id}`, nurse_item);
    expect(ret.data.manageCenters.length).toBe(2)
  })

  it('create new patient to the center', async () => {
    console.log(`patient_id is ${patient_id}`)
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/patients`, { patientId: patient_id, phone: phone });
    expect(ret.data.patientId).toBe(patient_id)
    expect(ret.data.phone).toBe(phone)
    expect(ret.data.centerId).toBe(center_id)
    expect(ret.data).toHaveProperty('password')
    patient_password = ret.data.password
  })

  it.skip('fails to create new patient with same phone', async () => {
    const t = async () => {
      await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/patients`, { patientId: uuid(), phone: phone });
    }
    await expect(t).rejects.toThrowError()
  })

  it('read new patient id', async () => {
    console.log(entry_point + `/api/admin/patients/${patient_id}`)
    const ret = await axios_admin.get(entry_point + `/api/admin/patients/${patient_id}`);
    patient_item = ret.data;
    expect(ret.data.phone).toBe(phone)
  })

  it('create new patient to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/patients`, { patientId: uuid(), phone: "090-1111-1111" });
    expect(ret.data.phone).toBe('090-1111-1111')
  })

  it('create new patient to another center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id2}/patients`, { patientId: uuid(), phone: "090-2222-2222" });
    expect(ret.data.phone).toBe('090-2222-2222')
  })

  it('get two patients from the center', async () => {
    console.log(entry_point + `/api/admin/centers/${center_id}/patients`);
    const ret = await axios_admin.get(entry_point + `/api/admin/centers/${center_id}/patients`);
    expect(ret.data.Count).toBe(2)
    expect(ret.data.Items).toHaveLength(2)
  })

  it('update existing patient', async () => {
    const datetime = new Date().toISOString()
    patient_item.policy_accepted = datetime
    const ret = await axios_admin.put(entry_point + `/api/admin/patients/${patient_id}`, patient_item);
    expect(ret.data.policy_accepted).toBe(datetime)
  })

  it('create another center for the next test', async () => {
    const ret = await axios_admin.post(entry_point + '/api/admin/centers', { centerName: 'X保健所' });
    expect(ret.data).toHaveProperty('centerId')
  })

})

describe('nurse user login', () => {
  it('get authKey', async () => {
    expect.assertions(1);
    console.log(entry_point + '/api/nurse/login')
    const ret = await axios.post(entry_point + '/api/nurse/login', { username: nurse_id, password: nurse_password });
    expect(ret.data).toHaveProperty('idToken')
  })
})
describe('patient user login', () => {
  it('get authKey', async () => {
    console.log(entry_point + '/api/patient/login')
    const ret = await axios.post(entry_point + '/api/patient/login', { username: patient_id, password: patient_password });
    expect(ret.data).toHaveProperty('idToken')
  })
})

/*
 * Nurse methods
 */
let idToken: string;
describe('Nurse user', () => {
  let axios_nurse: any;
  let nurse_item: any;
  let patient_id: string;
  beforeAll(async () => {
    console.log('login as a nurse')
    const ret = await axios.post(entry_point + '/api/nurse/login', { username: nurse_id, password: nurse_password });
    idToken = ret.data.idToken;
    axios_nurse = axios.create({
      headers: {
        Authorization: idToken
      }
    })
  });

  it('fails to create new center', async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_nurse.post(entry_point + '/api/admin/centers', { centerName: 'A保健所' });
    }
    await expect(t).rejects.toThrowError()
  })

  it('read center id', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/centers/${center_id}`);
    expect(ret.data.centerName).toBe('C保健所')
  })

  it('fails to update existing center', async () => {
    const t = async () => {
      await axios_nurse.put(entry_point + `/api/admin/centers/${center_id}`, { centerName: 'test' })
    }
    await expect(t).rejects.toThrowError()
  })

  it('get all centers', async () => {
    const ret = await axios_nurse.get(entry_point + '/api/nurse/centers');
    expect(ret.data.Count).toBe(3)
    expect(ret.data.Items).toHaveLength(3)
  })

  it('read nurse id', async () => {
    console.log(entry_point + `/api/nurse/nurses/${nurse_id}`)
    console.log(idToken)
    const ret = await axios_nurse.get(entry_point + `/api/nurse/nurses/${nurse_id}`);
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]))
    nurse_item = ret.data
  })

  it('fails to read nurse id that is not mine', async () => {
    expect.assertions(1);
    console.log(entry_point + `/api/nurse/nurses/${nurse_id2}`)
    const t = async () => {
      await axios_nurse.get(entry_point + `/api/nurse/nurses/${nurse_id2}`);
    }
    await expect(t).rejects.toThrow(/403/)
  })

  it('fails to create new nurse to the center', async () => {
    const t = async () => {
      await axios_nurse.post(entry_point + `/api/admin/centers/${center_id}/nurses`, { nurseId: uuid() });
    }
    await expect(t).rejects.toThrowError()
  })

  it('get two nurses from the center', async () => {
    console.log(entry_point + `/api/nurse/center/${center_id}/nurse`);
    const ret = await axios_nurse.get(entry_point + `/api/nurse/centers/${center_id}/nurses`);
    expect(ret.data.Count).toBe(2)
    expect(ret.data.Items).toHaveLength(2)
  })

  it('create new patient to the center', async () => {
    const ret = await axios_nurse.post(entry_point + `/api/nurse/centers/${center_id}/patients`, { patientId: patient_id, phone: "090-4444-4444" });
    expect(ret.data).toHaveProperty('password')
    expect(ret.data.phone).toBe('090-4444-4444')
  })

  it.skip('read new patient id', async () => {
  })

  it.skip('create new patient to the center', async () => {
  })

  it('fails to create new patient to the center that is not under my managemenet', async () => {
  })

  it.skip('get ? patients from the center', async () => {
  })

  it.skip('update existing patient', async () => {
  })

})