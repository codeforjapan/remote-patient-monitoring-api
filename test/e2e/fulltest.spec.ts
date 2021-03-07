'use strict';
import * as configsys from '../../src/webpack/config';
import { TruncateDB } from '../../util/truncatedb';
import { PatientParam, Status, StatusParam } from '../../src/lambda/definitions/types';
import { secret } from '../lib/secret';
import { v4 as uuid } from 'uuid';
import { AxiosInstance } from 'axios'
const axios = require('axios');
let entry_point: string;

const STAGE = process.env.JEST_STAGE || 'dev';
const config = configsys.readConfig(STAGE);
beforeAll(async () => {
  entry_point = `https://${config.apiGateway.restApiId}.execute-api.${config.region}.amazonaws.com/${config.apiGateway.stageName}`;
  const db = new TruncateDB(STAGE);
  await db.truncate();
});

describe('get Centers', () => {
  it('raise 404 error when there is no data', async () => {
    expect.assertions(1);
    const t = async () => {
      const ret = await axios.get(entry_point + '/api/admin/centers');
      return ret;
    };
    await expect(t).rejects.toThrow(/*404*/);
  });
});

describe('admin user login', () => {
  it('get Authkey', async () => {
    expect.assertions(1);
    console.log(entry_point)
    const ret = await axios.post(entry_point + '/api/admin/login', {
      username: secret.auth_user,
      password: secret.auth_pass,
    });
    expect(ret.data).toHaveProperty('idToken');
  });
});

let center_id: string;
let center_id3: string;

const nurse_id: string = 'testNurse';
const nurse_id2: string = uuid();
let center_id_with_no_nurse: string;
let nurse_password: string;

const patient_id: string = 'testPatient';
let patient_id2: string;
let patient_id_in_another_center: string;
let patient_item_in_another_center: any;
let patient_password: string;
const phone: string = '090-3333-3333';

