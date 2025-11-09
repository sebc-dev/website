# Generate Phase Documentation

This command invokes the **phase-doc-generator** skill to automatically generate comprehensive implementation documentation for a development phase.

## What This Does

**Automatically creates 7 professional documentation files** for implementing a phase using atomic commits:

1. INDEX.md - Navigation hub and overview
2. IMPLEMENTATION_PLAN.md - Atomic commit strategy (adaptive sizing: 1-20+ commits)
3. COMMIT_CHECKLIST.md - Detailed checklist per commit
4. ENVIRONMENT_SETUP.md - Environment configuration guide
5. guides/REVIEW.md - Code review guide (commit-by-commit)
6. guides/TESTING.md - Testing strategy (unit + integration)
7. validation/VALIDATION_CHECKLIST.md - Final validation checklist

**Result**: ~3000+ lines of structured, actionable documentation ready for implementation!

## How Invocation Works

⚡ **Model-invoked (Automatic)**: Claude can discover and use this skill automatically when you mention terms like:

- "generate phase documentation"
- "create implementation docs"
- "phase planning"
- "atomic commits documentation"
- "implementation guide"

🎯 **User-invoked (Manual)**: Or use this slash command to explicitly invoke the skill.

## Complete Workflow with story-phase-planner

**Recommended workflow** for implementing stories across three tiers:

```
Step 1: Initialize Epic (if needed)
   /epic-initializer [or] epic-initializer skill
   → Creates: docs/specs/epics/epic_X/EPIC_TRACKING.md
   ↓
Step 2: Plan Story Phases (Strategic)
   /plan-story
   → Extracts story from PRD
   → Creates: docs/specs/epics/epic_X/story_X_Y/story_X.Y.md
   → Creates: docs/specs/epics/epic_X/story_X_Y/implementation/PHASES_PLAN.md
   → Updates: docs/specs/epics/epic_X/EPIC_TRACKING.md
   ↓
Step 3: Generate Phase Docs (Tactical) [THIS COMMAND]
   /generate-phase-doc [for each phase]
   → Reads PHASES_PLAN.md
   → Creates: docs/specs/epics/epic_X/story_X_Y/implementation/phase_X/ (7 files)
   → Updates: docs/specs/epics/epic_X/EPIC_TRACKING.md
   ↓
Step 4: Implement & Validate
   phase-implementer agent (one commit at a time)
   → Follow COMMIT_CHECKLIST.md
   → Update EPIC_TRACKING.md as phases complete
```

This command is **Step 3** - generating detailed documentation for a single phase.

## Context Documents

Before generating phase documentation, review the relevant specifications:

- **PHASES_PLAN.md**: Phase specification (created by /plan-story)
- **Frontend_Specification.md**: `docs/specs/Frontend_Specification.md` - Technical architecture and patterns
- **UX_UI_Spec.md**: `docs/specs/UX_UI_Spec.md` - Design requirements and user experience
- **Brief.md**: `docs/specs/Brief.md` - Project goals and constraints
- **Story Spec**: `docs/specs/epics/epic_X/story_X_Y/story_X.Y.md` - Story-specific context

## Instructions for Manual Invocation

When you use this command, the skill will guide you through generating documentation for a development phase.

### Step 1: Gather Information

Ask the user for:

1. **Story Reference** (e.g., "Epic 1 Story 1.1")
2. **Phase Number** (e.g., "1", "2", "3")
3. **Phase Name** (optional - can be auto-extracted from PHASES_PLAN.md)
4. **Tech Stack** (optional, can infer from PHASES_PLAN: e.g., "SvelteKit 5 + Cloudflare")

### Step 2: Analyze PHASES_PLAN.md

1. Read the PHASES_PLAN.md file
2. Locate the specified phase section
3. Extract and identify:
   - Phase objective and goals
   - Scope (features and components)
   - Files to create or modify
   - Dependencies (packages, services, APIs, other phases)
   - Types of tests required
   - Validation criteria and success metrics

### Step 3: Plan Atomic Commits

Analyze the specification and break down into optimal number of atomic commits (adaptive sizing):

