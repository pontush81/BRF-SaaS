// Läs in .env.test-filen för tester
require('dotenv').config({ path: '.env.test' });

// Sätter NODE_ENV till test
process.env.NODE_ENV = 'test';

// Add any global test setup here, such as:
import '@testing-library/jest-dom';
import { PrismaClient } from '@prisma/client';
import { cleanupTestDatabase } from './src/lib/test/testUtils';

// Mock window.matchMedia (krävs för vissa Next.js komponenter)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Intersection Observer (krävs för vissa UI-komponenter)
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  disconnect() {
    return null;
  }
  observe() {
    return null;
  }
  takeRecords() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Rensa testdatabasen efter alla tester
afterAll(async () => {
  const prisma = new PrismaClient();
  await cleanupTestDatabase(prisma);
  await prisma.$disconnect();
}); 