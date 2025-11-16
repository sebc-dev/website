# Phase 1 — Language Detection Foundation

**Status**: 🚧 NOT STARTED
**Started**: TBD
**Target Completion**: 1.5–2 days
**Epic**: Epic 1 — Internationalisation (i18n)
**Story**: Story 1.3 — Create Next.js Middleware with next-intl
**Phase Progress**: 1/3

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
│   └── VALIDATION_CHECKLIST.md (final validation)
└── guides/
    ├── REVIEW.md (code review guide)
    └── TESTING.md (testing guide)
```

---

## 🎯 Phase Objective

Implement core language detection logic for Next.js middleware that automatically detects user language preferences from URL paths, HTTP cookies, and browser Accept-Language headers, with proper fallback to default French language and validation against supported locales.

**Key Outcome**: A working middleware (`src/middleware.ts`) that routes users to correct language versions (`/fr/*` or `/en/*`) based on multiple detection sources with proper priority handling.

### Scope

- ✅ Create `src/middleware.ts` with foundational middleware structure
- ✅ Implement URL-based language detection from path prefixes
- ✅ Implement cookie-based language detection (read existing NEXT_LOCALE)
- ✅ Implement browser Accept-Language header parsing with quality values
- ✅ Implement redirect logic for unsupported language codes
- ✅ Type-safe locale validation against allowed locales from `i18n/config.ts`
- ✅ Configure public route exclusions for performance (`/_next/*`, `/api/*`, etc.)
- ✅ Comprehensive unit tests with ≥80% code coverage
- ✅ TypeScript type safety with zero errors

**Not in Scope (Phase 2)**:
- Cookie creation/persistence (Phase 2)
- Root path redirection logic (Phase 2)
- next-intl context initialization (Phase 2)
- Debug logging (Phase 3)
- E2E tests (Phase 3)

---

## 📚 Available Documents

| Document | Description | For Who | Duration |
|----------|-------------|---------|----------|
| **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** | Atomic strategy in 5 commits | Developer | 15 min |
| **[COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md)** | Detailed checklist per commit | Developer | Reference |
| **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** | Environment configuration | DevOps/Dev | 10 min |
| **[guides/REVIEW.md](./guides/REVIEW.md)** | Code review guide | Reviewer | 20 min |
| **[guides/TESTING.md](./guides/TESTING.md)** | Testing guide (unit tests) | QA/Dev | 20 min |
| **[validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)** | Final validation checklist | Tech Lead | 30 min |

---

## 🔄 Implementation Workflow

### Step 1: Initial Setup

```bash
# Read the Phase 1 plan
cat docs/specs/epics/epic_1/story_1_3/implementation/PHASES_PLAN.md

# Read the atomic implementation plan for this phase
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_1/IMPLEMENTATION_PLAN.md

# Setup environment (ensure next-intl is installed from Story 1.1)
cat docs/specs/epics/epic_1/story_1_3/implementation/phase_1/ENVIRONMENT_SETUP.md
```

### Step 2: Atomic Implementation (5 commits)

Follow [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) for each commit in order:

1. **Commit 1: Set up middleware structure and types**
2. **Commit 2: Implement language detection from URL**
3. **Commit 3: Implement language detection from cookie and header**
4. **Commit 4: Implement redirect logic for unsupported languages**
5. **Commit 5: Write comprehensive unit tests**

### Step 3: Validation

```bash
# Run TypeScript type-checking
pnpm tsc --noEmit

# Run linter
pnpm lint

# Run unit tests with coverage
pnpm test:coverage

# Build project
pnpm build
```

All must pass before proceeding to Phase 2.

---

## 🎯 Use Cases by Profile

### 🧑‍💻 Developer

**Goal**: Implement Phase 1 step-by-step

1. Read IMPLEMENTATION_PLAN.md (15 min)
2. Follow COMMIT_CHECKLIST.md for each of the 5 commits
3. Validate after each commit using ENVIRONMENT_SETUP.md
4. Use TESTING.md to write comprehensive unit tests
5. Complete VALIDATION_CHECKLIST.md before phase completion

### 👀 Code Reviewer

**Goal**: Review the implementation efficiently

1. Read IMPLEMENTATION_PLAN.md to understand the 5-commit strategy
2. Use guides/REVIEW.md for commit-by-commit review
3. Verify each commit against VALIDATION_CHECKLIST.md criteria
4. Focus on type safety, language detection logic, test coverage

### 📊 Tech Lead / Project Manager

**Goal**: Track progress and quality

1. Check INDEX.md for current status
2. Review IMPLEMENTATION_PLAN.md for metrics (est. 4–6 commits, ~300–400 lines)
3. Use VALIDATION_CHECKLIST.md for final approval
4. Verify: Unit tests ≥80%, TypeScript zero errors, ESLint passes

### 🏗️ Architect / Senior Dev

**Goal**: Ensure architectural consistency

1. Review IMPLEMENTATION_PLAN.md for design decisions (detection priority, public route exclusion)
2. Check ENVIRONMENT_SETUP.md for dependencies
3. Validate against project standards from `docs/specs/Architecture_technique.md`
4. Ensure middleware works with Cloudflare Workers runtime constraints

---

## 📊 Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| **Total Commits** | 5 | - |
| **Implementation Time** | 4–6h | - |
| **Review Time** | 2–3h | - |
| **Test Coverage** | >80% | - |
| **Type Safety** | 100% (zero errors) | - |
| **Lines of Code** | ~300–400 | - |
| **Test Lines** | ~400–500 | - |

---

## 📋 Acceptance Criteria Covered

This phase directly addresses these acceptance criteria:

- **AC1**: Middleware detects language from URL (`/fr/`, `/en/`)
- **AC2**: Middleware detects language from Accept-Language header with quality values
- **AC3**: Middleware reads and respects NEXT_LOCALE cookie
- **AC4**: Middleware redirects unsupported language codes
- **AC7**: Middleware excludes public routes from processing
- **AC8**: Middleware validates language against supported locales
- **AC12**: Middleware prevents infinite redirects

---

## 🔗 Important Links

### Project Documentation

- **Story Specification**: [story_1.3.md](../../story_1.3.md)
- **Phase Planning**: [PHASES_PLAN.md](../PHASES_PLAN.md)
- **Epic Overview**: [EPIC_TRACKING.md](../../EPIC_TRACKING.md)
- **Technical Architecture**: [docs/specs/Architecture_technique.md](../../../../Architecture_technique.md)

### Key Project Files

- **i18n Configuration**: `i18n/config.ts` (locale types, defaults)
- **i18n Types**: `i18n/types.ts` (type definitions)
- **Project Standards**: `CLAUDE.md` (project conventions, commands)

### Next Phase

- **Phase 2**: Cookie Persistence & i18n Context (depends on Phase 1)
- **Phase 3**: Testing, Edge Cases & Documentation (depends on Phase 1 + Phase 2)

---

## ❓ FAQ

**Q: What if I find an issue in a previous commit?**
A: Fix it in place if not pushed. If already pushed, create a targeted fix commit. Document the issue in commit message.

**Q: Should I run all validations after each commit?**
A: Yes. Follow the validation steps in COMMIT_CHECKLIST.md after each atomic commit. This ensures early detection of issues.

**Q: Can I skip the unit tests?**
A: No. Tests ensure each commit is validated and safe. Phase 1 target is ≥80% coverage.

**Q: What if I need to change the commit order?**
A: Document why in a comment. The order is designed for progressive type-safety and logical dependencies.

**Q: How do I handle Cloudflare Worker runtime constraints?**
A: Avoid Node.js-only APIs (fs, crypto from node). Use Web APIs. See ENVIRONMENT_SETUP.md for details.

---

## ✅ Phase Completion Checklist

This phase is **COMPLETE** when:

- [ ] All 5 atomic commits implemented
- [ ] AC1, AC2, AC3, AC4, AC7, AC8, AC12 verified (unit tests)
- [ ] Unit test coverage ≥80%
- [ ] TypeScript: `pnpm tsc --noEmit` passes (zero errors)
- [ ] ESLint + Prettier: `pnpm lint` passes
- [ ] Build succeeds: `pnpm build`
- [ ] VALIDATION_CHECKLIST.md completed
- [ ] Code reviewed and approved
- [ ] Phase 1 status updated to ✅ COMPLETED
- [ ] Phase 2 can begin (no blockers)

---

## 📝 Getting Started

### For First-Time Readers

1. Start here (INDEX.md) - You are reading it now ✓
2. Read [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) (15 min) - Understand the strategy
3. Follow [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) - Implement commit by commit
4. After each commit, run validations from [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
5. Write tests using [guides/TESTING.md](./guides/TESTING.md)
6. Complete [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md) before phase completion

### For Code Reviewers

1. Read [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) to understand strategy
2. Use [guides/REVIEW.md](./guides/REVIEW.md) for commit-by-commit review
3. Validate against [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md)

---

**Phase 1 Documentation Generated**: 2025-11-16
**Status**: 📋 PLANNING → 🚧 NOT STARTED → 🚀 IN PROGRESS → ✅ COMPLETED
**Ready to Implement**: ✅

---

## 📚 Reference Documents

### Story Context

- **Story Reference**: Epic 1 - Story 1.3
- **User Story**: As a user, I want the website to automatically detect my preferred language and route me to the correct URL
- **Duration Target**: 1.5–2 days for Phase 1 only

### Technical References

- **next-intl docs**: https://next-intl-docs.vercel.app/
- **Next.js middleware**: https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Cloudflare Workers runtime**: https://developers.cloudflare.com/workers/

### Related Stories (Dependencies)

- **Story 1.1** (✅ Completed): Install and configure next-intl library
- **Story 1.2** (✅ Completed): Create message files for fr/en
- **Story 1.4** (Blocked): Bilingual URL structure (depends on this middleware)

---

**Phase 1 Ready for Implementation** ✅