- **Simple Phase** (1-3 commits): Configuration changes, small fixes
- **Medium Phase** (4-8 commits): Standard features with types, logic, tests
- **Complex Phase** (9-15 commits): Multi-component features with extensive integration
- **Very Complex Phase** (15+ commits): Large-scale features (consider splitting the phase)
- Each commit = single responsibility
- Size: typically 50-300 lines
- Type-safe at each step (if applicable)
- Reviewable in 15-90 minutes
- Logical order: Types → Config → Utils/Core → Integration → Tests

**Atomic Commit Benefits**:
✅ Easier review (focused, one thing at a time)
✅ Safe rollback (revert individual commits without breaking everything)
✅ Progressive validation (tests and types check at each step)
✅ Clear history (git history tells a story)
✅ Better collaboration (smaller, focused changes)

### Step 4: Generate Documentation Files

Create the complete documentation structure:

```
docs/specs/epics/epic_X/story_X_Y/implementation/phase_X/
├── INDEX.md                          # Navigation hub (~300 lines)
├── IMPLEMENTATION_PLAN.md            # Atomic commit strategy (~500 lines)
├── COMMIT_CHECKLIST.md              # Per-commit checklist (~600 lines)
├── ENVIRONMENT_SETUP.md             # Environment configuration (~400 lines)
├── guides/
│   ├── REVIEW.md                    # Code review guide (~600 lines)
│   └── TESTING.md                   # Testing strategy (~500 lines)
└── validation/
    └── VALIDATION_CHECKLIST.md      # Final validation (~500 lines)
```

**Total**: ~3400 lines of professional, actionable documentation

The skill has built-in templates that are automatically adapted to:

- Your tech stack (Next.js, Django, React, etc.)
- Your tools (pnpm/npm, Vitest/Jest/pytest, Biome/ESLint)
- Your project structure
- The specific phase requirements

### Step 5: Validate Generation

The skill automatically validates that:

- ✅ All 7 files created successfully
- ✅ No placeholder text left (`[`, `{` not replaced)
- ✅ All internal links work correctly
- ✅ Commands are appropriate for the tech stack
- ✅ Atomic commits are well-sized (not too big/small)
- ✅ Structure matches professional standards

### Step 6: Provide Summary

The skill will provide a detailed summary including:

- 📁 Files created (with line counts)
- 🎯 Atomic commit breakdown (X commits with estimates)
- 📊 Metrics (estimated implementation time, review time, coverage targets)
- 🚀 Next steps for the developer

## Quality Standards

The generated documentation follows industry best practices:

- **Clear and actionable**: Anyone can follow without questions
- **Comprehensive checklists**: Nothing is forgotten
- **Realistic estimates**: Time and effort based on commit size
- **Tech-stack adapted**: Commands work with your specific tools
- **Professional structure**: Consistent formatting and navigation

## Examples of Generated Documentation

### Example 1: Authentication Phase

- **Input**: Phase 3 - JWT Authentication
- **Output**: 5 atomic commits, ~3200 lines
- **Commits**: Types → JWT Utils → Middleware → Endpoints → Tests

### Example 2: Database Integration

- **Input**: Phase 2 - PostgreSQL + Prisma
- **Output**: 4 atomic commits, ~2800 lines
- **Commits**: Schema → Config → CRUD Operations → Tests

### Example 3: REST API

- **Input**: Phase 4 - Blog API Endpoints
- **Output**: 6 atomic commits, ~3500 lines
- **Commits**: Types → Validation → Endpoints → Error Handling → Docs → Tests

## See Also

- **Epic Initializer**: `.claude/skills/epic-initializer/SKILL.md` - Start here if epic doesn't exist
- **Story Phase Planner**: `.claude/commands/plan-story.md` - Plan phases before generating docs
- **Skill Documentation**: `.claude/skills/phase-doc-generator/SKILL.md`
- **Quick Start Guide**: `.claude/skills/phase-doc-generator/QUICK_START.md`
- **Full README**: `.claude/skills/phase-doc-generator/README.md`

---

**Ready to generate? The skill will now ask you for the required information!**
