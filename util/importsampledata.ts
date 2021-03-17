"use strict"
import * as fs from 'fs';
import csvSync = require('csv-parse/lib/sync');
import * as configsys from '../src/webpack/config';
import { AxiosInstance } from 'axios'
import axios from 'axios';
import { Patient, PatientParam, Center, StatusParam } from '../src/lambda/definitions/types';

//import { v4 as uuid } from 'uuid';

//let entry_point: string;

interface LoadedStatus {
  patientId: string;
  created: string;
  temperature: string;
  pulse: string;
  spo2: string;
}

export class Importer {
  private config: any;
  private loadedIDs: string[] = [];
  private api: APIcaller;
  private userinfo: {username: string, password: string}

  constructor(stage: string, userinfo: {username: string, password: string}) {
    this.config = this.readConfig(configsys, stage)
    this.api = new APIcaller(this.config)
    this.userinfo = userinfo
  }
  /**
   * import data to the database with API 
   * @param data 
   * @returns 
   */
  async importData(data: string[][]):Promise<string> {
    await this.api.login(this.userinfo.username, this.userinfo.password)
    const center = await this.api.getCenter()
    if (!center.centerId) {
      throw new Error('getting center ID failed')
    }
    console.log(`# importing patients to center ${center.centerName}`)
    for (let i=0, len=data.length; i < len ;i++){
      const item = data[i]
      const status: LoadedStatus = {
        patientId: item[0],
        created: item[1],
        temperature: item[2],
        pulse: item[3],
        spo2: item[4]
      }
      console.log(`load ${status.patientId}, ${status.created}`)
      if (!this.loadedIDs[status.patientId]){
        const data = await this.api.putPatient(center.centerId, status.patientId)
        if (!data.patientId) {
          throw new Error('creating patient failed')
        }else{
          this.loadedIDs.push(data.patientId)
        }
      }
      // ステータスを追加
      await this.api.putStatus(status);
    }
    return new Promise((resolve) => {
      resolve('ok')
    })
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  readConfig(configsys: any,stage: string): configsys.Config {
    return (configsys.default as configsys.Config[]).find(
      (item) => item.apiGateway.stageName === stage
    ) as configsys.Config;
  }
}
export class DataLoader {
  loadFile(filepath: string): string[][]{
    // Read CSV as 2-D list.
    const data = fs.readFileSync(filepath);
    const matrix: string[][] = csvSync(data);
    return matrix;
  }
}
export class APIcaller {
  private entry_point: string;
  private axios_admin: AxiosInstance;
  constructor(config: configsys.Config ){
    this.entry_point = `https://${config.apiGateway.restApiId}.execute-api.${config.region}.amazonaws.com/${config.apiGateway.stageName}`;
  }
  /**
   * ログイン処理
   * @param username 
   * @param password 
   */
  async login(username: string, password: string): Promise<void> {
    console.log('# login')
    const ret = await axios.post(this.entry_point + '/api/admin/login', {
      username: username,
      password: password
    });
    if (!ret.data.idToken) {
      throw new Error('login failed')
    }
    const idToken = ret.data.idToken;
    console.log('# logged in')
    this.axios_admin = axios.create({
      headers: {
        Authorization: idToken,
      },
    });
  }
  async getCenter(): Promise<Center>{
    console.log('# getCenter')
    if (!this.axios_admin) {
      throw new Error('you need login before calling this API')
    }
    console.log(`${this.entry_point}/api/admin/nurses/testNurse`)
    const ret = await this.axios_admin.get(`${this.entry_point}/api/admin/nurses/testNurse`);
    return ret.data.manageCenters[0]
  }
  /**
   * create new patient with patient ID
   * @param patientId  
   * @returns 
   */
  async putPatient(centerId: string, patientId: string):Promise<Patient> {
    console.log('# put patient')
    if (!this.axios_admin) {
      throw new Error('you need login before calling this API')
    }
    console.log(`${this.entry_point}/api/admin/patients/${patientId}`)
    let needdelete: boolean;
    const param:PatientParam = {
      patientId: patientId,
      phone: '03-1239-333' + patientId,
      memo: '',
      display: true,
      statuses: [],
      centerId: centerId
    }
    try{
        // 存在しているかどうか確かめる
      const ret = await this.axios_admin.get(`${this.entry_point}/api/admin/patients/${patientId}`);
      if (ret.data){
        needdelete = true
      }else{
        needdelete = false
      }
    }catch(err){
      needdelete = false
    }
    if (needdelete) {
      // 既に存在していたらステータスを削除する
      const ret3 = await this.axios_admin.put(`${this.entry_point}/api/admin/patients/${patientId}`, param);
      return ret3.data
    }else{
      // 存在していない場合追加
      const ret3 = await this.axios_admin.post(`${this.entry_point}/api/admin/centers/${centerId}/patients`, param);
      return ret3.data
    }
  }
  /**
   * ステータスを追加する
   * @param status 
   */
  async putStatus(status: LoadedStatus):Promise<void> {
    console.log('# put status')
    if (!this.axios_admin) {
      throw new Error('you need login before calling this API')
    }
    status.created = '2021/' + status.created.replace('AM','09:00').replace('PM', "21:00")

    const param: StatusParam = {
      SpO2: parseInt(status.spo2),
      body_temperature: parseInt(status.temperature),
      pulse: parseInt(status.pulse),
      created: new Date(status.created).toISOString()
    }
    await this.axios_admin.post(this.entry_point + `/api/admin/patients/${status.patientId}/statuses`, param);
  }
}
const main = () => {
  const stage = process.argv[3] || 'dev'
  const buffer = fs.readFileSync('./.secret.json')
  const admin = JSON.parse(buffer.toString())
  const importer = new Importer(stage, {username: admin.auth_user, password: admin.auth_pass})
  const loader = new DataLoader()
  importer.importData(loader.loadFile('sampledata.csv')).then((value) => {
    console.log(value)
  }).catch((error) =>{
    console.log(error)
  })
}

main();