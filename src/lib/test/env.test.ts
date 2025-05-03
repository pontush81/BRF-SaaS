/**
 * Tester för miljöhantering
 */
import { describe, it, expect, afterAll } from '@jest/globals';
import { 
  getEnvironment, 
  Environment, 
  isDevelopment, 
  isTest, 
  isProduction,
  getAppUrl,
  getAppDomain
} from '../env';

describe('Miljöhantering', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  
  // Återställ NODE_ENV efter tester
  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv as string;
  });
  
  describe('getEnvironment', () => {
    it('ska identifiera development-miljö korrekt', () => {
      process.env.NODE_ENV = 'development';
      expect(getEnvironment()).toBe(Environment.DEVELOPMENT);
    });
    
    it('ska identifiera test-miljö korrekt', () => {
      process.env.NODE_ENV = 'test';
      expect(getEnvironment()).toBe(Environment.TEST);
    });
    
    it('ska identifiera production-miljö korrekt', () => {
      process.env.NODE_ENV = 'production';
      expect(getEnvironment()).toBe(Environment.PRODUCTION);
    });
    
    it('ska använda development som fallback', () => {
      process.env.NODE_ENV = 'unknown';
      expect(getEnvironment()).toBe(Environment.DEVELOPMENT);
    });
  });
  
  describe('miljödetektering', () => {
    it('ska identifiera development korrekt', () => {
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
      expect(isTest()).toBe(false);
      expect(isProduction()).toBe(false);
    });
    
    it('ska identifiera test korrekt', () => {
      process.env.NODE_ENV = 'test';
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(true);
      expect(isProduction()).toBe(false);
    });
    
    it('ska identifiera production korrekt', () => {
      process.env.NODE_ENV = 'production';
      expect(isDevelopment()).toBe(false);
      expect(isTest()).toBe(false);
      expect(isProduction()).toBe(true);
    });
  });
  
  describe('URL och domänhantering', () => {
    const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    const originalAppDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
    
    afterAll(() => {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl as string;
      process.env.NEXT_PUBLIC_APP_DOMAIN = originalAppDomain as string;
    });
    
    it('ska returnera APP_URL från miljövariabler', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://test.handbok.org';
      expect(getAppUrl()).toBe('https://test.handbok.org');
    });
    
    it('ska returnera fallback-värde för APP_URL om inte definierad', () => {
      process.env.NEXT_PUBLIC_APP_URL = undefined;
      expect(getAppUrl()).toBe('http://localhost:3000');
    });
    
    it('ska returnera APP_DOMAIN från miljövariabler', () => {
      process.env.NEXT_PUBLIC_APP_DOMAIN = 'test.handbok.org';
      expect(getAppDomain()).toBe('test.handbok.org');
    });
    
    it('ska returnera fallback-värde för APP_DOMAIN om inte definierad', () => {
      process.env.NEXT_PUBLIC_APP_DOMAIN = undefined;
      expect(getAppDomain()).toBe('localhost');
    });
  });
}); 