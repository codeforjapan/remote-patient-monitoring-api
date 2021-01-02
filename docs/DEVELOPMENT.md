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

### 4. Setup Dynamodb and S3

```bash
sls deploy -v -c serverless-dynamodb.yml
```

### 5. Deploy lamdga funciton

```bash
sls deploy -v -c serverless-lambda.yml
```

### 6. Deploy API Gateway

```bash
sls deploy -v
```

