# Cloudflare WAF Configuration

**Story**: 0.9 - Cloudflare WAF Integration
**Phase**: 1 - WAF Core Configuration
**Plan**: Free Plan
**Created**: 2025-11-15
**Last Updated**: 2025-11-15
**Status**: Phase 1 Commit 1 - Free Managed Ruleset Verified

---

## Overview

The Cloudflare Web Application Firewall (WAF) is a distributed, global security service that protects sebc.dev from malicious traffic at the edge, before it reaches our application servers. WAF operates at the Cloudflare network level, analyzing incoming requests against configured security rules to identify and block (or log) suspicious patterns.

This Phase 1 documentation covers the **Free Plan WAF features**, which are available to all Cloudflare customers at no additional cost.

### Why WAF Matters

Web Application Firewalls are critical for protecting against common web vulnerabilities and attacks:

- **SQL Injection (SQLi)**: Malicious SQL code injected into input fields
- **Cross-Site Scripting (XSS)**: Injected client-side scripts to compromise user sessions
- **Remote Code Execution (RCE)**: Exploits allowing arbitrary command execution
- **Command Injection**: Malicious commands executed on the server
- **Path Traversal**: Unauthorized file access by manipulating paths
- **Denial of Service (DoS)**: Volumetric attacks overwhelming the service
- **Bot Attacks**: Automated scanning and enumeration attacks

### WAF Protection Layers (Phase-Based)

This implementation follows a phased approach to build security progressively:

1. **Phase 1 - Free Managed Ruleset** (Completed)
   - Auto-deployed protection against high-impact vulnerabilities
   - Automatic updates with zero configuration
   - Available on Free plan
   - Verified and documented in Commit 1

2. **Phase 2 - Rate Limiting** (Current)
   - Protects against volumetric attacks and DoS
   - Global rate limiting (100 requests per 1 minute per IP)
   - Available on Free plan
   - Configured and documented in Commit 2

3. **Phase 3 - Custom WAF Rules** (Planned)
   - Custom rules for XSS, SQL injection, path traversal
   - Free plan allows limited custom rules
   - Enhances Free Managed Ruleset protection

**Note**: OWASP Core Ruleset and Cloudflare Managed Ruleset require Pro plan ($20/month+). This phase uses Free plan features.

---

## Free Managed Ruleset

### What is the Free Managed Ruleset?

The Free Managed Ruleset is Cloudflare's foundational WAF protection automatically deployed on all zones (including Free plan). It provides:

- **Automatic Deployment**: Enabled by default on all Cloudflare zones
- **Zero Configuration**: Works without any setup or tuning
- **Continuous Updates**: Cloudflare automatically updates rules against emerging threats
- **High-Impact Coverage**: Protects against critical vulnerabilities and known exploits
- **Zero-Day Protection**: Includes signatures for known CVEs and zero-day exploits

### Key Characteristics

| Aspect | Details |
| --- | --- |
| **Availability** | Free plan (all zones) |
| **Configuration Required** | None - auto-deployed |
| **Update Frequency** | Continuous (Cloudflare managed) |
| **Coverage** | High-impact vulnerabilities, critical CVEs |
| **False Positive Rate** | Very low (optimized for all customers) |
| **Cost** | Included with Free plan |

### What the Free Managed Ruleset Protects Against

1. **Zero-Day Vulnerabilities**: Automatic signatures for new CVEs
2. **Critical Exploits**: Active exploitation attempts in the wild
3. **Known CVEs**: Patched vulnerabilities with active exploit attempts
4. **Malware Patterns**: Known malicious request patterns
5. **Scanner Detection**: Common vulnerability scanners
6. **Malformed Requests**: Invalid or suspicious HTTP requests

### What the Free Managed Ruleset Does NOT Cover

The Free plan does not include:

- **OWASP Core Ruleset** (Pro plan, $20/month)
  - Comprehensive coverage of OWASP Top 10
  - Configurable sensitivity levels
  - More detailed rule customization

