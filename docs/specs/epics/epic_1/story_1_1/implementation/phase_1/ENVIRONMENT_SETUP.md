# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1.

---

## 📋 Prerequisites

### Previous Phases

- [x] Epic 0 completed (Next.js 15 project initialized)
- [x] Next.js 15 with App Router configured
- [x] TypeScript properly set up
- [x] pnpm package manager installed

### Tools Required

- [ ] **Node.js** (version 18.17.0+ or 20.0.0+)
- [ ] **pnpm** (version 8.0.0+)
- [ ] **Git** (for commits)
- [ ] **Code editor** with TypeScript support (VS Code recommended)

### Services Required

- None (Phase 1 only installs a package, no external services)

---

## 📦 Verify Existing Setup

Before starting Phase 1, verify your environment:

```bash
# Check Node.js version
node --version
# Should output: v18.17.0 or higher, or v20.0.0 or higher

# Check pnpm version
pnpm --version
# Should output: 8.0.0 or higher

# Check TypeScript is configured
cat tsconfig.json | jq .compilerOptions.strict
# Should output: true

# Verify Next.js 15 is installed
pnpm list next
# Should show next@15.x.x

# Verify React 19 is installed
pnpm list react
# Should show react@19.x.x

# Check project builds successfully
pnpm build
# Should complete without errors
```

**All checks should pass before proceeding with Phase 1.**

---

## 🔧 Environment Variables

### Required Variables

**None** - Phase 1 does not require any environment variables. Package installation works with existing project configuration.

### Optional Variables

**None** for Phase 1.

**Note**: Future phases (Phase 2+) may require environment variables for i18n configuration, but Phase 1 only installs the dependency.

---

## 📊 Project Structure Verification

Ensure the following structure exists:

```
/home/negus/dev/website/
├── package.json          ✅ Must exist
├── pnpm-lock.yaml        ✅ Must exist
├── tsconfig.json         ✅ Must exist
├── next.config.js        ✅ Must exist
├── app/                  ✅ Must exist (Next.js App Router)
├── lib/                  ✅ May exist
├── components/           ✅ May exist
└── docs/                 ✅ Contains this documentation
```

**Verify**:
```bash
# Check key files exist
ls -la package.json pnpm-lock.yaml tsconfig.json next.config.js

# Check app directory exists (Next.js App Router)
ls -la app/

# All should exist - no "No such file or directory" errors
```

---

## 🗄️ Package Manager Setup

### pnpm Configuration

The project uses **pnpm** as the package manager:

```bash
# Verify pnpm is installed globally
which pnpm
# Should output a path like: /usr/local/bin/pnpm or similar

# If pnpm is not installed, install it
npm install -g pnpm

# Verify pnpm can access the registry
pnpm ping
# Should output: PONG
```

### Package Registry

