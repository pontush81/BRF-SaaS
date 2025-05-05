#!/usr/bin/env node

/**
 * TypeScript Validation Script
 *
 * This script validates TypeScript code in the project by running the TypeScript compiler (tsc)
 * in "noEmit" mode, which checks types without generating JavaScript output.
 *
 * It's intended to be used as part of CI/CD workflows to ensure type safety.
 *
 * Usage:
 *   npm run ts:validate
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');

// eslint-disable-next-line no-console
console.log('🔍 Running TypeScript validation...');

try {
  // Use tsc with --noEmit to check types without generating JS
  const tscCommand = 'npx tsc --noEmit';

  try {
    const output = execSync(tscCommand, { encoding: 'utf8' });
    // eslint-disable-next-line no-console
    console.log('✅ TypeScript validation passed!');

    if (output.trim()) {
      // eslint-disable-next-line no-console
      console.log(output);
    }
  } catch (error) {
    const errorOutput = error.stdout || error.message;

    // Save error output to log file
    const logFile = path.join(logDir, 'ts-validation-errors.log');
    fs.writeFileSync(logFile, errorOutput);

    // eslint-disable-next-line no-console
    console.error('❌ TypeScript validation failed!');
    // eslint-disable-next-line no-console
    console.error(`   Error details saved to: ${logFile}`);

    // Analyze errors to provide more helpful feedback
    const errorCount = (errorOutput.match(/error TS\d+/g) || []).length;
    // eslint-disable-next-line no-console
    console.error(`   Found ${errorCount} TypeScript errors.`);

    // Look for common error patterns
    const anyErrors = (errorOutput.match(/TS7016|Type 'any'/g) || []).length;
    const implicitAnyErrors = (errorOutput.match(/TS7006|Implicit any/g) || [])
      .length;
    const nullErrors = (
      errorOutput.match(/TS2531|Object is possibly 'null'/g) || []
    ).length;
    const undefinedErrors = (
      errorOutput.match(/TS2532|Object is possibly 'undefined'/g) || []
    ).length;

    // eslint-disable-next-line no-console
    console.error('\n📊 Error Breakdown:');
    if (anyErrors > 0) {
      // eslint-disable-next-line no-console
      console.error(`   - 'any' type issues: ${anyErrors}`);
    }
    if (implicitAnyErrors > 0) {
      // eslint-disable-next-line no-console
      console.error(`   - Implicit 'any' issues: ${implicitAnyErrors}`);
    }
    if (nullErrors > 0) {
      // eslint-disable-next-line no-console
      console.error(`   - Null-related issues: ${nullErrors}`);
    }
    if (undefinedErrors > 0) {
      // eslint-disable-next-line no-console
      console.error(`   - Undefined-related issues: ${undefinedErrors}`);
    }

    // Provide suggestions
    // eslint-disable-next-line no-console
    console.error('\n💡 Suggestions:');
    if (anyErrors > 0 || implicitAnyErrors > 0) {
      // eslint-disable-next-line no-console
      console.error('   - Replace "any" types with more specific types');
      // eslint-disable-next-line no-console
      console.error('   - Consider using "unknown" instead of "any"');
    }
    if (nullErrors > 0 || undefinedErrors > 0) {
      // eslint-disable-next-line no-console
      console.error(
        '   - Add null/undefined checks before accessing properties'
      );
      // eslint-disable-next-line no-console
      console.error(
        '   - Use optional chaining (?.) and nullish coalescing (??) operators'
      );
    }

    // Fix option
    if (shouldFix) {
      // eslint-disable-next-line no-console
      console.log('\n🔧 Attempting to fix TypeScript issues...');
      try {
        // This is a simple example - in reality, automatic fixing of TypeScript errors is limited
        // Run ESLint with --fix to address some fixable TypeScript-related issues
        execSync('npx eslint . --ext .ts,.tsx --fix', { encoding: 'utf8' });
        // eslint-disable-next-line no-console
        console.log(
          '   Applied automatic fixes where possible. Re-run validation to check results.'
        );
      } catch (fixError) {
        // eslint-disable-next-line no-console
        console.error('   Failed to apply fixes:', fixError.message);
      }
    } else {
      // eslint-disable-next-line no-console
      console.log('\n💻 Run with --fix to attempt automatic fixes:');
      // eslint-disable-next-line no-console
      console.log('   npm run ts:validate -- --fix');
    }

    process.exit(1);
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('❌ Failed to run TypeScript validation:', error.message);
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log('🏁 TypeScript validation complete!');
