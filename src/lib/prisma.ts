import { PrismaClient } from '@prisma/client';

// PrismaClient är knuten till NodeJS och kan inte användas direkt i browser-miljö
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

// Deklarera global Prisma-instans
declare global {
  var prisma: any;
}

// Bestäm miljö
const environment = process.env.NODE_ENV || 'development';

// Skapa rätt Prisma-klient baserat på miljö
const createPrismaClient = () => {
  // För alla miljöer använder vi samma klientklass men olika connection strings
  // Connection string för staging inkluderar schema=staging
  console.log(`Initializing Prisma client for environment: ${environment}`);
  return new PrismaClient({
    log: environment === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Förhindra flera instanser av Prisma Client
const prisma = global.prisma || createPrismaClient();

// Spara i globalvariabel i icke-produktionsmiljöer för att undvika flera instanser
if (environment !== 'production') {
  global.prisma = prisma;
}

export default prisma; 