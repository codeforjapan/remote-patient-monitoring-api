#!/bin/bash

usage_exit() {
        echo "Usage: $0 [-s stage] [-f force]" 1>&2
        exit 1
}

STAGE="dev"
FORCE=false
while getopts s:fh OPT
do
    case $OPT in
        s)  STAGE=$OPTARG
            ;;
        f)  FORCE=true
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

shift $((OPTIND - 1))

if [ "${FORCE}" = false ] ; then
  read -p "do you delete all cognito data really ? (y/n):" YN_DELETE_DATA

  if [ "${YN_DELETE_DATA}" != "y" ]; then
    echo "bye"
    exit 1
  fi
fi

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)

cd "$PATH_DIR_SCRIPT"

echo "DELETE Nurses"
POOL_ID=`cat config.json | jq -r "map(select(.apiGateway.stageName == \"${STAGE}\")) | .[].cognito.nurseUserPoolId"`

aws cognito-idp list-users --user-pool-id $POOL_ID |
jq -r '.Users | .[] | .Username' |
while read uname1; do
  echo "Deleting $uname1";
  aws cognito-idp admin-delete-user --user-pool-id $POOL_ID --username $uname1;
done

echo "DELETE Patients"
POOL_ID=`cat config.json | jq -r "map(select(.apiGateway.stageName == \"${STAGE}\")) | .[].cognito.patientUserPoolId"`

aws cognito-idp list-users --user-pool-id $POOL_ID |
jq -r '.Users | .[] | .Username' |
while read uname1; do
  echo "Deleting $uname1";
  aws cognito-idp admin-delete-user --user-pool-id $POOL_ID --username $uname1;
done
