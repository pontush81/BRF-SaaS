import { PrismaClient, Prisma } from '@prisma/client';

// PrismaClient är knuten till NodeJS och kan inte användas direkt i browser-miljö
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

// Miljö-detektion
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Logga prisma-miljön
console.log(
  `Initializing Prisma client for environment: ${process.env.NODE_ENV}`
);

// Kontrollera om vi har databas-URL
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment variables');
}

// Skapa en genväg till global Prisma-instans så att vi inte får duplicerade instanser vid hot reload
// Detta är en rekommenderad pattern från Prisma
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Konfigurera Prisma-klienten med rätt options
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: isDevelopment
    ? (['query', 'error', 'warn'] as Prisma.LogLevel[])
    : (['error'] as Prisma.LogLevel[]),
  errorFormat: isDevelopment ? 'pretty' : 'minimal',
};

// Create a Prisma Client instance or reuse the existing one
const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

// Försök ansluta till databasen i utvecklingsmiljö för att testa anslutningen
if (isDevelopment && !isTest) {
  (async () => {
    try {
      // Kör en enkel query för att verifiera anslutning
      await prisma.$queryRaw`SELECT 1 as ping`;
      console.log('✅ Database connection established successfully');
    } catch (error: any) {
      console.error('❌ Error connecting to database:');
      console.error(error);

      // Mer specifik felhantering för multi-tenant-fel
      if (error.message && error.message.includes('Tenant or user not found')) {
        console.error(`
⚠️ Multi-tenant error: "Tenant or user not found"
This can be caused by:
1. Wrong DATABASE_URL in your .env file
2. Missing tenant ID in the connection string
3. Tenant doesn't exist or has been deleted
4. Insufficient permissions for the database user

Try temporarily bypassing tenant isolation for development by adding 'schema=public' to your DATABASE_URL.
        `);
      }

      console.warn(
        '⚠️ Application may not function correctly due to database connection issues'
      );
    }
  })();
}

// Endast lägg till i global-objekt i utveckling för att undvika minnesproblem
if (isDevelopment) globalForPrisma.prisma = prisma;

export default prisma;
