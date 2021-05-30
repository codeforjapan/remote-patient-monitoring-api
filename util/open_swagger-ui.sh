#!/bin/bash

set -eu

usage_exit() {
        echo "Usage: $0 [-s stage]" 1>&2
        exit 1
}

STAGE="dev"
while getopts c:s:h OPT
do
    case $OPT in
        s)  STAGE=$OPTARG
            ;;
        \?) usage_exit
            ;;
    esac
done

shift $((OPTIND - 1))

echo $STAGE

PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

DISTRIBUTION=`cat ./config.json | jq -r "map(select(.apiGateway.stageName == \"${STAGE}\")) | .[].distribution.SwaggerUIDistribution"`

RET=`aws cloudfront get-distribution --id ${DISTRIBUTION}`
URL=`echo $RET | jq -r '.Distribution.DomainName'`

OPEN="open"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OPEN="xdg-open"
fi
echo "$OPEN https://${URL}"
$OPEN https://${URL}
