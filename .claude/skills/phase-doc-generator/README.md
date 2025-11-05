# Phase Documentation Generator

A Claude Code **Agent Skill** that generates comprehensive implementation documentation for development phases in any software project.

**Version**: 2.2.0
**Type**: Project Skill
**Auto-invocation**: ✅ Enabled (model-invoked based on trigger keywords)

## 🎯 What It Does

Automatically generates **7 professional documentation files** (~3400 lines) for implementing a development phase using atomic commits and best practices:

1. **INDEX.md** - Navigation hub and overview
2. **IMPLEMENTATION_PLAN.md** - Atomic commit strategy (adaptive sizing based on complexity)
3. **COMMIT_CHECKLIST.md** - Detailed checklist per commit
4. **ENVIRONMENT_SETUP.md** - Environment configuration guide
5. **guides/REVIEW.md** - Code review guide (commit-by-commit)
6. **guides/TESTING.md** - Testing strategy (unit + integration)
7. **validation/VALIDATION_CHECKLIST.md** - Final validation checklist

**Result**: ~3000 lines of structured, actionable documentation ready for implementation!

---

## 🚀 Quick Start

### Prerequisites

Before using this skill, you should have:
1. **PRD** at `docs/specs/PRD.md`
2. **Story extracted** (via `/plan-story` command)
3. **PHASES_PLAN.md** created at `docs/specs/epics/epic_X/story_X_Y/implementation/PHASES_PLAN.md`

### Complete Workflow

```
Step 1: /plan-story
   → Extracts story from PRD
   → Creates story_X.Y.md + PHASES_PLAN.md

Step 2: /generate-phase-doc (this skill)
   → Reads PHASES_PLAN.md
   → Creates phase_X/ documentation (7 files)

Step 3: Implement
   → Follow generated documentation
```

### 1. Installation

The skill is already installed in this project at `.claude/skills/phase-doc-generator/`.

For other projects, copy the entire directory:

```bash
# From your project root
mkdir -p .claude/skills
cp -r /path/to/phase-doc-generator .claude/skills/
```

### 2. Usage

**Option A: Automatic Invocation (Recommended) ⚡**

Just describe what you need using trigger keywords:

```
"Generate documentation for Phase 3 of Epic 1 Story 1.1"
"Create implementation docs for Phase 2"
"I need phase planning documentation with atomic commits for Phase 1"
"Generate implementation guide for the next phase"
```

Claude will automatically detect and invoke the skill based on these keywords:
- "generate phase documentation"
- "create implementation docs"
- "phase planning"
- "atomic commits documentation"
- "implementation guide"

**Option B: Manual Invocation via Slash Command 🎯**

```bash
# Explicitly invoke the skill
/generate-phase-doc
```

**Option C: Direct Request**

```
Use the phase-doc-generator skill to create docs for Phase 3
Story: Epic 1 Story 1.1
```

The skill will ask you for:
1. Story reference (e.g., "Epic 1 Story 1.1")
2. Phase number (e.g., "3")
3. Phase name (e.g., "Article Pages")
4. Path to PHASES_PLAN.md (default: auto-detected)
5. Output directory (optional, default: auto-generated)
6. Tech stack (optional, can infer from PHASES_PLAN)

## 🏗️ How It Works

### Model-Invoked Skill Architecture

This is a **model-invoked skill**, meaning Claude autonomously decides when to use it based on:
1. **Trigger keywords** in your request (see description in SKILL.md)
2. **Context matching** with the skill's capabilities
3. **Task requirements** aligning with documentation generation

This is different from **user-invoked** slash commands where you explicitly type `/command`.

