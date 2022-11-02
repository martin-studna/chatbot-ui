#!/bin/bash
DEPLOY_DIR="/tmp/$RANDOM$RANDOM"
DEPLOY_APP_NAME=stora-enso-server-legal
mkdir $DEPLOY_DIR
cp -r * $DEPLOY_DIR
cd $DEPLOY_DIR
(tsc -p tsconfig.json || (echo "Transpilation failed" >&2 ; exit 1)) && (
    rm -rf node_modules
    echo "Installing to IBM cloud ..."
    bx cf 'set-env' $DEPLOY_APP_NAME assistant_skill_id '16b56597-dd5b-4674-8c98-2c6f0428b90f'
    bx cf 'set-env' $DEPLOY_APP_NAME assistant_url 'https://api.eu-de.assistant.watson.cloud.ibm.com/instances/b24f6e81-2e76-4596-9116-eed62dea4d3d/'
    bx cf 'set-env' $DEPLOY_APP_NAME assistant_username 'apikey'
    bx cf 'set-env' $DEPLOY_APP_NAME assistant_password '-sH44Nmq9hQFjCJEbVmqR0yrVUz1w9Xs-RjMqlsZf0G7'
    bx cf 'set-env' $DEPLOY_APP_NAME allow_origin 'https://stora-enso-client-legal.eu-de.mybluemix.net' # only needed for deployment purposes
    bx cf 'set-env' $DEPLOY_APP_NAME frontend_proxy 'https://stora-enso-client-legal.eu-de.mybluemix.net'
    bx cf push $DEPLOY_APP_NAME
)
cd -
rm -rf $DEPLOY_DIR
