/**
 * Script för att kopiera produktionsdata till test/dev miljöer
 * 
 * Detta script används för att kopiera realistisk data från produktionsmiljön
 * till utvecklings- eller testmiljön. Detta gör det möjligt att testa med 
 * verklig data utan att riskera att påverka den riktiga produktionsdatabasen.
 * 
 * Användning:
 * ts-node src/scripts/copy-production-data.ts <target-schema>
 * 
 * där <target-schema> är antingen 'dev' eller 'test' (default är dev om inget anges)
 */

import { PrismaClient } from '@prisma/client';
import { copyProductionDataToTestEnvironment } from '../lib/test/testUtils';
import { getDatabaseSchema, isProductionDatabase } from '../lib/env';

// Kontrollera att skriptet inte körs i produktionsmiljö
if (isProductionDatabase()) {
  console.error('VARNING: Detta skript kan inte köras mot produktionsdatabasen.');
  console.error('Sätt DATABASE_ENV=dev eller DATABASE_ENV=test i din .env-fil.');
  process.exit(1);
}

async function main() {
  console.log('Startar kopiering av produktionsdata...');
  
  // Hämta målschema från kommandoradsargument eller använd standard
  const targetSchema = process.argv[2] || getDatabaseSchema();
  
  if (!['dev', 'test', 'staging'].includes(targetSchema)) {
    console.error(`Ogiltigt schema: ${targetSchema}. Använd 'dev', 'test' eller 'staging'.`);
    process.exit(1);
  }
  
  console.log(`Målschema: ${targetSchema}`);
  
  // Skapa en PrismaClient med administratörsrättigheter
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL,
  });
  
  try {
    // Fråga användaren om bekräftelse innan vi fortsätter
    console.log(`
VARNING: Detta kommer att radera all befintlig data i ${targetSchema}-schemat 
och ersätta den med data från produktionen.

Det här går inte att ångra. Är du säker på att du vill fortsätta?
Skriv "JA" för att fortsätta:
    `);
    
    // Läs användarinput från kommandoraden
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('', async (answer: string) => {
      if (answer.trim().toUpperCase() !== 'JA') {
        console.log('Avbryter kopiering.');
        readline.close();
        await prisma.$disconnect();
        process.exit(0);
      }
      
      readline.close();
      
      try {
        // Kontrollera om målschemat existerar, skapa det om det inte finns
        const schemaExists = await prisma.$queryRaw`
          SELECT schema_name FROM information_schema.schemata 
          WHERE schema_name = ${targetSchema}
        `;
        
        if (Array.isArray(schemaExists) && schemaExists.length === 0) {
          console.log(`Schemat ${targetSchema} existerar inte. Skapar schema...`);
          await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS ${targetSchema}`;
        }
        
        // Kopiera datan från produktionen till målschemat
        await copyProductionDataToTestEnvironment(prisma, targetSchema);
        
        console.log('Datakopiering slutförd!');
      } catch (error) {
        console.error('Ett fel inträffade under kopieringen:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
  } catch (error) {
    console.error('Ett fel inträffade:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Kör huvudfunktionen
main().catch(error => {
  console.error('Ett oväntat fel inträffade:', error);
  process.exit(1);
}); 