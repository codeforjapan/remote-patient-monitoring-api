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
cd init-db-and-s3
../node_modules/.bin/sls deploy -v
```

### 5. Deploy lamdga funciton

Comment out below line from `./serverless.yml` and deploy once.

`serverless.yml`

```yaml
resources:
  #- ${file(./templates/api-gateway.yml)}
```

```bash
sls deploy -v
```

### 6. Deploy API Gateway

Enable commented-out line from `./serverless.yml` and deploy it again.

`serverless.yml`

```yaml
resources:
  - ${file(./templates/api-gateway.yml)}
```

```bash
sls deploy -v
```

