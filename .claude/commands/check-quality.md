---
description: Generate comprehensive quality report with TypeScript, ESLint, Prettier, Architecture validation, and Tests
argument-hint: [optional: --e2e to include Playwright tests]
allowed-tools:
  - Bash
  - Read
  - Glob
---

# Check Code Quality

## Context

This command executes a comprehensive quality check of the codebase using the quality-report system. It runs all configured quality tools and generates a detailed report with scores, metrics, and recommendations.

The quality checks include:

### 🔍 Static Analysis

- TypeScript Type Check (`tsc --noEmit`) - Critical
- ESLint (`pnpm lint`)
- Prettier Format Check (`pnpm format:check`)

### 🏗️ Architecture

- Dependency Cruiser (`pnpm arch:validate`)

### 🧪 Tests

- Vitest Unit Tests (`pnpm test`)
- Code Coverage (`pnpm test:coverage`)

### 🎭 E2E (Optional)

- Playwright E2E Tests (only with `--e2e` flag)

## Task

Generate a comprehensive quality report for the codebase and present the results.

## Instructions

### Step 1: Check for E2E Flag

Check if the user passed `--e2e` as an argument ($1):

- If yes, set `QUALITY_REPORT_E2E=true`
- If no or empty, use the default (E2E tests disabled)

### Step 2: Execute Quality Report Script

Run the quality report generation script using the Bash tool:

```bash
cd /home/negus/dev/website && .claude/skills/quality-report/scripts/generate-quality-report.sh
```

If `--e2e` was specified:

```bash
cd /home/negus/dev/website && QUALITY_REPORT_E2E=true .claude/skills/quality-report/scripts/generate-quality-report.sh
```

The script will:

- Run all quality checks
- Generate JSON and Markdown reports in `.claude/quality-system/reports/`
- Display a summary with the score

### Step 3: Find and Read the Latest Report

Use Glob to find the most recent Markdown report:

```
.claude/quality-system/reports/quality-*.md
```

Then use Read to read the latest report file.

### Step 4: Present Results

Present the results to the user in a clear, structured format:

1. **Display the Quality Score** prominently with the badge
2. **Show the Metrics Table** (Passed, Failed, Warnings, Total)
3. **Summarize Critical Issues** (if any)
   - List all failed checks with priority
   - Explain what needs to be fixed
4. **Summarize Warnings** (if any)
   - List all checks with warnings
   - Suggest improvements
5. **Show Recommendations Section** from the report
6. **Provide Next Steps**:
   - Commands to fix issues (from the report)
   - Link to the full report files (JSON and Markdown)

### Step 5: Actionable Feedback

If there are failures or warnings:

- Offer to help fix specific issues
- Suggest running individual tools (e.g., "Want me to run `pnpm lint:fix`?")

If everything passed:

- Congratulate the user
- Show the excellent score
- Mention the report location for records

## Example Output Format

```markdown
# 📊 Quality Check Results

## 🎯 Score: 🟢 95/100 - Excellent

### Metrics

| ✅ Passed | ❌ Failed | ⚠️ Warnings | 📊 Total |
| --------- | --------- | ----------- | -------- |
| 5         | 0         | 1           | 6        |

---

## 📋 Check Results by Category

### 🔍 Static Analysis

- ✅ TypeScript Type Check (2.3s)
- ✅ ESLint (1.1s)
- ⚠️ Prettier Format Check (0.5s)

### 🏗️ Architecture

- ✅ Dependency Cruiser (1.8s)

### 🧪 Tests

- ✅ Vitest Unit Tests (5.7s)
- ✅ Code Coverage (6.2s)

---

## 💡 Recommendations

### 📝 Improvements Suggested

- **Prettier Format Check:** Some files need formatting

**Quick fix:** Run `pnpm format` to auto-format all files

---

## 📄 Full Reports

- JSON: `.claude/quality-system/reports/quality-20251110_143022.json`
- Markdown: `.claude/quality-system/reports/quality-20251110_143022.md`

**Need help?** I can help you fix any issues or run specific commands.
```

## Notes

- The command executes actual quality checks, which may take 10-30 seconds
- E2E tests (with `--e2e`) add significant time (1-5 minutes)
- Reports are saved for future reference and are gitignored
- The score is weighted: passed = 100%, warnings = 50%
