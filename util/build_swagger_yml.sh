#!/bin/bash

set -eu

stg='dev'
while getopts s-: opt; do
  # OPTIND 番目の引数を optarg へ代入
  optarg="${!OPTIND}"
  [[ "$opt" = - ]] && opt="-$OPTARG"
  case "-$opt" in
    -s|--stage)
      stg="$optarg"
      shift
      ;;
    --)
      break
      ;;
    -\?)
      exit 1
      ;;
    --*)
      echo "$0: illegal option -- ${opt##-}" >&2
    exit 1
      ;;
  esac
done
shift $((OPTIND - 1))
echo "create swagger config for $stg "


PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

cd ..
# tempdir=$(mktemp -d)
# ./node_modules/.bin/swagger-merger -i ./src/swagger/_swagger.yaml -o ${tempdir}/swagger.yaml
# sed -e "s/#{SERVERLESS::Stage}/${stg}/g" ${tempdir}/swagger.yaml > ./templates/swagger.yaml
./node_modules/.bin/swagger-merger -i ./src/swagger/swagger.yaml -o ./templates/swagger.yaml

# copy to swager-ui
cp ./templates/swagger.yaml ./src/gh-swagger-ui/swagger.yaml
#${COGNITO_USER_POOL_ID}