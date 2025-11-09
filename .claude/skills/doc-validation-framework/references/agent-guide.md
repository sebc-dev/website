---
created: 2025-11-05T00:00
updated: 2025-11-05T00:00
title: Guide d'Implémentation - Agent de Validation de Documents
status: guide
---

# Guide d'Implémentation - Agent de Validation de Documents

## Overview

Ce guide montre comment **implémenter un agent IA** qui utilise le `GENERIC_VALIDATION_FRAMEWORK.md` pour générer automatiquement des checklists de validation pour n'importe quel document technique.

---

## Architecture Globale

```
┌─────────────────────────────┐
│   Document à valider        │
│   (Architecture_technique.md)│
└──────────────┬──────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│     AGENT DE VALIDATION              │
│  (Claude / Autre LLM)                │
│                                      │
│  Phase 1: Analyse du document        │
│  Phase 2: Extraction des concepts    │
│  Phase 3: Identification des sources │
│  Phase 4: Génération du checklist    │
└──────────────┬───────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│   VALIDATION CHECKLIST                 │
│   (Markdown structuré)                 │
│                                        │
│   - Domaines identifiés                │
│   - Propriétés à vérifier              │
│   - Sources de validation              │
│   - Questions détaillées               │
└────────────────────────────────────────┘
```

---

## Prompt Système pour Agent IA

Ce prompt guide l'agent pour générer des checklists de validation :

```
# SYSTEM PROMPT FOR VALIDATION AGENT

You are a Technical Documentation Validation Agent. Your role is to:

1. **Analyze** technical documents for technical accuracy and freshness
2. **Extract** all technical claims and assertions
3. **Generate** comprehensive validation checklists
4. **Identify** external sources to verify claims
5. **Structure** findings in a clear, actionable checklist format

## Your Process

### Phase 1: Document Analysis
- Read and understand the entire document
- Identify all technical concepts mentioned
- Distinguish facts from opinions
- Note version numbers, dates, and specific claims
- Map technical dependencies and relationships

### Phase 2: Concept Extraction
Extract each technical concept as:
```

Technology: [Name]
Type: [Framework/Library/Service/Pattern/Architecture]
Document Mentions: [Where in document]
Claimed Properties: [What is asserted about it]
Criticality: [Fundamental/Major/Secondary]

````

### Phase 3: Property Validation Mapping
For each claimed property, categorize it:
- Type 1: Version properties (e.g., "Next.js 15.0+")
- Type 2: Availability properties (e.g., "Feature is GA")
- Type 3: Support properties (e.g., "X supports Y")
- Type 4: Recommendation properties (e.g., "X is best practice")
- Type 5: Deprecation properties (e.g., "X is obsolete")
- Type 6: Limitation properties (e.g., "Max 2MB per row")
- Type 7: Pattern properties (e.g., "Server-first approach")
- Type 8: Integration properties (e.g., "A → B → C chain")

### Phase 4: Source Identification
For each property to validate:
- Find the official documentation URL
- Identify official blog posts / announcements
- Note GitHub repositories involved
- List community resources
- Mark deprecation timelines

### Phase 5: Checklist Generation
Structure output as:

## [Domain Name]

### [Subdomain]
- [ ] **[Property Name]**: [Description]
  - Source: [Official URL]
  - To Verify:
    - [Question 1]
    - [Question 2]
    - [Question 3]
  - Criticality: [Level]

## Guidelines

- **Be Comprehensive**: No technical claim should be left unverified
- **Be Specific**: Questions should be answerable with a Yes/No or specific fact
- **Be Traceable**: Every claim needs an official source
- **Be Organized**: Group by domain, order by criticality
- **Be Forward-Looking**: Flag potential deprecated/changing items

## Output Format

Always produce Markdown with:
1. YAML front matter with metadata
2. Table of contents
3. Numbered sections for each domain
4. External research section
5. Quick reference table
6. Notes section

## Example Section Structure

```markdown
## 1. Framework & Runtime

### 1.1 Next.js
- [ ] **Next.js 15.0+**: Latest stable version correct?
  - Source: https://nextjs.org/releases
  - To Verify:
    - Current release version as of Nov 2025
    - Major changes from v14
    - Support timeline
  - Criticality: Fundamental
````

## Important

- Focus on factual claims, not opinions
- Include both positive (supported) and negative (deprecated) checks
- When info conflicts between sources, flag for human review
- Always include a "Research Priority" section at end

```

---

