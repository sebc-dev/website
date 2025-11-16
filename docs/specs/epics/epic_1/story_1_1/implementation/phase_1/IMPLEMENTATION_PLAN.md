# Phase 1 - Atomic Implementation Plan

**Objective**: Install next-intl package and validate compatibility with Next.js 15, React 19, and Cloudflare Workers runtime.

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **4 independent commits** to:

✅ **Facilitate review** - Each commit focuses on a single responsibility
✅ **Enable rollback** - If a commit has issues, revert it without breaking everything
✅ **Progressive validation** - Verify compatibility at each step
✅ **Clear documentation** - Each commit represents a logical milestone
✅ **Risk mitigation** - Early detection of incompatibility issues

### Global Strategy

```
[Research] → [Install] → [Validate] → [Document]
     ↓          ↓          ↓            ↓
  Version   Package   TypeScript    Edge Ready
   Check    Added     Compiles      Confirmed
```

---

## 📦 The 4 Atomic Commits

### Commit 1: Research and verify next-intl compatibility

**Files**: None (research only, documented in commit message)
**Size**: 0 lines (documentation commit)
**Duration**: 15-20 min (implementation) + 10-15 min (review)

**Content**:
- Research next-intl compatibility with Next.js 15
- Check next-intl changelog and documentation
- Verify React 19 compatibility
- Identify latest stable version number
- Document findings in commit message

**Why it's atomic**:
- Single responsibility: research and document compatibility
- No code changes - pure documentation
- Can be validated by reviewing commit message
- Provides clear rationale for version choice in Commit 2

**Technical Validation**:
```bash
# No technical validation needed - this is a research commit
# Validation is through commit message content
```

**Expected Result**: Commit message documents:
- Latest next-intl stable version
- Next.js 15 compatibility confirmed
- React 19 compatibility confirmed
- Edge runtime support confirmed

**Review Criteria**:
- [ ] Commit message includes specific next-intl version researched
- [ ] Next.js 15 compatibility explicitly confirmed
- [ ] React 19 compatibility explicitly confirmed
- [ ] Edge runtime compatibility mentioned
- [ ] Links to documentation/changelog included

---

### Commit 2: Install next-intl package

**Files**: `package.json`, `pnpm-lock.yaml`
**Size**: ~10 lines (package.json), ~500+ lines (lockfile)
**Duration**: 10-15 min (implementation) + 10-15 min (review)

**Content**:
- Run `pnpm add next-intl`
- Verify package added to dependencies (not devDependencies)
- Check pnpm lockfile updated correctly
- Confirm no peer dependency warnings
- Document installed version in commit message

**Why it's atomic**:
- Single responsibility: add package dependency
- Independent of configuration (Phase 2)
- Can be tested immediately (pnpm install succeeds)
- Minimal diff (clear to review)

**Technical Validation**:
```bash
# Verify installation succeeded
pnpm install

# Check next-intl is in dependencies
cat package.json | grep next-intl

# Verify no warnings or errors
echo "Check terminal output for warnings"
```

**Expected Result**:
- `next-intl` appears in `dependencies` section of package.json
- `pnpm-lock.yaml` updated with next-intl and its dependencies
- No peer dependency warnings in terminal
- Installation completes successfully

**Review Criteria**:
- [ ] next-intl added to `dependencies` (not `devDependencies`)
- [ ] Version matches the researched stable version from Commit 1
- [ ] pnpm-lock.yaml updated (file changed)
- [ ] No extraneous packages added
- [ ] Commit message documents exact version installed

---

### Commit 3: Verify TypeScript types and compilation

**Files**: None (validation commit - may create temporary test file)
**Size**: 0-20 lines (if creating test file)
**Duration**: 15-20 min (implementation) + 10-15 min (review)

**Content**:
- Verify TypeScript recognizes next-intl types
- Run `pnpm tsc --noEmit` to check compilation
- Optionally create simple import test (can be deleted)
- Verify no TypeScript errors related to next-intl
- Document TypeScript validation in commit message

**Why it's atomic**:
- Single responsibility: validate TypeScript integration
- Independent validation step
- Can include temporary test code if needed
- Proves types are available before Phase 2 configuration

