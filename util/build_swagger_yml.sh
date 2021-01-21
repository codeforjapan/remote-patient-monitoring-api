#!/bin/bash

set -eu

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

ADMIN_POOL_ID='COGNITO_ADMIN_USER_POOL_ID'
NURSE_POOL_ID='COGNITO_NURSE_USER_POOL_ID'
PATIENT_POOL_ID='COGNITO_PATIENT_USER_POOL_ID'
if [ -e ./config.json ]; then
  ADMIN_POOL_ID=`cat ./config.json | jq -r '.cognito.adminUserPoolId'`
  NURSE_POOL_ID=`cat ./config.json | jq -r '.cognito.nurseUserPoolId'`
  PATIENT_POOL_ID=`cat ./config.json | jq -r '.cognito.patientUserPoolId'`
fi

sed -e "s/COGNITO_ADMIN_USER_POOL_ID_TO_BE_REPLACED/${ADMIN_POOL_ID}/g" ../src/swagger/swagger.yaml | \
sed -e "s/COGNITO_NURSE_USER_POOL_ID_TO_BE_REPLACED/${NURSE_POOL_ID}/g" | \
sed -e "s/COGNITO_PATIENT_USER_POOL_ID_TO_BE_REPLACED/${PATIENT_POOL_ID}/g" > ../src/swagger/_swagger.yaml

cd ..
./node_modules/.bin/swagger-merger -i ./src/swagger/_swagger.yaml -o ./templates/swagger.yaml

# copy to swager-ui
cp ./templates/swagger.yaml ./src/gh-swagger-ui/swagger.yaml
#${COGNITO_USER_POOL_ID}