## Prompt d'Invocation pour l'Agent

Quand l'utilisateur veut valider un document :

```

Analyze the following technical document and generate a comprehensive
validation checklist using the Generic Validation Framework.

Document Path: [path]
Document Type: [architecture|design|guide|spec|config]
Project Context: [Brief description of project]

Please:

1. Extract all technical claims and concepts
2. Identify validation sources for each claim
3. Generate a structured markdown checklist
4. Include external validation section
5. Add quick reference table
6. Flag critical items needing verification

Output should be production-ready and saved to:
docs/validation/[DOCUMENT_NAME]\_VALIDATION_CHECKLIST.md

````

---

## Workflow d'Implémentation

### Step 1: Setup Agent Infrastructure

```python
# pseudocode
class ValidationAgent:
    def __init__(self):
        self.model = "claude-opus"  # or latest model
        self.system_prompt = load_system_prompt()
        self.framework = load_framework()

    def analyze_document(self, doc_path, doc_type):
        """Main entry point"""
        content = read_file(doc_path)

        # Phase 1: Extract concepts
        concepts = self.extract_concepts(content)

        # Phase 2: Map properties
        properties = self.map_properties(concepts)

        # Phase 3: Find sources
        sources = self.identify_sources(properties)

        # Phase 4: Generate checklist
        checklist = self.generate_checklist(
            concepts, properties, sources
        )

        return checklist

    def extract_concepts(self, content):
        """Use LLM to extract technical concepts"""
        prompt = f"""
        Extract all technical concepts from this document.
        For each, provide: name, type, mentions, properties, criticality
        """
        return self.llm_call(prompt, content)

    def map_properties(self, concepts):
        """Categorize properties by type"""
        # Maps each property to Type 1-8
        pass

    def identify_sources(self, properties):
        """Find official sources for each property"""
        # Searches for official docs, blogs, repos
        pass

    def generate_checklist(self, concepts, properties, sources):
        """Generate structured markdown checklist"""
        # Produces final markdown output
        pass
````

### Step 2: Configure External Sources

```yaml
# validation_sources.yaml

frameworks:
  next_js:
    official_docs: 'https://nextjs.org/docs'
    releases: 'https://nextjs.org/releases'
    github: 'https://github.com/vercel/next.js'
    blog: 'https://nextjs.org/blog'

  react:
    official_docs: 'https://react.dev'
    github: 'https://github.com/facebook/react'
    blog: 'https://react.dev/blog'

  cloudflare:
    workers_docs: 'https://developers.cloudflare.com/workers/'
    d1_docs: 'https://developers.cloudflare.com/d1/'
    r2_docs: 'https://developers.cloudflare.com/r2/'
    blog: 'https://blog.cloudflare.com/'
    community: 'https://community.cloudflare.com/'

orm:
  drizzle:
    official: 'https://orm.drizzle.team/'
    github: 'https://github.com/drizzle-team/drizzle-orm'
    docs: 'https://orm.drizzle.team/docs'

i18n:
  next_intl:
    official: 'https://next-intl-docs.vercel.app/'
    github: 'https://github.com/amannn/next-intl'

ui:
  shadcn_ui:
    official: 'https://ui.shadcn.com/'
    github: 'https://github.com/shadcn-ui/ui'
  tailwind:
    official: 'https://tailwindcss.com/'
    docs: 'https://tailwindcss.com/docs'

testing:
  vitest:
    official: 'https://vitest.dev/'
    github: 'https://github.com/vitest-dev/vitest'
  playwright:
    official: 'https://playwright.dev/'
    github: 'https://github.com/microsoft/playwright'
```

### Step 3: Define Extraction Patterns

```python
# extraction_patterns.py

PATTERNS = {
    "version_claim": r"(\w+)\s+(\d+\.\d+[\.\d]*)\+?",
    "feature_claim": r"(supports|includes|provides|compatible with|works with)",
    "deprecation_claim": r"(obsolete|deprecated|archived|no longer|replaced by)",
    "recommendation_claim": r"(recommended|best practice|should use|avoid using)",
    "limitation_claim": r"(limited to|max|minimum|cannot|not supported)",
}

def extract_claims(text):
    """Extract factual claims using patterns"""
    claims = []
    for pattern_type, pattern in PATTERNS.items():
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            claims.append({
                'type': pattern_type,
                'text': match.group(0),
                'position': match.span()
            })
    return claims
```

### Step 4: Web Research Integration

