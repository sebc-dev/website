# Changelog

All notable changes to the Phase Documentation Generator skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-10-28

### 🎯 Adaptive Sizing: Removing Arbitrary Limits

This version removes the arbitrary "3-7 commits" limitation and introduces intelligent, complexity-based commit planning that reflects real-world development needs.

### Added

- **Adaptive Sizing Philosophy**:
  - Comprehensive section in SKILL.md explaining why commit count should reflect actual work
  - Complexity assessment scale: Simple (1-3), Medium (4-8), Complex (9-15), Very Complex (15+)
  - Focus on independence, value, safety, and reviewability over hitting arbitrary targets
  - Red flags (combining unrelated changes, artificial splitting, etc.)
  - Green lights (clear story, logical progression, independent validation)

- **Complexity-Based Commit Planning**:
  - Support for 1-20+ commits based on phase complexity
  - Four complexity levels with clear characteristics and guidance
  - Flexible sizing that adapts to actual work requirements
  - Updated Step 3 workflow to include complexity assessment

- **Enhanced Documentation**:
  - New "Adaptive Sizing" subsection in README's "Atomic Commit Philosophy"
  - Comprehensive examples across the complexity spectrum
  - Updated all references to "3-7" to reflect flexible approach
  - Added complexity assessment to "Plan Atomic Commits" step

### Changed

- **SKILL.md frontmatter**:
  - Updated description to mention "adaptive sizing (1-20+ commits)"
  - Version bumped to 2.2.0
  - Clarified that limits are based on complexity, not arbitrary rules

- **README.md**:
  - Line 14: "3-7 commits" → "adaptive sizing based on complexity"
  - Line 102: "3-7 phases" → "optimal number of phases (adaptive sizing based on complexity)"
  - Line 220: "3-7 independent commits" → "optimal number of independent commits (adaptive sizing: 1-20+ as needed)"
  - Line 258: Added complexity assessment scale to atomic commits planning
  - New comprehensive "Adaptive Sizing" section with red flags and green lights
  - Updated "What's New" section with 2.2.0 improvements

- **Atomic Commit Philosophy**:
  - Review time expanded from "15-60 min" to "15-90 min" to accommodate larger commits
  - Added complexity-based sizing guidelines
  - Emphasized that number should reflect actual work, not templates
  - More nuanced guidance on when to use different commit counts

### Improved

- **Flexibility**: No longer constrained by arbitrary "3-7" range
- **Realism**: Commit count reflects actual complexity of the work
- **Quality**: Focus on meaningful, reviewable, independent commits over hitting targets
- **Guidance**: Clear criteria for determining appropriate commit count
- **Examples**: Better representation of real-world scenarios (1 commit to 20+ commits)

### Philosophy Shift

**Before (2.1.0)**:

- Recommended 3-7 commits per phase
- Developers might artificially combine or split work to fit this range
- Less flexibility for very simple or very complex phases

**After (2.2.0)**:

- Adaptive sizing based on actual work complexity
- 1 commit for tiny fixes, 20+ for very complex features
- Focus on commit quality (independence, value, safety, reviewability)
- Clear guidance on red flags and green lights

### Migration Notes (from 2.1.0 to 2.2.0)

**Automatic Migration**:

- ✅ No action required for existing projects
- ✅ Existing documentation still valid
- ✅ Generated documentation format unchanged
- ✅ All functionality preserved and enhanced

**Behavioral Changes**:

- Skill may now generate plans with fewer than 3 commits (for simple phases)
- Skill may now generate plans with more than 7 commits (for complex phases)
- Commit count will better match actual work complexity
- Documentation will include complexity assessment rationale

**Benefits of Upgrading**:

- ✅ More realistic commit planning
- ✅ Better adaptation to actual work requirements
- ✅ Less artificial splitting or combining of work
- ✅ Clearer guidance on commit sizing decisions
- ✅ Improved quality through focus on meaningful commits

---

## [2.1.0] - 2025-10-28

### 🎯 Compliance with Claude Code Agent Skills Best Practices

