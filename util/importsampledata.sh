#!/bin/sh

# スクリプト実行ディレクトリに移動
PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

# 使い方
usage_exit() {
        echo "Usage: $0 [-e environment]" 1>&2
        exit 1
}

# オプション取得（デフォルトは dev 環境）
ENV=dev
LOCAL=""
while getopts e:h OPT
do
    case $OPT in
        e)  ENV=$OPTARG
            ;;
        l)  LOCAL=" --endpoint-url http://localhost:8000"
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done
shift $((OPTIND - 1))

echo "# Importing dafa for ${ENV} environment..."

../node_modules/.bin/ts-node ./importsampledata.ts -- ${ENV}
