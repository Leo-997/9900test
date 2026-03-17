#!/bin/bash

set -e

export WORKSPACE=apps/evidence
export IMAGE_NAME=$BASE_IMAGE_NAME:evidence_$IMAGE_TAG

if [ "$DOPPLER_CONFIG" != "pipeline_prod" ]; then
  unset DOPPLER_CONFIG # clear this so it does not conflict with following command
  echo "Executing: echo $AZURE_ACR_TOKEN_PWD | docker login --username $AZURE_ACR_TOKEN_NAME --password-stdin $AZURE_ACR_REGISTRY"
  echo $AZURE_ACR_TOKEN_PWD | docker login --username $AZURE_ACR_TOKEN_NAME --password-stdin $AZURE_ACR_REGISTRY
  echo "Executing: docker run $AZURE_ACR_REGISTRY/$IMAGE_NAME doppler run --token=$DOPPLER_TOKEN --command=\"npm run migrate:latest -w $WORKSPACE\""
  docker run $AZURE_ACR_REGISTRY/$IMAGE_NAME doppler run --token=$DOPPLER_TOKEN --command="npm run migrate:latest -w $WORKSPACE"
fi

echo "$WORKSPACE Done"