describe('admin user', () => {
  let axios_admin: any;
  let center_name: string;
  let center_id2: string;
  let nurse_item: any;
  let patient_item: any;
  beforeAll(async () => {
    const ret = await axios.post(entry_point + '/api/admin/login', {
      username: secret.auth_user,
      password: secret.auth_pass,
    });
    const idToken = ret.data.idToken;
    axios_admin = axios.create({
      headers: {
        Authorization: idToken,
      },
    });
  });

  it('create new center', async () => {
    const ret = await axios_admin.post(entry_point + '/api/admin/centers', { centerName: 'A保健所', emergencyPhone: "0166-33-2222" });
    expect(ret.data).toHaveProperty('centerId');
    expect(ret.data.centerName).toBe('A保健所');
    expect(ret.data.emergencyPhone).toBe('0166-33-2222');
    center_id = ret.data.centerId;
  });

  it('read new center id', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/centers/${center_id}`);
    expect(ret.data.centerName).toBe('A保健所');
    expect(ret.data.emergencyPhone).toBe('0166-33-2222');
  });

  it('update existing center', async () => {
    center_name = 'C保健所';
    const ret = await axios_admin.put(entry_point + `/api/admin/centers/${center_id}`, { centerName: center_name });
    expect(ret.data.centerName).toBe(center_name);
  });

  it('read updated center id', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/centers/${center_id}`);
    expect(ret.data.centerName).toBe(center_name);
    expect(ret.data.emergencyPhone).toBe('0166-33-2222');
  });

  it('update existing center', async () => {
    const ret = await axios_admin.put(entry_point + `/api/admin/centers/${center_id}`, { emergencyPhone: "0166-33-9999" });
    expect(ret.data.emergencyPhone).toBe('0166-33-9999');
  });

  it('read updated center id', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/centers/${center_id}`);
    expect(ret.data.centerName).toBe(center_name);
    expect(ret.data.emergencyPhone).toBe('0166-33-9999');
  });

  it('create another center', async () => {
    const ret = await axios_admin.post(entry_point + '/api/admin/centers', { centerName: 'B保健所' });
    expect(ret.data).toHaveProperty('centerId');
    center_id2 = ret.data.centerId;
  });

  it('get two centers', async () => {
    const ret = await axios_admin.get(entry_point + '/api/admin/centers');
    expect(ret.data.Count).toBe(2);
    expect(ret.data.Items).toHaveLength(2);
  });

  it('raise 404 error when there is no center id', async () => {
    expect.assertions(1);
    const t = async () => {
      const ret = await axios.get(entry_point + '/api/admin/centers/no-id');
      return ret;
    };
    await expect(t).rejects.toThrow(/*404*/);
  });

  it('raise error to post non-existing center', async () => {
    expect.assertions(1);
    const t = async () => {
      const ret = await axios_admin.post(entry_point + '/api/admin/centers/no-id/nurses', { nurseId: uuid() });
      return ret;
    };
    await expect(t).rejects.toThrowError(/404/);
  });

  it('create new nurse to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/nurses`, { nurseId: nurse_id });
    expect(ret.data).toHaveProperty('nurseId');
    expect(ret.data).toHaveProperty('password');
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]));
    nurse_password = ret.data.password;
  });

  it('raise error if existing id is going to be created', async () => {
    expect.assertions(1);
    const t = async () => {
      const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/nurses`, { nurseId: nurse_id });
      return ret;
    };
    await expect(t).rejects.toThrow();
  });

  it('read new nurse id', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/nurses/${nurse_id}`);
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]));
    expect(ret.data.manageCenters[0].centerId).toBe(center_id)
    expect(ret.data.manageCenters[0].centerName).toBe('C保健所')
    nurse_item = ret.data;
  });

  it('create another nurse to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/nurses`, { nurseId: nurse_id2 });
    expect(ret.data).toHaveProperty('nurseId');
    expect(ret.data).toHaveProperty('password');
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]));
  });

  it('get two nurses from the center', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/centers/${center_id}/nurses`);
    expect(ret.data.Count).toBe(2);
    expect(ret.data.Items).toHaveLength(2);
  });

  it('update existing nurse', async () => {
    nurse_item.manageCenters.push({ centerId: center_id2 });
    const ret = await axios_admin.put(entry_point + `/api/admin/nurses/${nurse_id}`, nurse_item);
    expect(ret.data.manageCenters.length).toBe(2);
  });

  it('create new patient to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/patients`, {
      patientId: patient_id,
      memo: "患者メモ",
      phone: phone,
    });
    expect(ret.data.patientId).toBe(patient_id);
    expect(ret.data.phone).toBe(phone);
    expect(ret.data.centerId).toBe(center_id);
    expect(ret.data.memo).toBe("患者メモ");
    expect(ret.data).toHaveProperty('password');
    patient_password = ret.data.password;
  });

  it('read new patient id', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/patients/${patient_id}`);
    patient_item = ret.data;
    expect(ret.data.policy_accepted).toBe(undefined);
    expect(ret.data.phone).toBe(phone);
    expect(ret.data.memo).toBe("患者メモ");
  });

  it('fails to create new patient with existing phone', async () => {
    const t = async () => {
      await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/patients`, {
        patientId: uuid(),
        phone: phone,
      });
    };
    await expect(t).rejects.toThrow(/400/);
  });

  it('create new patient to the center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id}/patients`, {
      phone: '090-1111-1111',
    });
    expect(ret.data).toHaveProperty('patientId');
    expect(ret.data.phone).toBe('090-1111-1111');
    patient_id2 = ret.data.patientId;
  });

  it('create new patient to another center', async () => {
    const ret = await axios_admin.post(entry_point + `/api/admin/centers/${center_id2}/patients`, {
      patientId: uuid(),
      phone: '090-2222-2222',
    });
    expect(ret.data.phone).toBe('090-2222-2222');
  });

  it('get two patients from the center', async () => {
    const ret = await axios_admin.get(entry_point + `/api/admin/centers/${center_id}/patients`);
    expect(ret.data.Count).toBe(2);
    expect(ret.data.Items).toHaveLength(2);
  });

  it('update existing patient', async () => {
    const datetime = new Date().toISOString();
    patient_item.policy_accepted = datetime;
    const ret = await axios_admin.put(entry_point + `/api/admin/patients/${patient_id2}`, patient_item);
    expect(ret.data.policy_accepted).toBe(datetime);
  });

  it('update existing patient memo', async () => {
    const datetime = new Date().toISOString();
    patient_item.memo = "患者メモ2";
    const ret = await axios_admin.put(entry_point + `/api/admin/patients/${patient_id2}`, patient_item);
    expect(ret.data.memo).toBe("患者メモ2");
  });

  it('create another center for the next test', async () => {
    const ret = await axios_admin.post(entry_point + '/api/admin/centers', { centerName: 'X保健所' });
    expect(ret.data).toHaveProperty('centerId');
    center_id_with_no_nurse = ret.data.centerId;
  });

  it('create another center and patient for the next test', async () => {
    const ret = await axios_admin.post(entry_point + '/api/admin/centers', { centerName: 'Y保健所' });
    expect(ret.data).toHaveProperty('centerId');
    center_id3 = ret.data.centerId;
    const ret2 = await axios_admin.post(entry_point + `/api/admin/centers/${center_id3}/patients`, {
      phone: '090-3899-2222',
    });
    expect(ret2.data.phone).toBe('090-3899-2222');
    expect(ret2.data).toHaveProperty('patientId');
    patient_id_in_another_center = ret2.data.patientId;
    patient_item_in_another_center = ret2.data;
  });

  it('post new status to existing patient', async () => {
    const dummyPostData: StatusParam = {
      SpO2: 98,
      body_temperature: 36.0,
      pulse: 60,
      symptom: {
        cough: false,
        phlegm: false,
        suffocation: false,
        headache: false,
        sore_throat: false,
        remarks: 'dummy',
      },
    };
    const ret = await axios_admin.post(`${entry_point}/api/admin/patients/${patient_id2}/statuses`, dummyPostData);
    const result = ret.data;
    expect(result.statusId).not.toBe(null);
    expect(result.SpO2).toBe(dummyPostData.SpO2);
    expect(result.body_temperature).toBe(dummyPostData.body_temperature);
    expect(result.pulse).toBe(dummyPostData.pulse);
    expect(result.centerId).toBe(center_id);
    expect(result.patientId).toBe(patient_id2);
    expect(result.created).not.toBe(null);
    expect(result.symptom!.cough).toBe(dummyPostData.symptom!.cough);
    expect(result.symptom!.phlegm).toBe(dummyPostData.symptom!.phlegm);
    expect(result.symptom!.headache).toBe(dummyPostData.symptom!.headache);
    expect(result.symptom!.sore_throat).toBe(dummyPostData.symptom!.sore_throat);
    expect(result.symptom!.suffocation).toBe(dummyPostData.symptom!.suffocation);
    expect(result.symptom!.remarks).toBe(dummyPostData.symptom!.remarks);
    expect(result.symptom!.symptomId).not.toBe(null);
  });
});

