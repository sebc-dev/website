#!/bin/bash

##############################################################################
# Build Worker URL Script
#
# Purpose:
# This script provides a centralized way to construct and validate the
# Cloudflare Worker URL. It ensures consistency across the codebase and
# CI/CD pipelines by:
#
# 1. Validating that CLOUDFLARE_WORKER_NAME is configured
# 2. Extracting the worker name from wrangler.jsonc
# 3. Performing strict validation (comparing configured vs wrangler names)
# 4. Constructing the full Worker URL
# 5. Outputting the URL for use in workflows and scripts
#
# Usage:
#   # Source the script to get variables
#   source scripts/build-worker-url.sh
#   echo $WORKER_URL
#
#   # Or execute directly for GitHub Actions
#   ./scripts/build-worker-url.sh
#
# Environment Variables Required:
#   CLOUDFLARE_WORKER_NAME - The worker name from GitHub Environment Secrets
#   CLOUDFLARE_ACCOUNT_SUBDOMAIN - Account subdomain (default: chauveau-sebastien)
#
# Exit Codes:
#   0 - Success
#   1 - Validation failed
#
# Output:
#   Sets WORKER_URL environment variable
#   Prints worker-url output for GitHub Actions
#
##############################################################################

set -euo pipefail

# Configuration
CLOUDFLARE_ACCOUNT_SUBDOMAIN="${CLOUDFLARE_ACCOUNT_SUBDOMAIN:-chauveau-sebastien}"
WRANGLER_CONFIG_FILE="wrangler.jsonc"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

##############################################################################
# Helper Functions
##############################################################################

print_error() {
  echo "❌ ERROR: $*" >&2
}

print_success() {
  echo "✅ $*"
}

print_info() {
  echo "ℹ️  $*"
}

##############################################################################
# Validation: CLOUDFLARE_WORKER_NAME is configured
##############################################################################

WORKER_NAME_FROM_ENV="${CLOUDFLARE_WORKER_NAME:-}"

if [[ -z "$WORKER_NAME_FROM_ENV" ]]; then
  print_error "CLOUDFLARE_WORKER_NAME not configured"
  echo ""
  echo "This is required for deployment. Please configure it as a GitHub Environment Secret:"
  echo ""
  echo "  1. Go to: GitHub Repository → Settings → Environments → production"
  echo "  2. Add new secret: CLOUDFLARE_WORKER_NAME"
  echo "  3. Set the value to match your worker name (e.g., website, website-staging)"
  echo ""
  echo "For local development, you can export it:"
  echo "  export CLOUDFLARE_WORKER_NAME='website'"
  echo ""
  exit 1
fi

print_info "CLOUDFLARE_WORKER_NAME configured: $WORKER_NAME_FROM_ENV"

##############################################################################
# Validation: wrangler.jsonc exists and is readable
##############################################################################

if [[ ! -f "$PROJECT_ROOT/$WRANGLER_CONFIG_FILE" ]]; then
  print_error "wrangler.jsonc not found at $PROJECT_ROOT/$WRANGLER_CONFIG_FILE"
  exit 1
fi

##############################################################################
# Extract worker name from wrangler.jsonc
##############################################################################

# Use grep to find the "name" field in wrangler.jsonc
# Pattern: "name": "value" or "name" : "value" (with optional whitespace)
WRANGLER_NAME=$(grep -E '^\s*"name"\s*:\s*"[^"]*"' "$PROJECT_ROOT/$WRANGLER_CONFIG_FILE" | head -1 | sed -E 's/.*"name"\s*:\s*"([^"]*)".*/\1/')

if [[ -z "$WRANGLER_NAME" ]]; then
  print_error "Could not extract 'name' field from $WRANGLER_CONFIG_FILE"
  echo ""
  echo "Expected format in $WRANGLER_CONFIG_FILE:"
  echo '  "name": "website",'
  echo ""
  exit 1
fi

print_info "Worker name from wrangler.jsonc: $WRANGLER_NAME"

##############################################################################
# Strict Validation: CLOUDFLARE_WORKER_NAME must match wrangler.jsonc
##############################################################################

if [[ "$WORKER_NAME_FROM_ENV" != "$WRANGLER_NAME" ]]; then
  print_error "Worker name mismatch!"
  echo ""
  echo "CLOUDFLARE_WORKER_NAME (GitHub Secret): $WORKER_NAME_FROM_ENV"
  echo "Worker name in wrangler.jsonc:          $WRANGLER_NAME"
  echo ""
  echo "These must match to prevent deploying to the wrong worker."
  echo ""
  echo "To fix this:"
  echo "  Option 1: Update GitHub Environment Secret to match wrangler.jsonc"
  echo "    - Go to Settings → Environments → production"
  echo "    - Update CLOUDFLARE_WORKER_NAME to: $WRANGLER_NAME"
  echo ""
  echo "  Option 2: Update wrangler.jsonc to match GitHub Environment Secret"
  echo "    - Edit wrangler.jsonc and change 'name' to: $WORKER_NAME_FROM_ENV"
  echo ""
  exit 1
fi

print_success "Worker name validation passed: $WORKER_NAME_FROM_ENV"

##############################################################################
# Construct Worker URL
##############################################################################

WORKER_URL="https://${WORKER_NAME_FROM_ENV}.${CLOUDFLARE_ACCOUNT_SUBDOMAIN}.workers.dev"

print_success "Worker URL constructed: $WORKER_URL"

##############################################################################
# Output for GitHub Actions and other tools
##############################################################################

# If running in GitHub Actions, output as a step output
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "worker-url=${WORKER_URL}" >> "$GITHUB_OUTPUT"
  echo "worker-name=${WORKER_NAME_FROM_ENV}" >> "$GITHUB_OUTPUT"
fi

# Export for use in sourced scripts
export WORKER_URL
export WORKER_NAME="$WORKER_NAME_FROM_ENV"

# Print to stdout for capture in scripts
echo "$WORKER_URL"
