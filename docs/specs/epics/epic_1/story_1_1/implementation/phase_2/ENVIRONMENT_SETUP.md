# Phase 2 - Environment Setup

This guide covers all environment setup needed for Phase 2 (Configuration File Creation and TypeScript Setup).

---

## 📋 Prerequisites

### Previous Phases

- [x] **Phase 1 completed and validated**
  - next-intl package installed (v4.5.3 or compatible with Next.js 15)
  - Package added to `package.json`
  - TypeScript types available from next-intl
  - No dependency conflicts

**Verification**:
```bash
# Verify next-intl is installed
pnpm list next-intl

# Should show: next-intl@4.5.3 (or similar compatible version)

# Verify no errors from Phase 1
pnpm tsc --noEmit
pnpm lint
```

### Tools Required

- [x] **Node.js** (v18+ for Next.js 15)
- [x] **pnpm** (project package manager)
- [x] **TypeScript** (v5.x, included in project)
- [x] **Next.js 15** (App Router)
- [x] **Code Editor** with TypeScript support (VS Code recommended)

**Verification**:
```bash
# Check Node.js version
node --version
# Should be v18.x or higher

# Check pnpm version
pnpm --version
# Any recent version (8.x+)

# Verify TypeScript is available
pnpm tsc --version
# Should show TypeScript 5.x
```

### Project Setup

- [x] Project cloned and dependencies installed
- [x] Next.js development server can start
- [x] TypeScript compilation works
- [x] ESLint configured and working

**Verification**:
```bash
# From project root
pnpm install

# Verify Next.js can build
pnpm build
# Should complete without errors

# Verify dev server starts
pnpm dev
# Should start on http://localhost:3000 (Ctrl+C to stop)
```

---

## 📦 Dependencies

### Required Packages (Already Installed)

Phase 2 uses packages installed in Phase 1. No new dependencies needed.

| Package     | Version       | Purpose                      | Installed In |
|-------------|---------------|------------------------------|--------------|
| `next-intl` | 4.5.3         | Internationalization library | Phase 1      |
| `next`      | 15.x          | Next.js framework            | Epic 0       |
| `react`     | 19.x          | React library                | Epic 0       |
| `typescript`| 5.x           | TypeScript compiler          | Epic 0       |

**Verification**:
```bash
# Check all required packages are installed
pnpm list next-intl next react typescript

# All should be present with correct versions
```

### No New Installations Required

Phase 2 is **pure configuration** - no new packages to install.

---

## 🔧 Environment Variables

### Current Environment

Phase 2 does **not require** any environment variables. Configuration is done in TypeScript files.

**No `.env` changes needed** for this phase.

### Future Environment Variables

Environment variables will be needed in later stories:

- **Story 1.3** (Middleware): May need locale detection settings
- **Story 1.4** (URL Structure): Route configuration
- **Story 1.6** (SEO): Canonical URL configuration

For Phase 2, **no environment setup required**. ✅

---

## 🗄️ File System Setup

### Directory Structure Preparation

Phase 2 will create files in the `src/i18n/` directory.

**Verify `src/` directory exists**:
```bash
# Check if src directory exists
ls -la src/

# If it doesn't exist, create it
mkdir -p src/
```

**Note**: The `src/i18n/` subdirectory will be created in Commit 1. No need to create it manually.

### Expected Directory Structure

After Phase 2, the structure will be:

```
src/
├── i18n/
│   ├── config.ts           # Created in Commits 1-3
│   ├── types.ts            # Created in Commit 4
│   ├── index.ts            # Created in Commit 4
│   └── README.md           # Created in Commit 5
├── app/                    # Existing Next.js app directory
├── components/             # Existing components
└── lib/                    # Existing utilities
```

### Path Aliases

Verify TypeScript path alias is configured for `@/`:

**Check `tsconfig.json`**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Verification**:
```bash
# Check tsconfig.json for path aliases
grep -A 3 '"paths"' tsconfig.json
```

If path aliases are configured, you can import from `@/i18n` instead of relative paths.

---

## 🔧 IDE Configuration

### VS Code (Recommended)

**Recommended Extensions**:
- **ESLint** (`dbaeumer.vscode-eslint`) - For linting
- **Prettier** (`esbenp.prettier-vscode`) - For formatting
- **TypeScript Error Lens** (optional) - Shows TypeScript errors inline

**Workspace Settings** (`.vscode/settings.json`):
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true
}
```

### TypeScript IntelliSense

Ensure TypeScript IntelliSense is working:

1. Open any `.ts` file in the project
2. Type `import { } from 'next-intl'` and check autocomplete
3. Should see `getRequestConfig` and other exports

**Troubleshooting**:
If IntelliSense doesn't work:
```bash
# Reload TypeScript server in VS Code
# Command Palette (Ctrl+Shift+P): "TypeScript: Restart TS Server"

