# Phase 1 - Testing & Validation Guide

Complete testing and validation strategy for Phase 1 (WAF Core Configuration).

**Note**: Phase 1 focuses on **smoke testing** and **monitoring validation**. Comprehensive security testing (negative tests) happens in Phase 3.

---

## 🎯 Testing Strategy

Phase 1 uses a **validation-focused approach** rather than comprehensive testing:

1. **Smoke Tests**: Verify legitimate traffic still works (no false positives)
2. **Dashboard Verification**: Confirm WAF configuration matches documentation
3. **Monitoring Validation**: Verify WAF events are visible (when they occur)

**Target Coverage**: 100% of legitimate user flows should work (no false positives)
**Estimated Test Duration**: 20-30 minutes

**Why no negative tests in Phase 1?**
- WAF is in "Log" mode (doesn't block anything yet)
- Negative tests (attack simulation) are more meaningful in Phase 3 when WAF is in "Block" mode
- Phase 1 focuses on ensuring we don't break legitimate traffic

---

## 🧪 Smoke Tests (Positive Tests)

### Purpose

Verify that legitimate traffic flows correctly and is not blocked or challenged by WAF in Log mode.

### Prerequisites

- [ ] Phase 1 implementation completed (all 4 commits)
- [ ] WAF enabled in Cloudflare Dashboard
- [ ] Application deployed to Cloudflare Workers

### Running Smoke Tests

#### Test 1: Homepage Loads

**Purpose**: Verify homepage is accessible and returns expected content

**Command**:
```bash
curl -I https://sebc.dev
```

**Expected Result**:
```
HTTP/2 200
date: [current date]
content-type: text/html; charset=utf-8
server: cloudflare
cf-ray: [ray ID]
[additional headers...]
```

**Pass Criteria**:
- ✅ Status code is 200 OK
- ✅ Server header contains "cloudflare"
- ✅ No 403 Forbidden (WAF block)
- ✅ No 429 Too Many Requests (rate limit)
- ✅ No 522 Connection Timeout

**If test fails**:
- Check if WAF mode is "Log" (should not block in Log mode)
- Check Cloudflare Dashboard > Security > Events for any logged events
- Verify application is deployed (Story 0.7 complete)

---

#### Test 2: Static Assets Load

**Purpose**: Verify CSS, JavaScript, and image assets are served correctly

**Commands**:
```bash
# Test CSS asset (adjust path to actual CSS file)
curl -I https://sebc.dev/_next/static/css/[filename].css

# Test JavaScript asset (adjust path)
curl -I https://sebc.dev/_next/static/chunks/[filename].js

# Test image asset (if public images exist)
curl -I https://sebc.dev/images/[image-name].png
```

**Expected Result**:
```
HTTP/2 200
content-type: text/css (or application/javascript, or image/png)
server: cloudflare
cf-cache-status: [HIT/MISS/DYNAMIC]
[additional headers...]
```

**Pass Criteria**:
- ✅ All static assets return 200 OK
- ✅ No 403 Forbidden
- ✅ Appropriate content-type headers

**If test fails**:
- Verify assets exist in deployment
- Check if any WAF rules could misinterpret static asset requests as threats
- Check Cloudflare Dashboard > Security > Events

---

#### Test 3: API Endpoints (if applicable)

**Purpose**: Verify API endpoints are accessible (if application has API routes)

**Command**:
```bash
# Example: Health check endpoint
curl -I https://sebc.dev/api/health

# Example: Articles API (if exists)
curl https://sebc.dev/api/articles
```

**Expected Result**:
```
HTTP/2 200
content-type: application/json
server: cloudflare
[additional headers...]
```

**Pass Criteria**:
- ✅ API endpoints return expected status codes (200, 201, etc.)
- ✅ No false positive blocks

**If test fails**:
- Check if API payloads trigger OWASP rules (unlikely in Log mode)
- Verify API is deployed and functional
- Check Security > Events for logged API requests

---

#### Test 4: Form Submission (if applicable)

**Purpose**: Verify form submissions work without WAF interference

**Note**: Only test if application has public-facing forms in V1. Admin forms will be tested separately.

**Command** (example with contact form):
```bash
# POST request to form endpoint
curl -X POST https://sebc.dev/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'
```

**Expected Result**:
```
HTTP/2 200 (or 201 Created)
content-type: application/json
[response body with success message]
```

**Pass Criteria**:
- ✅ Form submission accepted
- ✅ No 403 Forbidden (WAF doesn't flag legitimate form data)
- ✅ Response indicates success

**If test fails**:
- Check if form data contains patterns that trigger OWASP rules
- Verify form validation on server side
- Check WAF events for details

---

#### Test 5: Admin Routes (if accessible)

**Purpose**: Verify admin routes are accessible (for authorized users)

**Note**: If Cloudflare Access (Story 0.8) is not yet configured, admin routes should be publicly accessible (which is why Story 0.8 is important).

**Command**:
```bash
# Test admin homepage
curl -I https://sebc.dev/admin

# Note: This may redirect to Cloudflare Access login if Story 0.8 is complete
```

**Expected Result** (if Story 0.8 not complete):
```
HTTP/2 200
content-type: text/html
[admin page HTML]
```

**Expected Result** (if Story 0.8 complete):
```
HTTP/2 302 Found
location: [Cloudflare Access login URL]
```

**Pass Criteria**:
- ✅ Admin route responds (not blocked by WAF)
- ✅ Cloudflare Access handles authentication (if Story 0.8 complete)
- ✅ WAF doesn't interfere with Access flow

**If test fails**:
- Verify admin route exists in Next.js app
- Check if WAF rules conflict with Access (unlikely)
- Verify Story 0.7 deployment includes admin routes

---

### Smoke Test Summary

Run all smoke tests and record results:

| Test                  | Status | Notes                |
| --------------------- | ------ | -------------------- |
| Homepage loads        | ⏳     | [Pass/Fail, details] |
| Static assets load    | ⏳     | [Pass/Fail, details] |
| API endpoints         | ⏳     | [Pass/Fail, details] |
| Form submission       | ⏳     | [Pass/Fail, details] |
| Admin routes          | ⏳     | [Pass/Fail, details] |

**All tests must pass before Phase 1 is considered complete.**

---

## 🔍 Dashboard Verification

### Purpose

Verify WAF configuration in Cloudflare Dashboard matches documentation.

### Manual Verification Steps

#### Step 1: WAF Status

1. Navigate to: **Cloudflare Dashboard > sebc.dev > Security > WAF > Overview**
2. Verify:
   - [ ] WAF status = "Active"
   - [ ] No error messages or warnings
   - [ ] Dashboard shows WAF is operational

**Screenshot**: Capture WAF Overview for documentation

---

#### Step 2: OWASP Core Rule Set

1. Navigate to: **Security > WAF > Managed Rules**
2. Find "Cloudflare OWASP Core Ruleset" in the list
3. Verify:
   - [ ] Status = "Enabled"
   - [ ] Action = "Log" (NOT "Block")
   - [ ] Sensitivity = "Medium"

**Screenshot**: Capture OWASP ruleset configuration

---

#### Step 3: Cloudflare Managed Ruleset

1. In the same **Managed Rules** page
2. Find "Cloudflare Managed Ruleset" in the list
3. Verify:
   - [ ] Status = "Enabled"
   - [ ] Action = default (varies by rule, typically "Block" or "Challenge")

**Screenshot**: Capture Cloudflare Managed Ruleset in list

---

#### Step 4: Rate Limiting

1. Navigate to: **Security > WAF > Rate Limiting Rules**
2. Find "Global Rate Limit - Protection" rule
3. Verify:
   - [ ] Status = "Enabled"
   - [ ] Rate = "100 requests per 1 minute"
   - [ ] Action = "Block"
   - [ ] Mitigation timeout = "1 minute"

**Screenshot**: Capture rate limiting rule configuration

---

### Dashboard Verification Checklist

- [ ] WAF Overview shows "Active" status
- [ ] OWASP Core Rule Set enabled (Log mode, Medium sensitivity)
- [ ] Cloudflare Managed Ruleset enabled
- [ ] Rate limiting rule configured (100 req/min, Block action)
- [ ] All screenshots captured and match documentation
- [ ] No unexpected rules or configurations

---

## 📊 Monitoring Validation

### Purpose

Verify WAF events are visible in Cloudflare Security Analytics (for future log analysis in Phase 2).

### Access Security Events

1. Navigate to: **Cloudflare Dashboard > sebc.dev > Security > Events**
   - OR: **Security > Analytics** (depending on Cloudflare UI version)

2. You should see a list of requests/events

3. Filter by:
   - **Service**: "Firewall" or "WAF"
   - **Action**: "Log" (since we're in Log mode)

### Expected Behavior

**Immediately after Phase 1** (low traffic):
- May see no WAF events (if no malicious traffic yet)
- May see some logged events (if any requests triggered OWASP/Cloudflare Managed rules)
- Rate limiting events only if someone exceeded 100 req/min

**After 24-48 hours** (for Phase 2):
- Should accumulate meaningful event logs
- Can analyze patterns for false positives

### Monitoring Checklist

- [ ] Can access Security > Events (or Security > Analytics)
- [ ] Can filter by "Firewall" or "WAF" service
- [ ] Can see event details (if any events exist)
- [ ] Events show "Action: Log" (confirming Log mode)
- [ ] Can view request details (URL, IP, rule triggered, etc.)
- [ ] Dashboard bookmarked for easy future access

**Note**: Lack of events is NOT a failure. It just means no malicious traffic detected yet.

---

## 🐛 Troubleshooting Tests

### Issue: Homepage returns 403 Forbidden

**Symptoms**:
```bash
curl -I https://sebc.dev
# HTTP/2 403
```

**Diagnosis**:

1. Check WAF mode:
   - Navigate to: Security > WAF > Managed Rules
   - Verify OWASP Core Rule Set action = "Log" (NOT "Block")

2. Check if Cloudflare Access is enabled (Story 0.8):
   - Navigate to: Access > Access Groups
   - Verify Access is not blocking public routes

3. Check Firewall Events:
   - Navigate to: Security > Events
   - Look for 403 responses
   - Check which rule triggered the block

**Solutions**:

- **If WAF mode is "Block"**: Change OWASP Core Rule Set action back to "Log"
- **If Access is misconfigured**: Verify Access only protects `/admin/*` routes
- **If specific rule triggered**: Create exception for that rule (advanced, defer to Phase 2)

---

### Issue: Static assets return 404 or 522

**Symptoms**:
```bash
curl -I https://sebc.dev/_next/static/css/app.css
# HTTP/2 404 or 522
```

**Diagnosis**:

1. Verify assets exist in deployment:
   - Check build output: `.open-next/assets/`
   - Verify `wrangler.toml` routes include assets

2. Check if WAF is interfering:
   - Temporarily disable WAF (Security > WAF > Overview > Pause)
   - Re-test asset loading
   - If works: WAF issue. If still fails: deployment issue.

**Solutions**:

- **If deployment issue**: Re-deploy application (Story 0.7)
- **If WAF issue**: Very unlikely. Check Firewall Events for details.

---

### Issue: Rate limiting blocks normal traffic

**Symptoms**:
```bash
curl -I https://sebc.dev
# HTTP/2 429 Too Many Requests
```

**Diagnosis**:

1. Check if you exceeded rate limit:
   - Did you send >100 requests in 1 minute?
   - Check Firewall Events for rate limit blocks

2. Check rate limiting rule:
   - Navigate to: Security > WAF > Rate Limiting Rules
   - Verify rate is 100 req/min (not too strict)

**Solutions**:

- **If you triggered it**: Wait 1 minute (mitigation timeout), then retry
- **If rate limit is too strict**: Increase to 200 req/min or higher
- **If false positive**: Whitelist your IP (Security > IP Access Rules)

---

## ✅ Testing Checklist

Before marking Phase 1 as complete:

### Smoke Tests

- [ ] Homepage loads (200 OK)
- [ ] Static assets load (CSS, JS, images)
- [ ] API endpoints respond (if applicable)
- [ ] Form submissions work (if applicable)
- [ ] Admin routes accessible (if applicable)

### Dashboard Verification

- [ ] WAF status = "Active"
- [ ] OWASP Core Rule Set enabled (Log mode, Medium sensitivity)
- [ ] Cloudflare Managed Ruleset enabled
- [ ] Rate limiting configured (100 req/min, Block action, 1 min timeout)
- [ ] All screenshots captured

### Monitoring Validation

- [ ] Can access Security > Events
- [ ] Can filter by WAF events
- [ ] Dashboard bookmarked for Phase 2 log analysis

### Documentation Validation

- [ ] All smoke test results documented
- [ ] Dashboard verification screenshots saved
- [ ] Any issues/troubleshooting documented
- [ ] Baseline performance captured (for Phase 3 comparison)

---

## 📝 Test Results Documentation

Document all test results in this format:

```markdown
## Phase 1 - Test Results

**Tested By**: [Name]
**Date**: [Date]
**Environment**: Production (sebc.dev)

### Smoke Tests

| Test                  | Status | Details                              |
| --------------------- | ------ | ------------------------------------ |
| Homepage loads        | ✅ Pass | HTTP 200 OK, cf-ray: [ID]           |
| Static assets load    | ✅ Pass | CSS, JS, images all 200 OK          |
| API endpoints         | ✅ Pass | /api/health returns 200 OK          |
| Form submission       | N/A    | No public forms in V1                |
| Admin routes          | ✅ Pass | Redirects to Access login (Story 0.8)|

### Dashboard Verification

- ✅ WAF status: Active
- ✅ OWASP Core Rule Set: Enabled (Log mode, Medium sensitivity)
- ✅ Cloudflare Managed Ruleset: Enabled
- ✅ Rate limiting: Enabled (100 req/min, Block action)
- ✅ All screenshots captured and saved

### Monitoring Validation

- ✅ Security > Events accessible
- ✅ Can filter by WAF service
- ✅ [X] events logged (as of test date)
- ✅ Dashboard bookmarked

### Issues Found

- [ ] None
- [ ] [List any issues and resolutions]

### Recommendations

- Wait 24-48 hours for traffic logs to accumulate before Phase 2
- Monitor Security > Events daily for any unexpected patterns
- [Any other recommendations]

### Conclusion

Phase 1 testing: **PASSED** / **FAILED**

All smoke tests pass. WAF is operational in Log mode. No false positives detected. Ready for Phase 2 after log accumulation period.

**Signed**: [Name]
**Date**: [Date]
```

---

## 🎯 Success Criteria

Phase 1 testing is successful when:

- [ ] ✅ All smoke tests pass (100% success rate)
- [ ] ✅ WAF configuration verified in dashboard
- [ ] ✅ No false positives (legitimate traffic works)
- [ ] ✅ Security Events accessible for monitoring
- [ ] ✅ Screenshots captured for audit trail
- [ ] ✅ Test results documented

**Phase 1 testing complete! Ready for Phase 2 (after 24-48h log accumulation). 🎉**

---

## 📚 Next Steps

After Phase 1 testing passes:

1. **Wait 24-48 hours**: Allow traffic logs to accumulate
2. **Monitor Security Events**: Check daily for patterns
3. **Document any issues**: Note any logged events that seem like false positives
4. **Prepare for Phase 2**:
   - Analyze logs accumulated during waiting period
   - Identify false positives for exception rules
   - Plan custom rules if needed
   - Prepare to switch WAF mode from "Log" to "Block"

---

## ❓ FAQ

**Q: Why no negative tests (attack simulation) in Phase 1?**
A: WAF is in Log mode. Negative tests are more meaningful in Phase 3 when WAF actively blocks attacks.

**Q: What if smoke tests fail?**
A: Investigate and fix before proceeding. WAF should NOT break legitimate traffic, even in Log mode.

**Q: Should I test from different IPs/locations?**
A: Optional but recommended. Test from different locations to ensure no geo-based issues.

**Q: How do I know if rate limiting is working?**
A: In Log mode, it still blocks (rate limiting action is "Block", not "Log"). Test by sending 100+ requests in 1 minute (from non-production IP).

**Q: What if I can't access Security > Events?**
A: Verify you have Administrator role. May need Super Administrator for some analytics features.

**Q: Should I test Cloudflare Access (Story 0.8) in Phase 1?**
A: Brief verification that WAF doesn't interfere with Access is sufficient. Full Access testing is in Story 0.8.
