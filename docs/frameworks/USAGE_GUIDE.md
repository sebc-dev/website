# Document Validation Framework - Usage Guide

**Last Updated**: 2025-11-05
**Framework Version**: 1.0
**Status**: Production Ready

---

## Quick Start (5 minutes)

### Step 1: Generate a Checklist

In Claude Code, type:

```bash
/generate-checklist docs/specs/Architecture_technique.md
```

This will:

1. ✅ Load the validation framework methodology
2. ✅ Analyze the document
3. ✅ Extract concepts and properties
4. ✅ Generate a 80-150 item checklist
5. ✅ Save to: `Architecture_technique.md.validation-checklist.md`

**Time needed**: 5-15 minutes depending on document size

### Step 2: Review the Generated Checklist

Open the generated file to see:

- Quick Reference table (criticality distribution)
- Validation items organized by domain
- Checkboxes for each item
- Research sources for verification

### Step 3: Export to Research Agent

Copy the Markdown content and paste into:

- **Gemini**: https://gemini.google.com
- **ChatGPT**: https://chat.openai.com
- **Any other agent**: That supports Markdown

### Step 4: Let Agent Research Items

Prompt the agent with something like:

```
Here is a validation checklist for a technical document.
Please research each item using the provided sources.
For each item, report:
1. Whether the claim is valid/current
2. Any version changes needed
3. Any breaking changes discovered
4. Additional notes or recommendations

Provide your findings in a structured report.

[Paste the checklist Markdown here]
```

### Step 5: Review and Update

Review the agent's findings and:

- Update documentation with corrections
- Note version changes
- Track breaking changes
- Plan for deprecations

---

## Detailed Usage Examples

### Example 1: Validate Architecture Documentation

**Goal**: Ensure Architecture_technique.md is current

**Step 1: Generate Checklist**

```bash
/generate-checklist docs/specs/Architecture_technique.md
```

**Output Structure**:

```markdown
# Architecture_technique.md - Validation Checklist

## Quick Reference

| Criticality | Count | %    |
| ----------- | ----- | ---- |
| Fundamental | 23    | 18%  |
| Major       | 45    | 35%  |
| Secondary   | 59    | 47%  |
| Total       | 127   | 100% |

## Validation Checklist by Domain

### Domain 1: Framework & Runtime (15 items)

- [ ] Is Next.js 15.0+ the current version?
  - Type: Version
  - Source: https://nextjs.org/releases
  - Research: Check latest version, breaking changes

- [ ] Are React Server Components recommended?
  - Type: Recommendation
  - Source: https://react.dev/blog
  - Research: Check current best practices

### Domain 2: Database & ORM (12 items)

... (continues for all 12 domains)

## Research Sources

### Next.js

- Official Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js
- Releases: https://nextjs.org/releases

### Cloudflare D1

... (all technologies)

## Notes & Findings

[Space for documenting findings]
```

**Step 2: Export to Agent**
Copy the entire checklist and send to Gemini/ChatGPT

**Step 3: Agent Researches Items**
Agent visits each source URL and validates claims

**Step 4: Review Findings Report**
Agent provides structured findings like:

```
VALIDATION REPORT - Architecture_technique.md

✅ VALID CLAIMS:
- Next.js 15.0+ is correct (current version: 15.1.0)
- React Server Components are recommended
- Cloudflare D1 is production-ready

⚠️ REQUIRES UPDATES:
- OpenNext adapter: Version 3.2 is now available (was 3.0)
- Tailwind CSS: New version 4.0 has breaking changes

❌ DEPRECATED/CHANGED:
- Class components still supported (contrary to some docs)
- Create React App is still maintained

RECOMMENDATIONS:
1. Update OpenNext version reference
2. Document breaking changes for Tailwind 4.0
3. Clarify Class component support timeline
```

**Step 5: Update Documentation**
Update docs based on agent's findings

---

### Example 2: Validate Framework Documentation

**Goal**: Ensure the validation framework itself is accurate

**Step 1: Generate Checklist**

```bash
/generate-checklist docs/frameworks/GENERIC_VALIDATION_FRAMEWORK.md
```

**What gets validated**:

- Framework methodology accuracy
- 8 property types relevance
- 12 domains appropriateness
- 3 criticality levels alignment
- Process steps completeness

**Example checklist items**:

- [ ] Are the 8 property types comprehensive?
- [ ] Do the 12 domains cover all technical areas?
- [ ] Is the criticality distribution realistic?
- [ ] Are the examples current?
- [ ] Is the methodology aligned with industry practices?

---

## Use Cases

### Use Case 1: Before Major Migration

**Scenario**: Planning to migrate from one framework to another

**Why validate**:

