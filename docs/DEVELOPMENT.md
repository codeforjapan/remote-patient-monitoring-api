# Set up environment

## install dependencies

* Serverless
* node version 12.x
* jq
* sed

### 1. Setup aws-cli

Follow [this AWS instruction](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2.html)

AWS CLIをインストールした後`aws configure`を利用して設定を行います。
アクセスキーIDとシークレットアクセスキーが必要になるので、[こちらのドキュメント](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-configure-quickstart.html)の「アクセスキー ID とシークレットアクセスキー」のセクションを参考につくってください。
また、リージョンは`ap-northeast-1`（東京）を指定します。

```bash
aws configure --profile your-profile-name
export AWS_PROFILE="your-profile-name"
```

### 2. Install Serverless environment

`npm install`

### 3. Edit environment settings

Bucket名はグローバルに一意、ドメイン名はリージョンで一意なので変えて下さい。

config/dev.json

```bash
{
  "AuthAdminUserPoolDomain":"your-api-domain-admin",
  "AuthNurseUserPoolDomain":"your-api-domain-nurse",
  "AuthPatientUserPoolDomain":"your-api-domain-patient",
  "OauthCallbackURL":"https://your.callback.url",
  "OauthSignoutURL":"https://your.signout.url",
  "Bucket":"your-bucket-name",
  "DebugMode":"on"
  "DBPrefix":"RemotePatientMonitoring-",
}
```

### 4. Setup

Dynamo DB のセットアップと、Lambda Function 及び API Gateway の作成の２種類の CloudFormation Stack を作成します。

全て一度で deploy する場合

```bash
npm run deploy
```

DynamoDB 以外を deploy する場合

```bash
npm run deploy:all-gateway
```

### 5. Confirm admin user

`util/.secret.json` というファイルを作り、以下の内容を設定してください。

```json
{
  "auth_user":"管理者のユーザ名", 
  "auth_pass":"設定したいパスワード" (8文字以上、半角英数小文字、半角英数大文字、シンボルを必ず一文字含む)
}
```

以下のコマンドを設定すると、管理者アカウントが設定されます。

```bash
npm run createAdmin
```

最後に IdToken が表示されますので、コピーしておいてください。（ステップ7で使います）

### 6, run Test


以下のコマンドを叩くと、E2E テスト(`/test/e2e/fullspec.test.ts`) が実行されます。
まだ実装されていないテストは、`skip` してあります。

```bash
npm run test:e2e
```

Network Error が出る場合、以下を試してみてください。
get Authkey(`/api/admin/login`) が失敗するとその後のテスト全て失敗するので、そこから最初にチェックするのが良いと思います。

API を deploy する

![deploy API](images/deployAPI.png)

上記でも Network Error が出る場合、該当APIの lambda の管理画面で `Environment variables` を選び、AWS KMS Key の設定を一度適当なKeyに変えてから、`default` に戻してください。
![Key setting](images/key-change.png)

lambda はうまくいくけれと Network Error が出る場合、API Gateway から該当の API を選び、Test を行ってみてください。 `Invalid permissions on Lambda function` で失敗する場合、`Integration Request` の設定で、再度 lambda function をチェックし直してみてください。

![set lambda function](images/set-lambda-function.png)

### 7. Swagger UI にアクセスする

以下のコマンドで、Swagger UI が開きます。step5 で作ったユーザ名/パスワードでログインできます。

```bash
npm run openSwaggerUI
```

Authorize が必要なAPIにアクセスする場合、`Authorize` ボタンから、ステップ5で取得した、`IdToken` の内容を入力する必要があります。

SwaggerUIからAPIを叩いてもうまくいかない場合があります。その場合、AWS の console から、Lambda に Swagger にあるパラメータを渡してtestを直接実行してみてください。それでもエラーになる場合は、Lambda 実行時の認証情報がおかしくなっているケースが多いです。Step 6 の方法を試してみてください。

![test lambda](images/test-lambda.png)

## 開発用情報

### クライアント開発用のテストユーザ

npm run test:e2e を実行すると、`testNurse` と `testPatient` を作成します。最後にパスワードが表示されます。

```:bash
 console.log
    testNurse password is: 5n24uptq

      at test/e2e/fulltest.spec.ts:782:13

  console.log
    testPatient password is: pmxq23v1
```

### E2E テストを実行する

以下のコマンドを叩くと、`/test/e2e/fullspec.test.ts` が実行されます。
まだ実装されていないテストは、`skip` してあります。

```bash
npm run test:e2e
```

ファイルの変更をウォッチしたい場合

```bash
npm run test:e2e:watch
```


### local development

#### ローカル環境での DynamoDB のインストール

Dynamo DB をインストールする

```bash
sls dynamodb install
```

#### DynamoDB のローカルインスタンスを開始

```bash
npm run dynamodb:start
```

`migrations` 以下に、初期に投入される seed データがあります。

#### ローカルで lambda をテストする

```bash
npm run test:local
```

`test/lambda` 以下のテストを実施します。DynamoDBのローカルインスタンスを立ち上げておく必要があります。

#### function をコマンドラインから実行する

```bash
# getCenters の実行
serverless invoke local --function getCenters
# path parameter を渡す
serverless invoke local --function getCenter --data '{ "pathParameters": {"centerId":"c2c43259-2708-4f4f-98d4-d57f72ecac70"}}'
# body データを渡す
serverless invoke local --function postCenter --data '{ "body":{"centerName":"test4"}}'
# 両方渡す場合
serverless invoke local --function putCenter --data '{ "pathParameters": {"centerId":"ccbcebd7-3186-43c2-9cc0-ff6e83ed9dd8"}, "body":{"centerName":"mycenter1"}}'
```

### deploy

#### API や serverless.yml を修正後、再デプロイする

```bash
npm run deploy:gateway
```

## ステージング環境の構築

stg.json ファイルを作る

`cp config/stg.json.sample config/stg.json`

必要な設定をする

`vi config/stg.json`

deploy する
## アンインストール

### 全て削除

```bash
npm run remove:all
```

### 全て削除して再インストール

```bash
npm run redeploy-all
```

### APIのみ削除する

```bash
npm run remove:gateway
```

### DynamoDB のみ削除する

```bash
npm run remove:dynamodb
```
