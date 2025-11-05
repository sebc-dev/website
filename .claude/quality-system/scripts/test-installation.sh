#!/usr/bin/env bash
# Script de test pour vérifier l'installation du système de qualité

set -euo pipefail

echo "🧪 Testing Quality System Installation"
echo "========================================"
echo ""

# Compteur de tests
TESTS_PASSED=0
TESTS_FAILED=0

# Fonction de test
test_file_exists() {
    local file="$1"
    local description="$2"

    if [ -f "$file" ]; then
        echo "✅ $description: OK"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "❌ $description: FAILED - File not found: $file"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

test_file_executable() {
    local file="$1"
    local description="$2"

    if [ -x "$file" ]; then
        echo "✅ $description: OK"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo "❌ $description: FAILED - File not executable: $file"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

test_json_valid() {
    local file="$1"
    local description="$2"

    if command -v jq &> /dev/null; then
        if jq empty "$file" 2>/dev/null; then
            echo "✅ $description: OK"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo "❌ $description: FAILED - Invalid JSON"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo "⊘ $description: SKIPPED - jq not installed"
    fi
}

echo "📁 Testing File Structure..."
echo "----------------------------"

test_file_exists ".claude/settings.json" "Settings configuration"
test_file_exists ".claude/quality-system/hooks/quality-check.sh" "Quality check hook script"
test_file_exists ".claude/quality-system/skills/quality-report/SKILL.md" "Quality report skill definition"
test_file_exists ".claude/quality-system/skills/quality-report/scripts/generate-quality-report.sh" "Report generation script"
test_file_exists ".claude/quality-system/skills/quality-report/resources/report-template.md" "Report template"
test_file_exists ".claude/quality-system/docs/README.md" "Documentation"

echo ""
echo "🔒 Testing Permissions..."
echo "-------------------------"

test_file_executable ".claude/quality-system/hooks/quality-check.sh" "Hook script executable"
test_file_executable ".claude/quality-system/skills/quality-report/scripts/generate-quality-report.sh" "Report script executable"

echo ""
echo "📋 Testing Configuration..."
echo "---------------------------"

test_json_valid ".claude/settings.json" "Settings JSON validity"

# Vérifier que le hook est bien configuré
if grep -q "PostToolUse" .claude/settings.json; then
    echo "✅ PostToolUse hook configured: OK"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ PostToolUse hook configured: FAILED"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Vérifier le frontmatter du skill
if grep -q "^name:" .claude/quality-system/skills/quality-report/SKILL.md; then
    echo "✅ Skill frontmatter present: OK"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ Skill frontmatter present: FAILED"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""
echo "🔍 Testing Dependencies..."
echo "--------------------------"

# Vérifier les commandes nécessaires
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm installed: OK"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ pnpm installed: FAILED"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

if command -v jq &> /dev/null; then
    echo "✅ jq installed: OK (optional but recommended)"
else
    echo "⚠️ jq not installed: Some features will be limited"
fi

echo ""
echo "========================================"
echo "📊 Test Results"
echo "========================================"
echo "✅ Passed: $TESTS_PASSED"
echo "❌ Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 All tests passed! The quality system is properly installed."
    echo ""
    echo "Next steps:"
    echo "1. Restart Claude Code to load the new configuration"
    echo "2. Try editing a TypeScript file to trigger the hook"
    echo "3. Ask Claude: 'Génère-moi un rapport de qualité du code'"
    exit 0
else
    echo "⚠️ Some tests failed. Please review the errors above."
    exit 1
fi
