# Cloudflare Dashboard Access Guide

**Story**: 0.9 - Cloudflare WAF Integration
**Phase**: 1 - WAF Core Configuration
**Commit**: 4/4 - Comprehensive Documentation & Final Polish
**Created**: 2025-11-15
**Last Updated**: 2025-11-15
**Status**: Phase 1 Commit 4 - Dashboard Access Guide

---

## Overview

This guide provides team members with step-by-step instructions to access the Cloudflare Dashboard and navigate to critical security configuration sections. The dashboard is the central control point for managing sebc.dev's security infrastructure, including the Web Application Firewall (WAF), rate limiting, DNS, and analytics.

### Who Needs Dashboard Access

- **DevOps Engineers**: Configure and manage WAF rules, rate limiting, DNS
- **Security Team**: Monitor security events, review logs, manage policies
- **Project Managers**: Monitor security status and incident activity
- **Team Leads**: Access resource usage and compliance reports

---

## Prerequisites

Before accessing the Cloudflare Dashboard, ensure you have:

1. **Cloudflare Account**:
   - Active account with email authentication
   - Multi-factor authentication (MFA) enabled for security

2. **Zone Access**:
   - Must be added to the **sebc.dev** zone by an administrator
   - Requires appropriate permissions (Administrator or Super Administrator)

3. **Required Permissions**:
   - **Full Setup** (Administrator): Configure WAF, DNS, rate limiting
   - **Security & Compliance** (recommended minimum): View and adjust security settings
   - **Read Only**: View logs and analytics without modification ability

If you don't have access to sebc.dev, contact your administrator to request it.

---

## Accessing the Cloudflare Dashboard

### Step 1: Navigate to Dashboard

1. Open your browser and go to: **https://dash.cloudflare.com**
2. You'll see the Cloudflare login page

### Step 2: Sign In

1. **Enter Email**: Use your Cloudflare account email
2. **Enter Password**: Your Cloudflare password
3. **Click "Login"**

If this is a new browser, you may be prompted for multi-factor authentication (MFA).

### Step 3: Multi-Factor Authentication (if prompted)

1. **Check Email or Authentication App**: Cloudflare may send a verification code or your authenticator app may display one
2. **Enter Code**: Paste the code from your authenticator or email
3. **Click "Verify"**

### Step 4: Select Zone

Once logged in, you'll see the **Accounts Home** with a list of zones.

1. **Find sebc.dev**: Look for "sebc.dev" in the zone list
2. **Click on sebc.dev**: This opens the dashboard for that zone

You should now see the sebc.dev dashboard with various sections in the left sidebar.

---

## Dashboard Navigation

### Left Sidebar Structure

The Cloudflare Dashboard is organized into these main sections:

```
Home
├── Overview (Performance, DNS status)
├── Analytics & Logs
│   ├── Analytics
│   └── Logpush
├── SSL/TLS
├── DNS
├── Caching
├── Rules
├── Security (← Most important for WAF)
│   ├── Overview
│   ├── WAF
│   │   ├── Overview
│   │   ├── Custom rules
│   │   ├── Rate limiting rules
│   ├── Firewall Events (or Analytics)
│   ├── Bots
│   └── DDoS
├── Speed
├── Workers & Pages
├── Network
└── Settings
```

### Common Security Sections

#### Accessing WAF Configuration

To view or modify WAF settings:

1. **Click "Security"** in the left sidebar
2. **Click "WAF"** from the submenu
3. You'll see tabs:
   - **Overview**: Current WAF status and active rulesets
   - **Custom rules**: Create or modify custom WAF rules
   - **Rate limiting rules**: Manage rate limiting configuration

#### Accessing Security Events/Analytics

To view security logs and events:

1. **Click "Security"** in the left sidebar
2. **Click "Analytics"** (may be labeled "Firewall Events" in some regions)
3. View real-time security events with filtering by:
   - Action (Block, Challenge, Log)
   - Date range
   - Rule name
   - IP address

#### Accessing Security Overview

For a high-level view of security status:

