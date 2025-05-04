#!/usr/bin/env node

/**
 * TypeScript validation script
 * 
 * Run this script to validate TypeScript types without failing the build
 * Useful for development and finding type errors before committing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Validating TypeScript types...');

try {
  // Run TypeScript compiler to find errors but don't emit files
  const output = execSync('npx tsc --noEmit', { encoding: 'utf8' });
  console.log('TypeScript validation completed successfully!');
  console.log(output);
  process.exit(0);
} catch (error) {
  console.error('TypeScript validation found errors:');
  console.error(error.stdout);
  
  // Write errors to a log file for reference
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, 'typescript-errors.log');
  fs.writeFileSync(logFile, error.stdout);
  
  console.log(`Errors written to ${logFile}`);
  console.log('These errors won\'t prevent building or deploying the app, but should be fixed for code quality.');
  
  // Exit with success code to allow builds to continue
  process.exit(0);
} 