// Läs in .env.test-filen för tester
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Sätter NODE_ENV till test
process.env.NODE_ENV = 'test';

// Add any global test setup here, such as:
import '@testing-library/jest-dom';

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

// Mock för Prisma
jest.mock('./src/lib/prisma', () => {
  return {
    __esModule: true,
    // Använd dynamisk import för att undvika require
    get prisma() {
      return import('./src/lib/test/__mocks__/prisma').then(m => m.default);
    },
  };
});

// Kod som körs före varje test
beforeEach(() => {
  // Återställ alla mockar före varje test
  jest.clearAllMocks();
});

// Clenar bara upp mocken efter alla tester, ingen riktig databashantering
afterAll(() => {
  // Undvik console.log i produktionskod
  // console.log('Tests completed, cleanup complete');
});
