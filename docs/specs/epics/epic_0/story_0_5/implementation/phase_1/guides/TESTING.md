# Phase 1 - Manual Validation Guide

Complete manual validation strategy for Phase 1: R2 Bucket Configuration.

**Note**: Phase 1 is infrastructure configuration, so there are no automated unit/integration tests. Validation is manual and verification-based.

---

## 🎯 Validation Strategy

Phase 1 uses a **manual verification approach**:

1. **Infrastructure Validation**: Verify R2 bucket exists
2. **Configuration Validation**: Verify binding is correct
3. **Runtime Validation**: Verify `wrangler dev` works
4. **Documentation Validation**: Verify docs are complete and accurate

**Target Success**: All validation commands pass without errors

---

## ✅ Validation After Each Commit

### After Commit 1: R2 Bucket Created

**Purpose**: Verify R2 bucket `sebc-next-cache` exists in Cloudflare

#### Validation Commands

```bash
# 1. List all R2 buckets
wrangler r2 bucket list
```

**Expected Output**:
```
┌──────────────────┬──────────────────┬──────────────────┐
│ Name             │ Creation Date    │ Location         │
├──────────────────┼──────────────────┼──────────────────┤
│ sebc-next-cache  │ 2025-01-12 10:30 │ Auto             │
└──────────────────┴──────────────────┴──────────────────┘
```

```bash
# 2. Check specific bucket exists
wrangler r2 bucket list | grep sebc-next-cache
```

**Expected Output**:
```
sebc-next-cache  ...
```

```bash
# 3. Verify bucket is empty (no objects yet)
wrangler r2 object list sebc-next-cache
```

**Expected Output**:
```
Listing objects in bucket 'sebc-next-cache'...
(empty - no objects)
```

#### Cloudflare Dashboard Validation

**Manual Steps**:
1. Navigate to: https://dash.cloudflare.com/
2. Go to: Workers & Pages → R2
3. Click: "Buckets" tab
4. **Verify**: `sebc-next-cache` appears in list
5. **Click**: Bucket name
6. **Verify**: Bucket details page loads
7. **Check**: Objects count is 0 (empty)

#### Success Criteria

- [ ] `wrangler r2 bucket list` shows `sebc-next-cache`
- [ ] Bucket visible in Cloudflare Dashboard
- [ ] Bucket is empty (no objects)
- [ ] No errors during validation

---

### After Commit 2: R2 Binding Added

**Purpose**: Verify `NEXT_INC_CACHE_R2_BUCKET` binding is configured and accessible

#### Validation Commands

```bash
# 1. Validate JSON syntax
cat wrangler.jsonc | jq empty
```

**Expected Output**: (silent - no output means success)

```bash
# 2. Extract r2_buckets configuration
cat wrangler.jsonc | jq '.r2_buckets'
```

**Expected Output**:
```json
[
  {
    "binding": "NEXT_INC_CACHE_R2_BUCKET",
    "bucket_name": "sebc-next-cache"
  }
]
```

```bash
# 3. Verify binding name
cat wrangler.jsonc | jq '.r2_buckets[0].binding'
```

**Expected Output**:
```
"NEXT_INC_CACHE_R2_BUCKET"
```

```bash
# 4. Verify bucket name matches Commit 1
cat wrangler.jsonc | jq '.r2_buckets[0].bucket_name'
```

**Expected Output**:
```
"sebc-next-cache"
```

#### Runtime Validation

```bash
# 5. Start wrangler dev
wrangler dev
```

**Expected Output** (look for these lines):
```
⛅️ wrangler 3.x.x
-------------------
⎔ Starting local server...
✅ D1 Databases: DB
✅ R2 Buckets: NEXT_INC_CACHE_R2_BUCKET
✨ Compiled Worker successfully
🚀 Listening on http://localhost:8787
```

**Key**: Look for `✅ R2 Buckets: NEXT_INC_CACHE_R2_BUCKET`

```bash
# 6. Verify no R2-related errors in logs
# While wrangler dev is running, check logs
# Should NOT see:
#   - "R2 bucket not found"
#   - "R2 binding error"
#   - Any R2-related errors
```

#### Success Criteria

