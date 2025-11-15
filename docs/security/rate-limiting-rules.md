# Cloudflare Rate Limiting Rules

**Story**: 0.9 - Cloudflare WAF Integration
**Phase**: 1 - WAF Core Configuration
**Commit**: 2/4 - Configure Basic Rate Limiting
**Plan**: Cloudflare Free Plan
**Created**: 2025-11-15
**Last Updated**: 2025-11-15
**Status**: Phase 1 Commit 2 - Basic Rate Limiting Configured

---

## Overview

Rate limiting is a critical protection mechanism that controls the number of requests a client (identified by IP address) can make to sebc.dev within a specified time period. It protects against volumetric attacks, brute force attempts, and resource exhaustion while allowing legitimate users to access the site normally.

### Why Rate Limiting Matters

Rate limiting protects against common attack scenarios:

- **Volumetric DoS Attacks**: Overwhelming the server with massive request volumes
- **Brute Force Attacks**: Automated login attempts with many username/password combinations
- **Credential Stuffing**: Testing leaked credentials against user accounts
- **API Abuse**: Scraping or excessive API usage
- **Distributed DoS (DDoS)**: Coordinated attacks from multiple IPs
- **Resource Exhaustion**: Preventing legitimate users from accessing the service

### "Under Construction" Context

sebc.dev is currently "en construction" (under construction) with minimal traffic. This phase implements **conservative baseline rate limiting** suitable for a low-traffic site:

- **Rate Limit**: 100 requests per minute per IP
- **Purpose**: Basic protection for future launch
- **Tuning**: Will be adjusted post-launch based on real traffic patterns
- **Philosophy**: Start lenient, tighten later as needed

Once the site goes live with real traffic, we'll monitor the Security Events and adjust these limits based on actual usage patterns.

---

## Global Rate Limiting Configuration

### Rule Details

**Rule Name**: Global Rate Limit - Protection

| Property | Value | Rationale |
| --- | --- | --- |
| **Rate Limit** | 100 requests per minute | Conservative limit suitable for "en construction" site. Legitimate users rarely exceed this. Real traffic patterns will inform post-launch tuning. |
| **Scope** | All incoming requests | Global protection across entire domain |
| **IP-Based** | Per IP address | Each unique client IP has its own 100 req/min quota |
| **Action** | Block | Requests exceeding limit are blocked immediately |
| **Mitigation Timeout** | 1 minute | After blocking, IP remains blocked for 1 minute before being allowed to try again |

### Configuration Steps (Cloudflare Dashboard)

To configure this rate limiting rule in the Cloudflare Dashboard:

1. **Navigate to Dashboard**:
   - URL: https://dash.cloudflare.com
   - Sign in with your Cloudflare account

2. **Select Zone**:
   - Ensure you're in the **sebc.dev** zone

3. **Access Rate Limiting**:
   - Click **Security** in the left sidebar
   - Click **WAF** from submenu
   - Click **Rate Limiting Rules** tab

4. **Create Rule**:
   - Click **Create rate limiting rule** button
   - Fill in the form:
     - **Rule name**: `Global Rate Limit - Protection`
     - **If incoming requests match**: Select "All incoming requests"
     - **Then**:
       - **Rate**: 100 requests per 1 minute
       - **Action**: Block
       - **Mitigation timeout**: 1 minute
   - Click **Save**

5. **Verify**:
   - Rule should appear in the Rate Limiting Rules list
   - Status should show as "Enabled"

### Understanding the Configuration

**Rate: 100 requests per minute per IP**

- A typical human user might generate 5-10 requests per minute while browsing (page load, images, assets, API calls)
- Legitimate automated tools (monitoring, webhooks) typically send fewer than 50 requests per minute
- The 100 req/min limit provides comfortable headroom for normal usage while blocking obvious attacks
- This is a conservative starting point for a site "under construction"

**Action: Block**

- Blocks (403 Forbidden) requests exceeding the limit
- Alternative "Challenge" action requires user to solve CAPTCHA (more user-friendly but requires JS)
- "Block" is simpler and sufficient for baseline protection
- Can be changed to "Challenge" if false positives occur

**Mitigation Timeout: 1 minute**

- Once an IP hits the rate limit, it's blocked for 1 minute
- After 1 minute, the IP's counter resets and they can make requests again
- 1 minute provides reasonable protection while allowing quick recovery for false positives
- Can be adjusted (e.g., to 5 minutes) if attacks are more persistent

---

## When This Rule Triggers

### Legitimate Scenarios (Rare)

Rate limiting may trigger for legitimate traffic in these scenarios:

1. **Multiple Tabs/Windows**: A user rapidly opening many pages (< 1% of users)
2. **Automated Tools**: Browser extensions, monitoring tools, webhooks
3. **High-Traffic Periods**: If real traffic patterns exceed expectations post-launch
4. **API Clients**: Heavy usage of API endpoints (if applicable)

In these cases, the client receives HTTP 429 (Too Many Requests) and must wait 1 minute before retrying.