- **Cloudflare Managed Ruleset** (Pro plan, $20/month)
  - Advanced threat intelligence rules
  - Geoblocking and advanced IP reputation
  - Configurable managed rules

For these advanced features, upgrade to Pro plan ($20/month).

### Free Managed Ruleset vs. OWASP Core Ruleset

| Feature | Free Managed | OWASP (Pro) | Cloudflare Managed (Pro) |
| --- | --- | --- | --- |
| **Availability** | Free | Pro ($20/mo) | Pro ($20/mo) |
| **Auto-deployed** | Yes | Yes | Yes |
| **Configurable** | No | Yes (3 sensitivity levels) | Yes |
| **Coverage** | Critical CVEs, zero-days | OWASP Top 10 | Threat intelligence |
| **Rule Count** | ~100s | ~1000s | ~1000s |
| **Typical Use** | Baseline protection | Enhanced security | Advanced protection |
| **False Positive Rate** | Very low | Low-Moderate | Low |

**Recommendation**:
- Free plan: Use Free Managed Ruleset + Rate Limiting + Custom Rules
- Pro plan: Add OWASP Core Ruleset for comprehensive OWASP Top 10 coverage
- Business plan: Add Cloudflare Managed Ruleset for threat intelligence

---

## Current Configuration: Free Plan

### Verified Active Components

| Component | Status | Mode | Purpose |
| --- | --- | --- | --- |
| **Free Managed Ruleset** | ✅ Active | Monitor | Baseline protection (auto-deployed) |
| **Rate Limiting** | ✅ Configured | Block | Volumetric attack protection (100 req/min per IP) |
| **Custom WAF Rules** | ⏳ Phase 3 | - | Enhanced specific attack patterns |

### Verification Details

**Verification Date**: 2025-11-15
**Dashboard Zone**: sebc.dev
**Verification Method**: Cloudflare Dashboard > Security > WAF

The Free Managed Ruleset is automatically deployed and active. No configuration is required.

---

## Quick Reference

### Current WAF Status at a Glance

| Component | Status | Action | Details |
| --- | --- | --- | --- |
| **Free Managed Ruleset** | ✅ Active | Monitor | Auto-deployed baseline protection |
| **Rate Limiting** | ✅ Enabled | Block | 100 req/min per IP, 1 min timeout |
| **Custom WAF Rules** | ⏳ Planned | - | Deferred to Phase 1 Commit 3 (post-launch) |

### Quick Action Links

- **View WAF Status**: https://dash.cloudflare.com (Security > WAF > Overview)
- **View Security Events**: https://dash.cloudflare.com (Security > Analytics)
- **Check Rate Limits**: https://dash.cloudflare.com (Security > WAF > Rate Limiting Rules)
- **Full Dashboard Guide**: [`docs/deployment/cloudflare-dashboard-access.md`](../deployment/cloudflare-dashboard-access.md)

### Phase 1 Status Summary

**Completed**:
- ✅ Commit 1: Free Managed Ruleset verified and documented
- ✅ Commit 2: Rate Limiting configured (100 req/min per IP)
- ⏭️ Commit 3: Custom WAF Rules (skipped - deferred to post-launch)
- 🚧 Commit 4: Documentation & Final Polish (current)

**Current Baseline Protection**: Free Managed Ruleset + Rate Limiting (suitable for "en construction" site)

**Next Steps**: Phase 2 & 3 enhancement planned post-launch

---

## Dashboard Navigation

### Accessing WAF Overview

1. **Log into Cloudflare Dashboard**:
   - URL: https://dash.cloudflare.com
   - Sign in with your Cloudflare account

2. **Select Zone**:
   - Ensure you're in the **sebc.dev** zone
   - Zone selector appears in top-left of dashboard

3. **Navigate to WAF Status**:
   - Click **Security** in the left sidebar
   - Select **WAF** from submenu
   - Click **Overview** tab to see current WAF status

