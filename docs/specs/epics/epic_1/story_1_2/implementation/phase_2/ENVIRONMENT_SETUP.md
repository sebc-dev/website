# Phase 2 - Environment Setup

This guide covers all environment setup needed for Phase 2.

---

## 📋 Prerequisites

### Previous Phases

- [x] Story 1.1 (next-intl installation & configuration) - **COMPLETED**
- [x] Story 1.2 Phase 1 (French translations) - **COMPLETED**

### Required Files from Phase 1

Verify these files exist from Phase 1:

```bash
# Check Phase 1 completion
test -f messages/fr.json && echo "✅ French translations exist"
test -f i18n/config.ts && echo "✅ i18n config exists"
test -f i18n/types.ts && echo "✅ Locale types exist"
```

**Expected output**: All three files should exist and be verified

### Tools Required

- [x] Node.js 18+ (included in project setup)
- [x] pnpm (installed globally)
- [x] TypeScript (dev dependency)
- [x] VS Code or preferred editor (for JSON validation)

### Services Required

None. This phase only requires:

- Dev server running (started with `pnpm dev`)
- No external APIs or databases

---

## 📦 Dependencies

### No New Package Installation Required

Phase 2 reuses existing dependencies from Phase 1:

- `next-intl@4.5.3` - Already installed
- TypeScript - Already configured
- Testing framework (Vitest) - Already configured

### Verify Existing Installation

```bash
# Check next-intl is installed
pnpm list next-intl

# Expected output: next-intl@4.5.3

# Verify it's in package.json
grep "next-intl" package.json
```

---

## 🔧 Environment Variables

### No New Environment Variables Required

Phase 2 uses the same configuration as Phase 1:

- `DEFAULT_LOCALE` - Set in `i18n/types.ts`
- `LOCALES` - Set in `i18n/types.ts`
- Message files loaded directly (no external service)

Verify existing configuration:

```bash
# Check i18n config
cat i18n/config.ts | grep -E "DEFAULT_LOCALE|LOCALES"

# Check types
cat i18n/types.ts | head -20
```

---

## 📝 Project Structure

### Required Directory Structure

Verify the following directories exist:

```bash
# Check directory structure
test -d app && echo "✅ app/ directory exists"
test -d i18n && echo "✅ i18n/ directory exists"
test -d messages && echo "✅ messages/ directory exists"
test -d tests && echo "✅ tests/ directory exists"
```

**Note**: If `messages/` directory doesn't exist, create it:

```bash
mkdir -p messages
```

### File Locations for Phase 2

Phase 2 will create/modify these files:

```
project/
├── messages/
│   ├── fr.json (from Phase 1 - DO NOT MODIFY)
│   └── en.json (Phase 2 - CREATE)
├── tests/
│   ├── messages.test.ts (Phase 2 - CREATE/EXPAND)
│   └── ... (existing test files)
├── app/
│   └── [locale]/
│       └── (test)/
│           └── messages-test/
│               └── page.tsx (Phase 2 - CREATE)
├── i18n/
│   ├── config.ts (Phase 1)
│   ├── types.ts (Phase 1)
│   └── README.md (Phase 2 - CREATE)
└── CLAUDE.md (Phase 2 - UPDATE)
```

---

## 🧪 Test Configuration

### Verify Vitest Setup

```bash
# Check vitest is configured
test -f vitest.config.ts && echo "✅ vitest config exists"

# Check test setup file exists
test -f vitest.setup.ts && echo "✅ Test setup exists"

# Verify test scripts in package.json
grep "\"test\"" package.json | head -5
```

### Run Existing Tests

```bash
# Run all existing tests (should pass)
pnpm test

# Expected: All existing tests pass
# If any fail: Fix before proceeding with Phase 2
```

---

## 📝 Files to Review Before Starting

### 1. Check Phase 1 French Translations

```bash
# View French message file structure
jq 'keys' messages/fr.json

# Expected namespaces: common, nav, footer, form, article, complexity, search, error
```

### 2. Check i18n Configuration

```bash
# Review config
cat i18n/config.ts | head -30
```

**Expected to see**:

- Import of message files (fr.json)
- Configuration with locales
- Message loading logic

### 3. Check Type Definitions

```bash
# Review types
cat i18n/types.ts | head -20
```

**Expected to see**:

- `Locale` type with 'fr' and 'en'
- `DEFAULT_LOCALE` set to 'fr'
- Route configuration

---

## ✅ Pre-Implementation Checklist

Complete this checklist before starting implementation:

- [ ] Node.js version check: `node --version` (should be 18+)
- [ ] pnpm installed: `pnpm --version`
- [ ] Dependencies installed: `pnpm install` (run if uncertain)
- [ ] All Phase 1 files exist:
  - [ ] `messages/fr.json` exists
  - [ ] `i18n/config.ts` exists
  - [ ] `i18n/types.ts` exists