- Ensure documentation is accurate
- Identify version mismatches
- Detect breaking changes
- Plan for deprecations

**Steps**:

1. `/generate-checklist docs/specs/Architecture_technique.md`
2. Let agent research current versions
3. Review compatibility with new framework
4. Plan migration accordingly

---

### Use Case 2: Monthly Documentation Audit

**Scenario**: Keep documentation fresh monthly

**Steps**:

1. First Monday of month: `/generate-checklist docs/specs/*.md`
2. Send checklists to agent for research
3. Collect findings in structured report
4. Schedule documentation updates
5. Create PRs for necessary updates
6. Track validation completion

---

### Use Case 3: Documentation Review Process

**Scenario**: Add validation to PR review

**Steps**:

1. When docs are modified
2. Generate checklist for changed file
3. Have reviewer use checklist to verify claims
4. Run against external agent for automated check
5. Merge only if validation passes

---

### Use Case 4: Onboarding New Team Members

**Scenario**: Help new member understand current stack

**Steps**:

1. Generate checklist for Architecture_technique.md
2. Share with new member
3. New member researches items using provided sources
4. Learns about current stack through validation
5. Generates report as learning exercise

---

## Checklist Item Types Explained

### Type 1: Version Claims

**Example Item**:

```markdown
- [ ] Is Next.js version 15.0+ current?
  - Type: Version
  - Source: https://nextjs.org/releases
  - Research: Check latest version released, any breaking changes
```

**What to research**:

- Is this version current?
- When was it released?
- Are there newer versions?
- Any breaking changes?

---

### Type 2: Availability Claims

**Example Item**:

```markdown
- [ ] Is Cloudflare D1 production-ready?
  - Type: Availability
  - Source: https://developers.cloudflare.com/d1/
  - Research: Check GA status, SLA availability, known limitations
```

**What to research**:

- What is current status (Alpha/Beta/GA)?
- Are there limitations?
- What's the SLA?
- Any caveats for production use?

---

### Type 3: Support Claims

**Example Item**:

```markdown
- [ ] Does Next.js support WebAssembly?
  - Type: Support
  - Source: https://nextjs.org/docs
  - Research: Check documentation and examples
```

**What to research**:

- Is feature still supported?
- Any known issues?
- Performance considerations?
- Alternative approaches?

---

### Type 4: Recommendation Claims

**Example Item**:

```markdown
- [ ] Are Server Components the recommended approach?
  - Type: Recommendation
  - Source: https://react.dev/blog
  - Research: Check latest React recommendations
```

**What to research**:

- Is this still best practice?
- Any caveats?
- When did this become recommended?
- Any alternatives?

---

### Type 5: Deprecation Claims

**Example Item**:

```markdown
- [ ] Are class components deprecated?
  - Type: Deprecation
  - Source: https://react.dev/reference/react/Component
  - Research: Check deprecation timeline and migration path
```

**What to research**:

- What is deprecation status?
- When will it be removed?
- What's the migration path?
- Are there still use cases?

---

### Type 6: Limitation Claims

**Example Item**:

```markdown
- [ ] Is 2MB the correct bundle size limit?
  - Type: Limitation
  - Source: https://nextjs.org/docs/app/building-your-application/optimizing
  - Research: Verify current limit and any exceptions
```

**What to research**:

- What are exact current limits?
- Are there exceptions?
- How to handle large bundles?
- Performance impact?

---

### Type 7: Pattern Claims

**Example Item**:

```markdown
- [ ] Is server-first rendering the recommended pattern?
  - Type: Pattern
  - Source: https://nextjs.org/docs/app
  - Research: Check if pattern is still recommended
```

**What to research**:

- Is pattern still recommended?
- When did it become standard?
- What are alternatives?
- Trade-offs involved?

---

### Type 8: Integration Claims

**Example Item**:

```markdown
- [ ] Does Next.js → Cloudflare → D1 integration work?
  - Type: Integration
  - Source: https://developers.cloudflare.com/pages/framework-guides/nextjs/
  - Research: Verify integration status, known issues, version compatibility
```

**What to research**:

- Does integration still work?
- Version compatibility?
- Known issues?
- Performance characteristics?

---

## Domains Explained

### Framework & Runtime (15 items)

- Next.js version and features
- React version and paradigm
- Runtime environment
- Adapters and compatibility

### Database & ORM (12 items)

- Database technology choices
- ORM library features
- Schema design approach
- Migration strategy

### Storage & Media (10 items)

- File storage solution
- CDN configuration
- Image optimization
- Asset management

### Authentication & Security (12 items)

- Auth method (OAuth, JWT, etc.)
- Security headers
- Encryption approach
- Compliance requirements

### Internationalization (8 items)

- i18n library choice
- Multi-language support
- Language switching
- Regional customization

