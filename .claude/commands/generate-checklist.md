---
description: Generate comprehensive validation checklist for a technical document using the Document Validation Framework
argument-hint: <document-path>
allowed-tools:
  - Task
  - Read
---

# Generate Document Validation Checklist

## Context

This command orchestrates the generation of a comprehensive validation checklist for any technical document using the Document Validation Framework.

The workflow:
1. Load the doc-validation-framework skill for methodology
2. Delegate analysis to checklist-generator subagent
3. Generate structured Markdown checklist (80-150 items)
4. Save output for use by external research agents

## Task

Generate a comprehensive validation checklist for: **$1**

## Instructions

### Step 1: Load Framework Expertise
First, activate the `doc-validation-framework` skill to ensure you have the complete validation methodology available.

### Step 2: Delegate to Specialist
You will now delegate to the `checklist-generator` subagent, which is a specialized agent trained to:
- Analyze technical documents thoroughly
- Extract 30-50 technical concepts
- Identify 80-150 factual properties
- Classify into 8 property types
- Organize into 12 standard domains
- Assign criticality levels (Fundamental/Major/Secondary)
- Generate specific validation questions
- Identify research sources

### Step 3: Provide Document Path
The document to analyze is located at: **$1**

### Step 4: Generate Checklist
Instruct the checklist-generator subagent to:

1. Read and analyze the entire document
2. Extract all technical concepts mentioned
3. Identify factual properties that need validation
4. Classify each property into one of 8 types:
   - Type 1: Version (e.g., "Next.js 15.0+")
   - Type 2: Availability (e.g., "Feature is GA")
   - Type 3: Support (e.g., "Supports WebAssembly")
   - Type 4: Recommendation (e.g., "Best practice")
   - Type 5: Deprecation (e.g., "Obsolete feature")
   - Type 6: Limitation (e.g., "2MB max")
   - Type 7: Pattern (e.g., "Server-first rendering")
   - Type 8: Integration (e.g., "Next.js → Cloudflare → D1")

5. Organize properties into domains:
   - Framework & Runtime
   - Database & ORM
   - Storage & Media
   - Authentication & Security
   - Internationalization
   - Content & Rendering
   - UI & Styling
   - Testing
   - Deployment & CI/CD
   - Infrastructure & Monitoring
   - Performance & Web Vitals
   - Architecture Patterns

6. Assign criticality to each property:
   - Fundamental (15-20%): Core architecture affecting everything
   - Major (30-40%): Important components with significant impact
   - Secondary (40-55%): Optimizations and nice-to-haves

7. Generate validation questions that are:
   - Specific and measurable
   - Researchable via online sources
   - Clear and actionable

8. Identify research sources for each property:
   - Official documentation URLs
   - GitHub repositories
   - Blog posts / announcements
   - Status pages
   - Release notes

### Step 5: Checklist Format
The generated checklist must be structured as follows:

```markdown
# {DOCUMENT_TITLE} - Validation Checklist

**Document Path**: {DOCUMENT_PATH}
**Generated**: {DATE}
**Framework Version**: 1.0

## Quick Reference

| Criticality | Count | Percentage |
|---|---|---|
| Fundamental | X | X% |
| Major | X | X% |
| Secondary | X | X% |
| **Total** | **X** | **100%** |

## Validation Checklist by Domain

### Domain 1: {DOMAIN_NAME} (X items)

#### Fundamental Items
- [ ] {Question about property 1}
  - **Type**: {Property Type}
  - **Source**: {URL}
  - **Research**: {Hint for research}

- [ ] {Question about property 2}
  - **Type**: {Property Type}
  - **Source**: {URL}
  - **Research**: {Hint for research}

#### Major Items
- [ ] {Question}
  - **Type**: {Property Type}
  - **Source**: {URL}
  - **Research**: {Hint}

#### Secondary Items
- [ ] {Question}
  - **Type**: {Property Type}
  - **Source**: {URL}
  - **Research**: {Hint}

### Domain 2: {DOMAIN_NAME} (X items)
... (repeat for all domains)

## Research Sources

### {TECHNOLOGY_1}
- **Official Documentation**: {URL_OFFICIAL_DOCS}
- **GitHub Repository**: {URL_GITHUB}
- **Blog/Announcements**: {URL_BLOG}
- **Status Page**: {URL_STATUS}

### {TECHNOLOGY_2}
... (repeat for all identified technologies)

## Notes & Findings

### Items Requiring Updates
- List any items that need documentation updates

### Version Changes Detected
- List any outdated versions found

### Breaking Changes
- List any breaking changes discovered

### Deprecated Features
- List any deprecated features identified

## Validation Summary

- **Total Items Generated**: X
- **Fundamental Items**: X (X%)
- **Major Items**: X (X%)
- **Secondary Items**: X (X%)
- **Domains Covered**: X
- **Research Sources**: X
```

### Step 6: Quality Standards
The checklist must meet these standards:
- ✅ 80-150 total validation items
- ✅ 8-15 different domains represented
- ✅ All 8 property types represented
- ✅ 15-30 research sources identified
- ✅ Specific, measurable questions
- ✅ Plain Markdown format (no proprietary tools)
- ✅ Ready for external AI agents (Gemini, ChatGPT)

### Step 7: Save Output
Save the generated checklist to:
```
{DOCUMENT_DIRECTORY}/{DOCUMENT_NAME}.validation-checklist.md
```

For example:
- Input: `docs/specs/Architecture_technique.md`
- Output: `docs/specs/Architecture_technique.md.validation-checklist.md`

### Step 8: Confirmation
Once the checklist is generated, provide:
1. File path where checklist was saved
2. Summary statistics (total items, domain count, source count)
3. List of domains covered
4. List of key research sources identified

## Expected Outcome

A complete, production-ready validation checklist that:
- Can be imported into Markdown files or documents
- Can be exported to Gemini, ChatGPT, or other research agents
- Has clear checkboxes for each validation item
- Includes specific, researchable questions
- Lists all relevant research sources
- Is ready for Phase 2 (external research) and Phase 3 (full automation)

## Usage Examples

```bash
/generate-checklist docs/specs/Architecture_technique.md
/generate-checklist docs/frameworks/GENERIC_VALIDATION_FRAMEWORK.md
/generate-checklist @my-document.md
```

## Notes

- This command uses the `doc-validation-framework` skill for expertise
- The `checklist-generator` subagent handles the actual analysis
- Typical generation time: 5-15 minutes depending on document size
- Generated checklists are immediately usable by external research agents
- Framework is generic and works with ANY technical document type
