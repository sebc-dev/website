# Phase 1 - Environment Setup

This guide covers all environment setup needed for Phase 1 - Cloudflare Access Configuration.

---

## 📋 Prerequisites

### Previous Phases/Stories

- [x] **Story 0.1** - Next.js 15 project initialized
- [x] **Story 0.5** - wrangler.toml configured with basic bindings
- [x] **Story 0.6** - Compatibility flags configured
- [x] **Site deployed** - Application accessible on Cloudflare Workers

**Verify**: Your Next.js application should be deployed and accessible at your Cloudflare Workers domain before starting this phase.

### Cloudflare Account Requirements

- [ ] **Cloudflare account** with active subscription
- [ ] **Zero Trust access** enabled on your account
  - Available on: Free, Pro, Business, and Enterprise plans
  - May require enabling "Zero Trust" in dashboard
- [ ] **Admin permissions** on the Cloudflare account
  - Required to create Access applications
  - Required to configure Access policies
- [ ] **Deployed Workers site**
  - Application must be live on Cloudflare Workers
  - Must have a valid domain/subdomain configured

### Tools Required

- [ ] **Web browser** (Chrome, Firefox, Safari, or Edge)
- [ ] **Text editor** (VS Code, Vim, or similar)
- [ ] **Git** (for committing configuration documentation)
- [ ] **pnpm** (for running linter/formatter commands)

### Knowledge Requirements

- Basic understanding of authentication concepts (OAuth, JWT)
- Familiarity with Cloudflare dashboard navigation
- Understanding of HTTP headers and cookies
- Basic markdown editing skills (for documentation)

---

## 🌐 Cloudflare Account Setup

### Step 1: Verify Cloudflare Account Access

1. **Login to Cloudflare**:
   ```
   https://dash.cloudflare.com/
   ```

2. **Select your account**:
   - Choose the account where your Workers site is deployed
   - Verify you have admin permissions

3. **Verify Workers deployment**:
   - Go to "Workers & Pages"
   - Locate your sebc.dev Workers application
   - Verify status is "Active"
   - Note the domain/subdomain where it's accessible

**Expected Result**: You can access your Workers application at `https://<your-domain>/`

---

### Step 2: Enable Cloudflare Zero Trust

1. **Navigate to Zero Trust**:
   - From Cloudflare dashboard home
   - Look for "Zero Trust" in the left sidebar
   - OR go directly to: `https://one.dash.cloudflare.com/`

2. **Enable Zero Trust** (if first time):
   - Click "Get started with Zero Trust"
   - Choose your organization name (becomes your Team Domain)
   - Complete setup wizard
   - Accept terms and conditions

3. **Verify Zero Trust Access**:
   - You should see the Zero Trust dashboard
   - Left sidebar should show: Overview, Logs, Access, Gateway, etc.
   - Your Team Domain should be displayed (format: `<name>.cloudflareaccess.com`)

**Expected Result**: Zero Trust dashboard accessible at `https://one.dash.cloudflare.com/`

---

### Step 3: Note Your Team Domain

Your **Team Domain** is critical for Phase 2 (JWT validation).

**How to find it**:

1. In Zero Trust dashboard: `https://one.dash.cloudflare.com/`
2. Navigate to "Settings" > "General"
3. Locate "Team Domain" field
4. Format: `<your-team-name>.cloudflareaccess.com`

**Example**: If your organization is "Acme Corp", your Team Domain might be:
```
acme-corp.cloudflareaccess.com
```

**Save this value** - you'll need it in Commit 4.

---

## 🔧 Environment Variables (Preparation)

While Phase 1 is primarily dashboard configuration, we'll prepare the environment variables template for Phase 2.

### Current .env.example

Check your existing `.env.example`:

```bash
cat .env.example
```

### Variables to Add (in Commit 4)

These will be added to `.env.example` during Phase 1 Commit 4:

