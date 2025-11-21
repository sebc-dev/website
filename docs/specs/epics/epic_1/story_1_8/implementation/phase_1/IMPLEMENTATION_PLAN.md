# Phase 1 - Atomic Implementation Plan

**Objective**: Créer la nouvelle structure `src/i18n/` conforme aux best practices next-intl 2025

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **5 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive type-safety** - Types validate at each step
✅ **Tests as you go** - Tests accompany the relevant code
✅ **Continuous documentation** - Each commit can be documented independently

### Global Strategy

```
[routing.ts] → [request.ts] → [barrel+types] → [update imports] → [archive old]
      ↓              ↓              ↓                  ↓                ↓
   100%           100%           100%              100%             100%
  type-safe     async API      exports         compilation        cleanup
```

---

## 📦 The 5 Atomic Commits

### Commit 1: Créer src/i18n/routing.ts

**Files**: `src/i18n/routing.ts`
**Size**: ~60 lines
**Duration**: 30-45 min (implementation) + 15-20 min (review)

**Content**:

- Créer `src/i18n/routing.ts`
- Implémenter `defineRouting()` avec locales FR/EN, defaultLocale 'fr', localePrefix 'always'
- Implémenter `createNavigation()` (anciennement `createSharedPathnamesNavigation`)
- Exporter `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`

**Why it's atomic**:

- Single file, single responsibility: define routing configuration
- No dependencies on other new files
- Can be validated independently with TypeScript

**Technical Validation**:

```bash
pnpm tsc --noEmit
```

**Expected Result**: TypeScript compiles without errors for the new file

**Review Criteria**:

- [ ] `defineRouting()` uses correct locales array `['fr', 'en']`
- [ ] `defaultLocale` is set to `'fr'`
- [ ] `localePrefix` is `'always'`
- [ ] `createNavigation()` exports all required utilities
- [ ] Types are correctly inferred

---

### Commit 2: Créer src/i18n/request.ts

**Files**: `src/i18n/request.ts`
**Size**: ~50 lines
**Duration**: 30-45 min (implementation) + 15-20 min (review)

**Content**:

- Créer `src/i18n/request.ts`
- Utiliser nouvelle API `await requestLocale` (Next.js 15)
- Validation robuste avec fallback sur `defaultLocale`
- Import dynamique des messages `messages/${locale}.json`
- Configuration timeZone et onError optionnels

**Why it's atomic**:

- Single file for request configuration
- Depends only on routing.ts for locale constants
- Can be tested independently

**Technical Validation**:

```bash
pnpm tsc --noEmit
```

**Expected Result**: TypeScript compiles, request config uses new async API

**Review Criteria**:

- [ ] Uses `await requestLocale` (not old `{ locale }` pattern)
- [ ] Validates locale against supported locales
- [ ] Falls back to `defaultLocale` if invalid
- [ ] Dynamic import for messages files
- [ ] Exports `getRequestConfig` correctly

---

### Commit 3: Créer barrel export et types

**Files**: `src/i18n/index.ts`, `src/i18n/types.ts`
**Size**: ~40 lines
**Duration**: 20-30 min (implementation) + 10-15 min (review)

**Content**:

- Créer `src/i18n/index.ts` avec tous les exports
- Créer/migrer `src/i18n/types.ts` avec `Locale` type
- Exporter `Locale`, `locales`, `defaultLocale` depuis routing
- Exporter utilitaires de navigation `Link`, `redirect`, etc.
- Re-exporter `getRequestConfig` depuis request.ts

**Why it's atomic**:

- Aggregation of exports only
- No new logic, just re-exports
- Makes imports cleaner for consumers

**Technical Validation**:

```bash
pnpm tsc --noEmit
```

**Expected Result**: All exports accessible from `@/src/i18n`

**Review Criteria**:

- [ ] All navigation utilities exported
- [ ] `Locale` type exported correctly
- [ ] `locales` array exported
- [ ] `defaultLocale` exported
- [ ] Clean barrel pattern (no circular deps)

---

### Commit 4: Mettre à jour imports projet

**Files**: `middleware.ts`, files with i18n imports, `tsconfig.json` (if needed)
**Size**: ~100-150 lines (across multiple files)
**Duration**: 45-60 min (implementation) + 20-30 min (review)

**Content**:

- Mettre à jour `middleware.ts` pour utiliser `src/i18n/routing`
- Mettre à jour tous les imports `@/i18n` → `@/src/i18n`
- Mettre à jour `lib/i18n/*` si nécessaire
- Vérifier/ajouter alias dans `tsconfig.json` si nécessaire
- Update any components using old i18n imports

**Why it's atomic**:

