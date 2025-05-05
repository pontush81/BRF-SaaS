#!/usr/bin/env node

/**
 * Component Splitter
 *
 * A utility to help refactor large React components into smaller, more manageable ones.
 * This script analyzes a React component file and suggests potential ways to split it.
 *
 * Usage:
 *   node src/scripts/component-splitter.js src/components/LargeComponent.tsx
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
const { execSync } = require('child_process');

// Get the target file from command line arguments
const targetFile = process.argv[2];

if (!targetFile) {
  // eslint-disable-next-line no-console
  console.error('Please provide a component file path.');
  // eslint-disable-next-line no-console
  console.error(
    'Usage: node src/scripts/component-splitter.js src/components/LargeComponent.tsx'
  );
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  // eslint-disable-next-line no-console
  console.error(`File not found: ${targetFile}`);
  process.exit(1);
}

const fileContent = fs.readFileSync(targetFile, 'utf8');
const fileLines = fileContent.split('\n');

// eslint-disable-next-line no-console
console.log(`Analyzing ${targetFile}...`);
// eslint-disable-next-line no-console
console.log(`File size: ${fileLines.length} lines`);

// Find React components/functions in the file
const functionComponentRegex =
  /^(export\s+)?(const|function)\s+([A-Z][A-Za-z0-9]*)\s*(:?\s*React\.FC(?:<.*>)?)?\s*=?\s*(\(.*?\)|.*?=>)/gm;
const functionMatches = [...fileContent.matchAll(functionComponentRegex)];

// Find JSX elements that might be candidates for extraction
const jsxElementRegex = /<([A-Z][A-Za-z0-9]*).*?>/g;
const jsxMatches = [...fileContent.matchAll(jsxElementRegex)];

// Count occurrences of each JSX element
const jsxCounts = {};
jsxMatches.forEach(match => {
  const elementName = match[1];
  jsxCounts[elementName] = (jsxCounts[elementName] || 0) + 1;
});

// Find internal functions that could be extracted
const internalFunctionRegex =
  /const\s+([a-z][A-Za-z0-9]*)\s*=\s*(?:useCallback\()?\(?.*?\)(?:\s*=>\s*{)/g;
const internalFunctions = [...fileContent.matchAll(internalFunctionRegex)];

// eslint-disable-next-line no-console
console.log('\n🔍 ANALYSIS RESULTS:');
// eslint-disable-next-line no-console
console.log('=====================');

// Report on component size
if (fileLines.length > 300) {
  // eslint-disable-next-line no-console
  console.log(
    '❌ This component is very large (>300 lines) and should be refactored.'
  );
} else if (fileLines.length > 200) {
  // eslint-disable-next-line no-console
  console.log(
    '⚠️ This component is getting large (>200 lines) and might benefit from refactoring.'
  );
} else {
  // eslint-disable-next-line no-console
  console.log('✅ Component size is acceptable (<200 lines).');
}

// Report on identified components
// eslint-disable-next-line no-console
console.log('\n📦 COMPONENTS FOUND:');
if (functionMatches.length > 0) {
  functionMatches.forEach(match => {
    // eslint-disable-next-line no-console
    console.log(`- ${match[3]}`);
  });
} else {
  // eslint-disable-next-line no-console
  console.log('No components found in the file.');
}

// Report on internal functions
// eslint-disable-next-line no-console
console.log('\n🧩 CANDIDATE FUNCTIONS TO EXTRACT:');
if (internalFunctions.length > 0) {
  internalFunctions.forEach(match => {
    // eslint-disable-next-line no-console
    console.log(`- ${match[1]}`);
  });
} else {
  // eslint-disable-next-line no-console
  console.log('No internal functions found that could be extracted.');
}

// Report on JSX elements that appear multiple times
// eslint-disable-next-line no-console
console.log('\n🔄 REPEATED JSX ELEMENTS (potential components):');
const repeatedJsx = Object.entries(jsxCounts)
  .filter(([_, count]) => count > 1) // eslint-disable-line @typescript-eslint/no-unused-vars
  .sort((a, b) => b[1] - a[1]);

if (repeatedJsx.length > 0) {
  repeatedJsx.forEach(([element, count]) => {
    // eslint-disable-next-line no-console
    console.log(`- ${element} (appears ${count} times)`);
  });
} else {
  // eslint-disable-next-line no-console
  console.log('No repeated JSX elements found.');
}

// Generate suggestions for refactoring
// eslint-disable-next-line no-console
console.log('\n💡 SUGGESTED REFACTORING STRATEGY:');

if (fileLines.length > 200) {
  // eslint-disable-next-line no-console
  console.log('\n1. Create a new directory structure:');
  const baseFileName = path.basename(targetFile, path.extname(targetFile));
  const dirName = path.dirname(targetFile);
  // eslint-disable-next-line no-console
  console.log(`   mkdir -p ${dirName}/${baseFileName}`);

  // eslint-disable-next-line no-console
  console.log('\n2. Split into smaller components:');
  if (internalFunctions.length > 0) {
    internalFunctions.forEach(match => {
      // eslint-disable-next-line no-console
      console.log(`   - Extract "${match[1]}" to its own component file`);
    });
  }

  if (repeatedJsx.length > 0) {
    repeatedJsx.slice(0, 3).forEach(([element]) => {
      // eslint-disable-next-line no-console
      console.log(`   - Create a dedicated "${element}" component`);
    });
  }

  // eslint-disable-next-line no-console
  console.log('\n3. Create an index.ts file to re-export components:');
  // eslint-disable-next-line no-console
  console.log(`   ${dirName}/${baseFileName}/index.ts`);

  // eslint-disable-next-line no-console
  console.log('\n4. Example component structure:');
  // eslint-disable-next-line no-console
  console.log(`   ${baseFileName}/
   ├── index.ts
   ├── ${baseFileName}.tsx
   ├── ${baseFileName}Types.ts
   ├── use${baseFileName}State.ts
   └── components/
       ├── Component1.tsx
       ├── Component2.tsx
       └── ...`);
}

// eslint-disable-next-line no-console
console.log(
  '\nAnalysis complete! Use these suggestions to refactor your component into smaller, more maintainable pieces.'
);
