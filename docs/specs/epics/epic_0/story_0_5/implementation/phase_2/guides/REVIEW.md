# Phase 2 - Code Review Guide

Complete guide for reviewing the Phase 2 implementation of Durable Objects bindings configuration.

---

## 🎯 Review Objective

Validate that the Phase 2 implementation:

- ✅ Correctly configures Durable Objects bindings in wrangler.jsonc
- ✅ Documents the DO architecture clearly and accurately
- ✅ Provides DO vs D1 comparison for future decisions
- ✅ Completes binding reference documentation
- ✅ Follows project standards and naming conventions
- ✅ Is well-documented and easy to understand
- ✅ Sets up Phase 3 prerequisites successfully

---

## 📋 Review Approach

Phase 2 is split into **4 atomic commits**. You can:

**Option A: Commit-by-commit review** (recommended)

- Easier to digest (10-20 min per commit)
- Progressive validation
- Targeted feedback for each type of change

**Option B: Global review after all commits**

- Faster overview (1h total)
- Immediate understanding of complete bindings setup
- Requires more focus

**Estimated Total Time**: 45-60 minutes (A) or 45-60 minutes (B)

---

## 🔍 Commit-by-Commit Review

### Commit 1: Add Durable Objects Bindings to wrangler.jsonc

**Files**: `wrangler.jsonc` (~15 lines added)
**Duration**: 10-15 minutes

#### Review Checklist

##### Configuration Accuracy

- [ ] `durable_objects` section is present
- [ ] `durable_objects.bindings` is an array
- [ ] First binding has correct name: `NEXT_CACHE_DO_QUEUE`
  - [ ] Exactly matches specification (case-sensitive)
  - [ ] Is a string, not variable
- [ ] First binding has correct class: `DOQueueHandler`
  - [ ] Class name matches OpenNext documentation
  - [ ] Not a custom class (should be from OpenNext)
- [ ] Second binding has correct name: `NEXT_TAG_CACHE_DO_SHARDED`
  - [ ] Exactly matches specification
  - [ ] Is a string
- [ ] Second binding has correct class: `DOTagCacheShard`
  - [ ] Matches OpenNext documentation
- [ ] Both bindings have `script_name: "website"`
  - [ ] Must match the project's worker name in wrangler.jsonc
  - [ ] Should be the value of the `name` field at top of file
- [ ] Both bindings have `environment: "production"`
  - [ ] Or no environment field (defaults to production)

##### JSON/JSONC Syntax

- [ ] File is valid JSON/JSONC
  - Run: `cat wrangler.jsonc | jq .`
  - Should not show any parse errors
- [ ] Indentation is consistent (2 spaces)
  - Should match rest of file
- [ ] No trailing commas in arrays/objects
- [ ] All quotes are properly paired
- [ ] File ends with newline character

##### Placement and Structure

- [ ] `durable_objects` section placed logically
  - Typically after `r2_buckets` section
  - Before `d1_databases` or `env` section
- [ ] No duplicate binding names
  - Search for `NEXT_CACHE_DO_QUEUE` - should appear once
  - Search for `NEXT_TAG_CACHE_DO_SHARDED` - should appear once
- [ ] Proper nesting (bindings inside durable_objects.bindings)

##### Comments and Documentation

- [ ] If comments added, they explain the purpose
  - E.g., "Queue for ISR revalidation" for first binding
  - E.g., "Tag cache for revalidateTag() support" for second
- [ ] Comments are optional but helpful
- [ ] No misleading or outdated comments

#### Technical Validation

Run these commands to validate the commit:

