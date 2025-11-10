#!/usr/bin/env bash
# Script de génération de rapport de qualité détaillé
# Utilisé par le skill quality-report
#
# Stack: Next.js 15 + TypeScript + ESLint + Prettier + Vitest + Playwright + Dependency Cruiser

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="$PROJECT_DIR/.claude/quality-system/reports"
REPORT_JSON="$REPORT_DIR/quality-$TIMESTAMP.json"
REPORT_MD="$REPORT_DIR/quality-$TIMESTAMP.md"
FORMAT="${QUALITY_REPORT_FORMAT:-both}"
DETAILED="${QUALITY_REPORT_DETAILED:-true}"
INCLUDE_E2E="${QUALITY_REPORT_E2E:-false}"

# Créer le répertoire de rapports
mkdir -p "$REPORT_DIR"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Vérifier si jq est disponible
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq to generate JSON reports."
    exit 1
fi

# Structure JSON pour stocker les résultats
cat > "$REPORT_JSON" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "project": "sebc.dev",
  "stack": {
    "framework": "Next.js 15",
    "runtime": "Cloudflare Workers",
    "language": "TypeScript",
    "linter": "ESLint",
    "formatter": "Prettier",
    "testing": {
      "unit": "Vitest",
      "e2e": "Playwright",
      "mutation": "Stryker"
    },
    "architecture": "Dependency Cruiser"
  },
  "checks": [],
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "score": 0
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
    local category="${6:-general}"

    local tmp_file=$(mktemp)
    jq --arg name "$name" \
       --arg status "$status" \
       --arg duration "$duration" \
       --arg details "$details" \
       --arg output "$output" \
       --arg category "$category" \
       '.checks += [{
           "name": $name,
           "status": $status,
           "duration": $duration,
           "details": $details,
           "output": $output,
           "category": $category
       }]' "$REPORT_JSON" > "$tmp_file"
    mv "$tmp_file" "$REPORT_JSON"

    # Mettre à jour le résumé
    tmp_file=$(mktemp)
    if [ "$status" = "passed" ]; then
        jq '.summary.passed += 1 | .summary.total += 1' "$REPORT_JSON" > "$tmp_file"
    elif [ "$status" = "failed" ]; then
        jq '.summary.failed += 1 | .summary.total += 1' "$REPORT_JSON" > "$tmp_file"
    elif [ "$status" = "warning" ]; then
        jq '.summary.warnings += 1 | .summary.total += 1' "$REPORT_JSON" > "$tmp_file"
    fi
    mv "$tmp_file" "$REPORT_JSON"
}

# Fonction pour exécuter une vérification et capturer le résultat
run_and_record() {
    local check_name="$1"
    local check_cmd="$2"
    local category="${3:-general}"

    log_info "Running $check_name..."

    local start_time=$(date +%s.%N 2>/dev/null || date +%s)
    local output_file=$(mktemp)
    local status="passed"
    local details=""

    if eval "$check_cmd" > "$output_file" 2>&1; then
        status="passed"
        details="All checks passed"
    else
        local exit_code=$?
        # Les commandes de formatage/linting retournent souvent 1 pour des warnings
        if [ $exit_code -eq 1 ]; then
            # Vérifier si c'est critique en regardant le contenu
            if grep -qi "error" "$output_file" 2>/dev/null; then
                status="failed"
                details="Errors detected (exit code: $exit_code)"
            else
                status="warning"
                details="Warnings or style issues detected"
            fi
        else
            status="failed"
            details="Critical errors detected (exit code: $exit_code)"
        fi
    fi

    local end_time=$(date +%s.%N 2>/dev/null || date +%s)
    local duration=$(echo "$end_time - $start_time" | bc 2>/dev/null || echo "0")
    duration="${duration}s"

    local output_content=""
    if [ "$DETAILED" = "true" ]; then
        # Limiter la sortie aux 100 premières lignes pour éviter des JSON trop gros
        output_content=$(head -n 100 "$output_file" 2>/dev/null || echo "")
    fi

    add_check_result "$check_name" "$status" "$duration" "$details" "$output_content" "$category"

    rm -f "$output_file"
}

cd "$PROJECT_DIR"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🔍 Starting Comprehensive Quality Report"
echo "═══════════════════════════════════════════════════════"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔍 STATIC ANALYSIS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "🔍 Static Analysis"

run_and_record "TypeScript Type Check" "pnpm exec tsc --noEmit" "static-analysis"
run_and_record "ESLint" "pnpm lint" "static-analysis"
run_and_record "Prettier Format Check" "pnpm format:check" "static-analysis"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🏗️ ARCHITECTURE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "🏗️ Architecture"

run_and_record "Architecture Validation (Dependency Cruiser)" "pnpm arch:validate" "architecture"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧪 UNIT TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "🧪 Unit Tests"

run_and_record "Vitest Unit Tests" "pnpm test --run" "testing"
run_and_record "Code Coverage" "pnpm test:coverage --run" "testing"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎭 E2E TESTS (Optional)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ "$INCLUDE_E2E" = "true" ]; then
    log_section "🎭 End-to-End Tests"
    run_and_record "Playwright E2E Tests" "pnpm test:e2e" "e2e-testing"
else
    log_info "E2E tests skipped (set QUALITY_REPORT_E2E=true to include)"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📊 CALCULATE SCORE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "📊 Calculating Score"

total=$(jq '.summary.total' "$REPORT_JSON")
passed=$(jq '.summary.passed' "$REPORT_JSON")
warnings=$(jq '.summary.warnings' "$REPORT_JSON")