Default registry is npm (https://registry.npmjs.org/):

```bash
# Check configured registry
pnpm config get registry
# Should output: https://registry.npmjs.org/

# If using a custom registry, ensure next-intl is available
pnpm info next-intl
# Should show package information
```

---

## ✅ Pre-Installation Checklist

Before running Commit 2 (package installation), verify:

- [ ] Node.js version is 18.17.0+ or 20.0.0+
- [ ] pnpm is installed and accessible
- [ ] pnpm can reach npm registry (`pnpm ping`)
- [ ] Project builds successfully (`pnpm build`)
- [ ] TypeScript compiles without errors (`pnpm tsc --noEmit`)
- [ ] No existing i18n libraries installed (check package.json)
- [ ] Git working directory is clean (no uncommitted changes)

**Validation**:
```bash
# Complete pre-installation check script
echo "Node.js: $(node --version)"
echo "pnpm: $(pnpm --version)"
echo "Registry: $(pnpm config get registry)"
echo "Build status:"
pnpm build && echo "✅ Build successful" || echo "❌ Build failed"
echo "TypeScript:"
pnpm tsc --noEmit && echo "✅ No errors" || echo "❌ Errors found"
echo "Git status:"
git status --short
```

---

## 🚨 Troubleshooting

### Issue: pnpm not found

**Symptoms**:
- `command not found: pnpm`
- Cannot run pnpm commands

**Solutions**:

1. **Install pnpm globally**:
   ```bash
   npm install -g pnpm
   ```

2. **Verify installation**:
   ```bash
   pnpm --version
   ```

3. **If still not found, check PATH**:
   ```bash
   echo $PATH
   # Ensure npm global bin directory is in PATH
   ```

**Verify Fix**:
```bash
pnpm --version
# Should output version number
```

---

### Issue: Node.js version too old

**Symptoms**:
- Node version < 18.17.0
- Warnings about unsupported Node version

**Solutions**:

1. **Check current version**:
   ```bash
   node --version
   ```

2. **Upgrade Node.js** (using nvm recommended):
   ```bash
   # Install nvm if not already installed
   # Then install latest LTS:
   nvm install --lts
   nvm use --lts
   ```

3. **Verify upgrade**:
   ```bash
   node --version
   # Should be 18.17.0+ or 20.0.0+
   ```

**Verify Fix**:
```bash
node --version && pnpm --version
```

---

### Issue: Cannot reach npm registry

**Symptoms**:
- `pnpm ping` fails
- Cannot install packages
- Network timeout errors

**Solutions**:

1. **Check internet connection**:
   ```bash
   ping -c 3 registry.npmjs.org
   ```

2. **Check proxy settings** (if behind corporate proxy):
   ```bash
   pnpm config get proxy
   pnpm config get https-proxy
   # Set if needed:
   # pnpm config set proxy http://proxy.company.com:8080
   ```

3. **Try alternative registry** (if npm is down):
   ```bash
   # Temporary: use yarn registry mirror
   pnpm config set registry https://registry.yarnpkg.com
   ```

**Verify Fix**:
```bash
pnpm ping
# Should output: PONG
```

---

### Issue: Existing i18n library conflicts

**Symptoms**:
- `react-i18next` or other i18n library already installed
- Peer dependency conflicts during installation

**Solutions**:

1. **Check for existing i18n libraries**:
   ```bash
   grep -E "(i18n|intl)" package.json
   ```

2. **Remove conflicting libraries** (if safe to do so):
   ```bash
   pnpm remove react-i18next # Or other i18n library
   ```

3. **Consult team** if unsure about removal

**Verify Fix**:
```bash
grep -E "(i18n|intl)" package.json
# Should only show next-intl after Phase 1 Commit 2
```

---

### Issue: TypeScript compilation fails

**Symptoms**:
- `pnpm tsc --noEmit` shows errors
- Errors unrelated to next-intl

**Solutions**:

1. **Review error messages**:
   ```bash
   pnpm tsc --noEmit 2>&1 | head -20
   ```

2. **Fix TypeScript errors before Phase 1**:
   - Phase 1 requires a clean TypeScript compilation
   - Resolve all existing errors first

3. **Verify tsconfig.json is valid**:
   ```bash
   cat tsconfig.json | jq .
   ```

**Verify Fix**:
```bash
pnpm tsc --noEmit
# Should exit with code 0 (no errors)
echo $?
```

---

## 📝 Setup Checklist

Complete this checklist before starting implementation:

- [ ] All prerequisites met (Node.js, pnpm, Git)
- [ ] Project structure verified
- [ ] Package manager configured and accessible
- [ ] Pre-installation checks pass
- [ ] No conflicting i18n libraries
- [ ] Git working directory clean
- [ ] TypeScript compiles successfully
- [ ] Next.js builds successfully

**Environment is ready! 🚀**

---

## 🔗 Additional Resources

- **Node.js Installation**: https://nodejs.org/
- **pnpm Installation**: https://pnpm.io/installation
- **Next.js Documentation**: https://nextjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

**Setup Guide Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Environment**: Next.js 15 + React 19 + Cloudflare Workers
