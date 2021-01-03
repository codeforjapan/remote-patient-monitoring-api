#!/bin/bash

usage_exit() {
        echo "Usage: $0 [-c confirmation code] [-p new password] " 1>&2
        exit 1
}

while getopts c:p:u:h OPT
do
    case $OPT in
        c)  VALUE_C=$OPTARG
            ;;
        p)  VALUE_P=$OPTARG
            ;;
        u)  VALUE_U=$OPTARG
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

shift $((OPTIND - 1))

POOL_ID=`cat config.json | jq -r '.cognito.userPoolId'`
CLIENT_ID=`cat config.json | jq -r '.cognito.userPoolWebClientId'`

echo "#--- retrieve login session "
RET=`aws cognito-idp admin-initiate-auth \
--user-pool-id $POOL_ID \
--client-id $CLIENT_ID \
--auth-flow ADMIN_NO_SRP_AUTH \
--auth-parameters \
USERNAME=${VALUE_U},PASSWORD="${VALUE_C}"`

echo $RET | jq

SESSION=`echo $RET | jq -r '.Session'`
echo '#--- set new password'
aws cognito-idp admin-respond-to-auth-challenge \
--user-pool-id $POOL_ID \
--client-id $CLIENT_ID \
--challenge-name NEW_PASSWORD_REQUIRED \
--challenge-responses NEW_PASSWORD="'${VALUE_P}'",USERNAME="'${VALUE_U}'" \
--session $SESSION

