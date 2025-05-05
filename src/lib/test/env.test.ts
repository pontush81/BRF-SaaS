/**
 * Tester för miljöhantering
 */
import {
  describe,
  it,
  expect,
  afterAll,
  beforeEach,
  jest,
} from '@jest/globals';
import {
  getEnvironment,
  Environment,
  isDevelopment,
  isTest,
  isProduction,
  isStaging,
  getAppUrl,
  getAppDomain,
  getDatabaseEnvironment,
  DatabaseEnvironment,
} from '../env';

describe('Miljöhantering', () => {
  // Skapa en backup av den ursprungliga process.env
  const originalEnv = { ...process.env };

  // Skapa en mock-funktion för att ändra miljövariabler säkert
  const mockEnv = (envVars: Record<string, string | undefined>) => {
    // Skapa en ny env-objekt baserat på originalEnv
    const mockedEnv = { ...originalEnv };

    // Applicera de önskade ändringarna
    Object.keys(envVars).forEach(key => {
      if (envVars[key] === undefined) {
        delete mockedEnv[key];
      } else {
        mockedEnv[key] = envVars[key];
      }
    });

    // Ersätt hela process.env med det nya objektet
    jest.replaceProperty(process, 'env', mockedEnv);
  };

  // Återställ process.env efter alla tester
  afterAll(() => {
    jest.replaceProperty(process, 'env', originalEnv);
  });

  // Återställ mocks före varje test
  beforeEach(() => {
    // Rensa alla relevanta miljövariabler med en enda operation
    mockEnv({
      DEPLOYMENT_ENV: undefined,
      NODE_ENV: 'test', // Standardvärde för tester
      NEXT_PUBLIC_APP_URL: undefined,
      NEXT_PUBLIC_APP_DOMAIN: undefined,
      DATABASE_ENV: undefined,
    });
  });

  describe('getEnvironment', () => {
    it('ska identifiera development-miljö korrekt', () => {
      mockEnv({ NODE_ENV: 'development', DEPLOYMENT_ENV: undefined });
      expect(getEnvironment()).toBe(Environment.DEVELOPMENT);
    });

    it('ska identifiera test-miljö korrekt', () => {
      mockEnv({ NODE_ENV: 'test', DEPLOYMENT_ENV: undefined });
      expect(getEnvironment()).toBe(Environment.TEST);
    });

    it('ska identifiera production-miljö korrekt', () => {
      mockEnv({ NODE_ENV: 'production', DEPLOYMENT_ENV: undefined });
      expect(getEnvironment()).toBe(Environment.PRODUCTION);
    });

    it('ska identifiera staging-miljö korrekt', () => {
      mockEnv({ DEPLOYMENT_ENV: 'staging' });
      expect(getEnvironment()).toBe(Environment.STAGING);
    });

    it('ska använda development som fallback', () => {
      mockEnv({ NODE_ENV: 'unknown', DEPLOYMENT_ENV: undefined });
      expect(getEnvironment()).toBe(Environment.DEVELOPMENT);
    });
  });

  describe('getDatabaseEnvironment', () => {
    it('ska identifiera dev-databasmiljö korrekt', () => {
      mockEnv({ DATABASE_ENV: 'dev' });
      expect(getDatabaseEnvironment()).toBe(DatabaseEnvironment.DEV);
    });

    it('ska identifiera test-databasmiljö korrekt', () => {
      mockEnv({ DATABASE_ENV: 'test' });
      expect(getDatabaseEnvironment()).toBe(DatabaseEnvironment.TEST);
    });

    it('ska identifiera staging-databasmiljö korrekt', () => {
      mockEnv({ DATABASE_ENV: 'staging' });
      expect(getDatabaseEnvironment()).toBe(DatabaseEnvironment.STAGING);
    });

    it('ska identifiera prod-databasmiljö korrekt', () => {
      mockEnv({ DATABASE_ENV: 'prod' });
      expect(getDatabaseEnvironment()).toBe(DatabaseEnvironment.PROD);
    });

    it('ska prioritera DEPLOYMENT_ENV för staging', () => {
      mockEnv({ DATABASE_ENV: 'prod', DEPLOYMENT_ENV: 'staging' });
      expect(getDatabaseEnvironment()).toBe(DatabaseEnvironment.STAGING);
    });

    it('ska returnera dev som fallback', () => {
      mockEnv({ DATABASE_ENV: undefined, NODE_ENV: undefined });
      expect(getDatabaseEnvironment()).toBe(DatabaseEnvironment.DEV);
    });
  });

  describe('miljödetektering', () => {
    it('ska identifiera development korrekt', () => {
      mockEnv({ NODE_ENV: 'development', DEPLOYMENT_ENV: undefined });
      expect(isDevelopment()).toBe(true);
      expect(isTest()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(isStaging()).toBe(false);
    });

    it('ska identifiera test korrekt', () => {
      mockEnv({ NODE_ENV: 'test', DEPLOYMENT_ENV: undefined });
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(isStaging()).toBe(false);
    });

    it('ska identifiera production korrekt', () => {
      mockEnv({ NODE_ENV: 'production', DEPLOYMENT_ENV: undefined });
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(false);
      expect(isProduction()).toBe(true);
      expect(isStaging()).toBe(false);
    });

    it('ska identifiera staging korrekt', () => {
      mockEnv({ DEPLOYMENT_ENV: 'staging' });
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(isStaging()).toBe(true);
    });
  });

  describe('URL och domänhantering', () => {
    it('ska returnera APP_URL från miljövariabler', () => {
      mockEnv({ NEXT_PUBLIC_APP_URL: 'https://test.handbok.org' });
      expect(getAppUrl()).toBe('https://test.handbok.org');
    });

    it('ska returnera fallback-värde för APP_URL om inte definierad', () => {
      mockEnv({ NEXT_PUBLIC_APP_URL: undefined });
      expect(getAppUrl()).toBe('http://localhost:3000');
    });

    it('ska returnera APP_DOMAIN från miljövariabler', () => {
      mockEnv({ NEXT_PUBLIC_APP_DOMAIN: 'test.handbok.org' });
      expect(getAppDomain()).toBe('test.handbok.org');
    });

    it('ska returnera fallback-värde för APP_DOMAIN om inte definierad', () => {
      mockEnv({ NEXT_PUBLIC_APP_DOMAIN: undefined });
      expect(getAppDomain()).toBe('localhost');
    });
  });
});
