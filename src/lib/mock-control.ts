/**
 * Utilities for controlling mock data mode in the application
 * This helps ensure that mock data is only used in development and never leaks to production
 */

import { getEnvironment, Environment } from './env';

// Constants
const MOCK_COOKIE_NAME = 'mock-mode-enabled';
const MOCK_LOCAL_STORAGE_KEY = 'mockModeEnabled';

/**
 * Check if mock mode is enabled based on cookies, environment, and local storage
 */
export function isMockModeEnabled(): boolean {
  const environment = getEnvironment();
  
  // Never allow mock mode in production
  if (environment === Environment.PRODUCTION) {
    return false;
  }
  
  // In development, check cookie and local storage
  if (typeof window !== 'undefined') {
    // Check cookie
    const cookies = document.cookie.split(';');
    const mockCookie = cookies.find(c => c.trim().startsWith(`${MOCK_COOKIE_NAME}=`));
    if (mockCookie) {
      return mockCookie.split('=')[1] === 'true';
    }
    
    // Check local storage
    const storedValue = localStorage.getItem(MOCK_LOCAL_STORAGE_KEY);
    if (storedValue) {
      return storedValue === 'true';
    }
    
    // Check if window.__mockAuthEnabled is set
    if ('__mockAuthEnabled' in window) {
      return window.__mockAuthEnabled === true;
    }
  }
  
  // Default to true in development, false otherwise
  return environment === Environment.DEVELOPMENT;
}

/**
 * Enable mock mode (development only)
 */
export function enableMockMode(): boolean {
  if (getEnvironment() === Environment.PRODUCTION) {
    console.error('Cannot enable mock mode in production');
    return false;
  }
  
  if (typeof window !== 'undefined') {
    // Set cookie (valid for 8 hours)
    document.cookie = `${MOCK_COOKIE_NAME}=true;path=/;max-age=28800`;
    // Set local storage
    localStorage.setItem(MOCK_LOCAL_STORAGE_KEY, 'true');
    // Set window variable if it exists
    if ('__mockAuthEnabled' in window) {
      window.__mockAuthEnabled = true;
    }
    
    return true;
  }
  
  return false;
}

/**
 * Disable mock mode
 */
export function disableMockMode(): boolean {
  if (typeof window !== 'undefined') {
    // Clear cookie
    document.cookie = `${MOCK_COOKIE_NAME}=false;path=/;max-age=28800`;
    // Clear local storage
    localStorage.setItem(MOCK_LOCAL_STORAGE_KEY, 'false');
    // Clear window variable if it exists
    if ('__mockAuthEnabled' in window) {
      window.__mockAuthEnabled = false;
    }
    
    return true;
  }
  
  return false;
}

/**
 * React hook to check if mock mode is enabled
 */
export function useMockMode() {
  if (typeof window === 'undefined') {
    return {
      mockEnabled: getEnvironment() === Environment.DEVELOPMENT,
      enableMock: () => {},
      disableMock: () => {},
    };
  }
  
  // In client components
  const mockEnabled = isMockModeEnabled();
  
  return {
    mockEnabled,
    enableMock: enableMockMode,
    disableMock: disableMockMode,
  };
} 