**Benefits of Model-Invoked Skills**:
✅ Natural conversation flow (no need to remember command syntax)
✅ Context-aware invocation (Claude knows when it's appropriate)
✅ Composable (Claude can chain multiple skills for complex tasks)

### Integration with story-phase-planner

This skill is **Tier 2 (Tactical)** in a two-tier documentation strategy:

**Tier 1 - Strategic** ([story-phase-planner](../story-phase-planner/)):
- Analyzes complete user story
- Breaks down into optimal number of phases (adaptive sizing based on complexity)
- Creates PHASES_PLAN.md with high-level overview
- Use first: `/plan-story`

**Tier 2 - Tactical** (this skill):
- Generates detailed docs for ONE phase
- Creates 7 implementation documents
- Provides commit-by-commit guidance
- Use after planning: `/generate-phase-doc`

**Complete Workflow**:
```
1. Story Spec → [story-phase-planner] → PHASES_PLAN.md
2. For each phase → [phase-doc-generator] → 7 detailed docs
3. Implement → Validate → Next phase
```

---

## 📋 Prerequisites

### 0. Story Planning (Recommended)

**Before generating phase documentation**, use the `story-phase-planner` skill to create a strategic overview:

```
/plan-story
# or
"Plan the implementation phases for Story 1.1"
```

This creates `PHASES_PLAN.md` which:
- Breaks down the story into phases
- Identifies dependencies
- Provides estimates
- Assesses risks

Then use this skill to generate detailed docs for each phase.

### 1. Technical Specification

Create a markdown file describing what needs to be implemented (either for a story or individual phase). Include:

- **Objective**: What this phase achieves
- **Scope**: List of features/components
- **Files**: Files to create or modify
- **Dependencies**: Packages, services needed
- **Tests**: Types of tests required
- **Validation**: Acceptance criteria

**Example structure**:

```markdown
# Phase 3 - Authentication System

## Objective
Implement JWT-based authentication with role-based access control.

## Scope
- User login/logout endpoints
- JWT token generation and validation
- Protected route middleware
- Role-based permissions

## Files to Create/Modify
- `src/auth/jwt.ts` (new)
- `src/middleware/auth.ts` (new)
- `src/routes/auth.ts` (new)
- `src/types/user.ts` (modify)

## Dependencies
- jsonwebtoken ^9.0.0
- bcrypt ^5.1.0

## Tests
- Unit tests for JWT utils
- Integration tests for auth endpoints
- E2E tests for login flow

## Validation
- All endpoints return correct status codes
- Tokens are validated properly
- Unauthorized access is blocked
```

### 2. Tech Stack Configuration (Optional)

The agent can infer from your spec, or you can provide:
- **Framework**: Next.js, Django, Express, etc.
- **Language**: TypeScript, Python, JavaScript
- **Package Manager**: pnpm, npm, yarn
- **Test Framework**: Vitest, Jest, pytest
- **Linter**: Biome, ESLint, pylint

---

## 📚 Generated Documentation

### Structure

```
docs/implementation/phase_X/
├── INDEX.md                     (~300 lines)
├── IMPLEMENTATION_PLAN.md       (~500 lines)
├── COMMIT_CHECKLIST.md          (~600 lines)
├── ENVIRONMENT_SETUP.md         (~400 lines)
├── guides/
│   ├── REVIEW.md               (~600 lines)
│   └── TESTING.md              (~500 lines)
└── validation/
    └── VALIDATION_CHECKLIST.md  (~500 lines)
```

**Total**: ~3400 lines of documentation

### Key Features

**Atomic Commit Strategy**:
- Breaks phase into optimal number of independent commits (adaptive sizing: 1-20+ as needed)
- Each commit has single responsibility
- Progressive validation at each step
- Facilitates review and rollback

**Comprehensive Checklists**:
- Implementation tasks per commit
- Validation commands
- Review criteria
- Testing strategies

**Time Estimates**:
- Implementation time per commit
- Review time per commit
- Total phase duration

**Quality Standards**:
- Type safety (if applicable)
- Test coverage targets (>80%)
- Code quality metrics
- Security and performance checks

---

## 🎓 How It Works

### Step 1: Analyze Specification

The agent reads your technical spec and extracts:
- Phase objectives and scope
- Features to implement
- Files to create/modify
- Dependencies (packages, services)
- Test requirements
- Validation criteria

### Step 2: Plan Atomic Commits

Breaks the implementation into the optimal number of atomic commits (adaptive sizing: 1-20+ as needed) based on:
- **Single responsibility**: Each commit does one thing
- **Independence**: Can be tested and validated alone
- **Size**: Typically 50-300 lines (reviewable in 15-90 min)
- **Type-safety**: Compiles at each step
- **Logical progression**: Types → Config → Core → Integration → Tests
- **Complexity assessment**: Simple (1-3), Medium (4-8), Complex (9-15), Very Complex (15+)

### Step 3: Generate Documentation

Creates all 7 documents with:
- Detailed implementation steps
- Validation commands adapted to your stack
- Review checklists
- Testing strategies
- Troubleshooting guides

### Step 4: Validate and Deliver

Ensures:
- All files created
- No placeholders left
- Commands work with your stack
- Internal links are correct
- Structure is consistent

---

## 💡 Use Cases by Role

### 🧑‍💻 For Developers

**Benefits**:
- Step-by-step implementation guide
- Clear commit boundaries
- Validation at each step
- Ready-to-use commit messages

**Workflow**:
1. Read IMPLEMENTATION_PLAN.md (15 min)
2. Follow COMMIT_CHECKLIST.md for each commit
3. Validate after each commit
4. Use TESTING.md to write tests

### 👀 For Code Reviewers

**Benefits**:
- Commit-by-commit review guide
- Clear review criteria
- Pre-defined checklists
- Expected outcomes documented

**Workflow**:
1. Review IMPLEMENTATION_PLAN.md for strategy
2. Use guides/REVIEW.md for each commit
3. Validate against VALIDATION_CHECKLIST.md

### 📊 For Tech Leads

**Benefits**:
- Progress tracking
- Quality metrics
- Time estimates
- Standardized process

**Workflow**:
1. Check INDEX.md for status
2. Review IMPLEMENTATION_PLAN.md for metrics
3. Use VALIDATION_CHECKLIST.md for approval

---

## 🛠️ Configuration

### File Structure

```
.claude/skills/phase-doc-generator/
├── SKILL.md               # Main skill file with frontmatter & instructions
├── README.md             # This file - comprehensive guide
├── QUICK_START.md        # Quick reference guide
├── CHANGELOG.md          # Version history
└── prompt.md.backup      # Legacy backup (can be deleted)
```

**Key File**: `SKILL.md` contains:
- **YAML Frontmatter**: Metadata (name, description, version, allowed-tools)
- **Instructions**: Complete agent workflow and templates
- **Examples**: Concrete use cases

### Default Settings

If not specified, the skill uses:
- Package manager: **pnpm**
- Test framework: **Vitest**
- Linter: **Biome**
- Output directory: `docs/implementation/phase_X/`

### Customization

The skill automatically adapts to your project by inferring from the spec, or you can specify:

```
Tech Stack: Django + React + TypeScript
Package Manager: npm
Test Framework: Jest
Linter: ESLint
Output: docs/phases/phase_3/
```

---

## 📐 Atomic Commit Philosophy

### Why Atomic Commits?

✅ **Easier Review**: Focus on one thing at a time (15-90 min per commit)
✅ **Safe Rollback**: Revert problematic commits without breaking everything
✅ **Progressive Validation**: Tests and types check at each step
✅ **Clear History**: Git history tells a story
✅ **Better Collaboration**: Smaller, focused changes are easier to discuss

### Adaptive Sizing

**Key Principle**: The number of commits should reflect the actual work, not fit an arbitrary template.

**Complexity-Based Sizing**:
- 🟢 **Simple Phase** (1-3 commits): Configuration changes, small fixes, minor features
- 🟡 **Medium Phase** (4-8 commits): Standard features with types, logic, integration, tests
- 🟠 **Complex Phase** (9-15 commits): Multi-component features with extensive integration
- 🔴 **Very Complex Phase** (15+ commits): Large-scale features (consider splitting the phase)

**What Matters Most**:
1. **Independence**: Can each commit be reviewed and understood separately?
2. **Value**: Does each commit represent meaningful progress?
3. **Safety**: Can we rollback individual commits if needed?
4. **Reviewability**: Is each commit digestible (typically 15-90 min review)?

**Red Flags**:
- ❌ Combining unrelated changes to hit a target count
- ❌ Splitting work artificially to avoid "too many commits"
- ❌ Commits that can't compile/run independently (when they should)
- ❌ Commits larger than 1000 lines (unless justified: migrations, generated code, etc.)

**Green Lights**:
- ✅ Each commit tells a clear story
- ✅ Commit progression is logical
- ✅ Each commit can be validated independently
- ✅ Commit size varies based on actual work

### Typical Progression

```
Commit 1: Types/Interfaces
   ↓
Commit 2: Configuration
   ↓
Commit 3: Core Logic
   ↓
Commit 4: Integration
   ↓
Commit 5: Tests
```

Each commit:
- Compiles successfully
- Passes all tests
- Can be reviewed independently
- Has clear validation criteria

---

## 🎯 Best Practices

### Before Generating Docs

✅ **Complete spec**: Detailed technical specification ready
✅ **Clear scope**: Know exactly what to implement
✅ **Dependencies identified**: Know what packages/services needed
✅ **Previous phases done**: If depends on other phases

### After Generation

✅ **Review INDEX.md**: Understand navigation
✅ **Validate commit plan**: Ensure commits make sense
✅ **Adjust if needed**: Update estimates or split commits
✅ **Share with team**: Get alignment before implementation

### During Implementation

✅ **Follow COMMIT_CHECKLIST.md**: Don't skip steps
✅ **Validate each commit**: Run all checks
✅ **Update docs**: If you discover issues
✅ **Communicate**: Flag blockers early

---

## 📊 Success Metrics

### Documentation Quality

- **Completeness**: All 7 files generated
- **Accuracy**: Commands work with your stack
- **Clarity**: Anyone can follow without questions
- **Consistency**: Same structure and tone throughout

### Implementation Quality

After using these docs, expect:
- **Test Coverage**: >80%
- **Type Safety**: 100% (if applicable)
- **Code Review**: Faster, more focused
- **Rollback Safety**: Can revert individual commits

---

## 🔧 Advanced Usage

### For Multi-Framework Projects

Specify different stacks for different phases:

```
Phase 3 (Frontend): Next.js + TypeScript + Vitest
Phase 4 (Backend): Django + Python + pytest
```

### For Large Phases

Agent automatically increases commit count for complex phases (6-8 commits).

### For Simple Phases

Agent reduces to 3-4 commits for straightforward implementations.

---

## 🚨 Troubleshooting

### Issue: Agent asks too many questions

**Solution**: Provide a detailed spec with all information upfront.

### Issue: Generated commands don't match my stack

**Solution**: Specify your stack explicitly when running the skill.

### Issue: Commits seem too big/small

**Solution**: Review and adjust in IMPLEMENTATION_PLAN.md before starting implementation.

### Issue: Missing dependencies in ENVIRONMENT_SETUP.md

**Solution**: Ensure your spec lists all required packages and services.

---

## 🎓 Examples

### Example 1: Authentication System

**Input**:
- Phase: 3
- Name: "Authentication System"
- Spec: `docs/specs/auth_phase.md`

**Output**: 7 files with 5 atomic commits
1. User types and interfaces
2. JWT utilities
3. Auth middleware
4. Login/logout endpoints
5. Integration tests

### Example 2: Database Integration

**Input**:
- Phase: 2
- Name: "Database Integration"
- Spec: `docs/specs/db_integration.md`

**Output**: 7 files with 4 atomic commits
1. Database schema types
2. Connection configuration
3. CRUD operations
4. Tests

---

## 📝 Maintaining Generated Docs

### Updating During Implementation

If you discover changes needed:
1. Update the relevant doc (e.g., IMPLEMENTATION_PLAN.md)
2. Ensure consistency with other docs
3. Update cross-references
4. Document why the change was needed

### Archiving After Completion

1. Mark INDEX.md as ✅ COMPLETED
2. Add completion date
3. Keep docs for future reference
4. Link to next phase

---

## 🌟 Why Use This Skill?

### Time Savings

- **Manual docs**: 4-6 hours
- **With this skill**: 10-15 minutes
- **Savings**: ~5 hours per phase

### Quality Improvements

- **Standardized structure**: Consistent across all phases
- **Nothing forgotten**: Comprehensive checklists
- **Best practices**: Atomic commits, testing, validation
- **Knowledge transfer**: Anyone can pick up the work

### Reduced Errors

- **Validation at each step**: Catches issues early
- **Clear criteria**: No ambiguity
- **Review guides**: Better code reviews
- **Rollback safety**: Easy to revert

---

## 📖 Related Resources

### Atomic Commits
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/)

