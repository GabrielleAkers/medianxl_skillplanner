#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

set -o allexport && source .env && set +o allexport

docker context use default
docker build -t median_skillplanner -f $SCRIPT_DIR/server.Dockerfile $SCRIPT_DIR
docker run -it --rm --mount source=medianskillplanner,target=/app -e PORT=$PORT -p $PORT:$PORT --name median_skillplanner median_skillplanner