# Set up environment

## install Serverless

### 1. Install node version 12.x

### 2. Setup aws-cli

Follow [this AWS instruction](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2.html)

Set AWS profile

```bash
aws configure --profile your-profile-name
export AWS_PROFILE="your-profile-name"
```

### 3. Install Serverless environment

`npm install`

### 4. Edit environment settings

リージョン毎に一意なので、Bucket名とドメイン名は変えて下さい。
また、AdminUserEmail も変更してください。

config/dev.json

```bash
{
  "SwaggerUIUserPoolDomain":"your.domain",
  "AuthUserPoolDomain":"your.api.domain",
  "OauthCallbackURL":"https://your.callback.url",
  "OauthSignoutURL":"https://your.signout.url",
  "Bucket":"your-bucket-name",
  "DebugMode":"on"
  "DBPrefix":"RemotePatientMonitoring-",
  "AdminUserEmail":"hal@code4japan.org",
  "AdminUserName":"admin"
}
```

### 5. Setup

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



### 6. Confirm admin user

`util/.secret` というファイルを作り、以下の内容を設定してください。

```json
{
  "auth_user":"admin(dev.json で設定したものと同じ)", 
  "auth_pass":"設定したいパスワード"
}
```

config/dev.json にセットしたメールアドレスに、仮パスワードを届いていると思います。
それを使って、下記コマンドでユーザを有効にしてください。

```bash
npm run confirmAdmin -- -c '仮パスワード' 
```

`.secret` で設定されたパスワードで、Auth用ユーザの Confirmation がされます。

## 開発用情報

### API や serverless.yml を修正後、再デプロイする

```bash
npm run deploy:gateway
```

### APIを削除する

```bash
sls remove
```

### DynamoDB を削除する

```bash
sls remove -c serverless-dynamodb.yml
```