# Or restart VS Code entirely
```

---

## ✅ Pre-Implementation Checklist

Complete this checklist **before starting Commit 1**:

### Phase 1 Validation

- [ ] Phase 1 completed successfully
- [ ] `next-intl` package installed and in `package.json`
- [ ] `pnpm list next-intl` shows correct version
- [ ] No dependency conflicts or warnings
- [ ] TypeScript recognizes `next-intl` types

### Development Environment

- [ ] Node.js v18+ installed
- [ ] pnpm installed and working
- [ ] Project dependencies installed (`pnpm install` completed)
- [ ] TypeScript compilation works (`pnpm tsc --noEmit` passes)
- [ ] ESLint works (`pnpm lint` passes or shows existing issues only)
- [ ] Next.js dev server can start (`pnpm dev` works)

### Project Structure

- [ ] `src/` directory exists
- [ ] `app/` directory exists (Next.js App Router)
- [ ] `tsconfig.json` configured with path aliases
- [ ] Git repository initialized (for commits)
- [ ] Working on correct branch (`story_1_1` or similar)

### IDE Setup

- [ ] Code editor with TypeScript support ready
- [ ] ESLint extension installed (if VS Code)
- [ ] TypeScript IntelliSense working
- [ ] Can see TypeScript errors in editor

### Git Setup

- [ ] Git configured with user name and email
- [ ] On correct branch for Story 1.1
- [ ] No uncommitted changes from previous work
- [ ] Ready to create 5 atomic commits

**Verification Command**:
```bash
# Verify git is ready
git status

# Should show clean working directory or only files from Phase 1
# Should be on story_1_1 branch (or appropriate feature branch)
```

---

## 🚨 Troubleshooting

### Issue: next-intl not found

**Symptoms**:
- TypeScript error: `Cannot find module 'next-intl/server'`
- Import statements show errors in IDE

**Solutions**:
1. Verify package is installed:
   ```bash
   pnpm list next-intl
   ```

2. Reinstall if needed:
   ```bash
   pnpm install
   ```

3. Restart TypeScript server in VS Code:
   - Command Palette: "TypeScript: Restart TS Server"

**Verify Fix**:
```bash
pnpm tsc --noEmit
# Should complete without errors about next-intl
```

---

### Issue: TypeScript path alias not working

**Symptoms**:
- Cannot import from `@/i18n`
- TypeScript error: `Cannot find module '@/i18n'`

**Solutions**:
1. Check `tsconfig.json` has path aliases:
   ```bash
   grep -A 5 '"paths"' tsconfig.json
   ```

2. Verify `baseUrl` is set:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

3. Restart TypeScript server

**Verify Fix**:
Try importing from `@/i18n` in a test file - should autocomplete.

---

### Issue: ESLint errors

**Symptoms**:
- ESLint shows errors unrelated to your changes
- Cannot pass `pnpm lint`

**Solutions**:
1. Check if errors existed before Phase 2:
   ```bash
   git stash
   pnpm lint
   git stash pop
   ```

2. Fix only new errors introduced by your changes

3. If pre-existing errors block you, discuss with team

**Note**: You are only responsible for passing linter on files you modify.

---

### Issue: Dev server won't start

**Symptoms**:
- `pnpm dev` fails with errors
- Server crashes on startup

**Solutions**:
1. Check for syntax errors in existing code:
   ```bash
   pnpm tsc --noEmit
   ```

2. Clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm dev
   ```

3. Verify all dependencies installed:
   ```bash
   pnpm install
   ```

**Verify Fix**:
```bash
pnpm dev
# Should start on http://localhost:3000
```

---

## 📝 Environment Setup Checklist

Before starting implementation:

- [ ] All prerequisites verified
- [ ] Phase 1 completed and validated
- [ ] Development environment ready (Node, pnpm, TypeScript)
- [ ] Project dependencies installed
- [ ] TypeScript compilation works
- [ ] ESLint configured
- [ ] Dev server can start
- [ ] Git ready for commits
- [ ] IDE configured with TypeScript support
- [ ] `src/` directory exists
- [ ] No blocking issues

**Environment is ready! 🚀**

---

## 🔗 Next Steps

Once environment setup is complete:

1. **Read** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the atomic commit strategy
2. **Follow** [COMMIT_CHECKLIST.md](./COMMIT_CHECKLIST.md) for each commit
3. **Validate** using [guides/TESTING.md](./guides/TESTING.md) after each commit
4. **Complete** [validation/VALIDATION_CHECKLIST.md](./validation/VALIDATION_CHECKLIST.md) when done

**Ready to start Commit 1!** 🎯
