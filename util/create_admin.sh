#!/bin/bash

usage_exit() {
        echo "Usage: $0" 1>&2
        exit 1
}

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"
# check .secret
if [ ! -e .secret.json ]; then
  echo -e -n ".secret.json file does not exist. Please create .secret.json file with below\n\
{
  \"auth_user\":\"admin\",\n\
  \"auth_pass\":\"new_password\"\n\
}\n\n"
  usage_exit
fi

USERID=`cat .secret.json | jq -r '.auth_user'`
PASSWORD=`cat .secret.json | jq -r '.auth_pass'`


# check .secret
POOL_ID=`cat config.json | jq -r 'select(.[].apiGateway.stageName == "dev") | .[].cognito.adminUserPoolId'`
CLIENT_ID=`cat config.json | jq -r 'select(.[].apiGateway.stageName == "dev") | .[].cognito.adminUserPoolWebClientId'`

echo "#--- create admin user "

RET=`aws cognito-idp admin-create-user \
--user-pool-id $POOL_ID \
--username ${USERID} \
--user-attributes Name="email",Value="$EMAIL" \
--temporary-password ${PASSWORD}`
if [ $? -ne 0 ]; then
  echo "create failed"
  exit 1
fi


RET=`aws cognito-idp admin-initiate-auth \
--user-pool-id $POOL_ID \
--client-id $CLIENT_ID \
--auth-flow ADMIN_NO_SRP_AUTH \
--auth-parameters \
USERNAME=${USERID},PASSWORD="${PASSWORD}"`
if [ $? -ne 0 ]; then
  echo "login failed"
  exit 1
fi
echo $RET | jq

if [ `echo $RET | jq -r '.ChallengeName'` != "NEW_PASSWORD_REQUIRED" ]; then
  exit 0
fi

# set new password 
if [ -n "$PASSWORD" ]; then
    SESSION=`echo $RET | jq -r '.Session'`
    echo $SESSION
    echo '#--- set new password'
    RET=`aws cognito-idp admin-respond-to-auth-challenge \
    --user-pool-id $POOL_ID \
    --client-id $CLIENT_ID \
    --challenge-name NEW_PASSWORD_REQUIRED \
    --challenge-responses NEW_PASSWORD="'${PASSWORD}'",USERNAME="'${USERID}'" \
    --session $SESSION`
    echo $RET | jq
    if [ $? -ne 0 ]; then
      echo "Changing password failed"
      exit 1
    else
      echo 'NEW USER CONFIRMED'
    fi
fi