```env
# ============================================
# Cloudflare Access Configuration
# ============================================
# Retrieved from: Zero Trust > Settings > General
# Purpose: JWT validation in middleware (Phase 2)
CLOUDFLARE_ACCESS_TEAM_DOMAIN=<team-name>.cloudflareaccess.com

# Retrieved from: Zero Trust > Access > Applications > sebc.dev Admin Panel > Overview
# Purpose: JWT audience claim validation (Phase 2)
CLOUDFLARE_ACCESS_AUD=<application-aud-uuid>
```

**Note**: These are placeholders. Actual values will be retrieved during Phase 1 Commit 4.

---

## 📁 Directory Structure (Preparation)

Phase 1 will create new documentation files:

```
docs/
└── deployment/
    ├── cloudflare-access-setup.md       # Created in Commit 1, updated in 2-4
    └── screenshots/                      # Optional, for configuration screenshots
        ├── cloudflare-access-app.png
        ├── cloudflare-access-policies.png
        └── cloudflare-access-test.png
```

**Create directories** (optional, can be done in commits):

```bash
mkdir -p docs/deployment
mkdir -p docs/deployment/screenshots  # Optional
```

---

## 🔍 Verification Tests

### Test 1: Cloudflare Dashboard Access

```bash
# Manual test:
# 1. Open https://dash.cloudflare.com/
# 2. Login with your credentials
# 3. Verify you can see your Workers application
```

**Expected Result**: Dashboard accessible, Workers application visible

---

### Test 2: Zero Trust Dashboard Access

```bash
# Manual test:
# 1. Open https://one.dash.cloudflare.com/
# 2. Verify Zero Trust dashboard loads
# 3. Check sidebar shows Access, Gateway, etc.
# 4. Go to Settings > General
# 5. Verify Team Domain is displayed
```

**Expected Result**: Zero Trust dashboard accessible, Team Domain visible

---

### Test 3: Workers Application Accessibility

```bash
# Test your Workers application is live
curl -I https://<your-domain>/

# Expected: HTTP 200 OK or appropriate response
```

**Expected Result**: Workers application responding to requests

---

## 🔗 External Services Access

### Cloudflare Services Required

All services are accessed via Cloudflare dashboard - no external APIs or services needed for Phase 1.

| Service              | URL                              | Purpose                          | Access Required |
| -------------------- | -------------------------------- | -------------------------------- | --------------- |
| Cloudflare Dashboard | https://dash.cloudflare.com/     | Main dashboard, Workers access   | Admin           |
| Zero Trust Dashboard | https://one.dash.cloudflare.com/ | Access configuration             | Admin           |
| Workers Application  | https://<your-domain>/           | Target application to protect    | Public (before config) |

---

## 🚨 Troubleshooting

### Issue: Can't access Zero Trust dashboard

**Symptoms**:
- "Zero Trust" not visible in Cloudflare dashboard sidebar
- Redirect to upgrade page when accessing `https://one.dash.cloudflare.com/`

**Solutions**:

1. **Check your Cloudflare plan**:
   - Zero Trust is available on Free plan with limitations
   - Verify your account type in Cloudflare dashboard

2. **Enable Zero Trust**:
   - Some accounts require explicit Zero Trust activation
   - Look for "Enable Zero Trust" button in dashboard
   - Follow the setup wizard

3. **Contact Cloudflare support** (if still blocked):
   - Check if your account has restrictions
   - Request Zero Trust access

**Verify Fix**:
```bash
# Manual test:
# Open https://one.dash.cloudflare.com/
# Should show Zero Trust dashboard, not error page
```

---

### Issue: Team Domain not visible

**Symptoms**:
- Can't find Team Domain in Settings > General
- Team Domain field is empty

**Solutions**:

1. **Complete Zero Trust setup**:
   - Go through Zero Trust setup wizard if not completed
   - Choose organization name during setup
   - This creates your Team Domain

2. **Check correct settings location**:
   - Zero Trust dashboard: https://one.dash.cloudflare.com/
   - Navigate: Settings (left sidebar) > General
   - Scroll to "Team information" section
   - Team Domain should be listed there

3. **Verify account permissions**:
   - You need admin access to see Team Domain
   - Check with account owner if not visible

**Verify Fix**:
```bash
# Manual test:
# Go to Zero Trust > Settings > General
# Should see Team Domain: <name>.cloudflareaccess.com
```

