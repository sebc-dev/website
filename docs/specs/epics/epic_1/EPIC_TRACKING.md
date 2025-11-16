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

| Story | Title                                      | Description                                                       | Status         | Phases | Progress |
| ----- | ------------------------------------------ | ----------------------------------------------------------------- | -------------- | ------ | -------- |
| 1.1   | Install and configure next-intl            | Set up next-intl library and basic configuration                  | 🚧 IN PROGRESS | 3      | 0/3      |
| 1.2   | Create message files                       | Create `messages/fr.json` and `messages/en.json` translation files | 📋 NOT STARTED | -      | 0/0      |
| 1.3   | Create Next.js middleware                  | Implement middleware with next-intl for routing                   | 📋 NOT STARTED | -      | 0/0      |
| 1.4   | Bilingual URL structure                    | Implement route groups with language detection and cookie support | 📋 NOT STARTED | -      | 0/0      |
| 1.5   | Content fallback                           | Add language badges and FR/EN toggle for missing translations     | 📋 NOT STARTED | -      | 0/0      |
| 1.6   | SEO hreflang + canonical                   | Implement SEO metadata via Next.js Metadata API                   | 📋 NOT STARTED | -      | 0/0      |
| 1.7   | Language selector in header                | Create header component with cookie persistence                   | 📋 NOT STARTED | -      | 0/0      |

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

- **Stories Started**: 0 / 7
- **Stories Completed**: 0 / 7
- **Total Phases**: TBD (once stories are planned)
- **Phases Completed**: 0 / TBD

**Completion**: 0%

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
- Story 1.2: `docs/specs/epics/epic_1/story_1_2/story_1.2.md` (not yet created)
- Story 1.3: `docs/specs/epics/epic_1/story_1_3/story_1.3.md` (not yet created)
- Story 1.4: `docs/specs/epics/epic_1/story_1_4/story_1.4.md` (not yet created)
- Story 1.5: `docs/specs/epics/epic_1/story_1_5/story_1.5.md` (not yet created)
- Story 1.6: `docs/specs/epics/epic_1/story_1_6/story_1.6.md` (not yet created)
- Story 1.7: `docs/specs/epics/epic_1/story_1_7/story_1.7.md` (not yet created)

### Phase Plans

Phase plans will be linked here as stories are planned:

- Story 1.1: `docs/specs/epics/epic_1/story_1_1/implementation/PHASES_PLAN.md` ✅ (3 phases)

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
- [ ] First phase completed
- [ ] First phase validated
- [ ] Metrics updated

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

- **2025-11-16**: Story 1.1 planned with 3 phases (Installation, Configuration, Validation)
