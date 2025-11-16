# Story 1.3 - Next.js Middleware Implementation Plan

**Story**: Create Next.js Middleware with next-intl
**Epic**: Epic 1 — Internationalisation (i18n)
**Created**: 2025-11-16
**Status**: 📋 PLANNING | 🚧 IN PROGRESS | ✅ COMPLETED

---

## 📖 Story Overview

### Original Story Specification

**Location**: `docs/specs/epics/epic_1/story_1_3/story_1.3.md`

**Story Objective**: Implement a Next.js middleware (`src/middleware.ts`) that integrates next-intl for automatic language detection, URL routing, and cookie persistence. This middleware is the **foundation** for all bilingual URL structure, handling language detection from multiple sources (URL, browser, cookies) and ensuring seamless routing between `/fr` and `/en` prefixed routes.

**Acceptance Criteria**:

- AC1: Middleware detects language from URL
- AC2: Middleware detects language from browser Accept-Language header
- AC3: Middleware respects language cookie
- AC4: Middleware redirects unsupported languages
- AC5: Middleware handles root path
- AC6: Middleware initializes next-intl context
- AC7: Middleware excludes public routes
- AC8: Middleware validates language in scope
- AC9: Middleware sets i18n cookie
- AC10: Middleware handles mobile deep links
- AC11: Middleware logs language detection for debugging
- AC12: No infinite redirects

**User Value**: Users can access the entire website in their preferred language, with the system automatically detecting their browser language, remembering their choice, and seamlessly routing between `/fr` and `/en` prefixed URLs. Search engines properly index bilingual content with correct hreflang annotations.

---

## 🎯 Phase Breakdown Strategy

### Why 3 Phases?

This story is decomposed into **3 atomic phases** based on:

✅ **Technical dependencies**: Foundation (detection) → Persistence (cookies) → Testing (validation)
✅ **Risk mitigation**: Core detection logic isolated from cookie handling and edge cases
✅ **Incremental value**: Phase 1 provides working language detection, Phase 2 adds persistence, Phase 3 validates comprehensively
✅ **Team capacity**: 1.5–2 days per phase, 6–8 atomic commits total
✅ **Testing strategy**: Unit tests (Phase 1–2), E2E tests (Phase 3)

### Atomic Phase Principles

Each phase follows these principles:

- **Independent**: Can be tested separately with mocked dependencies
- **Deliverable**: Produces working middleware features testable in isolation
- **Sized appropriately**: 1.5–2 days of focused work per phase
- **Low coupling**: Phases integrate cleanly via configuration and interfaces
- **High cohesion**: All work in phase serves a single objective

### Implementation Approach

```
[Phase 1] → [Phase 2] → [Phase 3] → [Testing] → [Validation]
↓          ↓          ↓
Detection  Persistence Validation
```

---

## 📦 Phases Summary

### Phase 1: Language Detection Foundation

**Objective**: Implement core language detection logic from URL, cookies, and browser headers with proper validation and redirect handling.

**Scope**:

- Create `src/middleware.ts` with middleware structure
- Implement language detection from URL path (`/fr/*`, `/en/*`)
- Implement language detection from `NEXT_LOCALE` cookie
- Implement language detection from `Accept-Language` browser header
- Implement redirect logic for unsupported languages
- Type-safe locale validation against allowed locales
- Configure public route exclusions (`/_next/*`, `/api/*`, etc.)
- Unit tests for detection logic

**Dependencies**:

- Requires: Story 1.1 complete (next-intl library installed)
- Blocks: Phase 2, Phase 3

**Key Deliverables**:

- [ ] `src/middleware.ts` created with detection logic
- [ ] URL-based language detection working
- [ ] Cookie reading and validation
- [ ] Browser header parsing with quality values
- [ ] Public route exclusion configured
- [ ] Unit tests: ≥ 80% coverage for detection logic
- [ ] TypeScript: Zero errors on `pnpm tsc`

**Files Affected** (~5 files):

- `src/middleware.ts` (new, ~150–180 lines)
- `i18n/config.ts` (modified, add routing config)
- `i18n/types.ts` (modified, export locale types)
- `tsconfig.json` (modified, add middleware path)
- `src/lib/i18n/detection.test.ts` (new, unit tests)

**Estimated Complexity**: Medium