### Attack Scenarios

Rate limiting successfully blocks:

1. **Brute Force Login Attacks**: Automated attempts with many password combinations
2. **Credential Stuffing**: Testing leaked credentials rapidly
3. **Bot Scanning**: Automated vulnerability scanners making many requests
4. **DDoS Attacks**: Volumetric attacks trying to overwhelm the server
5. **Scraping Attempts**: Rapid extraction of site content

---

## Adjusting Rate Limits

### Identifying If Rate Limit Is Too Strict

Monitor the Security Events to see if legitimate traffic is being blocked:

1. **Navigate to**: Dashboard > Security > Analytics (or Firewall Events)
2. **Filter by**: "Rate Limit" action
3. **Review Events**: Look for patterns
   - If you see legitimate URLs being blocked → rate limit too strict
   - If you see attack patterns → rate limit is working correctly

### Signs the Limit is Too Strict

- Real users reporting "429 Too Many Requests" errors
- Significant drop in successful requests (events in Security > Analytics)
- Legitimate IP addresses appearing frequently in rate limit blocks
- Heavy usage from known good sources (offices, monitoring tools)

### Adjusting the Rate Limit

To change the limit (if needed):

1. **Navigate to**: Dashboard > Security > WAF > Rate Limiting Rules
2. **Find Rule**: "Global Rate Limit - Protection"
3. **Edit**: Click the rule or action menu
4. **Modify Rate**: Change from 100 to appropriate value:
   - **Higher limit** (e.g., 200-500 req/min): If legitimate traffic is blocked
   - **Lower limit** (e.g., 50-75 req/min): If attacks are not blocked sufficiently
5. **Save** and verify in Security Events

### Post-Launch Tuning Strategy

Once sebc.dev goes live:

1. **Week 1**: Monitor baseline traffic patterns in Security Events
2. **Week 2**: If no false positives, rate limit is appropriate
3. **Week 2+**: Adjust based on observed traffic:
   - Document observed max requests/min from legitimate traffic
   - Set limit 20-30% above observed max
   - Test adjustments with curl loops first (see Monitoring section)

### Whitelisting Specific IPs (If Needed)

If a known good IP (office network, monitoring service) hits the limit:

1. **Create Exception Rule** (Cloudflare WAF custom rules):
   - Navigate to: Security > WAF > Custom rules
   - Create rule:
     - Condition: `ip.src eq "X.X.X.X"` (replace with actual IP)
     - Action: Skip ("Bypass") the rate limiting rule
2. **Test**: Verify the IP can now exceed the rate limit
3. **Document**: Add entry to this section noting the exception

---

## Monitoring Rate Limiting Events

### Viewing Rate Limit Events

To see which IPs have triggered the rate limit:

1. **Navigate to**: Dashboard > Security > Analytics (or Firewall Events)
2. **Filter by**:
   - **Action**: "Block" (or search for "rate limit")
   - **Date Range**: Last 24 hours or custom range
3. **Analyze**:
   - Review blocked IPs and their request patterns
   - Identify legitimate vs. malicious traffic
   - Document patterns for Phase 2 tuning

### Understanding Rate Limit Events

Each event shows:

- **IP Address**: The client IP that triggered the limit
- **Timestamp**: When the block occurred
- **URL**: Which URL triggered the limit
- **Request Count**: How many requests in the minute
- **Action**: "Block" (rate limit exceeded)

### Identifying False Positives

A false positive occurs when legitimate traffic is blocked:

1. **Monitor Events**: Review Security > Analytics for rate limit blocks
2. **Check URLs**: Are the blocked URLs legitimate?
3. **Check IPs**: Are the blocked IPs from known good sources?
4. **Check Timing**: Do blocks correlate with known legitimate activity?

**Example False Positive Detection**:
- Office IP X.X.X.X blocked at 10:00 AM
- Know that office team was testing deployment at that time
- Rate limit was too strict for that legitimate activity
- Solution: Increase rate limit or create exception for office IP

### Monitoring Frequency

- **Phase 1 (Current)**: Check events daily for first week
- **Phase 2 (Post-Launch)**: Monitor continuously for first month
- **Ongoing**: Weekly review of rate limit events

---

## Testing Rate Limiting

### Testing Normal Traffic

To verify the rate limit doesn't block normal browsing:

```bash
# Single request should succeed
curl -I https://sebc.dev
# Expected: HTTP 200 OK
```

### Testing Rate Limit Blocking

To verify the rate limit actually blocks excess traffic:

**IMPORTANT**: Only test from non-production IPs. Do NOT test from production traffic.

```bash
# Simulate rapid requests (from test machine, NOT from production)
# This will exceed 100 req/min and trigger the rate limit

for i in {1..110}; do
  curl -I https://sebc.dev 2>&1 | grep -E "HTTP|429"
  sleep 0.05  # Small delay between requests
done

# Expected output:
# HTTP/2 200 (first ~100 requests)
# HTTP/2 429 (Too Many Requests) for requests after 100
```

