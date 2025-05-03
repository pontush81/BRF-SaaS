const nextJest = require('next/jest');

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: './' });

// Any custom config you want to pass to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/.vercel/',
    '<rootDir>/coverage/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
    '!**/node_modules/**'
  ],
  // Automatisk rensning av mockningar
  clearMocks: true,
  // Använd samma timeout som i test-scriptet
  testTimeout: 30000,
};

// createJestConfig anpassar nästa/jest till konfigurationen för att hantera stöd
// för transpilering och miljövariabler. För mer information:
// https://nextjs.org/docs/testing
module.exports = createJestConfig(customJestConfig); 