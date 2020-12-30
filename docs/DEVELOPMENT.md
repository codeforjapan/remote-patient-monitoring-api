# Set up environment

## install Serverless

### 1. Install node version 12.x

### 2. Setup aws-cli

Follow [this AWS instruction](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2.html)

Set AWS profile 

```
aws configure --profile your-profile-name
export AWS_PROFILE="your-profile-name"
```

### 3. Install Serverless environment

`yarn install`

### 4. Deploy

```
sls deploy -v
```