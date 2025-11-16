# Story 1.1 - Install and Configure next-intl

**Epic**: Epic 1 - Internationalisation (i18n)
**Status**: 📋 NOT STARTED
**Created**: 2025-11-16

---

## 📖 Story Overview

### Description

This story establishes the foundation for the entire i18n system by installing and configuring next-intl, the recommended internationalization solution for Next.js 15 App Router. next-intl provides type-safe translations, automatic language detection, and seamless integration with React Server Components.

The configuration will set up the core infrastructure that all subsequent i18n stories will build upon, including the base configuration file, locale detection logic, and integration points with Next.js.

### Source

- **PRD**: Line 641 - "**1.1** Installer et configurer next-intl : `npm install next-intl`"
- **Technical Principles**: Lines 1027-1051 - next-intl is the reference solution for App Router
- **Brief**: Lines 66-70, 103-107 - Internationalization requirements

---

## 🎯 Objectives

1. Install next-intl package and dependencies
2. Create base next-intl configuration file
3. Set up locale detection and management
4. Configure TypeScript types for translations
5. Integrate with Next.js 15 App Router patterns
6. Prepare foundation for middleware implementation (Story 1.3)

---

## ✅ Acceptance Criteria

Based on **EF19 (Internationalisation UI)** from PRD lines 202-211:

- **AC1**: next-intl package installed and version documented in package.json
- **AC2**: Configuration file created with supported locales (fr, en)
- **AC3**: TypeScript setup for type-safe translations
- **AC4**: Default locale configured (fr as per PRD line 219)
- **AC5**: Configuration validated with Next.js 15 App Router compatibility
- **AC6**: Documentation created for i18n configuration
- **AC7**: All configuration files pass TypeScript compilation
- **AC8**: No runtime errors when Next.js server starts

---

## 🔗 Dependencies

### Requires (must be completed first)

- ✅ Epic 0 completed (Next.js 15 project initialized)
- ✅ Next.js 15 with App Router configured
- ✅ TypeScript properly set up
- ✅ Basic project structure in place

### Blocks (this story must complete before)

- Story 1.2: Create message files (needs configuration to define structure)
- Story 1.3: Create Next.js middleware (needs base config)
- Story 1.4: Bilingual URL structure (needs config and middleware)
- All other i18n stories depend on this foundation

### External Dependencies

- npm package: `next-intl` (latest stable version compatible with Next.js 15)
- Next.js 15.x
- React 19.x
- TypeScript 5.x

---

## 📋 Technical Requirements

### Configuration Files to Create

1. **i18n configuration** (`src/i18n/config.ts` or `i18n.ts` at root)
   - Supported locales: `['fr', 'en']`
   - Default locale: `'fr'`
   - Locale detection strategy

2. **TypeScript types** (if needed)
   - Type definitions for translation keys
   - Locale type definitions

3. **next-intl request configuration** (for Server Components)
   - `getRequestConfig()` function
   - Locale-specific message loading preparation

### Integration Points

- Next.js 15 App Router
- React Server Components
- TypeScript strict mode
- Future middleware (Story 1.3)

### Technical Constraints

- Must work with Next.js 15 App Router (not Pages Router)
- Must support React Server Components
- Must be compatible with Cloudflare Workers runtime (via OpenNext)
- Must follow next-intl best practices for App Router (2024-2025 patterns)
- Configuration must support server-side rendering

---

## 🎨 User Value

This story delivers no direct user-facing features, but it is **critical infrastructure** that enables:

- Users to experience the entire website in their preferred language (French or English)
- Automatic language detection based on browser preferences
- Type-safe development preventing translation errors
- Maintainable i18n architecture for future features

---

## 📊 Success Metrics

- **Configuration validity**: TypeScript compilation passes with no errors
- **Server compatibility**: Next.js dev server starts without i18n errors
- **Documentation completeness**: Configuration documented and reviewable
- **Foundation readiness**: Ready for Stories 1.2-1.7 to build upon

---

## 🔍 Technical Notes

### next-intl App Router Pattern (2025)

According to next-intl documentation for App Router:

1. **Install**: `npm install next-intl`
2. **Configuration file**: Create `i18n.ts` or `src/i18n/config.ts`
3. **Request configuration**: Export `getRequestConfig()` for Server Components
4. **No middleware yet**: Middleware is Story 1.3 (separate phase)

### File Structure

```
/
├── messages/              # Created in Story 1.2
│   ├── fr.json
│   └── en.json
├── src/
│   ├── i18n/
│   │   └── config.ts      # This story creates this
│   └── middleware.ts      # Story 1.3 creates this
└── i18n.ts               # OR at root (pattern decision)
```

### Configuration Example (Reference)

```typescript
// This is what we'll create (simplified example)
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}));
```

### Cloudflare Workers Compatibility

- next-intl works with edge runtimes
- No Node.js-specific APIs used
- Compatible with OpenNext adapter
- Server Components pattern works on Workers

---

## 📚 Reference Documents

### PRD References

- **Epic 1**: Lines 639-647 (i18n epic overview)
- **EF19**: Lines 202-211 (Internationalisation UI requirements)
- **EF20**: Lines 213-221 (Bilingual URL structure - future stories)
- **Technical Principles**: Line 1046 "i18n avec next-intl"

### Project Documentation

- **Brief**: Lines 66-70, 103-107 (i18n requirements)
- **Concept**: Lines 103-107 (multilingual content)
- **CLAUDE.md**: Project guidelines

### External Resources

- next-intl documentation: https://next-intl-docs.vercel.app/
- Next.js 15 App Router i18n: https://nextjs.org/docs/app/building-your-application/routing/internationalization

---

## ⚠️ Risks & Mitigations

### Risk 1: Version Compatibility 🟡 Medium

**Risk**: next-intl version incompatible with Next.js 15 or React 19
**Impact**: Configuration errors, runtime failures
**Mitigation**:
- Check next-intl changelog for Next.js 15 compatibility
- Use latest stable version
- Test server start immediately after installation
**Contingency**: Pin to last known compatible version, report issue

### Risk 2: TypeScript Configuration 🟢 Low

**Risk**: TypeScript types not properly configured
**Impact**: Loss of type safety
**Mitigation**:
- Follow next-intl TypeScript setup guide
- Validate with `pnpm tsc --noEmit`
**Contingency**: Manual type definitions if needed

### Risk 3: Cloudflare Workers Compatibility 🟢 Low

**Risk**: next-intl uses Node.js-specific APIs incompatible with Workers
**Impact**: Build or runtime failures
**Mitigation**:
- next-intl is designed for edge runtimes
- OpenNext adapter handles compatibility
- Test build early
**Contingency**: Unlikely, but could use alternative if needed

---

## 🚀 Implementation Phases

This story will be broken down into atomic phases in `PHASES_PLAN.md`.

Expected phases (preview):
1. Package installation and dependency validation
2. Configuration file creation and TypeScript setup
3. Integration validation and documentation

See `implementation/PHASES_PLAN.md` for detailed breakdown.

---

**Story Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Ready for Phase Planning**: ✅ Yes
