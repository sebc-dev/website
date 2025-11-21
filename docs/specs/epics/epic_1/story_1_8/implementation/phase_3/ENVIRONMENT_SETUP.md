# Phase 3 - Environment Setup

**Story**: 1.8 - Correction Architecture next-intl
**Phase**: Internationalisation de la page d'accueil

---

## Prerequisites

### Completed Phases

Before starting Phase 3, ensure:

- [ ] **Phase 1** completed: `src/i18n/` structure exists
  - `src/i18n/routing.ts`
  - `src/i18n/request.ts`
  - `src/i18n/types.ts`
  - `src/i18n/index.ts`

- [ ] **Phase 2** completed: `app/[locale]/` structure exists
  - `app/[locale]/layout.tsx` with `NextIntlClientProvider`
  - Middleware configured for locale routing
  - `/fr` and `/en` routes respond

### Dependencies

| Package     | Required Version | Purpose              |
| ----------- | ---------------- | -------------------- |
| `next-intl` | ^4.5.3           | Internationalization |
| `next`      | ^15.0.0          | Framework            |
| `react`     | ^19.0.0          | UI Library           |

Check versions:

```bash
pnpm list next-intl next react
```

---

## Project State Verification

### Verify i18n Structure

```bash
# Check src/i18n/ files exist
ls -la src/i18n/

# Expected output:
# routing.ts
# request.ts
# types.ts
# index.ts
```

### Verify Layout Structure

```bash
# Check app/[locale]/ structure
ls -la app/\[locale\]/

# Expected output:
# layout.tsx
# not-found.tsx (optional at this point)
```

### Verify Messages Files

```bash
# Check messages directory
ls -la messages/

# Expected output:
# en.json
# fr.json
```

### Test Current State

```bash
# TypeScript should compile
pnpm tsc

# Lint should pass
pnpm lint

# Tests should pass
pnpm test

# Dev server should work
pnpm dev
```

Then verify:

- [ ] http://localhost:3000/fr responds
- [ ] http://localhost:3000/en responds

---

## Development Environment

### Required Tools

| Tool    | Purpose           |
| ------- | ----------------- |
| VS Code | IDE (recommended) |
| pnpm    | Package manager   |
| Git     | Version control   |

### Recommended VS Code Extensions

- ESLint
- Tailwind CSS IntelliSense
- Prettier
- i18n Ally (for translation management)

### Terminal Setup

Open two terminals:

1. **Dev Server**:

   ```bash
   pnpm dev
   ```

2. **Watch Tests** (optional):
   ```bash
   pnpm test:watch
   ```

---

## Files to Reference

Before starting, familiarize yourself with:

### Source Files

| File                      | Purpose                           |
| ------------------------- | --------------------------------- |
| `app/page.tsx`            | Current homepage (to be migrated) |
| `messages/fr.json`        | French translations               |
| `messages/en.json`        | English translations              |
| `app/[locale]/layout.tsx` | Locale layout with Provider       |

### Documentation

| File                                                         | Purpose             |
| ------------------------------------------------------------ | ------------------- |
| `docs/specs/epics/epic_1/story_1_8/story_1.8.md`             | Story specification |
| `docs/tech/cloudflare-workers/cloudflare-nextjs-nextintl.md` | Technical reference |
| `CLAUDE.md`                                                  | Project conventions |

---

## Pre-Implementation Checklist

### Understand Current Homepage

- [ ] Read `app/page.tsx` completely
- [ ] Note all text content to be translated
- [ ] Note all CSS classes (especially animations)
- [ ] Take screenshot for visual comparison later

### Understand Message Structure

- [ ] Review `messages/fr.json` structure
- [ ] Review `messages/en.json` structure
- [ ] Note existing namespaces (common, nav, footer, etc.)

### Understand next-intl Usage

- [ ] Know how to use `useTranslations()`
- [ ] Know how to use `t.rich()` for interpolation
- [ ] Know how to use `getTranslations()` for server components

---

## Expected Outcomes

After Phase 3 completion:

1. **New Files**:
   - `app/[locale]/page.tsx`

2. **Modified Files**:
   - `messages/fr.json` (+14 keys: 10 home + 4 metadata)
   - `messages/en.json` (+14 keys: 10 home + 4 metadata)

3. **Deleted Files**:
   - `app/page.tsx`

4. **Functionality**:
   - `/fr` shows French homepage
   - `/en` shows English homepage
   - All animations preserved
   - Visual design unchanged

---

## Troubleshooting

### Common Issues

#### "Cannot find module 'next-intl'"

```bash
pnpm install
```

#### TypeScript errors in translations

Ensure `messages/fr.json` and `messages/en.json` have identical keys.

#### Page not rendering

Check that `NextIntlClientProvider` is properly configured in `app/[locale]/layout.tsx`.

#### Animations not working

Ensure all Tailwind classes are copied exactly from the original `app/page.tsx`.

### Getting Help

- Check `docs/tech/cloudflare-workers/cloudflare-nextjs-nextintl.md`
- Review next-intl documentation: https://next-intl.dev
- Ask for clarification if needed

---

**Environment Setup Created**: 2025-11-20
