# Changelog

All notable changes to the Story Phase Planner skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-28

### 🎯 Adaptive Sizing: Removing Arbitrary Limits

This version removes the arbitrary "3-7 phases" limitation and introduces intelligent, complexity-based story decomposition that reflects real-world project needs.

### Added

- **Adaptive Sizing Philosophy**:
  - Comprehensive section in SKILL.md explaining why phase count should reflect actual work
  - Complexity assessment scale: Simple (1-3), Medium (4-6), Complex (7-10), Very Complex (10+)
  - Focus on independence, value, and deliverability over hitting arbitrary targets
  - Red flags (artificial splitting, hidden dependencies, oversized phases)
  - Green lights (independent testing, clear boundaries, reasonable timeline)

- **Complexity-Based Story Decomposition**:
  - Support for 1-20+ phases based on story complexity
  - Four complexity levels with clear characteristics and guidance
  - Flexible sizing that adapts to actual story requirements
  - Decision tree for determining when to split very complex stories

- **Enhanced Documentation**:
  - New "Complexity Assessment" section with detailed guidelines
  - Examples spanning the full spectrum (1 phase to 13+ phases)
  - Updated all references to "3-7" to reflect flexible approach
  - Added "When to Split a Story" guidance for very complex cases

### Changed

- **SKILL.md**:
  - Updated mission statement to emphasize "optimal number" instead of "3-7 phases"
  - Added comprehensive complexity assessment section
  - Updated phase breakdown principles to be more flexible
  - Version bumped to 1.1.0
  - Enhanced examples to cover full complexity range

- **README.md**:
  - Updated "What It Does" to reflect adaptive sizing
  - Changed "3-7 phases" → "optimal number of phases (adaptive sizing based on complexity)"
  - Enhanced examples section with more diverse scenarios
  - Added complexity assessment to key features
  - Updated "What's New" section with 1.1.0 improvements

- **Phase Breakdown Principles**:
  - Removed strict 2-5 day sizing (now: typically 2-5 days, can vary)
  - Emphasized that constraints should guide, not dictate
  - More nuanced guidance on when to use different phase counts
  - Added consideration for when a story is too complex and should be split

### Improved

- **Flexibility**: No longer constrained by arbitrary "3-7" range
- **Realism**: Phase count reflects actual story complexity
- **Quality**: Focus on meaningful, independent phases over hitting targets
- **Guidance**: Clear criteria for determining appropriate phase count
- **Examples**: Better representation of real-world scenarios (1 phase to 20+ phases)

### Philosophy Shift

**Before (1.0.0)**:

- Recommended 3-7 phases per story
- Teams might artificially combine or split work to fit this range
- Less flexibility for very simple or very complex stories
- "Goldilocks sizing" was too prescriptive

**After (1.1.0)**:

- Adaptive sizing based on actual story complexity
- 1 phase for tiny stories, 10+ for very complex epics
- Focus on phase quality (independence, value, testability)
- Clear guidance on red flags and green lights
- Explicit guidance on when a story should be split into multiple stories

### Migration Notes (from 1.0.0 to 1.1.0)

**Automatic Migration**:

- ✅ No action required for existing projects
- ✅ Existing PHASES_PLAN.md documents still valid
- ✅ Generated documentation format unchanged
- ✅ All functionality preserved and enhanced

**Behavioral Changes**:

- Skill may now generate plans with fewer than 3 phases (for simple stories)
- Skill may now generate plans with more than 7 phases (for complex stories)
- Phase count will better match actual story complexity
- Documentation will include complexity assessment rationale
- Skill may suggest splitting very complex stories (10+ phases) into multiple stories

**Benefits of Upgrading**:

- ✅ More realistic story planning
- ✅ Better adaptation to actual project requirements
- ✅ Less artificial splitting or combining of phases
- ✅ Clearer guidance on phase sizing decisions
- ✅ Improved quality through focus on meaningful phases
- ✅ Better handling of both very simple and very complex stories

---

## [1.0.0] - 2025-10-28

### 🎉 Initial Release: Strategic Story Planning

This is the inaugural release of the **story-phase-planner** skill, designed to bridge the gap between user story specifications and detailed phase implementation documentation.

### Added

- **Complete SKILL.md structure**:
  - YAML frontmatter with metadata (name, description, version, allowed-tools)
  - Enhanced description with **trigger keywords** for automatic invocation:
    - "plan story phases"
    - "break down story"
    - "story planning"
    - "create phases plan"
    - "decompose story"
  - Comprehensive instructions for phase breakdown workflow
  - Extensive PHASES_PLAN.md template (~800-1200 lines)
  - Concrete examples for different story types

- **Strategic planning capabilities**:
  - Analyzes user stories from `docs/specs/epics/`
  - Decomposes stories into 3-7 atomic phases
  - Identifies technical dependencies and critical paths
  - Assesses complexity, risk, and duration for each phase
  - Suggests parallelization opportunities
  - Creates dependency graphs
  - Provides realistic resource and timeline estimates

