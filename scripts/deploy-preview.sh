#!/bin/bash
set -e

# Get PR number or branch name
PR_NUMBER=${GITHUB_PR_NUMBER:-$(git rev-parse --abbrev-ref HEAD | sed 's/[^a-zA-Z0-9-]/-/g')}
DEPLOYMENT_NAME="website-preview-${PR_NUMBER}"

echo "Deploying preview environment: ${DEPLOYMENT_NAME}"

# Build the application with OpenNext
echo "Building Next.js app with OpenNext..."
pnpm run deploy:build

# Deploy to Cloudflare Workers
echo "Deploying to Cloudflare Workers..."
pnpm wrangler deploy \
  --env preview \
  --name "${DEPLOYMENT_NAME}"

# Get deployment URL (format: <name>.<subdomain>.workers.dev)
SUBDOMAIN=$(pnpm wrangler whoami | grep -oP 'workers\.dev subdomain:\s+\K\S+' || echo "")
if [ -z "$SUBDOMAIN" ]; then
  # Fallback: try to extract from account info
  SUBDOMAIN=$(pnpm wrangler whoami 2>&1 | grep -oP '(?<=subdomain: )\S+' || echo "unknown")
fi

DEPLOYMENT_URL="https://${DEPLOYMENT_NAME}.${SUBDOMAIN}.workers.dev"

echo "Deployment URL: ${DEPLOYMENT_URL}"
echo "DEPLOYMENT_URL=${DEPLOYMENT_URL}" >> $GITHUB_OUTPUT
echo "DEPLOYMENT_NAME=${DEPLOYMENT_NAME}" >> $GITHUB_OUTPUT
