# Story 1.3 — Create Next.js Middleware with next-intl

**Epic**: Epic 1 — Internationalisation (i18n)
**Story Reference**: 1.3
**Status**: 📋 PLANNING
**Created**: 2025-11-16
**Updated**: 2025-11-16

---

## 📖 Story Description

Implement a Next.js middleware (`src/middleware.ts`) that integrates next-intl for automatic language detection, URL routing, and cookie persistence. This middleware is the **foundation** for all bilingual URL structure, handling language detection from multiple sources (URL, browser, cookies) and ensuring seamless routing between `/fr` and `/en` prefixed routes.

**User Story**: As a user, I want the website to automatically detect my preferred language and route me to the correct URL, while allowing me to manually switch languages with my choice being remembered across sessions.

---

## 🎯 Acceptance Criteria

### AC1: Middleware detects language from URL

- [ ] Middleware correctly identifies language from URL prefix (`/fr/*` or `/en/*`)
- [ ] If URL contains explicit language, that language is used (highest priority)
- [ ] Test case: `/fr/articles` → French, `/en/search` → English

### AC2: Middleware detects language from browser Accept-Language header

- [ ] If no URL prefix and no cookie, middleware reads `Accept-Language` header
- [ ] Correctly parses browser language preference (handles quality values like `fr;q=0.9`)
- [ ] Falls back to default language (French) if no supported language found
- [ ] Test case: Header `fr,en;q=0.9` → French, Header `de,en;q=0.5` → French (default)

### AC3: Middleware respects language cookie

- [ ] If `NEXT_LOCALE` cookie exists, use that language
- [ ] Cookie takes precedence over browser header but not over URL
- [ ] Test case: Cookie `NEXT_LOCALE=en` with header `fr` → English

### AC4: Middleware redirects unsupported languages

- [ ] Unknown language prefixes redirect to default language (`/fr/`)
- [ ] Redirect preserves path and query parameters
- [ ] Returns HTTP 307 (Temporary Redirect)
- [ ] Test case: `/de/articles` → Redirect to `/fr/articles`

### AC5: Middleware handles root path

- [ ] Root path `/` redirects to detected language (`/fr/` or `/en/`)
- [ ] Detected from: cookie → browser header → default (French)
- [ ] Query parameters preserved if present (`/?lang=en` → `/en/`)
- [ ] Test case: `/` with French cookie → `/fr/`, with English header → `/en/`

### AC6: Middleware initializes next-intl context

- [ ] Passes detected language to next-intl for component consumption
- [ ] Makes language available via `useTranslations()` and `getTranslations()` in components
- [ ] Type-safe language constant available in routes and components
- [ ] Test case: Component uses `useTranslations()` without errors

### AC7: Middleware excludes public routes

- [ ] Middleware does not intercept public static routes (images, CSS, JS, fonts)
- [ ] Skips routes: `/_next/*`, `/public/*`, `/api/*` (configurable)
- [ ] Improves performance by avoiding language detection overhead
- [ ] Test case: Request to `/logo.png` bypasses middleware

### AC8: Middleware validates language in scope

- [ ] Only allows supported languages: `fr` and `en`
- [ ] Rejects invalid language codes with 400 or redirect
- [ ] Configuration of supported locales centralized in `i18n/config.ts`
- [ ] Test case: `/it/articles` rejects Italian, redirects to default

### AC9: Middleware sets i18n cookie

- [ ] Cookie name: `NEXT_LOCALE`
- [ ] Cookie value: language code (`fr` or `en`)
- [ ] Secure flag set: `secure=true` in production, `false` in dev
- [ ] HttpOnly flag set: `httpOnly=true` (cannot be accessed from JavaScript)
- [ ] SameSite policy: `SameSite=Lax` (allows cross-site navigation)
- [ ] Expiration: 1 year from now
- [ ] Test case: After accessing `/en/`, cookie `NEXT_LOCALE=en` exists with correct flags

### AC10: Middleware handles mobile deep links

- [ ] Middleware preserves language context when user navigates via app links
- [ ] Handles dynamic routes correctly: `/[lang]/articles/[slug]`
- [ ] Deep links with language preservation work across app
- [ ] Test case: User on `/fr/articles/my-post`, follows link to `/articles/another` → stays in `/fr/articles/another`

### AC11: Middleware logs language detection for debugging

