#!/usr/bin/env node

/**
 * Component Refactoring Helper
 *
 * This script helps in refactoring React components by:
 * - Creating the proper directory structure
 * - Splitting a component into multiple files
 * - Extracting types, hooks, and utilities
 *
 * Usage:
 *   node src/scripts/refactor-component.js src/components/LargeComponent.tsx
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
const { execSync } = require('child_process');

// Get command line args
const targetFile = process.argv[2];

if (!targetFile) {
  // eslint-disable-next-line no-console
  console.error('Please provide a component file path.');
  // eslint-disable-next-line no-console
  console.error(
    'Usage: node src/scripts/refactor-component.js src/components/LargeComponent.tsx'
  );
  process.exit(1);
}

if (!fs.existsSync(targetFile)) {
  // eslint-disable-next-line no-console
  console.error(`File not found: ${targetFile}`);
  process.exit(1);
}

// Get component name and directory
const fileExtension = path.extname(targetFile);
const baseName = path.basename(targetFile, fileExtension);
const dirName = path.dirname(targetFile);
const newDirPath = path.join(dirName, baseName);

// Read the component file
const componentContent = fs.readFileSync(targetFile, 'utf8');
const lines = componentContent.split('\n');

// Analyze imports
const importLines = lines.filter(line => line.startsWith('import '));
const imports = importLines.join('\n');

// Extract types from the component file
const typeRegex =
  /(?:export\s+)?(?:type|interface)\s+([A-Za-z0-9_]+)(?:<.*?>)?\s*(?:=|{)/g;
const typeMatches = [...componentContent.matchAll(typeRegex)];
const types = typeMatches
  .map(match => {
    // Find the full type definition
    const startIdx = match.index;
    let braceCount = 0;
    let endIdx = componentContent.length;

    for (let i = startIdx; i < componentContent.length; i++) {
      if (componentContent[i] === '{') braceCount++;
      if (componentContent[i] === '}') {
        braceCount--;
        if (braceCount === 0 && componentContent[i - 1] !== '\\') {
          endIdx = i + 1;
          break;
        }
      }

      // Handle "type X = Y" format without braces
      if (componentContent[i] === ';' && braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }

    return componentContent.substring(startIdx, endIdx);
  })
  .join('\n\n');

// Create the new directory structure
// eslint-disable-next-line no-console
console.log(`\n🏗️ Creating directory structure for ${baseName}...`);
if (!fs.existsSync(newDirPath)) {
  fs.mkdirSync(newDirPath);
  // eslint-disable-next-line no-console
  console.log(`✅ Created directory: ${newDirPath}`);
}

const componentsDir = path.join(newDirPath, 'components');
if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir);
  // eslint-disable-next-line no-console
  console.log(`✅ Created directory: ${componentsDir}`);
}

// Create the files for the refactored component
// eslint-disable-next-line no-console
console.log('\n📝 Creating files...');

// 1. Create the types file
const typesContent = `/**
 * Types for ${baseName} component
 */
${imports}

${
  types ||
  `// Add your types here
export interface ${baseName}Props {
  // Add props here
}
`
}
`;

const typesPath = path.join(newDirPath, `${baseName}Types.ts`);
fs.writeFileSync(typesPath, typesContent);
// eslint-disable-next-line no-console
console.log(`✅ Created: ${typesPath}`);

// 2. Create the state hook file
const stateHookContent = `/**
 * State management for ${baseName} component
 */
import { useState, useEffect } from 'react';
import { ${baseName}Props } from './${baseName}Types';

export const use${baseName}State = (props: ${baseName}Props) => {
  // Add your state variables and hooks here
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize component
  }, []);

  // Add your handlers and business logic here

  return {
    // Return state and handlers
    loading,
    setLoading,
  };
};
`;

const stateHookPath = path.join(newDirPath, `use${baseName}State.ts`);
fs.writeFileSync(stateHookPath, stateHookContent);
// eslint-disable-next-line no-console
console.log(`✅ Created: ${stateHookPath}`);

// 3. Create the main component file
const mainComponentContent = `/**
 * ${baseName} Component
 */
import { ${baseName}Props } from './${baseName}Types';
import { use${baseName}State } from './use${baseName}State';

export const ${baseName} = (props: ${baseName}Props) => {
  const {
    loading,
  } = use${baseName}State(props);

  return (
    <div>
      {/* Your component JSX here */}
      {loading ? <div>Loading...</div> : <div>Component Content</div>}
    </div>
  );
};
`;

const mainComponentPath = path.join(newDirPath, `${baseName}.tsx`);
fs.writeFileSync(mainComponentPath, mainComponentContent);
// eslint-disable-next-line no-console
console.log(`✅ Created: ${mainComponentPath}`);

// 4. Create index file for re-exporting
const indexContent = `/**
 * Export ${baseName} component and related types
 */
export * from './${baseName}';
export * from './${baseName}Types';
`;

const indexPath = path.join(newDirPath, 'index.ts');
fs.writeFileSync(indexPath, indexContent);
// eslint-disable-next-line no-console
console.log(`✅ Created: ${indexPath}`);

// 5. Create an example sub-component
const subComponentContent = `/**
 * SubComponent for ${baseName}
 */
import React from 'react';

interface SubComponentProps {
  title: string;
}

export const SubComponent = ({ title }: SubComponentProps) => {
  return (
    <div>
      <h3>{title}</h3>
      {/* Add your JSX here */}
    </div>
  );
};
`;

const subComponentPath = path.join(componentsDir, 'SubComponent.tsx');
fs.writeFileSync(subComponentPath, subComponentContent);
// eslint-disable-next-line no-console
console.log(`✅ Created: ${subComponentPath}`);

// Provide next steps
// eslint-disable-next-line no-console
console.log('\n🎉 Component refactoring structure created!');
// eslint-disable-next-line no-console
console.log('\nNext steps:');
// eslint-disable-next-line no-console
console.log(
  '1. Move your component logic from the original file to the new structure'
);
// eslint-disable-next-line no-console
console.log('2. Update imports in files that use this component');
// eslint-disable-next-line no-console
console.log('3. Once everything is working, you can remove the original file');
// eslint-disable-next-line no-console
console.log(`\nTo remove the original file: rm ${targetFile}`);

// eslint-disable-next-line no-console
console.log('\nHappy refactoring! 🚀');
