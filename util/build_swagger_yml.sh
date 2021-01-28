#!/bin/bash

set -eu

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

cd ..
./node_modules/.bin/swagger-merger -i ./src/swagger/swagger.yaml -o ./templates/swagger.yaml

# copy to swager-ui
cp ./templates/swagger.yaml ./src/gh-swagger-ui/swagger.yaml
#${COGNITO_USER_POOL_ID}