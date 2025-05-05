#!/usr/bin/env node

/**
 * Component Analyzer
 *
 * This script analyzes a React component file to identify potential issues and ways to improve it.
 *
 * Usage:
 *   node src/scripts/analyze-component.js src/components/MyComponent.tsx
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  // eslint-disable-next-line no-console
  console.error('Please provide a component file path.');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  // eslint-disable-next-line no-console
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Read the file
const fileContent = fs.readFileSync(filePath, 'utf8');
const lineCount = fileContent.split('\n').length;

// Analyze imports
const imports = fileContent.match(/import .* from .*/g) || [];
const importCount = imports.length;

// Find useState hooks
const useStateCount = (fileContent.match(/useState[<(]/g) || []).length;

// Find useEffect hooks
const useEffectCount = (fileContent.match(/useEffect\(/g) || []).length;

// Look for complex conditionals
const complexConditionalsCount = (
  fileContent.match(/if \(.*&&.*\|{2}.*\)|\? .* : .* \? .* :/g) || []
).length;

// Check for multiple return statements
const returnStatementsCount = (
  fileContent.match(/return (?!{|null|undefined)/g) || []
).length;

// Look for long JSX expressions
const longJsxLines = fileContent
  .split('\n')
  .filter(line => line.trim().match(/<.*>/) && line.length > 80).length;

// Check for large inline functions
const longInlineFunctions = (fileContent.match(/=>\s*{[^}]{100,}}/g) || [])
  .length;

// eslint-disable-next-line no-console
console.log(`📊 COMPONENT ANALYSIS: ${path.basename(filePath)}`);
// eslint-disable-next-line no-console
console.log('='.repeat(50));

// eslint-disable-next-line no-console
console.log(`\n📏 SIZE METRICS:`);
// eslint-disable-next-line no-console
console.log(`- Total lines: ${lineCount}`);
// eslint-disable-next-line no-console
console.log(`- Import statements: ${importCount}`);

// eslint-disable-next-line no-console
console.log(`\n🪝 HOOK USAGE:`);
// eslint-disable-next-line no-console
console.log(`- useState calls: ${useStateCount}`);
// eslint-disable-next-line no-console
console.log(`- useEffect calls: ${useEffectCount}`);

// eslint-disable-next-line no-console
console.log(`\n🚩 COMPLEXITY FLAGS:`);
// eslint-disable-next-line no-console
console.log(`- Complex conditionals: ${complexConditionalsCount}`);
// eslint-disable-next-line no-console
console.log(
  `- Multiple return statements: ${returnStatementsCount > 1 ? returnStatementsCount : 0}`
);
// eslint-disable-next-line no-console
console.log(`- Long JSX lines (>80 chars): ${longJsxLines}`);
// eslint-disable-next-line no-console
console.log(`- Large inline functions: ${longInlineFunctions}`);

// Calculate overall complexity score
const complexityScore =
  (lineCount > 300 ? 3 : lineCount > 200 ? 2 : lineCount > 100 ? 1 : 0) +
  (importCount > 20 ? 2 : importCount > 10 ? 1 : 0) +
  (useStateCount > 5 ? 2 : useStateCount > 3 ? 1 : 0) +
  (useEffectCount > 3 ? 2 : useEffectCount > 1 ? 1 : 0) +
  (complexConditionalsCount > 3 ? 2 : complexConditionalsCount > 0 ? 1 : 0) +
  (returnStatementsCount > 3 ? 2 : returnStatementsCount > 1 ? 1 : 0) +
  (longJsxLines > 10 ? 3 : longJsxLines > 5 ? 2 : longJsxLines > 0 ? 1 : 0) +
  (longInlineFunctions > 0 ? 2 : 0);

let complexityLevel = 'Low';
if (complexityScore > 10) complexityLevel = 'Very High';
else if (complexityScore > 7) complexityLevel = 'High';
else if (complexityScore > 4) complexityLevel = 'Medium';

// eslint-disable-next-line no-console
console.log(`\n🔍 OVERALL ASSESSMENT:`);
// eslint-disable-next-line no-console
console.log(`- Complexity: ${complexityLevel} (score: ${complexityScore}/16)`);

// Provide recommendations
// eslint-disable-next-line no-console
console.log(`\n💡 RECOMMENDATIONS:`);

if (lineCount > 200) {
  // eslint-disable-next-line no-console
  console.log(
    '- Consider splitting this component into smaller sub-components'
  );
}

if (useStateCount > 5) {
  // eslint-disable-next-line no-console
  console.log(
    '- Extract state logic into a custom hook (useComponentState.ts)'
  );
}

if (useEffectCount > 3) {
  // eslint-disable-next-line no-console
  console.log('- Consider splitting effects or moving to a custom hook');
}

if (complexConditionalsCount > 3) {
  // eslint-disable-next-line no-console
  console.log(
    '- Simplify complex conditionals with helper functions or computed values'
  );
}

if (returnStatementsCount > 3) {
  // eslint-disable-next-line no-console
  console.log('- Reduce multiple return statements for better readability');
}

if (longJsxLines > 5) {
  // eslint-disable-next-line no-console
  console.log(
    '- Break down long JSX lines into multiple lines for better readability'
  );
}

if (longInlineFunctions > 0) {
  // eslint-disable-next-line no-console
  console.log('- Extract large inline functions to named functions');
}

// eslint-disable-next-line no-console
console.log(
  `\nAnalysis complete. Use these insights to improve the component's maintainability.`
);
