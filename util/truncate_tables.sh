#!/bin/bash

set -eu

# スクリプト実行ディレクトリに移動
PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

# 使い方
usage_exit() {
        echo "Usage: $0 [-e environment] [-l set this flag if you truncate local db]" 1>&2
        exit 1
}

# オプション取得（デフォルトは dev 環境）
ENV=dev
while getopts e:lh OPT
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

echo "# Truncating tables of ${ENV} environment..."

# DB prefix を取得
prefix=$(cat ../config/${ENV}.json | jq -r '.DBPrefix')
# 対象テーブルを取得
tables=$(aws dynamodb list-tables ${LOCAL} | jq -r '.[][] | select(. | test("^'$prefix'.+"))')


tmp_scan_data=$(mktemp)
tmp_delete_items=$(mktemp)

for t in $tables; do
  echo "# [$t]: start truncating table ..."
  key=$(aws dynamodb describe-table --table-name $t ${LOCAL} | jq -r '.Table.KeySchema[].AttributeName')

  # 予約語はprojection-expressionで指定できないため、全て#を付与してしまう
  proj=$(echo -n $key | tr ' ' '\n' | sed -E 's/(.+)/#\1/' | tr '\n' ',' | sed 's/,$//') 
  attr=$(echo -n $key | tr ' ' '\n' | sed -E 's/(.+)/"#\1":"\1"/' | tr '\n' ',' | sed -E 's/(.+)/{\1}/' | sed 's/,}/}/')
  while :; do
    aws dynamodb scan --table-name $t --projection-expression "$proj" --expression-attribute-names "$attr" --max-item 25 $LOCAL > $tmp_scan_data 

    count=$(cat $tmp_scan_data | jq '.Count')
    if [[ $count -eq 0 ]]; then
      echo "# [${t}]: delete completed."
      break
    fi

    echo "# [${t}]: delete progress ... ${count}."

    cat $tmp_scan_data | jq '.Items[] | {"Key": .} | {"DeleteRequest": .}' | jq -s '.' | jq '{"'$t'": .}' > $tmp_delete_items

    aws dynamodb batch-write-item $LOCAL --request-items file://$tmp_delete_items > /dev/null
  done
done