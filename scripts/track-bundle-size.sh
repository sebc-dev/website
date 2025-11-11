#!/bin/bash

#
# Bundle Size Tracker
# ===================
#
# Purpose: Track Next.js bundle size over time and alert on significant growth
#
# Features:
# - Extract bundle size from build artifacts
# - Compare against previous builds
# - Generate historical metrics
# - Alert on size growth > 10%
# - Provide actionable recommendations
#
# Exit codes:
# 0 = Success, size is within limits
# 1 = Failed to collect metrics
# 2 = Size exceeded limits (warning)
#

set -e

METRICS_DIR=".bundle-metrics"
METRICS_FILE="$METRICS_DIR/bundle-sizes.jsonl"
NEXT_DIR=".next"
OPEN_NEXT_DIR=".open-next"
MAX_GROWTH_PERCENT=10
ALERT_SIZE=$((900 * 1024)) # 900KB warning threshold

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_pass() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

format_size() {
  local bytes=$1
  if [ $bytes -lt 1024 ]; then
    echo "${bytes}B"
  elif [ $bytes -lt $((1024 * 1024)) ]; then
    echo "$(( bytes / 1024 ))KB"
  else
    echo "$(( bytes / (1024 * 1024) ))MB"
  fi
}

calculate_percent_change() {
  local old=$1
  local new=$2
  if [ $old -eq 0 ]; then
    echo 0
  else
    echo $(( (new - old) * 100 / old ))
  fi
}

echo "=========================================================================="
echo "Next.js Bundle Size Tracker"
echo "=========================================================================="
echo ""

# =========================================================================
# Step 1: Collect current bundle metrics
# =========================================================================
echo "Collecting bundle metrics..."

# Find main bundle (webpack chunk)
MAIN_BUNDLE=$(find "$NEXT_DIR/static/chunks" -name "main-*.js" 2>/dev/null | head -1 || echo "")
APP_BUNDLE=$(find "$NEXT_DIR/static/chunks" -name "app-*.js" 2>/dev/null | head -1 || echo "")

if [ -z "$MAIN_BUNDLE" ] && [ -z "$APP_BUNDLE" ]; then
  log_error "Could not find Next.js bundle files"
  echo "  → Ensure 'pnpm build' completed successfully"
  echo "  → Check .next/static/chunks directory exists and contains bundle files"
  exit 1
fi

# Check if .next directory exists before measuring
if [ ! -d "$NEXT_DIR" ]; then
  log_error "Next.js build directory not found: $NEXT_DIR"
  echo "  → Ensure 'pnpm build' completed successfully"
  exit 1
fi

# Get total static size (with existence check)
if [ -d "$NEXT_DIR/static" ]; then
  STATIC_SIZE=$(du -sb "$NEXT_DIR/static" 2>/dev/null | cut -f1 || echo 0)
else
  log_warning "Static directory not found: $NEXT_DIR/static"
  STATIC_SIZE=0
fi
STATIC_SIZE_FORMATTED=$(format_size "$STATIC_SIZE")

# Check if Worker file exists before measuring
if [ ! -f "$OPEN_NEXT_DIR/worker/index.js" ]; then
  log_error "OpenNext worker bundle not found: $OPEN_NEXT_DIR/worker/index.js"
  echo "  → Ensure 'npx @opennextjs/cloudflare build' completed successfully"
  exit 1
fi

# Get Worker bundle size (after existence check)
WORKER_SIZE=$(stat -f%z "$OPEN_NEXT_DIR/worker/index.js" 2>/dev/null || stat -c%s "$OPEN_NEXT_DIR/worker/index.js" 2>/dev/null || echo 0)
WORKER_SIZE_FORMATTED=$(format_size "$WORKER_SIZE")

# Get total build size (after existence check for .next)
TOTAL_SIZE=$(du -sb "$NEXT_DIR" 2>/dev/null | cut -f1 || echo 0)
TOTAL_SIZE_FORMATTED=$(format_size "$TOTAL_SIZE")

log_pass "Bundle metrics collected"
echo "  → Static assets: $STATIC_SIZE_FORMATTED"
echo "  → Worker bundle: $WORKER_SIZE_FORMATTED"
echo "  → Total .next: $TOTAL_SIZE_FORMATTED"

# =========================================================================
# Step 2: Create metrics directory
# =========================================================================
mkdir -p "$METRICS_DIR"

# =========================================================================
# Step 3: Record current metrics
# =========================================================================
echo ""
echo "Recording metrics..."

TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
COMMIT_SHA="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
BUILD_NUMBER="${GITHUB_RUN_NUMBER:-0}"
BRANCH="${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')}"

# Append to JSONL file
cat >> "$METRICS_FILE" << EOF
{"timestamp":"$TIMESTAMP","commit":"$COMMIT_SHA","branch":"$BRANCH","build":$BUILD_NUMBER,"static_bytes":$STATIC_SIZE,"worker_bytes":$WORKER_SIZE,"total_bytes":$TOTAL_SIZE}
EOF

log_pass "Metrics recorded in $METRICS_FILE"

# =========================================================================
# Step 4: Compare against previous build
# =========================================================================
echo ""
echo "Comparing against previous build..."

# Get previous metrics (last 2 lines, take first one which is oldest)
PREV_METRICS=$(tail -2 "$METRICS_FILE" | head -1)