4. **Verify Free Managed Ruleset**:
   - Expected to see: "Free Managed Ruleset" listed as active
   - Status should show as enabled
   - No manual configuration needed (auto-deployed)

### Viewing Security Events

To see which requests are being monitored by WAF:

1. **Navigate to Security > Events** (or Security > Analytics)
   - View real-time security events
   - Filter by: Date range, event type, action

2. **Analyze Logged Requests**:
   - Free Managed Ruleset requests appear in the activity log
   - Review patterns of detected threats
   - Document any unexpected matches for Phase 2 analysis

### Rate Limiting

Rate limiting protects sebc.dev against volumetric attacks and resource exhaustion. Currently configured:

- **Status**: ✅ Configured (Phase 1 Commit 2)
- **Type**: Global rate limiting per IP address
- **Rate**: 100 requests per 1 minute
- **Action**: Block
- **Purpose**: Protect against DoS, brute force, and bot attacks

For detailed configuration, adjustment procedures, and monitoring instructions, see:

**Full Documentation**: [`rate-limiting-rules.md`](./rate-limiting-rules.md)

Key points:
- Conservative limit suitable for "en construction" site
- Will be tuned post-launch based on real traffic patterns
- See `rate-limiting-rules.md` for how to adjust limits
- See `rate-limiting-rules.md` for whitelisting procedures

### Configuration History

This section documents WAF configuration changes as the project evolves:

| Date       | Commit   | Change                                                    |
| ---------- | -------- | --------------------------------------------------------- |
| 2025-11-15 | Commit 1 | Verify & Document Free Managed Ruleset (auto-deployed)    |
| 2025-11-15 | Commit 2 | Configure Basic Rate Limiting (100 req/min per IP)        |
| SKIPPED    | Commit 3 | Custom WAF Rules (deferred to Phase 2 post-launch)        |
| 2025-11-15 | Commit 4 | Comprehensive Documentation, Rollback, Troubleshooting    |

**Phase 1 Minimale Status**: ✅ BASELINE COMPLETE
- Free Managed Ruleset: ✅ Active (auto-deployed)
- Rate Limiting: ✅ Configured (100 req/min per IP)
- Custom Rules: ⏳ Deferred to post-launch (Phase 2)

**Rationale**: Phase 1 provides baseline protection suitable for "en construction" site. Custom WAF rules (Commit 3) deferred to Phase 2 post-launch to prioritize core functionality before launch.

---

## Key Points for Team

### What Free Managed Ruleset Protects

- ✅ Against critical CVEs and zero-day exploits
- ✅ Against known malicious request patterns
- ✅ Against scanner detection and bot attacks
- ✅ At the edge (before reaching our servers)
- ✅ With automatic updates (no configuration needed)

### What Free Managed Ruleset Does NOT Protect

- ⚠️ Limited OWASP Top 10 coverage (Pro plan has full OWASP)
- ❌ Advanced threat intelligence rules (requires Pro plan)
- ❌ Configurable sensitivity levels (Free plan is fixed)
- ❌ Custom rule creation (limited on Free plan)
- ❌ Authentication/Authorization logic (application responsibility)
- ❌ Business logic flaws (requires custom rules)

### Important Notes

1. **Auto-Deployed**: Free Managed Ruleset is automatically enabled on all Cloudflare zones at no cost
2. **Zero Configuration**: No setup or tuning required - works out of the box
3. **No Code Changes**: WAF is configured in Cloudflare Dashboard, not in application code
4. **Continuous Protection**: Rules updated automatically by Cloudflare
5. **Monitoring**: Team should review security events for attack patterns
6. **Upgrade Path**: Pro plan ($20/month) available for OWASP Core Ruleset and more configuration options

### Phase Progression

- **Phase 1 (Current)**: Verify Free Managed Ruleset + Document
- **Phase 2 (Next)**: Add Rate Limiting (100 req/min per IP)
- **Phase 3 (Future)**: Add Custom WAF Rules (XSS, SQLi, path traversal)
- **Future Upgrade**: Consider Pro plan for OWASP Core Ruleset

