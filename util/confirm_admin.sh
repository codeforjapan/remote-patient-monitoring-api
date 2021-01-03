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

USERNAME=`cat .secret | jq -r '.auth_user'`
PASSWORD=`cat .secret | jq -r '.auth_pass'`
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
echo $RET | jq

# set new password 
if [ -n "$PASSWORD" ]; then
    SESSION=`echo $RET | jq -r '.Session'`
    echo '#--- set new password'
    aws cognito-idp admin-respond-to-auth-challenge \
    --user-pool-id $POOL_ID \
    --client-id $CLIENT_ID \
    --challenge-name NEW_PASSWORD_REQUIRED \
    --challenge-responses NEW_PASSWORD="'${PASSWORD}'",USERNAME="'${USERNAME}'" \
    --session $SESSION

    echo 'NEW USER CONFIRMED'
fi