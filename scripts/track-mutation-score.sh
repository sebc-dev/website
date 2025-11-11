#!/bin/bash

#
# Mutation Testing Score Tracker
# ==============================
#
# Purpose: Track Stryker mutation testing scores over time
#
# Features:
# - Extract mutation score from Stryker reports
# - Compare against previous scores
# - Generate historical metrics
# - Alert on score drops
# - Create badges for documentation
#
# Exit codes:
# 0 = Success
# 1 = Failed to collect metrics
#

set -e

METRICS_DIR=".mutation-metrics"
METRICS_FILE="$METRICS_DIR/mutation-scores.jsonl"
STRYKER_REPORT="stryker-report.json"
MIN_ACCEPTABLE_SCORE=80

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

echo "=========================================================================="
echo "Mutation Testing Score Tracker"
echo "=========================================================================="
echo ""

# =========================================================================
# Step 1: Check for Stryker report
# =========================================================================
echo "Looking for Stryker mutation testing report..."

if [ ! -f "$STRYKER_REPORT" ]; then
  log_error "Stryker report not found: $STRYKER_REPORT"
  echo "  → Run 'pnpm exec stryker run' to generate mutation testing report"
  exit 1
fi

log_pass "Stryker report found"

# =========================================================================
# Step 2: Extract mutation score
# =========================================================================
echo ""
echo "Extracting mutation scores..."

# Try to extract score from Stryker JSON report
MUTATION_SCORE=$(grep -o '"killed":[0-9]*' "$STRYKER_REPORT" | head -1 | cut -d: -f2 || echo "")

if [ -z "$MUTATION_SCORE" ]; then
  # Try alternative format
  MUTATION_SCORE=$(grep -o '"score":[0-9.]*' "$STRYKER_REPORT" | head -1 | cut -d: -f2 || echo "")
fi

if [ -z "$MUTATION_SCORE" ]; then
  log_error "Could not extract mutation score from $STRYKER_REPORT"
  echo "  → Verify Stryker report is in correct format"
  exit 1
fi

log_pass "Mutation score extracted: ${MUTATION_SCORE}%"

# =========================================================================
# Step 3: Create metrics directory
# =========================================================================
mkdir -p "$METRICS_DIR"

# =========================================================================
# Step 4: Record metrics
# =========================================================================
echo ""
echo "Recording metrics..."

TIMESTAMP=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
COMMIT_SHA="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
BUILD_NUMBER="${GITHUB_RUN_NUMBER:-0}"
BRANCH="${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')}"

cat >> "$METRICS_FILE" << EOF
{"timestamp":"$TIMESTAMP","commit":"$COMMIT_SHA","branch":"$BRANCH","build":$BUILD_NUMBER,"score":${MUTATION_SCORE}}
EOF

log_pass "Metrics recorded"

# =========================================================================
# Step 5: Compare against previous score
# =========================================================================
echo ""
echo "Comparing against previous score..."

# Get previous metrics
PREV_METRICS=$(tail -2 "$METRICS_FILE" | head -1)

if [ -z "$PREV_METRICS" ]; then
  log_info "First mutation test tracked - no previous score to compare"
  SCORE_CHANGE=0
else
  # Extract previous score
  PREV_SCORE=$(echo "$PREV_METRICS" | grep -o '"score":[0-9.]*' | cut -d: -f2)
  SCORE_CHANGE=$(echo "$MUTATION_SCORE - $PREV_SCORE" | bc 2>/dev/null || echo 0)

  echo "  Previous score: ${PREV_SCORE}%"
  echo "  Current score: ${MUTATION_SCORE}%"
  echo "  Change: ${SCORE_CHANGE:+${SCORE_CHANGE:0:1}}${SCORE_CHANGE}%"

  # Alert on score drop
  if (( $(echo "$SCORE_CHANGE < 0" | bc -l 2>/dev/null || echo 0) )); then
    log_warning "Mutation score decreased by ${SCORE_CHANGE#-}%"
    echo "  → Investigate test quality"
    echo "  → Ensure mutations are properly caught by tests"
  elif (( $(echo "$SCORE_CHANGE > 0" | bc -l 2>/dev/null || echo 0) )); then
    log_pass "Mutation score improved by $SCORE_CHANGE%"
  fi
