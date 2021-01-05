#!/bin/bash

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

USERNAME=`cat .secret | jq -r '.auth_user'`

USER_POOL_ID='COGNITO_USER_POOL_ID'
if [ -e ./config.json ]; then
  USER_POOL_ID=`cat ./config.json | jq -r '.cognito.userPoolId'`
fi

sed -e "s/COGNITO_USER_POOL_ID_TO_BE_REPLACED/${USER_POOL_ID}/g" ../src/swagger/swagger.yaml > ../src/swagger/_swagger.yaml

cd ..
./node_modules/.bin/swagger-merger -i ./src/swagger/_swagger.yaml -o ./templates/swagger.yaml

#${COGNITO_USER_POOL_ID}