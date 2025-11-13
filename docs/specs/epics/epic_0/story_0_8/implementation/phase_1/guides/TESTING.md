# Phase 1 - Testing Guide

Complete testing strategy for Phase 1 - Cloudflare Access Configuration.

---

## 🎯 Testing Strategy

Phase 1 is **dashboard configuration**, so testing is entirely **manual** and involves:

1. **Configuration Verification**: Validate settings in Cloudflare dashboard
2. **Access Flow Testing**: Test unauthenticated and authenticated access
3. **Wildcard Protection Testing**: Verify all `/admin/*` routes protected
4. **Session Testing**: Verify session duration and persistence
5. **Critical Values Verification**: Confirm Team Domain and Application AUD

**Target**: 100% manual testing verification
**Estimated Test Duration**: 30-45 minutes

---

## 🧪 Manual Testing Procedures

### Test Suite 1: Configuration Verification (Dashboard)

**Purpose**: Verify Cloudflare Access is configured correctly in the dashboard

**Prerequisites**:

- Access to Cloudflare Zero Trust dashboard
- Admin permissions on the account

**Test Procedure**:

#### Test 1.1: Access Application Exists

1. Navigate to https://one.dash.cloudflare.com/
2. Go to "Access" > "Applications"
3. Verify application exists: "sebc.dev Admin Panel" or similar

**Expected Result**: ✅ Application visible in list

**If Failed**:

- Verify you're in the correct Cloudflare account
- Check if application was created successfully in Commit 2
- Verify admin permissions

---

#### Test 1.2: Application Configuration

1. Click on "sebc.dev Admin Panel" application
2. Go to "Overview" tab
3. Verify settings:

**Expected Result**:

- ✅ Application name: "sebc.dev Admin Panel"
- ✅ Application domain: Matches your Cloudflare Workers domain
- ✅ Path: `/admin/*` (wildcard)
- ✅ Session Duration: 24 hours (or configured value)
- ✅ Status: Active

**If Failed**:

- Edit application settings in dashboard
- Correct any mismatched values
- Save and retest

---

#### Test 1.3: Policy Configuration

1. In application details, go to "Policies" tab
2. Verify policy exists: "Admin Access Policy" or similar
3. Click on policy to view details

**Expected Result**:

- ✅ Policy name: "Admin Access Policy"
- ✅ Action: Allow
- ✅ Decision: Include
- ✅ Include rule configured (email/domain/login method)
- ✅ Policy enabled

**If Failed**:

- Edit policy in dashboard
- Verify "Allow" action (not Block)
- Verify Include rule is configured
- Enable policy if disabled

---

#### Test 1.4: Authentication Method

1. Navigate to "Settings" > "Authentication"
2. Verify at least one method enabled

**Expected Result**:

- ✅ One-time PIN (email) enabled, OR
- ✅ Google SSO enabled, OR
- ✅ GitHub SSO enabled, OR
- ✅ Other SSO provider enabled

**If Failed**:

- Enable at least one authentication method
- Configure OAuth credentials if using SSO
- Test authentication method before proceeding

---

### Test Suite 2: Unauthenticated Access (Critical)

**Purpose**: Verify unauthenticated users cannot access `/admin/*` routes

**Prerequisites**:

- Cloudflare Access configured (Tests 1.1-1.4 passed)
- Application deployed and accessible
- Private/incognito browser window

**Test Procedure**:

#### Test 2.1: Root Admin Route Redirect

1. Open browser in incognito/private mode
2. Navigate to: `https://<your-domain>/admin`

**Expected Result**:

- ✅ Browser redirects to Cloudflare Access login page
- ✅ URL changes to: `https://<team-name>.cloudflareaccess.com/cdn-cgi/access/login/<app-id>`
- ✅ Login form displayed

**If Failed**:

- Verify application path is `/admin/*` (not `/admin` without wildcard)
- Verify policy is enabled
- Verify application is "Active" status
- Check if DNS/routing is correct for your domain

---

#### Test 2.2: Sub-route Protection (Wildcard Test)

1. In same incognito window
2. Navigate to: `https://<your-domain>/admin/test`
3. Then try: `https://<your-domain>/admin/users`
4. Then try: `https://<your-domain>/admin/settings/profile`