if [ "$total" -gt 0 ]; then
    # Score = (passed * 100 + warnings * 50) / total
    score=$(echo "scale=0; (($passed * 100) + ($warnings * 50)) / $total" | bc)
else
    score=0
fi

tmp_file=$(mktemp)
jq --arg score "$score" '.summary.score = ($score | tonumber)' "$REPORT_JSON" > "$tmp_file"
mv "$tmp_file" "$REPORT_JSON"

log_success "Quality score: $score/100"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📝 GENERATE MARKDOWN REPORT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ "$FORMAT" = "markdown" ] || [ "$FORMAT" = "both" ]; then
    log_section "📝 Generating Markdown Report"

    score=$(jq -r '.summary.score // "N/A"' "$REPORT_JSON")
    passed=$(jq -r '.summary.passed' "$REPORT_JSON")
    failed=$(jq -r '.summary.failed' "$REPORT_JSON")
    warnings=$(jq -r '.summary.warnings' "$REPORT_JSON")
    total=$(jq -r '.summary.total' "$REPORT_JSON")
    timestamp=$(jq -r '.timestamp' "$REPORT_JSON")

    # Déterminer le badge du score
    if [ "$score" -ge 90 ]; then
        score_badge="🟢"
        score_label="Excellent"
    elif [ "$score" -ge 75 ]; then
        score_badge="🟡"
        score_label="Bon"
    elif [ "$score" -ge 50 ]; then
        score_badge="🟠"
        score_label="À améliorer"
    else
        score_badge="🔴"
        score_label="Critique"
    fi

    cat > "$REPORT_MD" <<EOF
# 📊 Rapport de Qualité du Code

**Date:** $timestamp
**Projet:** sebc.dev
**Stack:** Next.js 15 + TypeScript + ESLint + Prettier + Vitest

---

## 🎯 Résumé Exécutif

### Score Global

$score_badge **${score}/100** - $score_label

### Métriques

| Métrique | Valeur |
|----------|--------|
| ✅ Passed | $passed |
| ❌ Failed | $failed |
| ⚠️ Warnings | $warnings |
| 📊 Total | $total |

---

## 📋 Détails des Vérifications

EOF

    # Grouper les checks par catégorie
    categories=$(jq -r '[.checks[].category] | unique | .[]' "$REPORT_JSON")

    for category in $categories; do
        case $category in
            "static-analysis")
                echo "### 🔍 Static Analysis" >> "$REPORT_MD"
                ;;
            "architecture")
                echo "### 🏗️ Architecture" >> "$REPORT_MD"
                ;;
            "testing")
                echo "### 🧪 Testing" >> "$REPORT_MD"
                ;;
            "e2e-testing")
                echo "### 🎭 E2E Testing" >> "$REPORT_MD"
                ;;
            *)
                echo "### 📦 $category" >> "$REPORT_MD"
                ;;
        esac

        echo "" >> "$REPORT_MD"

        # Afficher les checks de cette catégorie
        jq -r --arg cat "$category" '.checks[] | select(.category == $cat) |
            "#### \(.status | if . == "passed" then "✅" elif . == "failed" then "❌" else "⚠️" end) \(.name)\n\n" +
            "- **Status:** \(.status)\n" +
            "- **Durée:** \(.duration)\n" +
            "- **Détails:** \(.details)\n"
        ' "$REPORT_JSON" >> "$REPORT_MD"
    done

    # Ajouter des recommandations basées sur les résultats
    cat >> "$REPORT_MD" <<EOF

---

## 💡 Recommandations

EOF

    if [ "$failed" -gt 0 ]; then
        echo "### ⚠️ Actions Prioritaires" >> "$REPORT_MD"
        echo "" >> "$REPORT_MD"
        jq -r '.checks[] | select(.status == "failed") |
            "- **\(.name):** \(.details)"
        ' "$REPORT_JSON" >> "$REPORT_MD"
        echo "" >> "$REPORT_MD"
    fi

    if [ "$warnings" -gt 0 ]; then
        echo "### 📝 Améliorations Suggérées" >> "$REPORT_MD"
        echo "" >> "$REPORT_MD"
        jq -r '.checks[] | select(.status == "warning") |
            "- **\(.name):** \(.details)"
        ' "$REPORT_JSON" >> "$REPORT_MD"
        echo "" >> "$REPORT_MD"
    fi

    if [ "$failed" -eq 0 ] && [ "$warnings" -eq 0 ]; then
        echo "🎉 **Aucune recommandation** - Tous les contrôles sont passés avec succès !" >> "$REPORT_MD"
        echo "" >> "$REPORT_MD"
    fi

    cat >> "$REPORT_MD" <<EOF

---

## 📚 Commandes Utiles

\`\`\`bash
# Corriger le formatage automatiquement
pnpm format

# Corriger les problèmes ESLint automatiquement
pnpm lint:fix

# Lancer les tests en mode watch
pnpm test:watch

# Valider l'architecture
pnpm arch:validate

# Tests E2E avec UI
pnpm test:e2e:ui
\`\`\`

---

*Rapport généré automatiquement par le skill quality-report*
*Fichier JSON: \`${REPORT_JSON##*/}\`*
EOF

    log_success "Markdown report generated"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📄 SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  📄 Quality Report Generated"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Score: $score/100"
echo "Passed: $passed | Failed: $failed | Warnings: $warnings"
echo ""
[ "$FORMAT" = "json" ] || [ "$FORMAT" = "both" ] && echo "📊 JSON: $REPORT_JSON"
[ "$FORMAT" = "markdown" ] || [ "$FORMAT" = "both" ] && echo "📝 Markdown: $REPORT_MD"
echo ""
echo "═══════════════════════════════════════════════════════"

exit 0
