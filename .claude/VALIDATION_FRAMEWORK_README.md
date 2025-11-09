# Document Validation Framework for Claude Code

**Status**: ✅ Production Ready
**Version**: 1.0
**Last Updated**: 2025-11-05

## Overview

The Document Validation Framework is now fully integrated into Claude Code. It provides a systematic, reusable methodology for generating comprehensive validation checklists for any technical document.

These checklists (80-150 items) can be exported to external AI agents (Gemini, ChatGPT) to perform automated research and produce validation reports.

## Quick Start

### Generate a Validation Checklist

```bash
/generate-checklist docs/specs/Architecture_technique.md
```

The command will:

1. ✅ Load the doc-validation-framework skill for methodology
2. ✅ Delegate to checklist-generator subagent for analysis
3. ✅ Generate a comprehensive Markdown checklist (80-150 items)
4. ✅ Organize items by domain and criticality
5. ✅ Identify research sources for validation
6. ✅ Save to: `docs/specs/Architecture_technique.md.validation-checklist.md`

### Framework Components

**Skill: `doc-validation-framework`**

- Location: `.claude/skills/doc-validation-framework/`
- Purpose: Encapsulates the complete validation methodology
- Invocation: Automatically loaded by the command
- References: See `SKILL.md` for expert guidance

**Subagent: `checklist-generator`**

- Location: `.claude/agents/checklist-generator.md`
- Purpose: Analyzes documents and generates checklists
- Expertise: Extracting 30-50 concepts and 80-150 properties
- Responsibility: Producing structured Markdown output

**Command: `/generate-checklist`**

- Location: `.claude/commands/generate-checklist.md`
- Usage: `/generate-checklist <document-path>`
- Role: Manual entry point that orchestrates the workflow

**Configuration: `validation-config.yaml`**

- Location: `.claude/validation-config.yaml`
- Purpose: Defines standards, domains, property types
- Customizable: Can be adjusted for your specific needs

## Framework Architecture

### 8 Property Types

When analyzing documents, the framework classifies claims into 8 types:

1. **Version** - Claims about specific versions (e.g., "Next.js 15.0+")
2. **Availability** - Claims about feature status (e.g., "GA")
3. **Support** - Claims about compatibility (e.g., "Supports X")
4. **Recommendation** - Claims about best practices (e.g., "Recommended")
5. **Deprecation** - Claims about obsolete features (e.g., "Deprecated")
6. **Limitation** - Claims about constraints (e.g., "2MB max")
7. **Pattern** - Claims about architecture (e.g., "Server-first")
8. **Integration** - Claims about component chains (e.g., "A → B → C")

### 3 Criticality Levels

Properties are prioritized based on architectural impact:

- **Fundamental (15-20%)** - Core architecture affecting everything
- **Major (30-40%)** - Important components with significant impact
- **Secondary (40-55%)** - Optimizations and nice-to-haves

### 12 Standard Domains

Documents are organized into these domains:

1. Framework & Runtime
2. Database & ORM
3. Storage & Media
4. Authentication & Security
5. Internationalization (i18n)
6. Content & Rendering
7. UI & Styling
8. Testing
9. Deployment & CI/CD
10. Infrastructure & Monitoring
11. Performance & Web Vitals
12. Architecture Patterns

## Generated Checklist Structure

A typical generated checklist includes:

```markdown
# Document Title - Validation Checklist

## Quick Reference

| Criticality | Count | %    |
| ----------- | ----- | ---- |
| Fundamental | 23    | 18%  |
| Major       | 45    | 35%  |
| Secondary   | 59    | 47%  |
| Total       | 127   | 100% |

## Validation Checklist by Domain

### Domain 1: Framework & Runtime (15 items)

#### Fundamental

- [ ] Is Next.js version 15.0+ confirmed?
  - Type: Version
  - Source: https://nextjs.org/releases
  - Research: Check latest release, breaking changes

#### Major

- [ ] Is the OpenNext adapter still maintained?
  - Type: Support
  - Source: https://github.com/...
  - Research: Check GitHub activity, maintenance status

### Domain 2: Database & ORM (12 items)

... (repeat for all domains)

## Research Sources

### Next.js

- Official Docs: https://nextjs.org/docs
- GitHub: https://github.com/vercel/next.js
- Releases: https://nextjs.org/releases

### Cloudflare D1

... (all technologies listed)

## Notes & Findings

- Space for documenting validation results
- Track updates, breaking changes, deprecations
```

