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
| TBD        | Commit 3 | Create Custom WAF Rules (XSS, SQLi, Path Traversal)       |
| TBD        | Commit 4 | Comprehensive Documentation & Screenshots                 |

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

### Emergency: Disable WAF Components

If WAF is causing issues:

1. **Navigate to**: Dashboard > Security > WAF > Overview
2. **Locate**: WAF component causing issues
3. **Disable**: Toggle the component off
4. **Verify**: WAF status should reflect change
5. **Recovery Time**: Immediate (no cache refresh needed)

**Note**: Free Managed Ruleset cannot be disabled individually (auto-deployed). Rollback would require Cloudflare support assistance for this baseline protection.

---

## Troubleshooting

### Homepage Not Loading?

If https://sebc.dev returns errors:

1. **Check WAF Status**:
   - Dashboard > Security > WAF > Overview
   - Verify WAF configuration is correct

2. **Check Application**:
   - Free Managed Ruleset should not block legitimate traffic
   - If homepage is down, check application servers first
   - Verify Cloudflare origin settings are correct

3. **Contact Support**:
   - If issue persists, contact Cloudflare support
   - Include: WAF configuration screenshot, error details

### High Volume of Security Events?

If you see many events in Security > Events:

- **This may be normal** - many requests trigger detection
- Review events to identify legitimate vs. malicious patterns
- Use Phase 2 to refine rules if needed
- Document patterns for rate limiting configuration

### Understanding Security Events

For any WAF event:

1. **Review the Event Details**: Check what pattern triggered the event
2. **Determine Legitimacy**: Was this a legitimate request or actual attack?
3. **Document for Phase 2**: Note patterns that need handling in future phases

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