**Technical Validation**:
```bash
# TypeScript compilation check
pnpm tsc --noEmit

# Optional: Create temporary test file to verify import
cat > /tmp/test-next-intl.ts << 'EOF'
import {getRequestConfig} from 'next-intl/server';
// If this compiles, types are working
EOF

# Check TypeScript recognizes the import
pnpm tsc --noEmit /tmp/test-next-intl.ts
```

**Expected Result**:
- TypeScript compilation passes with no errors
- next-intl types are recognized
- Import statements for next-intl work correctly
- No type definition warnings

**Review Criteria**:
- [ ] `pnpm tsc --noEmit` passes successfully
- [ ] Commit message confirms TypeScript types validated
- [ ] No errors related to next-intl types
- [ ] If test file created, it's documented in commit message
- [ ] Test file deleted if temporary (or kept with explanation)

---

### Commit 4: Document installation and validate edge compatibility

**Files**: `package.json` (may add comment), possibly `CLAUDE.md` or docs
**Size**: ~5-15 lines
**Duration**: 15-20 min (implementation) + 15-20 min (review)

**Content**:
- Add comment in package.json documenting next-intl purpose (optional)
- Verify edge runtime compatibility (next-intl supports edge)
- Document Cloudflare Workers compatibility confirmation
- Update project documentation if needed (CLAUDE.md)
- Confirm installation complete and ready for Phase 2

**Why it's atomic**:
- Single responsibility: documentation and edge validation
- Final verification before Phase 2
- Provides clear "Phase 1 complete" milestone
- Documents any compatibility notes for team

**Technical Validation**:
```bash
# Verify Next.js dev server starts with new dependency
pnpm dev

# Check for console warnings/errors on startup
# Press Ctrl+C to stop server after verifying startup

# Confirm package.json is valid JSON
cat package.json | jq . > /dev/null && echo "Valid JSON"
```

**Expected Result**:
- Next.js dev server starts without errors
- No console warnings related to next-intl
- Documentation updated with installation notes
- Edge runtime compatibility confirmed

**Review Criteria**:
- [ ] Next.js server starts successfully with next-intl installed
- [ ] No warnings or errors in console
- [ ] Edge runtime compatibility documented
- [ ] Commit message summarizes Phase 1 completion
- [ ] Documentation updated (if needed)

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Review PHASES_PLAN.md Phase 1 section
2. **Setup environment**: Ensure pnpm installed, Next.js 15 project ready
3. **Implement Commit 1**: Research compatibility
4. **Validate Commit 1**: Review commit message for completeness
5. **Commit Commit 1**: Use provided template
6. **Implement Commit 2**: Install package
7. **Validate Commit 2**: Run `pnpm install`, check for warnings
8. **Commit Commit 2**: Document installed version
9. **Implement Commit 3**: Validate TypeScript
10. **Validate Commit 3**: Run `pnpm tsc --noEmit`
11. **Commit Commit 3**: Document validation
12. **Implement Commit 4**: Final documentation
13. **Validate Commit 4**: Start dev server, check for errors
14. **Commit Commit 4**: Complete Phase 1
15. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit:
```bash
# Ensure package.json is valid
cat package.json | jq . > /dev/null

# Check TypeScript compilation
pnpm tsc --noEmit

# Verify linter passes
pnpm lint
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit | Files | Lines  | Implementation | Review  | Total   |
| ------ | ----- | ------ | -------------- | ------- | ------- |
| 1. Research compatibility | 0 | 0 | 15-20 min | 10-15 min | 25-35 min |
| 2. Install package | 2 | ~510 | 10-15 min | 10-15 min | 20-30 min |
| 3. Validate TypeScript | 0-1 | 0-20 | 15-20 min | 10-15 min | 25-35 min |
| 4. Document & validate edge | 1-2 | 5-15 | 15-20 min | 15-20 min | 30-40 min |
| **TOTAL** | **2-5** | **~515-545** | **55-75 min** | **45-65 min** | **1.7-2.3h** |

---

## ✅ Atomic Approach Benefits

### For Developers

- 🎯 **Clear focus**: One task at a time (research, install, validate, document)
- 🧪 **Testable**: Each commit can be validated independently
- 📝 **Documented**: Clear progression in git history

### For Reviewers

- ⚡ **Fast review**: 10-20 min per commit (4 commits ≈ 45-65 min total)
- 🔍 **Focused**: Single responsibility per commit makes review easier
- ✅ **Quality**: Easy to spot issues (wrong version, missing validation, etc.)

### For the Project

- 🔄 **Rollback-safe**: Can revert individual commits if needed
- 📚 **Historical**: Git history shows clear installation process
- 🏗️ **Maintainable**: Future team members understand why/how package was added

---

## 📝 Best Practices

### Commit Messages

Format:
```
type(scope): short description (max 50 chars)