- [ ] Console logs detected language source (URL, cookie, header, default)
- [ ] Logs helpful for debugging i18n issues
- [ ] Logs disabled in production or minimal
- [ ] Test case: Check logs show `Detected language: fr from cookie NEXT_LOCALE`

### AC12: No infinite redirects

- [ ] Middleware prevents redirect loops (e.g., `/fr` → `/fr` → `/fr`)
- [ ] Already-correct URLs pass through without redirect
- [ ] Test case: Request to `/fr/articles` does not redirect if already French

---

## 📋 Technical Requirements

### TR1: next-intl Integration

- Middleware must use next-intl's `middleware` plugin (not custom implementation)
- Configuration from `i18n/config.ts` with `defaultLocale`, `locales`, and routing mode
- Type-safe locale handling via TypeScript

### TR2: Cloudflare Workers Compatibility

- Middleware must work with Cloudflare Workers runtime (edge runtime constraints)
- No Node.js-only APIs (e.g., `fs`, `crypto` from Node.js)
- Cloudflare Web Crypto API used if needed

### TR3: Route Structure

- Assumes route groups in place: `app/[locale]/` wrapping main app routes
- Middleware routes to `[locale]` dynamic segment
- Cookie and language logic handled **before** Next.js routing

### TR4: Security

- Language parameter validated against whitelist (no arbitrary language codes)
- Cookie set with secure flags (HttpOnly, SameSite, Secure in prod)
- No XSS vulnerability via language parameter
- Middleware runs on edge (Cloudflare), not exposed to client

### TR5: Performance

- Middleware execution < 50ms (measured on Cloudflare edge)
- Early returns for public routes (avoid DB lookups, computations)
- No database calls in middleware

### TR6: Accessibility

- Language switching does not break focus management
- Keyboard navigation preserved across language switches
- ARIA labels respect selected language

---

## 🗂️ Files to Create/Modify

| File                      | Type      | Purpose                                                     |
| ------------------------- | --------- | ----------------------------------------------------------- |
| `src/middleware.ts`       | **Create** | Main middleware for i18n routing and language detection     |
| `i18n/config.ts`          | **Modify** | Add routing config for middleware (localePrefix, prefixMode) |
| `i18n/types.ts`           | **Modify** | Export locale types for middleware type safety             |
| `tsconfig.json`           | **Modify** | Register middleware path alias if needed                    |
| `.env.local` (dev)        | **Note**  | (Optional) Set `NEXT_PUBLIC_DEFAULT_LOCALE` if env-var driven |

---

## 🔗 Dependencies

### Blocking Dependencies (must complete first)

- **Story 1.1** (Install and configure next-intl)
  Reason: Middleware requires next-intl library and base configuration

- **Story 1.2** (Create message files)
  Reason: While not strictly required for middleware to function, message files should exist before testing i18n in components

### Unblocked By

- Story 1.4 (Bilingual URL structure) depends on this story
- Story 1.5 (Content fallback) depends on working middleware
- Story 1.7 (Language selector) depends on middleware for cookie handling

---

## 🧪 Testing Strategy

### Unit Tests (`vitest`)

- [ ] Language detection from URL
- [ ] Language detection from cookie
- [ ] Language detection from browser header
- [ ] Fallback to default language
- [ ] Redirect for unsupported languages
- [ ] Root path redirection
- [ ] Cookie setting and flags validation
- [ ] Exclusion of public routes

### Integration Tests (`vitest` + `@testing-library/react`)

- [ ] Middleware initializes i18n context correctly
- [ ] Components can access translations after middleware runs
- [ ] Locale persists across page navigation

### E2E Tests (`playwright`)

- [ ] User navigates to `/` → redirected to `/fr/` (French by default)
- [ ] User navigates to `/en/` → English page loads, cookie set
- [ ] User navigates to `/articles` → auto-redirects to `/fr/articles`
- [ ] Language header respected: Browser set to `en` → `/en/` auto-loaded
- [ ] Cookie persistence: After setting `NEXT_LOCALE=en`, revisit `/` → `/en/` loads
- [ ] Deep links work: Navigate to `/fr/articles/post-123`, language preserved
- [ ] Mobile: Language detection works on mobile viewports
- [ ] Invalid language: `/de/articles` redirects to `/fr/`

### Test Coverage Target

- Middleware unit tests: **≥ 80%** code coverage
- Integration tests: **All locale types** (fr, en) tested
- E2E tests: **All AC 1-12** verified with real browser

---

## 📊 Complexity & Estimates

### Story Complexity: **Medium-to-High** 🟡

