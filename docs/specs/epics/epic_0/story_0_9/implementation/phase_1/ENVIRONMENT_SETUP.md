# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1 (WAF Core Configuration).

---

## 📋 Prerequisites

### Previous Phases/Stories

- [ ] **Story 0.7** (CI/CD deployment) - Application should be deployed to Cloudflare Workers for testing
- [ ] **sebc.dev zone** configured in Cloudflare

**Why**: WAF protects deployed applications. You need a live deployment to configure and validate WAF.

### Cloudflare Account Requirements

- [ ] Cloudflare account with **Pro plan or higher**
- [ ] Access to **sebc.dev** zone
- [ ] **Administrator** or **Super Administrator** role

**Verification**:
```bash
# Navigate to: https://dash.cloudflare.com
# Select zone: sebc.dev
# Click: Account > Members
# Verify your role shows "Administrator" or "Super Administrator"
```

**Why Pro Plan**: Advanced WAF features (OWASP Core Rule Set, Cloudflare Managed Ruleset, custom rules) require Pro plan or higher. Free plans have limited WAF capabilities.

**If you don't have Pro plan**:
- Upgrade at: https://dash.cloudflare.com/[account-id]/sebc.dev/analytics
- Contact account owner to upgrade plan
- Estimated cost: ~$20/month for Pro plan

### Tools Required

- [ ] **Web Browser**: Chrome, Firefox, or Edge (for Cloudflare Dashboard access)
- [ ] **curl** (for smoke testing): Pre-installed on Linux/macOS, Windows requires installation
- [ ] **Screenshot tool**: Built-in (macOS: Cmd+Shift+4, Windows: Win+Shift+S, Linux: varies)
- [ ] **Git**: For committing documentation

**Verification**:
```bash
# Verify curl is installed
curl --version
# Expected: curl version output

# Verify git is installed
git --version
# Expected: git version output
```

### Services Required

