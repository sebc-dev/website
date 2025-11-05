#!/usr/bin/env bash
# Script de vérification automatique de la qualité du code
# Exécuté par le hook PostToolUse après modification de fichiers

set -euo pipefail

# Variables d'environnement disponibles
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
MODIFIED_FILES="${CLAUDE_FILE_PATHS:-}"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1" >&2
}

log_error() {
    echo -e "${RED}✗${NC} $1" >&2
}

# Compteurs pour le rapport final
CHECKS_TOTAL=0
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_SKIPPED=0

# Tableau pour stocker les résultats
declare -a RESULTS=()

# Fonction pour exécuter une vérification
run_check() {
    local check_name="$1"
    local check_cmd="$2"
    local is_critical="${3:-false}"

    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    log_info "Running $check_name..."

    if eval "$check_cmd" > /tmp/quality-check-$$.log 2>&1; then
        log_success "$check_name passed"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        RESULTS+=("✓ $check_name")
        return 0
    else
        if [ "$is_critical" = "true" ]; then
            log_error "$check_name failed (critical)"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
            RESULTS+=("✗ $check_name (CRITICAL)")
            cat /tmp/quality-check-$$.log >&2
            return 1
        else
            log_warning "$check_name failed (non-critical)"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
            RESULTS+=("⚠ $check_name (non-critical)")
            cat /tmp/quality-check-$$.log >&2
            return 0
        fi
    fi
}

# Fonction pour afficher le rapport final
show_report() {
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  📊 Quality Check Report"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "Total checks: $CHECKS_TOTAL"
    echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
    echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
    echo -e "${YELLOW}Skipped: $CHECKS_SKIPPED${NC}"
    echo ""
    echo "Details:"
    for result in "${RESULTS[@]}"; do
        echo "  $result"
    done
    echo ""
    echo "═══════════════════════════════════════════════════════"
}

# Détection du contexte (fichiers modifiés)
if [ -n "$MODIFIED_FILES" ]; then
    log_info "Modified files detected: $MODIFIED_FILES"

    # Vérifier si des fichiers TypeScript/JavaScript ont été modifiés
    if echo "$MODIFIED_FILES" | grep -qE '\.(ts|tsx|js|jsx)$'; then
        RUN_TS_CHECKS=true
    else
        RUN_TS_CHECKS=false
        log_info "No TypeScript/JavaScript files modified, skipping TS checks"
        CHECKS_SKIPPED=$((CHECKS_SKIPPED + 3))
    fi

    # Vérifier si des fichiers de test ont été modifiés
    if echo "$MODIFIED_FILES" | grep -qE '(test|spec)\.(ts|tsx|js|jsx)$'; then
        RUN_TEST_CHECKS=true
    else
        RUN_TEST_CHECKS=false
    fi
else
    log_info "No specific files detected, running all checks"
    RUN_TS_CHECKS=true
    RUN_TEST_CHECKS=true
fi

cd "$PROJECT_DIR"

# Vérification 1: TypeScript Type Check
if [ "$RUN_TS_CHECKS" = true ]; then
    run_check "TypeScript Type Check" "pnpm --filter web typecheck" true
else
    RESULTS+=("⊘ TypeScript Type Check (skipped)")
fi

# Vérification 2: Biome Linting
if [ "$RUN_TS_CHECKS" = true ]; then
    run_check "Biome Linting" "pnpm --filter web lint" false
else
    RESULTS+=("⊘ Biome Linting (skipped)")
fi

# Vérification 3: Biome Formatting
if [ "$RUN_TS_CHECKS" = true ]; then
    # Le formatage est automatique, on vérifie juste si c'est nécessaire
    if run_check "Biome Format Check" "pnpm --filter web format" false; then
        log_info "Code formatted successfully"
    fi
else
    RESULTS+=("⊘ Biome Formatting (skipped)")
fi

# Vérification 4: Tests unitaires
if [ "$RUN_TEST_CHECKS" = true ] || [ "$RUN_TS_CHECKS" = true ]; then
    run_check "Unit Tests" "pnpm --filter web test --run" false
else
    RESULTS+=("⊘ Unit Tests (skipped)")
    CHECKS_SKIPPED=$((CHECKS_SKIPPED + 1))
fi

# Vérification 5: Couverture de code (optionnelle, non bloquante)
if [ "$RUN_TEST_CHECKS" = true ] || [ "$RUN_TS_CHECKS" = true ]; then
    if run_check "Code Coverage" "pnpm --filter web test:coverage --run" false; then
        log_info "Coverage report generated"
    fi
else
    RESULTS+=("⊘ Code Coverage (skipped)")
    CHECKS_SKIPPED=$((CHECKS_SKIPPED + 1))
fi

# Nettoyage
rm -f /tmp/quality-check-$$.log

# Afficher le rapport final
show_report

# Retourner le code de sortie approprié
if [ $CHECKS_FAILED -gt 0 ]; then
    # Si des checks critiques ont échoué, on retourne un code d'erreur
    # mais on ne bloque pas (code != 2) car le travail est déjà fait
    log_warning "Some quality checks failed. Please review and fix."
    exit 1
else
    log_success "All quality checks passed!"
    exit 0
fi