```python
# research_module.py

class ResearchModule:
    def research_property(self, property_name, source_urls):
        """
        Search online for information about property
        Returns: findings, latest info, potential issues
        """
        findings = {}

        for url in source_urls:
            try:
                content = fetch_with_cache(url)
                relevant_sections = extract_relevant_sections(
                    content,
                    property_name
                )
                findings[url] = {
                    'status': 'found',
                    'relevant_sections': relevant_sections,
                    'last_updated': get_page_date(url),
                    'confidence': assess_confidence(relevant_sections)
                }
            except Exception as e:
                findings[url] = {
                    'status': 'error',
                    'error': str(e)
                }

        return findings

    def identify_breaking_changes(self, technology, versions):
        """Find breaking changes between versions"""
        # Searches release notes and changelogs
        pass

    def find_alternatives(self, technology):
        """Find competing/alternative technologies"""
        # Identifies what else exists for same purpose
        pass
```

### Step 5: Output Formatting

```python
# output_formatter.py

class ChecklistFormatter:
    def format_markdown(self, checklist_data):
        """Format as structured markdown"""

        md = self._header(checklist_data)
        md += self._toc(checklist_data)
        md += self._introduction(checklist_data)

        for domain in checklist_data['domains']:
            md += self._format_domain(domain)

        md += self._external_research_section(checklist_data)
        md += self._quick_reference_table(checklist_data)
        md += self._notes_section(checklist_data)

        return md

    def _format_domain(self, domain):
        """Format a single domain section"""
        md = f"\n## {domain['number']}. {domain['name']}\n\n"

        for tech in domain['technologies']:
            md += f"### {domain['number']}.{tech['sub_number']} {tech['name']}\n\n"

            for prop in tech['properties']:
                md += f"- [ ] **{prop['name']}**: {prop['description']}\n"
                md += f"  - Source: {prop['source']}\n"
                md += f"  - To Verify:\n"
                for q in prop['questions']:
                    md += f"    - {q}\n"
                md += f"  - Criticality: {prop['criticality']}\n\n"

        return md

    def _quick_reference_table(self, checklist_data):
        """Generate summary table"""
        md = "\n## Quick Reference\n\n"
        md += "| Domain | Items | Status |\n"
        md += "|--------|-------|--------|\n"

        for domain in checklist_data['domains']:
            item_count = sum(len(t['properties'])
                           for t in domain['technologies'])
            md += f"| {domain['name']} | {item_count} | [ ] |\n"

        return md
```

---

## Workflow d'Utilisation

### Pour l'Utilisateur

```bash
# 1. Demander à l'agent de valider un document
$ agent validate --doc docs/specs/Architecture_technique.md --type architecture

# Output créé automatiquement:
$ docs/validation/Architecture_technique_VALIDATION_CHECKLIST.md

# 2. Parcourir le checklist généré
# 3. Faire les recherches indiquées
# 4. Cocher les cases au fur et à mesure
# 5. Documenter les incohérences trouvées

# 6. Générer un rapport (optionnel)
$ agent report --checklist docs/validation/Architecture_technique_VALIDATION_CHECKLIST.md
```

### Pour l'Agent (Itérations Futures)

```
Phase 1: Generate Checklist
├─ Extract concepts
├─ Map properties
├─ Identify sources
└─ Generate markdown

Phase 2: Research (Optional)
├─ Fetch documentation
├─ Identify breaking changes
├─ Find alternatives
└─ Check deprecations

Phase 3: Validate (Optional)
├─ For each item, search & verify
├─ Mark as valid/invalid/needs review
├─ Note findings
└─ Generate report

Phase 4: Report (Optional)
├─ Summarize findings
├─ Flag critical issues
├─ Suggest updates
└─ Generate recommendations
```

---

## Exemple Complet : De Document à Checklist

### Input

```
Document: docs/specs/Architecture_technique.md
Type: technical_architecture
Project: sebc.dev
```

### Processing

```
Agent reads document:
- Identifies 45 technical concepts
- Extracts 127 factual claims
- Maps to 8 property types
- Identifies 25 external sources
- Groups into 12 domains

Generates checklist with:
- 12 main sections
- 89 validation items
- 250+ verification questions
- 45 research links
```

### Output

