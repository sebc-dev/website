# Story 1.1 - Phases Implementation Plan

**Story**: Install and Configure next-intl
**Epic**: Epic 1 - Internationalisation (i18n)
**Created**: 2025-11-16
**Status**: 📋 PLANNING

---

## 📖 Story Overview

### Original Story Specification

**Location**: `docs/specs/epics/epic_1/story_1_1/story_1.1.md`

**Story Objective**: Establish the foundation for the entire i18n system by installing and configuring next-intl, the recommended internationalization solution for Next.js 15 App Router. This provides type-safe translations, automatic language detection, and seamless integration with React Server Components.

**Acceptance Criteria**:

- AC1: next-intl package installed and version documented in package.json
- AC2: Configuration file created with supported locales (fr, en)
- AC3: TypeScript setup for type-safe translations
- AC4: Default locale configured (fr as per PRD)
- AC5: Configuration validated with Next.js 15 App Router compatibility
- AC6: Documentation created for i18n configuration
- AC7: All configuration files pass TypeScript compilation
- AC8: No runtime errors when Next.js server starts

**User Value**: Critical infrastructure enabling users to experience the entire website in their preferred language (French or English) with automatic language detection based on browser preferences. While delivering no direct user-facing features, this foundation is essential for all subsequent i18n functionality.

---

## 🎯 Phase Breakdown Strategy

### Why 3 Phases?

This story is decomposed into **3 atomic phases** based on:

✅ **Technical dependencies**: Package must be installed before configuration can reference it; configuration must exist before validation
✅ **Risk mitigation**: Early validation of package compatibility (Phase 1), separate configuration complexity (Phase 2), final integration verification (Phase 3)
✅ **Incremental value**: Each phase delivers testable milestone - package available, configuration functional, system validated
✅ **Team capacity**: Small, focused phases appropriate for foundational work (~1 day each)
✅ **Testing strategy**: Progressive validation - dependency check, config compilation, integration test

### Atomic Phase Principles

Each phase follows these principles:

- **Independent**: Can be implemented and tested separately
- **Deliverable**: Produces tangible, working functionality
- **Sized appropriately**: 1-1.5 days of work per phase (simple story)
- **Low coupling**: Minimal dependencies on other phases
- **High cohesion**: All work in phase serves single objective

### Implementation Approach

```
[Phase 1] → [Phase 2] → [Phase 3]
↓           ↓           ↓
Install     Configure   Validate
```

**Sequential dependency**: Each phase builds on the previous, no parallelization opportunities.

---

## 📦 Phases Summary

### Phase 1: Package Installation and Dependency Validation

**Objective**: Install next-intl package and validate compatibility with Next.js 15, React 19, and Cloudflare Workers runtime.

**Scope**:

- Install next-intl via npm/pnpm
- Verify package version compatibility
- Check TypeScript type definitions
- Validate no dependency conflicts
- Document installed version

**Dependencies**:

- None (Foundation phase)
- Requires: Next.js 15 project already initialized (Epic 0)

**Key Deliverables**:

- [ ] next-intl added to package.json dependencies
- [ ] pnpm lockfile updated
- [ ] Package version documented
- [ ] Compatibility verified (Next.js 15 + React 19)
- [ ] TypeScript types available

**Files Affected** (~2 files):

- `package.json` (modified - add next-intl dependency)
- `pnpm-lock.yaml` (modified - lockfile update)

**Estimated Complexity**: Low

