#!/bin/bash
set -e -o pipefail
set -u

# スクリプト実行ディレクトリに移動
PATH_DIR_SCRIPT=$(cd "$(dirname "${BASH_SOURCE:-$0}")" && pwd)
cd "$PATH_DIR_SCRIPT"

admin_password=`cat .secret.json | jq -r ".auth_pass"`
restApiId=`cat ../src/webpack/config.json | jq -r "map(select(.apiGateway.stageName == \"dev\")) | .[].apiGateway.restApiId"`
region=`cat ../src/webpack/config.json | jq -r "map(select(.apiGateway.stageName == \"dev\")) | .[].region"`
entry_point="https://${restApiId}.execute-api.${region}.amazonaws.com/dev";
echo $entry_point
# login
echo "# login"
ret=`curl -s -X POST "$entry_point/api/admin/login" -d "{ \"username\": \"admin\", \"password\": \"${admin_password}\" }" -H  "accept: application/json;"`

# get idToken
token=`echo $ret | jq -r ".idToken"`

# get center
echo "# get centerId"
ret=`curl -s -X GET "${entry_point}/api/admin/centers/" -H  "accept: application/json"`
center_id=`echo $ret | jq -r ".Items[0].centerId"`
echo $center_id;
# put patient and status
echo "put patients"
for i in {1..500}
do
  echo "...${i}"
  pid="pid-${i}"
  phone="00-0111-${i}"
  ret=`curl -s -X POST "${entry_point}/api/admin/centers/${center_id}/patients/" -H  "accept: application/json" -H  "Authorization: ${token}" -H  "Content-Type: application/json" -d "{\"patientId\":\"${pid}\",\"phone\":\"${phone}\",\"memo\":\"dummy\",\"display\":true,\"sendSMS\":false,\"isAccepted\":true}"`
  for j in {1..10}
  do
    ret=`curl -s -X POST "${entry_point}/api/admin/patients/${pid}/statuses" -H  "accept: application/json" \
      -H "Authorization: ${token}" -H  "Content-Type: application/json" -d "{\"SpO2\":99,\"body_temperature\":36,\"pulse\":100,\"symptom\":{\"cough\":false,\"phlegm\":false,\"suffocation\":false,\"headache\":false,\"sore_throat\":false,\"malaise\":false,\"nausea\":false,\"diarrhea\":false,\"difficulty_eating\":false,\"no_urination\":false,\"remarks\":\"\"}}"`
  done
done



