import { PrismaClient } from '@prisma/client';

// PrismaClient är knuten till NodeJS och kan inte användas direkt i browser-miljö
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

// Deklarera global Prisma-instans
declare global {
  var prisma: PrismaClient | undefined;
}

// Förhindra flera instanser av Prisma Client i development
const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma; 