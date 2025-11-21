# Phase 1 - Restructuration i18n et nouveau routing

**Status**: 🚧 NOT STARTED
**Started**: -
**Target Completion**: TBD

---

## 📋 Quick Navigation

### Documentation Structure

```
phase_1/
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

Créer la nouvelle structure `src/i18n/` conforme aux best practices next-intl 2025, en remplaçant l'implémentation actuelle par une architecture moderne utilisant `defineRouting()`, la nouvelle API `requestLocale`, et des utilitaires de navigation typés.

### Scope

- ✅ Créer `src/i18n/routing.ts` avec `defineRouting()` et navigation typée
- ✅ Créer `src/i18n/request.ts` avec nouvelle API `await requestLocale`
- ✅ Créer barrel export `src/i18n/index.ts` avec types
- ✅ Mettre à jour tous les imports projet
- ✅ Archiver/supprimer ancien dossier `i18n/`

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
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/IMPLEMENTATION_PLAN.md

# Setup environment
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/ENVIRONMENT_SETUP.md
```

### Step 2: Atomic Implementation (5 commits)

```bash
# Commit 1: Créer src/i18n/routing.ts
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/COMMIT_CHECKLIST.md # Section Commit 1

# Commit 2: Créer src/i18n/request.ts
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/COMMIT_CHECKLIST.md # Section Commit 2

# Commit 3: Créer barrel export et types
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/COMMIT_CHECKLIST.md # Section Commit 3

# Commit 4: Mettre à jour imports projet
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/COMMIT_CHECKLIST.md # Section Commit 4

# Commit 5: Archiver ancien dossier i18n
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/COMMIT_CHECKLIST.md # Section Commit 5
```

### Step 3: Validation

```bash
# Run tests
pnpm test

# Type-checking
pnpm tsc --noEmit

# Code review
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/guides/REVIEW.md

# Final validation
cat docs/specs/epics/epic_1/story_1_8/implementation/phase_1/validation/VALIDATION_CHECKLIST.md
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
3. Validate against project standards

---

## 📊 Metrics

| Metric                  | Target | Actual |
| ----------------------- | ------ | ------ |
| **Total Commits**       | 5      | -      |
| **Implementation Time** | 3-4h   | -      |
| **Review Time**         | 1-2h   | -      |
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

---

## 🔗 Important Links

- [Story 1.8 Specification](../../story_1.8.md)
- [PHASES_PLAN.md](../PHASES_PLAN.md)
- [Technical Reference](/docs/tech/cloudflare-workers/cloudflare-nextjs-nextintl.md)
- [Phase 2 - Segment [locale] & Provider](../phase_2/) (next phase)
