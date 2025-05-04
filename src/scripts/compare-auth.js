#!/usr/bin/env node

/**
 * Authentication Environment Comparison Tool
 * 
 * This script helps compare authentication behavior between environments
 * to ensure consistency between development and staging/production.
 * 
 * Usage:
 * - npm run compare-auth:dev (for development environment)
 * - npm run compare-auth:staging (for staging environment)
 * 
 * Make sure to add these scripts to package.json:
 * "scripts": {
 *   "compare-auth:dev": "NODE_ENV=development node src/scripts/compare-auth.js",
 *   "compare-auth:staging": "NODE_ENV=staging node src/scripts/compare-auth.js"
 * }
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Determine environment
const env = process.env.NODE_ENV || 'development';
console.log(`Running auth comparison in ${env} environment`);

// Configuration
const config = {
  development: {
    baseUrl: 'http://localhost:3000',
    mockCookieEnabled: true,
  },
  staging: {
    baseUrl: process.env.STAGING_URL || 'https://staging.your-domain.com',
    mockCookieEnabled: false,
  }
};

// Get config for current environment
const currentConfig = config[env];
if (!currentConfig) {
  console.error(`Unknown environment: ${env}`);
  process.exit(1);
}

// Test functions
async function testAuthEndpoints() {
  const endpoints = [
    '/api/auth/current-user',
    '/api/auth/get-user-role',
  ];
  
  console.log('\n⚡ Testing API endpoints:');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${currentConfig.baseUrl}${endpoint}`);
      const status = response.status;
      let data = null;
      
      try {
        data = await response.json();
      } catch (e) {
        // Response was not JSON
      }
      
      console.log(`${endpoint}: Status ${status}`);
      
      if (data) {
        console.log(`Response preview: ${JSON.stringify(data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`Error testing ${endpoint}: ${error.message}`);
    }
  }
}

// Check mock auth behavior
function testMockAuth() {
  console.log('\n🔒 Mock authentication settings:');
  console.log(`- Environment: ${env}`);
  console.log(`- Mock cookie enabled: ${currentConfig.mockCookieEnabled}`);
  
  // Check for environment variables
  const hasMockVars = process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === 'true';
  console.log(`- NEXT_PUBLIC_ENABLE_MOCK_AUTH set: ${hasMockVars}`);
  
  if (env === 'development') {
    console.log('\nIn development environment:');
    console.log('- Check if mock cookie (supabase-dev-auth) is working correctly using the AuthDebug component');
    console.log('- Verify the login/logout button state reflects the auth status');
    console.log('- Test that protected routes behave as expected');
  } else {
    console.log('\nIn non-development environment:');
    console.log('- Verify that mock authentication is DISABLED');
    console.log('- Confirm real auth endpoints are being used');
    console.log('- Test authentication with a real user account');
  }
}

// Run tests
async function runTests() {
  console.log('==================================');
  console.log(`🔍 BRF-SaaS Auth Comparison (${env})`);
  console.log('==================================');
  
  testMockAuth();
  await testAuthEndpoints();
  
  console.log('\n✅ Tests completed');
  console.log('==================================');
}

runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 