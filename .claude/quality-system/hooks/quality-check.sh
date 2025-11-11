#!/usr/bin/env bash
# Script de vérification automatique de la qualité du code
# Exécuté par le hook PostToolUse après modification de fichiers
#
# Stack: Next.js 15 + TypeScript + ESLint + Prettier + Vitest + Playwright + Dependency Cruiser

set -euo pipefail

# Variables d'environnement disponibles
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
MODIFIED_FILES="${CLAUDE_FILE_PATHS:-}"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

log_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
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
    local show_output="${4:-false}"

    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

    log_info "Running $check_name..."

    local temp_log="/tmp/quality-check-$$-$(date +%s).log"

    if eval "$check_cmd" > "$temp_log" 2>&1; then
        log_success "$check_name passed"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        RESULTS+=("✓ $check_name")
        rm -f "$temp_log"
        return 0
    else
        if [ "$is_critical" = "true" ]; then
            log_error "$check_name failed (CRITICAL)"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
            RESULTS+=("✗ $check_name (CRITICAL)")
            if [ "$show_output" = "true" ] || [ -s "$temp_log" ]; then
                echo -e "${RED}Output:${NC}"
                head -n 50 "$temp_log" >&2
            fi
            rm -f "$temp_log"
            return 1
        else
            log_warning "$check_name failed (non-critical)"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
            RESULTS+=("⚠ $check_name (non-critical)")
            if [ "$show_output" = "true" ] && [ -s "$temp_log" ]; then
                echo -e "${YELLOW}Output:${NC}"
                head -n 30 "$temp_log" >&2
            fi
            rm -f "$temp_log"
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
RUN_TS_CHECKS=false
RUN_TEST_CHECKS=false
RUN_ARCH_CHECKS=false

if [ -n "$MODIFIED_FILES" ]; then
    log_info "Modified files detected: $MODIFIED_FILES"

    # Vérifier si des fichiers TypeScript/JavaScript ont été modifiés
    if echo "$MODIFIED_FILES" | grep -qE '\.(ts|tsx|js|jsx)$'; then
        RUN_TS_CHECKS=true
        log_info "TypeScript/JavaScript files modified - running code quality checks"
    fi

    # Vérifier si des fichiers de test ont été modifiés
    if echo "$MODIFIED_FILES" | grep -qE '(test|spec)\.(ts|tsx|js|jsx)$'; then
        RUN_TEST_CHECKS=true
        log_info "Test files modified - running test suite"
    fi

    # Vérifier si des fichiers sources (pas tests) ont été modifiés
    if echo "$MODIFIED_FILES" | grep -qE '\.(ts|tsx|js|jsx)$' && ! echo "$MODIFIED_FILES" | grep -qE '(test|spec)\.(ts|tsx|js|jsx)$'; then
        RUN_ARCH_CHECKS=true
        log_info "Source files modified - running architecture validation"
    fi
else
    log_info "No specific files detected, running all checks"
    RUN_TS_CHECKS=true
    RUN_TEST_CHECKS=true
    RUN_ARCH_CHECKS=true
fi

cd "$PROJECT_DIR"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔧 CONFIGURATION VALIDATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_section "🔧 Configuration Validation"

# Vérification 0.1: Environment Variables Consistency
run_check "Environment Variables" "node scripts/validate-env-vars.cjs" true false

# Vérification 0.2: Package Versions Validity (skip in pre-commit - too slow)
# This validation makes HTTP calls to npm registry which can take 30-60 seconds
# It runs in CI instead (see .github/workflows/validation.yml)
if [ "${SKIP_PACKAGE_VALIDATION:-false}" = "true" ]; then
    log_info "Package validation skipped (too slow for pre-commit) - runs in CI instead"
    RESULTS+=("⊘ Package Versions (skipped - runs in CI)")
    CHECKS_SKIPPED=$((CHECKS_SKIPPED + 1))
