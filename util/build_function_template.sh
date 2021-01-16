#!/bin/bash

# template/functions-base.yml から、以下のファイルを生成する
# - tempalte/functions-lambda.yml (deploy:lambda 用)
# - templates/functions-.yml (deploy:gateway の AWS用)
# - templates/functions-true.yml (deploy:gateway の local 用)

set -eu

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

BASE_DIR="../templates"


sed '/#\! *BEGIN *ONLY:LOCAL/,/#\! *END *ONLY:LOCAL/d' ${BASE_DIR}/functions-base.yml > ${BASE_DIR}/functions-.yml
sed '/#\! *BEGIN *ONLY:LOCAL/,/#\! *END *ONLY:LOCAL/d;/#\! *ONLY:GATEWAY/d' ${BASE_DIR}/functions-base.yml > ${BASE_DIR}/functions-lambda.yml
sed '/#\! *ONLY:GATEWAY/d' ${BASE_DIR}/functions-base.yml > ${BASE_DIR}/functions-true.yml
