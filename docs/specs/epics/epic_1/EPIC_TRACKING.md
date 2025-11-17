# Epic 1 - Internationalisation (i18n)

**Status**: 📋 PLANNING
**Created**: 2025-11-16
**Target Completion**: TBD

---

## 📖 Epic Overview

### Description

This epic implements comprehensive internationalization (i18n) for the entire website, enabling full bilingual support (French/English) with seamless language switching, persistent user preferences, and SEO-optimized bilingual URLs. The implementation uses next-intl as the foundation, providing type-safe translations, automatic language detection, and integration with Next.js 15 App Router patterns including Server Components and middleware.

### Epic Objectives

- Enable bilingual UI with French and English support throughout the application
- Implement automatic language detection based on browser preferences with cookie persistence
- Create SEO-optimized bilingual URL structure (`/fr/*` and `/en/*`)
- Provide seamless content fallback when translations are missing
- Ensure proper SEO metadata with hreflang and canonical tags
- Deliver accessible language switching UI component

### User Value

Users can access the entire website in their preferred language, with the system automatically detecting their browser language and remembering their choice. When content is unavailable in their preferred language, they receive clear indicators and can easily switch to view available translations. Search engines properly index bilingual content with correct hreflang annotations, improving international discoverability.

---

## 📚 Stories in This Epic

This epic contains **7 stories** as defined in the PRD:

| Story | Title                           | Description                                                        | Status         | Phases | Progress             |
| ----- | ------------------------------- | ------------------------------------------------------------------ | -------------- | ------ | -------------------- |
| 1.1   | Install and configure next-intl | Set up next-intl library and basic configuration                   | 🚧 IN PROGRESS | 3      | 1/3                  |
| 1.2   | Create message files            | Create `messages/fr.json` and `messages/en.json` translation files | 📋 PLANNING    | 2      | 1/2                  |
| 1.3   | Create Next.js middleware       | Implement middleware with next-intl for routing                    | 🚧 IN PROGRESS | 3      | 2/3 (P3: Commit 1/4) |
| 1.4   | Bilingual URL structure         | Implement route groups with language detection and cookie support  | 📋 NOT STARTED | -      | 0/0                  |
| 1.5   | Content fallback                | Add language badges and FR/EN toggle for missing translations      | 📋 NOT STARTED | -      | 0/0                  |
| 1.6   | SEO hreflang + canonical        | Implement SEO metadata via Next.js Metadata API                    | 📋 NOT STARTED | -      | 0/0                  |
| 1.7   | Language selector in header     | Create header component with cookie persistence                    | 📋 NOT STARTED | -      | 0/0                  |

**Columns Explained**:

- **Story**: Reference ID (e.g., 1.1, 1.2)
- **Title**: Story name from PRD
- **Description**: One-line summary of what the story delivers
- **Status**: 📋 NOT STARTED → 🚧 IN PROGRESS → ✅ COMPLETED
- **Phases**: Number of phases when story is planned (empty until /plan-story is run)
- **Progress**: Completed phases out of total (e.g., "2/5" = 2 of 5 phases done)

---

## 🎯 Story Management

### How Stories Progress

For each story in the epic:

1. **Plan Phase** (use `/plan-story`)
   - Story spec created: `story_1_Y/story_1.Y.md`
   - Phases plan created: `story_1_Y/implementation/PHASES_PLAN.md`
   - Update this table: Set **Phases** column to phase count (e.g., "5")
   - Update **Status** to 🚧 IN PROGRESS

2. **Implement Phases** (use `phase-doc-generator` + `phase-implementer`)
   - Generate detailed phase docs
   - Implement phases one at a time
   - Update **Progress** column as each phase completes (e.g., "1/5" → "2/5" → ...)

3. **Complete Story**
   - All phases completed
   - Update **Status** to ✅ COMPLETED
   - Update **Progress** to final (e.g., "5/5")

### Quick Actions

```bash
# Initialize a story in this epic
/plan-story Epic 1 Story 1.Y

# Generate docs for a phase
/generate-phase-doc Epic 1 Story 1.Y Phase N

# Check epic progress at any time
cat docs/specs/epics/epic_1/EPIC_TRACKING.md
```

