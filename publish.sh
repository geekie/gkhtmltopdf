#!/bin/bash
set -e
yarn install --production=true
rm -rf function.zip && zip -r function.zip node_modules `git ls-files`
aws lambda update-function-code --function-name $1 --zip-file fileb://function.zip
