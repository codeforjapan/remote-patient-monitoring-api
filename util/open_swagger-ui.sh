#!/bin/bash

set -eu

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

DISTRIBUTION=`cat ./config.json | jq -r '.[].distribution.SwaggerUIDistribution'`

RET=`aws cloudfront get-distribution --id ${DISTRIBUTION}`
URL=`echo $RET | jq -r '.Distribution.DomainName'`

OPEN="open"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OPEN="xdg-open"
fi
echo "$OPEN https://${URL}"
$OPEN https://${URL}
