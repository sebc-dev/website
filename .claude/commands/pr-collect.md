---
description: Collect and analyze GitHub PRs with comprehensive AI review insights
argument-hint: [optional: PR numbers separated by commas, e.g., "123,456"]
allowed-tools: Bash(gh:*), Skill(github-pr-collector), Task(pr-review-analyzer), TodoWrite
---

# GitHub PR Complete Analysis Workflow

Execute a comprehensive workflow to collect, analyze, and generate actionable insights from GitHub Pull Requests with AI review agents (CodeRabbit, GitHub Copilot, Codex, etc.).

⏱️ **Note**: This workflow can take 3-15 minutes depending on:

- Number of open PRs
- Volume of review comments
- Complexity of the analysis requested
- GitHub API rate limits

## Your Task

### 1. 📊 Environment Check & Preparation

Before starting, verify the environment:

```bash
# Check if gh CLI is installed and authenticated
gh auth status

# Check if jq is installed
which jq
```

If any tool is missing, inform the user with clear installation instructions.

### 2. 🔍 Collect PR Data

**IMPORTANT**: Create a todo list to track the workflow progress.

Execute the github-pr-collector skill to collect PR data:

- Inform the user that data collection is starting
- Display a clear message:

  ```
  🔍 Collecting Pull Request data from GitHub...

  ⏱️  This may take 2-5 minutes depending on:
  - Number of open PRs
  - Volume of comments per PR
  - GitHub API response time

  📊 I'll keep you updated on progress.
  ```

- Use the Skill tool to invoke the github-pr-collector skill
- Monitor and report progress if possible
- Once complete, verify the data was collected in `.scd/github-pr-collector/data/pr-data/`
- Display summary of collected data:
  - Number of PRs analyzed
  - Total comments extracted
  - Distribution by severity (Critical/Major/Minor/Trivial)

### 3. 🧠 Analyze with pr-review-analyzer Subagent

Launch the pr-review-analyzer subagent for deep analysis:

```
I'm going to use the Task tool to launch the pr-review-analyzer agent to analyze the collected PR data.
```

Pass the following prompt to the pr-review-analyzer:

```
Analyze the PR review data collected in .scd/github-pr-collector/data/pr-data/

Generate a comprehensive analysis report including:

1. **Executive Summary**
   - Overall code quality assessment
   - Key trends and patterns identified
   - Most critical issues requiring immediate attention

2. **Detailed Analysis by PR**
   For each PR analyzed:
   - PR title, number, and link
   - Summary of review comments by severity
   - Recurring themes or patterns
   - Risk assessment
   - Implementation complexity estimate

3. **Cross-PR Insights**
   - Common issues appearing across multiple PRs
   - Systemic problems or technical debt patterns
   - Code quality trends
   - Best practices being followed or violated

4. **Prioritized Action Items**
   Organize by severity:
   - 🔴 Critical: Must address before merge
   - 🟠 Major: Should address soon
   - 🟡 Minor: Nice to have improvements
   - 🔵 Trivial: Low priority polish

5. **Recommendations**
   - Immediate actions to take
   - Process improvements suggested
   - Patterns to watch for in future PRs
   - Training or documentation needs identified

Read from the generated markdown files and checklists in each PR folder.
Use the pr-analysis-report.md as a starting point if it exists.
```

Wait for the subagent to complete its analysis.

### 4. 📈 Generate Actionable Report

After the pr-review-analyzer completes, synthesize the findings into an actionable report:

```markdown
# GitHub PR Review Analysis Report

Generated: [timestamp]
Repository: [repo-name]
PRs Analyzed: [count]

## 🎯 Executive Summary

[High-level overview of findings]

### Key Metrics
- Total Comments: [count]
- 🔴 Critical Issues: [count]
- 🟠 Major Issues: [count]
- 🟡 Minor Issues: [count]
- 🔵 Trivial Issues: [count]

### Top 3 Concerns
1. [Critical issue #1]
2. [Critical issue #2]
3. [Critical issue #3]

## 📊 PR-by-PR Analysis

### PR #[number]: [title]

**Status**: [Open/Ready for Review/Changes Requested]
**Risk Level**: [High/Medium/Low]
**Review Summary**: [Brief summary]

#### Key Issues:
- 🔴 [Critical issue description]
- 🟠 [Major issue description]

#### Recommended Actions:
1. [Action item 1]
2. [Action item 2]

---

[Repeat for each PR]

## 🔄 Cross-PR Patterns

### Recurring Issues
1. **[Pattern name]** - Appears in [X] PRs
   - Description: [details]
   - Recommendation: [solution]

### Positive Trends
1. **[Good practice]** - Observed in [X] PRs
   - Keep doing: [details]

## ✅ Recommended Actions

### Immediate (Before Merge)
- [ ] [Action 1] - PR #[number]
- [ ] [Action 2] - PR #[number]

### Short Term (This Sprint)
- [ ] [Action 1]
- [ ] [Action 2]

### Long Term (Process Improvements)
- [ ] [Improvement 1]
- [ ] [Improvement 2]

## 📚 Learning Opportunities

### Documentation Needs
- [Topic to document]

### Team Training
- [Skill or practice to reinforce]

## 🔗 Resources

- Detailed analysis: `.scd/github-pr-collector/data/pr-data/pr-analysis-report.md`
- Individual PR folders: `.scd/github-pr-collector/data/pr-data/pr-[number]/`
- Checklists by PR: `.scd/github-pr-collector/data/pr-data/pr-[number]/COMMENTS_CHECKLIST.md`
```

### 5. 🎬 Next Steps & User Interaction

Present the report to the user and ask:

```
I've completed the analysis of your Pull Requests. Here's what I found:

[Present the summary report above]

What would you like to do next?

1. **Dive Deeper**: Explore specific PRs or issues in detail
2. **Take Action**: Start implementing recommended fixes
3. **Export Report**: Save the analysis to a markdown file
4. **Update PRs**: Add summary comments to PR discussions
5. **Continuous Monitoring**: Set up automated PR analysis

Let me know how you'd like to proceed!
```

### 6. 📝 Update Todo List

Throughout the workflow, keep the todo list updated:

- Mark tasks as in_progress when starting
- Mark tasks as completed when done
- Add new tasks if the user requests additional actions
- Never have more than one task as in_progress at a time

## Guidelines

- **Be Thorough**: Don't skip steps in the workflow
- **Be Transparent**: Keep the user informed of progress
- **Be Critical**: Evaluate AI suggestions with context awareness
- **Be Actionable**: Provide specific, implementable recommendations
- **User Control**: Always wait for user confirmation before taking actions that modify code or PRs

## Error Handling

Gracefully handle:

- Missing GitHub CLI or authentication issues
- Repositories with no open PRs
- PRs without AI review comments
- GitHub API rate limit errors
- Missing dependencies (jq, etc.)

For each error, provide clear instructions on how to resolve it.

## Example Scenarios

### Scenario 1: First Time Usage

User runs `/pr-collect` for the first time on their repository.

Expected flow:
1. Check environment and dependencies
2. Collect PR data (may be slow first time)
3. Analyze with AI
4. Present comprehensive report
5. Offer next steps

### Scenario 2: Targeted PR Analysis

User runs `/pr-collect 123,456` to analyze specific PRs.

Expected flow:
1. Validate PR numbers exist
2. Collect only specified PRs
3. Focused analysis on those PRs
4. Comparative insights if multiple PRs

### Scenario 3: Follow-up Analysis

User runs `/pr-collect` after previous analysis.

Expected flow:
1. Check for new/updated PRs
2. Incremental collection
3. Compare with previous analysis
4. Highlight changes and new issues

---

Now, execute the complete workflow with any provided arguments: $ARGUMENTS