1. **Click "Security"** in the left sidebar
2. **Click "Overview"**
3. View:
   - Current protection status
   - Active rulesets
   - Recent security activity
   - Threat graphs

---

## Quick Links by Task

### Task: Check WAF Status

**Path**: Security > WAF > Overview
**Expected to see**: Free Managed Ruleset (active), Rate Limiting Rules list

### Task: View WAF Events

**Path**: Security > Analytics (or Firewall Events)
**Expected to see**: Recent blocked/logged requests with details

### Task: Modify Rate Limiting

**Path**: Security > WAF > Rate Limiting Rules
**Expected to see**: "Global Rate Limit - Protection" rule (Enabled)

### Task: Create Custom WAF Rule

**Path**: Security > WAF > Custom rules
**Expected to see**: List of active custom rules with toggle controls

### Task: Monitor Site Performance

**Path**: Analytics & Logs > Analytics
**Expected to see**: Traffic patterns, cache hit rates, bandwidth usage

### Task: Check DNS Records

**Path**: DNS
**Expected to see**: All DNS records for sebc.dev (CNAME, MX, TXT, etc.)

---

## Permissions Reference

### Understanding Permission Levels

**Super Administrator**:

- Full access to all settings
- Can manage team members and billing
- Can enable/disable zones
- Can create API tokens

**Administrator**:

- Configure all security features (WAF, rate limiting, DDoS)
- View analytics and logs
- Cannot manage team members or billing

**Security & Compliance**:

- View and modify security settings
- View analytics and logs
- Cannot modify DNS or other infrastructure settings

**Read Only**:

- View all settings and logs
- Cannot make any modifications
- Useful for analysts and compliance reviews

### Checking Your Current Permissions

1. **Click Account Icon** (bottom left of sidebar) or **Settings** (main menu)
2. **Select "Manage Account"**
3. **Click "Members"** tab
4. **Find your email** in the list
5. **See "Role"** column for your current permissions

### Requesting Additional Permissions

If you need higher permissions:

1. **Contact Zone Administrator**: Ask the administrator managing sebc.dev
2. **Provide**: Your email and requested permission level
3. **Wait for Approval**: Administrator will add you to the appropriate role

---

## Common Dashboard Operations

### Exporting WAF Configuration

To save a backup of current WAF rules:

1. **Navigate to**: Security > WAF > Custom rules (or Rate Limiting Rules)
2. **Take Screenshot**: Use browser screenshot tool (Shift+Ctrl+S on Linux/Windows, Cmd+Shift+4 on Mac)
3. **Save**: Save with filename like `waf-config-2025-11-15.png`

For detailed export, you may need:

- Cloudflare API access (requires Pro plan+)
- Manual documentation of each rule

### Viewing Historical Logs

To review security events over time:

1. **Navigate to**: Analytics & Logs > Logpush
2. **Set Date Range**: Select dates to export
3. **Download Logs**: CSV format available for analysis
4. **Or**: Security > Analytics with date filter

### Understanding Event Details

When viewing security events, each entry shows:

- **IP Address**: The client IP that triggered the event
- **Timestamp**: Exact time of the request
- **URL/Path**: Which URL was affected
- **Rule/Action**: Which WAF rule triggered (Block, Challenge, Log)
- **Country**: Geographic location of the IP (if available)

---

## Troubleshooting Dashboard Access

### Cannot Log In

**Problem**: Email/password incorrect or forgotten

**Solution**:

1. Click "Forgot password?" on login page
2. Cloudflare sends password reset email
3. Follow reset link to create new password
4. Try logging in again

### MFA Code Not Received

**Problem**: Email with MFA code is missing

**Solution**:

1. Check spam/junk folder
2. Wait up to 1 minute for email delivery
3. If still missing, use backup authentication method
4. Contact Cloudflare support if stuck

### Zone Not Visible in Dashboard

**Problem**: Cannot see sebc.dev in zone list

**Solution**:

1. Verify you're logged in with correct account
2. Ask administrator to verify you're added to sebc.dev
3. Try logging out and in again
4. Check account email is correct

### Permission Denied to Modify Settings

**Problem**: Cannot edit WAF or other settings

**Solution**:

