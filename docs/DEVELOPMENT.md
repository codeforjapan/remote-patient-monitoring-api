# Set up environment

## install dependencies

* Serverless
* node version 12.x
* jq
* sed

### 1. Setup aws-cli

Follow [this AWS instruction](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2.html)

Set AWS profile

```bash
aws configure --profile your-profile-name
export AWS_PROFILE="your-profile-name"
```

### 2. Install Serverless environment

`npm install`

### 3. Edit environment settings

リージョン毎に一意なので、Bucket名とドメイン名は変えて下さい。
また、AdminUserEmail も変更してください。

config/dev.json

```bash
{
  "AuthAdminUserPoolDomain":"your-api-domain-admin",
  "AuthNurseUserPoolDomain":"your-api-domain-nurse",
  "AuthPatientUserPoolDomain":"your-api-domain-patient",
  "AuthAdminUserPoolDomain":"your.api.domain",
  "OauthCallbackURL":"https://your.callback.url",
  "OauthSignoutURL":"https://your.signout.url",
  "Bucket":"your-bucket-name",
  "DebugMode":"on"
  "DBPrefix":"RemotePatientMonitoring-",
  "AdminUserEmail":"hal@code4japan.org",
  "AdminUserName":"admin"
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

※初回のデプロイ時のみ、API Gateway の Authorization の CLIENT_POOL のIDを設定するため、以下の手順で2回 deploy をしてください。

```bash
npm run deploy && npm run deploy:gateway
```

エラーが出る場合、AWS の AWS Gateway Console から該当APIを選び、 `Deploy API` を行って下さい。（なぜか新しいバージョンが自動でdeployされない場合がある。誰かわかる人がいたら調べて欲しいです。）

### 5. Confirm admin user

`util/.secret.json` というファイルを作り、以下の内容を設定してください。

```json
{
  "auth_user":"admin(dev.json で設定したものと同じ)", 
  "auth_pass":"設定したいパスワード"
}
```

`config/dev.json` にセットしたメールアドレスに、仮パスワードを届いていると思います。
それを使って、下記コマンドでユーザを有効にしてください。

```bash
npm run confirmAdmin -- -c '仮パスワード' 
```

`.secret.json` で設定されたパスワードで、Auth用ユーザの Confirmation がされます。

最後に IdToken が表示されますので、コピーしておいてください。（ステップ6で使います）

### 6. Swagger UI にアクセスする

以下のコマンドで、Swagger UI が開きます。step5 で作ったユーザ名/パスワードでログインできます。

```bash
npm run openSwaggerUI
```

Authorize が必要なAPIにアクセスする場合、`Authorize` ボタンから、ステップ5で取得した、`IdToken` の内容を入力する必要があります。
（入力してもうまく行かない場合、 AWS Gateway Console から `Deploy API` を行ってみて下さい。）

SwaggerUIからAPIを叩いてもうまくいかない場合があります。その場合、AWS の console から、Lambda にSwagger通りのパラメータを渡して直接実行してみてください。それでもエラーになる場合は、認証情報がおかしくなっているケースが多いです。
その場合、AWS KMS Key の設定を一度適当なKeyに変えてから、`default` に戻してください。
![Key setting](images/key-change.png)
（1月17日現在では、そもそも center 系のAPIしか実装されていませんのでお気をつけください。）

## 開発用情報

### E2E テストを実行する

以下のコマンドを叩くと、`/test/e2e/fullspec.test.ts` が実行されます。
まだ実装されていないテストは、`skip` してあります。

```bash
npm run test
```

ファイルの変更をウォッチしたい場合

```bash
npm run test:watch
```


### local development

#### ローカル環境での DynamoDB のインストール

Dynamo DB をインストールする

```bash
sls dynamodb install
```

#### DynamoDB のローカルインスタンスを開始

```bash
npm dynamodb:start
```

#### function をローカルで実行する

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