- [ ] JSON syntax valid (`jq empty` succeeds)
- [ ] Binding name is `NEXT_INC_CACHE_R2_BUCKET`
- [ ] Bucket name is `sebc-next-cache`
- [ ] `wrangler dev` starts without errors
- [ ] R2 binding appears in startup logs
- [ ] No R2-related errors during startup

---

### After Commit 3: Documentation Created

**Purpose**: Verify documentation is complete, accurate, and helpful

#### File Existence Validation

```bash
# 1. Verify files exist
ls -l docs/architecture/CACHE_ARCHITECTURE.md
ls -l docs/deployment/CLOUDFLARE_RESOURCES.md
```

**Expected Output**:
```
-rw-r--r-- 1 user group 7500 Jan 12 10:45 docs/architecture/CACHE_ARCHITECTURE.md
-rw-r--r-- 1 user group 7200 Jan 12 10:45 docs/deployment/CLOUDFLARE_RESOURCES.md
```

```bash
# 2. Check file sizes (rough validation)
wc -l docs/architecture/CACHE_ARCHITECTURE.md
# Expected: ~150 lines

wc -l docs/deployment/CLOUDFLARE_RESOURCES.md
# Expected: ~145 lines
```

#### Content Validation (Manual)

**CACHE_ARCHITECTURE.md**:
- [ ] Open file in editor
- [ ] Read "Overview" section - explains OpenNext cache?
- [ ] Read "R2 Incremental Cache" section - explains ISR?
- [ ] Check cache flow diagram exists and is clear
- [ ] Check configuration reference shows correct binding/bucket names
- [ ] Check all section headings present
- [ ] Verify no `[TODO]` or `[PLACEHOLDER]` text

**CLOUDFLARE_RESOURCES.md**:
- [ ] Open file in editor
- [ ] Read "R2 Buckets" section - explains creation?
- [ ] Check pricing section - free tier limits correct?
- [ ] Check pricing section - paid tier costs correct?
- [ ] Check monitoring section - Dashboard paths correct?
- [ ] Check troubleshooting section - common issues covered?
- [ ] Verify no `[TODO]` or `[PLACEHOLDER]` text

#### Link Validation (Manual)

**Test all links**:
- [ ] Open CACHE_ARCHITECTURE.md in browser/editor with link preview
- [ ] Click each link:
  - [ ] OpenNext caching docs: https://opennext.js.org/cloudflare/caching
  - [ ] Cloudflare R2 docs: https://developers.cloudflare.com/r2/
  - [ ] Next.js ISR docs: https://nextjs.org/docs/...
- [ ] Verify all links return 200 (not 404)
- [ ] Repeat for CLOUDFLARE_RESOURCES.md

#### Markdown Syntax Validation (Optional)

If `markdownlint` is installed:
```bash
# Validate markdown syntax
markdownlint docs/architecture/CACHE_ARCHITECTURE.md
markdownlint docs/deployment/CLOUDFLARE_RESOURCES.md
```

**Expected Output**: No errors (or only minor warnings)

#### Code Examples Validation (Manual)

**Extract and test code examples**:

From CACHE_ARCHITECTURE.md, find Next.js code examples:
```typescript
// Example: Page with revalidate
export const revalidate = 3600; // 1 hour

export default function Page() {
  return <div>Hello World</div>;
}
```

- [ ] Verify syntax is valid TypeScript/JavaScript
- [ ] Check it matches Next.js 15 patterns
- [ ] Confirm `revalidate` usage is correct for App Router

#### Success Criteria

- [ ] Both documentation files exist
- [ ] Files have substantial content (~150 lines each)
- [ ] All sections present (no missing headers)
- [ ] All links work (no 404s)
- [ ] Code examples have valid syntax
- [ ] Pricing information is accurate
- [ ] No placeholder text remaining

---

## 🧪 Comprehensive Phase 1 Validation

**Run after all 3 commits are complete**

### Infrastructure Validation

```bash
# 1. Verify bucket exists
wrangler r2 bucket list | grep sebc-next-cache
# Expected: Shows the bucket

# 2. Check bucket is still empty
wrangler r2 object list sebc-next-cache
# Expected: No objects (empty)
```