1. Check your role (see "Checking Your Current Permissions" section)
2. If role is "Read Only", request higher permissions
3. Ask zone administrator to grant access
4. Verify you're not using account with restricted access

### Dashboard Slow or Unresponsive

**Problem**: Dashboard loads slowly or doesn't respond

**Solution**:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Try incognito/private browsing mode
3. Try different browser (Chrome, Firefox, Safari)
4. Check your internet connection
5. Contact Cloudflare support if persists

---

## Security Best Practices

### Dashboard Access Security

- **Use Strong Passwords**: At least 12 characters with mixed case, numbers, symbols
- **Enable MFA**: Always use authenticator app (more secure than email)
- **Don't Share Credentials**: Never share login info with colleagues
- **Use Different Password**: Don't reuse passwords from other services
- **Sign Out**: Always sign out on shared computers

### Access Control

- **Need-Based Access**: Only request permissions you actually need
- **Review Members**: Regularly check who has access to the zone
- **Remove Former Staff**: Immediately remove access when people leave
- **Report Suspicious Access**: If you see unauthorized changes, alert administrator

### Audit Trail

Cloudflare logs all dashboard actions:

- Who made changes
- What was changed
- When changes occurred

This provides accountability and helps detect unauthorized modifications.

---

## Dashboard Features Overview

### Analytics Dashboard

Provides real-time metrics for:

- **Traffic**: Requests, bandwidth, unique visitors
- **Performance**: Response times, cache hit ratio
- **Security**: Blocked requests, threats detected
- **Errors**: 4xx and 5xx error rates

### WAF Analytics

Specific to WAF operations:

- **Events by Rule**: Which rules are triggering most
- **Top Blocked IPs**: Which IPs are being blocked most
- **Events by Country**: Geographic distribution of attacks
- **Event Timeline**: Trends over time

### DDoS Analytics

For distributed denial of service attacks:

- **Attack Timeline**: When attacks occurred
- **Attack Size**: Requests per second during attacks
- **Mitigation Status**: Whether attacks were blocked

---

## Mobile Access

The Cloudflare Dashboard has mobile support, but is optimized for desktop. For mobile access:

1. Use the Cloudflare mobile app (iOS/Android) for quick status checks
2. For configuration, use desktop browser for full features
3. Mobile app is useful for on-call monitoring

---

## Related Documentation

- **WAF Configuration**: `docs/security/waf-configuration.md` - Detailed WAF setup
- **Rate Limiting Rules**: `docs/security/rate-limiting-rules.md` - Rate limit configuration
- **Security README**: `docs/security/README.md` - Security infrastructure overview
- **Cloudflare Official Docs**: https://developers.cloudflare.com/
- **Cloudflare Support**: https://support.cloudflare.com/

---

## FAQ

**Q: Do I need a separate Cloudflare account?**
A: No, you use your existing account. The administrator adds you to the sebc.dev zone.

**Q: Can I modify WAF rules?**
A: Yes, if you have Administrator or Security & Compliance role. Read Only accounts cannot modify.

**Q: How long does a rule change take to apply?**
A: Usually seconds to a few minutes. Some rule changes may be cached.

**Q: What if I accidentally disable the WAF?**
A: Just re-enable it by clicking the toggle. No permanent damage. Changes are reversible.

**Q: Is there a mobile app?**
A: Yes, Cloudflare has iOS and Android apps for status monitoring and simple management.

**Q: Who can I contact for help?**
A: First check Cloudflare documentation, then contact your zone administrator, then Cloudflare support.

---

## Contact & Support

**For Questions About**:

- Cloudflare Dashboard features → Cloudflare Support (https://support.cloudflare.com/)
- sebc.dev access → Project Administrator
- WAF configuration → See `waf-configuration.md`
- Rate limiting → See `rate-limiting-rules.md`

---

## Document Metadata

- **Written by**: Phase 1 Implementation (Story 0.9)
- **Classification**: Operations & Access Guide
- **Audience**: DevOps, Security Team, Project Managers
- **Last Updated**: 2025-11-15
- **Version**: 1.0

---

Last Updated: 2025-11-15
