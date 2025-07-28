#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

set -a
. ./.env
set +a

# some sort of fucked up evil thing happens and it might ask for a passphrase if you dont run this eval??
eval `ssh-agent -s`
ssh-add -k "$SSH_DEPLOY_KEY"
docker context create medianxl_skillplanner_remote --docker host=ssh://$REMOTE_USER@$REMOTE_IP
docker context use medianxl_skillplanner_remote
docker compose build
docker compose --verbose up -d