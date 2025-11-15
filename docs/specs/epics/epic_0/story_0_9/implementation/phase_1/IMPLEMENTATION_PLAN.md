# Phase 1 - Atomic Implementation Plan

**Objective**: Enable Cloudflare WAF with OWASP Core Rule Set and establish baseline security posture in Log mode

---

## 🎯 Overview

### Why an Atomic Approach?

The implementation is split into **4 independent commits** to:

✅ **Facilitate review** - Each commit documents a specific WAF configuration step
✅ **Enable rollback** - If a configuration causes issues, revert documentation and disable specific WAF component
✅ **Progressive security** - Build security layer-by-layer (core rules → threat intel → rate limiting → docs)
✅ **Audit trail** - Git history provides clear configuration changelog
✅ **Continuous documentation** - Each commit captures configuration state with screenshots

### Configuration-First Strategy

**Important**: This phase involves **zero code changes**. All work is configuration via Cloudflare Dashboard + documentation commits.

```
[Dashboard Config] → [Screenshot] → [Document] → [Git Commit] → [Validate]
        ↓                ↓              ↓              ↓             ↓
   Enable WAF      Capture proof    Write guide   Version control  Smoke test
```

### Global Strategy

```
[Stage 1]           →  [Stage 2]              →  [Stage 3]        →  [Stage 4]
OWASP Core Rules       CF Managed Ruleset        Rate Limiting       Complete Docs
↓                      ↓                         ↓                   ↓
WAF enabled            Threat intel active       DoS prevention      Audit ready
```

---

## 📦 The 4 Atomic Commits

### Commit 1: Enable WAF & OWASP Core Rule Set

**Files**:
- `docs/security/waf-configuration.md` (new)
- `docs/security/README.md` (new or updated)

**Size**: ~250 lines (documentation only)
**Duration**: 30-45 min (configuration) + 15-20 min (documentation/review)

**Content**:

1. **Configure WAF in Cloudflare Dashboard**:
   - Navigate to Security > WAF > Managed Rules
   - Enable Cloudflare WAF for `sebc.dev` zone
   - Deploy OWASP Core Rule Set
   - Set sensitivity to "Medium" (balanced false positives)
   - Set WAF mode to "Log" (monitor without blocking)

2. **Document Configuration**:
   - Create `docs/security/waf-configuration.md`
   - Document OWASP Core Rule Set activation
   - Include screenshots of WAF dashboard
   - Document WAF mode ("Log" for Phase 1)
   - Document sensitivity level choice

3. **Create Security Documentation Index**:
   - Create or update `docs/security/README.md`
   - Link to WAF configuration document
   - Overview of security infrastructure

**Why it's atomic**:

