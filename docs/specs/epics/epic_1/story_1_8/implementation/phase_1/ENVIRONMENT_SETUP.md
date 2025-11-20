# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1.

---

## 📋 Prerequisites

### Previous Phases

- [ ] Story 1.1: Installation next-intl - COMPLETED
- [ ] Story 1.2: Message files - COMPLETED
- [ ] Story 1.3: Middleware - IN PROGRESS or COMPLETED

### Tools Required

- [ ] Node.js (v20.x+)
- [ ] pnpm (v8.x+)
- [ ] TypeScript (v5.x+)

### Project State

- [ ] Current `i18n/` folder exists with old implementation
- [ ] `messages/fr.json` and `messages/en.json` exist
- [ ] Middleware.ts with i18n configuration exists
- [ ] next-intl v4.5.3+ installed

---

## 📦 Dependencies Check

### Verify Installed Packages

```bash
# Check next-intl version
pnpm list next-intl
```

**Required**: `next-intl@^4.5.3`

### No New Packages Needed

Phase 1 does not require any new dependencies. It restructures existing code only.

---

## 🔧 Environment Variables

### No New Variables Required

Phase 1 uses existing environment configuration. No changes to `.env.local` needed.

### Existing Variables (for reference)

```env
# These should already exist
# No i18n-specific env vars required
```

---

## 📂 Directory Structure Before Phase 1

```
/home/negus/dev/website/
├── i18n/                    # OLD - to be replaced
│   ├── config.ts
│   ├── types.ts
│   ├── index.ts
│   └── README.md
├── messages/
│   ├── fr.json
│   └── en.json
├── middleware.ts
├── app/
│   └── page.tsx
└── src/                     # Will create src/i18n/ here
```

### Expected Structure After Phase 1

```
/home/negus/dev/website/
├── src/
│   └── i18n/               # NEW
│       ├── routing.ts
│       ├── request.ts
│       ├── types.ts
│       └── index.ts
├── messages/
│   ├── fr.json
│   └── en.json
├── middleware.ts           # UPDATED
└── app/
    └── page.tsx
# i18n/ folder DELETED
```

---

## 🔍 Pre-Implementation Checks

### Check 1: Verify Current i18n Structure

```bash
ls -la i18n/
```

**Expected Output**:
```
config.ts
index.ts
types.ts
README.md
```

### Check 2: Verify Messages Files

```bash
ls -la messages/
```

**Expected Output**:
```
en.json
fr.json
```

### Check 3: Check Current Imports

```bash
grep -r "from.*['\"].*i18n" --include="*.ts" --include="*.tsx" .
```

Note all files that import from i18n - these need updating in Commit 4.

### Check 4: Verify TypeScript Configuration

```bash
cat tsconfig.json | grep -A 5 "paths"
```

Check if `@/*` path alias is configured. Should point to root or src.

### Check 5: Ensure Clean State

```bash
git status
pnpm tsc --noEmit
pnpm test
```

**Expected**: No uncommitted changes, no TypeScript errors, tests pass.

---

## 🚨 Troubleshooting

### Issue: src/ directory doesn't exist

**Symptoms**:
- Cannot create `src/i18n/routing.ts`

**Solution**:
```bash
mkdir -p src/i18n
```

---

### Issue: Import alias @/ not resolving

**Symptoms**:
- TypeScript error: Cannot find module '@/src/i18n'

**Solutions**:

1. Check `tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. Or use relative imports temporarily

---

### Issue: next-intl version mismatch

**Symptoms**:
- Import errors for `defineRouting` or `createNavigation`

**Solutions**:

1. Check version:
```bash
pnpm list next-intl
```

2. Update if needed:
```bash
pnpm update next-intl
```

**Required**: v4.5.3+ for new APIs

---

### Issue: Messages files not found

**Symptoms**:
- Error loading messages in request.ts

**Solutions**:

1. Verify path in request.ts matches actual location:
```typescript
// If messages are in /messages:
messages: (await import(`../../messages/${locale}.json`)).default

// Adjust relative path based on src/i18n location
```

---

## 📝 Setup Checklist

Complete this checklist before starting implementation:

- [ ] Node.js v20+ installed
- [ ] pnpm installed and working
- [ ] next-intl v4.5.3+ installed
- [ ] Current i18n/ folder exists
- [ ] Messages files exist (fr.json, en.json)
- [ ] TypeScript compiles without errors
- [ ] Tests pass
- [ ] Git working tree clean
- [ ] Identified all files with i18n imports

**Environment is ready! 🚀**

---

## 🔗 Reference Links

- [next-intl App Router Setup](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing)
- [next-intl Routing](https://next-intl.dev/docs/routing)
- [Technical Reference](/docs/tech/cloudflare-workers/cloudflare-nextjs-nextintl.md)