```markdown
# Architecture_technique.md - Validation Checklist

[Generated by Validation Agent]
[Full checklist structure...]

## 1. Framework & Runtime

### 1.1 Next.js

- [ ] **Next.js 15.0+**: Latest version?
  - Source: https://nextjs.org/releases
  - To Verify:
    - Current version November 2025
    - Breaking changes from v14
    - Support timeline
  - Criticality: Fundamental

[... 88 more items ...]

## 12. Quick Reference

| Domain | Items | Status |
[... table ...]

## Research Priority

1. Verify Next.js 15 latest version
2. Check OpenNext compatibility
3. Verify D1 maturity status
4. Check next-intl with App Router
   [... priority list ...]
```

---

## Considérations Techniques

### Caching & Performance

```python
# Cache résultats pour éviter re-fetches
class CachedResearch:
    def __init__(self, cache_ttl=3600):  # 1 hour
        self.cache = {}
        self.ttl = cache_ttl

    def get_or_fetch(self, url):
        cached = self.cache.get(url)
        if cached and not self.is_expired(cached):
            return cached['data']

        data = fetch_url(url)
        self.cache[url] = {
            'data': data,
            'timestamp': time.time()
        }
        return data

    def is_expired(self, cached_item):
        age = time.time() - cached_item['timestamp']
        return age > self.ttl
```

### Error Handling

```python
# Handle missing/broken sources gracefully
def fetch_source(url, fallback_action='flag_for_review'):
    try:
        return fetch_url(url)
    except RequestException:
        if fallback_action == 'flag_for_review':
            return {
                'status': 'unreachable',
                'action': 'manual_verification_required'
            }
        elif fallback_action == 'skip':
            return None
```

### Multi-Language Support

```python
# Generate checklists in multiple languages
def translate_checklist(checklist_en, target_lang='fr'):
    """Translate checklist while preserving technical terms"""
    translated = {}
    for section in checklist_en:
        translated[section] = {
            'name': translate(section['name'], target_lang),
            'items': [
                {
                    'name': keep_original(item['name']),  # Tech terms stay same
                    'description': translate(item['description'], target_lang),
                    'questions': [translate(q, target_lang) for q in item['questions']]
                }
                for item in section['items']
            ]
        }
    return translated
```

---

## Intégration CI/CD (Futur)

```yaml
# .github/workflows/validate-docs.yml

name: Validate Technical Documentation

on:
  pull_request:
    paths:
      - 'docs/**/*.md'
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Validation Agent
        run: |
          pip install validation-agent

      - name: Detect Changed Docs
        id: changed
        run: |
          echo "documents=$(git diff --name-only HEAD~1 | grep docs/ | grep .md)" >> $GITHUB_OUTPUT

      - name: Generate Checklists
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          for doc in ${{ steps.changed.outputs.documents }}; do
            validation-agent generate --doc "$doc"
          done

      - name: Commit Checklists
        run: |
          git add docs/validation/*_VALIDATION_CHECKLIST.md
          git commit -m "docs: auto-generate validation checklists" || true

      - name: Generate Report
        run: |
          validation-agent report --all
          echo "See validation report in artifacts"

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: validation-report
          path: docs/validation/VALIDATION_REPORT.md
```

---

## Métriques & Monitoring

```python
# Track validation quality over time
class ValidationMetrics:
    def calculate_metrics(self, checklist):
        return {
            'total_items': len(checklist.all_items),
            'verified_items': len(checklist.verified_items),
            'coverage': len(checklist.verified_items) / len(checklist.all_items),
            'source_quality': self.assess_source_quality(checklist),
            'freshness': self.assess_freshness(checklist),
            'critical_issues': len(checklist.critical_issues),
            'deprecation_warnings': len(checklist.deprecation_warnings),
        }

    def generate_health_report(self, metrics):
        """Green/Yellow/Red based on thresholds"""
        status = {}
        if metrics['coverage'] >= 0.90:
            status['coverage'] = 'green'
        elif metrics['coverage'] >= 0.70:
            status['coverage'] = 'yellow'
        else:
            status['coverage'] = 'red'
        # ... similar for other metrics
        return status
```

---

## Conclusion

Ce guide fournit une **roadmap complète** pour implémenter un agent de validation de documents.

**Points clés:**

1. ✅ Système de prompt clair pour diriger l'agent
2. ✅ Architecture modulaire et extensible
3. ✅ Integration avec sources externes
4. ✅ Format de sortie standardisé
5. ✅ Possibilités d'automatisation CI/CD

**Prochaines étapes:**

- Implémenter le core agent
- Tester sur divers types de documents
- Raffiner les prompts basé sur feedback
- Ajouter web research capabilities
- Mettre en place le reporting système
