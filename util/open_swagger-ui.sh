#!/bin/bash

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

DISTRIBUTION=`cat ./config.json | jq -r '.distribution.SwaggerUIDistribution'`

RET=`aws cloudfront get-distribution --id ${DISTRIBUTION}`
URL=`echo $RET | jq -r '.Distribution.DomainName'`
echo "open https://${URL}"
open https://${URL}
