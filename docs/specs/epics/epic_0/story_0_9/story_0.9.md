# Story 0.9 - Configurer Cloudflare WAF

**Epic**: Epic 0 - Socle technique (V1)
**Story ID**: 0.9
**Created**: 2025-11-13
**Status**: 🚧 IN PROGRESS (Phase 1 docs generated)

---

## 📖 Story Overview

### Description

Configure Cloudflare Web Application Firewall (WAF) to protect the application against common web threats including Cross-Site Scripting (XSS), SQL injection, and other OWASP Top 10 vulnerabilities. The WAF operates at the Cloudflare Edge level, filtering malicious traffic before it reaches the Cloudflare Worker application.

This story establishes baseline security protections that complement application-level security measures (input validation with Zod, CSRF protection, etc.) and works in tandem with Cloudflare Access (Story 0.8) to provide defense-in-depth.

### User Story

**As a** site owner
**I want** the application protected by Cloudflare WAF
**So that** malicious traffic and common web attacks are blocked at the Edge before reaching the application, protecting both the infrastructure and users

### Business Value

- **Security**: Proactive protection against OWASP Top 10 vulnerabilities
- **Performance**: Malicious traffic blocked at Edge (doesn't consume Worker resources)
- **Compliance**: Demonstrates security best practices for production deployments
- **Peace of Mind**: Automated threat detection and blocking with Cloudflare's global threat intelligence
- **Cost Efficiency**: Prevents resource exhaustion attacks and reduces load on application

---

## 🎯 Acceptance Criteria

### From PRD - ENF23 (Sécurité infrastructure)

**CA3: Cloudflare WAF** — Protection against common web threats (XSS, SQL injection, etc.)

### Detailed Acceptance Criteria

#### AC1: WAF Core Configuration

- [ ] Cloudflare WAF enabled for the website zone
- [ ] OWASP Core Rule Set (Managed Ruleset) activated
- [ ] WAF mode configured appropriately (Block vs Challenge vs Log)
- [ ] WAF rules applied to all routes except explicitly whitelisted paths
- [ ] Configuration documented in `docs/security/waf-configuration.md`

#### AC2: Rule Configuration

- [ ] OWASP Top 10 protection enabled (XSS, SQLi, Command Injection, etc.)
- [ ] HTTP anomaly detection enabled
- [ ] Known CVE protection enabled
- [ ] Appropriate sensitivity level configured (Medium recommended for production)
- [ ] Custom rules created if needed for application-specific threats
- [ ] Rate limiting rules configured for common endpoints

#### AC3: Testing & Validation

- [ ] Positive tests: Legitimate traffic passes through WAF without blocking
- [ ] Negative tests: Common attack patterns are blocked (XSS, SQLi payloads)
- [ ] E2E Playwright tests pass with WAF enabled
- [ ] No false positives detected for normal application usage
- [ ] Test results documented in `docs/security/waf-testing.md`

#### AC4: Monitoring & Alerts

- [ ] WAF events visible in Cloudflare Security Analytics dashboard
- [ ] Cloudflare Alerts configured for high-severity WAF events
- [ ] Alert notifications configured (email/webhook)
- [ ] Monitoring guide documented for reviewing WAF logs
- [ ] Dashboard bookmark saved for quick access

#### AC5: Documentation

- [ ] WAF configuration documented (rules, sensitivity, exceptions)
- [ ] Testing procedures documented
- [ ] Monitoring and alert response guide created
- [ ] Team trained on WAF dashboard and alert interpretation
- [ ] Rollback procedure documented

---

## 📦 Technical Requirements

### Cloudflare Configuration

**WAF Setup** (via Cloudflare Dashboard):

- Zone: `sebc.dev` (production zone)
- WAF Mode: Block (production), Log (development/testing)
- Managed Rulesets:
  - **OWASP Core Rule Set**: Primary defense against web attacks
  - **Cloudflare Managed Ruleset**: Additional protection based on global threat intel
  - **Cloudflare Specials**: Known CVE protection

**Rule Configuration**:

- Sensitivity Level: Medium (balance between security and false positives)
- Action: Block (for high-confidence threats)
- Challenge: For suspicious but not definitively malicious traffic
- Log: For monitoring and tuning phase

**Rate Limiting** (Basic):

- Global rate limit: 100 req/min per IP
- API endpoints: 20 req/min per IP (if applicable)
- Admin routes: 10 req/min per IP (already protected by Access)

**Whitelisting/Exceptions**:

- CI/CD health check endpoints (if needed)
- Monitoring service IPs (if applicable)
- Known good IPs (development team, if needed for testing)

### Testing Requirements

**Positive Tests** (legitimate traffic):

- ✅ Homepage loads successfully
- ✅ Static assets served correctly
- ✅ API endpoints respond normally
- ✅ Form submissions work
- ✅ Playwright E2E tests pass

**Negative Tests** (attack simulation):

- ❌ XSS payloads blocked (`<script>alert('xss')</script>`)
- ❌ SQL injection attempts blocked (`' OR 1=1 --`)
- ❌ Path traversal attempts blocked (`../../../etc/passwd`)
- ❌ Command injection blocked (`; ls -la`)
- ❌ Known attack patterns blocked (common CVE payloads)

**Performance Tests**:

- WAF adds minimal latency (<10ms p95)
- No impact on page load metrics (LCP, INP, CLS)
- Rate limiting doesn't affect normal usage

### Documentation Requirements

**Files to Create**:

1. **`docs/security/waf-configuration.md`**:
   - WAF rules enabled and rationale
   - Sensitivity levels and tuning decisions
   - Exceptions and whitelisting
   - Configuration history and changes

2. **`docs/security/waf-testing.md`**:
   - Test procedures (positive and negative)
   - Test results and validation
   - How to run tests locally/staging
   - Known false positives and mitigation

3. **`docs/security/waf-monitoring.md`**:
   - How to access WAF dashboard
   - How to interpret WAF events and logs
   - Alert configuration and response procedures
   - Tuning recommendations based on traffic patterns

4. **`docs/security/waf-incident-response.md`**:
   - How to respond to WAF alerts
   - How to investigate blocked requests
   - How to whitelist false positives
   - Escalation procedures

---

## 🔗 Dependencies

### Depends On

- **Story 0.1** ✅ COMPLETED: Next.js project initialized
- **Story 0.2** ✅ COMPLETED: OpenNext adapter configured
- **Story 0.7** 🚧 IN PROGRESS: CI/CD deployment pipeline (needed to deploy and test)

### Related Stories

- **Story 0.8** 📋 PLANNED: Cloudflare Access configuration (complementary security layer)
- Both stories contribute to Epic 0 Milestone 4: Security configured

### Parallel Work

- Story 0.9 (WAF) can be developed **in parallel** with Story 0.8 (Access)
- Both are independent configurations in Cloudflare Dashboard
- Combined testing recommended once both complete

### Blocks (What This Enables)

- **Epic 0 Completion**: Security baseline established
- **Story 6.3** (from PRD): Part of overall security infrastructure (ENF23-CA3)
- **Production Readiness**: Required for secure production deployment

### External Dependencies

- **Cloudflare Account**: Pro plan or higher required for advanced WAF features
- **Cloudflare Zone**: `sebc.dev` zone must be active and configured
- **Deployment**: Application must be deployed to test WAF configuration

---

## 🧪 Testing Strategy

### Unit Tests

- N/A (configuration-only story, no code changes)

### Integration Tests

**Positive Tests** (Playwright E2E):

- All existing E2E tests should pass with WAF enabled
- No false positives for legitimate application usage

**Negative Tests** (Manual/Scripted):

- Use tools like `curl` or `Postman` to send attack payloads
- Verify WAF blocks malicious requests
- Verify appropriate HTTP status codes (403 Forbidden or Cloudflare Challenge page)

**Example Test Commands**:

```bash
# Test XSS blocking
curl -X POST "https://sebc.dev/api/test" \
  -H "Content-Type: application/json" \
  -d '{"input":"<script>alert(\"xss\")</script>"}'
# Expected: 403 Forbidden or Cloudflare WAF block page

# Test SQL injection blocking
curl "https://sebc.dev/api/articles?id=1' OR '1'='1"
# Expected: 403 Forbidden or Cloudflare WAF block page

# Test legitimate request
curl "https://sebc.dev"
# Expected: 200 OK with HTML content
```

### Performance Tests

- **Baseline**: Measure latency before WAF enabled
- **With WAF**: Measure latency after WAF enabled
- **Acceptance**: <10ms p95 latency increase

### Security Tests

- **OWASP ZAP**: Run automated security scan against deployed site
- **Burp Suite**: Manual testing of WAF rules (if available)
- **Expected**: All critical/high vulnerabilities mitigated by WAF

---

## 📊 Success Metrics

### Functional Metrics

- ✅ WAF enabled and operational
- ✅ 0 false positives for legitimate traffic
- ✅ 100% of common attack patterns blocked (XSS, SQLi, etc.)
- ✅ All E2E tests passing with WAF enabled

### Performance Metrics

- **Latency Impact**: <10ms p95 increase
- **False Positive Rate**: <0.1% of legitimate requests
- **Block Rate**: >95% of malicious requests blocked

### Security Metrics

- **OWASP Top 10 Coverage**: 100% of common vulnerabilities mitigated
- **Known CVE Protection**: Enabled for all applicable CVEs
- **Threat Intelligence**: Real-time updates from Cloudflare global network

---

## 🚨 Risks & Mitigation

### Risk 1: False Positives 🟡 Medium

**Description**: Legitimate traffic may be incorrectly blocked by WAF rules

**Impact**: Users unable to access site or submit forms

**Mitigation**:

- Start with "Log" mode to monitor without blocking
- Analyze logs for false positives before switching to "Block" mode
- Gradually increase sensitivity level (Low → Medium → High)
- Create exception rules for known false positives
- Document whitelisting process

**Contingency**: Ability to quickly disable WAF or add exceptions if critical false positive detected

### Risk 2: Configuration Complexity 🟢 Low

**Description**: WAF has many configuration options, may be overwhelming

**Impact**: Suboptimal configuration or security gaps

**Mitigation**:

- Use Cloudflare Managed Rulesets as baseline (pre-configured by experts)
- Start with recommended defaults (OWASP Core Rule Set, Medium sensitivity)
- Review Cloudflare documentation and best practices
- Consult Cloudflare support if needed (Pro plan includes support)

**Contingency**: Revert to managed rulesets if custom rules cause issues

### Risk 3: Testing Limitations 🟡 Medium

**Description**: Difficult to simulate all attack vectors in testing environment

**Impact**: Unknown vulnerabilities may not be covered

**Mitigation**:

- Use industry-standard testing tools (OWASP ZAP, Burp Suite)
- Reference OWASP Top 10 and common CVE databases
- Enable monitoring and alerting for continuous validation
- Plan for post-deployment tuning based on real traffic

**Contingency**: Use Cloudflare "Challenge" mode instead of "Block" for initial rollout, allowing review before permanent blocking

### Risk 4: Performance Impact 🟢 Low

**Description**: WAF processing may add latency to requests

**Impact**: Slower page load times, degraded user experience

**Mitigation**:

- Cloudflare WAF runs at Edge with minimal latency overhead
- Benchmark before/after to measure actual impact
- Monitor performance metrics post-deployment
- Optimize rules if performance degradation detected

**Contingency**: Reduce WAF sensitivity or disable specific rulesets if performance significantly impacted

---

## 📝 Implementation Notes

### Phase Breakdown (3 Phases)

This story is decomposed into **3 atomic phases**:

1. **Phase 1: WAF Core Configuration** (1-1.5d)
   - Enable WAF in Cloudflare Dashboard
   - Configure OWASP Core Rule Set
   - Set up basic rate limiting
   - Initial documentation

2. **Phase 2: Custom Rules & Tuning** (1-1.5d)
   - Create application-specific rules if needed
   - Configure exceptions and whitelisting
   - Fine-tune sensitivity levels
   - Complete documentation

3. **Phase 3: Testing & Validation** (1d)
   - Positive and negative testing
   - E2E test validation
   - Performance benchmarking
   - Monitoring setup and guide creation

**Total Estimated Duration**: 3-4 days
**Total Estimated Commits**: ~12 commits (primarily documentation)

See `implementation/PHASES_PLAN.md` for detailed phase breakdown.

### Configuration Management

**WAF is configured via Cloudflare Dashboard** (not Infrastructure as Code):

- Configuration is zone-specific (tied to `sebc.dev` domain)
- Changes made via dashboard: https://dash.cloudflare.com
- No `wrangler.toml` or code changes required
- Configuration should be documented in `docs/security/` for reproducibility

**Backup Strategy**:

- Take screenshots of WAF configuration
- Export rule lists to JSON (if possible via API)
- Document all configuration steps for disaster recovery

### Development vs Production

**Development/Staging**:

- Use "Log" mode initially to monitor without blocking
- Whitelist development IPs if needed
- Disable rate limiting for testing

**Production**:

- Use "Block" mode for high-confidence threats
- Use "Challenge" mode for suspicious traffic
- Enable rate limiting
- Monitor closely for false positives in first week

---

## 📚 Reference Documents

### Cloudflare Documentation

- [Cloudflare WAF Overview](https://developers.cloudflare.com/waf/)
- [OWASP Core Rule Set](https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/)
- [Cloudflare Rate Limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [WAF Analytics](https://developers.cloudflare.com/waf/analytics/)

### OWASP References

- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

### Project Documentation

- PRD: `docs/specs/PRD.md` (lines 498-502, ENF23-CA3)
- Architecture: `docs/specs/Architecture_technique.md` (lines 341-342)
- Epic Tracking: `docs/specs/epics/epic_0/EPIC_TRACKING.md`
- Related Story: `docs/specs/epics/epic_0/story_0_8/story_0.8.md` (Cloudflare Access)

---

## ✅ Definition of Done

This story is considered **DONE** when:

- [x] All acceptance criteria met (AC1-AC5)
- [x] WAF enabled and operational in Cloudflare Dashboard
- [x] OWASP Core Rule Set and Cloudflare Managed Rulesets activated
- [x] Basic rate limiting configured
- [x] Positive tests: All legitimate traffic passes (E2E tests green)
- [x] Negative tests: Common attacks blocked (XSS, SQLi, etc.)
- [x] Performance validated: <10ms p95 latency increase
- [x] Monitoring and alerts configured
- [x] All documentation created:
  - `docs/security/waf-configuration.md`
  - `docs/security/waf-testing.md`
  - `docs/security/waf-monitoring.md`
  - `docs/security/waf-incident-response.md`
- [x] Team trained on WAF dashboard and alert response
- [x] EPIC_TRACKING.md updated (Story 0.9 marked complete)
- [x] Story demo/walkthrough completed with team

---

**Story Created**: 2025-11-13
**Created by**: Claude Code (story-phase-planner skill)
**Epic**: Epic 0 - Socle technique (V1)
**Status**: 📋 PLANNED