- [ ] **sebc.dev** deployed to Cloudflare Workers (Story 0.7)
- [ ] **DNS** configured correctly (sebc.dev points to Cloudflare)
- [ ] **Application accessible** (homepage loads at https://sebc.dev)

**Verification**:
```bash
# Test homepage loads
curl -I https://sebc.dev
# Expected: HTTP/2 200 (or HTTP/1.1 200)

# Verify DNS points to Cloudflare
dig sebc.dev +short
# Expected: Cloudflare IP addresses (104.x.x.x or 172.x.x.x ranges)
```

---

## 🔧 Cloudflare Dashboard Access

### Step 1: Login to Cloudflare Dashboard

1. Navigate to: https://dash.cloudflare.com
2. Login with your Cloudflare account credentials
3. **If 2FA enabled**: Enter your 2FA code

### Step 2: Select sebc.dev Zone

1. You should see a list of zones (websites) you have access to
2. Click on **sebc.dev** zone
3. Verify you're on the correct zone (check zone name in top-left)

**Screenshot Location**: Top-left of dashboard shows zone name

### Step 3: Navigate to WAF

1. In left sidebar, click **Security**
2. Click **WAF** (Web Application Firewall)
3. You should see WAF Overview page

**Dashboard Navigation Path**:
```
Cloudflare Dashboard
  └── Select Zone: sebc.dev
      └── Security (left sidebar)
          └── WAF
              ├── Overview
              ├── Managed Rules
              ├── Custom Rules
              ├── Rate Limiting Rules
              └── Tools
```

### Step 4: Verify Permissions

1. Navigate to: Security > WAF > Managed Rules
2. Look for "Deploy managed ruleset" button
3. **If you see the button**: You have sufficient permissions ✅
4. **If button is disabled or missing**: You need higher permissions ❌

**If you don't have permissions**:
- Contact your Cloudflare account administrator
- Request "Administrator" role for sebc.dev zone
- Provide reason: "Need to configure WAF for Story 0.9"

---

## 📦 No Dependencies Installation

**Good news**: Phase 1 requires **zero package installations**!

This is a configuration-only phase. All work is done via Cloudflare Dashboard.

**Why**: WAF is a Cloudflare Edge service. No code changes or package installations required.

---

## 🔐 Environment Variables

**No environment variables required for Phase 1**.

WAF configuration is stored in Cloudflare's infrastructure, not in your application code or `.env` files.

**Note**: WAF configuration is zone-specific (tied to sebc.dev domain). There is no "local" WAF environment.

---

## 🗄️ External Services Setup

### Cloudflare WAF Service

**Purpose**: Protect sebc.dev from web threats at Cloudflare Edge

**Service Type**: Managed Cloudflare service (no manual setup required)

**Access**:
- **URL**: https://dash.cloudflare.com
- **Zone**: sebc.dev
- **Navigation**: Security > WAF

**Verification**:

1. Navigate to: https://dash.cloudflare.com
2. Select zone: sebc.dev
3. Click: Security > WAF > Overview
4. Verify you can see WAF Overview page (may show "No rules deployed" if first time)

**Expected State Before Phase 1**:
- WAF section accessible
- No managed rulesets deployed (unless previously configured)
- Rate limiting rules may be empty

**If WAF section is missing**:
- Verify you have Cloudflare Pro plan (Free plans have limited access)
- Verify you're on the correct zone (sebc.dev)
- Contact Cloudflare support if issue persists

---

### Cloudflare Security Analytics

**Purpose**: Monitor WAF events and analyze traffic patterns

**Access**:
- **Navigation**: Security > Analytics OR Security > Events

**Setup**: No setup required, automatically available with WAF

**Verification**:

```bash
# Navigate to: Security > Analytics (or Security > Events)
# Expected: Empty or low activity (before WAF is configured)
# After WAF is configured: WAF events will appear here
```

**Key Metrics to Monitor**:
- Total requests
- Requests blocked by WAF
- Requests challenged
- Top triggered rules
- Top countries/IPs triggering rules

**Note**: Analytics data may take 1-2 minutes to appear after WAF configuration changes.

---

## ✅ Connection Tests

### Test 1: Cloudflare Dashboard Access

**Purpose**: Verify you can access Cloudflare Dashboard and sebc.dev zone

**Steps**:
1. Open browser
2. Navigate to: https://dash.cloudflare.com
3. Login with your credentials
4. Select zone: sebc.dev
5. Navigate to: Security > WAF

**Expected Result**:
- ✅ Dashboard loads successfully
- ✅ sebc.dev zone selectable
- ✅ WAF section accessible
- ✅ "Deploy managed ruleset" button visible (or similar WAF configuration options)

**If test fails**:
- Verify login credentials
- Verify sebc.dev zone exists in your account
- Verify you have Administrator role
- Clear browser cache and try again

---

### Test 2: Application Accessibility

**Purpose**: Verify sebc.dev is deployed and accessible (baseline before WAF)

**Test Commands**:
```bash
# Test homepage loads
curl -I https://sebc.dev

# Expected Output:
# HTTP/2 200 (or HTTP/1.1 200)
# server: cloudflare
# (additional headers...)

# Test with verbose output to see headers
curl -v https://sebc.dev

# Expected:
# Should see Cloudflare headers (cf-ray, cf-cache-status, etc.)
# HTML content should load
```

**Expected Result**:
- ✅ HTTP 200 OK response
- ✅ Cloudflare headers present (`server: cloudflare`, `cf-ray`, etc.)
- ✅ HTML content loads correctly

**If test fails**:
- Verify Story 0.7 (deployment) is complete
- Verify DNS is configured correctly: `dig sebc.dev +short`
- Verify application is deployed to Cloudflare Workers
- Check Cloudflare Dashboard for deployment errors

---

### Test 3: WAF Not Yet Configured

**Purpose**: Confirm WAF is in "unconfigured" state before Phase 1

**Steps**:
1. Navigate to: Security > WAF > Managed Rules
2. Check if any managed rulesets are deployed

**Expected Result**:
- ✅ **Before Phase 1**: No managed rulesets deployed (or only default/basic rules)
- ✅ **After Phase 1**: OWASP Core Rule Set + Cloudflare Managed Ruleset deployed

**If managed rulesets already exist**:
- Document existing configuration
- Decide whether to keep or replace with Phase 1 configuration
- Consult with team before making changes

---

## 🚨 Troubleshooting

### Issue: "WAF section not visible in dashboard"

**Symptoms**:
- Security section exists but no WAF submenu
- WAF Overview shows "Upgrade required" message

**Solutions**:
1. **Verify Cloudflare plan**:
   - Navigate to: Account > Billing
   - Check plan type for sebc.dev
   - Expected: Pro plan or higher
   - If Free plan: Upgrade to Pro ($20/month)

2. **Verify zone is active**:
   - Navigate to: Overview
   - Check zone status
   - Expected: "Active"
   - If not active: Follow Cloudflare DNS setup guide

3. **Clear browser cache**:
   ```bash
   # Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (macOS)
   # Or try incognito/private browsing mode
   ```

**Verify Fix**:
- WAF section should now be visible
- "Deploy managed ruleset" button accessible

---

### Issue: "Insufficient permissions to configure WAF"

**Symptoms**:
- WAF section visible but "Deploy managed ruleset" button disabled
- Error message: "You don't have permission to perform this action"

**Solutions**:
1. **Check your role**:
   ```bash
   # Navigate to: Account > Members
   # Find your account in the list
   # Check role column
   # Expected: "Administrator" or "Super Administrator"
   ```

2. **Request permission upgrade**:
   - Contact Cloudflare account owner
   - Request "Administrator" role for sebc.dev zone
   - Provide reason: "Configure WAF for security hardening (Story 0.9)"

3. **Alternative: Use API tokens** (if available):
   - Navigate to: My Profile > API Tokens
   - Create token with "Zone.Firewall Services" permission
   - Use Cloudflare API to configure WAF (advanced, not recommended for Phase 1)

**Verify Fix**:
- Role updated to Administrator
- "Deploy managed ruleset" button now clickable

---

### Issue: "Homepage not loading (404 or 522 error)"

**Symptoms**:
- `curl https://sebc.dev` returns 404 Not Found
- or: 522 Connection Timed Out

**Solutions**:
1. **Verify deployment (Story 0.7)**:
   ```bash
   # Check if Worker is deployed
   # Navigate to: Workers & Pages
   # Verify sebc-dev worker exists and shows "Active"
   ```

2. **Verify DNS configuration**:
   ```bash
   # Check DNS records
   dig sebc.dev +short
   # Expected: Cloudflare proxy IPs (104.x.x.x or 172.x.x.x)
   ```

3. **Check Cloudflare proxy status**:
   - Navigate to: DNS
   - Find sebc.dev A/AAAA record
   - Verify proxy status is "Proxied" (orange cloud icon)
   - If "DNS only" (grey cloud): Click to enable proxy

**Verify Fix**:
```bash
curl -I https://sebc.dev
# Expected: HTTP 200 OK
```

---

### Issue: "Can't take screenshots"

**Symptoms**:
- Screenshot tool not working
- Need to capture dashboard configuration for documentation

**Solutions**:

**macOS**:
```bash
# Full screen: Cmd + Shift + 3
# Selection: Cmd + Shift + 4
# Saved to: ~/Desktop/Screenshot [date].png
```

**Windows**:
```bash
# Snipping Tool: Win + Shift + S
# Full screen: PrtScn (Print Screen key)
# Saved to: Screenshots folder or clipboard
```

**Linux (Ubuntu/GNOME)**:
```bash
# Selection: Shift + PrtScn
# Full screen: PrtScn
# Saved to: ~/Pictures/Screenshots/
```

**Alternative: Browser extensions**:
- Install: Fireshot (Chrome/Firefox)
- Or: Awesome Screenshot (Chrome/Firefox)
- Or: Use browser DevTools: F12 > Cmd/Ctrl + Shift + P > "Screenshot"

**Verify Fix**:
- Successfully capture dashboard screenshot
- Screenshot saved to accessible location

---

## 📝 Setup Checklist

Complete this checklist before starting Phase 1 implementation:

### Account & Permissions

- [ ] Cloudflare account credentials verified (can login)
- [ ] Cloudflare Pro plan (or higher) active for sebc.dev
- [ ] Administrator or Super Administrator role confirmed
- [ ] 2FA enabled and working (if applicable)

### Access Verification

- [ ] Can access Cloudflare Dashboard: https://dash.cloudflare.com
- [ ] Can select sebc.dev zone
- [ ] Can navigate to Security > WAF
- [ ] Can see "Deploy managed ruleset" button (or WAF configuration options)

### Application Status

- [ ] Story 0.7 (CI/CD deployment) completed
- [ ] sebc.dev deployed to Cloudflare Workers
- [ ] Homepage loads successfully: `curl -I https://sebc.dev` returns 200 OK
- [ ] Cloudflare headers present in response (`server: cloudflare`)

### Tools Ready

- [ ] Web browser installed and working
- [ ] curl installed and working: `curl --version`
- [ ] git installed and working: `git --version`
- [ ] Screenshot tool working (test with a test screenshot)

### Documentation Preparation

- [ ] `docs/security/` directory exists (or ready to create)
- [ ] Git repository accessible for committing documentation
- [ ] Text editor/IDE ready for writing documentation (VS Code, etc.)

### Baseline Captured

- [ ] Homepage loads before WAF configuration (baseline test)
- [ ] WAF Overview checked (note current state)
- [ ] No conflicting WAF rules already deployed (or documented if exist)

---

## 🚀 Ready to Start!

**If all checkboxes above are checked, you're ready to begin Phase 1 implementation! 🎉**

Next steps:
1. Read IMPLEMENTATION_PLAN.md for atomic commit strategy
2. Follow COMMIT_CHECKLIST.md for each commit
3. Capture screenshots as you configure WAF
4. Document configuration in `docs/security/`

---

## 🔗 Important Links

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Cloudflare WAF Documentation**: https://developers.cloudflare.com/waf/
- **OWASP Core Rule Set Reference**: https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/
- **Cloudflare Rate Limiting**: https://developers.cloudflare.com/waf/rate-limiting-rules/
- **Cloudflare Support**: https://dash.cloudflare.com/?to=/:account/support

---

**Environment setup complete! Proceed to IMPLEMENTATION_PLAN.md.**
