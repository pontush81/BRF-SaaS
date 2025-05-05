#!/usr/bin/env node

/**
 * Kodkvalitetskontroll
 *
 * Detta skript kör en fullständig kontroll av kodens kvalitet, inklusive:
 * - TypeScript-validering
 * - Linting
 * - Formatering
 * - Komponentanalys
 *
 * Användning:
 *   npm run quality-check              - Kör alla kontroller
 *   npm run quality-check -- --fix     - Kör och åtgärda problem
 *   npm run quality-check -- --path=src/components/auth - Kör på specifik katalog
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

// Tolka kommandoradsargument
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : null;

// Skapa loggkatalog om den inte finns
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// eslint-disable-next-line no-console
console.log('🚀 Startar kodkvalitetskontroll...');

// Kör kontroller och samla resultat
const results = {
  typeCheck: { success: false, message: '', command: 'npm run type-check' },
  typeValidate: { success: false, message: '', command: 'npm run ts:validate' },
  lint: {
    success: false,
    message: '',
    command: 'npm run lint' + (shouldFix ? ' --fix' : ''),
  },
  format: {
    success: false,
    message: '',
    command: 'npm run format' + (shouldFix ? '' : ':check'),
  },
};

// Funktion för att köra en kommandokontroll
function runCheck(name, command) {
  // eslint-disable-next-line no-console
  console.log(`\n🔍 Kör ${name}...`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    results[name].success = true;
    results[name].message = `✅ ${name} genomförd utan problem`;
    // eslint-disable-next-line no-console
    console.log(results[name].message);
    return output;
  } catch (error) {
    results[name].success = false;
    results[name].message = `❌ Problem hittades vid ${name}`;

    // Spara felutdata till logg
    const logFile = path.join(logDir, `${name}-errors.log`);
    fs.writeFileSync(logFile, error.stdout || error.message);

    // eslint-disable-next-line no-console
    console.error(results[name].message);
    // eslint-disable-next-line no-console
    console.error(`   Se ${logFile} för detaljer`);
    return error.stdout;
  }
}

// Kör komponentanalys på stor komponent
function analyzeComponents() {
  // eslint-disable-next-line no-console
  console.log('\n🔍 Letar efter stora komponenter...');

  try {
    // Hitta filer över 200 rader
    const findCommand = targetPath
      ? `find ${targetPath} -name "*.tsx" -type f | xargs wc -l | sort -nr | head -10`
      : `find src -name "*.tsx" -type f | xargs wc -l | sort -nr | head -10`;

    const largeFiles = execSync(findCommand, { encoding: 'utf8' }).split('\n');

    const bigComponents = largeFiles
      .filter(line => {
        const match = line.match(/^\s*(\d+)/);
        return match && parseInt(match[1]) > 200;
      })
      .map(line => line.replace(/^\s*\d+\s+/, ''))
      .filter(file => file.trim());

    if (bigComponents.length > 0) {
      // eslint-disable-next-line no-console
      console.log('\n⚠️ Stora komponenter hittades:');
      bigComponents.forEach(file => {
        // eslint-disable-next-line no-console
        console.log(`   - ${file}`);
        try {
          const output = execSync(
            `node src/scripts/analyze-component.js "${file}"`,
            { encoding: 'utf8' }
          );
          const logFile = path.join(
            logDir,
            `${path.basename(file, '.tsx')}-analysis.log`
          );
          fs.writeFileSync(logFile, output);
          // eslint-disable-next-line no-console
          console.log(`     Analys sparad till ${logFile}`);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`     Kunde inte analysera: ${error.message}`);
        }
      });

      return {
        success: false,
        message: '⚠️ Stora komponenter hittades och bör refaktoreras',
      };
    } else {
      return {
        success: true,
        message: '✅ Inga överdrivet stora komponenter hittades',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Problem vid analys av komponenter: ${error.message}`,
    };
  }
}

// Kör kontroller
runCheck('typeCheck', results.typeCheck.command);
runCheck('lint', results.lint.command);
runCheck('format', results.format.command);
const componentAnalysis = analyzeComponents();
runCheck('typeValidate', results.typeValidate.command);

// Sammanställ resultatet
// eslint-disable-next-line no-console
console.log('\n📊 Sammanfattning:');
Object.values(results).forEach(result => {
  // eslint-disable-next-line no-console
  console.log(result.message);
});
// eslint-disable-next-line no-console
console.log(componentAnalysis.message);

// Slutgiltigt resultat
const allSucceeded =
  Object.values(results).every(r => r.success) && componentAnalysis.success;

// eslint-disable-next-line no-console
console.log(
  '\n' +
    (allSucceeded
      ? '✅ Alla kontroller godkända! Koden är redo att skickas in.'
      : '⚠️ Vissa kontroller misslyckades. Se loggar för detaljer.')
);

if (!allSucceeded) {
  // eslint-disable-next-line no-console
  console.log('\nFörslag på åtgärder:');
  if (!results.typeCheck.success) {
    // eslint-disable-next-line no-console
    console.log('- Åtgärda typfel: kontrollera logs/typeCheck-errors.log');
  }
  if (!results.typeValidate.success) {
    // eslint-disable-next-line no-console
    console.log('- Kör med fix: npm run ts:validate --fix');
  }
  if (!results.lint.success) {
    // eslint-disable-next-line no-console
    console.log('- Åtgärda linting-problem: npm run lint --fix');
  }
  if (!results.format.success) {
    // eslint-disable-next-line no-console
    console.log('- Formatera koden: npm run format');
  }
  if (!componentAnalysis.success) {
    // eslint-disable-next-line no-console
    console.log('- Refaktorera stora komponenter: npm run refactor [sökväg]');
  }
}

// Returnera exit code 0 för att inte bryta byggprocessen
process.exit(0);
