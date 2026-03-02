#!/bin/bash

set -e

export WORKSPACE=apps/frontend
export IMAGE_NAME=$BASE_IMAGE_NAME:frontend_${IMAGE_TAG}
export KUBE_DEPLOYMENT_NAME=zerodashfrontend
export KUBECONFIG="$HOME/.kube/${WORKSPACE}-config"

echo "Executing: az login --service-principal --username $AZURE_APP_ID --password $AZURE_PASSWORD --tenant $AZURE_TENANT_ID"
az login --service-principal --username $AZURE_APP_ID --password $AZURE_PASSWORD --tenant $AZURE_TENANT_ID
echo "Executing: az aks get-credentials --resource-group $AZURE_RESOURCE_GROUP --name $AZURE_AKS_NAME --overwrite-existing --file $KUBECONFIG"
az aks get-credentials --resource-group $AZURE_RESOURCE_GROUP --name $AZURE_AKS_NAME --overwrite-existing --file $KUBECONFIG

echo "Executing: kubectl config use-context ${AZURE_AKS_NAME}"
kubectl config use-context "${AZURE_AKS_NAME}"
echo "Executing: kubelogin convert-kubeconfig -l spn --client-id ${AZURE_APP_ID} --client-secret $AZURE_PASSWORD --tenant-id $AZURE_TENANT_ID"
kubelogin convert-kubeconfig -l spn --client-id ${AZURE_APP_ID} --client-secret $AZURE_PASSWORD --tenant-id $AZURE_TENANT_ID
echo "Executing: kubectl patch deployment $KUBE_DEPLOYMENT_NAME --type=strategic -p {"spec":{"template":{"spec":{"containers":[{"name":"$KUBE_DEPLOYMENT_NAME","image":"$AZURE_ACR_REGISTRY/$IMAGE_NAME"}]}}}} --namespace $KUBE_NAMESPACE"
kubectl patch deployment $KUBE_DEPLOYMENT_NAME --type=strategic -p "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"$KUBE_DEPLOYMENT_NAME\",\"image\":\"$AZURE_ACR_REGISTRY/$IMAGE_NAME\"}]}}}}" --namespace $KUBE_NAMESPACE
echo "Executing: kubectl rollout status deployment $KUBE_DEPLOYMENT_NAME --namespace $KUBE_NAMESPACE --timeout=120s"
kubectl rollout status deployment $KUBE_DEPLOYMENT_NAME --namespace $KUBE_NAMESPACE --timeout=120s

echo "$WORKSPACE Done"