---

## Limitations of Free Plan

The Free plan WAF has these limitations compared to Pro plan:

| Feature | Free Plan | Pro Plan |
| --- | --- | --- |
| **Free Managed Ruleset** | ✅ Included | ✅ Included |
| **OWASP Core Ruleset** | ❌ Not available | ✅ Included ($20/mo) |
| **Custom Rules** | ⚠️ Limited (typically 5) | ✅ Up to 100 rules |
| **Rule Configuration** | ❌ No tuning | ✅ Configurable |
| **Sensitivity Levels** | ❌ Fixed | ✅ Low/Medium/High |
| **Rate Limiting** | ✅ Basic | ✅ Advanced |
| **API Access** | ❌ Limited | ✅ Full |

**Recommendation**: Start with Free plan features. Upgrade to Pro plan if you need OWASP Core Ruleset or advanced rule customization.

---

## Upgrade Considerations

### When to Consider Upgrading to Pro Plan

Consider upgrading if you need:

1. **OWASP Core Ruleset**: Comprehensive protection against OWASP Top 10 vulnerabilities
2. **Configurable Sensitivity**: Adjust detection sensitivity for your application
3. **More Custom Rules**: Create more than 5 custom rules for specific attack patterns
4. **Advanced Features**: Geoblocking, IP reputation, managed rules configuration
5. **Better Analytics**: More detailed security event analysis and reporting

### Cost/Benefit Analysis

- **Pro Plan Cost**: $20/month (recurring)
- **Benefits**: OWASP Core Ruleset + advanced configuration + more custom rules
- **ROI**: Recommended for production applications handling sensitive data
- **Risk Mitigation**: Reduces false positives and improves accuracy

### Free Plan is Sufficient For

- Small to medium applications with standard web traffic
- Non-sensitive data processing
- Baseline security requirements
- Organizations with limited security budgets

---

## Next Steps (After Phase 1 Commit 1)

### Phase 1 Progression

1. **Phase 1 Commit 2**: Configure basic rate limiting (100 req/min per IP)
2. **Phase 1 Commit 3**: Create custom WAF rules (XSS, SQLi, path traversal)
3. **Phase 1 Commit 4**: Complete documentation and screenshots

### Monitoring

1. **Review Security Events**: Check Security > Events in dashboard
2. **Document Patterns**: Note any suspicious request patterns
3. **Baseline Establishment**: Monitor for 24-48 hours to understand normal traffic

### Future Consideration

1. **Phase 2 (Planned)**: Analyze logs and tune custom rules
2. **Upgrade Path**: Evaluate Pro plan if additional features needed
3. **Advanced Monitoring**: Implement security analytics dashboard

---

## Rollback Procedures

### Emergency WAF Disable

If WAF is causing critical issues and needs immediate rollback:

#### Option 1: Disable Rate Limiting Only (Recommended First Step)

If rate limiting is blocking legitimate traffic:

1. **Navigate to**: https://dash.cloudflare.com → Security > WAF > Rate Limiting Rules
2. **Find Rule**: "Global Rate Limit - Protection"
3. **Disable**: Click the toggle or action menu > Disable
4. **Confirm**: Status should change to "Disabled"
5. **Recovery Time**: Immediate (takes seconds)

**Why first**: Rate limiting is the easiest to disable/re-enable and impacts fewer users.

#### Option 2: Disable All Custom WAF Rules (If Deployed)

If Phase 1 Commit 3 custom rules are blocking legitimate traffic:

1. **Navigate to**: https://dash.cloudflare.com → Security > WAF > Custom rules
2. **Disable Rules**: For each rule:
   - Click the toggle to disable
   - Or click action menu > Disable
3. **Confirm**: All custom rules should show as "Disabled"
4. **Recovery Time**: Immediate (takes seconds)

**Note**: Each rule has an individual toggle - disable only the problematic rule if possible.

