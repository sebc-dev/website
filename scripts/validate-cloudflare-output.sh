#!/bin/bash

#
# Cloudflare Output Validator
# ============================
#
# Purpose: Validates OpenNext build output for Cloudflare Workers deployment:
# - Verifies .open-next/ directory structure
# - Checks Worker bundle size (must be < 1MB for Cloudflare limit)
# - Validates presence of required files
# - Detects potential deployment issues
#
# Exit codes:
# 0 = All validations passed
# 1 = Critical validation failures
# 2 = Warning conditions
#

set -e

VALIDATION_FAILED=0
VALIDATION_WARNING=0
OPEN_NEXT_DIR=".open-next"

# Size limits (in bytes)
MAX_WORKER_SIZE=$((1024 * 1024))  # 1MB - Cloudflare hard limit
WARN_WORKER_SIZE=$((800 * 1024))  # 800KB - Warning threshold

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
  VALIDATION_WARNING=1
}

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

format_size() {
  local bytes=$1
  if [ "$bytes" -lt 1024 ]; then
    echo "${bytes}B"
  elif [ "$bytes" -lt $((1024 * 1024)) ]; then
    echo "$(( bytes / 1024 ))KB"
  else
    echo "$(( bytes / (1024 * 1024) ))MB"
  fi
}

echo "=========================================================================="
echo "Cloudflare OpenNext Output Validator"
echo "=========================================================================="
echo ""

# =========================================================================
# Check 1: .open-next directory exists
# =========================================================================
echo "Checking OpenNext output directory..."

if [ ! -d "$OPEN_NEXT_DIR" ]; then
  log_error "OpenNext build directory not found: $OPEN_NEXT_DIR"
  echo "  → Run 'npx @opennextjs/cloudflare build' to generate OpenNext output"
  exit 1
fi

log_pass ".open-next directory exists"

# =========================================================================
# Check 2: Required subdirectories
# =========================================================================
echo ""
echo "Checking required OpenNext subdirectories..."

REQUIRED_DIRS=("worker" "assets")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$OPEN_NEXT_DIR/$dir" ]; then
    log_pass ".open-next/$dir/ exists"
  else
    log_error "Required directory missing: .open-next/$dir/"
  fi
done

# =========================================================================
# Check 3: Worker bundle file
# =========================================================================
echo ""
echo "Checking Worker bundle..."

WORKER_FILE="$OPEN_NEXT_DIR/worker/index.js"
if [ ! -f "$WORKER_FILE" ]; then
  log_error "Worker entry point not found: $WORKER_FILE"
  echo "  → OpenNext adapter must generate worker/index.js"
  exit 1
fi

log_pass "Worker entry point found: worker/index.js"

# =========================================================================
# Check 4: Worker bundle size
# =========================================================================
echo ""
echo "Checking Worker bundle size (Cloudflare limit: 1MB)..."

WORKER_SIZE=$(stat -f%z "$WORKER_FILE" 2>/dev/null || stat -c%s "$WORKER_FILE" 2>/dev/null || echo 0)
WORKER_SIZE_FORMATTED=$(format_size $WORKER_SIZE)

echo "  Worker size: $WORKER_SIZE_FORMATTED"

if [ "$WORKER_SIZE" -gt "$MAX_WORKER_SIZE" ]; then
  log_error "Worker bundle exceeds Cloudflare limit (1MB): $WORKER_SIZE_FORMATTED"
  echo "  → Current size: $WORKER_SIZE_FORMATTED"
  echo "  → Max allowed: 1MB"
  echo ""
  echo "  Solutions:"
  echo "  1. Enable tree-shaking in Next.js configuration"
  echo "  2. Reduce dynamic imports and large dependencies"
  echo "  3. Use code splitting and lazy loading"
  echo "  4. Profile bundle with: npx webpack-bundle-analyzer"
  exit 1
