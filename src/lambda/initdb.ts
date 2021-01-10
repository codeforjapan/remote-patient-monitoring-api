"use strict";
import AWS, { DynamoDB } from 'aws-sdk';

const getDynamoDBInstance = (event: any) => {
  if (event == '' || ("isOffline" in event && event.isOffline)) {
    return new AWS.DynamoDB({
      region: "localhost",
      endpoint: "http://localhost:8000"
    })
  } else {
    return new AWS.DynamoDB();
  }
}

export namespace DB {
  export async function initDb(event: any) {
    const dbInstance = getDynamoDBInstance(event);
    const alltables = await listTables(dbInstance);
    const tables = alltables.TableNames!.filter(table => table.startsWith(process.env.DBPrefix!))
    for (let table in tables) {
      await initializeDynamoDBTable(dbInstance, table);
    }
    console.log(tables)
    const response = {
      statusCode: 200,
      body: tables
    };
    return response;
  }
  async function initializeDynamoDBTable(dbInstance: DynamoDB, tableName: string) {
    const params = {
      TableName: tableName
    };
    try {
      // テーブル情報を取得する
      const tableInfo = await getTableInfo(dbInstance, params);
      // delete実行
      await deleteTable(dbInstance, params);

      // deleteが完了したのを確認する
      await waitForDeleted(dbInstance, params);

      // 取得したテーブル情報を用いて、テーブル作成用パラメータを生成
      const createParams = {
        AttributeDefinitions: tableInfo.Table!.AttributeDefinitions,
        KeySchema: tableInfo.Table!.KeySchema,
        ProvisionedThroughput: {
          ReadCapacityUnits: tableInfo.Table!.ProvisionedThroughput!.ReadCapacityUnits,
          WriteCapacityUnits: tableInfo.Table!.ProvisionedThroughput!.WriteCapacityUnits
        },
        TableName: tableInfo.Table!.TableName
      };

      // create実行
      await createTable(dbInstance, createParams);

      const response = {
        statusCode: 200,
      };

      return response;
    } catch (err) {
      const response = {
        statusCode: 500,
        err: err
      }

      return response;
    }
  }
  const listTables = (dbInstance: DynamoDB) => {
    return dbInstance.listTables({}, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  }
  /**
   * DynamoDBの情報を取得する
   * @param {*} params 
   */
  const getTableInfo = (dbInstance: DynamoDB, params: any) => {
    return dbInstance.describeTable(params, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  };

  /**
   * DynamoDBを削除する
   * @param {*} params 
   */
  const deleteTable = (dbInstance: DynamoDB, params: any) => {
    return dbInstance.deleteTable(params, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  };

  /**
   * テーブルの削除が完了されるまで待つ
   * @param {*} params 
   */
  const waitForDeleted = (dbInstance: DynamoDB, params: any) => {
    return dbInstance.waitFor('tableNotExists', params, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  }

  /**
   * DynamoDBを作成する
   * @param {*} params 
   */
  const createTable = (dbInstance: DynamoDB, params: any) => {
    return dbInstance.createTable(params, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  };
}