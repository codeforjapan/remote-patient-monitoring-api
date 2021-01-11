
"use strict"

import AWS, { DynamoDB } from 'aws-sdk';
import { config } from '../src/webpack/config';
import configFile from '../config/dev.json';

let profile = 'default';
if (process.env.AWS_PROFILE) {
  profile = process.env.AWS_PROFILE;
}
var credentials = new AWS.SharedIniFileCredentials({ profile: profile });
AWS.config.update({ region: config.region });
AWS.config.credentials = credentials;
const db = new DynamoDB({ apiVersion: '2012-08-10' })

export namespace TruncateDB {
  export async function truncate() {
    const tables = await db.listTables({ Limit: 100 }).promise()
    for (let table of tables.TableNames!.filter(table => table.startsWith(configFile.DBPrefix!))) {
      await truncateTable(table);
    }
    return tables;
  }
  async function truncateTable(table: string) {
    try {
      // テーブル詳細を取得
      const params = { TableName: table }
      const data = await db.describeTable(params).promise()
      const key_schema = data.Table!.KeySchema!.map(schema => schema.AttributeName);
      // テーブルスキャン
      const scanparams: DynamoDB.DocumentClient.ScanInput = {
        TableName: table,
        Limit: 100,
        AttributesToGet: key_schema
      }
      // 削除対象がなくなるまで繰り返す
      let records = await db.scan(scanparams).promise()
      while (records.Count! > 0) {
        let items = {}
        // delete scanned data
        items[table] = records.Items?.map(item => { return { DeleteRequest: { Key: item } } })
        const deleterecords: DynamoDB.BatchWriteItemInput = {
          RequestItems: items
        }
        await db.batchWriteItem(deleterecords).promise();
        records = await db.scan(scanparams).promise()
      }
    } catch (err) {
      console.log(err);
    }
  }
}