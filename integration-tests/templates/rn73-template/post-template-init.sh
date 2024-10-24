#!/bin/bash

APP_NAME=`basename "$PWD"`

# `npx @react-native-community/cli init` has an issue with the relative paths to local artifacts in the template's
# package.json. Leave them out and instead install them here as a post init step
pushd ..
./update-local-embrace.sh $APP_NAME
popd