- Critical migration step
- All changes related to import paths
- Must be done together to maintain compilation

**Technical Validation**:

```bash
pnpm tsc --noEmit
pnpm lint
pnpm test
```

**Expected Result**: All imports resolve correctly, tests pass

**Review Criteria**:

- [ ] Middleware uses routing from `src/i18n/routing`
- [ ] All `@/i18n` imports updated
- [ ] No broken imports anywhere
- [ ] Existing tests still pass
- [ ] TypeScript resolves all modules

---

### Commit 5: Archiver ancien dossier i18n

**Files**: Delete `i18n/config.ts`, `i18n/types.ts`, `i18n/index.ts`, `i18n/README.md`
**Size**: ~-200 lines (deletions)
**Duration**: 15-20 min (implementation) + 10-15 min (review)

**Content**:

- Supprimer `i18n/config.ts`
- Supprimer `i18n/types.ts`
- Supprimer `i18n/index.ts`
- Supprimer ou migrer `i18n/README.md` vers `src/i18n/`
- Valider que tout compile après suppression

**Why it's atomic**:

- Final cleanup step
- Only safe after all imports updated
- Confirms migration complete

**Technical Validation**:

```bash
pnpm tsc --noEmit
pnpm lint
pnpm test
```

**Expected Result**: Project compiles without old i18n folder

**Review Criteria**:

- [ ] Old `i18n/` folder completely removed
- [ ] No dangling imports
- [ ] README migrated if valuable
- [ ] All tests still pass
- [ ] Build succeeds

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Understand requirements fully
2. **Setup environment**: Follow ENVIRONMENT_SETUP.md
3. **Implement Commit 1**: Follow COMMIT_CHECKLIST.md
4. **Validate Commit 1**: Run validation commands
5. **Review Commit 1**: Self-review against criteria
6. **Commit Commit 1**: Use provided commit message
7. **Repeat for commits 2-5**
8. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:

```bash
# TypeScript check
pnpm tsc --noEmit

# Linting
pnpm lint

# Tests (after commit 4+)
pnpm test
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit            | Files   | Lines   | Implementation | Review     | Total      |
| ----------------- | ------- | ------- | -------------- | ---------- | ---------- |
| 1. routing.ts     | 1       | ~60     | 30-45 min      | 15-20 min  | 45-65 min  |
| 2. request.ts     | 1       | ~50     | 30-45 min      | 15-20 min  | 45-65 min  |
| 3. barrel+types   | 2       | ~40     | 20-30 min      | 10-15 min  | 30-45 min  |
| 4. update imports | 5+      | ~100    | 45-60 min      | 20-30 min  | 65-90 min  |
| 5. archive old    | 4       | ~-200   | 15-20 min      | 10-15 min  | 25-35 min  |
| **TOTAL**         | **13+** | **~50** | **2.5-3.5h**   | **1-1.5h** | **3.5-5h** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One thing at a time
- 🧪 **Testable**: Each commit validated
- 📝 **Documented**: Clear commit messages

### For Reviewers

- ⚡ **Fast review**: 10-30 min per commit
- 🔍 **Focused**: Single responsibility to check
- ✅ **Quality**: Easier to spot issues

### For the Project

- 🔄 **Rollback-safe**: Revert without breaking
- 📚 **Historical**: Clear progression in git history
- 🏗️ **Maintainable**: Easy to understand later

---

## 📝 Best Practices

### Commit Messages

Format:

```
♻️ refactor(i18n): short description (max 50 chars)

- Point 1: detail
- Point 2: detail
- Point 3: justification if needed

Part of Phase 1 - Commit X/5
```

Types for this phase: `♻️ refactor`, `✨ feat`, `🔧 config`, `🗑️ chore`

### Review Checklist

Before committing:

- [ ] Code follows project style guide
- [ ] TypeScript compiles without errors
- [ ] No console.logs or debug code
- [ ] Imports are correct

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order (dependencies matter)
- ✅ Validate after each commit
- ✅ Use provided commit messages as template
- ✅ Keep old i18n until commit 5

### Don'ts

- ❌ Skip commits or combine them
- ❌ Commit without running validations
- ❌ Delete old i18n before all imports updated
- ❌ Add features not in the spec

---

## ❓ FAQ

**Q: What if TypeScript fails after commit 1?**
A: Check that `defineRouting` and `createNavigation` are imported correctly from `next-intl/navigation`.

**Q: Can I keep the old i18n as backup?**
A: Yes until commit 5. After that, git history is your backup.

**Q: What if tests fail after updating imports?**
A: Verify all imports point to `@/src/i18n` and that the barrel export is complete.

**Q: Should I update CLAUDE.md in this phase?**
A: No, documentation updates are in Phase 5.
