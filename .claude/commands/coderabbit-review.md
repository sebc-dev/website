---
description: Run CodeRabbit review and analyze suggestions with critical evaluation
argument-hint: [optional: file/directory path]
allowed-tools: Bash(coderabbit:*), TodoWrite
---

# CodeRabbit Review & Analysis

Execute a comprehensive CodeRabbit review with intelligent analysis of suggestions.

⏱️ **Note**: CodeRabbit analysis can take 2-10 minutes depending on:

- Project size (lines of code)
- Number of files to analyze
- Complexity of the codebase
- Current system load

The analysis will run in the background and you'll be notified when it's complete.

## Your Task

1. **Execute CodeRabbit Analysis**
   - **IMPORTANT**: Inform the user that CodeRabbit analysis can take several minutes depending on project size
   - Run `coderabbit --prompt-only $ARGUMENTS` in the background using the `run_in_background` parameter
   - Display a clear message:

     ```
     🔍 CodeRabbit is analyzing the codebase...

     ⏱️  This may take 2-10 minutes depending on:
     - Project size and complexity
     - Number of files to analyze

     📊 Progress updates will be shown every 30 seconds.
     💡 You can continue working while the analysis runs.
     ```

   - Monitor the background process periodically (every 30-60 seconds) to check for completion
   - Provide periodic status updates like:
     - "⏳ Still analyzing... (1 minute elapsed)"
     - "⏳ Still analyzing... (2 minutes elapsed)"
   - Once complete, display: "✅ CodeRabbit analysis complete! Starting critical evaluation..."
   - Retrieve the full output from the background process
   - **DO NOT START YOUR ANALYSIS** until CodeRabbit has fully completed and you have retrieved the complete output
   - Parse all suggestions and proposed changes from the complete CodeRabbit output

2. **Critical Analysis Framework**
   For EACH suggestion from CodeRabbit, provide:

   ### 📊 Suggestion Overview
   - **Location**: File path and line numbers
   - **Type**: Bug fix / Performance / Security / Code quality / Style / etc.
   - **Severity**: Critical / High / Medium / Low

   ### 🔍 Pertinence Analysis

   Evaluate:
   - **Context Awareness**: Does the suggestion understand the code's purpose?
   - **Technical Validity**: Is the proposed change technically sound?
   - **Alignment with Project**: Does it match our tech stack and patterns?
   - **Side Effects**: Could this break existing functionality?

   ### ⚖️ Risk vs Benefit Assessment
   - **Benefits**: What improvements does this bring?
   - **Risks**: What could go wrong?
   - **Effort**: Complexity of implementing the change (trivial/moderate/complex)

   ### 💡 Recommendation
   - **Decision**: ✅ ACCEPT / ⚠️ ACCEPT WITH MODIFICATIONS / ❌ REJECT
   - **Justification**: Clear reasoning for the recommendation
   - **Alternative Approach**: If rejecting, suggest better alternatives if applicable

   ### 📝 Implementation Notes

   If accepting, provide:
   - Specific steps to implement
   - Testing considerations
   - Potential gotchas to watch for

3. **Summary Report**
   After analyzing all suggestions, provide:
   - Total suggestions: X
   - Recommended to accept: X
   - Recommended to modify: X
   - Recommended to reject: X
   - Priority order for implementation

4. **Interactive Validation**
   - Present each recommendation to the user
   - Wait for user validation before proceeding to implement
   - Create a todo list with approved changes
   - Systematically implement accepted suggestions

## Guidelines

- **Be Critical**: Don't accept suggestions blindly - evaluate context and project needs
- **Consider Tech Stack**: We use Next.js 15, React 19, TypeScript, Biome for linting
- **Respect Architecture**: Monorepo structure, Docker setup, production constraints
- **Security First**: Pay special attention to security-related suggestions
- **User Control**: Never implement changes without explicit user approval

## Example Output Format

````
# CodeRabbit Review Analysis

Found 5 suggestions to review:

---

## Suggestion 1/5: Optimize Docker Image Size

📍 **Location**: `apps/web/Dockerfile:15-20`
🏷️ **Type**: Performance / Optimization
⚠️ **Severity**: Medium

### Current Code:
```dockerfile
FROM node:20-alpine
COPY . .
RUN pnpm install
````

### Proposed Change:

Use multi-stage build to reduce image size by 60%

### 🔍 Analysis:

- ✅ Context aware: Understands Docker best practices
- ✅ Technically valid: Multi-stage builds are proven approach
- ✅ Project alignment: We already use standalone Next.js builds
- ⚠️ Side effects: Requires adjusting CI/CD pipeline

### ⚖️ Risk vs Benefit:

**Benefits**:

- 60% smaller image size (faster deployments)
- Better layer caching
- Improved security (fewer dependencies in final image)

**Risks**:

- Requires testing deployment pipeline
- May need to adjust docker-compose configuration

**Effort**: Moderate (2-3 hours including testing)

### 💡 Recommendation: ✅ ACCEPT

**Justification**:
Significant performance improvement with manageable risk. We already use standalone builds, so this is a natural optimization. The effort is justified by long-term benefits.

**Implementation Plan**:

1. Create multi-stage Dockerfile
2. Test local builds
3. Update docker-compose.yml
4. Test full deployment pipeline
5. Update documentation

---

[Continue with remaining suggestions...]

```

Now, execute the analysis with the provided arguments: $ARGUMENTS
```