```bash
# 1. Syntax check
cat wrangler.jsonc | jq . > /dev/null && echo "✓ JSONC valid" || echo "✗ Syntax error"

# 2. Extract bindings to verify
cat wrangler.jsonc | jq '.durable_objects.bindings[] | .name'
# Expected output:
# "NEXT_CACHE_DO_QUEUE"
# "NEXT_TAG_CACHE_DO_SHARDED"

# 3. Verify script names
cat wrangler.jsonc | jq '.durable_objects.bindings[] | .script_name'
# Expected output (both times):
# "website"

# 4. Verify class names
cat wrangler.jsonc | jq '.durable_objects.bindings[] | .class_name'
# Expected output:
# "DOQueueHandler"
# "DOTagCacheShard"

# 5. Start dev server (first time with DO bindings)
pnpm dev
# Expected: No errors about missing DO bindings
# Let it run for ~5 seconds, then Ctrl+C to stop
# Should not show: "Durable Object binding 'NEXT_CACHE_DO_QUEUE' not found"
```

**Expected Result**: All commands pass, no errors

#### Questions to Ask

1. **Does the script_name match the worker name?**
   - Check top of wrangler.jsonc: `"name": "website"`
   - Should match the script_name in DO bindings
   - If wrong, OpenNext won't find the DO classes

2. **Are the binding names exactly as OpenNext expects?**
   - OpenNext looks for specific binding names
   - These are hardcoded in OpenNext source: `NEXT_CACHE_DO_QUEUE`, `NEXT_TAG_CACHE_DO_SHARDED`
   - If typos, OpenNext will fail when enabled (Phase 3)

3. **Could the sharding configuration be different?**
   - Default is 32 shards (included implicitly)
   - If high traffic expected, could explicitly set `"shards": 64`
   - For this project, default 32 is appropriate

#### Common Issues

❌ **Binding name is `DO_QUEUE` instead of `NEXT_CACHE_DO_QUEUE`**

- Issue: OpenNext specifically looks for `NEXT_CACHE_DO_QUEUE`
- Fix: Update binding name to exact specification
- Impact: High - OpenNext won't find the binding

❌ **Class name is `DurableObjectsQueue` instead of `DOQueueHandler`**

- Issue: OpenNext provides specific class names
- Fix: Use exact class names from OpenNext
- Impact: High - Worker will fail to start

❌ **script_name is `api` instead of `website`**

- Issue: Binding references wrong worker
- Fix: Must match the main worker name (`website`)
- Impact: High - DO instances won't be accessible

❌ **JSON syntax invalid (trailing comma, missing quotes)**

- Issue: wrangler.jsonc won't parse
- Fix: Validate with `jq .`
- Impact: High - Deployment fails

---

### Commit 2: Document Durable Objects Architecture