### Configuration Validation

```bash
# 3. Validate wrangler.jsonc syntax
cat wrangler.jsonc | jq empty
# Expected: Silent success

# 4. Check R2 binding configuration
cat wrangler.jsonc | jq '.r2_buckets'
# Expected: Shows array with NEXT_INC_CACHE_R2_BUCKET binding
```

### Runtime Validation

```bash
# 5. Test wrangler dev (full startup)
wrangler dev
# Expected: Starts successfully, R2 binding in logs

# 6. While running, check console output
# Look for: "✅ R2 Buckets: NEXT_INC_CACHE_R2_BUCKET"
# Look for NO errors related to R2

# 7. Stop wrangler dev (Ctrl+C)
```

### Build Validation

```bash
# 8. Verify project builds (Next.js)
pnpm build
# Expected: Build succeeds (R2 config doesn't break build)
```

### Documentation Validation

```bash
# 9. Verify documentation files exist
ls docs/architecture/CACHE_ARCHITECTURE.md
ls docs/deployment/CLOUDFLARE_RESOURCES.md
# Expected: Both files exist

# 10. Quick content check
head -20 docs/architecture/CACHE_ARCHITECTURE.md
# Expected: See title and overview section
```

### Git History Validation

```bash
# 11. Check commit history
git log --oneline -3
# Expected: See 3 commits for Phase 1:
#   - Commit 3: docs(architecture): document R2 cache...
#   - Commit 2: chore(config): add R2 bucket binding...
#   - Commit 1: chore(infra): create R2 bucket...

# 12. Verify each commit message
git log -3 --format="%H %s"
# Expected: Each includes "Part of Epic 0 Story 0.5 Phase 1 - Commit X/3"
```

---

## 📊 Success Metrics

### Validation Checklist

Mark each as complete after validation:

**Infrastructure** (Commit 1):
- [ ] R2 bucket `sebc-next-cache` exists
- [ ] Bucket visible in Cloudflare Dashboard
- [ ] Bucket is empty

**Configuration** (Commit 2):
- [ ] wrangler.jsonc has r2_buckets array
- [ ] Binding name is `NEXT_INC_CACHE_R2_BUCKET`
- [ ] Bucket name is `sebc-next-cache`
- [ ] JSON syntax valid
- [ ] `wrangler dev` starts successfully
- [ ] No R2 errors in logs

**Documentation** (Commit 3):
- [ ] CACHE_ARCHITECTURE.md exists and complete
- [ ] CLOUDFLARE_RESOURCES.md exists and complete
- [ ] All links work
- [ ] Code examples valid
- [ ] Pricing accurate

**Overall**:
- [ ] All 3 commits complete
- [ ] `pnpm build` succeeds
- [ ] Git history clean
- [ ] Ready for Phase 2

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| R2 Bucket Created | ✅ | - | ⏳ |
| Binding Configured | ✅ | - | ⏳ |
| `wrangler dev` Works | ✅ | - | ⏳ |
| Documentation Complete | ✅ | - | ⏳ |
| JSON Valid | ✅ | - | ⏳ |
| Build Succeeds | ✅ | - | ⏳ |

---

## 🐛 Troubleshooting Validation Issues

### Issue: "wrangler r2 bucket list" shows no bucket

**Symptoms**:
- Bucket not visible in list
- Bucket creation may have failed

**Diagnosis**:
```bash
# Check recent Wrangler logs
wrangler r2 bucket list --verbose
```

**Solutions**:
1. **Recreate bucket**:
   ```bash
   wrangler r2 bucket create sebc-next-cache
   ```
2. **Check Cloudflare Dashboard** for bucket (may be delay in CLI)
3. **Verify authentication**:
   ```bash
   wrangler whoami
   # Make sure you're logged in
   ```

---

### Issue: "wrangler dev" fails with R2 error

**Symptoms**:
- Error: "R2 bucket 'sebc-next-cache' not found"
- Or: "R2 binding error"

**Diagnosis**:
```bash
# Check bucket exists
wrangler r2 bucket list | grep sebc-next-cache

# Check binding configuration
cat wrangler.jsonc | jq '.r2_buckets'
```

