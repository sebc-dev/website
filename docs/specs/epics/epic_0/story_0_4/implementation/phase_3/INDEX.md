# Phase 3 - Taxonomy Schemas (Categories, Tags, ArticleTags)

**Status**: 🚧 NOT STARTED
**Started**: TBD
**Target Completion**: TBD

---

## 📋 Quick Navigation

### Documentation Structure

```
phase_3/
├── INDEX.md (this file)
├── IMPLEMENTATION_PLAN.md (atomic strategy + 5 commits)
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

This phase establishes the taxonomy foundation for sebc.dev by defining the database schemas for categories, tags, and the article-tag relationship. It includes creating the `categories`, `tags`, and `articleTags` junction tables, updating the foreign key relationship from `articles.categoryId` to `categories.id`, generating and applying the migration, and creating a seed script for the 9 canonical categories that form the content classification system.

The phase delivers a complete taxonomy layer that enables articles to be classified by a single category (from 9 predefined options) and tagged with multiple flexible tags, providing both structured navigation and flexible content discovery.

### Scope

- ✅ Define `categories` table schema (9 canonical categories with bilingual names, slugs, icons, colors)
- ✅ Define `tags` table schema (bilingual tag names, flexible taxonomy)
- ✅ Define `articleTags` junction table (Many-to-Many relationship with composite primary key)
- ✅ Establish foreign key from `articles.categoryId` to `categories.id` (if nullable in Phase 2)
- ✅ Generate and apply migration for all 3 taxonomy tables
- ✅ Create comprehensive seed script for 9 canonical categories with metadata
- ✅ Execute seed successfully and validate data integrity
- ✅ Integration tests for taxonomy operations

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
cat docs/specs/epics/epic_0/story_0_4/implementation/PHASES_PLAN.md

# Read the atomic implementation plan for this phase
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/IMPLEMENTATION_PLAN.md

# Setup environment
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/ENVIRONMENT_SETUP.md
```

### Step 2: Atomic Implementation (5 commits)

```bash
# Commit 1: Define categories table schema
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/COMMIT_CHECKLIST.md  # Section Commit 1

# Commit 2: Define tags and articleTags tables
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/COMMIT_CHECKLIST.md  # Section Commit 2

# Commit 3: Generate and apply taxonomy migration
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/COMMIT_CHECKLIST.md  # Section Commit 3

# Commit 4: Create seed script for 9 canonical categories
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/COMMIT_CHECKLIST.md  # Section Commit 4

# Commit 5: Add integration tests for taxonomy
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/COMMIT_CHECKLIST.md  # Section Commit 5
```

### Step 3: Validation

```bash
# Run tests
pnpm test:integration

# Type-checking
pnpm tsc --noEmit

# Code review
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/guides/REVIEW.md

# Final validation
cat docs/specs/epics/epic_0/story_0_4/implementation/phase_3/validation/VALIDATION_CHECKLIST.md
```

---

## 🎯 Use Cases by Profile

### 🧑‍💻 Developer

**Goal**: Implement the phase step-by-step

1. Read IMPLEMENTATION_PLAN.md (15 min)
2. Follow COMMIT_CHECKLIST.md for each commit
3. Validate after each commit
4. Use TESTING.md to write integration tests

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

1. Review IMPLEMENTATION_PLAN.md for schema design
2. Check ENVIRONMENT_SETUP.md for dependencies
3. Validate seed data matches UX/UI spec requirements

---

## 📊 Metrics

| Metric                   | Target   | Actual |
| ------------------------ | -------- | ------ |
| **Total Commits**        | 5        | -      |
| **Implementation Time**  | 3-5h     | -      |
| **Review Time**          | 1.5-2.5h | -      |
| **Test Coverage**        | >80%     | -      |
| **Type Safety**          | 100%     | -      |
| **Canonical Categories** | 9        | -      |

---

## ❓ FAQ

**Q: Can I implement multiple commits at once?**
A: Not recommended. Atomic commits allow for easier review and rollback. Each commit should be validated independently.

**Q: What if I find an issue in a previous commit?**
A: Fix it in the current branch, then consider if it needs a separate commit or amendment (if not yet pushed).

**Q: How do I handle merge conflicts?**
A: Follow the atomic approach - resolve conflicts commit by commit. Use migration history to understand dependencies.

**Q: Can I skip the seed script?**
A: No. The 9 canonical categories are required for the taxonomy system and are referenced by the UX/UI specification.

**Q: What if I need to change a category after seeding?**
A: Categories are modifiable but not deletable. Create a new migration to update category metadata.

---

## 🔗 Important Links

- [Story Specification](../story_0.4.md)
- [Phases Plan](../implementation/PHASES_PLAN.md)
- [Phase 2: Core Schema](../phase_2/INDEX.md) (prerequisite)
- [Phase 4: Validation Chain](../phase_4/INDEX.md) (next phase)
- [Architecture Documentation](/docs/specs/Architecture_technique.md)
- [UX/UI Specification](/docs/specs/UX_UI_Spec.md) (category icons/colors)