**Estimated Duration**: 1.5–2 days (4–5 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- Browser Accept-Language header parsing edge cases (quality values, subtags)
- Type safety with next-intl's locale type system
- Public route matching performance (avoid regex explosion)

**Mitigation Strategies**:

- Use `Intl.Locales.of()` (if available) or tested parsing library
- Centralize locale types in `i18n/types.ts` for single source of truth
- Pre-compile route matching patterns for performance
- Test with real browser headers from MDN examples

**Success Criteria**:

- [ ] AC1: Language detected from URL (`/fr/`, `/en/`)
- [ ] AC2: Language detected from Accept-Language header
- [ ] AC3: Language read from cookie
- [ ] AC4: Unsupported language redirects
- [ ] AC7: Public routes excluded
- [ ] AC8: Language validated against scope
- [ ] Unit tests pass: `pnpm test` ≥ 80% coverage

**Technical Notes**:

- Middleware runs **before** Next.js routing, on Cloudflare edge
- Language detection priority: URL → Cookie → Header → Default
- Redirect happens **before** component rendering
- No database calls in middleware (performance constraint)
- Cloudflare Workers API compatible (no Node.js `fs`, `crypto`)

---

### Phase 2: Cookie Persistence & i18n Context

**Objective**: Implement HTTP cookie handling with secure flags and integrate next-intl context initialization for component access.

**Scope**:

- Implement cookie creation with secure flags (HttpOnly, SameSite, Secure)
- Implement cookie reading with validation
- Implement cookie expiration (1 year TTL)
- Handle root path redirection (`/` → `/fr/` or `/en/`)
- Integrate next-intl `middleware()` function
- Initialize i18n context for `useTranslations()` and `getTranslations()`
- Type-safe middleware response with correct headers
- Unit + integration tests for cookie handling

**Dependencies**:

- Requires: Phase 1 complete
- Blocks: Phase 3

**Key Deliverables**:

- [ ] Cookie creation with all secure flags
- [ ] Root path redirection logic
- [ ] next-intl `middleware()` integration
- [ ] i18n context available to components
- [ ] Unit tests: Cookie creation, validation, TTL
- [ ] Integration tests: i18n context in components

**Files Affected** (~4 files):

- `src/middleware.ts` (modified, add cookie + next-intl logic, ~200–250 lines total)
- `i18n/config.ts` (modified, add routing mode)
- `src/lib/i18n/cookie.test.ts` (new, cookie tests)
- `src/lib/i18n/context.integration.test.ts` (new, context tests)

**Estimated Complexity**: Medium

**Estimated Duration**: 1.5–2 days (3–4 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- Cloudflare Workers runtime limitations on cookie headers
- next-intl `middleware()` function compatibility with Cloudflare
- i18n context type inference in TypeScript
- Cookie flags behavior varies by environment (dev vs. production)

**Mitigation Strategies**:

- Test cookie flags in both dev (via `wrangler dev`) and production (Cloudflare Workers)
- Use next-intl's documented middleware setup patterns
- Mock next-intl in tests to isolate cookie logic
- Document environment-specific cookie flag handling

**Success Criteria**:

- [ ] AC5: Root path redirects to detected language
- [ ] AC6: next-intl context initialized
- [ ] AC9: Cookie set with HttpOnly, SameSite, Secure
- [ ] Components can use `useTranslations()`
- [ ] Cookie persists across sessions (TTL: 1 year)
- [ ] Integration tests pass: `pnpm test`

**Technical Notes**:

- Cookie name: `NEXT_LOCALE`
- Cookie flags: `httpOnly=true`, `sameSite=Lax`, `secure=true` (prod only)
- Root path detection uses detected language (cookie > header > default)
- next-intl `middleware()` must wrap detection logic for context setup
- Response headers set via `NextResponse` API

---

### Phase 3: Testing, Edge Cases & Documentation

**Objective**: Implement comprehensive E2E tests, handle edge cases (infinite redirects, mobile), debug logging, performance optimization, and complete documentation.

**Scope**:

- E2E tests with Playwright for all AC 1-12
- Edge case handling: infinite redirects, deep links, mobile viewports
- Debug logging for language detection (source, decision)
- Performance testing: middleware execution < 50ms
- Error handling and fallback strategies
- Documentation with code examples and migration guide
- README explaining middleware architecture and usage

**Dependencies**:

- Requires: Phase 1 and Phase 2 complete
- Blocks: None (final phase)

**Key Deliverables**:

- [ ] E2E test suite (Playwright): ≥ 80% scenario coverage
- [ ] Edge case tests: redirects, deep links, mobile
- [ ] Debug logging: configurable, production-safe
- [ ] Performance benchmark: < 50ms execution time
- [ ] Documentation: Architecture guide, examples, troubleshooting
- [ ] All AC 1-12 verified with real browser tests

**Files Affected** (~6 files):

- `src/middleware.ts` (modified, add debug logging, ~250–300 lines final)
- `tests/middleware.spec.ts` (new, E2E tests ~400–500 lines)
- `tests/i18n-edge-cases.spec.ts` (new, edge case tests ~200 lines)
- `docs/i18n/MIDDLEWARE.md` (new, documentation ~500 lines)
- `src/lib/i18n/logger.ts` (new, debug logging utility)

**Estimated Complexity**: Medium

**Estimated Duration**: 1–1.5 days (2–3 commits)

**Risk Level**: 🟡 Medium

**Risk Factors**:

- E2E test flakiness (timing, browser behavior)
- Cloudflare Worker runtime variations affecting performance
- Edge case interactions (deep links + mobile + cookies)
- Debug logging overhead in production

**Mitigation Strategies**:

- Use Playwright fixtures with database seeding for consistent E2E state
- Test performance on actual Cloudflare edge (via `pnpm preview`)
- Document all edge cases found and their solutions
- Gate debug logging behind environment flag (`DEBUG=i18n:*`)

**Success Criteria**:

- [ ] All AC 1-12 verified via E2E tests
- [ ] E2E test coverage: ≥ 80%
- [ ] Performance: Middleware execution < 50ms (measured via Cloudflare)
- [ ] Edge cases handled: Redirects, deep links, mobile
- [ ] ESLint + Prettier pass: `pnpm lint`
- [ ] TypeScript zero errors: `pnpm tsc`
- [ ] Documentation complete with examples

**Technical Notes**:

- E2E tests use `test.describe()` with fixtures for language/cookie setup
- Performance measured via `performance.now()` in middleware
- Debug logs use environment variable `DEBUG` pattern (compatible with `debug` library)
- Documentation includes troubleshooting for common i18n issues

---

## 🔄 Implementation Order & Dependencies

### Dependency Graph

```
Phase 1 (Language Detection Foundation)
│
├─→ Unit tests for detection (parallel)
│
↓
Phase 2 (Cookie Persistence & i18n Context)
│
├─→ Unit + integration tests for cookies (parallel)
│
↓
Phase 3 (Testing, Edge Cases & Documentation)
│
├─→ E2E tests (parallel)
├─→ Edge case testing (parallel)
├─→ Documentation (parallel)
│
↓
Phase Complete: All AC 1-12 verified, documentation ready
```

### Critical Path

**Must follow this sequence**:

1. Phase 1 → Phase 2 → Phase 3
   - Detection (P1) must precede cookie handling (P2)
   - Cookies (P2) must work before comprehensive testing (P3)

**Parallelization opportunities**:

- Phase 1: Unit tests can run in parallel with implementation
- Phase 2: Integration tests can start once P1 is done
- Phase 3: E2E tests, edge cases, and docs can be done in parallel

### Blocking Dependencies

**Phase 1 blocks**:

- Phase 2: Needs detection logic from Phase 1
- Phase 3: Needs both P1 and P2 working

**Phase 2 blocks**:

- Phase 3: Needs cookie + context working

---

## 📊 Timeline & Resource Estimation

### Overall Estimates

| Metric                   | Estimate         | Notes                                |
| ------------------------ | ---------------- | ------------------------------------ |
| **Total Phases**         | 3                | Atomic, independent phases           |
| **Total Duration**       | 4–6 weeks        | Sequential implementation            |
| **Parallel Duration**    | 2–3 weeks        | If teams work on parallel tasks      |
| **Total Commits**        | 6–8              | Across all phases                    |
| **Total Files**          | ~8–10 new/mod    | Middleware, tests, docs, configs     |
| **Test Coverage Target** | ≥ 80%            | Unit + integration + E2E             |

### Per-Phase Timeline

| Phase | Duration | Commits | Start After | Blocks     | Team |
| ----- | -------- | ------- | ----------- | ---------- | ---- |
| 1     | 1.5–2d   | 4–5     | Story 1.1   | Phase 2, 3 | 1    |
| 2     | 1.5–2d   | 3–4     | Phase 1     | Phase 3    | 1    |
| 3     | 1–1.5d   | 2–3     | Phase 2     | -          | 1    |

### Resource Requirements

**Team Composition**:

- 1 Full-stack developer (TypeScript, Next.js, Middleware, Tests)
- Code review: 1 reviewer (async, after each phase)

**Required Skills**:

- Next.js middleware and routing patterns
- TypeScript type system
- next-intl library architecture
- HTTP cookies and headers
- Playwright E2E testing
- Cloudflare Workers constraints

**External Dependencies**:

- next-intl library: Already installed (Story 1.1)
- Playwright: For E2E testing (already in `package.json`)
- Testing Library: For component testing (already installed)

---

## ⚠️ Risk Assessment

### High-Risk Phases

**Phase 2: Cookie Persistence & i18n Context** 🟡 Medium

- **Risk**: Cloudflare Workers cookie header handling differs from Node.js
- **Impact**: Cookies might not persist, i18n context fails in production
- **Mitigation**: Test in `wrangler dev` and `pnpm preview` before production
- **Contingency**: Document Cloudflare-specific cookie patterns; fallback to sessionStorage if needed

**Phase 3: E2E Test Flakiness** 🟡 Medium

- **Risk**: Playwright tests fail intermittently due to timing, browser cache
- **Impact**: False negatives in CI/CD, delays in story completion
- **Mitigation**: Use Playwright fixtures with explicit waits; run tests in isolated environment
- **Contingency**: Increase timeout values; add manual testing checklist as backup

### Overall Story Risks

| Risk                    | Likelihood | Impact | Mitigation                                  |
| ----------------------- | ---------- | ------ | ------------------------------------------- |
| Cloudflare runtime edge | Medium     | High   | Test in `wrangler dev` + `pnpm preview`    |
| E2E flakiness           | Medium     | Medium | Fixtures, explicit waits, isolated env     |
| Type inference issues   | Low        | Medium | Comprehensive TypeScript tests             |
| Performance degradation | Low        | Medium | Benchmark middleware < 50ms on edge        |

---

## 🧪 Testing Strategy

### Test Coverage by Phase

| Phase       | Unit Tests    | Integration Tests | E2E Tests |
| ----------- | ------------- | ----------------- | --------- |
| 1. Detection | 12–15 tests   | -                 | -         |
| 2. Cookies   | 8–10 tests    | 6–8 tests         | -         |
| 3. Validation | -            | -                 | 15–20     |

**Total Tests**: ~50–60 tests across all phases

### Test Milestones

- **After Phase 1**: Language detection works (URL, cookie, header) with ≥ 80% coverage
- **After Phase 2**: Cookies persist, next-intl context available, components can translate
- **After Phase 3**: All AC 1-12 verified, E2E tests pass, edge cases handled

### Quality Gates

Each phase must pass:

- [ ] All unit tests (`pnpm test`)
- [ ] All integration tests (`pnpm test`)
- [ ] TypeScript: `pnpm tsc` (zero errors)
- [ ] ESLint + Prettier: `pnpm lint`
- [ ] Code coverage: ≥ 80%
- [ ] Manual review: Logic correct, edge cases considered
- [ ] E2E tests (Phase 3 only): All scenarios pass

### Performance Testing

- **Middleware execution time**: < 50ms on Cloudflare edge (measured via `performance.now()`)
- **Benchmark**: Test with `wrangler dev` and `pnpm preview`
- **Monitoring**: Add observability if > 50ms detected

---

## 📝 Phase Documentation Strategy

### Documentation to Generate per Phase

For each phase, comprehensive technical docs:

1. **Phase 1: Language Detection Foundation**
   - INDEX.md: Phase overview
   - IMPLEMENTATION_PLAN.md: Commit-by-commit guide
   - COMMIT_CHECKLIST.md: Checklist for each commit
   - guides/REVIEW.md: Code review guidelines
   - guides/TESTING.md: Testing strategy details
   - validation/VALIDATION_CHECKLIST.md: Acceptance criteria verification

2. **Phase 2: Cookie Persistence & i18n Context**
   - Same structure as Phase 1
   - Additional focus on cookie security, i18n setup

3. **Phase 3: Testing, Edge Cases & Documentation**
   - Same structure as Phase 1
   - E2E test patterns documented
   - Troubleshooting guide

### Story-Level Documentation

**This document** (PHASES_PLAN.md):

- Strategic overview (this document)
- Phase coordination
- Cross-phase dependencies
- Overall timeline

**Story Specification** (`story_1.3.md`):

- User story definition
- Acceptance criteria
- Technical requirements

**Middleware Guide** (`docs/i18n/MIDDLEWARE.md`):

- Architecture explanation
- Implementation patterns
- Troubleshooting
- Examples

---

## 🚀 Next Steps

### Immediate Actions

1. **Review this plan** with the team
   - Validate phase breakdown makes sense
   - Adjust estimates if needed
   - Identify any missing phases

2. **Set up project structure**
   ```bash
   mkdir -p docs/specs/epics/epic_1/story_1_3/implementation/phase_1
   mkdir -p docs/specs/epics/epic_1/story_1_3/implementation/phase_2
   mkdir -p docs/specs/epics/epic_1/story_1_3/implementation/phase_3
   ```

3. **Generate detailed documentation for Phase 1**
   - Use command: `/generate-phase-doc`
   - Or request: "Generate implementation docs for Phase 1 of Story 1.3"
   - Provide this PHASES_PLAN.md as context

### Implementation Workflow

For each phase:

1. **Plan** (if not done):
   - Read PHASES_PLAN.md for phase overview
   - Generate detailed docs with `phase-doc-generator`

2. **Implement**:
   - Follow IMPLEMENTATION_PLAN.md
   - Use COMMIT_CHECKLIST.md for each commit
   - Test after each commit

3. **Review**:
   - Use guides/REVIEW.md checklist
   - Ensure all success criteria met

4. **Validate**:
   - Complete validation/VALIDATION_CHECKLIST.md
   - Verify all AC 1-12 met

5. **Move to next phase**:
   - Update this plan with progress
   - Repeat process for next phase

### Progress Tracking

Update this document as phases complete:

- [ ] Phase 1: Language Detection Foundation - Status: 🚧 IN PROGRESS, Actual duration: TBD, Notes: TBD
- [ ] Phase 2: Cookie Persistence & i18n Context - Status: 📋 PENDING, Actual duration: TBD, Notes: TBD
- [ ] Phase 3: Testing, Edge Cases & Documentation - Status: 📋 PENDING, Actual duration: TBD, Notes: TBD

---

## 📊 Success Metrics

### Story Completion Criteria

This story is considered complete when:

- [ ] All 3 phases implemented and validated
- [ ] All 12 acceptance criteria (AC 1-12) verified
- [ ] Test coverage ≥ 80% (unit + integration + E2E)
- [ ] No TypeScript errors: `pnpm tsc`
- [ ] ESLint + Prettier pass: `pnpm lint`
- [ ] E2E tests pass: `pnpm test:e2e`
- [ ] Performance verified: < 50ms execution
- [ ] Documentation complete and reviewed
- [ ] EPIC_TRACKING.md updated to ✅ COMPLETED

### Quality Metrics

| Metric                 | Target               | Actual |
| ---------------------- | -------------------- | ------ |
| Test Coverage (Unit)   | ≥ 80%                | -      |
| Test Coverage (E2E)    | ≥ 80% (AC coverage)  | -      |
| TypeScript             | 100% (zero errors)   | -      |
| ESLint                 | Zero critical errors | -      |
| Performance (P50)      | < 30ms               | -      |
| Performance (P95)      | < 50ms               | -      |
| Code Review Approval   | 100%                 | -      |

---

## 📚 Reference Documents

### Story Specification

- Original spec: `docs/specs/epics/epic_1/story_1_3/story_1.3.md`

### Related Documentation

- Epic 1 overview: `docs/specs/epics/epic_1/EPIC_TRACKING.md`
- PRD (Story 1.3 section): `docs/specs/PRD.md` (lines 643)
- PRD (EF19-EF22): `docs/specs/PRD.md` (lines 202-240)
- Technical architecture: `docs/specs/PRD.md` (lines 1027-1051)

### Generated Phase Documentation

- Phase 1: `docs/specs/epics/epic_1/story_1_3/implementation/phase_1/INDEX.md` (will be created)
- Phase 2: `docs/specs/epics/epic_1/story_1_3/implementation/phase_2/INDEX.md` (will be created)
- Phase 3: `docs/specs/epics/epic_1/story_1_3/implementation/phase_3/INDEX.md` (will be created)

### next-intl Documentation

- Official docs: https://next-intl-docs.vercel.app/
- Middleware guide: https://next-intl.dev/
- GitHub: https://github.com/amannn/next-intl

---

**Plan Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Created by**: Claude Code (story-phase-planner skill)
**Story Status**: 📋 PLANNING
**Ready for Phase 1 Documentation**: ✅

---

## 🎯 Approval Checklist

Before starting implementation, review this plan:

- [ ] Phase breakdown makes sense (3 phases appropriate for scope)
- [ ] Dependencies are clear (Story 1.1 must be done first)
- [ ] Acceptance criteria coverage is complete (all AC 1-12 addressed)
- [ ] Timeline is realistic (4–6 days total)
- [ ] Risk assessment is acceptable (no blockers)
- [ ] Testing strategy is comprehensive (unit + integration + E2E)
- [ ] Documentation plan is clear (7 docs per phase)
- [ ] Team capacity confirmed (1 developer, 1 reviewer)

**Ready to proceed to Phase 1 documentation generation**: ✅
