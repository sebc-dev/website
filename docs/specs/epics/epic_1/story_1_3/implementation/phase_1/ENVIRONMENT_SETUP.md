# Phase 1 — Environment Setup

This guide covers all environment setup needed for Phase 1 implementation.

---

## 📋 Prerequisites

### Previous Stories Completed

- [x] **Story 1.1**: next-intl library installed and configured
  - Verify: Check `package.json` for `next-intl` dependency (should be v4.5.3+)
  - Verify: `i18n/config.ts` exists and has locale configuration

- [x] **Story 1.2**: Message files created
  - Verify: `messages/fr.json` exists with French translations
  - Verify: `messages/en.json` exists with English translations

### Tools and Environment

- [x] **Node.js 18+** (project requires for Next.js 15)
  - Verify: `node --version` returns v18.0.0 or higher
  - Verify: `npm --version` returns 8.0.0 or higher

- [x] **pnpm installed** (project uses pnpm as package manager)
  - Verify: `pnpm --version` returns 8.0.0 or higher
  - Verify: `pnpm` is default package manager for project

- [x] **TypeScript configuration** (project uses TypeScript)
  - Verify: `tsconfig.json` exists at project root
  - Verify: TypeScript is installed: `pnpm list typescript`

- [x] **Vitest for testing** (project standard for unit tests)
  - Verify: Vitest installed: `pnpm list vitest`
  - Verify: Test configuration in `vitest.config.ts` or `vite.config.ts`

- [x] **ESLint for linting** (project standard)
  - Verify: ESLint installed: `pnpm list eslint`
  - Verify: ESLint config exists: `.eslintrc.json` or similar

---

## 📦 Dependencies Installation

### Verify Existing Dependencies

All required packages should already be installed from Story 1.1 and Story 1.2:

```bash
# Check next-intl is installed
pnpm list next-intl

# Expected output: next-intl@4.5.3 (or higher)
```

### No New Dependencies Required

Phase 1 uses only existing dependencies:

- **next-intl** — Already installed (Story 1.1)
- **Next.js 15** — Already installed
- **TypeScript** — Already installed
- **Vitest** — Already installed for testing
- **ESLint** — Already installed for linting

### Verification Commands

```bash
# Verify all dev dependencies are installed
pnpm install

# Check project builds successfully
pnpm build

# Verify TypeScript configuration is correct
pnpm tsc --version

# Verify ESLint works
pnpm lint --version
```

**Expected Result**: All commands succeed without errors.

---

## 🔧 Project Structure Verification

Before starting implementation, verify the project structure is as expected:

```bash
# Check project root structure
ls -la

# Expected structure:
# - app/              (Next.js App Router)
# - components/       (React components)
# - i18n/             (i18n configuration)
# - lib/              (utility functions)
# - messages/         (translation files)
# - src/              (source code - where middleware.ts will go)
# - tests/            (Playwright E2E tests)
# - docs/             (documentation)
# - tsconfig.json     (TypeScript config)
# - package.json      (dependencies)
```

### Check i18n Directory

```bash
# Verify i18n setup from Story 1.1
ls -la i18n/

# Expected files:
# - config.ts         (i18n configuration)
# - types.ts          (type definitions)
# - index.ts          (barrel exports)
# - README.md         (usage guide)
```

### Check Messages Directory

```bash
# Verify message files from Story 1.2
ls -la messages/

# Expected files:
# - fr.json           (French translations)
# - en.json           (English translations)
```

---

## 🗂️ Create src/ Directory if Needed

The middleware will be created in `src/middleware.ts`. Verify this directory exists:

```bash
# Check if src/ directory exists
ls -la src/ 2>/dev/null || echo "src/ does not exist"

# If src/ does not exist, create it
mkdir -p src/

# If lib/i18n for tests doesn't exist, create it
mkdir -p src/lib/i18n/
```

---

## ⚙️ TypeScript Configuration