**Rationale**:

- Middleware logic is straightforward but requires careful handling of multiple detection sources
- Edge cases: redirects, cookie handling, Cloudflare compatibility
- Testing complexity: E2E scenarios across locales, headers, cookies
- Integration with existing next-intl setup adds coordination overhead

### Estimated Timeline

- **Duration**: 4–6 days (mid-range for medium-high complexity)
- **Commit count**: 6–8 atomic commits
- **Phase count**: **3 phases** (see Phase Breakdown below)

---

## 🚀 Phase Breakdown

This story is decomposed into **3 atomic phases**:

### Phase 1: Foundation & Language Detection (1.5–2 days)

Implement core middleware with language detection logic (URL, cookie, header).

**Scope**:

- Create `src/middleware.ts` with basic structure
- Implement language detection from URL, cookie, and browser header
- Implement redirect for unsupported languages
- Type-safe locale validation
- Exclude public routes

**Deliverables**:

- Middleware function exported from `src/middleware.ts`
- Language detection working from URL, cookie, browser header
- Basic redirects in place
- Unit tests for detection logic

**Risk**: 🟢 Low (straightforward detection logic)

### Phase 2: Cookie Handling & next-intl Context (1.5–2 days)

Implement cookie persistence and next-intl context initialization.

**Scope**:

- Cookie creation with secure flags (HttpOnly, SameSite, Secure)
- Cookie retrieval and validation
- Root path redirection logic
- Integration with next-intl `middleware()` function
- Type-safe i18n context setup

**Deliverables**:

- Cookies created and persisted correctly
- next-intl context available in components
- Root path redirects to detected language
- Unit + integration tests

**Risk**: 🟡 Medium (cookie flags in Cloudflare, i18n integration)

### Phase 3: Testing, Debugging & Documentation (1–1.5 days)

Comprehensive testing, edge case handling, and documentation.

**Scope**:

- E2E tests for all AC 1-12
- Debug logging for language detection
- Edge case handling (infinite redirects, mobile, deep links)
- Performance testing (< 50ms execution)
- Documentation and examples

**Deliverables**:

- E2E test suite (≥ 80% coverage)
- Debug logs working
- Edge cases handled
- Performance verified
- README with implementation guide

**Risk**: 🟡 Medium (E2E stability, Cloudflare runtime variations)

---

## 🎯 Success Criteria (Story-Level)

This story is **complete** when:

- [ ] All 12 acceptance criteria (AC 1-12) are verified
- [ ] Unit test coverage ≥ 80%
- [ ] E2E tests pass for all locales (fr, en)
- [ ] Middleware executes in < 50ms on Cloudflare edge
- [ ] No TypeScript errors (`pnpm tsc`)
- [ ] ESLint + Prettier pass (`pnpm lint`)
- [ ] Documentation complete with examples
- [ ] EPIC_TRACKING.md updated with story status ✅

---

## 📚 Reference Documents

### PRD Requirements

- **EF19 - Internationalisation UI** (lines 202-211)
- **EF20 - Structure d'URL bilingue** (lines 213-221)
- **EPIC 1.3** (lines 643)

### Technical Architecture

- **Principes architecturaux Next.js/Cloudflare** (PRD lines 1027-1051)
- **i18n Implementation** (PRD lines 622)

### Related Stories

- Story 1.1: next-intl installation (dependency)
- Story 1.2: Message files (dependency)
- Story 1.4: Bilingual URL structure (blocked by this story)

### next-intl Documentation

- https://next-intl-docs.vercel.app/
- https://next-intl.dev/

---

## 📝 Notes

### Implementation Approach

The middleware will use the following detection priority (highest to lowest):

1. **URL prefix** (e.g., `/fr/` in path) → Use detected language, no redirect needed
2. **Language cookie** (`NEXT_LOCALE`) → Redirect to that language if missing from URL
3. **Browser Accept-Language header** → Detect from header, set cookie
4. **Default language** (French) → Fallback if all else fails

### Supported Locales

- `fr` (French) — Default language
- `en` (English) — Secondary language

### Edge Cases

- Unsupported languages (e.g., `/de/`) → Redirect to `/fr/` (preserve path + query)
- Root path `/` → Redirect to `/fr/` or `/en/` based on detection
- Invalid cookies → Reset to valid language
- Missing route groups → Middleware assumes `app/[locale]/` exists

---

**Story Specification Complete**
**Created**: 2025-11-16
**Ready for Phase Planning**: ✅