else
    run_check "Package Versions" "node scripts/validate-package-versions.cjs" true false
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎨 CODE FORMATTING & LINTING (Staged Files Only)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Détecter si on est dans un contexte Git (pre-commit hook)
if git rev-parse --git-dir > /dev/null 2>&1 && [ -n "$(git diff --cached --name-only)" ]; then
    log_section "🎨 Formatting & Linting (Staged Files)"

    # Vérification 0.3: lint-staged (ESLint + Prettier sur fichiers stagés)
    run_check "Lint-staged (ESLint + Prettier)" "pnpm exec lint-staged" true true
else
    log_info "Not in Git pre-commit context or no staged files - skipping lint-staged"
    RESULTS+=("⊘ Lint-staged (not applicable)")
    CHECKS_SKIPPED=$((CHECKS_SKIPPED + 1))
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔍 STATIC ANALYSIS CHECKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ "$RUN_TS_CHECKS" = true ]; then
    log_section "🔍 Static Analysis"

    # Vérification 1: TypeScript Type Check
    run_check "TypeScript Type Check" "pnpm exec tsc --noEmit" true true

    # Vérification 2: ESLint (Full codebase)
    run_check "ESLint (Full codebase)" "pnpm lint" false true

    # Vérification 3: Prettier Format Check (Full codebase)
    run_check "Prettier Format Check" "pnpm format:check" false false
else
    RESULTS+=("⊘ TypeScript Type Check (skipped)")
    RESULTS+=("⊘ ESLint (skipped)")
    RESULTS+=("⊘ Prettier Format Check (skipped)")
    CHECKS_SKIPPED=$((CHECKS_SKIPPED + 3))
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🏗️ ARCHITECTURE VALIDATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [ "$RUN_ARCH_CHECKS" = true ]; then
    log_section "🏗️ Architecture"

    # Vérification 4: Dependency Cruiser (Architecture validation)
    run_check "Architecture Validation" "pnpm arch:validate" false true
else
    RESULTS+=("⊘ Architecture Validation (skipped)")
    CHECKS_SKIPPED=$((CHECKS_SKIPPED + 1))
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧪 TESTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Skip tests if SKIP_TESTS environment variable is set (e.g., in pre-commit)
if [ "${SKIP_TESTS:-false}" = "true" ]; then
    log_info "Tests skipped (SKIP_TESTS=true) - tests will run in pre-push hook"
    RESULTS+=("⊘ Unit Tests (skipped - will run in pre-push)")
    RESULTS+=("⊘ Code Coverage (skipped - will run in pre-push)")
    CHECKS_SKIPPED=$((CHECKS_SKIPPED + 2))
elif [ "$RUN_TEST_CHECKS" = true ] || [ "$RUN_TS_CHECKS" = true ]; then
    log_section "🧪 Tests"

    # Vérification 5: Tests unitaires (Vitest)
    run_check "Unit Tests (Vitest)" "pnpm test --run" false true

    # Vérification 6: Couverture de code (optionnelle, non bloquante)
    if run_check "Code Coverage" "pnpm test:coverage --run" false false; then
        log_info "Coverage report generated in coverage/"
    fi
else
    RESULTS+=("⊘ Unit Tests (skipped)")
    RESULTS+=("⊘ Code Coverage (skipped)")
    CHECKS_SKIPPED=$((CHECKS_SKIPPED + 2))
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎭 END-TO-END TESTS (Optional - usually too slow for hooks)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Décommenter pour activer les tests E2E (peut être lent)
# if [ "$RUN_TEST_CHECKS" = true ]; then
#     log_section "🎭 E2E Tests"
#     run_check "Playwright E2E Tests" "pnpm test:e2e" false true
# fi

# Nettoyage des fichiers temporaires
rm -f /tmp/quality-check-$$-*.log

# Afficher le rapport final
show_report

# Retourner le code de sortie approprié
if [ $CHECKS_FAILED -gt 0 ]; then
    # Compter le nombre de checks critiques échoués
    critical_failures=$(echo "${RESULTS[@]}" | grep -o "CRITICAL" | wc -l || true)

    if [ "$critical_failures" -gt 0 ]; then
        log_error "$critical_failures critical check(s) failed. Please fix before proceeding."
        exit 1
    else
        log_warning "Some non-critical checks failed. Please review and fix."
        exit 0
    fi
else
    log_success "All quality checks passed! 🎉"
    exit 0
fi
