#!/usr/bin/env node

/**
 * Environment Variables Validator
 *
 * Validates consistency between:
 * - Variables documented in .env.example
 * - Secrets used in GitHub workflows
 * - Variables referenced in codebase
 *
 * Usage:
 *   node scripts/validate-env-vars.js
 *
 * Exit codes:
 *   0 - All variables consistent
 *   1 - Inconsistencies found
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

/**
 * Parses .env.example and extracts documented variables
 */
function parseEnvExample(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const variables = new Set();

  // Match variable declarations (KEY=value) but skip comments
  const lines = content.split('\n');
  lines.forEach((line) => {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (trimmed.startsWith('#') || trimmed === '') return;

    // Match variable declarations
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      variables.add(match[1]);
    }
  });

  return variables;
}

/**
 * Extracts secrets used in GitHub workflow files
 */
function extractWorkflowSecrets(workflowDir) {
  const secrets = new Set();

  if (!fs.existsSync(workflowDir)) {
    return secrets;
  }

  const workflowFiles = fs
    .readdirSync(workflowDir)
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'));

  workflowFiles.forEach((file) => {
    const content = fs.readFileSync(path.join(workflowDir, file), 'utf-8');

    // Match secrets.VARIABLE_NAME
    const matches = content.matchAll(/secrets\.([A-Z_][A-Z0-9_]*)/g);
    for (const match of matches) {
      secrets.add(match[1]);
    }
  });

  return secrets;
}

/**
 * Extracts environment variables referenced in code
 */
function extractCodeEnvVars(srcDirs) {
  const envVars = new Set();

  function searchDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules, .git, .next, etc.
      if (entry.isDirectory()) {
        if (
          ![
            'node_modules',
            '.git',
            '.next',
            'dist',
            'build',
            '.open-next',
          ].includes(entry.name)
        ) {
          searchDirectory(fullPath);
        }
        return;
      }

      // Only check TypeScript/JavaScript files
      if (!/\.(ts|tsx|js|jsx)$/.test(entry.name)) return;

      const content = fs.readFileSync(fullPath, 'utf-8');

      // Match process.env.VARIABLE_NAME
      const matches = content.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
      for (const match of matches) {
        envVars.add(match[1]);
      }

      // Match import.meta.env.VARIABLE_NAME (Vite pattern)
      const viteMatches = content.matchAll(
        /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
      );
      for (const match of viteMatches) {
        envVars.add(match[1]);
      }
    });
  }

  srcDirs.forEach((dir) => searchDirectory(dir));

  return envVars;
}

/**
 * Main validation function
 */
function main() {
  console.log(
    `${colors.blue}🔐 Environment Variables Validator${colors.reset}\n`,
  );

  const rootDir = process.cwd();
  const envExamplePath = path.join(rootDir, '.env.example');
  const workflowDir = path.join(rootDir, '.github', 'workflows');
  const srcDirs = [
    path.join(rootDir, 'app'),
    path.join(rootDir, 'src'),
    path.join(rootDir, 'lib'),
  ];

  // Also check root-level config files
  // Note: Only includes files with JS/TS syntax (process.env.X / getRequiredEnv('X'))
  // package.json uses shell-style $VAR/%VAR% which requires different parsing
  const rootConfigFiles = [
    'drizzle.config.ts',
    'next.config.ts',
  ]
    .map((file) => path.join(rootDir, file))
    .filter((file) => fs.existsSync(file));

  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.log(`${colors.yellow}⚠️  .env.example not found${colors.reset}`);
    console.log('Skipping validation...\n');
    process.exit(0);
  }

  // Parse documented variables
  const documentedVars = parseEnvExample(envExamplePath);
  console.log(
    `${colors.blue}📝 Documented in .env.example:${colors.reset} ${documentedVars.size} variables`,
  );
  if (documentedVars.size > 0) {
    console.log(`   ${Array.from(documentedVars).sort().join(', ')}\n`);
  }

  // Extract workflow secrets
  const workflowSecrets = extractWorkflowSecrets(workflowDir);
  console.log(
    `${colors.blue}🔒 Used in GitHub workflows:${colors.reset} ${workflowSecrets.size} secrets`,
  );
  if (workflowSecrets.size > 0) {
    console.log(`   ${Array.from(workflowSecrets).sort().join(', ')}\n`);
  }

  // Extract code environment variables
  const codeEnvVars = extractCodeEnvVars(srcDirs);

  // Also check root-level config files
  rootConfigFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Match process.env.VARIABLE_NAME
    const processEnvMatches = content.matchAll(
      /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    );
    for (const match of processEnvMatches) {
      codeEnvVars.add(match[1]);
    }

    // Match getRequiredEnv('VARIABLE_NAME') pattern (drizzle.config.ts)
    const getEnvMatches = content.matchAll(
      /getRequiredEnv\(['"]([A-Z_][A-Z0-9_]*)["']\)/g,
    );
    for (const match of getEnvMatches) {
      codeEnvVars.add(match[1]);
    }
  });

  console.log(
    `${colors.blue}💻 Referenced in code:${colors.reset} ${codeEnvVars.size} variables`,
  );
  if (codeEnvVars.size > 0) {
    console.log(`   ${Array.from(codeEnvVars).sort().join(', ')}\n`);
  }

  // Analyze inconsistencies
  console.log(`${'='.repeat(70)}\n`);
  console.log(`${colors.blue}📊 Analysis${colors.reset}\n`);

  let hasIssues = false;

  // Secrets used in workflows but not documented
  const undocumentedSecrets = Array.from(workflowSecrets).filter(
    (secret) => !documentedVars.has(secret),
  );

  if (undocumentedSecrets.length > 0) {
    hasIssues = true;
    console.log(
      `${colors.red}❌ Secrets used in workflows but NOT documented in .env.example:${colors.reset}`,
    );
    undocumentedSecrets.forEach((secret) => {
      console.log(`   - ${secret}`);
    });
    console.log('\n💡 Add these secrets to .env.example with documentation\n');
  }

  // Variables documented but not used anywhere
  const unusedVars = Array.from(documentedVars).filter(
    (varName) => !workflowSecrets.has(varName) && !codeEnvVars.has(varName),
  );

  if (unusedVars.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Variables documented but NOT used anywhere:${colors.reset}`,
    );
    unusedVars.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log(
      '\n💡 Consider removing these from .env.example or verify they are used\n',
    );
  }

  // Code variables not documented
  const undocumentedCodeVars = Array.from(codeEnvVars).filter(
    (varName) => !documentedVars.has(varName),
  );

  if (undocumentedCodeVars.length > 0) {
    hasIssues = true;
    console.log(
      `${colors.red}❌ Variables used in code but NOT documented in .env.example:${colors.reset}`,
    );
    undocumentedCodeVars.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log(
      '\n💡 Add these variables to .env.example with documentation\n',
    );
  }

  // Summary
  if (!hasIssues && unusedVars.length === 0) {
    console.log(
      `${colors.green}✅ All environment variables are properly documented and used${colors.reset}\n`,
    );
    process.exit(0);
  } else if (!hasIssues) {
    console.log(
      `${colors.yellow}⚠️  Some warnings found but no critical issues${colors.reset}\n`,
    );
    process.exit(0);
  } else {
    console.log(
      `${colors.red}❌ Critical inconsistencies found${colors.reset}\n`,
    );
    process.exit(1);
  }
}

// Run the validator
main();
