# Phase 2 - Cookie Persistence & i18n Context

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
│ └── VALIDATION_CHECKLIST.md
└── guides/
├── REVIEW.md (code review guide)
└── TESTING.md (testing guide)
```

---

## 🎯 Phase Objective

Implement HTTP cookie handling with secure flags (HttpOnly, SameSite, Secure) and integrate next-intl context initialization to enable components to access translations via `useTranslations()` and `getTranslations()`. This phase bridges the language detection foundation from Phase 1 with the component-level i18n context required for bilingual content rendering.

### Scope

- ✅ Cookie creation with secure flags (HttpOnly, SameSite, Secure)
- ✅ Cookie reading with validation
- ✅ Cookie expiration (1 year TTL)
- ✅ Root path redirection (`/` → `/fr/` or `/en/`)
- ✅ Integration with next-intl `middleware()` function
- ✅ i18n context initialization for `useTranslations()` and `getTranslations()`
- ✅ Type-safe middleware response with correct headers
- ✅ Unit + integration tests for cookie handling

---

## 📚 Available Documents

| Document                                                                       | Description                        | For Who    | Duration  |
| ------------------------------------------------------------------------------ | ---------------------------------- | ---------- | --------- |
| **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)**                         | Atomic strategy in 4 commits       | Developer  | 15 min    |
| **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)**                               | Detailed checklist per commit      | Developer  | Reference |
| **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**                             | Environment variables & setup      | DevOps/Dev | 10 min    |
| **[guides/REVIEW.md](./guides/REVIEW.md)**                                     | Code review guide                  | Reviewer   | 20 min    |
| **[guides/TESTING.md](./guides/TESTING.md)**                                   | Testing guide (unit + integration) | QA/Dev     | 20 min    |
| **[validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)** | Final validation checklist         | Tech Lead  | 30 min    |

---

## 🔄 Implementation Workflow

### Step 1: Initial Setup

```bash
# Read the phase plan
cat docs/specs/epics/epic_1/story_1_3/implementation/PHASES_PLAN.md

# Read the atomic implementation plan for this phase
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_2/IMPLEMENTATION_PLAN.md

# Setup environment
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_2/ENVIRONMENT_SETUP.md
```

### Step 2: Atomic Implementation (4 commits)

```bash
# Commit 1: Implement cookie utility functions
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 1

# Commit 2: Implement root path redirection
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 2

# Commit 3: Integrate next-intl middleware
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 3

# Commit 4: Add unit + integration tests
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_2/COMMIT_CHECKLIST.md # Section Commit 4
```

### Step 3: Validation

```bash
# Run tests
pnpm test

# Type-checking
pnpm tsc

# Linting
pnpm lint

# Code review
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_2/guides/REVIEW.md

# Final validation
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_2/validation/VALIDATION_CHECKLIST.md
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
| **Total Commits**       | 4      | -      |
| **Implementation Time** | 6-8h   | -      |
| **Review Time**         | 3-4h   | -      |
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

- [Phase 1 - Language Detection Foundation](../phase_1/INDEX.md)
- [Story 1.3 Specification](../../story_1.3.md)
- [PHASES_PLAN - Overall Strategy](../PHASES_PLAN.md)
- [Epic 1 Tracking](../../EPIC_TRACKING.md)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
