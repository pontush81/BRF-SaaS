import { PrismaClient } from "@prisma/client";
import { getEnvironment, Environment, getDatabaseSchema, isProductionDatabase } from "./env";

// PrismaClient är ansluten till $DATABASE_URL (eller $DIRECT_URL i en Edge-funktion)
// Lär dig mer: https://pris.ly/d/prisma-schema-datasource

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Skapa prisma-klienten med rätt schema baserat på miljö
const createPrismaClient = () => {
  // För Supabase bör vi inte ändra schema-parametern eftersom det orsakar problem
  // Supabase hanterar redan schema korrekt baserat på anslutningssträngen
  
  // Logga anslutningsinformation (utan känsliga detaljer)
  console.log('Creating Prisma client in environment:', getEnvironment());
  console.log('Database schema:', getDatabaseSchema());
  
  try {
    return new PrismaClient({
      log: getEnvironment() === Environment.DEVELOPMENT ? ["error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    throw error;
  }
};

// Exporter klienten baserad på miljö, med säkerhetsåtgärder för produktionsdatabas
export const prisma = globalForPrisma.prisma || createPrismaClient();

// Om vi inte är i produktionsmiljö, lägg till prisma till
// den globala objektet för att förhindra flera instanser av Prisma Client i utvecklings-/testmiljö
if (getEnvironment() !== Environment.PRODUCTION) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

// Kontrollera databasanslutning med schema-info
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    
    const schema = getDatabaseSchema();
    const isProdDb = isProductionDatabase();
    
    return { 
      connected: true, 
      message: 'Database connection successful',
      schema,
      isProductionDatabase: isProdDb
    };
  } catch (error) {
    console.error('Database connection failed:', error);
    return { 
      connected: false, 
      message: 'Database connection failed', 
      error: error instanceof Error ? error.message : String(error) 
    };
  } finally {
    await prisma.$disconnect();
  }
} 