describe('nurse user login', () => {
  it('get authKey', async () => {
    expect.assertions(2);
    const ret = await axios.post(entry_point + '/api/nurse/login', { username: nurse_id, password: nurse_password });
    expect(ret.data).toHaveProperty('idToken');
    expect(ret.data).toHaveProperty('refreshToken');
  });
});
describe('patient user login', () => {
  it('get authKey', async () => {
    expect.assertions(2);
    const ret = await axios.post(entry_point + '/api/patient/login', {
      username: patient_id,
      password: patient_password,
    });
    expect(ret.data).toHaveProperty('idToken');
    expect(ret.data).toHaveProperty('refreshToken');
  });
});

/*
 * Nurse methods
 */
let idToken: string;
let refreshToken: string;
describe('Nurse user', () => {
  let axios_nurse: any;
  let nurse_item: any;
  let patient_item: any;
  let patient_id3: string;
  beforeAll(async () => {
    const ret = await axios.post(entry_point + '/api/nurse/login', { username: nurse_id, password: nurse_password });
    idToken = ret.data.idToken;
    refreshToken = ret.data.refreshToken;
    axios_nurse = axios.create({
      headers: {
        Authorization: idToken,
      },
    });
  });

  it('fails to create new center', async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_nurse.post(entry_point + '/api/admin/centers', { centerName: 'A保健所' });
    };
    await expect(t).rejects.toThrowError();
  });

  it('read center id', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/centers/${center_id}`);
    expect(ret.data.centerName).toBe('C保健所');
  });

  it('fails to update existing center', async () => {
    const t = async () => {
      await axios_nurse.put(entry_point + `/api/admin/centers/${center_id}`, { centerName: 'test' });
    };
    await expect(t).rejects.toThrowError();
  });

  it('get all centers', async () => {
    const ret = await axios_nurse.get(entry_point + '/api/nurse/centers');
    expect(ret.data.Count).toBe(4);
    expect(ret.data.Items).toHaveLength(4);
  });

  it('read nurse id', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/nurses/${nurse_id}`);
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerId: center_id })]));
    expect(ret.data.manageCenters).toEqual(expect.arrayContaining([expect.objectContaining({ centerName:'C保健所' })]));
    nurse_item = ret.data;
  });

  it('fails to read nurse id that is not mine', async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_nurse.get(entry_point + `/api/nurse/nurses/${nurse_id2}`);
    };
    await expect(t).rejects.toThrow(/403/);
  });

  it('fails to create new nurse to the center', async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_nurse.post(entry_point + `/api/admin/centers/${center_id}/nurses`, { nurseId: uuid() });
    };
    await expect(t).rejects.toThrowError();
  });

  it('get two nurses from the center', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/centers/${center_id}/nurses`);
    expect(ret.data.Count).toBe(2);
    expect(ret.data.Items).toHaveLength(2);
  });

  it('create new patient to the center', async () => {
    const ret = await axios_nurse.post(entry_point + `/api/nurse/centers/${center_id}/patients`, {
      phone: '090-3293-2333',
    });
    expect(ret.data).toHaveProperty('patientId');
    patient_id3 = ret.data.patientId;
    expect(ret.data).toHaveProperty('password');
    expect(ret.data.phone).toBe('090-3293-2333');
    expect(ret.data).toHaveProperty('statuses');
  });

  it('fails to create new patient to the center that is not under my managemenet', async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_nurse.post(entry_point + `/api/nurse/centers/${center_id_with_no_nurse}/patients`, {
        patientId: uuid(),
        phone: '090-9999-3238',
      });
    };
    await expect(t).rejects.toThrowError();
  });

  it('read new patient id', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/patients/${patient_id3}`);
    patient_item = ret.data;
    expect(ret.data.phone).toBe('090-3293-2333');
  });

  it("can't read patient which is not related to a managing center", async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_nurse.get(entry_point + `/api/nurse/patients/${patient_id_in_another_center}`);
    };
    await expect(t).rejects.toThrowError();
  });

  it('create new patient to the center', async () => {
    const ret = await axios_nurse.post(entry_point + `/api/nurse/centers/${center_id}/patients`, {
      patientId: uuid(),
      phone: '090-3827-1428',
    });
    expect(ret.data).toHaveProperty('password');
    expect(ret.data).toHaveProperty('display');
    expect(ret.data.phone).toBe('090-3827-1428');
  });

  it('get 4 patients from the center', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/centers/${center_id}/patients`);
    expect(ret.data.Count).toBe(4);
    expect(ret.data.Items).toHaveLength(4);
  });

  it('update existing patient', async () => {
    const datetime = new Date().toISOString();
    patient_item.policy_accepted = datetime;
    const ret = await axios_nurse.put(entry_point + `/api/nurse/patients/${patient_id3}`, patient_item);
    expect(ret.data.policy_accepted).toBe(datetime);
  });

  it('update display flag', async () => {
    const datetime = new Date().toISOString();
    patient_item.display = false;
    const ret = await axios_nurse.put(entry_point + `/api/nurse/patients/${patient_id3}`, patient_item);
    expect(ret.data.display).toBe(false);
  });

  it('fails to update existing patient that is not in the managing center', async () => {
    const datetime = new Date().toISOString();
    patient_item_in_another_center.policy_accepted = datetime;
    const t = async () => {
      await axios_nurse.put(
        entry_point + `/api/nurse/patients/${patient_id_in_another_center}`,
        patient_item_in_another_center
      );
    };
    await expect(t).rejects.toThrow(/403/);
  });

  it('fails to update existing patient to move another center that is not mine', async () => {
    expect.assertions(1);
    patient_item.centerId = center_id3;
    const t = async () => {
      await axios_nurse.put(entry_point + `/api/nurse/patients/${patient_id3}`, patient_item);
    };
    await expect(t).rejects.toThrow(/403/);
  });

  it('post new status to existing patient', async () => {
    const dummyPostData: StatusParam = {
      SpO2: 98,
      body_temperature: 36.0,
      pulse: 60,
      symptom: {
        cough: false,
        phlegm: false,
        suffocation: false,
        headache: false,
        sore_throat: false,
        remarks: 'dummy',
      },
    };
    const ret = await axios_nurse.post(`${entry_point}/api/nurse/patients/${patient_id3}/statuses`, dummyPostData);
    const result = ret.data;
    expect(result.statusId).not.toBe(null);
    expect(result.SpO2).toBe(dummyPostData.SpO2);
    expect(result.body_temperature).toBe(dummyPostData.body_temperature);
    expect(result.pulse).toBe(dummyPostData.pulse);
    expect(result.centerId).toBe(center_id);
    expect(result.patientId).toBe(patient_id3);
    expect(result.created).not.toBe(null);
    expect(result.symptom!.cough).toBe(dummyPostData.symptom!.cough);
    expect(result.symptom!.phlegm).toBe(dummyPostData.symptom!.phlegm);
    expect(result.symptom!.headache).toBe(dummyPostData.symptom!.headache);
    expect(result.symptom!.sore_throat).toBe(dummyPostData.symptom!.sore_throat);
    expect(result.symptom!.suffocation).toBe(dummyPostData.symptom!.suffocation);
    expect(result.symptom!.remarks).toBe(dummyPostData.symptom!.remarks);
    expect(result.symptom!.symptomId).not.toBe(null);
  });
  it('post new status to other patient that is not managed by my centers', async () => {
    const dummyPostData: StatusParam = {
      SpO2: 98,
      body_temperature: 36.0,
      pulse: 60,
      symptom: {
        cough: false,
        phlegm: false,
        suffocation: false,
        headache: false,
        sore_throat: false,
        remarks: 'dummy',
      },
    };
    const t = async () => {
      await axios_nurse.post(`${entry_point}/api/nurse/patients/${patient_id_in_another_center}/statuses`, dummyPostData);
    }
    await expect(t).rejects.toThrow(/403/);
  });
});

describe('refresh Token', () => {
  it('login with refreshToken', async() => {
    const ret = await axios.post(entry_point + '/api/nurse/login', {
      refreshToken: refreshToken
    });
    expect(ret.data).toHaveProperty('idToken');
  });
});

/*
 * Patient methods
 */
describe('Patient user', () => {
  let axios_patient: AxiosInstance;
  let patient_item: any;
  let status_id: string;
  beforeAll(async () => {
    const ret = await axios.post(entry_point + '/api/patient/login', {
      username: patient_id,
      password: patient_password,
    });
    idToken = ret.data.idToken;
    refreshToken = ret.data.refreshToken;
    axios_patient = axios.create({
      headers: {
        Authorization: idToken,
      },
    });
  });

  it('get policy_accepted', async () => {
    const ret = await axios.post(entry_point + '/api/patient/login', {
      username: patient_id,
      password: patient_password,
    });
    expect(ret.data.policy_accepted).toBe(undefined);
  });

  it('accept policy', async () => {
    const ret = await axios_patient.post(entry_point + `/api/patient/patients/${patient_id}/accept_policy`);
    console.log(ret.data)
    expect(ret.data.result).toBe('OK')
  });


  it('can\'t accept another person\'s policy', async () => {
    expect.assertions(1);
    const t = async() => {
      await axios_patient.post(entry_point + `/api/patient/patients/${patient_id2}/accept_policy`);
    }
    await expect(t).rejects.toThrow(/403/)
  });

  it('fails to create new center', async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_patient.post(entry_point + '/api/admin/centers', { centerName: 'A保健所' });
    };
    await expect(t).rejects.toThrowError();
  });

  it('read my patient id', async () => {
    const ret = await axios_patient.get(entry_point + `/api/patient/patients/${patient_id}`);
    patient_item = ret.data;
    expect(ret.data.phone).toBe(phone);
  });

  it("can't read patient which is not mine", async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_patient.get(entry_point + `/api/patient/patients/${patient_id2}`);
    };
    await expect(t).rejects.toThrow(/403/);
  });

  it('post new status without symptom', async () => {
    const dummyPostData: StatusParam = {
      SpO2: 97,
      body_temperature: 36.5,
      pulse: 60,
    };
    const ret = await axios_patient.post(`${entry_point}/api/patient/patients/${patient_id}/statuses`, dummyPostData);
    const result: Status = ret.data;
    expect(result.statusId).not.toBe(null);
    status_id = result.statusId;
    expect(result.SpO2).toBe(dummyPostData.SpO2);
    expect(result.body_temperature).toBe(dummyPostData.body_temperature);
    expect(result.pulse).toBe(dummyPostData.pulse);
    expect(result.centerId).toBe(center_id);
    expect(result.patientId).toBe(patient_id);
    expect(result.created).not.toBe(null);
    expect(result.symptom).toBeUndefined();
  });
  it('post another status with symptom', async () => {
    const dummyPostData: StatusParam = {
      SpO2: 98,
      body_temperature: 37.5,
      pulse: 75,
      symptom: {
        cough: true,
        phlegm: true,
        suffocation: true,
        headache: true,
        sore_throat: true,
      },
    };
    const ret = await axios_patient.post(`${entry_point}/api/patient/patients/${patient_id}/statuses`, dummyPostData);
    const result: Status = ret.data;
    expect(result.statusId).not.toBe(null);
    expect(result.SpO2).toBe(dummyPostData.SpO2);
    expect(result.body_temperature).toBe(dummyPostData.body_temperature);
    expect(result.pulse).toBe(dummyPostData.pulse);
    expect(result.centerId).toBe(center_id);
    expect(result.patientId).toBe(patient_id);
    expect(result.created).not.toBe(null);
    expect(result.symptom!.cough).toBe(dummyPostData.symptom!.cough);
    expect(result.symptom!.phlegm).toBe(dummyPostData.symptom!.phlegm);
    expect(result.symptom!.headache).toBe(dummyPostData.symptom!.headache);
    expect(result.symptom!.sore_throat).toBe(dummyPostData.symptom!.sore_throat);
    expect(result.symptom!.suffocation).toBe(dummyPostData.symptom!.suffocation);
    expect(result.symptom!.remarks).toBeUndefined();
    expect(result.symptom!.symptomId).not.toBe(null);
  });
  it('post another status with symptom remarks', async () => {
    const dummyPostData: StatusParam = {
      SpO2: 98,
      body_temperature: 36.0,
      pulse: 60,
      symptom: {
        cough: false,
        phlegm: false,
        suffocation: false,
        headache: false,
        sore_throat: false,
        remarks: 'dummy',
      },
    };
    const ret = await axios_patient.post(`${entry_point}/api/patient/patients/${patient_id}/statuses`, dummyPostData);
    const result = ret.data;
    expect(result.statusId).not.toBe(null);
    expect(result.SpO2).toBe(dummyPostData.SpO2);
    expect(result.body_temperature).toBe(dummyPostData.body_temperature);
    expect(result.pulse).toBe(dummyPostData.pulse);
    expect(result.centerId).toBe(center_id);
    expect(result.patientId).toBe(patient_id);
    expect(result.created).not.toBe(null);
    expect(result.symptom!.cough).toBe(dummyPostData.symptom!.cough);
    expect(result.symptom!.phlegm).toBe(dummyPostData.symptom!.phlegm);
    expect(result.symptom!.headache).toBe(dummyPostData.symptom!.headache);
    expect(result.symptom!.sore_throat).toBe(dummyPostData.symptom!.sore_throat);
    expect(result.symptom!.suffocation).toBe(dummyPostData.symptom!.suffocation);
    expect(result.symptom!.remarks).toBe(dummyPostData.symptom!.remarks);
    expect(result.symptom!.symptomId).not.toBe(null);
  });

  it('get three statuses', async () => {
    const ret = await axios_patient.get(entry_point + `/api/patient/patients/${patient_id}/statuses`);
    expect(ret.data.length).toBe(3);
  });

  it('could not read statuses to another patient', async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_patient.get(entry_point + `/api/patient/patients/${patient_id2}/statuses`);
    };
    await expect(t).rejects.toThrow(/403/);
  });

  it('delete non-existing status', async () => {
    expect.assertions(1);
    const t = async () => {
      const ret = await axios_patient.delete(entry_point + `/api/patient/patients/${patient_id}/statuses/undefined`);
    }
    await expect(t).rejects.toThrow(/500/)
  });

  it('delete specified status', async () => {
    const ret = await axios_patient.delete(entry_point + `/api/patient/patients/${patient_id}/statuses/${status_id}`);
    expect(ret.status).toBe(200)
    expect(ret.data.statuses.length).toBe(2);
    expect(ret.data.statuses.findIndex((item: any) => item.status_id === status_id)).toBe(-1)
  });

  it('get two statuses', async () => {
    const ret = await axios_patient.get(entry_point + `/api/patient/patients/${patient_id}/statuses`);
    expect(ret.data.length).toBe(2);
  });
  it("can't post status to another patient", async () => {
    expect.assertions(1);
    const dummyPostData: StatusParam = {
      SpO2: 97,
      body_temperature: 36.5,
      pulse: 1,
      symptom: {
        cough: true,
        phlegm: true,
        suffocation: true,
        headache: true,
        sore_throat: true,
        remarks: 'dummy',
      },
    };
    const t = async () => {
      const ret = await axios_patient.post(
        `${entry_point}/api/patient/patients/${patient_id2}/statuses`,
        dummyPostData
      );
    };
    await expect(t).rejects.toThrowError();
  });
  it('post other statuses', async () => {
    let dummyPostData: StatusParam = {
      SpO2: 98,
      body_temperature: 36.0,
      pulse: 60,
      symptom: {
        cough: false,
        phlegm: false,
        suffocation: false,
        headache: false,
        sore_throat: false,
        remarks: 'dummy',
      },
    };
    await Promise.all([...Array(50)].map(async () => {
      dummyPostData.SpO2 = 90 + Math.random() * 10
      dummyPostData.pulse = 70 + Math.random() * 20
      dummyPostData.body_temperature = 35 + Math.random() * 5
      await axios_patient.post(`${entry_point}/api/patient/patients/${patient_id}/statuses`, dummyPostData)
    }
    ))
    dummyPostData.symptom!.remarks = 'latest one'
    await axios_patient.post(`${entry_point}/api/patient/patients/${patient_id}/statuses`, dummyPostData)
  });
  it('get 53 statuses', async () => {
    const ret = await axios_patient.get(entry_point + `/api/patient/patients/${patient_id}/statuses`);
    expect(ret.data.length).toBe(53);
    expect(Date.parse(ret.data[0].created)).toBeGreaterThan(Date.parse(ret.data[1].created))
  });
  it('get latest 20 statuses by patient', async () => {
    const ret = await axios_patient.get(entry_point + `/api/patient/patients/${patient_id}`);
    expect(ret.data.statuses.length).toBe(20);
    expect(ret.data.statuses![0].symptom!.remarks).toBe('latest one');
    expect(Date.parse(ret.data.statuses![0].created)).toBeGreaterThan(Date.parse(ret.data.statuses![1].created))
  });
});

/*
 * Nurse will read patient's data
 */
describe('Nurse user(again)', () => {
  let axios_nurse: AxiosInstance;
  let nurse_item: any;
  let patient_item: any;
  beforeAll(async () => {
    const ret = await axios.post(entry_point + '/api/nurse/login', { username: nurse_id, password: nurse_password });
    idToken = ret.data.idToken;
    axios_nurse = axios.create({
      headers: {
        Authorization: idToken,
      },
    });
  });

  it('get latest 20 statuses by patient', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/patients/${patient_id}`);
    expect(ret.data.statuses.length).toBe(20);
    expect(ret.data.statuses![0].symptom!.remarks).toBe('latest one');
  });

  it('get full statuses by patient', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/patients/${patient_id}/statuses`);
    expect(ret.data.length).toBe(53);
  });

  it('get list of patients and statuses by center', async () => {
    const ret = await axios_nurse.get(entry_point + `/api/nurse/centers/${center_id}/patients`);
    expect(ret.data.Count).toBe(4);
    expect(ret.data.Items).toBeDefined()
    const items = ret.data.Items! as PatientParam[]
    const mydata = items.find(item => item.patientId === patient_id)
    expect(mydata).toBeDefined()
    expect(mydata!.statuses!.length).toBe(20)
  });
  it('fails to get the patients that does not depend on mine', async () => {
    expect.assertions(1);
    const t = async () => {
      await axios_nurse.get(entry_point + `/api/nurse/centers/${center_id3}/patients`);
    }
    await expect(t).rejects.toThrow(/403/)
  });
});

describe('refresh Token', () => {
  it('login with refreshToken', async() => {
    const ret = await axios.post(entry_point + '/api/patient/login', {
      refreshToken: refreshToken
    });
    expect(ret.data).toHaveProperty('idToken');
  });
});

/*
 * Create users for testing
 */
describe('Test user info', () => {

  it('display passwords', () => {
    console.log('=================================');
    console.log(`testNurse password is: ${nurse_password}`);
    console.log(`testPatient password is: ${patient_password}`);
    console.log('=================================');
  });
});