- **Phase breakdown principles**:
  - **Goldilocks sizing**: 2-5 days per phase (not too small, not too large)
  - **Independence test**: Each phase must be testable alone
  - **Value delivery**: Each phase produces working functionality
  - **Risk mitigation**: High-risk work isolated in dedicated phases
  - **Dependency minimization**: Prefers sequential independence

- **Tool restrictions for safety**:
  - `allowed-tools: Read, Write, Glob, Grep, Bash`
  - Prevents skill from using Edit, KillShell, or other potentially disruptive tools
  - Ensures safe execution focused on planning

- **Comprehensive documentation**:
  - README.md: User guide with examples and best practices
  - CHANGELOG.md: Version history and migration notes
  - Slash command: `/plan-story` for manual invocation

### Features

#### Story Analysis

- Reads story specifications from markdown files
- Extracts objectives, acceptance criteria, features
- Identifies technical requirements and constraints
- Assesses user value and business impact

#### Phase Decomposition

- Breaks down stories into 3-7 implementable phases
- Applies proven phase patterns:
  1. Foundation (types, schemas, config)
  2. Data Layer (database, models, migrations)
  3. Core Logic (business logic, utilities)
  4. Integration (APIs, external services)
  5. UI/UX (components, pages, interactions)
  6. Testing (E2E tests, validation)
  7. Polish (performance, accessibility, docs)

#### Dependency Analysis

- Creates dependency graphs showing phase relationships
- Identifies critical path for sequential phases
- Highlights parallelization opportunities
- Documents blocking dependencies clearly

#### Risk Assessment

- Assesses risk level for each phase (🟢 Low / 🟡 Medium / 🔴 High)
- Identifies risk factors (technical unknowns, performance, security)
- Provides mitigation strategies
- Documents contingency plans

#### Estimation

- Duration estimates in days (based on complexity)
- Commit count estimates (typically 3-7 per phase)
- Resource requirements (developers, reviewers, DevOps)
- Timeline projections (sequential and parallel scenarios)

### Generated Output

**PHASES_PLAN.md** includes:

- Story overview with original spec reference
- Phase breakdown strategy rationale
- Detailed summary for each phase (objective, scope, deliverables, dependencies, estimates, risks)
- Implementation order and dependency graph
- Timeline and resource estimation
- Risk assessment with mitigation strategies
- Testing strategy across phases
- Phase documentation strategy (integration with phase-doc-generator)
- Next steps and progress tracking

### Integration

**Two-Tier Documentation Strategy**:

**Tier 1 - Strategic (this skill)**:

- `PHASES_PLAN.md`: High-level overview, cross-phase coordination
- Story-level success criteria
- Overall timeline and dependencies

**Tier 2 - Tactical ([phase-doc-generator](../phase-doc-generator/))**:

- 7 detailed docs per phase
- Commit-by-commit implementation
- Specific technical validations

**Complete Workflow**:

```
Story Spec → [story-phase-planner] → PHASES_PLAN.md
    ↓
For each phase → [phase-doc-generator] → 7 detailed docs
    ↓
Implementation → Validation → Next phase
```

### Examples Included

#### Example 1: E-Commerce Product Catalog

- **Story**: Browse and search products by category with filters
- **Phases**: 5 (data models, APIs, search logic, UI, tests)
- **Duration**: 15 days, ~25 commits
- **Key risks**: Search performance (Phase 3 - High risk)

#### Example 2: User Authentication

- **Story**: Sign up, log in, manage profile securely
- **Phases**: 4 (schema, JWT service, API endpoints, UI)
- **Duration**: 12 days, ~20 commits
- **Key risks**: Security implementation (Phase 2 - High risk)

#### Example 3: Real-time Chat

- **Story**: Send and receive real-time messages
- **Phases**: 6 (WebSocket, models, service, UI, presence, tests)
- **Duration**: 16 days, ~30 commits
- **Key risks**: Concurrency handling (Phase 3 - High risk)

### Configuration

**Default Settings**:

- Output directory: `docs/implementation/story_X_Y/`
- Phase count: 3-7 (optimal range)
- Phase duration: 2-5 days each
- Phase commits: 3-7 per phase

**Adaptive Behavior**:

- Adjusts phase count based on story complexity
- Considers tech stack for dependency analysis
- Adapts estimates to team size when provided
- Isolates high-risk work in dedicated phases

### Use Cases

**For Product Owners**:

- Understand implementation complexity
- See value delivery progression
- Plan releases around phases
- Track progress at phase granularity

**For Tech Leads**:

- Structure work into reviewable chunks
- Identify technical dependencies early
- Assess and mitigate risks
- Plan resource allocation

**For Developers**:

