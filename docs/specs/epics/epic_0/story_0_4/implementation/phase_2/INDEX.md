# Phase 2 - Core Database Schema (Articles & Translations)

**Status**: 🚧 IN PROGRESS
**Started**: 2025-11-08
**Target Completion**: TBD

---

## 📋 Quick Navigation

### Documentation Structure

```
phase_2/
├── INDEX.md (this file)
├── IMPLEMENTATION_PLAN.md (atomic strategy + 6 commits)
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

Define and create the core database schema for the articles and article_translations tables using Drizzle ORM. This phase establishes the foundation for all article-related data in the sebc.dev blog platform, implementing a 1-to-many relationship between articles (shared metadata) and article_translations (language-specific content).

The schema supports bilingual content (FR/EN) with proper foreign key relations, unique constraints to prevent duplicate translations, and ENUM types for complexity and status fields. This phase also includes generating the first database migration and creating comprehensive integration tests to validate schema integrity.

### Scope

- ✅ Define ENUM types for complexity ('beginner', 'intermediate', 'advanced') and status ('draft', 'published')
- ✅ Create `articles` table schema with all required fields (id, categoryId, complexity, status, publishedAt, coverImage, timestamps)
- ✅ Create `article_translations` table schema with FK relation to articles
- ✅ Implement unique constraints (slug per language, one translation per article+language)
- ✅ Generate and apply first Drizzle migration
- ✅ Create sample test data with 1 article + 2 translations (FR + EN)
- ✅ Write integration tests to validate schema constraints and relations

---

## 📚 Available Documents

| Document | Description | For Who | Duration |
|----------|-------------|---------|----------|
| **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** | Atomic strategy in 6 commits | Developer | 15 min |
| **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)** | Detailed checklist per commit | Developer | Reference |
| **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** | Environment variables & setup | DevOps/Dev | 10 min |
| **[guides/REVIEW.md](./guides/REVIEW.md)** | Code review guide | Reviewer | 20 min |
| **[guides/TESTING.md](./guides/TESTING.md)** | Testing guide (unit + integration) | QA/Dev | 20 min |
| **[validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)** | Final validation checklist | Tech Lead | 30 min |

---

## 🔄 Implementation Workflow

### Step 1: Initial Setup
```bash
# Read the PHASES_PLAN.md
cat docs/specs/epics/epic_0/story_0_4/implementation/PHASES_PLAN.md

# Read the atomic implementation plan for this phase
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/IMPLEMENTATION_PLAN.md

# Setup environment
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/ENVIRONMENT_SETUP.md
```

### Step 2: Atomic Implementation (6 commits)
```bash
# Commit 1: Define ENUM types and base constants
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/COMMIT_CHECKLIST.md  # Section Commit 1

# Commit 2: Create articles table schema
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/COMMIT_CHECKLIST.md  # Section Commit 2

# Commit 3: Create article_translations table schema
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/COMMIT_CHECKLIST.md  # Section Commit 3

# Commit 4: Generate and apply first migration
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/COMMIT_CHECKLIST.md  # Section Commit 4

# Commit 5: Create sample insert test data
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/COMMIT_CHECKLIST.md  # Section Commit 5

# Commit 6: Add schema validation integration tests
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/COMMIT_CHECKLIST.md  # Section Commit 6
```

### Step 3: Validation
```bash
# Run tests
pnpm test

# Type-checking
pnpm tsc --noEmit

# Code review
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/guides/REVIEW.md

# Final validation
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_2/validation/VALIDATION_CHECKLIST.md
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

| Metric | Target | Actual |
|--------|--------|--------|
| **Total Commits** | 6 | - |
| **Implementation Time** | 4.5-6.5h | - |
| **Review Time** | 2-3.5h | - |
| **Test Coverage** | >80% | - |
| **Type Safety** | 100% | - |

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

**Q: Why is categoryId nullable in the articles table?**
A: The categories table will be created in Phase 3. We make categoryId nullable initially to avoid FK constraint errors. It will be updated after Phase 3.

---

## 🔗 Important Links

- [Story 0.4 Specification](../../story_0.4.md)
- [PHASES_PLAN.md](../PHASES_PLAN.md)
- [Phase 1 - Drizzle Config](../phase_1/INDEX.md) (prerequisite)
- [Phase 3 - Taxonomy Schema](../phase_3/INDEX.md) (next phase)
- [Epic 0 Tracking](/docs/specs/epics/epic_0/EPIC_TRACKING.md)
