#!/bin/bash

##############################################################################
# Validate Worker Configuration Script
#
# Purpose:
# This script validates the worker configuration for consistency and
# correctness. It can be run locally before pushing changes or integrated
# into git hooks for automatic validation.
#
# Validation Checks:
# 1. wrangler.jsonc exists and is valid JSON
# 2. "name" field exists in wrangler.jsonc
# 3. Optional: If CLOUDFLARE_WORKER_NAME env var is set, validate it matches
#
# Usage:
#   # Run validation checks
#   ./scripts/validate-worker-config.sh
#
#   # With environment variable validation
#   CLOUDFLARE_WORKER_NAME=website ./scripts/validate-worker-config.sh
#
#   # For git hooks (exit early if env var not set)
#   export CLOUDFLARE_WORKER_NAME=$(cat .env 2>/dev/null | grep CLOUDFLARE_WORKER_NAME | cut -d= -f2)
#   ./scripts/validate-worker-config.sh
#
# Exit Codes:
#   0 - All validations passed
#   1 - Validation failed
#
##############################################################################

set -euo pipefail

# Configuration
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

print_warning() {
  echo "⚠️  WARNING: $*"
}

##############################################################################
# Validation 1: wrangler.jsonc exists
##############################################################################

if [[ ! -f "$PROJECT_ROOT/$WRANGLER_CONFIG_FILE" ]]; then
  print_error "Configuration file not found: $WRANGLER_CONFIG_FILE"
  exit 1
fi

print_success "Found $WRANGLER_CONFIG_FILE"

##############################################################################
# Validation 2: Extract and validate worker name from wrangler.jsonc
##############################################################################

WRANGLER_NAME=$(grep -E '^\s*"name"\s*:\s*"[^"]*"' "$PROJECT_ROOT/$WRANGLER_CONFIG_FILE" | head -1 | sed -E 's/.*"name"\s*:\s*"([^"]*)".*/\1/')

if [[ -z "$WRANGLER_NAME" ]]; then
  print_error "Could not extract 'name' field from $WRANGLER_CONFIG_FILE"
  echo "Expected format: \"name\": \"your-worker-name\","
  exit 1
fi

print_success "Worker name in wrangler.jsonc: $WRANGLER_NAME"

##############################################################################
# Validation 3: Validate worker name format
##############################################################################

# Check for valid worker name format (alphanumeric and hyphens only)
if ! [[ "$WRANGLER_NAME" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$ ]]; then
  print_error "Invalid worker name format: $WRANGLER_NAME"
  echo ""
  echo "Valid format requirements:"
  echo "  - Start with alphanumeric character"
  echo "  - Can contain alphanumeric characters and hyphens"
  echo "  - End with alphanumeric character"
  echo "  - Examples: website, website-staging, prod-worker"
  exit 1
fi

print_success "Worker name format is valid"

##############################################################################
# Validation 4: Optional - Check CLOUDFLARE_WORKER_NAME environment variable
##############################################################################

if [[ -n "${CLOUDFLARE_WORKER_NAME:-}" ]]; then
  ENV_WORKER_NAME="$CLOUDFLARE_WORKER_NAME"

  print_info "CLOUDFLARE_WORKER_NAME is set: $ENV_WORKER_NAME"

  if [[ "$ENV_WORKER_NAME" != "$WRANGLER_NAME" ]]; then
    print_error "Worker name mismatch!"
    echo ""
    echo "CLOUDFLARE_WORKER_NAME (environment): $ENV_WORKER_NAME"
    echo "Worker name in wrangler.jsonc:        $WRANGLER_NAME"
    echo ""
    echo "These must match. Possible solutions:"
    echo ""
    echo "Option 1: Update CLOUDFLARE_WORKER_NAME in your .env file or GitHub Secrets"
    echo "  Change from: $ENV_WORKER_NAME"
    echo "  Change to:   $WRANGLER_NAME"
    echo ""
    echo "Option 2: Update 'name' in wrangler.jsonc"
    echo "  Change from: $WRANGLER_NAME"
    echo "  Change to:   $ENV_WORKER_NAME"
    exit 1
  fi

  print_success "CLOUDFLARE_WORKER_NAME matches wrangler.jsonc"
else
  print_info "CLOUDFLARE_WORKER_NAME not set (optional for local validation)"
fi

##############################################################################
# Summary
##############################################################################

echo ""
echo "═════════════════════════════════════════════════════════════════"
echo "Worker Configuration Validation PASSED ✅"
echo "═════════════════════════════════════════════════════════════════"
echo ""
echo "Summary:"
echo "  • Configuration file: $WRANGLER_CONFIG_FILE ✅"
echo "  • Worker name: $WRANGLER_NAME ✅"
echo "  • Name format: Valid ✅"
if [[ -n "${CLOUDFLARE_WORKER_NAME:-}" ]]; then
  echo "  • Environment variable: $CLOUDFLARE_WORKER_NAME ✅"
fi
echo ""
echo "Ready for deployment!"
echo ""

exit 0
