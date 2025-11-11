#!/bin/bash
#
# track-mutation-score.sh
# Parse Stryker mutation report and extract metrics for tracking
#
# This script:
# - Reads reports/mutation/stryker-report.json
# - Extracts overall mutation score and per-file metrics
# - Writes metrics to .mutation-metrics/ directory in JSON format
# - Exits gracefully on errors (exit 0) to allow workflow continuation
#

set -euo pipefail

# Color codes for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Paths
readonly REPORT_FILE="reports/mutation/stryker-report.json"
readonly METRICS_DIR=".mutation-metrics"
readonly METRICS_FILE="${METRICS_DIR}/metrics.json"
readonly SUMMARY_FILE="${METRICS_DIR}/summary.txt"

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Main function to parse and extract metrics
extract_metrics() {
    log_info "Extracting mutation metrics from ${REPORT_FILE}..."

    # Check if report file exists
    if [ ! -f "${REPORT_FILE}" ]; then
        log_warning "Report file not found: ${REPORT_FILE}"
        log_info "Skipping metrics extraction (this is okay for CI/CD)"
        exit 0
    fi

    # Validate JSON format
    if ! jq empty "${REPORT_FILE}" 2>/dev/null; then
        log_warning "Invalid JSON format in ${REPORT_FILE}"
        log_info "Skipping metrics extraction"
        exit 0
    fi

    # Create metrics directory
    mkdir -p "${METRICS_DIR}"
    log_success "Created metrics directory: ${METRICS_DIR}"

    # Extract overall metrics from the report
    local mutation_score
    local total_mutants
    local killed_mutants
    local survived_mutants
    local timeout_mutants
    local no_coverage_mutants
    local ignored_mutants
    local runtime_errors
    local compile_errors

    mutation_score=$(jq -r '.thresholds.high // 0' "${REPORT_FILE}")

    # Try to extract from files array
    if jq -e '.files' "${REPORT_FILE}" > /dev/null 2>&1; then
        # Count mutants by status across all files
        total_mutants=$(jq '[.files[].mutants[]] | length' "${REPORT_FILE}")
        killed_mutants=$(jq '[.files[].mutants[] | select(.status == "Killed")] | length' "${REPORT_FILE}")
        survived_mutants=$(jq '[.files[].mutants[] | select(.status == "Survived")] | length' "${REPORT_FILE}")
        timeout_mutants=$(jq '[.files[].mutants[] | select(.status == "Timeout")] | length' "${REPORT_FILE}")
        no_coverage_mutants=$(jq '[.files[].mutants[] | select(.status == "NoCoverage")] | length' "${REPORT_FILE}")
        ignored_mutants=$(jq '[.files[].mutants[] | select(.status == "Ignored")] | length' "${REPORT_FILE}")
        runtime_errors=$(jq '[.files[].mutants[] | select(.status == "RuntimeError")] | length' "${REPORT_FILE}")
        compile_errors=$(jq '[.files[].mutants[] | select(.status == "CompileError")] | length' "${REPORT_FILE}")

        # Calculate mutation score if not present
        if [ "${total_mutants}" -gt 0 ]; then
            local detected=$((killed_mutants + timeout_mutants))
            local covered=$((total_mutants - no_coverage_mutants - ignored_mutants))
            if [ "${covered}" -gt 0 ]; then
                mutation_score=$(awk "BEGIN {printf \"%.2f\", (${detected} * 100.0 / ${covered})}")
            fi
        fi
    else
        # Fallback: try to read from summary or other fields
        total_mutants=0
        killed_mutants=0
        survived_mutants=0
        timeout_mutants=0
        no_coverage_mutants=0
        ignored_mutants=0
        runtime_errors=0
        compile_errors=0
    fi

    # Create JSON metrics file
    cat > "${METRICS_FILE}" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "report_file": "${REPORT_FILE}",
  "overall": {
    "mutation_score": ${mutation_score},
    "total_mutants": ${total_mutants},
    "killed": ${killed_mutants},
    "survived": ${survived_mutants},
    "timeout": ${timeout_mutants},
    "no_coverage": ${no_coverage_mutants},
    "ignored": ${ignored_mutants},
    "runtime_errors": ${runtime_errors},
    "compile_errors": ${compile_errors}
  },
  "per_file": $(jq '[.files[] | {
    file: .source,
    mutation_score: (.mutants |
      if length > 0 then
        (([.[] | select(.status == "Killed" or .status == "Timeout")] | length) * 100.0 /
         ([.[] | select(.status != "NoCoverage" and .status != "Ignored")] | length))
      else 0 end),
    total: (.mutants | length),
    killed: ([.mutants[] | select(.status == "Killed")] | length),
    survived: ([.mutants[] | select(.status == "Survived")] | length),
    no_coverage: ([.mutants[] | select(.status == "NoCoverage")] | length)
  }]' "${REPORT_FILE}" 2>/dev/null || echo "[]")
}
EOF

    log_success "Created metrics file: ${METRICS_FILE}"

    # Create human-readable summary
    cat > "${SUMMARY_FILE}" <<EOF
Mutation Testing Metrics Summary
=================================
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Report: ${REPORT_FILE}

Overall Metrics:
  Mutation Score: ${mutation_score}%
  Total Mutants: ${total_mutants}
  Killed: ${killed_mutants}
  Survived: ${survived_mutants}
  Timeout: ${timeout_mutants}
  No Coverage: ${no_coverage_mutants}
  Ignored: ${ignored_mutants}
  Runtime Errors: ${runtime_errors}
  Compile Errors: ${compile_errors}

Status:
EOF

    # Add status based on mutation score
    if (( $(echo "${mutation_score} >= 85" | bc -l) )); then
        echo "  ✓ EXCELLENT - Mutation score meets high threshold" >> "${SUMMARY_FILE}"
    elif (( $(echo "${mutation_score} >= 70" | bc -l) )); then
        echo "  ⚠ ACCEPTABLE - Mutation score meets minimum threshold" >> "${SUMMARY_FILE}"
    else
        echo "  ✗ NEEDS IMPROVEMENT - Mutation score below minimum threshold" >> "${SUMMARY_FILE}"
    fi

    log_success "Created summary file: ${SUMMARY_FILE}"

    # Print summary to console
    echo ""
    log_info "Mutation Testing Summary:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "  Mutation Score: ${GREEN}${mutation_score}%${NC}"
    echo "  Total Mutants: ${total_mutants}"
    echo "  Killed: ${killed_mutants}"
    echo "  Survived: ${survived_mutants}"
    echo "  No Coverage: ${no_coverage_mutants}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    log_success "Mutation metrics tracking completed successfully"
}

# Entry point
main() {
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed. Please install jq to parse JSON reports."
        log_info "On Ubuntu/Debian: sudo apt-get install jq"
        log_info "On macOS: brew install jq"
        exit 0  # Exit gracefully to not break CI/CD
    fi

    # Check if bc is installed (for floating point math)
    if ! command -v bc &> /dev/null; then
        log_warning "bc is not installed. Some calculations may be limited."
    fi

    extract_metrics
}

# Run main function
main "$@"