## Usage Workflow

### Step 1: Generate Checklist (5-15 minutes)

```bash
/generate-checklist docs/specs/Architecture_technique.md
```

Output: `Architecture_technique.md.validation-checklist.md`

### Step 2: Export to Research Agent (1 minute)

Copy the generated Markdown checklist and share with external agent (Gemini, ChatGPT)

### Step 3: External Research (varies)

The external agent receives the checklist and:

- Researches each item using provided sources
- Collects findings and validation results
- Produces a validation report

### Step 4: Review & Update (varies)

Review findings and update documentation as needed

## Quality Standards

Generated checklists should meet these standards:

✅ **80-150 total items** - Comprehensive but manageable
✅ **8-15 domains** - Good organization
✅ **All 8 property types** - Complete classification
✅ **15-30 research sources** - Traceable claims
✅ **3 criticality levels** - Proper prioritization
✅ **Plain Markdown** - Portable and universal
✅ **External agent ready** - Works with Gemini, ChatGPT, etc.

## File Structure

```
.claude/
├── commands/
│   └── generate-checklist.md                    # Command entry point
├── skills/
│   └── doc-validation-framework/
│       ├── SKILL.md                             # Main skill with methodology
│       ├── references/
│       │   ├── methodology.md                   # Full framework documentation
│       │   ├── agent-guide.md                   # Agent implementation guide
│       │   ├── example.md                       # Real-world example
│       │   └── quick-start.md                   # Quick start guide
│       └── scripts/
│           └── checklist_template.md            # Markdown template
├── agents/
│   └── checklist-generator.md                   # Specialist subagent
└── validation-config.yaml                       # Configuration and standards
```

## Integration Points

### With Claude Code Ecosystem

- **Skill**: Autonomously invoked for validation expertise
- **Subagent**: Handles complex analysis with context isolation
- **Command**: Manual trigger for user control
- **Pattern**: Follows recommended Claude Code architecture patterns

### With External Agents

- **Format**: Plain Markdown (universal)
- **Completeness**: 80-150 items (comprehensive)
- **Clarity**: Specific questions for research
- **Sources**: 15-30 URLs for validation

## Evolution Roadmap

### Phase 1: Checklist Generation ✅ COMPLETE

- Generates 80-150 item checklists
- Manually triggered via `/generate-checklist`
- Ready for external agent research

### Phase 2: Semi-Automated Research (2-3 weeks)

- Agent performs web research on critical items
- Human reviews and consolidates findings
- Automated reporting with findings

### Phase 3: Full Automation (1-2 months)

- 100% automated validation end-to-end
- Scheduled regular validations
- Dashboard with metrics and status

## Examples

### Generate Checklist for Architecture Document

```bash
/generate-checklist docs/specs/Architecture_technique.md
```

### Generate Checklist for Framework Documentation

```bash
/generate-checklist docs/frameworks/GENERIC_VALIDATION_FRAMEWORK.md
```

### Generate Checklist for Any Technical Document

```bash
/generate-checklist @my-document.md
```

## For Framework Developers

### To Customize Domains

Edit `.claude/validation-config.yaml` and update the `standard_domains` section.

### To Adjust Property Types

Modify `property_types` in the configuration file.

### To Change Criticality Distribution

Update `distribution_target` in criticality_levels section.

### To Extend the Skill

Add new references to `.claude/skills/doc-validation-framework/references/`

## References

- **Generic Validation Framework**: `/docs/frameworks/GENERIC_VALIDATION_FRAMEWORK.md`
- **Implementation Plan**: `/docs/frameworks/IMPLEMENTATION_PLAN.md`
- **Agent Implementation Guide**: `/docs/frameworks/AGENT_IMPLEMENTATION_GUIDE.md`
- **Quick Start Guide**: `/docs/frameworks/QUICK_START.md`
- **Claude Code Architecture**: `/docs/tech/claude-code/cas_usage_outils.md`

## Support

For issues or questions about the framework:

1. Review the SKILL.md in the doc-validation-framework skill
2. Check the Quick Start guide
3. Review the Agent Implementation Guide for detailed methodology
4. Consult the example application for real-world usage

## Status

- **Framework Version**: 1.0
- **Implementation Status**: Production Ready ✅
- **Last Updated**: 2025-11-05
- **Tested With**: Architecture_technique.md, UX_UI_Spec.md
- **Ready for**: Phase 2 and Phase 3 planning

---

**Created with Claude Code - Document Validation Framework**