**Solutions**:
1. **Bucket doesn't exist**: Create it (Commit 1)
   ```bash
   wrangler r2 bucket create sebc-next-cache
   ```

2. **Bucket name mismatch**: Update wrangler.jsonc
   - Edit `wrangler.jsonc`
   - Change `bucket_name` to match actual bucket

3. **Binding name typo**: Fix binding name
   - Must be: `NEXT_INC_CACHE_R2_BUCKET` (exact)

---

### Issue: Documentation links are broken

**Symptoms**:
- Clicking links returns 404
- Links don't open in browser

**Diagnosis**:
- Open docs in browser or editor with link preview
- Click each link manually

**Solutions**:
1. **Update broken links** to current URLs
2. **Verify against official docs**:
   - OpenNext: https://opennext.js.org/
   - Cloudflare: https://developers.cloudflare.com/
   - Next.js: https://nextjs.org/docs/

---

### Issue: JSON syntax error in wrangler.jsonc

**Symptoms**:
- `cat wrangler.jsonc | jq empty` shows error
- Syntax error message

**Diagnosis**:
```bash
# Check JSON validity
cat wrangler.jsonc | jq empty
# Error will show line number
```

**Solutions**:
1. **Find and fix syntax error**:
   - Check for trailing commas
   - Check brackets/braces match
   - Check quotes are closed
2. **Use JSON validator** online if needed
3. **Compare to backup** (git diff)

---

## 📝 Validation Report Template

After completing all validation, document results:

```markdown
## Phase 1 Validation Report

**Date**: [Date]
**Validator**: [Your Name]
**Phase**: Epic 0 Story 0.5 Phase 1 - R2 Bucket Configuration

### Infrastructure Validation ✅

- [x] R2 bucket `sebc-next-cache` exists
- [x] Bucket visible in Cloudflare Dashboard
- [x] Bucket is empty (0 objects)

### Configuration Validation ✅

- [x] `r2_buckets` array present in wrangler.jsonc
- [x] Binding: `NEXT_INC_CACHE_R2_BUCKET` (correct)
- [x] Bucket: `sebc-next-cache` (matches Commit 1)
- [x] JSON syntax valid (`jq empty` passed)
- [x] `wrangler dev` starts without errors
- [x] R2 binding appears in logs

### Documentation Validation ✅

- [x] CACHE_ARCHITECTURE.md created (~150 lines)
- [x] CLOUDFLARE_RESOURCES.md created (~145 lines)
- [x] All sections present
- [x] All links tested and working
- [x] Code examples valid
- [x] Pricing accurate as of [date]

### Build Validation ✅

- [x] `pnpm build` succeeds

### Git History Validation ✅

- [x] 3 commits present
- [x] Commit messages follow format
- [x] No unrelated changes

### Issues Encountered

- None / [List any issues and how they were resolved]

### Overall Status

**✅ VALIDATED** - Phase 1 complete and ready for Phase 2

**Next Steps**:
- Update EPIC_TRACKING.md (Story 0.5: 1/3 phases complete)
- Proceed to Phase 2 documentation generation
```

---

## ❓ FAQ

**Q: Why no automated tests for Phase 1?**
A: Phase 1 is pure infrastructure and configuration. There's no application logic to unit test. Validation is verification-based (does bucket exist? does config work?).

**Q: Should I test R2 read/write operations?**
A: Not in Phase 1. R2 operations will be tested in Phase 3 when OpenNext cache is activated. Phase 1 just sets up the bucket and binding.

**Q: How long should validation take?**
A: ~15-20 minutes for full validation (all commands + manual checks).

**Q: Can I automate any of this validation?**
A: Yes, you could write a shell script to run all validation commands and parse output. But manual verification is sufficient for Phase 1.

**Q: What if a validation step fails?**
A: Stop and fix the issue before proceeding. Phase 1 must be 100% validated before moving to Phase 2.

---

## 🏁 Validation Complete

**Phase 1 validation is complete when**:
- [ ] All validation commands pass
- [ ] All checkboxes in Success Metrics checked
- [ ] Validation report completed
- [ ] No blocking issues remain

**Ready to proceed to Phase 2: Durable Objects Bindings! 🚀**
