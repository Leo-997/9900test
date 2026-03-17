#!/bin/bash

set -e

export WORKSPACE=apps/clinical
export IMAGE_NAME=$BASE_IMAGE_NAME:clinical_$IMAGE_TAG
export LATEST_IMAGE_NAME=$BASE_IMAGE_NAME:clinical_${ENVIRONMENT}_latest

echo "Executing: echo $AZURE_ACR_TOKEN_PWD | docker login --username $AZURE_ACR_TOKEN_NAME --password-stdin $AZURE_ACR_REGISTRY"
echo $AZURE_ACR_TOKEN_PWD | docker login --username $AZURE_ACR_TOKEN_NAME --password-stdin $AZURE_ACR_REGISTRY

echo "Executing: docker build \
  -f Dockerfile \
  --tag ${IMAGE_NAME} \
  --secret id=doppler,env=DOPPLER_TOKEN \
  --secret id=db_cert_name,env=DB_CERT_NAME \
  --secret id=db_cert,env=DB_CERT \
  ../.."

docker build \
  -f Dockerfile \
  --tag ${IMAGE_NAME} \
  --secret id=doppler,env=DOPPLER_TOKEN \
  --secret id=db_cert_name,env=DB_CERT_NAME \
  --secret id=db_cert,env=DB_CERT \
  ../..

echo "Executing: SNYK_TOKEN=$SNYK_TOKEN snyk container test --docker $IMAGE_NAME --file=Dockerfile --severity-threshold=high --policy-path=../../.snyk"
if [[ "$SNYK_DONT_BREAK_BUILD" == "true" ]]; then
  SNYK_TOKEN=$SNYK_TOKEN snyk container test --docker $IMAGE_NAME --file=Dockerfile --severity-threshold=high --policy-path=../../.snyk || echo "Ignoring Snyk non-zero exit code due to SNYK_DONT_BREAK_BUILD=true"
else
  SNYK_TOKEN=$SNYK_TOKEN snyk container test --docker $IMAGE_NAME --file=Dockerfile --severity-threshold=high --policy-path=../../.snyk
fi

echo "Executing: docker tag $IMAGE_NAME $AZURE_ACR_REGISTRY/$IMAGE_NAME"
docker tag $IMAGE_NAME $AZURE_ACR_REGISTRY/$IMAGE_NAME
echo "Executing: docker push $AZURE_ACR_REGISTRY/$IMAGE_NAME"
docker push $AZURE_ACR_REGISTRY/$IMAGE_NAME
echo "Executing: docker tag $AZURE_ACR_REGISTRY/$IMAGE_NAME $AZURE_ACR_REGISTRY/$LATEST_IMAGE_NAME"
docker tag $AZURE_ACR_REGISTRY/$IMAGE_NAME $AZURE_ACR_REGISTRY/$LATEST_IMAGE_NAME
echo "Executing: docker push $AZURE_ACR_REGISTRY/$LATEST_IMAGE_NAME"
docker push $AZURE_ACR_REGISTRY/$LATEST_IMAGE_NAME

echo "$WORKSPACE Done"