elif [ "$WORKER_SIZE" -gt "$WARN_WORKER_SIZE" ]; then
  log_warning "Worker bundle approaching Cloudflare limit: $WORKER_SIZE_FORMATTED"
  echo "  → Current size: $WORKER_SIZE_FORMATTED (80% of 1MB limit)"
  echo "  → Recommended: Keep below 800KB for safety margin"
  echo ""
  echo "  Monitor bundle growth and consider optimization:"
  echo "  1. Check for unused dependencies"
  echo "  2. Profile with bundle analyzer"
  echo "  3. Use dynamic imports for heavy features"
else
  log_pass "Worker bundle size OK: $WORKER_SIZE_FORMATTED"
fi

# =========================================================================
# Check 5: Assets directory
# =========================================================================
echo ""
echo "Checking assets directory..."

ASSETS_COUNT=$(find "$OPEN_NEXT_DIR/assets" -type f 2>/dev/null | wc -l || echo 0)
ASSETS_SIZE=$(du -sh "$OPEN_NEXT_DIR/assets" 2>/dev/null | cut -f1 || echo "0B")

if [ "$ASSETS_COUNT" -gt 0 ]; then
  log_pass "Assets generated: $ASSETS_COUNT files ($ASSETS_SIZE)"
else
  log_warning "No assets generated - verify Next.js build produces static files"
fi

# =========================================================================
# Check 6: Wrangler.toml exists for deployment
# =========================================================================
echo ""
echo "Checking deployment configuration..."

if [ -f "wrangler.jsonc" ] || [ -f "wrangler.toml" ]; then
  log_pass "Wrangler configuration found"
else
  log_error "Wrangler configuration file not found (wrangler.jsonc or wrangler.toml)"
  echo "  → Required for deployment to Cloudflare Workers"
  exit 1
fi

# =========================================================================
# Check 7: OpenNext configuration
# =========================================================================
echo ""
echo "Checking OpenNext configuration..."

if [ -f "open-next.config.ts" ]; then
  log_pass "OpenNext configuration file found: open-next.config.ts"
else
  log_warning "OpenNext configuration file not found - using defaults"
fi

# =========================================================================
# Check 8: Build metadata
# =========================================================================
echo ""
echo "Checking build metadata..."

MANIFEST_FILE="$OPEN_NEXT_DIR/.manifest"
if [ -f "$MANIFEST_FILE" ]; then
  log_pass "OpenNext manifest found"
else
  log_warning "OpenNext manifest not found - build may be incomplete"
fi

# =========================================================================
# Check 9: Environment file existence
# =========================================================================
echo ""
echo "Checking environment configuration..."

if [ -f ".env.local" ] || [ -f ".env" ]; then
  log_pass "Environment configuration file exists"
else
  log_warning "Environment file not found - ensure env vars are set in Cloudflare"
fi

# =========================================================================
# Check 10: Next.js build output
# =========================================================================
echo ""
echo "Checking Next.js build artifacts..."

if [ -d ".next" ]; then
  NEXT_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
  log_pass "Next.js build directory exists (.next/ - $NEXT_SIZE)"
else
  log_warning "Next.js build directory not found - may indicate build failure"
fi

# =========================================================================
# Summary
# =========================================================================
echo ""
echo "=========================================================================="

if [ $VALIDATION_FAILED -eq 0 ] && [ $VALIDATION_WARNING -eq 0 ]; then
  echo -e "${GREEN}✓ All Cloudflare output validations passed${NC}"
  echo "=========================================================================="
  exit 0
elif [ $VALIDATION_FAILED -eq 0 ]; then
  echo -e "${YELLOW}⚠ Cloudflare output validations passed with warnings${NC}"
  echo "=========================================================================="
  exit 0
else
  echo -e "${RED}✗ Cloudflare output validation failed${NC}"
  echo "=========================================================================="
  echo ""
  echo "CRITICAL ISSUES:"
  echo "- Worker bundle must be < 1MB (Cloudflare hard limit)"
  echo "- .open-next/worker/index.js must exist"
  echo "- .open-next/assets must be present"
  echo ""
  exit 1
fi