- Clear roadmap from story to implementation
- Understand "big picture" before diving in
- Know what depends on what
- Realistic work estimates

### Technical Details

**YAML Frontmatter Structure**:

```yaml
---
name: story-phase-planner
description: |
  Analyzes a user story specification and breaks it down into atomic implementation phases.
  Creates a strategic phases plan without detailed implementation steps. Use when the user mentions
  "plan story phases", "break down story into phases", "story planning", "create phases plan",
  "decompose story", or needs to structure a story into implementable phases.
  Works with any software project and tech stack.
version: 1.0.0
allowed-tools: Read, Write, Glob, Grep, Bash
---
```

**Why These Choices**:

1. **Trigger Keywords**: Enables automatic discovery when users need story planning
2. **Tool Restrictions**: Ensures skill only reads specs and writes plans (no code modification)
3. **Model-Invoked**: Natural workflow - user describes need, Claude activates skill
4. **Tech-Agnostic**: Works with any project (Next.js, Django, React, Python, etc.)

---

## Future Roadmap

### [1.1.0] - Planned

**Enhanced Analysis**:

- Automatic detection of story anti-patterns (too large, too vague)
- Suggestions for splitting oversized stories
- Story completeness validation (missing acceptance criteria, etc.)

**Better Visualizations**:

- ASCII dependency diagrams in PHASES_PLAN.md
- Gantt-style timeline representation
- Resource utilization charts

**Template Customization**:

- Project-specific phase patterns
- Custom risk assessment criteria
- Configurable estimation models

### [1.2.0] - Planned

**Integration Enhancements**:

- Automatic cross-referencing with existing phases
- Dependency detection across stories
- Epic-level planning (multiple stories)

**AI-Powered Insights**:

- Suggest phase breakdown based on similar past stories
- Predict risks based on project history
- Recommend optimal phase ordering

### [2.0.0] - Future

**Advanced Features**:

- Multi-story epic planning
- Resource leveling across concurrent stories
- Critical path method (CPM) analysis
- Monte Carlo duration estimation

**Collaboration Features**:

- Team capacity planning
- Skill-based phase assignment
- Parallel work optimization
- Conflict detection (resource, timeline)

---

## Migration Guide

### From Manual Story Planning

**Before (Manual)**:

- Read story spec
- Brainstorm phase breakdown (2-4 hours)
- Write rough notes
- Often miss dependencies or risks
- Estimates frequently wrong

**After (story-phase-planner)**:

- Provide story spec path (30 seconds)
- Get comprehensive PHASES_PLAN.md (5-10 minutes)
- Includes dependencies, risks, estimates automatically
- Professional format, ready to share with team

**Benefits**:

- ✅ Time saved: 2-4 hours per story
- ✅ Consistent structure across all stories
- ✅ Fewer missed dependencies
- ✅ Better risk awareness
- ✅ More realistic estimates

### Integration with Existing Workflow

If you're already using `phase-doc-generator`:

1. **Keep existing phase docs**: No changes needed
2. **Add strategic layer**: Use this skill to create PHASES_PLAN.md first
3. **Reference in detailed docs**: Link PHASES_PLAN.md from phase INDEX.md files
4. **Better coordination**: Understand cross-phase dependencies

**Workflow Enhancement**:

```
Before:
Story Spec → [manual planning] → [phase-doc-generator] × N

After:
Story Spec → [story-phase-planner] → PHASES_PLAN.md → [phase-doc-generator] × N
              (5-10 min)              (strategic)        (tactical)
```

---

## Contributing

To contribute improvements:

1. Update `SKILL.md` with new features
2. Update YAML frontmatter if metadata changes
3. Add examples to README.md
4. Document changes in this CHANGELOG
5. Test with various story types and complexities
6. Ensure integration with phase-doc-generator still works

---

## Questions or Issues?

If you encounter problems or have suggestions:

1. **Issue**: Phase count seems wrong (too many/few)
   **Solution**: Review story scope - may need story splitting or consolidation

2. **Issue**: Dependency graph is confusing
   **Solution**: Simplify story spec technical requirements, be more explicit

3. **Issue**: Estimates seem unrealistic
   **Solution**: Provide team size and tech stack for better calibration

4. **Issue**: Risk assessment missing or inaccurate
   **Solution**: Include challenges, constraints, and concerns in story spec

For feature requests or bug reports, document:

- Story specification used
- Generated PHASES_PLAN.md
- Expected vs actual output
- Any error messages

---

## Acknowledgments

- Inspired by Agile story splitting techniques
- Based on atomic commits philosophy
- Integrates with phase-doc-generator skill
- Follows Claude Code Agent Skills best practices

---

**Version**: 1.0.0
**Released**: 2025-10-28
**Created by**: Claude Code
**License**: Follows project license

**This skill brings strategic planning to your implementation workflow! 🎉**