**Estimated Duration**: 1 day (3-4 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- Version incompatibility with Next.js 15 or React 19
- Missing TypeScript definitions
- Peer dependency conflicts

**Mitigation Strategies**:

- Check next-intl changelog for Next.js 15 support before installation
- Install latest stable version (not beta/RC)
- Run `pnpm install` and verify no errors
- Test TypeScript compilation immediately
- Check for deprecation warnings

**Success Criteria**:

- [ ] `pnpm install next-intl` completes successfully
- [ ] No peer dependency warnings or errors
- [ ] TypeScript recognizes next-intl types
- [ ] `pnpm tsc --noEmit` passes
- [ ] Package version >= minimum required for Next.js 15
- [ ] Documentation: version noted in commit message

**Technical Notes**:

- Use `pnpm add next-intl` (project uses pnpm as package manager)
- Check compatibility with `nodejs_compat` flag (Cloudflare Workers)
- Verify edge runtime compatibility (next-intl supports edge)
- Document installed version for reproducibility

---

### Phase 2: Configuration File Creation and TypeScript Setup

**Objective**: Create next-intl configuration file with locale settings, TypeScript types, and request configuration for React Server Components.

**Scope**:

- Create i18n configuration file structure
- Define supported locales (fr, en)
- Set default locale (fr)
- Configure `getRequestConfig()` for Server Components
- Set up TypeScript types for translation keys
- Prepare message file imports (files created in Story 1.2)

**Dependencies**:

- Requires Phase 1 (package must be installed)

**Key Deliverables**:

- [ ] Configuration file created: `src/i18n/config.ts` or `i18n.ts` (location decision)
- [ ] Supported locales defined: `['fr', 'en']`
- [ ] Default locale set: `'fr'`
- [ ] `getRequestConfig()` function implemented
- [ ] TypeScript types configured
- [ ] Message import structure prepared (ready for Story 1.2)
- [ ] Code follows Next.js 15 App Router patterns

**Files Affected** (~3 files):

- `src/i18n/config.ts` (new - main configuration)
- `src/i18n/types.ts` (new - TypeScript definitions, if needed)
- `i18n.ts` (OR - alternative root location, pattern decision)

**Estimated Complexity**: Medium

**Estimated Duration**: 1.5 days (4-5 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:

- Incorrect configuration pattern for App Router
- TypeScript configuration errors
- Import path issues for message files

**Mitigation Strategies**:

- Follow next-intl App Router documentation exactly
- Use official examples as reference
- Validate TypeScript immediately
- Test server compilation after each change

**Success Criteria**:

- [ ] Configuration file exists and exports `getRequestConfig`
- [ ] Locales array defined: `['fr', 'en']`
- [ ] Default locale set to `'fr'`
- [ ] Message import logic prepared (dynamic import)
- [ ] TypeScript compilation passes (`pnpm tsc --noEmit`)
- [ ] No runtime errors on server start
- [ ] Code follows project conventions (ESLint, Prettier)

**Technical Notes**:

- **File location decision**: Choose between `src/i18n/config.ts` (organized) vs `i18n.ts` (next-intl convention)
  - Recommendation: `src/i18n/config.ts` for consistency with project structure
- **getRequestConfig pattern** (Next.js 15 App Router):

  ```typescript
  import { getRequestConfig } from 'next-intl/server';

  export default getRequestConfig(async ({ locale }) => ({
    messages: (await import(`../../messages/${locale}.json`)).default,
  }));
  ```

- **TypeScript types**: next-intl provides built-in types, minimal custom typing needed
- **Message files**: Will be created in Story 1.2, but import structure prepared here
- **Locale type**: `type Locale = 'fr' | 'en'` for type safety

---

### Phase 3: Integration Validation and Documentation

**Objective**: Validate complete next-intl setup, ensure Next.js server starts without errors, create documentation, and verify readiness for subsequent stories.

**Scope**:

- Validate TypeScript compilation
- Test Next.js development server startup
- Verify configuration is accessible
- Create documentation for i18n setup
- Add configuration notes to CLAUDE.md if needed
- Verify compatibility with Cloudflare Workers (via build test)

**Dependencies**:

- Requires Phase 2 (configuration must exist)

**Key Deliverables**:

- [ ] TypeScript compilation validated
- [ ] Next.js dev server starts successfully
- [ ] Configuration accessible in test
- [ ] Documentation created (README or inline comments)
- [ ] Setup notes added to CLAUDE.md (if needed)
- [ ] Build process validated (no errors)

**Files Affected** (~2-3 files):

- `CLAUDE.md` (modified - add i18n setup notes, if needed)
- `src/i18n/README.md` (new - configuration documentation)
- Test file (optional - validation test)

**Estimated Complexity**: Low

**Estimated Duration**: 1 day (3-4 commits)

**Risk Level**: 🟢 Low

**Risk Factors**:

- Runtime errors on server start
- Configuration not accessible
- Build failures with OpenNext

**Mitigation Strategies**:

- Test server start immediately
- Verify configuration can be imported
- Test production build if possible
- Document any issues for future reference

**Success Criteria**:

- [ ] `pnpm tsc --noEmit` passes with no errors
- [ ] `pnpm dev` starts without errors
- [ ] No console errors or warnings related to i18n
- [ ] Configuration can be imported and accessed
- [ ] `pnpm build` completes (if testing early build)
- [ ] Documentation complete and reviewed
- [ ] Setup ready for Story 1.2 (message files)

**Technical Notes**:

- **Validation checklist**:
  1. TypeScript: `pnpm tsc --noEmit`
  2. Linting: `pnpm lint`
  3. Dev server: `pnpm dev` (check startup logs)
  4. Build: `pnpm build` (optional, validates OpenNext compatibility)
- **Documentation scope**:
  - Configuration file purpose and structure
  - Supported locales and default
  - How to add new locales (for future)
  - Integration with middleware (Story 1.3 reference)
- **CLAUDE.md update**: Add note about i18n configuration location and usage
- **Ready for Story 1.2**: Message file structure should be clear from config

---

## 🔄 Implementation Order & Dependencies

### Dependency Graph

```
Phase 1 (Installation)
↓
Phase 2 (Configuration)
↓
Phase 3 (Validation)
```

### Critical Path

**Must follow this order**:

1. Phase 1 (Installation) → Phase 2 (Configuration) → Phase 3 (Validation)

**Cannot be parallelized**: Each phase strictly depends on the previous.

### Blocking Dependencies

**Phase 1 blocks**:

- Phase 2: Package must be installed before configuration can import it
- Phase 3: Package must exist for validation

**Phase 2 blocks**:

- Phase 3: Configuration must exist to validate it
- Story 1.2: Message file structure depends on config import pattern

---

## 📊 Timeline & Resource Estimation

### Overall Estimates

| Metric                   | Estimate            | Notes                       |
| ------------------------ | ------------------- | --------------------------- |
| **Total Phases**         | 3                   | Atomic, sequential phases   |
| **Total Duration**       | 3-4 days            | Sequential implementation   |
| **Parallel Duration**    | N/A                 | No parallelization possible |
| **Total Commits**        | ~10-13              | Across all phases           |
| **Total Files**          | ~4 new, ~2 modified | Configuration + docs        |
| **Test Coverage Target** | N/A                 | Config validation only      |

### Per-Phase Timeline

| Phase            | Duration | Commits | Start After | Blocks             |
| ---------------- | -------- | ------- | ----------- | ------------------ |
| 1. Installation  | 1d       | 3-4     | -           | Phase 2, 3         |
| 2. Configuration | 1.5d     | 4-5     | Phase 1     | Phase 3, Story 1.2 |
| 3. Validation    | 1d       | 3-4     | Phase 2     | Story 1.2-1.7      |

### Resource Requirements

**Team Composition**:

- 1 developer: Next.js + TypeScript + i18n experience
- 1 reviewer: Familiar with next-intl and App Router patterns

**External Dependencies**:

- npm package: `next-intl` (latest stable for Next.js 15)
- Next.js documentation (App Router i18n)
- next-intl documentation (official)

---

## ⚠️ Risk Assessment

### High-Risk Phases

None - all phases are low-medium risk for this simple story.

### Medium-Risk Phases

**Phase 1: Installation** 🟡

- **Risk**: Version incompatibility with Next.js 15 or React 19
- **Impact**: Prevents configuration phase, blocks entire i18n epic
- **Mitigation**: Check changelog, use latest stable, validate immediately
- **Contingency**: Pin to last known compatible version, report issue upstream

**Phase 2: Configuration** 🟢

- **Risk**: Incorrect configuration pattern for App Router
- **Impact**: Runtime errors, need to refactor
- **Mitigation**: Follow official docs exactly, validate TypeScript immediately

### Overall Story Risks

| Risk                             | Likelihood | Impact | Mitigation                               |
| -------------------------------- | ---------- | ------ | ---------------------------------------- |
| Package version incompatibility  | Medium     | High   | Check compatibility, use latest stable   |
| Configuration pattern errors     | Low        | Medium | Follow official docs, validate early     |
| TypeScript setup issues          | Low        | Low    | Use built-in types, validate compilation |
| Cloudflare Workers compatibility | Low        | Medium | next-intl supports edge, test build      |

---

## 🧪 Testing Strategy

### Test Coverage by Phase

| Phase            | Unit Tests | Integration Tests     | E2E Tests |
| ---------------- | ---------- | --------------------- | --------- |
| 1. Installation  | -          | -                     | -         |
| 2. Configuration | -          | 1 test (optional)     | -         |
| 3. Validation    | -          | 1 test (server start) | -         |

**Note**: This is configuration/setup work. Testing is primarily validation-based (compilation, server start) rather than unit/integration tests.

### Test Milestones

- **After Phase 1**: Package installed, no dependency errors
- **After Phase 2**: Configuration compiles, TypeScript passes
- **After Phase 3**: Server starts, no runtime errors

### Quality Gates

Each phase must pass:

- [ ] TypeScript compilation (`pnpm tsc --noEmit`)
- [ ] Linter with no errors (`pnpm lint`)
- [ ] Next.js server starts without errors
- [ ] No console warnings related to i18n
- [ ] Code review approved
- [ ] Documentation complete

---

## 📝 Phase Documentation Strategy

### Documentation to Generate per Phase

For each phase, use the `phase-doc-generator` skill to create:

1. **INDEX.md** - Phase overview and quick reference
2. **IMPLEMENTATION_PLAN.md** - Detailed commit-by-commit plan
3. **COMMIT_CHECKLIST.md** - Checklist for each atomic commit
4. **ENVIRONMENT_SETUP.md** - Prerequisites and setup steps
5. **guides/REVIEW.md** - Code review guidelines
6. **guides/TESTING.md** - Validation and testing procedures
7. **validation/VALIDATION_CHECKLIST.md** - Phase completion criteria

**Estimated documentation**: ~3400 lines per phase × 3 phases = **~10,200 lines total**

### Story-Level Documentation

**This document** (PHASES_PLAN.md):

- Strategic overview of all 3 phases
- Phase coordination and dependencies
- Cross-phase dependencies
- Overall timeline and risk assessment

**Phase-level documentation** (generated separately):

- Tactical implementation details for each phase
- Commit-by-commit checklists
- Specific technical validations
- Phase-specific success criteria

---

## 🚀 Next Steps

### Immediate Actions

1. **Review this plan** with the team
   - Validate 3-phase breakdown makes sense
   - Confirm timeline is realistic (3-4 days total)
   - Verify no missing dependencies

2. **Set up project structure**

   ```bash
   mkdir -p docs/specs/epics/epic_1/story_1_1/implementation/phase_1
   mkdir -p docs/specs/epics/epic_1/story_1_1/implementation/phase_2
   mkdir -p docs/specs/epics/epic_1/story_1_1/implementation/phase_3
   ```

3. **Generate detailed documentation for Phase 1**
   - Use command: `/generate-phase-doc Epic 1 Story 1.1 Phase 1`
   - Or request: "Generate implementation docs for Phase 1 of Story 1.1"
   - Provide this PHASES_PLAN.md as context

### Implementation Workflow

For each phase:

1. **Plan** (if not done):
   - Read PHASES_PLAN.md for phase overview
   - Generate detailed docs with `phase-doc-generator`

2. **Implement**:
   - Follow IMPLEMENTATION_PLAN.md
   - Use COMMIT_CHECKLIST.md for each commit
   - Validate after each commit

3. **Review**:
   - Use guides/REVIEW.md
   - Ensure all success criteria met

4. **Validate**:
   - Complete validation/VALIDATION_CHECKLIST.md
   - Update this plan with actual metrics

5. **Move to next phase**:
   - Mark phase complete in EPIC_TRACKING.md
   - Repeat process for next phase

### Progress Tracking

Update this document as phases complete:

- [ ] **Phase 1: Installation** - Status: 📋 NOT STARTED, Actual duration: TBD, Notes: -
- [ ] **Phase 2: Configuration** - Status: 📋 NOT STARTED, Actual duration: TBD, Notes: -
- [ ] **Phase 3: Validation** - Status: 📋 NOT STARTED, Actual duration: TBD, Notes: -

**Update EPIC_TRACKING.md** after each phase completion:

- Progress: X/3 phases complete
- Status: 🚧 IN PROGRESS (after Phase 1 starts)
- Status: ✅ COMPLETED (after Phase 3 completes)

---

## 📊 Success Metrics

### Story Completion Criteria

This story is considered complete when:

- [ ] All 3 phases implemented and validated
- [ ] All acceptance criteria from original spec met (AC1-AC8)
- [ ] next-intl installed and version documented
- [ ] Configuration file functional and type-safe
- [ ] TypeScript compilation passes
- [ ] Next.js dev server starts without errors
- [ ] Documentation complete and reviewed
- [ ] Ready for Story 1.2 (message files creation)
- [ ] Ready for Story 1.3 (middleware implementation)

### Quality Metrics

| Metric                 | Target   | Actual |
| ---------------------- | -------- | ------ |
| TypeScript Compilation | Pass     | -      |
| Linter Status          | Pass     | -      |
| Server Startup         | Success  | -      |
| Code Review Approval   | 100%     | -      |
| Documentation          | Complete | -      |

---

## 📚 Reference Documents

### Story Specification

- Original spec: `docs/specs/epics/epic_1/story_1_1/story_1.1.md`

### Related Documentation

- Epic overview: `docs/specs/epics/epic_1/EPIC_TRACKING.md`
- PRD: `docs/specs/PRD.md` (Epic 1, lines 639-647; EF19, lines 202-211)
- Brief: `docs/specs/Brief.md` (i18n requirements)
- CLAUDE.md: Project guidelines

### External Resources

- next-intl documentation: https://next-intl-docs.vercel.app/
- Next.js 15 i18n: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- next-intl App Router setup: https://next-intl-docs.vercel.app/docs/getting-started/app-router

### Generated Phase Documentation

- Phase 1: `docs/specs/epics/epic_1/story_1_1/implementation/phase_1/INDEX.md` (to be generated)
- Phase 2: `docs/specs/epics/epic_1/story_1_1/implementation/phase_2/INDEX.md` (to be generated)
- Phase 3: `docs/specs/epics/epic_1/story_1_1/implementation/phase_3/INDEX.md` (to be generated)

---

**Plan Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Created by**: Claude Code (story-phase-planner skill)
**Story Status**: 📋 PLANNING (phases planned, ready for implementation)