#### Option 3: Disable Entire WAF (Nuclear Option - Last Resort)

If entire WAF must be disabled (very rare):

1. **Navigate to**: https://dash.cloudflare.com → Security > WAF > Overview
2. **Find Master Control**: Look for global WAF toggle (if available)
3. **Disable**: Turn off entire WAF module
4. **OR Disable Each Component**:
   - Disable Rate Limiting Rules (Option 1)
   - Disable Custom Rules (Option 2)
   - Free Managed Ruleset: **Cannot be disabled** without support

**Important**: Free Managed Ruleset is auto-deployed and always active. It cannot be disabled via dashboard. To fully disable, contact Cloudflare support.

**Recovery Time**: Immediate to a few seconds depending on caching.

### Rollback Decision Tree

```
Is WAF blocking legitimate traffic?
├─ Yes, only rate limiting
│  └─ Disable rate limiting (Option 1)
├─ Yes, only custom rules
│  └─ Disable problematic custom rule (Option 2)
├─ Yes, entire WAF
│  └─ Disable all rate limiting + custom rules (Options 1+2)
│     └─ If still blocked, contact Cloudflare support
└─ No, other issue
   └─ Check application or contact support
```

### Recovery After Rollback

After disabling WAF components:

1. **Monitor**: Check that legitimate traffic flows normally
2. **Investigate**: Review Security Events logs to understand what triggered disable
3. **Document**: Note the issue and timestamp in incident log
4. **Fix**: Address root cause (usually false positive in rules)
5. **Test**: Create test plan for re-enabling
6. **Re-enable**: Once fixed, carefully re-enable and monitor closely

### Phase 1 Minimale - Limited Rollback Scenario

Since Phase 1 uses **only Free Managed Ruleset + Rate Limiting**:

- **Free Managed Ruleset**: Cannot be rolled back (auto-deployed baseline)
- **Rate Limiting**: Can be disabled (Option 1) for immediate relief
- **Custom Rules**: Not yet deployed (Commit 3 deferred)

**For Phase 1**: Primary rollback is disabling rate limiting if it causes issues. Free Managed Ruleset provides baseline protection that cannot be disabled.

---

## Troubleshooting

### Troubleshooting Decision Tree

```
Problem: Website Issue or Security Event?
├─ Users report "429 Too Many Requests"
│  └─ Rate limiting is blocking legitimate traffic (see "Rate Limit False Positives")
├─ Users report "403 Forbidden" or Cloudflare block page
│  └─ Custom rule or Free Managed Ruleset blocking (see "Requests Being Blocked")
├─ Website completely down / not loading
│  └─ Application issue, not WAF (see "Homepage Not Loading")
├─ Unusual spike in security events
│  └─ Attack detected or bot traffic (see "High Volume of Security Events")
└─ Don't know what's wrong
   └─ Check all logs and metrics (see "General Troubleshooting Process")
```

### Rate Limit False Positives

**Symptom**: Users report "HTTP 429 Too Many Requests" error

**Diagnosis**:
1. **View Rate Limit Events**:
   - Navigate to: Dashboard > Security > Analytics
   - Filter for: Action = "Block" (rate limit)
   - Check: Which IPs/URLs are being blocked?

2. **Identify Legitimate Sources**:
   - Check timestamps of blocks
   - Ask users: "What were you doing when you got 429?"
   - Look for patterns (office IP, specific user, specific feature)

**Solutions**:
- **Option 1**: Increase rate limit (e.g., 100 → 200 req/min)
  - Edit rule: Security > WAF > Rate Limiting Rules
  - Click "Global Rate Limit - Protection" to edit
  - Change rate value and save

- **Option 2**: Whitelist legitimate IP (see `rate-limiting-rules.md`)
  - Create custom rule to skip rate limiting for specific IP
  - Only if IP is trusted and you control it

- **Option 3**: Disable rate limiting temporarily
  - If urgent: Disable rate limiting rule while investigating
  - See "Rollback Procedures" section above
  - Plan fix and re-enable