fi

# =========================================================================
# Step 6: Generate report
# =========================================================================
echo ""
echo "=========================================================================="
echo "Mutation Testing Report"
echo "=========================================================================="
echo ""
echo "Score: ${MUTATION_SCORE}% (Target: $MIN_ACCEPTABLE_SCORE%+)"
echo ""

if (( $(echo "$MUTATION_SCORE < $MIN_ACCEPTABLE_SCORE" | bc -l 2>/dev/null || echo 1) )); then
  log_warning "Mutation score below target ($MIN_ACCEPTABLE_SCORE%)"
  echo ""
  echo "Improvement recommendations:"
  echo "  1. Review killed vs survived mutations"
  echo "  2. Add more specific assertions to tests"
  echo "  3. Increase test coverage for critical code paths"
  echo "  4. Test boundary conditions and edge cases"
else
  log_pass "Mutation score meets target ($MIN_ACCEPTABLE_SCORE%+)"
fi

echo ""

# =========================================================================
# Step 7: Generate badge
# =========================================================================
echo "Generating mutation score badge..."

# Determine badge color based on score
if (( $(echo "$MUTATION_SCORE >= 90" | bc -l 2>/dev/null || echo 0) )); then
  BADGE_COLOR="green"
elif (( $(echo "$MUTATION_SCORE >= $MIN_ACCEPTABLE_SCORE" | bc -l 2>/dev/null || echo 0) )); then
  BADGE_COLOR="yellow"
else
  BADGE_COLOR="red"
fi

# Create badge markdown
BADGE_URL="https://img.shields.io/badge/mutation--score-${MUTATION_SCORE}%25-${BADGE_COLOR}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-unknown/repo}"
GITHUB_RUN_ID="${GITHUB_RUN_ID:-0}"
BADGE_MARKDOWN="[![Mutation Score](${BADGE_URL})](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID})"

mkdir -p "$METRICS_DIR"
echo "$BADGE_MARKDOWN" > "$METRICS_DIR/badge.md"

log_pass "Badge generated in $METRICS_DIR/badge.md"

# =========================================================================
# Step 8: Save detailed report
# =========================================================================
echo ""
echo "Saving detailed report..."

{
  echo "# Mutation Testing Report"
  echo ""
  echo "## Current Score"
  echo ""
  echo "- **Mutation Score**: ${MUTATION_SCORE}%"
  echo "- **Target**: ${MIN_ACCEPTABLE_SCORE}%+"
  echo "- **Build**: #$BUILD_NUMBER"
  echo "- **Commit**: $COMMIT_SHA"
  echo "- **Branch**: $BRANCH"
  echo "- **Timestamp**: $TIMESTAMP"
  echo ""

  if [ -n "$PREV_SCORE" ]; then
    echo "## Comparison to Previous Build"
    echo ""
    echo "- **Previous**: ${PREV_SCORE}%"
    echo "- **Current**: ${MUTATION_SCORE}%"
    echo "- **Change**: ${SCORE_CHANGE:+${SCORE_CHANGE:0:1}}${SCORE_CHANGE}%"
    echo ""
  fi

  echo "## Score Status"
  echo ""
  if (( $(echo "$MUTATION_SCORE >= 90" | bc -l 2>/dev/null || echo 0) )); then
    echo "✅ **Excellent** - Mutation score is very high, tests are comprehensive"
  elif (( $(echo "$MUTATION_SCORE >= $MIN_ACCEPTABLE_SCORE" | bc -l 2>/dev/null || echo 0) )); then
    echo "⚠️ **Acceptable** - Mutation score meets minimum target, room for improvement"
  else
    echo "❌ **Below Target** - Mutation score below minimum, tests need strengthening"
  fi
  echo ""

  echo "## Full Report"
  echo ""
  GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-unknown/repo}"
  GITHUB_RUN_ID="${GITHUB_RUN_ID:-0}"
  echo "[View full mutation report in artifacts](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID})"
  echo ""
} > "$METRICS_DIR/latest-report.md"

log_pass "Report saved to $METRICS_DIR/latest-report.md"

echo ""
echo "=========================================================================="
echo "✓ Mutation tracking complete"
echo "=========================================================================="

exit 0