- **Single responsibility**: Enable WAF with core OWASP protections
- **No external dependencies**: Standalone configuration (doesn't depend on other WAF features)
- **Can be validated independently**: Check WAF dashboard shows "Active" + OWASP enabled
- **Safe rollback**: Can disable OWASP Core Rule Set in dashboard if needed

**Cloudflare Dashboard Navigation**:
```
Cloudflare Dashboard
  └── Select Zone: sebc.dev
      └── Security
          └── WAF
              └── Managed Rules
                  └── Deploy managed ruleset
                      └── Select "Cloudflare OWASP Core Ruleset"
                          └── Configure action: "Log"
                          └── Sensitivity: "Medium"
```

**Technical Validation**:
```bash
# Verify WAF is enabled (manual check in dashboard)
# Navigate to: Security > WAF > Overview
# Expected: WAF status = "Active"
# Expected: OWASP Core Ruleset = "Enabled"

# Test homepage loads (should not be blocked in Log mode)
curl -I https://sebc.dev
# Expected: HTTP 200 OK
```

**Expected Result**:
- WAF enabled in Cloudflare Dashboard
- OWASP Core Rule Set visible as "Enabled" (Log mode)
- Homepage still loads normally (no blocking yet)
- `docs/security/waf-configuration.md` created with configuration details

**Review Criteria**:

- [ ] WAF enabled in dashboard (screenshot attached)
- [ ] OWASP Core Rule Set configured (Medium sensitivity, Log mode)
- [ ] Documentation clearly explains WAF mode choice (Log vs Block)
- [ ] Documentation includes dashboard navigation steps
- [ ] Security README updated with WAF section

---

### Commit 2: Activate Cloudflare Managed Ruleset

**Files**:
- `docs/security/waf-configuration.md` (updated)

**Size**: ~100 lines added (documentation)
**Duration**: 20-30 min (configuration) + 10-15 min (documentation/review)

**Content**:

1. **Configure Cloudflare Managed Ruleset**:
   - Navigate to Security > WAF > Managed Rules
   - Deploy "Cloudflare Managed Ruleset"
   - Keep default action: "Block" for high-confidence threats
   - Keep default sensitivity (varies by rule)

2. **Update Documentation**:
   - Add section to `docs/security/waf-configuration.md`
   - Document Cloudflare Managed Ruleset activation
   - Explain purpose: threat intelligence from global Cloudflare network
   - Include screenshot of managed ruleset deployment

**Why it's atomic**:

- **Single responsibility**: Add Cloudflare threat intelligence layer
- **Builds on Commit 1**: OWASP provides foundation, Cloudflare Managed adds intelligence
- **Can be validated independently**: Check dashboard for Cloudflare Managed Ruleset status
- **Safe rollback**: Can disable Cloudflare Managed Ruleset without affecting OWASP rules

**Cloudflare Dashboard Navigation**:
```
Cloudflare Dashboard
  └── Security > WAF > Managed Rules
      └── Deploy managed ruleset
          └── Select "Cloudflare Managed Ruleset"
              └── Action: "Default" (varies by rule, typically Block/Challenge)
```

**Technical Validation**:
```bash
# Verify Cloudflare Managed Ruleset is enabled (manual dashboard check)
# Navigate to: Security > WAF > Managed Rules
# Expected: "Cloudflare Managed Ruleset" = "Enabled"

# Test homepage loads (should not be affected)
curl -I https://sebc.dev
# Expected: HTTP 200 OK
```

**Expected Result**:
- Cloudflare Managed Ruleset enabled (uses global threat intelligence)
- Homepage still loads normally
- Documentation updated with Cloudflare Managed Ruleset details

**Review Criteria**:

- [ ] Cloudflare Managed Ruleset enabled (screenshot attached)
- [ ] Documentation explains difference between OWASP and Cloudflare Managed
- [ ] Documentation explains why both rulesets are needed (defense-in-depth)
- [ ] Screenshots show before/after state

---

### Commit 3: Configure Basic Rate Limiting

**Files**:
- `docs/security/rate-limiting-rules.md` (new)
- `docs/security/waf-configuration.md` (updated with rate limiting reference)

**Size**: ~200 lines (documentation)
**Duration**: 30-45 min (configuration) + 15-20 min (documentation/review)

**Content**:

1. **Configure Global Rate Limiting**:
   - Navigate to Security > WAF > Rate Limiting Rules
   - Create rule: "Global Rate Limit"
   - Condition: All incoming requests
   - Rate: 100 requests per 1 minute
   - Action: Block
   - Mitigation timeout: 1 minute (how long IP is blocked)

2. **Document Rate Limiting**:
   - Create `docs/security/rate-limiting-rules.md`
   - Document global rate limiting configuration
   - Explain rationale: protect against volumetric attacks
   - Include rule configuration screenshot
   - Document how to adjust if false positives occur

3. **Update Main WAF Config**:
   - Add reference to rate limiting in `docs/security/waf-configuration.md`

**Why it's atomic**:

- **Single responsibility**: Add rate limiting protection
- **Independent of WAF rules**: Rate limiting is separate from OWASP/Cloudflare Managed
- **Can be validated independently**: Test rate limiting with curl loop
- **Safe rollback**: Can disable rate limiting rule without affecting other WAF components

**Cloudflare Dashboard Navigation**:
```
Cloudflare Dashboard
  └── Security > WAF > Rate Limiting Rules
      └── Create rate limiting rule
          └── Rule name: "Global Rate Limit"
          └── If incoming requests match:
              └── Field: URI Path
              └── Operator: equals
              └── Value: * (all paths) OR select "All incoming requests"
          └── Then:
              └── Rate: 100 requests per 1 minute
              └── Action: Block
              └── Mitigation timeout: 1 minute
```

**Technical Validation**:
```bash
# Verify rate limiting is configured (manual dashboard check)
# Navigate to: Security > WAF > Rate Limiting Rules
# Expected: "Global Rate Limit" rule = "Enabled"

# Test normal request works
curl -I https://sebc.dev
# Expected: HTTP 200 OK

# Test rate limiting (optional - be careful not to block yourself)
# for i in {1..110}; do curl -I https://sebc.dev; done
# Expected: First ~100 requests succeed, then 429 Too Many Requests
# Note: Only test from non-production IP or whitelist your IP first
```

**Expected Result**:
- Rate limiting rule created and enabled
- Global protection against volumetric attacks (100 req/min per IP)
- Documentation explains rate limiting configuration
- Homepage loads normally under normal traffic

**Review Criteria**:

- [ ] Rate limiting rule configured (screenshot attached)
- [ ] Documentation explains rate limit choice (100 req/min rationale)
- [ ] Documentation explains how to adjust rate limits if needed
- [ ] Documentation includes mitigation timeout explanation
- [ ] WAF configuration references rate limiting documentation

---

### Commit 4: Comprehensive Documentation & Screenshots

**Files**:
- `docs/deployment/cloudflare-dashboard-access.md` (new)
- `docs/security/waf-configuration.md` (final polish)
- `docs/security/README.md` (final update)
- `README.md` (project root - updated with security links)

**Size**: ~250 lines (documentation)
**Duration**: 30-45 min (documentation) + 15-20 min (review)

**Content**:

1. **Create Dashboard Access Guide**:
   - Create `docs/deployment/cloudflare-dashboard-access.md`
   - Document how to access Cloudflare Dashboard
   - Document required permissions (Administrator or Super Administrator)
   - Document navigation to WAF configuration
   - Document how to export WAF configuration (screenshots, manual export)

2. **Finalize WAF Configuration Docs**:
   - Polish `docs/security/waf-configuration.md`
   - Add "Quick Reference" section
   - Add "Rollback Procedures" section
   - Add "Troubleshooting" section
   - Ensure all screenshots included

3. **Update Security README**:
   - Polish `docs/security/README.md`
   - Add overview of all security documentation
   - Link to all WAF-related documents
   - Add quick links for common tasks

4. **Update Project README**:
   - Add link to security documentation in project `README.md`
   - Brief mention of WAF protection in Features section

**Why it's atomic**:

- **Single responsibility**: Complete and polish all documentation
- **Builds on previous commits**: All configuration done, now document access/procedures
- **Can be validated independently**: Review docs for completeness and accuracy
- **Safe rollback**: Documentation-only changes

**Technical Validation**:
```bash
# Verify all documentation files exist
ls docs/security/waf-configuration.md
ls docs/security/rate-limiting-rules.md
ls docs/security/README.md
ls docs/deployment/cloudflare-dashboard-access.md

# Verify links in README work (manual check)
# Check that all internal links resolve correctly
```

**Expected Result**:
- Complete documentation covering all WAF configuration
- Dashboard access guide for team members
- Rollback procedures documented
- Project README updated with security section

**Review Criteria**:

- [ ] Dashboard access guide complete (step-by-step for team members)
- [ ] Rollback procedures clearly documented
- [ ] All screenshots included and referenced
- [ ] Security README provides clear navigation to all security docs
- [ ] Project README links to security documentation
- [ ] Documentation is clear enough for non-WAF experts

---

## 🔄 Implementation Workflow

### Step-by-Step

1. **Read specification**: Review PHASES_PLAN.md and story spec
2. **Setup dashboard access**: Follow ENVIRONMENT_SETUP.md
3. **Implement Commit 1**:
   - Configure WAF + OWASP in dashboard
   - Take screenshots
   - Write documentation
   - Validate configuration
   - Commit documentation
4. **Implement Commit 2**:
   - Configure Cloudflare Managed Ruleset
   - Update documentation
   - Validate
   - Commit
5. **Implement Commit 3**:
   - Configure rate limiting
   - Write rate limiting docs
   - Validate
   - Commit
6. **Implement Commit 4**:
   - Create dashboard access guide
   - Polish all documentation
   - Final validation
   - Commit
7. **Final validation**: Complete VALIDATION_CHECKLIST.md

### Validation at Each Step

After each commit (configuration + documentation):

```bash
# Verify homepage loads (should always work in Log mode)
curl -I https://sebc.dev
# Expected: HTTP 200 OK

# Manual validation in Cloudflare Dashboard
# Navigate to: Security > WAF > Overview
# Verify: Configuration matches documentation

# Documentation review
# Verify: Screenshots match current dashboard state
# Verify: All links work
```

All must pass before moving to next commit.

---

## 📊 Commit Metrics

| Commit     | Files      | Lines     | Configuration | Documentation | Review   | Total    |
| ---------- | ---------- | --------- | ------------- | ------------- | -------- | -------- |
| 1. OWASP   | 2          | ~250      | 30-45 min     | 15-20 min     | 15 min   | 1-1.5h   |
| 2. CF Mgd  | 1          | ~100      | 20-30 min     | 10-15 min     | 10 min   | 40-55min |
| 3. Rate    | 2          | ~200      | 30-45 min     | 15-20 min     | 15 min   | 1-1.5h   |
| 4. Docs    | 4          | ~250      | 0 min         | 30-45 min     | 20 min   | 50-65min |
| **TOTAL**  | **9 files**| **~800**  | **1.5-2h**    | **1.5-2h**    | **1h**   | **4-5h** |

**Note**: Total time includes configuration, documentation, and review. Excludes time for log accumulation (happens passively between Phase 1 and Phase 2).

---

## ✅ Configuration-First Benefits

### For DevOps/Security Engineers

- 🎯 **Clear configuration steps**: No ambiguity about WAF setup
- 🧪 **Safe validation**: Log mode prevents accidental blocking
- 📝 **Documented rationale**: Every config decision explained

### For Reviewers

- ⚡ **Fast review**: Screenshots provide visual proof
- 🔍 **Focused**: Each commit covers one WAF component
- ✅ **Quality**: Easy to verify config matches docs

### For the Project

- 🔄 **Reproducible**: Can recreate WAF config from docs if needed
- 📚 **Historical**: Clear changelog of WAF evolution
- 🏗️ **Maintainable**: Team can understand and adjust WAF later

---

## 📝 Best Practices

### Commit Messages

Format (documentation commits for configuration changes):
```
🔧 docs(security): enable WAF OWASP Core Rule Set

- Enable Cloudflare WAF for sebc.dev zone
- Deploy OWASP Core Rule Set (Medium sensitivity)
- Configure WAF mode: Log (validation phase)
- Document configuration in docs/security/waf-configuration.md
- Add screenshots of WAF dashboard

Part of Story 0.9 Phase 1 - Commit 1/4
```

Types:
- `🔧 docs(security)`: Configuration + documentation (use for all Phase 1 commits)
- `🔒 security`: For actual security code changes (not applicable in Phase 1)

### Documentation Quality Checklist

Before each commit:

- [ ] Screenshots captured and saved in appropriate location
- [ ] Documentation explains "what" and "why" (not just "how")
- [ ] Dashboard navigation clearly documented
- [ ] Rollback procedure mentioned
- [ ] Internal links work
- [ ] No placeholder text (e.g., "[TODO]", "TBD")

---

## ⚠️ Important Points

### Do's

- ✅ Take screenshots BEFORE and AFTER each configuration change
- ✅ Test homepage loads after each configuration step
- ✅ Document why you chose specific settings (e.g., "Medium" sensitivity)
- ✅ Use descriptive commit messages with context

### Don'ts

- ❌ Skip screenshot capture (critical for audit trail)
- ❌ Configure multiple WAF components before documenting
- ❌ Switch to "Block" mode in Phase 1 (must stay in "Log" mode)
- ❌ Forget to validate homepage still loads

---

## ⚠️ Phase 1 Specific Warnings

### WAF Mode: MUST Stay in "Log"

🚨 **CRITICAL**: Do NOT switch WAF mode to "Block" in Phase 1.

**Why**: Log mode allows monitoring without blocking legitimate users. Phase 2 will analyze logs before switching to Block mode.

**If you accidentally enable Block mode**:
1. Immediately switch back to "Log" mode
2. Check Cloudflare Security Analytics for any blocked requests
3. Document the incident in `docs/security/waf-configuration.md`

### Rate Limiting: Conservative Limits

🚨 **CRITICAL**: Start with conservative rate limits (100 req/min global).

**Why**: Better to start lenient and tighten later than block legitimate users.

**If rate limiting blocks legitimate traffic**:
1. Immediately increase rate limit or disable rule
2. Check Cloudflare Firewall Events for blocked IPs
3. Whitelist known good IPs if needed
4. Document adjustments in `docs/security/rate-limiting-rules.md`

---

## ❓ FAQ

**Q: What if I can't find the WAF section in dashboard?**
A: Ensure you have Cloudflare Pro plan or higher. Free plans don't include advanced WAF features. Contact Cloudflare support to verify plan.

**Q: Can I test WAF rules before committing documentation?**
A: Yes! WAF is live as soon as configured. Test homepage loads after each configuration step. Document final state in commit.

**Q: What if OWASP Core Rule Set has warnings in dashboard?**
A: OWASP in "Log" mode should not block anything. Warnings are informational. Document any warnings in `docs/security/waf-configuration.md`.

**Q: Should I configure WAF for all routes or just specific paths?**
A: Configure for all routes (default). Exceptions will be added in Phase 2 if needed based on log analysis.

**Q: How long should I wait before Phase 2 (tuning)?**
A: Wait at least 24-48 hours to accumulate meaningful traffic logs for analysis in Phase 2.
