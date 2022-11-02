#!/bin/bash
DEPLOY_DIR="/tmp/$RANDOM$RANDOM"

mkdir $DEPLOY_DIR
touch dist/Staticfile
cp -r dist/* $DEPLOY_DIR
DEPLOY_APP_NAME=$1
cd $DEPLOY_DIR
rm -rf node_modules
bx cf push $DEPLOY_APP_NAME
cd -
rm -rf $DEPLOY_DIR