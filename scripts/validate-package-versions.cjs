#!/usr/bin/env node

/**
 * Package Version Validator
 *
 * Validates that all package versions in package.json exist on npm registry.
 * Helps catch typos in version numbers and non-existent package versions.
 *
 * Usage:
 *   node scripts/validate-package-versions.js
 *
 * Exit codes:
 *   0 - All packages valid
 *   1 - Invalid packages found
 */

const https = require('https');
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
 * Fetches package metadata from npm registry
 */
function fetchPackageInfo(packageName) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName.replace('/', '%2F')}`;

    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(new Error(`Failed to parse JSON for ${packageName}`));
            }
          } else if (res.statusCode === 404) {
            resolve(null); // Package doesn't exist
          } else {
            reject(new Error(`HTTP ${res.statusCode} for ${packageName}`));
          }
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Parses a version range and extracts the base version
 */
function parseVersionRange(versionRange) {
  // Remove prefixes like ^, ~, >=, etc.
  return versionRange.replace(/^[\^~>=<]+/, '').split('.')[0];
}

/**
 * Checks if a version exists for a package
 */
async function validatePackageVersion(packageName, requestedVersion) {
  try {
    console.log(
      `${colors.blue}Checking${colors.reset} ${packageName}@${requestedVersion}...`,
    );

    const packageInfo = await fetchPackageInfo(packageName);

    if (!packageInfo) {
      return {
        package: packageName,
        requestedVersion,
        status: 'not_found',
        message: 'Package does not exist on npm',
      };
    }

    const latestVersion = packageInfo['dist-tags']?.latest;
    const availableVersions = Object.keys(packageInfo.versions || {});

    // Clean the requested version for comparison
    const cleanVersion = requestedVersion.replace(/^[\^~>=<]+/, '');

    // Check if exact version exists
    const versionExists = availableVersions.includes(cleanVersion);

    if (!versionExists) {
      return {
        package: packageName,
        requestedVersion,
        latestVersion,
        status: 'invalid_version',
        message: `Version ${requestedVersion} does not exist. Latest: ${latestVersion}`,
      };
    }

    // Check if using outdated major version
    const requestedMajor = parseInt(parseVersionRange(requestedVersion));
    const latestMajor = parseInt(parseVersionRange(latestVersion));

    if (requestedMajor < latestMajor) {
      return {
        package: packageName,
        requestedVersion,
        latestVersion,
        status: 'outdated_major',
        message: `Using v${requestedMajor}.x but v${latestMajor}.x is available`,
      };
    }

    return {
      package: packageName,
      requestedVersion,
      latestVersion,
      status: 'valid',
    };
  } catch (error) {
    return {
      package: packageName,
      requestedVersion,
      status: 'error',
      message: error.message,
    };
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log(`${colors.blue}📦 Package Version Validator${colors.reset}\n`);

  // Read package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      `${colors.red}❌ Error: package.json not found${colors.reset}`,
    );
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  // Collect all dependencies
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  if (Object.keys(allDeps).length === 0) {
    console.log(`${colors.yellow}⚠️  No dependencies found${colors.reset}`);
    return;
  }

  console.log(`Found ${Object.keys(allDeps).length} packages to validate\n`);

  // Validate each package
  const results = [];

  for (const [packageName, version] of Object.entries(allDeps)) {
    const result = await validatePackageVersion(packageName, version);
    results.push(result);

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Summarize results
  console.log(`\n${'='.repeat(70)}\n`);
  console.log(`${colors.blue}📊 Summary${colors.reset}\n`);

  const notFound = results.filter((r) => r.status === 'not_found');
  const invalidVersion = results.filter((r) => r.status === 'invalid_version');
  const outdatedMajor = results.filter((r) => r.status === 'outdated_major');
  const errors = results.filter((r) => r.status === 'error');
  const valid = results.filter((r) => r.status === 'valid');

  // Report issues
  let hasErrors = false;

  if (notFound.length > 0) {
    hasErrors = true;
    console.log(
      `${colors.red}❌ Packages not found (${notFound.length}):${colors.reset}`,
    );
    notFound.forEach((r) => {
      console.log(`   - ${r.package}@${r.requestedVersion}`);
    });
    console.log();
  }

  if (invalidVersion.length > 0) {
    hasErrors = true;
    console.log(
      `${colors.red}❌ Invalid versions (${invalidVersion.length}):${colors.reset}`,
    );
    invalidVersion.forEach((r) => {
      console.log(
        `   - ${r.package}@${r.requestedVersion} → Latest: ${r.latestVersion}`,
      );
    });
    console.log();
  }

  if (outdatedMajor.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Outdated major versions (${outdatedMajor.length}):${colors.reset}`,
    );
    outdatedMajor.forEach((r) => {
      console.log(
        `   - ${r.package}@${r.requestedVersion} → Latest: ${r.latestVersion}`,
      );
    });
    console.log();
  }

  if (errors.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Validation errors (${errors.length}):${colors.reset}`,
    );
    errors.forEach((r) => {
      console.log(`   - ${r.package}: ${r.message}`);
    });
    console.log();
  }

  if (valid.length > 0) {
    console.log(
      `${colors.green}✅ Valid packages: ${valid.length}${colors.reset}`,
    );
  }

  // Exit with appropriate code
  if (hasErrors) {
    console.log(`\n${colors.red}❌ Validation failed${colors.reset}`);
    process.exit(1);
  } else {
    console.log(
      `\n${colors.green}✅ All packages validated successfully${colors.reset}`,
    );
    process.exit(0);
  }
}

// Run the validator
main().catch((error) => {
  console.error(`${colors.red}❌ Unexpected error:${colors.reset}`, error);
  process.exit(1);
});
