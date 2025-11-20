# Phase 5: Tests & Documentation - Environment Setup

**Story**: 1.8 - Correction Architecture next-intl et Internationalisation des Pages
**Phase**: 5 of 5

---

## Prerequisites

### Required Software

- Node.js 20+
- pnpm 9+
- Git

### Required Dependencies

All dependencies should already be installed from previous phases:

```bash
# Verify installation
pnpm list next-intl vitest playwright
```

### Required Phase Completion

- [x] Phase 1: Structure `src/i18n/` created
- [x] Phase 2: Layout `[locale]` with Provider
- [x] Phase 3: Homepage internationalized
- [x] Phase 4: SEO metadata

---

## Environment Verification

### 1. Check Project State

```bash
# Verify no pending changes
git status

# Verify TypeScript compiles
pnpm tsc --noEmit

# Verify lint passes
pnpm lint
```

### 2. Verify i18n Structure

```bash
# Check src/i18n exists
ls -la src/i18n/

# Expected output:
# routing.ts
# request.ts
# index.ts
# types.ts
```

### 3. Verify Message Files

```bash
# Check message files
ls -la messages/

# Verify namespaces
cat messages/fr.json | grep -E '"(home|metadata)"'
cat messages/en.json | grep -E '"(home|metadata)"'
```

### 4. Verify App Structure

```bash
# Check locale structure
ls -la app/[locale]/

# Expected:
# layout.tsx
# page.tsx
# not-found.tsx
```

---

## Testing Environment Setup

### Unit Tests (Vitest)

```bash
# Verify Vitest is configured
pnpm test --run --reporter=verbose

# Check coverage setup
pnpm test:coverage
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers if needed
pnpm exec playwright install

# Verify Playwright works
pnpm test:e2e --project=chromium tests/home.spec.ts
```

### Test Directory Structure

```
src/i18n/__tests__/          # Unit tests for i18n
tests/                        # E2E tests
  └── home.spec.ts           # Homepage tests
```

---

## Documentation Environment

### Files to Update

```
CLAUDE.md                     # Main project documentation
src/i18n/README.md           # i18n documentation
```

### Documentation Standards

- Use Markdown
- Include code examples
- Keep consistent formatting
- Update dates when modified

---

## Build Environment

### Local Build

```bash
# Run production build
pnpm build

# Check build output
ls -la .next/
```

### Preview Environment

```bash
# Start preview server (Cloudflare Workers)
pnpm preview

# Test at http://127.0.0.1:8788
```

---

## Common Issues & Solutions

### Issue: TypeScript Errors

```bash
# Check for type errors
pnpm tsc --noEmit

# Solution: Fix type definitions or imports
```

### Issue: E2E Tests Fail to Start

```bash
# Install browsers
pnpm exec playwright install chromium

# Increase timeout in playwright.config.ts
```

### Issue: Build Fails

```bash
# Clear cache
rm -rf .next

# Rebuild
pnpm build
```

### Issue: Preview Server Fails

```bash
# Check wrangler config
cat wrangler.jsonc

# Ensure D1 database exists
pnpm exec wrangler d1 list
```

---

## Environment Variables

No additional environment variables required for this phase.

Existing variables should be in place from previous phases.

---

## IDE Setup

### Recommended Extensions (VS Code)

- Vitest extension for test running
- Playwright extension for E2E tests
- Markdown preview for documentation

### Test Running

```json
// .vscode/settings.json
{
  "vitest.enable": true,
  "playwright.testDir": "tests"
}
```

---

## Verification Commands Summary

```bash
# Full verification before starting
pnpm tsc --noEmit && pnpm lint && pnpm test && pnpm build

# Quick check
pnpm tsc --noEmit && pnpm test --run
```

---

**Created**: 2025-11-20
**Last Updated**: 2025-11-20