**Expected Result**:

- ✅ ALL routes redirect to Cloudflare Access login
- ✅ Wildcard protection works for nested routes
- ✅ No direct access without authentication

**If Failed**:

- Verify path in application config includes wildcard: `/admin/*`
- If missing wildcard, update application path
- Retest after correction

---

### Test Suite 3: Authentication Flow (Critical)

**Purpose**: Verify authentication methods work end-to-end

**Prerequisites**:

- Tests 2.1 and 2.2 passed (unauthenticated redirect works)
- Know which authentication method is configured
- Have valid credentials/email

**Test Procedure**:

#### Test 3.1: One-time PIN Authentication (if using email OTP)

1. Open incognito browser
2. Navigate to: `https://<your-domain>/admin`
3. Redirected to Cloudflare Access login page
4. Enter your email address
5. Click "Send me a code"
6. Check email inbox for OTP code
7. Enter OTP code in login form
8. Submit

**Expected Result**:

- ✅ Email received with OTP code (within 1-2 minutes)
- ✅ OTP code acceptance
- ✅ Redirect back to: `https://<your-domain>/admin`
- ✅ Admin page accessible (no error)
- ✅ Browser has `CF-Authorization` cookie

**If Failed**:

- Check email spam folder for OTP
- Verify email is in allowed list (policy Include rule)
- Request new OTP if expired
- Check Cloudflare Access logs for auth failures

---

#### Test 3.2: SSO Authentication (if using Google/GitHub)

1. Open incognito browser
2. Navigate to: `https://<your-domain>/admin`
3. Redirected to Cloudflare Access login page
4. Click "Login with Google" or "Login with GitHub"
5. Complete OAuth flow with SSO provider
6. Grant permissions if requested

**Expected Result**:

- ✅ Redirect to Google/GitHub login
- ✅ OAuth flow completes successfully
- ✅ Redirect back to: `https://<your-domain>/admin`
- ✅ Admin page accessible
- ✅ Browser has `CF-Authorization` cookie

**If Failed**:

- Verify OAuth credentials configured in Cloudflare
- Check if email/org is in allowed list (policy)
- Verify SSO provider account is valid
- Check Cloudflare Access logs for auth failures

---

#### Test 3.3: Post-Authentication Access

After successful authentication (Test 3.1 or 3.2):

1. Remain in same browser session
2. Navigate to: `https://<your-domain>/admin/test`
3. Navigate to: `https://<your-domain>/admin/users`
4. Refresh page (`https://<your-domain>/admin`)

**Expected Result**:

- ✅ All `/admin/*` routes accessible without re-authentication
- ✅ Session persists across page navigation
- ✅ Refresh doesn't require re-authentication
- ✅ `CF-Authorization` cookie present

**If Failed**:

- Check session duration in application config
- Verify cookie is not being blocked by browser
- Check if cookie has correct domain and path
- Verify application settings allow session persistence

---

### Test Suite 4: Session Management

**Purpose**: Verify session duration and logout behavior

**Prerequisites**:

- Test 3 completed successfully (authenticated session active)

**Test Procedure**:

#### Test 4.1: Session Persistence

1. After authentication, note current time
2. Wait 5 minutes
3. Navigate to any `/admin/*` route
4. Wait 15 minutes
5. Navigate to any `/admin/*` route again

**Expected Result**:

- ✅ After 5 min: Access still granted (session active)
- ✅ After 15 min: Access still granted (session active)
- ✅ No re-authentication required within session duration

**If Failed**:

- Check session duration setting (should be 24h)
- Verify cookie is not expiring prematurely
- Check browser cookie settings

---

#### Test 4.2: Cookie Verification

1. With authenticated session active
2. Open browser DevTools (F12)
3. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
4. Navigate to "Cookies" > `https://<your-domain>`
5. Locate `CF-Authorization` cookie

**Expected Result**:

- ✅ Cookie name: `CF-Authorization`
- ✅ Cookie present and not expired
- ✅ Cookie domain matches your domain
- ✅ Cookie has appropriate expiration time
- ✅ Cookie is HttpOnly and Secure

**If Failed**:

- If cookie missing: Authentication may have failed silently
- If expired: Session duration may be too short
- If wrong domain: Application domain config may be incorrect

---

#### Test 4.3: Manual Logout

1. With authenticated session active
2. Open browser DevTools
3. Clear `CF-Authorization` cookie manually
4. Navigate to: `https://<your-domain>/admin`

**Expected Result**:

- ✅ Redirect to Cloudflare Access login page
- ✅ Re-authentication required
- ✅ Cookie deletion terminates session

**If Failed**:

- Session may be cached elsewhere (unlikely)
- Verify cookie was actually deleted
- Try full browser cache clear

---

### Test Suite 5: Critical Values Verification

**Purpose**: Verify Team Domain and Application AUD are correct

**Prerequisites**:

- Access to Cloudflare Zero Trust dashboard
- Commit 4 completed (values documented)

**Test Procedure**:

#### Test 5.1: Team Domain Verification

1. Navigate to: https://one.dash.cloudflare.com/
2. Go to "Settings" > "General"
3. Locate "Team Domain" field
4. Compare with documented value

**Expected Result**:

- ✅ Team Domain displayed in dashboard
- ✅ Format: `<team-name>.cloudflareaccess.com`
- ✅ Matches value in `docs/deployment/cloudflare-access-setup.md`
- ✅ Matches value in `.env.example` (placeholder)

**If Failed**:

- Update documented value if incorrect
- Verify you're in correct Cloudflare account
- Confirm format is exact (no typos)

---

#### Test 5.2: Application AUD Verification

1. Navigate to: https://one.dash.cloudflare.com/
2. Go to "Access" > "Applications"
3. Click on "sebc.dev Admin Panel"
4. Go to "Overview" tab
5. Locate "Application Audience (AUD)" tag
6. Compare with documented value

**Expected Result**:

- ✅ Application AUD displayed (UUID format)
- ✅ Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- ✅ Matches value in `docs/deployment/cloudflare-access-setup.md`
- ✅ Matches value in `.env.example` (placeholder)

**If Failed**:

- Update documented value if incorrect
- Verify UUID format is correct
- Confirm you're viewing correct application

---

## 🐛 Debugging Failed Tests

### Common Issues and Solutions

#### Issue: Can't access Cloudflare dashboard

**Symptoms**:

- Login fails or dashboard not loading
- "Access denied" errors

**Solutions**:

1. Verify Cloudflare account credentials
2. Check if 2FA/MFA is required
3. Ensure admin permissions granted
4. Try different browser or clear cache

---

#### Issue: Application not found in dashboard

**Symptoms**:

- "sebc.dev Admin Panel" not visible in Applications list

**Solutions**:

1. Verify you're in correct Cloudflare account
2. Check if application was actually created (Commit 2)
3. Try refreshing dashboard
4. Check if you have permissions to view Access applications

---

#### Issue: No redirect to login page

**Symptoms**:

- Accessing `/admin` doesn't redirect
- Page loads normally without authentication

**Solutions**:

1. Verify application path is `/admin/*` (with wildcard)
2. Check if policy is enabled
3. Verify application status is "Active"
4. Clear browser cache and try incognito
5. Wait 1-2 minutes for config to propagate
6. Check Cloudflare Access logs for errors

---

#### Issue: Authentication fails

**Symptoms**:

- OTP code not received or rejected
- SSO login fails or loops

**Solutions**:

**For One-time PIN**:

1. Check email spam folder
2. Verify email is in policy Include rule
3. Request new OTP (may have expired)
4. Try different email if possible

**For SSO**:

1. Verify OAuth credentials configured correctly
2. Check if email/organization is allowed
3. Test SSO provider account directly
4. Review Cloudflare Access logs for OAuth errors

---

#### Issue: Session doesn't persist

**Symptoms**:

- Re-authentication required on every page
- Cookie not persisting

**Solutions**:

1. Check session duration in application config
2. Verify browser allows cookies
3. Check if browser privacy settings block cookies
4. Try different browser
5. Verify cookie domain matches your domain

---

## ✅ Testing Checklist

Complete this checklist before marking Phase 1 as tested:

### Configuration Tests