**Files**: `docs/architecture/CACHE_ARCHITECTURE.md` (~600 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Content Accuracy

- [ ] Overview clearly explains the full cache stack
- [ ] R2 section (from Phase 1) is accurate
  - [ ] Binding name: `NEXT_INC_CACHE_R2_BUCKET`
  - [ ] Purpose: Store ISR-generated pages
  - [ ] Storage pattern explained
- [ ] DO Queue section is accurate
  - [ ] Binding name: `NEXT_CACHE_DO_QUEUE`
  - [ ] Class name: `DOQueueHandler`
  - [ ] Purpose: Async queue for ISR revalidation
  - [ ] Flow diagram shows: Request → R2 → Queue → Regenerate → Update R2
- [ ] DO Tag Cache section is accurate
  - [ ] Binding name: `NEXT_TAG_CACHE_DO_SHARDED`
  - [ ] Class name: `DOTagCacheShard`
  - [ ] Purpose: Map tags to pages for invalidation
  - [ ] Sharding strategy explained (32 shards, hash-based)
  - [ ] Flow diagram shows: revalidateTag() → Shard → Find pages → Invalidate
- [ ] Integration section shows how they work together
  - [ ] ISR flow makes sense (request → cache → queue → update)
  - [ ] revalidatePath() and revalidateTag() flows are clear

##### Diagrams and Visual Aids

- [ ] ASCII diagrams are readable (not corrupted)
- [ ] Architecture diagram shows:
  - [ ] Next.js app at top
  - [ ] R2 and DO branches
  - [ ] Edge network at bottom
- [ ] ISR flow diagram is logical and easy to follow
- [ ] Tag cache sharding diagram explains hash-based distribution
- [ ] All diagrams use consistent formatting

##### Documentation Quality

- [ ] Writing is clear and professional
- [ ] Explanations avoid jargon or explain it
- [ ] Section headings are descriptive
- [ ] Content is logically organized
- [ ] Markdown formatting is correct (headers, code blocks, etc.)
- [ ] No incomplete sections or TODOs left

##### Completeness

- [ ] All 6-7 major sections present:
  1. Overview
  2. R2 Incremental Cache
  3. DO Queue
  4. DO Tag Cache
  5. How they work together
  6. Troubleshooting
  7. (Optional) Cost analysis
- [ ] No placeholder text remaining
- [ ] Table of contents (if included) is accurate
- [ ] References to other docs are correct

#### Technical Validation

```bash
# 1. Verify file created
test -f docs/architecture/CACHE_ARCHITECTURE.md && echo "✓ File exists" || echo "✗ File missing"

# 2. Check markdown syntax
npx remark docs/architecture/CACHE_ARCHITECTURE.md --quiet && echo "✓ Markdown valid" || echo "✗ Markdown errors"

# 3. Verify binding names are present
grep -c "NEXT_CACHE_DO_QUEUE" docs/architecture/CACHE_ARCHITECTURE.md
# Expected: At least 3+ mentions

grep -c "NEXT_TAG_CACHE_DO_SHARDED" docs/architecture/CACHE_ARCHITECTURE.md
# Expected: At least 3+ mentions

# 4. Check file size
wc -l docs/architecture/CACHE_ARCHITECTURE.md
# Expected: 500-700 lines

# 5. Look for common placeholder patterns
grep -E "TODO|FIXME|XXX|\[PLACEHOLDER\]" docs/architecture/CACHE_ARCHITECTURE.md
# Expected: No matches
```

**Expected Result**: All checks pass

#### Questions to Ask

1. **Are the architecture diagrams accurate?**
   - Do they match the actual binding configuration?
   - Could a newcomer understand the cache flow?

2. **Is the DO sharding explanation clear?**
   - Does it explain why 32 shards (concurrency)?
   - Would a developer understand how to add/remove shards?

3. **Are ISR and revalidation flows documented?**
   - Could someone implement ISR using this guide?
   - Does it explain the role of each component?

#### Common Issues

❌ **Diagram is corrupted or unreadable**

- Issue: ASCII art rendering incorrectly
- Fix: Check file encoding, verify ASCII characters
- Impact: Medium - Documentation unclear

❌ **Binding names don't match wrangler.jsonc**

- Issue: Documentation inconsistent with configuration
- Fix: Update documentation to match exact names
- Impact: High - Causes confusion, typos

❌ **Sharding explanation is missing or unclear**

- Issue: Reader doesn't understand why 32 shards
- Fix: Add explanation of hash-based distribution
- Impact: Medium - Harder to troubleshoot

❌ **Troubleshooting section is empty or generic**

- Issue: No practical help for common problems
- Fix: Add specific DO-related issues and solutions
- Impact: Medium - Harder to debug issues

---

### Commit 3: Create DO vs D1 Comparison Guide

**Files**: `docs/architecture/DO_VS_D1_TAG_CACHE.md` (~400 lines)
**Duration**: 15-20 minutes

#### Review Checklist

##### Content Accuracy

- [ ] Executive summary clearly recommends DO for production
- [ ] Comparison table is accurate:
  - [ ] Performance: DO <1ms, D1 1-10ms ✓
  - [ ] Scalability: DO sharded, D1 limited ✓
  - [ ] Cost: DO $0.15/M requests, D1 per-query ✓
  - [ ] Free tier: DO 1M requests/month, D1 included ✓
- [ ] Decision flowchart is practical:
  - [ ] > 10k req/day → DO
  - [ ] <10k req/day → D1
- [ ] DO implementation section matches wrangler.jsonc config
- [ ] D1 alternative is complete and accurate
- [ ] Migration path from D1 to DO is realistic
- [ ] Cost analysis examples are realistic
- [ ] Performance benchmarks are reasonable

##### Decision Logic

- [ ] Recommendation is clear and well-justified
- [ ] Tradeoffs are explained fairly
  - [ ] DO advantages highlighted (performance, scalability)
  - [ ] DO disadvantages acknowledged (setup complexity, cost)
  - [ ] D1 advantages highlighted (simplicity, low cost for low traffic)
  - [ ] D1 disadvantages acknowledged (limited scalability, higher latency)
- [ ] Threshold (10k requests/day) is explained
- [ ] Flexibility is acknowledged (can switch later)

##### Completeness

- [ ] All major sections present:
  1. Executive Summary
  2. Comparison Table
  3. When to use each
  4. DO Implementation
  5. D1 Alternative
  6. Migration Path
  7. Cost Analysis
  8. Performance Benchmarks
  9. FAQ
- [ ] FAQ addresses real concerns:
  - [ ] Can we switch later?
  - [ ] Will costs explode?
  - [ ] Why not KV?
  - [ ] Can pages share tags?
- [ ] Examples are concrete and realistic
- [ ] No placeholder text remaining

##### Documentation Quality

- [ ] Writing is clear and accessible
- [ ] Technical terminology is explained
- [ ] Markdown formatting is correct
- [ ] Tables are well-formatted and readable
- [ ] Cost calculator examples are clear
- [ ] Diagrams/charts (if included) are helpful

#### Technical Validation

```bash
# 1. Verify file created
test -f docs/architecture/DO_VS_D1_TAG_CACHE.md && echo "✓ File exists" || echo "✗ File missing"

# 2. Check markdown syntax
npx remark docs/architecture/DO_VS_D1_TAG_CACHE.md --quiet && echo "✓ Markdown valid"

# 3. Verify file size
wc -l docs/architecture/DO_VS_D1_TAG_CACHE.md
# Expected: 350-450 lines

# 4. Check for TODOs or incomplete sections
grep -E "TODO|FIXME|\[XXX\]" docs/architecture/DO_VS_D1_TAG_CACHE.md
# Expected: No matches
```

**Expected Result**: All checks pass

#### Questions to Ask

1. **Is the recommendation defensible?**
   - Why DO for production vs D1?
   - Would you make the same choice for this project?

2. **Are the cost estimates realistic?**
   - Do the per-million-request costs match Cloudflare pricing?
   - Are the traffic thresholds accurate?

3. **Is the migration path practical?**
   - Could someone actually follow it?
   - Are there any missing steps?

#### Common Issues

❌ **Recommendation is unclear or contradictory**

- Issue: Reader doesn't know which to choose
- Fix: Make clear, single recommendation with decision logic
- Impact: High - Defeats purpose of comparison

❌ **Cost analysis is wrong**

- Issue: Misleads about pricing
- Fix: Verify with current Cloudflare pricing documentation
- Impact: High - Wrong decision due to incorrect costs

❌ **D1 alternative section is incomplete**

- Issue: Readers can't implement D1 option
- Fix: Provide complete wrangler.jsonc config and setup steps
- Impact: Medium - Limits flexibility

❌ **Migration path is vague**

- Issue: "Just switch the binding" isn't enough detail
- Fix: Provide step-by-step instructions
- Impact: Medium - Harder to execute

---

### Commit 4: Add Binding Reference Documentation

**Files**: `docs/deployment/BINDINGS_REFERENCE.md` (~300 lines added/modified)
**Duration**: 10-15 minutes

#### Review Checklist

##### Content Accuracy

- [ ] Quick reference table includes all bindings
  - [ ] ASSETS binding listed
  - [ ] DB binding listed
  - [ ] NEXT_INC_CACHE_R2_BUCKET listed
  - [ ] NEXT_CACHE_DO_QUEUE listed (NEW)
  - [ ] NEXT_TAG_CACHE_DO_SHARDED listed (NEW)
- [ ] DO Queue section is accurate
  - [ ] Class name: DOQueueHandler ✓
  - [ ] Purpose: ISR queue ✓
  - [ ] Monitoring location correct ✓
- [ ] DO Tag Cache section is accurate
  - [ ] Class name: DOTagCacheShard ✓
  - [ ] Purpose: Tag cache/invalidation ✓
  - [ ] Sharding info present ✓
  - [ ] Monitoring location correct ✓
- [ ] All binding names match wrangler.jsonc exactly
- [ ] Cost information is accurate
- [ ] Troubleshooting addresses DO-specific issues

##### Completeness

- [ ] Quick reference table is complete
- [ ] All 5 bindings documented
- [ ] Each binding has:
  - [ ] Name
  - [ ] Type
  - [ ] Purpose
  - [ ] Usage notes
  - [ ] Monitoring location
- [ ] Code examples are present and accurate
- [ ] Troubleshooting section covers:
  - [ ] Binding not found errors
  - [ ] Common configuration mistakes
  - [ ] How to verify bindings are loaded
- [ ] References to related docs (CACHE_ARCHITECTURE.md, DO_VS_D1_TAG_CACHE.md) are correct
- [ ] External documentation links are valid

##### Documentation Quality

- [ ] Table is well-formatted and scannable
- [ ] Section headings are descriptive
- [ ] Information is logically organized
- [ ] Code examples are clear and correct
- [ ] No incomplete sections
- [ ] No placeholder text

#### Technical Validation

```bash
# 1. Verify file exists/updated
test -f docs/deployment/BINDINGS_REFERENCE.md && echo "✓ File exists"

# 2. Check markdown syntax
npx remark docs/deployment/BINDINGS_REFERENCE.md --quiet && echo "✓ Markdown valid"

# 3. Verify DO bindings are documented
grep -c "NEXT_CACHE_DO_QUEUE\|NEXT_TAG_CACHE_DO_SHARDED" docs/deployment/BINDINGS_REFERENCE.md
# Expected: At least 4-6 mentions

# 4. Check file size
wc -l docs/deployment/BINDINGS_REFERENCE.md
# Expected: 250-350 lines (or updated version larger)

# 5. Verify internal links work
grep -o "\[.*\](\.\..*\.md)" docs/deployment/BINDINGS_REFERENCE.md | head -5
# Should show references to other docs
```

**Expected Result**: All checks pass

#### Questions to Ask

1. **Is the quick reference table complete and accurate?**
   - Could a developer quickly find what they need?
   - Are all bindings listed?

2. **Are the DO sections detailed enough?**
   - Could someone troubleshoot a DO issue?
   - Is the monitoring information correct?

3. **Do references to related docs help readers?**
   - Would someone click through to architecture docs?
   - Are links accurate?

#### Common Issues

❌ **Binding names don't match wrangler.jsonc**

- Issue: Documentation inconsistent with configuration
- Fix: Verify names match exactly in both places
- Impact: High - Confusion and typos

❌ **Quick reference table is incomplete**

- Issue: Missing some bindings
- Fix: Add all bindings from wrangler.jsonc
- Impact: Medium - Incomplete reference

❌ **Troubleshooting is generic**

- Issue: No DO-specific help
- Fix: Add concrete DO issues and solutions
- Impact: Medium - Harder to debug

❌ **Referenced docs don't exist or have wrong paths**

- Issue: Broken links frustrate readers
- Fix: Verify all links point to existing files
- Impact: Low-Medium - Navigation broken

---

## ✅ Global Validation

After reviewing all 4 commits, check these global aspects:

### Architecture & Design

- [ ] Configuration follows OpenNext patterns
- [ ] Bindings are appropriately named
- [ ] Documentation covers all bindings
- [ ] DO vs D1 comparison helps with decisions
- [ ] No conflicting information between docs

### Cross-Document Consistency

- [ ] All binding names consistent across docs
  - [ ] wrangler.jsonc
  - [ ] CACHE_ARCHITECTURE.md
  - [ ] DO_VS_D1_TAG_CACHE.md
  - [ ] BINDINGS_REFERENCE.md
- [ ] All diagrams match actual architecture
- [ ] Cost/performance numbers are consistent

### Code Quality

- [ ] No JSON syntax errors
- [ ] No markdown syntax errors
- [ ] Proper indentation and formatting
- [ ] No typos or grammatical errors

### Completeness

- [ ] All 4 commits present
- [ ] All required files created
- [ ] No missing documentation
- [ ] Phase 3 prerequisites met

---

## 📝 Feedback Template

Use this template for feedback:

```markdown
## Review Feedback - Phase 2

**Reviewer**: [Name]
**Date**: [Date]
**Commits Reviewed**: All 4 commits (or specify)

### ✅ Strengths

- [What was done well]
- Clear architecture documentation
- Practical DO vs D1 comparison

### 🔧 Required Changes

1. **[File]: Binding name inconsistency**
   - **Why**: wrangler.jsonc has `NEXT_DO_QUEUE` but docs say `NEXT_CACHE_DO_QUEUE`
   - **Fix**: Verify against OpenNext docs and use exact names

2. **[File]: Diagram is unclear**
   - **Why**: ASCII diagram doesn't render correctly
   - **Fix**: Fix character encoding or simplify diagram

### 💡 Suggestions (Optional)

- Add cost calculator spreadsheet for easier reference
- Include actual latency measurements from production
- Add video walkthrough of architecture

### 📊 Verdict

- [ ] ✅ **APPROVED** - Ready to merge
- [ ] 🔧 **CHANGES REQUESTED** - Needs fixes (see above)
- [ ] ❌ **REJECTED** - Major rework needed

### Next Steps

- If APPROVED: Merge commits to main branch, proceed to Phase 3
- If CHANGES REQUESTED: Address feedback items, request re-review
- If REJECTED: Discuss issues, plan rework strategy
```

---

## 🎯 Review Actions

### If Approved ✅

1. ✅ Phase 2 implementation is complete and correct
2. ✅ All bindings configured properly
3. ✅ Documentation is comprehensive
4. ✅ Ready to proceed to Phase 3
5. Mark phase as COMPLETED in INDEX.md

### If Changes Requested 🔧

1. Create detailed feedback (use template above)
2. Discuss with developer
3. Developer makes fixes
4. Re-review fixed commits
5. Approve and merge

### If Rejected ❌

1. Document major issues
2. Schedule discussion with developer
3. Plan rework strategy
4. Restart Phase 2 after rework

---

## ❓ FAQ

**Q: How strict should I be about naming conventions?**
A: Very strict for binding names (must match OpenNext exactly), but flexible for documentation style.

**Q: Should I verify the DO classes exist in OpenNext?**
A: Not required, but helpful. The names come from OpenNext documentation, which was the source.

**Q: What if the architecture diagrams are slightly wrong?**
A: Request clarification if it could cause confusion. Minor artistic differences are fine.

**Q: Can I approve with comments?**
A: Yes, mark as APPROVED and note that comments are optional improvements. Don't require fixes for minor items.

**Q: How much do I need to know about Durable Objects?**
A: Enough to verify:

- Binding names are correct
- Purpose and usage make sense
- Architecture is logical
- Documentation is clear

You don't need to be a DO expert to review this phase.
