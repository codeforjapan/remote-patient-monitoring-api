"use strict";
import AWS from 'aws-sdk';
const Dynamo = new AWS.DynamoDB();

export namespace DB {
  export async function initDb(event: any) {
    const tables = await listTables();
    console.log(tables)
    const response = {
      statusCode: 200,
      body: tables
    };
  }
  async function deleteDynamoDBTable(tableName: string) {
    const params = {
      TableName: tableName
    };
    try {
      // テーブル情報を取得する
      const tableInfo = await getTableInfo(params);
      // delete実行
      await deleteTable(params);

      // deleteが完了したのを確認する
      await waitForDeleted(params);

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
      await createTable(createParams);

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
  const listTables = () => {
    return Dynamo.listTables({}, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  }
  /**
   * DynamoDBの情報を取得する
   * @param {*} params 
   */
  const getTableInfo = (params: any) => {
    return Dynamo.describeTable(params, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  };

  /**
   * DynamoDBを削除する
   * @param {*} params 
   */
  const deleteTable = (params: any) => {
    return Dynamo.deleteTable(params, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  };

  /**
   * テーブルの削除が完了されるまで待つ
   * @param {*} params 
   */
  const waitForDeleted = (params: any) => {
    return Dynamo.waitFor('tableNotExists', params, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  }

  /**
   * DynamoDBを作成する
   * @param {*} params 
   */
  const createTable = (params: any) => {
    return Dynamo.createTable(params, (err, data) => {
      if (err) err;
      else data;
    }).promise();
  };
}