---

### Issue: Workers application not accessible

**Symptoms**:
- Can't access `https://<your-domain>/`
- Error: "Application not found" or "502 Bad Gateway"

**Solutions**:

1. **Verify Workers deployment**:
   - Go to Cloudflare dashboard > Workers & Pages
   - Check your sebc.dev application status
   - Status should be "Active", not "Deploying" or "Failed"

2. **Check domain configuration**:
   - Verify custom domain is correctly configured
   - Test with default Workers domain: `<worker-name>.<account>.workers.dev`

3. **Redeploy if needed**:
   ```bash
   pnpm deploy
   # OR
   wrangler deploy
   ```

**Verify Fix**:
```bash
# Test application responds
curl -I https://<your-domain>/
# Should return HTTP 200 or appropriate response
```

---

### Issue: Don't have admin permissions

**Symptoms**:
- Can't create Access applications
- "Permission denied" when trying to configure policies
- Can't access certain dashboard sections

**Solutions**:

1. **Request admin permissions**:
   - Contact Cloudflare account owner
   - Request "Administrator" or "Access Admin" role

2. **Use different account**:
   - If you're the owner, create new Cloudflare account for testing
   - Deploy Workers application to this account instead

3. **Work with account admin**:
   - Have admin follow the configuration guide
   - Admin can configure, you can implement middleware in Phase 2

---

## 📝 Setup Checklist

Complete this checklist before starting Phase 1 implementation:

### Cloudflare Account

- [ ] Cloudflare account accessible
- [ ] Zero Trust enabled and accessible
- [ ] Admin permissions verified
- [ ] Team Domain visible in dashboard

### Workers Application

- [ ] Workers application deployed
- [ ] Application accessible at public URL
- [ ] Application status "Active" in dashboard
- [ ] Domain/subdomain configured correctly

### Development Environment

- [ ] Git installed and configured
- [ ] pnpm installed (for linting/formatting)
- [ ] Text editor ready for documentation
- [ ] Browser ready for dashboard configuration

### Documentation

- [ ] `docs/deployment/` directory exists (or will be created in Commit 1)
- [ ] `.env.example` file present and accessible
- [ ] Ready to commit documentation changes

### Knowledge

- [ ] Understand purpose of Cloudflare Access (Zero Trust authentication)
- [ ] Familiar with Cloudflare dashboard navigation
- [ ] Know how to take screenshots (optional but helpful)
- [ ] Understand commit message format (see IMPLEMENTATION_PLAN.md)

---

## 🔐 Security Considerations

### Credentials Management

**Dashboard Access**:
- Use strong password for Cloudflare account
- Enable 2FA/MFA on Cloudflare account (highly recommended)
- Don't share account credentials

**Team Domain**:
- Not a secret, but document it securely
- Will be used in JWT validation (Phase 2)
- Format: `<team-name>.cloudflareaccess.com`

**Application AUD**:
- Not a secret, but must be exact match
- UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Will be used in JWT audience claim validation (Phase 2)

### Configuration Security

**Access Policies**:
- Start with restrictive policies (specific emails/domains)
- Test with known email addresses
- Avoid "Everyone" policy in production
- Review and audit policies regularly

**Authentication Methods**:
- Choose based on security requirements:
  - Email OTP: Simple, no external dependency
  - SSO (Google/GitHub): Better UX, requires external account
  - Multiple methods: Flexibility, but more attack surface
- Enable MFA on SSO providers if using SSO

---

## 📚 Reference Documentation

### Cloudflare Official Docs

- [Cloudflare Access Overview](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [Configure Access Applications](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/)
- [Access Policies](https://developers.cloudflare.com/cloudflare-one/policies/access/policy-management/)
- [Zero Trust Setup Guide](https://developers.cloudflare.com/cloudflare-one/setup/)

### Internal Documentation

- [Story 0.8 Specification](../../story_0.8.md)
- [Phases Plan](../PHASES_PLAN.md)
- [Phase 1 Index](./INDEX.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)

---

**Environment ready! Proceed to IMPLEMENTATION_PLAN.md 🚀**
