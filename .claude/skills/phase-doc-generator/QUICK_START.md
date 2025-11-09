# Quick Start Guide

Get started with Phase Documentation Generator in 5 minutes!

## 📦 Installation (30 seconds)

```bash
# Option 1: Copy to your project
cp -r .claude/skills/phase-doc-generator /path/to/your-project/.claude/skills/

# Option 2: Create from scratch
mkdir -p /path/to/your-project/.claude/skills/phase-doc-generator
# Then copy the files from this directory
```

---

## ✍️ Create a Specification (5 minutes)

Use the provided template:

```bash
# Copy the template
cp .claude/skills/phase-doc-generator/spec-template.md docs/specs/phase_3.md

# Edit with your phase details
code docs/specs/phase_3.md
```

**Minimum required sections**:

1. ✅ **Objective**: What you're building
2. ✅ **Scope**: List of features
3. ✅ **Files**: What to create/modify
4. ✅ **Dependencies**: Packages needed
5. ✅ **Tests**: What to test

**Example** (minimal spec):

```markdown
# Phase 3 - User Profile Page

## Objective

Create a user profile page with edit capabilities.

## Scope

- Display user information
- Edit profile form
- Avatar upload
- Save changes endpoint

## Files to Create/Modify

- pages/profile.tsx (new)
- components/ProfileForm.tsx (new)
- api/profile.ts (new)
- types/user.ts (modify - add profile fields)

## Dependencies

- react-hook-form@^7.0.0
- zod@^3.0.0

## Tests

- Unit: ProfileForm validation
- Integration: Profile update endpoint
```

---

## 🚀 Generate Documentation (2 minutes)

### In Claude Code:

```
Use the phase-doc-generator skill to generate docs for Phase 3
Spec: docs/specs/phase_3.md
Output: docs/implementation/phase_3/
```

or

```
/phase-doc-generator
```

Then answer the prompts:

1. **Phase number**: `3`
2. **Phase name**: `User Profile Page`
3. **Spec path**: `docs/specs/phase_3.md`
4. **Output dir**: `docs/implementation/phase_3/` (or press enter for default)
5. **Tech stack**: `Next.js + TypeScript` (or let it infer from spec)

**That's it!** 🎉

---

## 📁 What You Get

```
docs/implementation/phase_3/
├── INDEX.md                     ← Start here!
├── IMPLEMENTATION_PLAN.md       ← Atomic commit strategy
├── COMMIT_CHECKLIST.md          ← Step-by-step tasks
├── ENVIRONMENT_SETUP.md         ← Setup guide
├── guides/
│   ├── REVIEW.md               ← Code review guide
│   └── TESTING.md              ← Testing strategy
└── validation/
    └── VALIDATION_CHECKLIST.md  ← Final validation
```

**~3400 lines of documentation generated!**

---

## 🎯 Next Steps

### 1. Review the Plan (5 min)

```bash
cat docs/implementation/phase_3/INDEX.md
cat docs/implementation/phase_3/IMPLEMENTATION_PLAN.md
```

Check:

- ✅ Atomic commits make sense
- ✅ Time estimates reasonable
- ✅ Dependencies correct

### 2. Setup Environment (10 min)

```bash
cat docs/implementation/phase_3/ENVIRONMENT_SETUP.md
```

Follow the setup steps:

- Install dependencies
- Configure environment variables
- Start required services

### 3. Start Implementation (variable)

```bash
cat docs/implementation/phase_3/COMMIT_CHECKLIST.md
```

For each commit:

1. ✅ Complete implementation tasks
2. ✅ Run validation commands
3. ✅ Self-review checklist
4. ✅ Commit with provided message

### 4. Validate (30 min)

```bash
cat docs/implementation/phase_3/validation/VALIDATION_CHECKLIST.md
```

Go through final validation:

- All commits completed
- All tests pass
- Code reviewed
- Ready for merge

---

## 💡 Tips for Success

### Writing Good Specs

✅ **Be specific**: List exact files and features
✅ **Include examples**: Show data structures, API endpoints
✅ **Define tests**: What needs to be tested
✅ **Note dependencies**: Packages, services, prerequisites

❌ **Avoid vague**: "Build a user system" → Too broad
❌ **Don't skip**: Always include scope and files
❌ **Don't assume**: Document everything needed

### Using Generated Docs

✅ **Follow the order**: INDEX.md → IMPLEMENTATION_PLAN.md → COMMIT_CHECKLIST.md
✅ **Validate each commit**: Don't skip validation steps
✅ **Update if needed**: Docs can be adjusted during implementation
✅ **Share with team**: Review plan together before starting

### Common Pitfalls

❌ **Skipping commits**: Don't combine commits
❌ **Ignoring validation**: Always run checks before committing
❌ **Incomplete spec**: Missing dependencies breaks ENVIRONMENT_SETUP.md
❌ **Wrong tech stack**: Specify if not obvious from spec

---

## 🎓 Examples

### Example 1: Simple Feature

**Spec** (2 min to write):

```markdown
# Phase 4 - Dark Mode Toggle

## Objective

Add dark mode toggle to application.

## Scope

- Theme context provider
- Toggle component
- Persist preference
- Apply theme CSS

## Files

- contexts/ThemeContext.tsx (new)
- components/ThemeToggle.tsx (new)
- styles/themes.css (new)
- app/layout.tsx (modify)

## Dependencies

- None (use localStorage)

## Tests

- Theme persists on reload
- Toggle switches theme
```

**Result**: 7 docs, 3 atomic commits, ready in 10 min

---

### Example 2: Complex Feature

**Spec** (10 min to write):

```markdown
# Phase 5 - Payment Integration

## Objective

Integrate Stripe for payment processing.

## Scope

- Stripe checkout flow
- Webhook handling
- Order confirmation
- Payment status tracking
- Email notifications

## Files

- api/stripe/checkout.ts (new)
- api/stripe/webhook.ts (new)
- components/CheckoutForm.tsx (new)
- types/payment.ts (new)
- lib/stripe.ts (new)
- services/email.ts (modify)

## Dependencies

- stripe@^14.0.0
- @stripe/stripe-js@^2.0.0

## Tests

- Checkout session creation
- Webhook signature validation
- Payment status updates
- Email sending on success
```

**Result**: 7 docs, 6 atomic commits, ready in 15 min

---

## 🚨 Troubleshooting

### "Agent asks too many questions"

→ Provide complete spec upfront with all sections filled

### "Commands don't work"

→ Specify your exact tech stack when generating

### "Commits seem wrong"

→ Review IMPLEMENTATION_PLAN.md and adjust before implementation

### "Missing setup steps"

→ Ensure spec includes all dependencies and services

---

## 📞 Need Help?

1. **Check the template**: `spec-template.md` has full example
2. **Read the README**: Comprehensive documentation
3. **Review CHANGELOG**: See what's new and how it works
4. **Try an example**: Start with simple feature first

---

## ✅ Checklist for First Time

- [ ] Skill installed in `.claude/skills/`
- [ ] Read `spec-template.md`
- [ ] Wrote complete specification
- [ ] Generated docs with skill
- [ ] Reviewed INDEX.md and IMPLEMENTATION_PLAN.md
- [ ] Set up environment per ENVIRONMENT_SETUP.md
- [ ] Started first commit with COMMIT_CHECKLIST.md

**Ready to generate high-quality phase documentation! 🚀**

---

**Time Investment**:

- First time: ~20 min (learning + setup)
- Subsequent uses: ~10 min (spec + generation)
- **Time saved**: ~5 hours of manual documentation per phase!
