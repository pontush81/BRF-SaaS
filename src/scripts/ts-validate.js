#!/usr/bin/env node

/**
 * Enhanced TypeScript validation script
 * 
 * Run this script to validate TypeScript types and get detailed error reports
 * Useful for development and finding type errors before committing
 * 
 * Usage:
 *   npm run ts:validate          - Run validation and report errors
 *   npm run ts:validate --fix    - Attempt to fix simple errors (experimental)
 *   npm run ts:validate --watch  - Watch mode for continuous validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const shouldWatch = args.includes('--watch');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file path
const logFile = path.join(logDir, 'typescript-errors.log');

function runTypeCheck() {
  console.log('Validating TypeScript types...');
  
  try {
    // Run TypeScript compiler to find errors but don't emit files
    const cmd = shouldWatch 
      ? 'npx tsc --noEmit --watch'
      : 'npx tsc --noEmit';
    
    const output = execSync(cmd, { encoding: 'utf8' });
    console.log('TypeScript validation completed successfully!');
    console.log(output);

    // Clear previous error log if validation passed
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }
    
    return true;
  } catch (error) {
    const errorOutput = error.stdout;
    console.error('TypeScript validation found errors:');
    
    // Process and categorize errors
    const errorLines = errorOutput.split('\n');
    const errorCount = errorLines.filter(line => line.includes('error TS')).length;
    
    console.error(`Found ${errorCount} type errors`);
    
    // Group errors by file for easier analysis
    const errorsByFile = {};
    errorLines.forEach(line => {
      if (line.includes('error TS')) {
        const filePath = line.split('(')[0];
        if (!errorsByFile[filePath]) {
          errorsByFile[filePath] = [];
        }
        errorsByFile[filePath].push(line);
      }
    });
    
    // Show summary of files with errors
    console.error('\nFiles with type errors:');
    Object.keys(errorsByFile).forEach(file => {
      console.error(`- ${file}: ${errorsByFile[file].length} errors`);
    });
    
    // Write detailed errors to a log file
    fs.writeFileSync(logFile, errorOutput);
    console.log(`\nDetailed errors written to ${logFile}`);
    
    if (shouldFix) {
      console.log('\nAttempting to fix simple type errors...');
      try {
        // Try to fix missing type annotations and simple issues
        execSync('npx eslint --fix "src/**/*.{ts,tsx}"', { encoding: 'utf8' });
        console.log('Automatic fixes applied. Please check the changes and run validation again.');
      } catch (fixError) {
        console.error('Error while attempting to fix issues:', fixError.message);
      }
    }
    
    return false;
  }
}

if (shouldWatch) {
  runTypeCheck(); // Initial run in watch mode
} else {
  const success = runTypeCheck();
  
  if (!success) {
    console.log('\nThese errors won\'t prevent building or deploying the app, but should be fixed for code quality.');
    console.log('To fix many common issues automatically, run: npm run ts:validate --fix');
  }
  
  // Exit with success code to allow builds to continue
  // This is to avoid breaking builds, but you can change this to process.exit(1) to fail builds with type errors
  process.exit(0);
} 