#!/usr/bin/env bash
# Script de génération de rapport de qualité détaillé
# Utilisé par le skill quality-report

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="$PROJECT_DIR/.claude/quality-system/reports"
REPORT_JSON="$REPORT_DIR/quality-$TIMESTAMP.json"
REPORT_MD="$REPORT_DIR/quality-$TIMESTAMP.md"
FORMAT="${QUALITY_REPORT_FORMAT:-both}"
DETAILED="${QUALITY_REPORT_DETAILED:-true}"

# Créer le répertoire de rapports
mkdir -p "$REPORT_DIR"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Structure JSON pour stocker les résultats
cat > "$REPORT_JSON" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "project": "sebc.dev",
  "checks": [],
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0
  }
}
EOF

# Fonction pour ajouter un résultat au JSON
add_check_result() {
    local name="$1"
    local status="$2"
    local duration="$3"
    local details="$4"
    local output="$5"

    # Utiliser jq pour ajouter le résultat au JSON (si disponible)
    if command -v jq &> /dev/null; then
        local tmp_file=$(mktemp)
        jq --arg name "$name" \
           --arg status "$status" \
           --arg duration "$duration" \
           --arg details "$details" \
           --arg output "$output" \
           '.checks += [{
               "name": $name,
               "status": $status,
               "duration": $duration,
               "details": $details,
               "output": $output
           }]' "$REPORT_JSON" > "$tmp_file"
        mv "$tmp_file" "$REPORT_JSON"
    fi

    # Mettre à jour le résumé
    if [ "$status" = "passed" ]; then
        jq '.summary.passed += 1 | .summary.total += 1' "$REPORT_JSON" > "$tmp_file"
        mv "$tmp_file" "$REPORT_JSON"
    elif [ "$status" = "failed" ]; then
        jq '.summary.failed += 1 | .summary.total += 1' "$REPORT_JSON" > "$tmp_file"
        mv "$tmp_file" "$REPORT_JSON"
    elif [ "$status" = "warning" ]; then
        jq '.summary.warnings += 1 | .summary.total += 1' "$REPORT_JSON" > "$tmp_file"
        mv "$tmp_file" "$REPORT_JSON"
    fi
}

# Fonction pour exécuter une vérification et capturer le résultat
run_and_record() {
    local check_name="$1"
    local check_cmd="$2"

    log_info "Running $check_name..."

    local start_time=$(date +%s.%N)
    local output_file=$(mktemp)
    local status="passed"
    local details=""

    if eval "$check_cmd" > "$output_file" 2>&1; then
        status="passed"
        details="All checks passed"
    else
        local exit_code=$?
        if [ $exit_code -eq 1 ]; then
            status="warning"
            details="Non-critical issues detected"
        else
            status="failed"
            details="Critical errors detected"
        fi
    fi

    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)

    local output_content=""
    if [ "$DETAILED" = "true" ]; then
        output_content=$(cat "$output_file")
    fi

    add_check_result "$check_name" "$status" "${duration}s" "$details" "$output_content"

    rm -f "$output_file"
}

cd "$PROJECT_DIR"

# Exécuter toutes les vérifications
log_info "Starting quality checks..."

run_and_record "TypeScript Type Check" "pnpm --filter web typecheck"
run_and_record "Biome Linting" "pnpm --filter web lint"
run_and_record "Biome Formatting" "pnpm --filter web format"
run_and_record "Unit Tests" "pnpm --filter web test --run"
run_and_record "Code Coverage" "pnpm --filter web test:coverage --run"

# Calculer le score global
if command -v jq &> /dev/null; then
    local total=$(jq '.summary.total' "$REPORT_JSON")
    local passed=$(jq '.summary.passed' "$REPORT_JSON")
    local score=$(echo "scale=0; ($passed * 100) / $total" | bc)

    local tmp_file=$(mktemp)
    jq --arg score "$score" '.summary.score = ($score | tonumber)' "$REPORT_JSON" > "$tmp_file"
    mv "$tmp_file" "$REPORT_JSON"
fi

# Générer le rapport Markdown
if [ "$FORMAT" = "markdown" ] || [ "$FORMAT" = "both" ]; then
    log_info "Generating Markdown report..."

    cat > "$REPORT_MD" <<EOF
# 📊 Rapport de Qualité du Code

**Date :** $(date '+%Y-%m-%d %H:%M:%S')
**Projet :** sebc.dev

## Résumé Exécutif

EOF

    if command -v jq &> /dev/null; then
        local score=$(jq -r '.summary.score // "N/A"' "$REPORT_JSON")
        local passed=$(jq -r '.summary.passed' "$REPORT_JSON")
        local failed=$(jq -r '.summary.failed' "$REPORT_JSON")
        local warnings=$(jq -r '.summary.warnings' "$REPORT_JSON")
        local total=$(jq -r '.summary.total' "$REPORT_JSON")

        echo "✅ **Score global :** $score/100" >> "$REPORT_MD"
        echo "" >> "$REPORT_MD"
        echo "- ✅ Passed: $passed" >> "$REPORT_MD"
        echo "- ❌ Failed: $failed" >> "$REPORT_MD"
        echo "- ⚠️ Warnings: $warnings" >> "$REPORT_MD"
        echo "- 📊 Total: $total" >> "$REPORT_MD"
        echo "" >> "$REPORT_MD"
        echo "## Détails des Vérifications" >> "$REPORT_MD"
        echo "" >> "$REPORT_MD"

        # Itérer sur chaque check
        jq -r '.checks[] | "### \(.status | if . == "passed" then "✅" elif . == "failed" then "❌" else "⚠️" end) \(.name)\n- **Status:** \(.status)\n- **Durée:** \(.duration)\n- **Détails:** \(.details)\n"' "$REPORT_JSON" >> "$REPORT_MD"
    fi

    echo "" >> "$REPORT_MD"
    echo "---" >> "$REPORT_MD"
    echo "*Rapport généré automatiquement par le skill quality-report*" >> "$REPORT_MD"
fi

# Afficher le chemin des rapports générés
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  📄 Quality Report Generated"
echo "═══════════════════════════════════════════════════════"
[ "$FORMAT" = "json" ] || [ "$FORMAT" = "both" ] && echo "JSON: $REPORT_JSON"
[ "$FORMAT" = "markdown" ] || [ "$FORMAT" = "both" ] && echo "Markdown: $REPORT_MD"
echo "═══════════════════════════════════════════════════════"

exit 0
