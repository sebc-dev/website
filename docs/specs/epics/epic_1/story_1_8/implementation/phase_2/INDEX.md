# Phase 2 - Segment [locale] et Layout Provider

**Status**: 🚧 NOT STARTED
**Started**: TBD
**Target Completion**: TBD

---

## 📋 Quick Navigation

### Documentation Structure

```
phase_2/
├── INDEX.md (this file)
├── IMPLEMENTATION_PLAN.md (atomic strategy + commits)
├── COMMIT_CHECKLIST.md (checklist per commit)
├── ENVIRONMENT_SETUP.md (environment setup)
├── validation/
│   └── VALIDATION_CHECKLIST.md
└── guides/
    ├── REVIEW.md (code review guide)
    └── TESTING.md (testing guide)
```

---

## 🎯 Phase Objective

Créer la structure App Router avec segment dynamique `[locale]` et configurer le `NextIntlClientProvider` pour permettre l'internationalisation des Client Components. Cette phase établit les fondations du routing localisé en Next.js 15.

### Scope

- ✅ Layout localisé `app/[locale]/layout.tsx` avec Provider
- ✅ Simplification de `app/layout.tsx` racine
- ✅ Page 404 internationalisée `app/[locale]/not-found.tsx`
- ✅ Mise à jour du middleware pour le nouveau routing
- ✅ Migration de la page de test messages

---

## 📚 Available Documents

| Document                                                                       | Description                        | For Who    | Duration  |
| ------------------------------------------------------------------------------ | ---------------------------------- | ---------- | --------- |
| **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)**                         | Atomic strategy in 5 commits       | Developer  | 15 min    |
| **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)**                               | Detailed checklist per commit      | Developer  | Reference |
| **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**                             | Environment variables & setup      | DevOps/Dev | 10 min    |
| **[guides/REVIEW.md](./guides/REVIEW.md)**                                     | Code review guide                  | Reviewer   | 20 min    |
| **[guides/TESTING.md](./guides/TESTING.md)**                                   | Testing guide (unit + integration) | QA/Dev     | 20 min    |
| **[validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)** | Final validation checklist         | Tech Lead  | 30 min    |

---

## 🔄 Implementation Workflow

### Step 1: Initial Setup

```bash
# Read the PHASES_PLAN.md
cat docs/specs/epics/epic_1/story_1_8/implementation/PHASES_PLAN.md

# Read the atomic implementation plan for this phase
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/IMPLEMENTATION_PLAN.md

# Setup environment
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/ENVIRONMENT_SETUP.md
```

### Step 2: Atomic Implementation (5 commits)

```bash
# Commit 1: Créer app/[locale]/layout.tsx
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 1

# Commit 2: Simplifier app/layout.tsx
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 2

# Commit 3: Créer app/[locale]/not-found.tsx
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 3

# Commit 4: Mettre à jour middleware
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 4

# Commit 5: Migrer messages-test page
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 5
```

### Step 3: Validation

```bash
# Run tests
pnpm test

# Type-checking
pnpm tsc

# Code review
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/guides/REVIEW.md

# Final validation
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_2/validation/VALIDATION_CHECKLIST.md
```

---

## 🎯 Use Cases by Profile

### 🧑‍💻 Developer

**Goal**: Implement the phase step-by-step

1. Read IMPLEMENTATION_PLAN.md (15 min)
2. Follow COMMIT_CHECKLIST.md for each commit
3. Validate after each commit
4. Use TESTING.md to write tests

### 👀 Code Reviewer

**Goal**: Review the implementation efficiently

1. Read IMPLEMENTATION_PLAN.md to understand strategy
2. Use guides/REVIEW.md for commit-by-commit review
3. Verify against VALIDATION_CHECKLIST.md

### 📊 Tech Lead / Project Manager

**Goal**: Track progress and quality

1. Check INDEX.md for status
2. Review IMPLEMENTATION_PLAN.md for metrics
3. Use VALIDATION_CHECKLIST.md for final approval

### 🏗️ Architect / Senior Dev

**Goal**: Ensure architectural consistency

1. Review IMPLEMENTATION_PLAN.md for design decisions
2. Check ENVIRONMENT_SETUP.md for dependencies
3. Validate against next-intl best practices

---

## 📊 Metrics

| Metric                  | Target | Actual |
| ----------------------- | ------ | ------ |
| **Total Commits**       | 5      | -      |
| **Implementation Time** | 4-6h   | -      |
| **Review Time**         | 2-3h   | -      |
| **Test Coverage**       | >80%   | -      |
| **Type Safety**         | 100%   | -      |

---

## ❓ FAQ

**Q: Can I implement multiple commits at once?**
A: Not recommended. Atomic commits allow for easier review and rollback.

**Q: What if I find an issue in a previous commit?**
A: Fix it in the current branch, then consider if it needs a separate commit.

**Q: How do I handle merge conflicts?**
A: Follow the atomic approach - resolve conflicts commit by commit.

**Q: Can I skip tests?**
A: No. Tests ensure each commit is validated and safe.

**Q: What about the messages-test page?**
A: It will be migrated in Commit 5 to ensure the Provider works with Client Components.

---

## 🔗 Important Links

- [Story 1.8 Specification](../../story_1.8.md)
- [PHASES_PLAN.md](../PHASES_PLAN.md)
- [Technical Reference](/docs/tech/cloudflare-workers/cloudflare-nextjs-nextintl.md)
- [Phase 1 - Restructuration i18n](../phase_1/)
- [Phase 3 - Internationalisation Homepage](../phase_3/)

---

## ⚠️ Prerequisites

**Phase 1 must be completed** before starting Phase 2:

- ✅ `src/i18n/routing.ts` created with `defineRouting()`
- ✅ `src/i18n/request.ts` created with new API
- ✅ All imports updated to `@/src/i18n`
- ✅ Old `i18n/` folder archived

---

**Phase 2 establishes the [locale] routing foundation for the entire i18n system!**