**Prevention**:
- Monitor rate limit events daily during first week
- Document legitimate traffic patterns
- Adjust limits before launch based on testing

### Requests Being Blocked (403 Forbidden)

**Symptom**: Legitimate requests return "403 Forbidden" or Cloudflare block page

**Diagnosis**:
1. **Check which requests are blocked**:
   - Navigate to: Dashboard > Security > Analytics
   - Filter by: Action = "Block"
   - Review blocked requests for patterns

2. **Determine which component is blocking**:
   - **Free Managed Ruleset**: Check event for rule name
   - **Custom Rules**: Check Custom rules list (Security > WAF > Custom rules)
   - **Rate Limiting**: Check if it's HTTP 429 (see above section)

3. **Is it legitimate traffic?**
   - Check the URL/path being blocked
   - Check request parameters for suspicious content
   - Check IP address (office, home, partner, etc.)

**Solutions**:
- **Option 1**: Modify or disable problematic custom rule
  - Security > WAF > Custom rules
  - Find rule causing false positives
  - Adjust rule expression or disable temporarily

- **Option 2**: Create exception rule
  - Create custom rule to bypass blocking for specific request pattern
  - Example: "If IP is X.X.X.X, then Allow"

- **Option 3**: Switch rule to "Log" mode
  - Some rules can be changed from "Block" to "Log" (monitors without blocking)
  - Allows monitoring while investigating

- **Option 4**: Disable Free Managed Ruleset (if needed)
  - Contact Cloudflare support (cannot disable via dashboard)
  - Rare - only if Free Managed Ruleset is clearly wrong

**Prevention**:
- Phase 1 uses Free Managed Ruleset in Monitor mode (usually no blocking)
- Test custom rules thoroughly before deploying
- Use "Log" mode during ramp-up period

### Homepage Not Loading?

If https://sebc.dev returns errors or times out:

**Step 1: Is it a WAF issue or application issue?**

1. **Test from Cloudflare Dashboard**:
   - Check page rule status
   - Verify origin server is configured correctly
   - Check that zone is active

2. **Check WAF status**:
   - Dashboard > Security > WAF > Overview
   - Are WAF rules enabled? (Usually yes)
   - Check recent Security Events (Analytics tab)
   - Are there spike in blocks?

3. **If WAF is causing blocks**:
   - Follow troubleshooting above (Requests Being Blocked)
   - Disable problematic rule or entire WAF if urgent
   - See Rollback Procedures section

**Step 2: If WAF seems fine, it's likely application issue**

1. **Check application servers**:
   - Are web servers running?
   - Check application logs for errors
   - Verify database connections
   - Test application directly (if accessible)

2. **Check Cloudflare settings**:
   - Verify origin IP/CNAME is correct
   - Check SSL/TLS mode is appropriate
   - Verify DNS records are correct

3. **Contact support**:
   - If you cannot identify the issue
   - Have ready: Cloudflare WAF screenshot, error details, timestamps

### High Volume of Security Events?

If you see unusually many events in Security > Analytics:

**Is this normal or an attack?**

1. **Check event types**:
   - Many "Free Managed Ruleset" blocks = attack detected
   - Many "Rate Limit" blocks (429) = legitimate traffic spike
   - Many "Custom rule" blocks = false positives or attack

2. **Identify the pattern**:
   - Same IP attacking repeatedly? = Targeted attack
   - Many different IPs? = Distributed attack (DDoS)
   - Mix of legitimate and malicious? = Normal traffic with some bots

3. **Check timestamps**:
   - Was there an announcement/marketing that drove traffic? = Normal spike
   - Random attacks at 3 AM? = Automated bot activity

**Is this an attack?**

Signs of active attack:
- Spike in blocked requests (10x+ normal)
- Same attack pattern repeated
- Specific URL being targeted
- Requests from many different countries/IPs

**What to do**:

- **If false positive (legitimate traffic blocked)**:
  - Adjust rules to allow legitimate traffic
  - See "Rate Limit False Positives" or "Requests Being Blocked" above

- **If actual attack**:
  - Monitor closely and document patterns
  - Consider upgrading to Pro plan for OWASP Core Ruleset
  - Consider stricter rate limiting or geoblocking
  - Document for post-launch security review

- **If unsure**:
  - Monitor for 24-48 hours to establish baseline
  - Review events daily
  - Ask team if they notice site performance issues
  - Contact Cloudflare support with event screenshots if concerned

### Understanding Security Events

For any WAF event in Analytics dashboard:

1. **Review the Event Details**:
   - **IP Address**: Where the request came from
   - **Timestamp**: When the request was made
   - **URL/Path**: Which page/API was targeted
   - **Rule Name**: Which WAF rule triggered
   - **Action**: What happened (Block, Challenge, Log)
   - **User Agent**: Browser or tool making the request

2. **Determine Legitimacy**:
   - Was this a legitimate request or actual attack?
   - Is the IP expected (office, partner, monitoring tool)?
   - Is the URL something users would normally access?
   - Does the user agent match browser (or bot)?

3. **Document for Phase 2**:
   - Note patterns that need handling in future phases
   - Save screenshots of suspicious patterns
   - Alert team if you see interesting security trends

### Common Issues and Quick Fixes

| Issue | Cause | Fix |
| --- | --- | --- |
| "429 Too Many Requests" errors | Rate limit too strict | Increase limit or whitelist IP |
| "403 Forbidden" on legitimate requests | Custom rule false positive | Adjust rule or add exception |
| Website completely down | Application or DNS issue | Check origin server, not WAF |
| Spike in blocked requests | Attack or bot activity | Monitor events, document patterns |
| Users report slow page load | WAF processing overhead | Rare - usually other cause |
| Cannot access dashboard | Permissions or authentication | Check account login, MFA |

### General Troubleshooting Process

If you're not sure what the issue is:

1. **Gather Information**:
   - What does the error say? (404, 429, 403, timeout, etc.)
   - When did it start? (timestamp)
   - Does it affect all users or specific ones?
   - Does it affect all pages or specific URLs?
   - Have you made recent changes? (WAF rules, rate limits, etc.)

2. **Check Dashboard**:
   - Dashboard > Security > Analytics
   - Look for spikes or unusual activity
   - Filter by date range when issue occurred
   - Check if any WAF events correlate with issue

3. **Review Recent Changes**:
   - Did you recently modify WAF rules?
   - Did rate limit change?
   - Did you add new custom rules?
   - If yes, consider disabling the change temporarily

4. **Test Access**:
   - Test from different IP if possible
   - Test from incognito/private browser
   - Test directly: `curl -I https://sebc.dev`
   - Check if issue is specific to certain IPs/users

5. **Escalate If Needed**:
   - If you've tried above steps and issue persists
   - Gather all information and screenshots
   - Contact Cloudflare support
   - Include: description, timestamps, WAF configuration, error details

---

## Contact & Support

For questions about WAF configuration:

- **Cloudflare Documentation**: https://developers.cloudflare.com/waf/
- **Free Managed Ruleset Info**: https://developers.cloudflare.com/waf/managed-rules/free/
- **Cloudflare Support**: https://support.cloudflare.com/
- **Internal Team**: Contact via project communication channel

---

## Document Metadata

- **Written by**: Phase 1 Implementation (Story 0.9)
- **Reviewed by**: TBD
- **Classification**: Security Documentation
- **Plan**: Cloudflare Free Plan
- **Related Documents**:
  - `docs/security/README.md` - Security infrastructure overview
  - `docs/security/rate-limiting-rules.md` - Rate limiting configuration (Phase 1 Commit 2)
  - `docs/security/custom-waf-rules.md` - Custom rules (Phase 1 Commit 3)
  - `docs/deployment/cloudflare-dashboard-access.md` - Dashboard access guide (Phase 1 Commit 4)