---

## 📊 Epic-Level Metrics

### Progress Summary

- **Stories Started**: 2 / 7 (Stories 1.1, 1.2 in progress; 1.3 in progress)
- **Stories Completed**: 0 / 7
- **Total Phases**: 8 (Story 1.1: 3, Story 1.2: 2, Story 1.3: 3)
- **Phases Completed**: 2 / 8 (Phase 3 in progress: Commit 1/4 done)

**Completion**: 31% (Story 1.1: 1/3, Story 1.3: 2/3 phases complete, Phase 3 at 25%)

### Timeline

- **Epic Created**: 2025-11-16
- **Expected Start**: TBD
- **Expected Completion**: TBD
- **Actual Completion**: TBD

---

## 🔄 Epic Dependencies

### Dependencies Between Stories

The stories in this epic have the following dependency chain:

- **Story 1.1** (next-intl installation) must be completed before all other stories
- **Story 1.2** (message files) must be completed before Stories 1.4, 1.5, 1.7 (they need translations)
- **Story 1.3** (middleware) must be completed before Story 1.4 (URL structure relies on middleware)
- **Story 1.4** (URL structure) should be completed before Stories 1.5, 1.6, 1.7 (foundation for routing)
- Stories 1.5, 1.6, 1.7 can be implemented in parallel once dependencies are met

**Recommended Implementation Order**:

1. Story 1.1 (next-intl setup)
2. Story 1.2 (message files)
3. Story 1.3 (middleware)
4. Story 1.4 (URL structure)
5. Stories 1.5, 1.6, 1.7 (parallel - fallback, SEO, language selector)

### External Dependencies

- Next.js 15 App Router must be set up (Epic 0)
- Route structure in `app/` directory must exist
- Basic layout and navigation components must exist

---

## 📝 Status Updates

Track epic-level milestones here:

- [ ] **Milestone 1**: Core i18n infrastructure complete (Stories 1.1-1.4) - Target: TBD
- [ ] **Milestone 2**: User-facing features complete (Stories 1.5, 1.7) - Target: TBD
- [ ] **Milestone 3**: SEO optimization complete (Story 1.6) - Target: TBD
- [ ] **Milestone 4**: Full epic validation and testing - Target: TBD

### Recent Updates

- 2025-11-16: Epic 1 initialized via epic-initializer skill
- No implementation started yet

---

## 🔗 Reference Documents

### Story Specifications

Stories will be linked here as they are planned:

- Story 1.1: `docs/specs/epics/epic_1/story_1_1/story_1.1.md` ✅
- Story 1.2: `docs/specs/epics/epic_1/story_1_2/story_1.2.md` ✅
- Story 1.3: `docs/specs/epics/epic_1/story_1_3/story_1.3.md` ✅
- Story 1.4: `docs/specs/epics/epic_1/story_1_4/story_1.4.md` (not yet created)
- Story 1.5: `docs/specs/epics/epic_1/story_1_5/story_1.5.md` (not yet created)
- Story 1.6: `docs/specs/epics/epic_1/story_1_6/story_1.6.md` (not yet created)
- Story 1.7: `docs/specs/epics/epic_1/story_1_7/story_1.7.md` (not yet created)

### Phase Plans

Phase plans will be linked here as stories are planned:

- Story 1.1: `docs/specs/epics/epic_1/story_1_1/implementation/PHASES_PLAN.md` ✅ (3 phases)
- Story 1.2: `docs/specs/epics/epic_1/story_1_2/implementation/PHASES_PLAN.md` ✅ (2 phases)
- Story 1.3: `docs/specs/epics/epic_1/story_1_3/implementation/PHASES_PLAN.md` ✅ (3 phases)

### Related Documentation

- **PRD**: `docs/specs/PRD.md` (Epic 1 section: lines 639-647)
- **Functional Requirements**:
  - EF19: Internationalisation UI (lines 202-211)
  - EF20: Structure d'URL bilingue (lines 213-221)
  - EF21: Fallback de contenu (lines 223-230)
  - EF22: SEO hreflang (lines 232-240)
  - EF23: Admin multilingue (lines 242-250)
