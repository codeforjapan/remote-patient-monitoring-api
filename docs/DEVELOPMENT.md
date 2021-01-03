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

リージョン毎に一意なので、Bucket名とドメイン名は変えて下さい

config/dev.json

```bash
{
  "SwaggerUIUserPoolDomain":"your.domain",
  "AuthUserPoolDomain":"your.api.domain",
  "OauthCallbackURL":"https://your.callback.url",
  "OauthSignoutURL":"https://your.signout.url",
  "Bucket":"your-bucket-name",
  "DebugMode":"on"
}
```

### 5. Setup Dynamodb and S3

```bash
sls deploy -v -c serverless-dynamodb.yml
```

### 6. Deploy lamdga funciton

```bash
sls deploy -v -c serverless-lambda.yml
```

### 7. Deploy API Gateway

```bash
sls deploy -v
```
