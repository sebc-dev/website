# Security Infrastructure Documentation

Welcome to the sebc.dev security documentation. This folder contains comprehensive guides for understanding and managing our security infrastructure across development, staging, and production environments.

---

## Overview

sebc.dev implements a **defense-in-depth** security strategy using multiple complementary layers:

```
┌──────────────────────────────────────────────────────────────┐
│                    User Requests                             │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: Cloudflare Access (Story 0.8)                      │
│  - Identity-based access control                             │
│  - MFA enforcement                                           │
│  - Team-level security policies                              │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  Layer 2: Cloudflare WAF (Story 0.9)                         │
│  - Web Application Firewall                                  │
│  - OWASP Top 10 protection                                   │
│  - Threat intelligence based rules                           │
│  - Rate limiting & DDoS protection                           │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│  Layer 3: Application Security                               │
│  - Input validation & sanitization                           │
│  - Secure authentication                                     │
│  - CSRF protection                                           │
│  - Session management                                        │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                   Safe Application                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Security Initiatives

### Epic 0: Foundation Security (Status: In Progress)

Core security infrastructure for sebc.dev:

| Story | Title                | Description                                | Status         |
| ----- | -------------------- | ------------------------------------------ | -------------- |
| 0.7   | CI/CD GitHub Actions | Automated testing and deployment pipeline  | ✅ COMPLETED   |
| 0.8   | Cloudflare Access    | Identity and access management             | ✅ COMPLETED   |
| 0.9   | Cloudflare WAF       | Web application firewall & DDoS protection | 🚧 IN PROGRESS |

---

## WAF Protection (Story 0.9)

### What is WAF?

The Cloudflare Web Application Firewall (WAF) is a distributed security service that:

- **Monitors** incoming requests for malicious patterns
- **Protects** against critical vulnerabilities and known exploits
- **Filters** traffic at the Cloudflare edge (before reaching our servers)
- **Logs** security events for analysis and compliance
- **Auto-Updates** with the latest threat signatures

### Current Configuration (Phase 1)

**Status**: Free Managed Ruleset verified and documented (Commit 1)
**Plan**: Cloudflare Free Plan

| Component                | Status         | Phase | Purpose                                  |
| ------------------------ | -------------- | ----- | ---------------------------------------- |
| **Free Managed Ruleset** | ✅ Active      | 1     | Baseline protection (auto-deployed)      |
| **Rate Limiting**        | ⏳ Phase 2     | 2     | Volumetric attack protection             |
| **Custom WAF Rules**     | ⏳ Phase 3     | 3     | Enhanced specific attack pattern defense |

### Phase Progress

- **Phase 1 (Current)**: Verify Free Managed Ruleset - auto-deployed baseline protection
  - Commit 1: Verify & document Free Managed Ruleset ✅ (current)
  - Commit 2: Configure rate limiting (100 req/min per IP) - planned
  - Commit 3: Create custom rules (XSS, SQLi, path traversal) - planned
  - Commit 4: Complete documentation - planned

### Free Plan vs. Pro Plan

sebc.dev is configured with **Cloudflare Free Plan WAF features**:

- ✅ Free Managed Ruleset (auto-deployed, zero configuration)
- ✅ Basic rate limiting
- ✅ Limited custom rules
- ❌ OWASP Core Ruleset (requires Pro, $20/month)
- ❌ Cloudflare Managed Ruleset (requires Pro, $20/month)
- ❌ Advanced configuration and tuning

See `waf-configuration.md` for upgrade considerations.

### Documentation

**Full WAF Configuration Guide**: [`waf-configuration.md`](./waf-configuration.md)

Topics covered:

- OWASP Core Rule Set configuration details
- Why "Log" mode in Phase 1
- Dashboard navigation and log viewing
- Rollback procedures
- Troubleshooting guide
- Team contact information

---

## Rate Limiting (Story 0.9 - Phase 3)

Rate limiting protects sebc.dev from:

- Brute force attacks
- Credential stuffing
- API abuse
- Volumetric DoS attacks

**Documentation**: `rate-limiting-rules.md` (added in Phase 1 Commit 3)

---

## Cloudflare Access (Story 0.8)

Identity and access management for sensitive resources:

- Team member authentication
- Multi-factor authentication (MFA)
- Policy-based access control
- Audit logging of access events

**See Story 0.8 documentation** for full details (completed in Epic 0).

---

## Quick Links

### Cloudflare Dashboard

- **Dashboard**: https://dash.cloudflare.com
- **Zone**: sebc.dev
- **Access Guide**: See `docs/deployment/cloudflare-dashboard-access.md` (Phase 1 Commit 4)

### Security Analytics

View security events and metrics:

1. Log into Cloudflare Dashboard
2. Select **sebc.dev** zone
3. Click **Security** > **Analytics**
4. View real-time security metrics

### Documentation

| Document                                             | Purpose                  | Audience         |
| ---------------------------------------------------- | ------------------------ | ---------------- |
| [`waf-configuration.md`](./waf-configuration.md)     | WAF setup and management | All team members |
| [`rate-limiting-rules.md`](./rate-limiting-rules.md) | Rate limiting details    | DevOps, Security |
| `docs/deployment/cloudflare-dashboard-access.md`     | Dashboard access guide   | All team members |

---

## Common Tasks

### Check WAF Status

1. Navigate to Dashboard > Security > WAF > Overview
2. Verify "Status" shows "Active"
3. Check enabled rulesets

### View WAF Events

1. Navigate to Dashboard > Security > Firewall Events (or Analytics)
2. Filter by date range and rule name
3. Analyze events to identify patterns

### Report WAF Issue

1. Check `waf-configuration.md` Troubleshooting section
2. If issue persists, contact Cloudflare support
3. Include: WAF configuration screenshot, error details, affected URLs

### Adjust Rate Limits

See `rate-limiting-rules.md` for:

- How to view rate limit events
- How to adjust rate limit thresholds
- How to whitelist specific IPs
- How to test rate limiting safely

---

## Team Resources

### For Developers

- WAF doesn't require application code changes
- Review WAF logs for attack patterns
- Report false positives to security team

### For DevOps/Security Engineers

- Configure and manage WAF rules
- Analyze security analytics
- Plan Phase 2 & 3 WAF enhancements
- Manage Cloudflare access and permissions

### For Project Managers

- Monitor security status in Epic Tracking
- Track WAF implementation progress
- Ensure security reviews are completed

---

## Security Review Process

All security changes follow these steps:

1. **Documentation**: Changes documented in this folder
2. **Review**: Code/config review by security team
3. **Testing**: Validation in staging environment
4. **Deployment**: Safe rollout to production
5. **Monitoring**: Continuous monitoring post-deployment

---

## Compliance & Standards

### Standards We Follow

- **OWASP Top 10**: Web application security risks
- **NIST Cybersecurity Framework**: Security best practices
- **Cloudflare WAF Best Practices**: Industry recommendations

### GDPR & Privacy

- WAF logs are subject to data retention policies
- No personal data stored in WAF rules
- Security events kept for audit trail (30 days)

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** post it publicly
2. **Do NOT** commit it to the repository
3. **Contact**: Security team immediately via private channel
4. **Provide**: Clear description of vulnerability and impact

---

## FAQ

**Q: Why Log mode instead of Block mode?**
A: Log mode allows monitoring without blocking legitimate traffic. We analyze logs for false positives before enabling Block mode in Phase 2.

**Q: Does WAF require code changes?**
A: No. WAF is configured in Cloudflare Dashboard. No application code changes needed.

**Q: How often are WAF rules updated?**
A: OWASP Core Rule Set is updated continuously by the OWASP community. Cloudflare automatically deploys updates.

**Q: What if WAF blocks legitimate traffic?**
A: Phase 1 uses Log mode (no blocking). Phase 2 will analyze logs and create exceptions before enabling Block mode.

**Q: Can I test WAF rules?**
A: Yes, but carefully. Homepage should always load normally. Use non-production IPs for attack pattern testing.

---

## Document Version Control

| Version | Date       | Changes                                                |
| ------- | ---------- | ------------------------------------------------------ |
| 1.0     | 2025-11-15 | Initial security README with Phase 1 WAF documentation |

---

## Contact

For questions about security:

- **Cloudflare Support**: https://support.cloudflare.com/
- **Documentation**: https://developers.cloudflare.com/waf/
- **Internal Team**: Contact via project communication channel

---

Last Updated: 2025-11-15