### Code Review
- [Google Engineering Practices](https://google.github.io/eng-practices/review/)
- [Effective Code Review](https://www.oreilly.com/library/view/effective-code-review/9781098129613/)

### Testing
- [Testing Best Practices](https://testingjavascript.com/)
- [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

## 📜 License

This skill is part of your project and follows your project's license.

---

## 🤝 Contributing

To improve this skill:
1. Edit `prompt.md` to update templates or logic
2. Update this README with new features
3. Test with various project types
4. Share improvements with the community

---

## 📞 Support

### Troubleshooting

**Issue**: Skill doesn't activate automatically
**Solution**: Make sure your request includes trigger keywords like "generate phase documentation" or "implementation docs"

**Issue**: Generated commands don't match my stack
**Solution**: Explicitly specify your tech stack when invoking the skill, or ensure it's clear in your specification

**Issue**: Commits seem too big/small
**Solution**: Review IMPLEMENTATION_PLAN.md and adjust manually, or regenerate with more specific requirements

**Issue**: Missing dependencies in ENVIRONMENT_SETUP.md
**Solution**: Ensure your specification lists all required packages and services

### Getting Help

1. Check `SKILL.md` for complete skill documentation
2. Review `QUICK_START.md` for quick reference
3. Verify your technical specification is complete
4. Try regenerating with more detailed inputs

## 🔄 Updates and Versioning

**Current Version**: 2.2.0

**What's New in 2.2.0**:
- ✅ **Adaptive Sizing**: Removed arbitrary "3-7 commits" limitation
- ✅ **Complexity-Based Planning**: Supports 1-20+ commits based on actual work complexity
- ✅ **Complexity Assessment**: Simple (1-3), Medium (4-8), Complex (9-15), Very Complex (15+)
- ✅ **Improved Philosophy**: Focus on independence, value, safety, and reviewability over hitting targets
- ✅ **Better Documentation**: Added comprehensive adaptive sizing section to README and SKILL.md
- ✅ **Enhanced Examples**: Updated all examples to reflect flexible commit counts

**Previous Versions**:
- **2.1.0**: Proper YAML frontmatter, trigger keywords, allowed-tools restriction
- **2.0.0**: Generic, project-agnostic version
- **1.x**: Initial project-specific version

---

## 📜 File Structure Changes (v2.1.0)

**Before** (v2.0.0):
```
.claude/skills/phase-doc-generator/
├── skill.json          # Metadata
├── prompt.md          # Instructions
├── README.md          # Documentation
├── QUICK_START.md
└── CHANGELOG.md
```

**After** (v2.1.0):
```
.claude/skills/phase-doc-generator/
├── SKILL.md           # ⭐ Main file (frontmatter + instructions)
├── README.md          # Updated documentation
├── QUICK_START.md
├── CHANGELOG.md
└── prompt.md.backup   # Legacy backup
```

**Migration**: Existing projects using v2.0.0 will automatically work with v2.1.0. The new `SKILL.md` follows Claude Code Agent Skills best practices.

---

**Version**: 2.2.0
**Last Updated**: 2025-10-28
**Created by**: Claude Code
**Skill Type**: Model-Invoked Project Skill

**This skill follows Claude Code Agent Skills best practices and is completely autonomous! 🎉**
