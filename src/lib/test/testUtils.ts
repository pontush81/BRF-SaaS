/**
 * Testverktyg för Handbok.org
 * Hjälpfunktioner för att underlätta testning av applikationen
 */

import { PrismaClient } from '@prisma/client';
import { isTest, isDevelopment, isProductionDatabase, getDatabaseSchema } from '../env';

/**
 * Skapa en testdatabas-anslutning
 * OBS: Denna funktion ska endast användas i testmiljö
 */
export const getTestPrismaClient = (): PrismaClient => {
  if (!isTest()) {
    throw new Error('getTestPrismaClient får endast användas i testmiljö');
  }
  
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
};

/**
 * Säkerhetskontroll för att förhindra ändringar i produktionsdatabasen
 * Används för att förhindra oavsiktlig radering eller ändringar i produktionsdata
 */
export const ensureNonProductionDatabase = (): void => {
  if (isProductionDatabase()) {
    throw new Error('Denna operation är inte tillåten i produktionsdatabasen');
  }
}

/**
 * Rensar testdata från databasen
 * OBS: Denna funktion ska endast användas i testmiljö och med försiktighet
 */
export const cleanupTestDatabase = async (prisma: PrismaClient): Promise<void> => {
  if (!isTest() && !isDevelopment()) {
    throw new Error('cleanupTestDatabase får endast användas i test- eller utvecklingsmiljö');
  }
  
  // Säkerhetskontroll för att förhindra ändringar i produktionsdatabasen
  ensureNonProductionDatabase();
  
  // Radera testdata i korrekt ordning för att respektera foreign keys
  await prisma.$transaction([
    prisma.handbook.deleteMany({
      where: { 
        title: { startsWith: 'TEST_' } 
      }
    }),
    prisma.organization.deleteMany({
      where: { 
        name: { startsWith: 'TEST_' } 
      }
    }),
    prisma.user.deleteMany({
      where: { 
        email: { contains: 'test_' } 
      }
    }),
  ]);
};

/**
 * Kopierar data från produktionsdatabasen till utvecklings-/testdatabasen
 * Detta ger möjlighet att testa med verklig data utan att påverka produktionen
 * 
 * Kräver en administratör-anslutning med rättigheter att läsa från 'public' schema
 * och skriva till 'dev'/'test' schema.
 * 
 * @param {string} targetSchema - Målschemat (typiskt 'dev' eller 'test')
 */
export const copyProductionDataToTestEnvironment = async (
  adminPrismaClient: PrismaClient,
  targetSchema: string = getDatabaseSchema()
): Promise<void> => {
  // Säkerhetskontroll för att förhindra att detta körs i produktionsmiljö
  ensureNonProductionDatabase();
  
  if (!targetSchema || targetSchema === 'public') {
    throw new Error('Kan inte kopiera till public-schema, ange ett specifikt målschema');
  }
  
  try {
    console.log(`Påbörjar kopiering av produktionsdata till ${targetSchema}-schema...`);
    
    // Kopiera data för varje tabelltyp i rätt ordning (för att respektera foreign keys)
    
    // 1. Kopiera användare
    const users = await adminPrismaClient.$queryRaw`
      SELECT * FROM public.users 
      WHERE NOT (email LIKE '%test%' OR email LIKE '%dev%')
      LIMIT 1000
    `;
    
    // Tömmer måltabellen först för att undvika konflikter
    await adminPrismaClient.$executeRaw`TRUNCATE TABLE ${targetSchema}.users CASCADE`;
    
    // Kopierar data till det nya schemat
    for (const user of users as any[]) {
      await adminPrismaClient.$executeRaw`
        INSERT INTO ${targetSchema}.users 
        SELECT * FROM public.users 
        WHERE id = ${user.id}
      `;
    }
    
    // 2. Kopiera organisationer
    const organizations = await adminPrismaClient.$queryRaw`
      SELECT * FROM public.organizations 
      WHERE NOT (name LIKE '%TEST%' OR name LIKE '%Dev%')
      LIMIT 100
    `;
    
    await adminPrismaClient.$executeRaw`TRUNCATE TABLE ${targetSchema}.organizations CASCADE`;
    
    for (const org of organizations as any[]) {
      await adminPrismaClient.$executeRaw`
        INSERT INTO ${targetSchema}.organizations 
        SELECT * FROM public.organizations 
        WHERE id = ${org.id}
      `;
    }
    
    // 3. Kopiera handböcker
    const handbooks = await adminPrismaClient.$queryRaw`
      SELECT * FROM public.handbooks 
      WHERE organization_id IN (
        SELECT id FROM ${targetSchema}.organizations
      )
      LIMIT 200
    `;
    
    await adminPrismaClient.$executeRaw`TRUNCATE TABLE ${targetSchema}.handbooks CASCADE`;
    
    for (const handbook of handbooks as any[]) {
      await adminPrismaClient.$executeRaw`
        INSERT INTO ${targetSchema}.handbooks 
        SELECT * FROM public.handbooks 
        WHERE id = ${handbook.id}
      `;
    }
    
    // 4. Annan vital data som behövs för test
    // ...
    
    console.log(`Datakopiering slutförd. Data kopierad till ${targetSchema}-schema.`);
    
  } catch (error) {
    console.error('Fel vid kopiering av produktionsdata:', error);
    throw new Error(`Misslyckades med att kopiera data: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Testdata för användare
 */
export const mockUsers = [
  {
    id: 'test-user-1',
    email: 'test_user1@example.com',
    name: 'Test User 1',
    role: 'USER',
  },
  {
    id: 'test-user-2',
    email: 'test_user2@example.com',
    name: 'Test User 2',
    role: 'USER',
  },
  {
    id: 'test-admin-1',
    email: 'test_admin1@example.com',
    name: 'Test Admin 1',
    role: 'ADMIN',
  },
];

/**
 * Testdata för organisationer
 */
export const mockOrganizations = [
  {
    id: 'test-org-1',
    name: 'TEST_Organization 1',
    organizationNumber: '123456-7890',
    address: 'Test Street 1',
    zipCode: '12345',
    city: 'Test City',
  },
  {
    id: 'test-org-2',
    name: 'TEST_Organization 2',
    organizationNumber: '098765-4321',
    address: 'Test Avenue 2',
    zipCode: '54321',
    city: 'Test Town',
  },
];

/**
 * Testdata för handboken
 */
export const mockHandbooks = [
  {
    id: 'test-handbook-1',
    title: 'TEST_Handbook 1',
    organizationId: 'test-org-1',
  },
  {
    id: 'test-handbook-2',
    title: 'TEST_Handbook 2',
    organizationId: 'test-org-2',
  },
];

/**
 * Skapar testdata i databasen
 * OBS: Denna funktion ska endast användas i testmiljö
 */
export const seedTestDatabase = async (prisma: PrismaClient): Promise<void> => {
  if (!isTest() && !isDevelopment()) {
    throw new Error('seedTestDatabase får endast användas i test- eller utvecklingsmiljö');
  }
  
  // Säkerhetskontroll för att förhindra ändringar i produktionsdatabasen
  ensureNonProductionDatabase();
  
  // Skapa testanvändare
  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user,
    });
  }
  
  // Skapa testorganisationer
  for (const org of mockOrganizations) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: {},
      create: org,
    });
  }
  
  // Skapa testhandböcker
  for (const handbook of mockHandbooks) {
    await prisma.handbook.upsert({
      where: { id: handbook.id },
      update: {},
      create: handbook,
    });
  }
}; 