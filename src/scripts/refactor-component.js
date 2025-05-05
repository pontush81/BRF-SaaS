#!/usr/bin/env node

/**
 * Component Refactoring Script
 * 
 * Helps automate the process of breaking down large components.
 * 
 * Usage:
 *   node src/scripts/refactor-component.js src/components/LargeComponent.tsx
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the target file from command line arguments
const targetFile = process.argv[2];

if (!targetFile) {
  console.error('Please provide a component file path.');
  console.error('Usage: node src/scripts/refactor-component.js src/components/LargeComponent.tsx');
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  console.error(`File not found: ${targetFile}`);
  process.exit(1);
}

// Extract file information
const fileContent = fs.readFileSync(targetFile, 'utf8');
const fileName = path.basename(targetFile, path.extname(targetFile));
const dirName = path.dirname(targetFile);
const newDirPath = path.join(dirName, fileName);

// Create directory structure
console.log(`Creating directory structure for ${fileName}...`);
if (!fs.existsSync(newDirPath)) {
  fs.mkdirSync(newDirPath, { recursive: true });
  fs.mkdirSync(path.join(newDirPath, 'components'), { recursive: true });
}

// Extract component props interface
const propsRegex = /interface\s+(\w+Props)\s*{([\s\S]*?)}/;
const propsMatch = fileContent.match(propsRegex);
let propsContent = '';

if (propsMatch) {
  propsContent = `export interface ${propsMatch[1]} {\n${propsMatch[2]}\n}\n`;
} else {
  propsContent = `export interface ${fileName}Props {\n  // TODO: Add props\n}\n`;
}

// Write the types file
console.log(`Creating ${fileName}Types.ts...`);
fs.writeFileSync(
  path.join(newDirPath, `${fileName}Types.ts`),
  `/**\n * ${fileName} Types\n */\n\n${propsContent}`
);

// Try to extract state hooks to create a custom hook
const stateHooksRegex = /const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState[<(].*?[>)]/g;
const stateHooks = [...fileContent.matchAll(stateHooksRegex)];

let customHookContent = `import { useState } from 'react';\n\n/**\n * Custom hook for ${fileName} state management\n */\nexport const use${fileName}State = () => {\n`;
if (stateHooks.length > 0) {
  stateHooks.forEach(match => {
    const stateName = match[1];
    const capitalizedStateName = match[2];
    customHookContent += `  const [${stateName}, set${capitalizedStateName}] = useState(/* TODO: Add proper type and initial value */);\n`;
  });
} else {
  customHookContent += '  // TODO: Add state variables\n';
}

customHookContent += '\n  return {\n';
if (stateHooks.length > 0) {
  stateHooks.forEach(match => {
    const stateName = match[1];
    const capitalizedStateName = match[2];
    customHookContent += `    ${stateName},\n    set${capitalizedStateName},\n`;
  });
} else {
  customHookContent += '    // TODO: Return state and setters\n';
}
customHookContent += '  };\n};\n';

// Write the custom hook file
console.log(`Creating use${fileName}State.ts...`);
fs.writeFileSync(
  path.join(newDirPath, `use${fileName}State.ts`),
  customHookContent
);

// Create index.ts file
console.log('Creating index.ts...');
fs.writeFileSync(
  path.join(newDirPath, 'index.ts'),
  `export { ${fileName} } from './${fileName}';\nexport * from './${fileName}Types';\n`
);

// Extract the component JSX
const componentRegex = /return\s*\(\s*<([\s\S]*?)>\s*([\s\S]*?)\s*<\/.*?>\s*\);/;
const componentMatch = fileContent.match(componentRegex);
let componentJsx = '';

if (componentMatch) {
  componentJsx = componentMatch[0];
} else {
  componentJsx = 'return (\n    <div>\n      {/* TODO: Implement component */}\n    </div>\n  );';
}

// Try to identify sub-components
// Find complex JSX elements that might be candidates for extraction
const jsxElementRegex = /<([A-Z][A-Za-z0-9]*).*?>/g;
const jsxMatches = [...fileContent.matchAll(jsxElementRegex)];

// Count occurrences of each JSX element
const jsxCounts = {};
jsxMatches.forEach(match => {
  const elementName = match[1];
  if (elementName !== fileName && elementName !== 'React') {
    jsxCounts[elementName] = (jsxCounts[elementName] || 0) + 1;
  }
});

// Get all repeated JSX elements
const repeatedJsx = Object.entries(jsxCounts)
  .filter(([_, count]) => count > 1)
  .sort((a, b) => b[1] - a[1]);

// Generate component skeletons
if (repeatedJsx.length > 0) {
  console.log('Generating sub-component skeletons...');
  
  repeatedJsx.forEach(([element, count]) => {
    const subComponentPath = path.join(newDirPath, 'components', `${element}.tsx`);
    if (!fs.existsSync(path.dirname(subComponentPath))) {
      fs.mkdirSync(path.dirname(subComponentPath), { recursive: true });
    }
    
    fs.writeFileSync(
      subComponentPath,
      `import React from 'react';\n\ninterface ${element}Props {\n  // TODO: Add props\n}\n\n/**\n * ${element} Component\n * Extracted from ${fileName}\n */\nexport const ${element}: React.FC<${element}Props> = (props) => {\n  return (\n    <div>\n      {/* TODO: Implement component */}\n    </div>\n  );\n};\n`
    );
    
    console.log(`  - Created ${element}.tsx (appears ${count} times in original)`);
  });
}

// Create stub for main component file
console.log(`Creating ${fileName}.tsx...`);
fs.writeFileSync(
  path.join(newDirPath, `${fileName}.tsx`),
  `import React from 'react';\nimport { ${fileName}Props } from './${fileName}Types';\nimport { use${fileName}State } from './use${fileName}State';\n\n// Import sub-components\n${repeatedJsx.map(([element]) => `import { ${element} } from './components/${element}';\n`).join('')}\n/**\n * ${fileName} Component\n */\nexport const ${fileName}: React.FC<${fileName}Props> = (props) => {\n  // Use the custom hook for state management\n  const { ${stateHooks.map(match => match[1]).join(', ') || '/* state variables */'} } = use${fileName}State();\n  \n  // TODO: Move the original implementation here and refactor\n  ${componentJsx}\n};\n`
);

// Create backup of original file
console.log(`Creating backup of original file...`);
fs.copyFileSync(targetFile, `${targetFile}.bak`);

console.log(`\n✅ Refactoring structure created for ${fileName}!`);
console.log(`\nNext steps:\n1. Compare the original file (${targetFile}.bak) with the new structure`);
console.log(`2. Move the component logic to ${newDirPath}/${fileName}.tsx`);
console.log(`3. Implement the sub-components in ${newDirPath}/components/`);
console.log(`4. Update the custom hook in ${newDirPath}/use${fileName}State.ts`);
console.log(`5. Update imports in other files to use the new structure\n`); 