This version brings the skill into full compliance with [Claude Code Agent Skills best practices](https://docs.claude.com/en/docs/claude-code/skills) and significantly improves discoverability, security, and usability.

### Added

- **Proper SKILL.md structure**:
  - YAML frontmatter with complete metadata (name, description, version, allowed-tools)
  - Enhanced description with **trigger keywords** for automatic invocation:
    - "generate phase documentation"
    - "create implementation docs"
    - "phase planning"
    - "atomic commits documentation"
    - "implementation guide"
  - Embedded all instructions and templates in single file
  - Added concrete usage examples at the end

- **Tool restrictions for safety**:
  - `allowed-tools: Read, Write, Glob, Grep, Bash`
  - Ensures skill only uses necessary tools for documentation generation
  - Prevents accidental misuse or unintended side effects

- **Model-invoked architecture explanation**:
  - Clear distinction between model-invoked (automatic) and user-invoked (manual)
  - Documentation on how Claude discovers and uses the skill
  - Benefits of composable, autonomous skills

### Changed

- **File structure modernization**:
  - `prompt.md` → `SKILL.md` (Claude Code standard)
  - Removed redundant `skill.json` (metadata now in YAML frontmatter)
  - Kept `prompt.md.backup` for reference
  - All metadata consolidated in `SKILL.md` frontmatter

- **Enhanced description for better discoverability**:
  - Before (v2.0.0): Generic description without trigger keywords
  - After (v2.1.0): Specific description with clear usage triggers
  - Includes "when to use" guidance for Claude's decision-making
  - Mentions supported tech stacks explicitly

- **Improved slash command documentation** (`.claude/commands/generate-phase-doc.md`):
  - Explains difference between automatic and manual invocation
  - Lists trigger keywords for natural language activation
  - Provides concrete examples of usage
  - Clearer step-by-step workflow
  - Added benefits of atomic commits
  - Updated all sections to English with better structure

- **Updated README.md**:
  - Added "How It Works" section explaining model-invoked architecture
  - Multiple invocation options clearly documented
  - File structure section with explanation of SKILL.md
  - Troubleshooting section for common issues
  - Version history and migration guide
  - What's new in 2.1.0 section

### Improved

- **Discoverability**: Enhanced description with trigger keywords makes Claude more likely to invoke skill automatically
- **Security**: Tool restrictions prevent skill from performing unintended operations
- **Standards compliance**: Follows official Claude Code Agent Skills format
- **Documentation**: Clearer, more comprehensive guides for users
- **Maintainability**: Single source of truth in SKILL.md (no split between skill.json and prompt.md)

### Migration Notes (from 2.0.0 to 2.1.0)

**Automatic Migration**:

- ✅ No action required for existing projects
- ✅ Old references to skill still work
- ✅ Generated documentation format unchanged
- ✅ All functionality preserved

**What Changed Under the Hood**:

```
Before (2.0.0):
.claude/skills/phase-doc-generator/
├── skill.json          # Metadata
├── prompt.md          # Instructions
└── README.md

After (2.1.0):
.claude/skills/phase-doc-generator/
├── SKILL.md           # ⭐ Metadata + Instructions (standard)
├── prompt.md.backup   # Legacy backup
└── README.md          # Enhanced documentation
```

**Benefits of Upgrading**:

- ✅ Better auto-invocation through improved description
- ✅ Safer execution with tool restrictions
- ✅ Standards-compliant structure
- ✅ Enhanced documentation and troubleshooting
- ✅ Future-proof for Claude Code updates

### Technical Details

**YAML Frontmatter Structure**:

```yaml
---
name: phase-doc-generator
description: |
  Generates comprehensive implementation documentation for software development phases.
  Creates 7 professional documents including atomic commit plans, checklists, environment setup,
  review guides, and testing strategies. Use when the user mentions "generate phase documentation",
  "create implementation docs", "phase planning", "atomic commits documentation", "implementation guide",
  or needs structured documentation for a development phase with step-by-step implementation plans.
  Supports any tech stack (Next.js, Django, React, Python, etc.).
version: 2.1.0
allowed-tools: Read, Write, Glob, Grep, Bash
---
```

**Why These Changes Matter**:

1. **Trigger Keywords**: Claude can now automatically discover and use this skill when users mention relevant terms
2. **Tool Restrictions**: Prevents skill from accidentally using tools like `Edit` or `KillShell`
3. **Standard Structure**: Aligns with Claude Code ecosystem and future updates
4. **Single Source**: SKILL.md contains everything; no risk of metadata/instructions mismatch

---

## [2.0.0] - 2025-10-28

### 🎉 Major Release: Complete Autonomy

This version makes the skill completely **project-agnostic** and **autonomous**. It can now be used on any software project without dependencies on specific documentation or project structure.

### Added

- **Complete documentation templates embedded in prompt.md**:
  - INDEX.md template with full structure
  - IMPLEMENTATION_PLAN.md template with atomic commit guidance
  - COMMIT_CHECKLIST.md template with detailed checklists
  - ENVIRONMENT_SETUP.md template for environment configuration
  - guides/REVIEW.md template for code review
  - guides/TESTING.md template for testing strategies
  - validation/VALIDATION_CHECKLIST.md template for final validation

- **Tech stack flexibility**:
  - Supports any framework (Next.js, Django, Express, React, etc.)
  - Supports any language (TypeScript, Python, JavaScript, etc.)
  - Supports any package manager (pnpm, npm, yarn, bun)
  - Supports any test framework (Vitest, Jest, pytest, etc.)
  - Supports any linter (Biome, ESLint, pylint, etc.)

- **Configuration system**:
  - Optional inputs for tech stack
  - Automatic inference from specification if not provided
  - Sensible defaults (pnpm, Vitest, Biome)

- **Documentation files**:
  - `spec-template.md`: Complete example specification template
  - Enhanced README with generic instructions
  - This CHANGELOG for tracking changes

### Changed

- **Prompt.md completely rewritten**:
  - No references to specific projects (sebc.dev removed)
  - All templates embedded directly
  - Generic examples that work for any project
  - Flexible validation commands based on stack

- **README.md updated**:
  - Generic installation instructions
  - Works for any project
  - Clear prerequisite documentation
  - Stack configuration examples
  - Multi-framework project support

- **skill.json updated**:
  - Version bumped to 2.0.0
  - Description emphasizes tech stack flexibility
  - Mentions support for any software project

### Removed

- **Project-specific references**:
  - Removed all mentions of "sebc.dev"
  - Removed references to specific Phase 1/Phase 2 docs
  - Removed hardcoded Next.js assumptions
  - Removed pnpm-only commands

- **External dependencies**:
  - No longer depends on existing project documentation
  - No longer requires Phase 1/2 as reference
  - Self-contained with all templates included

### Migration Guide (from 1.0.0 to 2.0.0)

**If you used version 1.0.0**:

1. **No breaking changes in usage**: The skill still works the same way
2. **More flexibility**: You can now specify your tech stack
3. **Better portability**: Copy skill to any project, it just works

**New workflow**:

```
Before (1.0.0): Required Phase 1/2 docs as reference
After (2.0.0): Completely autonomous, works anywhere
```

### Benefits of 2.0.0

✅ **Portable**: Copy to any project and use immediately
✅ **Autonomous**: No external documentation dependencies
✅ **Flexible**: Works with any tech stack
✅ **Generic**: Templates work for any software project
✅ **Maintained**: All templates in one place (prompt.md)

---

## [1.0.0] - 2024-10-XX

### Initial Release

- First version of Phase Documentation Generator
- Designed specifically for sebc.dev project
- Generates 7 documentation files
- Based on Phase 1 and Phase 2 reference docs
- Supports Next.js 16 + TypeScript stack
- Uses pnpm as package manager
- Atomic commit strategy (3-7 commits)

### Features

- INDEX.md generation
- IMPLEMENTATION_PLAN.md with atomic commits
- COMMIT_CHECKLIST.md with detailed tasks
- ENVIRONMENT_SETUP.md for configuration
- guides/REVIEW.md for code review
- guides/TESTING.md for testing
- validation/VALIDATION_CHECKLIST.md for final checks

### Limitations

- Hardcoded for sebc.dev project structure
- Required Phase 1/2 docs as reference
- Only supported Next.js + pnpm + Vitest stack
- Not portable to other projects

---

## Future Roadmap

### [2.2.0] - Planned

**Enhanced Customization**:

- Configuration file support (`.phase-doc-gen.json`)
- Custom template overrides
- Project-specific defaults
- User-defined commit message formats

**Additional Features**:

- Support for monorepo projects
- Multi-language documentation (i18n)
- Integration with project management tools
- Automatic dependency detection from package.json/requirements.txt

### [3.0.0] - Future

**Advanced Features**:

- AI-powered commit breakdown optimization
- Automatic test generation templates
- CI/CD pipeline generation
- Diagram generation (architecture, flow charts)

**Community Features**:

- Template marketplace
- Shared configurations
- Community best practices library

---

## Contributing

To contribute improvements:

1. Update `SKILL.md` with new features (note: not `prompt.md` anymore)
2. Update YAML frontmatter if metadata changes (name, description, version, allowed-tools)
3. Add examples to README.md
4. Update spec-template.md if needed
5. Document changes in this CHANGELOG
6. Test the skill with various tech stacks to ensure compatibility

---

## Questions or Issues?

If you encounter problems or have suggestions:

1. Check if your specification is complete (use spec-template.md)
2. Verify tech stack is specified correctly
3. Review generated docs for placeholders
4. Try regenerating with adjusted inputs

For feature requests or bug reports, document the issue with:

- Phase specification used
- Tech stack specified
- Expected vs actual output
- Error messages or issues encountered