Verify `tsconfig.json` includes middleware support:

```bash
# View current tsconfig.json
cat tsconfig.json
```

Check for these settings:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

If not present, these settings are added automatically by Next.js.

---

## 🧪 Test Configuration

### Verify Vitest is Configured

```bash
# Check if vitest.config.ts or vite.config.ts exists
ls vitest.config.ts 2>/dev/null || echo "Not found"
ls vite.config.ts 2>/dev/null || echo "Not found"

# Check if vitest is configured in package.json
grep -A5 '"test"' package.json
```

### Expected Vitest Configuration

```javascript
// vitest.config.ts or vite.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['vitest.setup.ts'],
  },
});
```

### Verify vitest.setup.ts

```bash
# Check setup file exists
cat vitest.setup.ts

# Should import @testing-library/jest-dom for setup
```

---

## 🚀 Running Project Commands

Before implementation, verify all core commands work:

```bash
# Development server
pnpm dev
# Expected: Next.js server starts on http://localhost:3000

# Build production
pnpm build
# Expected: Build completes successfully

# Run unit tests
pnpm test
# Expected: Test suite runs (may have 0 tests initially)

# Run linter
pnpm lint
# Expected: ESLint passes (or shows fixable issues)

# Type-checking
pnpm tsc --noEmit
# Expected: TypeScript passes with zero errors
```

---

## 📝 Environment Variables

### Development Environment

Next.js development uses `.env.local` or `.env` file. Verify it exists:

```bash
# Check for environment files
ls -la .env* 2>/dev/null || echo "No .env files found"
```

### Required Environment Variables for Phase 1

None required specifically for Phase 1. The i18n system is configured in `i18n/config.ts`.

### Optional: Debug Environment

If you want to enable debug logging (Phase 3 feature):

```bash
# .env.local
DEBUG=i18n:*
```

This is optional and not needed for Phase 1.

---

## 🧪 Local Testing Setup

### Running Vitest in Watch Mode

For rapid development feedback, use watch mode:

```bash
# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Or with UI
pnpm test:ui
```

### Running Specific Test Files

```bash
# Run only middleware tests
pnpm test middleware.test.ts

# Run tests matching pattern
pnpm test --grep "URL detection"
```

---

## 🔍 Cloudflare Workers Compatibility Check

Phase 1 middleware must be compatible with Cloudflare Workers runtime. Verify:

### Check Project Uses OpenNext Adapter

```bash
# Check for @opennextjs/cloudflare in dependencies
pnpm list @opennextjs/cloudflare

# Expected: Should be installed (handles Cloudflare Workers deployment)
```

### Verify Edge Runtime Capability

```bash
# Check next.config.js or next.config.ts for edge runtime settings
grep -i "runtime" next.config.js || grep -i "runtime" next.config.ts

# Next.js should support edge runtime for middleware
```

### Important: Avoid Node.js-Only APIs

When implementing Phase 1, avoid:

- ❌ `import fs from 'fs'` (Node.js file system)
- ❌ `import crypto from 'crypto'` (Node.js crypto)
- ❌ `process.env` in edge runtime (use Web APIs instead)

Use instead:

- ✅ Web Crypto API (`crypto.subtle.*`)
- ✅ Request/Response APIs (Web standard)
- ✅ Environment variables (Cloudflare bindings)

---

## ✅ Pre-Implementation Checklist

Complete this checklist before starting Commit 1:

### Dependencies and Tools

- [ ] Node.js v18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] TypeScript available (`pnpm tsc --version`)
- [ ] Vitest configured (`pnpm list vitest`)
- [ ] ESLint available (`pnpm lint --version`)

### Project Structure

- [ ] `i18n/config.ts` exists with locale config
- [ ] `i18n/types.ts` exists with type definitions
- [ ] `messages/fr.json` exists (French translations)
- [ ] `messages/en.json` exists (English translations)
- [ ] `src/` directory exists (or will create for middleware.ts)

