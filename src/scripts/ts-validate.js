#!/usr/bin/env node

/**
 * TypeScript Validering
 * 
 * Detta skript kör TypeScript-typkontroll med produktionsinställningar
 * för att upptäcka typfel innan de når bygget.
 * 
 * Kör med:
 * node src/scripts/ts-validate.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Färger för utskrift i terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

console.log(`\n${colors.blue}⚡ TypeScript Valideringsverktyg${colors.reset}`);
console.log(`${colors.blue}===============================\n${colors.reset}`);

try {
  // Kontrollera om vi är i root-mappen för projektet
  if (!fs.existsSync('package.json')) {
    console.error(`${colors.red}Fel: Kör detta skript från projektets rotmapp${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.magenta}• Kontrollerar TypeScript-installationen...${colors.reset}`);
  
  try {
    execSync('npx tsc --version', { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}Fel: TypeScript behöver installeras. Kör "npm install typescript --save-dev"${colors.reset}`);
    process.exit(1);
  }
  
  // Skapa temporär tsconfig för produktion
  console.log(`${colors.magenta}• Förbereder produktionskonfiguration för TypeScript...${colors.reset}`);
  
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  let tsConfig;
  
  if (fs.existsSync(tsConfigPath)) {
    tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    // Spara original-konfigurationen
    fs.writeFileSync(
      path.join(process.cwd(), 'tsconfig.original.json'),
      JSON.stringify(tsConfig, null, 2)
    );
    
    // Modifiera konfigurationen för att simulera produktion
    const prodTsConfig = {
      ...tsConfig,
      compilerOptions: {
        ...tsConfig.compilerOptions,
        noEmit: true, // Vi vill bara kontrollera typer, inte generera JS
        skipLibCheck: false, // Kontrollera även bibliotekstyper
        strict: true, // Använd strikt typkontroll
      }
    };
    
    // Skapa en modifierad tsconfig
    fs.writeFileSync(
      path.join(process.cwd(), 'tsconfig.validate.json'),
      JSON.stringify(prodTsConfig, null, 2)
    );
  } else {
    console.warn(`${colors.yellow}Varning: Hittade ingen tsconfig.json-fil${colors.reset}`);
  }
  
  // Kör TypeScript-kompilatorn i kontrollera-läge
  console.log(`\n${colors.magenta}• Kör TypeScript-validering i produktionsläge...${colors.reset}`);
  console.log(`${colors.blue}  Detta kan ta en stund, var tålmodig...${colors.reset}\n`);
  
  try {
    execSync('npx tsc --project tsconfig.validate.json --noEmit', { stdio: 'inherit' });
    console.log(`\n${colors.green}✓ TypeScript-validering lyckades! Inga typfel hittades.${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}✗ TypeScript-validering misslyckades. Se fel ovan.${colors.reset}`);
    console.log(`\n${colors.yellow}Tips för att lösa vanliga typfel:${colors.reset}
  1. Kontrollera att NODE_ENV-jämförelser använder 'process.env.NODE_ENV !== "production"'
  2. Säkerställ att alla mock-implementationer har korrekta typdefinitioner
  3. Var försiktig med att använda 'as' för att tvinga typer - försök att göra korrekt typning från början
  4. Var konsekvent med hur du importerar och exporterar typer
  5. Använd funktionssignaturer som exakt matchar de bibliotek du använder`);
    
    process.exit(1);
  } finally {
    // Städa upp temporära filer
    console.log(`\n${colors.magenta}• Städar upp...${colors.reset}`);
    
    if (fs.existsSync(path.join(process.cwd(), 'tsconfig.validate.json'))) {
      fs.unlinkSync(path.join(process.cwd(), 'tsconfig.validate.json'));
    }
    
    if (fs.existsSync(path.join(process.cwd(), 'tsconfig.original.json'))) {
      fs.unlinkSync(path.join(process.cwd(), 'tsconfig.original.json'));
    }
  }
  
  // Rekommendationer för utvecklingen
  console.log(`\n${colors.blue}Rekommendationer för att förhindra byggfel:${colors.reset}
  • Kör detta skript innan du pushar till repository
  • Använd alltid 'process.env.NODE_ENV !== "production"' för miljökontroller
  • Använd TypeScript strictNullChecks för bättre felupptäckt
  • Skriv explicita typer för funktionsargument och returvärden
  • Var konsekvent med hur du använder 'undefined' kontra 'null'
  • Lägg till @ts-expect-error där du måste åsidosätta TypeScript-kontroller
  `);
  
  console.log(`${colors.green}Klart! Din kod borde nu byggas utan typfel.${colors.reset}\n`);
  
} catch (error) {
  console.error(`${colors.red}Ett oväntat fel inträffade:${colors.reset}`);
  console.error(error);
  process.exit(1);
} 