- Point 1: detail
- Point 2: detail
- Point 3: justification/link if needed

Part of Phase 1 - Commit X/4
```

**Types**: `chore` (for installation), `docs` (for documentation), `test` (for validation)

**Examples**:

Commit 1:
```
chore(i18n): research next-intl compatibility with Next.js 15

- Latest stable version: next-intl@3.x.x
- Next.js 15 compatibility: Confirmed (check changelog)
- React 19 compatibility: Confirmed
- Edge runtime support: Yes (supports Cloudflare Workers)
- Documentation: https://next-intl-docs.vercel.app/

Part of Phase 1 - Commit 1/4
```

Commit 2:
```
chore(i18n): install next-intl package

- Installed next-intl@3.x.x
- Added to dependencies (not devDependencies)
- No peer dependency warnings
- pnpm lockfile updated

Part of Phase 1 - Commit 2/4
```

Commit 3:
```
test(i18n): verify next-intl TypeScript types

- TypeScript compilation: Pass (pnpm tsc --noEmit)
- next-intl types recognized
- Import from 'next-intl/server' works
- No type definition errors

Part of Phase 1 - Commit 3/4
```

Commit 4:
```
docs(i18n): document next-intl installation and edge compatibility

- Edge runtime compatibility: Confirmed
- Cloudflare Workers compatible: Yes
- Next.js dev server starts successfully
- Phase 1 complete: Package installed and validated

Part of Phase 1 - Commit 4/4
```

### Review Checklist

Before committing:

- [ ] Code follows project style guide (if applicable)
- [ ] Commit message is clear and complete
- [ ] Validation commands run successfully
- [ ] No console.logs or debug code (not applicable for this phase)
- [ ] Documentation updated if needed

---

## ⚠️ Important Points

### Do's

- ✅ Follow the commit order strictly (research → install → validate → document)
- ✅ Validate after each commit (pnpm install, TypeScript check)
- ✅ Use provided commit message templates
- ✅ Document version numbers explicitly
- ✅ Check for peer dependency warnings

### Don'ts

- ❌ Skip research commit (it documents the "why")
- ❌ Install beta/RC versions (use latest stable)
- ❌ Combine commits (keep them atomic)
- ❌ Forget to validate TypeScript types
- ❌ Skip edge compatibility check

---

## ❓ FAQ

**Q: What if the latest next-intl version is incompatible with Next.js 15?**
A: Check the next-intl changelog for the last compatible version. Document this in Commit 1 and install that version in Commit 2.

**Q: Can I skip the research commit and just install?**
A: No. The research commit documents the rationale for the version choice, critical for future maintenance.

**Q: What if pnpm install shows peer dependency warnings?**
A: Document warnings in Commit 2 message. If they're just warnings (not errors), proceed. If errors, investigate compatibility.

**Q: Should I create a real test file in Commit 3?**
A: Optional. If you do, either keep it (if useful) or delete it and mention in commit message that validation was done.

**Q: Can I combine Commits 3 and 4?**
A: Not recommended. Keep TypeScript validation separate from documentation for clearer git history.

**Q: What if the Next.js dev server fails to start in Commit 4?**
A: Investigate the error. It's likely a different issue (not related to next-intl). Document findings and resolve before committing.

---

**Phase 1 Implementation Plan Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Ready for Implementation**: ✅ Yes
