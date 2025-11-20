# Phase 1 - Checklist per Commit

This document provides a detailed checklist for each atomic commit of Phase 1.

---

## 📋 Commit 1: Créer src/i18n/routing.ts

**Files**: `src/i18n/routing.ts`
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Create `src/i18n/` directory
- [ ] Create `src/i18n/routing.ts` file
- [ ] Import `defineRouting` from `next-intl/routing`
- [ ] Import `createNavigation` from `next-intl/navigation`
- [ ] Define routing configuration with:
  - [ ] `locales: ['fr', 'en']`
  - [ ] `defaultLocale: 'fr'`
  - [ ] `localePrefix: 'always'`
- [ ] Create navigation utilities with `createNavigation(routing)`
- [ ] Export `routing` configuration
- [ ] Export `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`

### Code Structure

```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always'
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### Validation

```bash
pnpm tsc --noEmit
```

**Expected Result**: No TypeScript errors

### Review Checklist

#### Configuration
- [ ] Locales array includes both 'fr' and 'en'
- [ ] Default locale is 'fr' (matches project requirement)
- [ ] Locale prefix is 'always' (URLs always have /fr or /en)

#### Exports
- [ ] `routing` object exported
- [ ] All navigation utilities exported: `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`

#### Code Quality
- [ ] No `any` types
- [ ] Clean imports from next-intl
- [ ] No commented code

### Commit Message

```bash
git add src/i18n/routing.ts
git commit -m "♻️ refactor(i18n): create src/i18n/routing.ts with defineRouting

- Add defineRouting with locales FR/EN
- Configure defaultLocale 'fr' and localePrefix 'always'
- Export typed navigation utilities (Link, redirect, etc.)

Part of Phase 1 - Commit 1/5"
```

---

## 📋 Commit 2: Créer src/i18n/request.ts

**Files**: `src/i18n/request.ts`
**Estimated Duration**: 30-45 minutes

### Implementation Tasks

- [ ] Create `src/i18n/request.ts` file
- [ ] Import `getRequestConfig` from `next-intl/server`
- [ ] Import routing config from `./routing`
- [ ] Use new async API with `await requestLocale`
- [ ] Implement locale validation with fallback
- [ ] Dynamic import for messages
- [ ] Export default `getRequestConfig`

### Code Structure

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from request
  let locale = await requestLocale;

  // Validate and fallback
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

### Validation

```bash
pnpm tsc --noEmit
```

**Expected Result**: No TypeScript errors

### Review Checklist

#### API Usage
- [ ] Uses `await requestLocale` (new Next.js 15 API)
- [ ] Does NOT use old `{ locale }` parameter pattern
- [ ] Properly awaits the requestLocale

#### Validation Logic
- [ ] Checks if locale is defined
- [ ] Validates against `routing.locales`
- [ ] Falls back to `routing.defaultLocale`

#### Message Loading
- [ ] Dynamic import for messages
- [ ] Correct path to messages folder
- [ ] Accesses `.default` for JSON import

#### Code Quality
- [ ] No `any` types (except for includes check)
- [ ] Imports from local routing
- [ ] No debug code

### Commit Message

```bash
git add src/i18n/request.ts
git commit -m "♻️ refactor(i18n): create src/i18n/request.ts with new API

- Use await requestLocale (Next.js 15 API)
- Add locale validation with fallback to defaultLocale
- Dynamic import for message files

Part of Phase 1 - Commit 2/5"
```

---

## 📋 Commit 3: Créer barrel export et types

**Files**: `src/i18n/index.ts`, `src/i18n/types.ts`
**Estimated Duration**: 20-30 minutes

### Implementation Tasks

- [ ] Create `src/i18n/types.ts` with Locale type
- [ ] Create `src/i18n/index.ts` barrel export
- [ ] Export `Locale` type from types.ts
- [ ] Re-export `routing`, `locales`, `defaultLocale` from routing.ts
- [ ] Re-export navigation utilities from routing.ts
- [ ] Re-export `getRequestConfig` from request.ts (if needed)

### Code Structure

**types.ts**:
```typescript
import { routing } from './routing';

export type Locale = (typeof routing.locales)[number];
```

**index.ts**:
```typescript
// Types
export type { Locale } from './types';

// Routing configuration
export { routing } from './routing';
export const locales = ['fr', 'en'] as const;
export const defaultLocale = 'fr';

// Navigation utilities
export { Link, redirect, usePathname, useRouter, getPathname } from './routing';

// Request config (for next.config.js)
export { default as getRequestConfig } from './request';
```

### Validation

```bash
pnpm tsc --noEmit
```

**Expected Result**: All exports accessible, no TypeScript errors

### Review Checklist

#### Types
- [ ] `Locale` type correctly inferred from routing
- [ ] Type exported for external use

#### Exports
- [ ] `routing` object exported
- [ ] `locales` constant exported
- [ ] `defaultLocale` constant exported
- [ ] All navigation utilities exported
- [ ] `getRequestConfig` exported

#### Code Quality
- [ ] No circular dependencies
- [ ] Clean re-exports
- [ ] Consistent with project patterns

### Commit Message

```bash
git add src/i18n/types.ts src/i18n/index.ts
git commit -m "✨ feat(i18n): create barrel export and Locale type