### Interpreting Test Results

**Expected behavior**:
- First ~100 requests: HTTP 200 (Success)
- Requests 101+: HTTP 429 (Too Many Requests)
- After 1 minute: Reset and counter starts again

**If you see HTTP 429 too early** (before 100 requests):
- Rate limit might be stricter than expected (unusual on Free plan)
- Check dashboard configuration
- May need to adjust or reload

**If you never see HTTP 429**:
- Rate limit may not be applied correctly
- Verify rule is "Enabled" in dashboard
- Check that rule expression is "All incoming requests"
- Try again after a minute or two (rules may have caching)

### Safety Precautions

- ⚠️ Only test from non-production IPs
- ⚠️ Test during low-traffic periods
- ⚠️ Alert team before testing
- ⚠️ Keep test duration short (< 1 minute total)
- ⚠️ Do NOT test from production user IPs

---

## Troubleshooting

### Rate Limiting Not Blocking Attacks

If the rate limit is not blocking obvious bot traffic:

1. **Verify Rule is Enabled**:
   - Navigate to: Dashboard > Security > WAF > Rate Limiting Rules
   - Check that "Global Rate Limit - Protection" shows "Enabled"
   - If not, click to enable

2. **Verify Rule Configuration**:
   - Click the rule to view details
   - Confirm:
     - Rate: 100 requests per 1 minute
     - Action: Block
     - Condition: All incoming requests

3. **Check Caching**:
   - Cloudflare may cache the rule configuration
   - Wait 30 seconds and test again

4. **Check for Exceptions**:
   - Verify no custom rules are bypassing the rate limit
   - Navigate to: Security > WAF > Custom rules
   - Check if any rules have "Allow" or "Skip" actions for the attacking IP

### Rate Limiting Blocking Legitimate Traffic

If legitimate users report "429 Too Many Requests":

1. **Increase Rate Limit**:
   - Edit the rule (as described in "Adjusting Rate Limits" section above)
   - Increase from 100 to 200-300 req/min temporarily
   - Monitor if false positives decrease

2. **Analyze Blocked IPs**:
   - Navigate to: Dashboard > Security > Analytics
   - Check which IPs are being blocked
   - Determine if they're legitimate (office, monitoring tools, partners)

3. **Create Exceptions**:
   - If blocked IPs are legitimate, create custom rule exceptions (see "Whitelisting Specific IPs" section)
   - Test that exceptions work

4. **Reduce Test Load**:
   - If you were testing, reduce test traffic
   - Ensure no automated tools are making excessive requests

### Rule Not Appearing in Dashboard

If the "Global Rate Limit - Protection" rule is not visible:

1. **Navigate Correctly**:
   - Dashboard > Security (left sidebar)
   - WAF (submenu)
   - Rate Limiting Rules (tab)
   - NOT "Custom rules" (that's different)

2. **Create Rule**:
   - If it doesn't exist, create it following configuration steps above

3. **Save Button**:
   - Ensure you clicked "Save" when creating
   - If unsaved, rule will not appear

### Emergency: Disable Rate Limiting

If rate limiting is causing critical issues:

1. **Navigate to**: Dashboard > Security > WAF > Rate Limiting Rules
2. **Find Rule**: "Global Rate Limit - Protection"
3. **Disable**: Click toggle or action menu > Disable
4. **Verify**: Rule status should change to "Disabled"
5. **Recovery**: Immediate (takes seconds)

After disabling:
- Investigate the issue
- Review Security Events for what triggered it
- Document findings
- Plan fix and re-enable once safe

---

## Configuration History

This section documents rate limiting changes as the project evolves:

| Date       | Commit   | Change                                                               |
| ---------- | -------- | -------------------------------------------------------------------- |
| 2025-11-15 | Commit 2 | Configure Global Rate Limit: 100 req/min per IP, Block action       |

---

## Related Documentation

- **WAF Configuration**: `docs/security/waf-configuration.md` - Main WAF documentation
- **Custom WAF Rules**: `docs/security/custom-waf-rules.md` - Custom rule patterns (Phase 1 Commit 3)
- **Security README**: `docs/security/README.md` - Security infrastructure overview
- **Dashboard Access**: `docs/deployment/cloudflare-dashboard-access.md` - Team guide for dashboard access (Phase 1 Commit 4)

---

## Contact & Support

For questions about rate limiting configuration:

- **Cloudflare Documentation**: https://developers.cloudflare.com/waf/rate-limiting-rules/
- **Rate Limit Best Practices**: https://developers.cloudflare.com/waf/best-practices/
- **Cloudflare Support**: https://support.cloudflare.com/
- **Internal Team**: Contact via project communication channel

---

## Document Metadata

- **Written by**: Phase 1 Implementation (Story 0.9)
- **Reviewed by**: TBD
- **Classification**: Security Documentation
- **Plan**: Cloudflare Free Plan
- **Audience**: DevOps, Security Engineers, Team Members
- **Last Updated**: 2025-11-15