### Verification Commands Pass

- [ ] `pnpm install` succeeds (no errors)
- [ ] `pnpm build` succeeds
- [ ] `pnpm tsc --noEmit` passes (zero errors)
- [ ] `pnpm lint` passes (or shows only fixable issues)
- [ ] `pnpm test` runs (0 tests initially is OK)

### Next.js Configuration

- [ ] `tsconfig.json` configured correctly
- [ ] `next.config.ts` or `next.config.js` exists
- [ ] OpenNext adapter installed for Cloudflare

### Documentation Review

- [ ] Read `story_1.3.md` (story specification)
- [ ] Read `PHASES_PLAN.md` (phase overview)
- [ ] Read `IMPLEMENTATION_PLAN.md` (atomic strategy)
- [ ] Understand 5-commit structure

---

## 🚨 Troubleshooting

### Issue: next-intl Not Installed

**Symptoms**:

- `npm ERR! Cannot find module 'next-intl'`
- Build fails with `next-intl` errors

**Solution**:

```bash
# Install next-intl (should be v4.5.3+)
pnpm add next-intl@latest

# Verify installation
pnpm list next-intl
```

### Issue: TypeScript Errors on src/middleware.ts

**Symptoms**:

- `src/middleware.ts not found` error in TypeScript
- Cannot resolve path `@/i18n`

**Solution**:

```bash
# Ensure src/ directory exists
mkdir -p src/

# Verify tsconfig.json has path aliases
grep -A2 '"paths"' tsconfig.json

# Should see: "@/*": ["./*"]
```

### Issue: Vitest Not Found

**Symptoms**:

- `command not found: vitest`
- Tests won't run

**Solution**:

```bash
# Install Vitest
pnpm add -D vitest

# Verify installation
pnpm list vitest

# Create vitest.config.ts if missing
# (See Vitest Configuration section above)
```

### Issue: ESLint Fails

**Symptoms**:

- ESLint throws errors when running `pnpm lint`
- Cannot find eslint config

**Solution**:

```bash
# Verify ESLint config exists
ls -la .eslintrc.json || ls -la eslint.config.js

# If missing, create basic config or use project defaults
# Most projects have ESLint configured already
```

### Issue: Build Fails

**Symptoms**:

- `pnpm build` fails with errors
- Next.js compilation error

**Solution**:

```bash
# Clean build artifacts
rm -rf .next/

# Reinstall dependencies
pnpm install

# Try building again
pnpm build

# If still fails, check for TypeScript errors
pnpm tsc --noEmit
```

---

## 📝 Verification Checklist

Run this final verification before starting Commit 1:

```bash
# 1. Verify dependencies
echo "=== Dependencies ===" && \
pnpm list next-intl && \
pnpm list vitest && \
pnpm list eslint

# 2. Verify project structure
echo "=== Project Structure ===" && \
ls -la i18n/config.ts && \
ls -la messages/fr.json && \
ls -la messages/en.json

# 3. Verify development tools
echo "=== Development Tools ===" && \
pnpm tsc --version && \
pnpm lint --version && \
pnpm test --version

# 4. Verify builds
echo "=== Build Verification ===" && \
pnpm build

# 5. Verify type checking
echo "=== Type Checking ===" && \
pnpm tsc --noEmit

# 6. Verify linting
echo "=== Linting ===" && \
pnpm lint
```

**If all commands complete successfully, environment is ready!** ✅

---

## 🎯 Environment Ready

Your environment is ready for Phase 1 implementation when:

- [x] All prerequisites (Node.js, pnpm, TypeScript, Vitest, ESLint) verified
- [x] Project structure confirmed (i18n/, messages/, src/)
- [x] All verification commands pass
- [x] Build succeeds
- [x] TypeScript zero errors
- [x] ESLint passes
- [x] No Cloudflare Workers compatibility issues identified

---

**Phase 1 Environment Setup Complete** ✅