- Add types.ts with Locale type from routing
- Create index.ts barrel with all exports
- Export locales, defaultLocale, navigation utilities

Part of Phase 1 - Commit 3/5"
```

---

## 📋 Commit 4: Mettre à jour imports projet

**Files**: `middleware.ts`, various files with i18n imports, possibly `tsconfig.json`
**Estimated Duration**: 45-60 minutes

### Implementation Tasks

- [ ] Update `middleware.ts` to use `src/i18n/routing`
- [ ] Search all files for `@/i18n` or `from 'i18n'` imports
- [ ] Update each import to `@/src/i18n`
- [ ] Update any `lib/i18n` references
- [ ] Check `tsconfig.json` paths if needed
- [ ] Update any test files with old imports
- [ ] Verify messages-test page uses new imports

### Files to Check

```bash
# Find all i18n imports
grep -r "from.*['\"].*i18n" --include="*.ts" --include="*.tsx" .
```

### Validation

```bash
# TypeScript
pnpm tsc --noEmit

# Linting
pnpm lint

# All tests
pnpm test
```

**Expected Result**: All validations pass, no broken imports

### Review Checklist

#### Middleware
- [ ] Imports `routing` from `@/src/i18n/routing`
- [ ] Uses `createMiddleware` from `next-intl/middleware`
- [ ] Passes `routing` to `createMiddleware`

#### Imports Updated
- [ ] No remaining `@/i18n` imports
- [ ] No remaining `from 'i18n'` imports
- [ ] All using `@/src/i18n`

#### Functionality
- [ ] Middleware still chains correctly
- [ ] Locale detection works
- [ ] Existing tests pass

#### Code Quality
- [ ] Consistent import style
- [ ] No unused imports
- [ ] No debug code

### Commit Message

```bash
git add middleware.ts [other files]
git commit -m "♻️ refactor(i18n): update all imports to use src/i18n

- Update middleware to use src/i18n/routing
- Migrate all @/i18n imports to @/src/i18n
- Ensure all tests pass with new structure

Part of Phase 1 - Commit 4/5"
```

---

## 📋 Commit 5: Archiver ancien dossier i18n

**Files**: Delete `i18n/config.ts`, `i18n/types.ts`, `i18n/index.ts`, `i18n/README.md`
**Estimated Duration**: 15-20 minutes

### Implementation Tasks

- [ ] Delete `i18n/config.ts`
- [ ] Delete `i18n/types.ts`
- [ ] Delete `i18n/index.ts`
- [ ] Delete or migrate `i18n/README.md`
- [ ] Remove empty `i18n/` directory
- [ ] Run full validation suite

### Migration Decision

**README.md options**:
1. **Delete**: If content is outdated
2. **Migrate**: If valuable, move to `src/i18n/README.md` and update

### Validation

```bash
# Verify folder removed
ls i18n/ # Should fail (not found)

# Full validation
pnpm tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

**Expected Result**: Build succeeds without old i18n folder

### Review Checklist

#### Cleanup
- [ ] `i18n/config.ts` deleted
- [ ] `i18n/types.ts` deleted
- [ ] `i18n/index.ts` deleted
- [ ] `i18n/README.md` deleted or migrated
- [ ] `i18n/` directory removed

#### Validation
- [ ] No dangling imports
- [ ] TypeScript compiles
- [ ] All tests pass
- [ ] Build succeeds

#### Code Quality
- [ ] No orphaned references
- [ ] Git status clean (only deletions)

### Commit Message

```bash
git add -A
git commit -m "🗑️ chore(i18n): remove old i18n folder

- Delete i18n/config.ts (replaced by src/i18n/routing.ts)
- Delete i18n/types.ts (replaced by src/i18n/types.ts)
- Delete i18n/index.ts (replaced by src/i18n/index.ts)
- Migration to src/i18n complete

Part of Phase 1 - Commit 5/5"
```

---

## ✅ Final Phase Validation

After all commits:

### Complete Phase Checklist

- [ ] All 5 commits completed
- [ ] All tests pass
- [ ] TypeScript compiles
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Old i18n folder removed
- [ ] New src/i18n structure complete

### Final Validation Commands

```bash
# Run all tests
pnpm test

# Run linter
pnpm lint

# Run typecheck
pnpm tsc --noEmit

# Run build
pnpm build
```

### Structure Verification

```bash
# New structure exists
ls -la src/i18n/
# Should show: routing.ts, request.ts, types.ts, index.ts

# Old structure gone
ls i18n/
# Should fail: No such file or directory
```

**Phase 1 is complete when all checkboxes are checked! 🎉**
