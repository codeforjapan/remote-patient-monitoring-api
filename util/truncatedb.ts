
"use strict"

import AWS, { DynamoDB } from 'aws-sdk';
import * as configsys from '../src/webpack/config';
import configFileDev from '../config/dev.json';
import configFileStg from '../config/stg.json';
import configFilePrd from '../config/prd.json';

let profile = 'default';
if (process.env.AWS_PROFILE) {
  profile = process.env.AWS_PROFILE;
}
var credentials = new AWS.SharedIniFileCredentials({ profile: profile });
interface StringKeyObject {
  // 今回はstring
  [key: string]: any;
}
export class TruncateDB {
  private db: DynamoDB;
  private configFile: any;
  private config: configsys.Config;
  constructor(stage: string) {
    this.configFile = (stage === 'prd') ? configFilePrd : (stage === 'stg') ? configFileStg : configFileDev;
    this.config = configsys.readConfig(stage)
    AWS.config.update({ region: this.config.region });
    AWS.config.credentials = credentials;
    this.db = new DynamoDB({ apiVersion: '2012-08-10' })
  }
  async truncate() {
    const tables = await this.db.listTables({ Limit: 100 }).promise()
    for (let table of tables.TableNames!.filter(table => table.startsWith(this.configFile.DBPrefix!))) {
      await this.truncateTable(table);
    }
    return tables;
  }
  async truncateTable(table: string) {
    try {
      // テーブル詳細を取得
      const params = { TableName: table }
      const data = await this.db.describeTable(params).promise()
      const key_schema = data.Table!.KeySchema!.map(schema => schema.AttributeName);
      // テーブルスキャン
      const scanparams: DynamoDB.DocumentClient.ScanInput = {
        TableName: table,
        Limit: 100,
        AttributesToGet: key_schema
      }
      // 削除対象がなくなるまで繰り返す
      let records = await this.db.scan(scanparams).promise()
      while (records.Count! > 0) {
        let items: StringKeyObject = {}
        // delete scanned data
        items[table] = records.Items?.map(item => { return { DeleteRequest: { Key: item } } })
        const deleterecords: DynamoDB.BatchWriteItemInput = {
          RequestItems: items
        }
        await this.db.batchWriteItem(deleterecords).promise();
        records = await this.db.scan(scanparams).promise()
      }
    } catch (err) {
      console.log(err);
    }
  }
}