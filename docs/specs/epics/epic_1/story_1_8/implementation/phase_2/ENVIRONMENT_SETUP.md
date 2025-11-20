# Phase 2 - Environment Setup

This guide covers all environment setup needed for Phase 2.

---

## 📋 Prerequisites

### Previous Phases

- [ ] **Phase 1 completed and validated**
  - `src/i18n/routing.ts` created with `defineRouting()`
  - `src/i18n/request.ts` created with new API
  - `src/i18n/index.ts` barrel export
  - All imports updated to `@/src/i18n`
  - Old `i18n/` folder archived/deleted

### Tools Required

- [ ] Node.js (v18.17+)
- [ ] pnpm (v8+)
- [ ] Git
- [ ] VS Code or preferred editor

### Project State

- [ ] Clean working directory (`git status`)
- [ ] On correct branch for Story 1.8
- [ ] Latest changes pulled

---

## 📦 Dependencies

### Already Installed (from Phase 1)

Phase 2 uses the same dependencies as Phase 1:

- `next-intl` v4.5.3+ - Already installed
- `next` v15+ - Already installed
- `react` v19+ - Already installed

### Verify Installation

```bash
# Check next-intl version
pnpm list next-intl

# Expected output: next-intl@4.5.3 or higher
```

No additional packages needed for Phase 2.

---

## 🔧 Environment Variables

### No New Variables Required

Phase 2 does not require additional environment variables.

Existing `.env.local` should already have any project-specific variables from previous setup.

---

## 📁 Directory Structure Before Phase 2

Ensure this structure exists from Phase 1:

```
src/
└── i18n/
    ├── routing.ts      # defineRouting + navigation
    ├── request.ts      # getRequestConfig
    ├── types.ts        # Type definitions
    └── index.ts        # Barrel exports

messages/
├── fr.json            # French translations
└── en.json            # English translations

app/
├── layout.tsx         # Root layout (to be simplified)
├── page.tsx           # Current homepage (kept for now)
└── globals.css        # Global styles
```

### Directory Structure After Phase 2

```
app/
├── layout.tsx                    # Simplified root layout
├── globals.css                   # Global styles
└── [locale]/
    ├── layout.tsx                # Localized layout with Provider
    ├── not-found.tsx             # Localized 404 page
    └── (test)/
        └── messages-test/
            └── page.tsx          # Translation test page
```

---

## 📝 Message Keys Required

### Error Namespace

Phase 2 requires these keys in `messages/fr.json` and `messages/en.json`:

**messages/fr.json**:
```json
{
  "error": {
    "notFound": "Page non trouvée",
    "notFoundDescription": "La page que vous recherchez n'existe pas.",
    "backHome": "Retour à l'accueil"
  }
}
```

**messages/en.json**:
```json
{
  "error": {
    "notFound": "Page not found",
    "notFoundDescription": "The page you are looking for does not exist.",
    "backHome": "Back to home"
  }
}
```

### Verify Keys Exist

```bash
# Check French
grep -A 3 '"error"' messages/fr.json

# Check English
grep -A 3 '"error"' messages/en.json
```

If keys are missing, add them before starting Phase 2.

---

## 🔍 Pre-Implementation Checks

### TypeScript Configuration

Verify `tsconfig.json` has correct path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Verify Phase 1 Setup

```bash
# Verify src/i18n structure
ls -la src/i18n/

# Expected:
# routing.ts
# request.ts
# types.ts
# index.ts

# Verify imports work
pnpm tsc
```

### Current App Structure

```bash
# Check current app directory
ls -la app/

# Should see:
# layout.tsx
# page.tsx
# globals.css
# (possibly other files)
```

---

## 🚀 Starting Development

### 1. Clean State

```bash
# Ensure clean working directory
git status

# Stash any uncommitted changes if needed
git stash
```

### 2. Create Phase Branch (Optional)

```bash
# Create a branch for Phase 2
git checkout -b story-1.8/phase-2-locale-layout

# Or continue on existing story branch
```

### 3. Start Development Server

```bash
pnpm dev

# Server starts at http://localhost:3000
```

### 4. Verify Current State

Before making changes, verify:

- [ ] `http://localhost:3000` loads (current homepage)
- [ ] No TypeScript errors
- [ ] No console errors

---

## 🧪 Testing Setup

### Unit Tests

```bash
# Run existing tests to ensure nothing is broken
pnpm test
```

### Manual Testing Preparation

Prepare to test these URLs after each commit:

- `http://localhost:3000/fr`
- `http://localhost:3000/en`
- `http://localhost:3000/fr/messages-test`
- `http://localhost:3000/en/messages-test`
- `http://localhost:3000/fr/nonexistent` (404)
- `http://localhost:3000/en/nonexistent` (404)
- `http://localhost:3000/` (redirect)

---

## 🚨 Troubleshooting

### Issue: Phase 1 imports not working

**Symptoms**:
- TypeScript errors on `@/src/i18n` imports
- Module not found errors

**Solutions**:
1. Verify `src/i18n/` structure exists
2. Check `tsconfig.json` paths
3. Restart TypeScript server in VS Code

```bash
# Verify structure
ls -la src/i18n/

# Restart TS server: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Issue: Messages not loading

**Symptoms**:
- Translation keys showing instead of text
- Console errors about missing messages

**Solutions**:
1. Verify message files exist
2. Check JSON syntax
3. Ensure keys match exactly

```bash
# Validate JSON
pnpm exec jsonlint messages/fr.json
pnpm exec jsonlint messages/en.json
```

### Issue: Middleware conflicts

**Symptoms**:
- Redirects not working
- Wrong locale displayed

**Solutions**:
1. Check middleware.ts matcher config
2. Verify routing import path
3. Clear browser cache/cookies

```bash
# View middleware config
cat middleware.ts
```

### Issue: Fonts not loading

**Symptoms**:
- Fallback fonts displaying
- Console errors about fonts

**Solutions**:
1. Verify font imports in layout
2. Check font variable application
3. Ensure globals.css loaded

---

## 📝 Setup Checklist

Complete this checklist before starting implementation:

### Prerequisites
- [ ] Phase 1 completed and validated
- [ ] Clean git working directory
- [ ] On correct branch

### Structure
- [ ] `src/i18n/` exists with all files
- [ ] `messages/fr.json` exists
- [ ] `messages/en.json` exists
- [ ] Error namespace keys present

### Tools
- [ ] Node.js v18.17+
- [ ] pnpm v8+
- [ ] VS Code with TypeScript support

### Verification
- [ ] `pnpm tsc` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm dev` starts without errors
- [ ] Current app loads at localhost:3000

**Environment is ready! 🚀**

---

## 🔗 Quick Reference

### Key Imports for Phase 2

```typescript
// next-intl server
import { getMessages, getTranslations } from 'next-intl/server';

// next-intl client
import { NextIntlClientProvider } from 'next-intl';
import { useTranslations } from 'next-intl';

// Project i18n
import { routing, Link, redirect, usePathname, useRouter } from '@/src/i18n';
```

### Common Commands

```bash
# Development
pnpm dev

# Type checking
pnpm tsc

# Linting
pnpm lint

# Tests
pnpm test

# Build (for final validation)
pnpm build
```