- **Technical Principles**: Lines 1027-1051 (Principes architecturaux Next.js/Cloudflare)
- **Brief**: `docs/specs/Brief.md` (project context)
- **Concept**: `docs/specs/Concept.md` (vision and personas)

---

## 📋 Checklists

### Epic Setup

- [x] EPIC_TRACKING.md created
- [x] All stories from PRD added to table
- [x] Dependencies documented
- [ ] Team review completed

### During Epic Execution

- [x] First story planned (/plan-story)
- [x] First phase completed
- [x] First phase validated
- [x] Metrics updated

### Epic Completion

- [ ] All stories planned
- [ ] All stories in progress
- [ ] All stories completed
- [ ] Integration testing completed
- [ ] i18n functionality validated across site
- [ ] SEO validation completed (hreflang, canonical)
- [ ] Browser language detection tested
- [ ] Cookie persistence verified
- [ ] Content fallback scenarios tested
- [ ] Ready for production

---

**Epic Initialized**: 2025-11-16
**Last Updated**: 2025-11-16
**Created by**: Claude Code (epic-initializer skill)

---

## 📝 Recent Updates

- **2025-11-17**: Story 1.3 Phase 3 - Commit 1/4 completed ✅
  - E2E Test Suite - Core Scenarios implemented
  - Files created: `tests/middleware.spec.ts` (23+ test cases), `tests/fixtures/i18n.ts` (Playwright fixtures)
  - Updated `playwright.config.ts` for production build testing
  - Test coverage: All AC 1-8 verified with 15+ test scenarios
  - Tests cover: URL detection, Accept-Language header, cookie detection, unsupported language redirects, root path redirection, next-intl context, public route exclusion, language validation
  - Validation: TypeScript ✅, Prettier ✅, ESLint ✅
  - Commit: `0d87833` + formatting commit `9474203`
  - Story 1.3 Phase 3 progress: Commit 1/4 (25% of Phase 3)
  - Next: Commit 2/4 - Edge Cases & Mobile Testing
- **2025-11-17**: Story 1.3 Phases 1 & 2 completed ✅
  - Phase 1 (Language Detection Foundation): COMPLETED
    - 5 commits implemented: middleware structure & types → URL detection → cookie & header detection → redirect logic → unit tests
    - Language detection working from URL, cookie, browser header with fallback to default
    - Redirect logic handling unsupported languages (307 status)
    - Public route exclusion configured
    - Unit tests passing with >80% coverage
    - All AC 1-8 satisfied
  - Phase 2 (Cookie Persistence & i18n Context): COMPLETED
    - Cookie creation with secure flags (HttpOnly, SameSite=Lax, Secure in production, 1yr TTL)
    - Root path redirection logic (`/` → `/fr/` or `/en/`)
    - next-intl middleware integration for i18n context
    - Components can now use `useTranslations()` and `getTranslations()`
    - Integration tests passing
    - All AC 5-6, 9 satisfied
  - Story 1.3 progress: 2/3 phases complete (67% done)
  - Ready for Phase 3: E2E testing, edge cases, debug logging, documentation
- **2025-11-17**: Story 1.3 Phase 3 documentation generated (7 comprehensive documents)
  - Generated complete implementation documentation for Testing, Edge Cases & Documentation phase
  - 4 atomic commits planned: E2E core tests → edge cases & mobile → debug logging & performance → documentation
  - Documents: INDEX.md, IMPLEMENTATION_PLAN.md, COMMIT_CHECKLIST.md, ENVIRONMENT_SETUP.md, guides (REVIEW.md, TESTING.md), validation/VALIDATION_CHECKLIST.md
  - Total: ~3,800 lines of professional documentation
  - E2E testing strategy: 25+ Playwright tests covering all AC 1-12
  - Performance target: <50ms on Cloudflare edge
  - Debug logging: Environment flag control, production-safe
  - Complete middleware documentation (~570 lines)
  - Ready for Phase 3 implementation (4 commits, 3.5-5h, >80% E2E coverage)
  - **Story 1.3 ready for final implementation phase**