- [ ] Dev server can start: `pnpm dev` (Ctrl+C to stop)
- [ ] Existing tests pass: `pnpm test` (all green)
- [ ] TypeScript compiles: `pnpm tsc` (no errors)
- [ ] Linter passes: `pnpm lint` (no errors)
- [ ] `messages/` directory writable: `touch messages/test.json && rm messages/test.json`

**Environment is ready when all checkboxes are checked! ✅**

---

## 🚨 Troubleshooting

### Issue: `messages/fr.json` doesn't exist

**Symptoms**:

- `test -f messages/fr.json` returns false
- Tests fail with "Cannot find module messages/fr.json"

**Solution**:

1. Run Phase 1 implementation first
2. Verify `messages/fr.json` was created during Phase 1
3. If not: Check Phase 1 documentation for why it wasn't created

**Verify Fix**:

```bash
ls -la messages/fr.json
jq '.' messages/fr.json  # Should show valid JSON
```

---

### Issue: `pnpm test` fails with existing tests

**Symptoms**:

- Some existing tests fail before starting Phase 2
- Error messages about missing modules or type issues

**Solution**:

1. This is a **blocker**. Do not proceed with Phase 2 until existing tests pass
2. Check if there are recent commits that broke tests
3. Run `pnpm install` to ensure dependencies are correct
4. Run `pnpm tsc` to check for type errors

**Verify Fix**:

```bash
pnpm test  # All tests should pass
```

---

### Issue: Can't create `messages/en.json`

**Symptoms**:

- Permission denied when creating file
- File system read-only error

**Solution**:

1. Check directory permissions: `ls -ld messages/`
2. Try creating a test file: `touch messages/test.json`
3. If that fails, fix permissions: `chmod 755 messages/`
4. Delete test file: `rm messages/test.json`

**Verify Fix**:

```bash
touch messages/test.json && rm messages/test.json && echo "✅ Can write to messages/"
```

---

### Issue: TypeScript errors when editing message files

**Symptoms**:

- VS Code shows type errors
- `pnpm tsc` reports type issues
- Red squiggles in editor

**Solution**:

1. These are usually expected during implementation
2. Restart VS Code's TypeScript server: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
3. Ensure `tsconfig.json` is configured correctly
4. Check that imports use correct paths

**Verify Fix**:

```bash
pnpm tsc  # Should pass after fixing imports
```

---

### Issue: Dev server crashes on startup

**Symptoms**:

- `pnpm dev` fails with error
- Port 3000 already in use

**Solution**:

1. Check if dev server already running: `lsof -i :3000`
2. Kill existing process: `kill -9 <PID>`
3. Or use different port: `PORT=3001 pnpm dev`

**Verify Fix**:

```bash
pnpm dev  # Should start without errors
# Visit http://localhost:3000 to verify
# Ctrl+C to stop
```

---

### Issue: JSON files have encoding issues

**Symptoms**:

- Non-ASCII characters (é, ü, etc.) display incorrectly
- JSON validation fails with encoding error

**Solution**:

1. Ensure editor is set to UTF-8: VS Code → Bottom right corner → UTF-8
2. Save file: `Ctrl+S`
3. Verify: `file messages/en.json` (should show UTF-8)

**Verify Fix**:

```bash
file messages/en.json  # Should show "UTF-8 Unicode text"
jq '.' messages/en.json | grep -i "é"  # Should display correctly
```

---

## 📝 Setup Checklist - Quick Reference

```bash
# Step 1: Verify prerequisites
echo "=== Checking Prerequisites ==="
node --version  # Should be v18+
pnpm --version  # Should be installed
test -f messages/fr.json && echo "✅ French translations exist"
test -f i18n/config.ts && echo "✅ i18n config exists"

# Step 2: Verify project state
echo "=== Checking Project State ==="
pnpm install  # Install dependencies
pnpm test  # All tests should pass
pnpm tsc  # Type checking
pnpm lint  # Linting

# Step 3: Verify dev environment
echo "=== Checking Dev Environment ==="
pnpm dev &  # Start server in background
sleep 5
curl http://localhost:3000 > /dev/null && echo "✅ Dev server running"
kill %1  # Stop background job

# All checks should pass
echo "=== Environment Ready ==="
```

Run this script to verify everything is set up correctly.

---

## 🚀 Ready to Implement

When all checks pass, you're ready to:

1. Read `IMPLEMENTATION_PLAN.md` (15 min)
2. Start with Commit 1 (English translations for common/nav/footer)
3. Follow `COMMIT_CHECKLIST.md` for each commit
4. Use `TESTING.md` for test implementation guidance
5. Reference `REVIEW.md` for code review guidelines

**Happy implementing! 🎉**
