import { PrismaClient } from '@prisma/client';

// Deklarera global-typerna för TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Förhindra att flera instanser av Prisma Client skapas under hot reloading
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma; 