if [ -z "$PREV_METRICS" ]; then
  log_info "First build tracked - no previous build to compare"
else
  # Extract previous sizes using jq or grep
  PREV_STATIC=$(echo "$PREV_METRICS" | grep -o '"static_bytes":[0-9]*' | cut -d: -f2)
  PREV_WORKER=$(echo "$PREV_METRICS" | grep -o '"worker_bytes":[0-9]*' | cut -d: -f2)
  PREV_TOTAL=$(echo "$PREV_METRICS" | grep -o '"total_bytes":[0-9]*' | cut -d: -f2)

  # Calculate changes
  STATIC_CHANGE=$(calculate_percent_change "$PREV_STATIC" "$STATIC_SIZE")
  WORKER_CHANGE=$(calculate_percent_change "$PREV_WORKER" "$WORKER_SIZE")
  TOTAL_CHANGE=$(calculate_percent_change "$PREV_TOTAL" "$TOTAL_SIZE")

  echo "  Change from previous build:"
  echo "  → Static assets: $(format_size $PREV_STATIC) → $STATIC_SIZE_FORMATTED (${STATIC_CHANGE:+${STATIC_CHANGE:0:1}}${STATIC_CHANGE}%)"
  echo "  → Worker bundle: $(format_size $PREV_WORKER) → $WORKER_SIZE_FORMATTED (${WORKER_CHANGE:+${WORKER_CHANGE:0:1}}${WORKER_CHANGE}%)"
  echo "  → Total build: $(format_size $PREV_TOTAL) → $TOTAL_SIZE_FORMATTED (${TOTAL_CHANGE:+${TOTAL_CHANGE:0:1}}${TOTAL_CHANGE}%)"

  # Alert on growth
  GROWTH_WARNING=0
  if [ "${STATIC_CHANGE#-}" -gt $MAX_GROWTH_PERCENT ]; then
    log_warning "Static assets grew ${STATIC_CHANGE}% (limit: ${MAX_GROWTH_PERCENT}%)"
    GROWTH_WARNING=1
  fi

  if [ "${WORKER_CHANGE#-}" -gt $MAX_GROWTH_PERCENT ]; then
    log_warning "Worker bundle grew ${WORKER_CHANGE}% (limit: ${MAX_GROWTH_PERCENT}%)"
    GROWTH_WARNING=1
  fi

  # Alert on approaching Worker size limit
  if [ $WORKER_SIZE -gt $ALERT_SIZE ]; then
    log_warning "Worker approaching size limit: $WORKER_SIZE_FORMATTED (limit: 1MB)"
    GROWTH_WARNING=1
  fi
fi

# =========================================================================
# Step 5: Generate report
# =========================================================================
echo ""
echo "=========================================================================="
echo "Bundle Size Report"
echo "=========================================================================="
echo ""
echo "Current Metrics:"
echo "  Timestamp: $TIMESTAMP"
echo "  Commit: ${COMMIT_SHA:0:7}"
echo "  Branch: $BRANCH"
echo "  Build: #$BUILD_NUMBER"
echo ""
echo "Bundle Sizes:"
echo "  Static Assets: $STATIC_SIZE_FORMATTED"
echo "  Worker Bundle: $WORKER_SIZE_FORMATTED ($(( WORKER_SIZE * 100 / (1024 * 1024) ))% of 1MB limit)"
echo "  Total Build: $TOTAL_SIZE_FORMATTED"
echo ""

if [ $WORKER_SIZE -gt $ALERT_SIZE ]; then
  echo -e "${YELLOW}⚠ Worker bundle approaching limit:${NC}"
  echo "  Current: $WORKER_SIZE_FORMATTED"
  echo "  Recommended: < 800KB"
  echo "  Hard limit: 1MB"
  echo ""
  echo "Optimization strategies:"
  echo "  1. Check for large dependencies: npx webpack-bundle-analyzer"
  echo "  2. Enable tree-shaking in Next.js build configuration"
  echo "  3. Use dynamic imports for heavy components"
  echo "  4. Remove unused packages and dependencies"
  echo "  5. Analyze code splitting and lazy loading"
else
  log_pass "Worker bundle size is healthy"
fi

echo ""
echo "=========================================================================="

# Save metrics for artifact upload
{
  echo "# Bundle Size Metrics"
  echo ""
  echo "## Current Build"
  echo ""
  echo "| Metric | Size | Percentage of Limit |"
  echo "|--------|------|---------------------|"
  echo "| Static Assets | $STATIC_SIZE_FORMATTED | N/A |"
  echo "| Worker Bundle | $WORKER_SIZE_FORMATTED | $(( WORKER_SIZE * 100 / (1024 * 1024) ))% |"
  echo "| Total Build | $TOTAL_SIZE_FORMATTED | N/A |"
  echo ""
  echo "## Build Info"
  echo ""
  echo "- **Timestamp**: $TIMESTAMP"
  echo "- **Commit**: $COMMIT_SHA"
  echo "- **Branch**: $BRANCH"
  echo "- **Build**: #$BUILD_NUMBER"
  echo ""
} > "$METRICS_DIR/latest-report.md"

log_pass "Report saved to $METRICS_DIR/latest-report.md"

# =========================================================================
# Step 6: Exit with appropriate status code
# =========================================================================
if [ "${GROWTH_WARNING:-0}" -eq 1 ]; then
  exit 2
else
  exit 0
fi