- [ ] Test 1.1: Application exists in dashboard
- [ ] Test 1.2: Application configured correctly
- [ ] Test 1.3: Policy configured correctly
- [ ] Test 1.4: Authentication method enabled

### Access Control Tests

- [ ] Test 2.1: Unauthenticated redirect works (root `/admin`)
- [ ] Test 2.2: Wildcard protection works (sub-routes)

### Authentication Tests

- [ ] Test 3.1: One-time PIN authentication works (if configured)
- [ ] Test 3.2: SSO authentication works (if configured)
- [ ] Test 3.3: Post-authentication access works

### Session Tests

- [ ] Test 4.1: Session persistence verified
- [ ] Test 4.2: Cookie verification passed
- [ ] Test 4.3: Manual logout works

### Critical Values Tests

- [ ] Test 5.1: Team Domain verified
- [ ] Test 5.2: Application AUD verified

### Documentation Verification

- [ ] Configuration guide matches actual dashboard settings
- [ ] Critical values documented correctly
- [ ] `.env.example` updated with correct placeholders
- [ ] Troubleshooting guide is helpful

---

## 📊 Test Results Template

Use this template to document test results:

```markdown
## Phase 1 Test Results

**Tester**: [Name]
**Date**: [Date]
**Environment**: [Cloudflare Account / Domain]

### Test Suite 1: Configuration Verification

- Test 1.1: ✅ PASS / ❌ FAIL - [Notes]
- Test 1.2: ✅ PASS / ❌ FAIL - [Notes]
- Test 1.3: ✅ PASS / ❌ FAIL - [Notes]
- Test 1.4: ✅ PASS / ❌ FAIL - [Notes]

### Test Suite 2: Unauthenticated Access

- Test 2.1: ✅ PASS / ❌ FAIL - [Notes]
- Test 2.2: ✅ PASS / ❌ FAIL - [Notes]

### Test Suite 3: Authentication Flow

- Test 3.1 (OTP): ✅ PASS / ❌ FAIL / ⏭️ SKIP - [Notes]
- Test 3.2 (SSO): ✅ PASS / ❌ FAIL / ⏭️ SKIP - [Notes]
- Test 3.3: ✅ PASS / ❌ FAIL - [Notes]

### Test Suite 4: Session Management

- Test 4.1: ✅ PASS / ❌ FAIL - [Notes]
- Test 4.2: ✅ PASS / ❌ FAIL - [Notes]
- Test 4.3: ✅ PASS / ❌ FAIL - [Notes]

### Test Suite 5: Critical Values

- Test 5.1: ✅ PASS / ❌ FAIL - [Notes]
- Test 5.2: ✅ PASS / ❌ FAIL - [Notes]

### Overall Result

- ✅ **ALL TESTS PASSED** - Ready for Phase 2
- ❌ **TESTS FAILED** - Issues to fix: [List]

### Notes

[Any additional observations, issues, or recommendations]
```

---

## ❓ FAQ

**Q: Can I automate any of these tests?**
A: Phase 1 is dashboard configuration, so tests are manual. Phase 2 (middleware) will have automated tests.

**Q: How long should testing take?**
A: 30-45 minutes for complete test suite. Can be faster if familiar with process.

**Q: What if some tests fail?**
A: Document failures, debug using troubleshooting guide, fix configuration in dashboard, retest.

**Q: Do I need to test all authentication methods?**
A: Test only the method(s) you configured. Skip tests for methods not enabled (mark as SKIP).

**Q: Can I test in production?**
A: Test in staging/development first if available. For production, test carefully with known good credentials.

---

## 🔗 Reference Documentation

### Internal Documentation

- [Story 0.8 Specification](../../story_0.8.md)
- [Phase 1 Index](../INDEX.md)
- [Implementation Plan](../IMPLEMENTATION_PLAN.md)
- [Commit Checklist](../COMMIT_CHECKLIST.md)

### Cloudflare Documentation

- [Cloudflare Access Testing](https://developers.cloudflare.com/cloudflare-one/policies/access/test-access-policies/)
- [Troubleshooting Access](https://developers.cloudflare.com/cloudflare-one/faq/access/)

---

**Ready to test! Follow test suites sequentially and document results. 🧪**