- **2025-11-16**: Story 1.3 Phase 1 documentation generated (7 comprehensive documents)
  - Generated complete implementation documentation for Language Detection Foundation phase
  - 5 atomic commits planned: middleware structure & types → URL detection → cookie & header detection → redirect logic → unit tests
  - Documents: INDEX.md, IMPLEMENTATION_PLAN.md, COMMIT_CHECKLIST.md, ENVIRONMENT_SETUP.md, guides (REVIEW.md, TESTING.md), validation/VALIDATION_CHECKLIST.md
  - Total: ~3,500 lines of professional documentation
  - Ready for Phase 1 implementation (5 commits, 4-6 hours, ≥80% test coverage)
- **2025-11-16**: Story 1.2 Phase 2 documentation generated (7 comprehensive documents)
  - Generated complete implementation documentation for English Translations & Parity Validation phase
  - 4 atomic commits planned: English translations (common/nav/footer) → English (form/article/search/error) → parity tests → test page & docs
  - Documents: INDEX.md, IMPLEMENTATION_PLAN.md, COMMIT_CHECKLIST.md, ENVIRONMENT_SETUP.md, guides (REVIEW.md, TESTING.md), validation/VALIDATION_CHECKLIST.md
  - Total: ~3,400 lines of professional documentation
  - Ready for Phase 2 implementation
- **2025-11-16**: Story 1.2 Phase 1 documentation generated (7 comprehensive documents)
  - Generated complete implementation documentation for Message File Structure & French Translations phase
  - 4 atomic commits planned: structure → French common/nav/footer → French forms/articles/search/errors → tests & config
  - Documents: INDEX.md, IMPLEMENTATION_PLAN.md, COMMIT_CHECKLIST.md, ENVIRONMENT_SETUP.md, guides (REVIEW.md, TESTING.md), validation/VALIDATION_CHECKLIST.md
  - Total: ~3,200 lines of professional documentation
  - Ready for Phase 1 implementation
- **2025-11-16**: Story 1.2 specification and phase plan created (2 phases: Message Files + Parity Validation)
  - Detailed story specification with requirements, acceptance criteria, and testing strategy
  - Phase breakdown: Phase 1 (French translations) and Phase 2 (English + parity validation)
  - Total estimated translation keys: 50-80 across 8 namespaces
- **2025-11-16**: Story 1.1 Phase 2 documentation generated (7 comprehensive documents)
  - Generated complete implementation documentation for Configuration phase
  - 5 atomic commits planned: structure → types → config → TypeScript → docs
  - Documents: INDEX.md, IMPLEMENTATION_PLAN.md, COMMIT_CHECKLIST.md, ENVIRONMENT_SETUP.md, guides (REVIEW.md, TESTING.md), validation/VALIDATION_CHECKLIST.md
  - Total: ~3,600 lines of professional documentation
  - Ready for Phase 2 implementation
- **2025-11-16**: Story 1.1 Phase 1 completed (4 commits: research, installation, type verification, documentation)
  - Installed next-intl@4.5.3 with edge runtime support
  - Verified TypeScript types and Next.js dev server compatibility
  - Updated CLAUDE.md with installation documentation
  - All validations passing (TypeScript, ESLint, tests)
- **2025-11-16**: Story 1.3 specification and phase plan created (3 phases: Language Detection Foundation, Cookie Persistence & i18n Context, Testing & Validation)
  - Comprehensive story spec with 12 acceptance criteria and detailed technical requirements
  - Phase breakdown: Phase 1 (Detection, 1.5-2d), Phase 2 (Cookies, 1.5-2d), Phase 3 (E2E Testing, 1-1.5d)
  - Total estimated duration: 4-6 days, 6-8 commits
  - Ready for Phase 1 documentation generation
- **2025-11-16**: Story 1.1 planned with 3 phases (Installation, Configuration, Validation)
