#!/bin/bash

usage_exit() {
        echo "Usage: $0 [-c confirmation code]" 1>&2
        exit 1
}

while getopts c:h OPT
do
    case $OPT in
        c)  CHALLENGE=$OPTARG
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

shift $((OPTIND - 1))

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

USERNAME=`cat .secret.json | jq -r '.auth_user'`
PASSWORD=`cat .secret.json | jq -r '.auth_pass'`
POOL_ID=`cat config.json | jq -r '.cognito.userPoolId'`
CLIENT_ID=`cat config.json | jq -r '.cognito.userPoolWebClientId'`

if [ -z "$CHALLENGE" ]; then
  CHALLENGE=$PASSWORD
  PASSWORD=''
fi
echo "#--- retrieve login session "
RET=`aws cognito-idp admin-initiate-auth \
--user-pool-id $POOL_ID \
--client-id $CLIENT_ID \
--auth-flow ADMIN_NO_SRP_AUTH \
--auth-parameters \
USERNAME=${USERNAME},PASSWORD="${CHALLENGE}"`
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
    --challenge-responses NEW_PASSWORD="'${PASSWORD}'",USERNAME="'${USERNAME}'" \
    --session $SESSION`
    echo $RET | jq
    if [ $? -ne 0 ]; then
      echo "Changing password failed"
      exit 1
    else
      echo 'NEW USER CONFIRMED'
    fi
fi