### Content & Rendering (15 items)

- Rendering strategy (SSR, CSR, SSG)
- Content sources
- Data fetching approach
- Caching strategy

### UI & Styling (12 items)

- CSS approach (Tailwind, CSS modules)
- Component library
- Design system
- Theming support

### Testing (10 items)

- Test framework
- Testing strategy
- Test coverage
- Testing tools

### Deployment & CI/CD (15 items)

- Deployment platform
- CI/CD tool
- Environment management
- Release process

### Infrastructure & Monitoring (10 items)

- Monitoring solution
- Logging infrastructure
- Error tracking
- Performance monitoring

### Performance & Web Vitals (12 items)

- Web Vitals targets
- Bundle size limits
- Load time targets
- Optimization strategies

### Architecture Patterns (12 items)

- Architectural style
- API design patterns
- State management
- Design patterns used

---

## Best Practices

### 1. Be Systematic

- Start with Fundamental items (highest priority)
- Then Major items
- Finally Secondary items
- Don't skip items

### 2. Use Official Sources

- Prefer official documentation
- Check GitHub releases for version info
- Trust status pages for service status
- Cross-reference multiple sources

### 3. Document Findings

- Note exactly what you found
- Include dates of research
- Link to specific documentation
- Note any caveats

### 4. Track Changes

- Mark items that need updates
- Note specific version changes
- Document breaking changes
- Plan remediation

### 5. Review Periodically

- Monthly audits recommended
- Update checklist as docs change
- Track trends over time
- Identify patterns

---

## Troubleshooting

### Issue: Checklist generation takes too long

**Solution**:

- Document might be very large
- Framework is doing thorough analysis
- Typical time is 5-15 minutes
- Larger documents may take 15-30 minutes
- This is normal and ensures quality

### Issue: Too many items in checklist

**Solution**:

- Framework targets 80-150 items (intentional)
- This ensures comprehensive validation
- Can be exported in batches if needed
- Focus on Fundamental items first

### Issue: Some questions seem unclear

**Solution**:

- Questions are designed to be researchable
- Use the provided sources
- Consult the framework documentation
- Questions improve with experience

### Issue: Research findings contradict documentation

**Solution**:

- This is expected and valuable finding
- Document the conflict clearly
- Research with additional sources
- Plan for documentation update
- This is the framework working as intended

---

## Tips & Tricks

### Tip 1: Batch Validation

Generate checklists for multiple documents:

```bash
/generate-checklist docs/specs/Architecture_technique.md
/generate-checklist docs/specs/UX_UI_Spec.md
/generate-checklist docs/frameworks/GENERIC_VALIDATION_FRAMEWORK.md
```

### Tip 2: Focus on Criticality

If time is limited:

1. Focus on Fundamental items first (15-20%)
2. Then Major items (30-40%)
3. Secondary items as time allows

### Tip 3: Team Validation

Assign different domains to team members:

- Person A: Framework & Runtime
- Person B: Database & Storage
- Person C: Auth & Security
- Etc.

### Tip 4: Scheduled Validations

Set monthly reminders:

- First Monday: Generate checklists
- Week 1: Send to research agent
- Week 2: Review findings
- Week 3-4: Update documentation

### Tip 5: Integration with CI/CD

Future Phase 2/3:

- Add validation to PR checks
- Auto-generate checklists on doc changes
- Integrate research agent findings
- Fail CI if critical issues found

---

## Next Steps

### Ready to Start?

1. Read `.claude/VALIDATION_FRAMEWORK_README.md` (overview)
2. Run `/generate-checklist docs/specs/Architecture_technique.md` (test)
3. Review generated checklist (understand structure)
4. Export to Gemini/ChatGPT (see research in action)
5. Review findings (learn about your documentation)

### Want to Understand Deeper?

1. Read `docs/frameworks/GENERIC_VALIDATION_FRAMEWORK.md` (methodology)
2. Review `.claude/skills/doc-validation-framework/SKILL.md` (expertise)
3. Check `docs/frameworks/AGENT_IMPLEMENTATION_GUIDE.md` (implementation)
4. Study `docs/frameworks/EXAMPLE_APPLICATION.md` (real example)

### Ready for Team Adoption?

1. Share this guide with team
2. Set up monthly validation schedule
3. Create team process for findings
4. Plan Phase 2 semi-automation
5. Build validation culture

---

## Support

For questions or issues:

1. Check `.claude/VALIDATION_FRAMEWORK_README.md`
2. Review framework SKILL.md for methodology
3. Consult this usage guide
4. Check example application
5. Review implementation guide for technical details

---

**Framework Status**: ✅ Production Ready
**Last Updated**: 2025-11-05
**Version**: 1.0
