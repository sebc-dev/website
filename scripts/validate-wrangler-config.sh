#!/bin/bash

#
# Wrangler Configuration Validator
# ================================
#
# Purpose: Validates wrangler.toml/wrangler.jsonc configuration for:
# - nodejs_compat flag (critical requirement for Next.js)
# - Binding configuration (D1, R2, KV, Durable Objects)
# - Compatibility date (should be recent)
# - Worker name consistency
#
# Exit codes:
# 0 = All validations passed
# 1 = Configuration errors found
#

set -e

VALIDATION_FAILED=0
WRANGLER_CONFIG="wrangler.jsonc"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_pass() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
  VALIDATION_FAILED=1
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

echo "=========================================================================="
echo "Wrangler Configuration Validator"
echo "=========================================================================="
echo ""

# =========================================================================
# Check 1: Validate wrangler config file exists
# =========================================================================
if [ ! -f "$WRANGLER_CONFIG" ]; then
  log_error "Wrangler config file not found: $WRANGLER_CONFIG"
  exit 1
fi

log_pass "Wrangler config file exists"

# =========================================================================
# Check 2: nodejs_compat Flag (CRITICAL)
# =========================================================================
echo ""
echo "Checking nodejs_compat flag (CRITICAL for Next.js)..."

if grep -q "nodejs_compat" "$WRANGLER_CONFIG"; then
  log_pass "nodejs_compat flag is configured"
else
  log_error "CRITICAL: nodejs_compat flag is missing from wrangler configuration"
  echo "  → Add to wrangler.jsonc: \"compatibility_flags\": [\"nodejs_compat\"]"
fi

# =========================================================================
# Check 3: Compatibility Date
# =========================================================================
echo ""
echo "Checking compatibility_date..."

if grep -q "compatibility_date" "$WRANGLER_CONFIG"; then
  COMPAT_DATE=$(grep "compatibility_date" "$WRANGLER_CONFIG" | grep -o '[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}' | head -1)
  log_pass "Compatibility date configured: $COMPAT_DATE"

  # Check if date is recent (within last 6 months)
  COMPAT_TIMESTAMP=$(date -d "$COMPAT_DATE" +%s 2>/dev/null || echo 0)
  CURRENT_TIMESTAMP=$(date +%s)
  DAYS_DIFF=$(( ($CURRENT_TIMESTAMP - $COMPAT_TIMESTAMP) / 86400 ))

  if [ $DAYS_DIFF -gt 180 ]; then
    log_warning "Compatibility date is older than 6 months ($COMPAT_DATE)"
    echo "  → Consider updating to a more recent date for latest Cloudflare features"
  fi
else
  log_error "compatibility_date is missing from wrangler configuration"
  echo "  → Add to wrangler.jsonc: \"compatibility_date\": \"YYYY-MM-DD\""
fi

# =========================================================================
# Check 4: D1 Database Binding
# =========================================================================
echo ""
echo "Checking D1 database binding..."

if grep -q "\"d1_databases\"" "$WRANGLER_CONFIG" || grep -q "d1_databases" "$WRANGLER_CONFIG"; then
  log_pass "D1 database binding is configured"

  # Verify binding name is "DB"
  if grep -q "\"DB\"" "$WRANGLER_CONFIG"; then
    log_pass "D1 binding name is 'DB'"
  else
    log_warning "D1 binding name not 'DB' - verify it matches in your code"
  fi
else
  log_warning "D1 database binding not found - required for production"
fi

# =========================================================================
# Check 5: R2 Bucket Binding
# =========================================================================
echo ""
echo "Checking R2 bucket binding..."

if grep -q "\"r2_buckets\"" "$WRANGLER_CONFIG" || grep -q "r2_buckets" "$WRANGLER_CONFIG"; then
  log_pass "R2 bucket binding is configured"
else
  log_warning "R2 bucket binding not found - required for media uploads"
fi

# =========================================================================
# Check 6: KV Binding (if used)
# =========================================================================
echo ""
echo "Checking KV binding (optional)..."

if grep -q "\"kv_namespaces\"" "$WRANGLER_CONFIG" || grep -q "kv_namespaces" "$WRANGLER_CONFIG"; then
  log_pass "KV namespace binding is configured"
else
  log_info "KV namespace not configured (optional for this project)"
fi

# =========================================================================
# Check 7: Durable Objects Binding (if used)
# =========================================================================
echo ""
echo "Checking Durable Objects binding (optional)..."

if grep -q "\"durable_objects\"" "$WRANGLER_CONFIG" || grep -q "durable_objects" "$WRANGLER_CONFIG"; then
  log_pass "Durable Objects binding is configured"
else
  log_info "Durable Objects not configured (optional for this project)"
fi

# =========================================================================
# Check 8: Worker Name Configuration
# =========================================================================
echo ""
echo "Checking worker name configuration..."

if grep -q "name" "$WRANGLER_CONFIG" | head -1; then
  WORKER_NAME=$(grep "\"name\"" "$WRANGLER_CONFIG" | head -1 | grep -o '"[^"]*"' | tail -1 | tr -d '"')
  if [ -n "$WORKER_NAME" ]; then
    log_pass "Worker name configured: $WORKER_NAME"
  else
    log_error "Could not parse worker name from configuration"
  fi
else
  log_error "Worker name (main field) is missing from wrangler configuration"
fi

# =========================================================================
# Check 9: Service Bindings (WORKER_SELF_REFERENCE for OpenNext)
# =========================================================================
echo ""
echo "Checking service bindings for OpenNext..."

if grep -q "WORKER_SELF_REFERENCE" "$WRANGLER_CONFIG"; then
  log_pass "WORKER_SELF_REFERENCE binding configured (required for OpenNext)"
else
  log_warning "WORKER_SELF_REFERENCE not found - may be required for OpenNext ISR cache"
fi

# =========================================================================
# Check 10: Observability Configuration
# =========================================================================
echo ""
echo "Checking observability configuration..."

if grep -q "observability" "$WRANGLER_CONFIG"; then
  log_pass "Observability configuration found"
else
  log_warning "Observability not configured - recommended for production logging"
fi

# =========================================================================
# Summary
# =========================================================================
echo ""
echo "=========================================================================="

if [ $VALIDATION_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All wrangler configuration validations passed${NC}"
  echo "=========================================================================="
  exit 0
else
  echo -e "${RED}✗ Some wrangler configuration validations failed${NC}"
  echo "=========================================================================="
  echo ""
  echo "CRITICAL ISSUES:"
  echo "- nodejs_compat flag must be present for Next.js compatibility"
  echo "- compatibility_date must be set"
  echo "- Worker name must be configured"
  echo ""
  exit 1
fi
