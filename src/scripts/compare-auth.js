#!/usr/bin/env node

/**
 * Auth Method Comparison Tool
 *
 * This script compares different authentication methods for Supabase
 * by measuring their performance, success rates, and reliability.
 *
 * It tests:
 * - Direct Supabase authentication
 * - Proxy-based authentication
 * - Cookie handling
 *
 * Usage:
 *   node src/scripts/compare-auth.js [iterations=5]
 */

// Parse command line arguments
const iterations = parseInt(process.argv[2], 10) || 5;

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require('child_process');

// Test configuration
const apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const apiEndpoint = `${apiBaseUrl}/api`;
const proxyEndpoint = `${apiEndpoint}/supabase-proxy`;
const directSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://supabase-test.handbok.org';

// Result storage
const results = {
  direct: { times: [], success: 0, fails: 0 },
  proxy: { times: [], success: 0, fails: 0 },
  cookies: { times: [], success: 0, fails: 0 },
};

// eslint-disable-next-line no-console
console.log(`🔍 Starting auth method comparison (${iterations} iterations)...`);
// eslint-disable-next-line no-console
console.log('='.repeat(50));

// Cookie handling test
// eslint-disable-next-line no-console
console.log('\n🍪 Testing cookie handling...');

for (let i = 0; i < iterations; i++) {
  // eslint-disable-next-line no-console
  console.log(`  Iteration ${i + 1}/${iterations}`);

  try {
    const start = Date.now();
    const response = execSync(
      `curl -s -X POST "${apiEndpoint}/auth/session" -H "Content-Type: application/json" -d '{"checkCookies": true}'`,
      { encoding: 'utf8' }
    );
    const end = Date.now();

    const data = JSON.parse(response);
    if (data.cookiesEnabled) {
      results.cookies.success++;
      results.cookies.times.push(end - start);
      // eslint-disable-next-line no-console
      console.log(`  ✓ Cookies working (${end - start}ms)`);
    } else {
      results.cookies.fails++;
      // eslint-disable-next-line no-console
      console.log('  ✗ Cookies not working');
    }
  } catch (_) {
    // eslint-disable-next-line no-console
    console.error('  ✗ Error testing cookies');
    results.cookies.fails++;
  }
}

// Direct Supabase Auth test
// eslint-disable-next-line no-console
console.log('\n🔑 Testing direct Supabase auth...');

for (let i = 0; i < iterations; i++) {
  // eslint-disable-next-line no-console
  console.log(`  Iteration ${i + 1}/${iterations}`);

  try {
    const start = Date.now();
    const response = execSync(
      `curl -s -X GET "${directSupabaseUrl}/rest/v1/" -H "apikey: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}"`,
      { encoding: 'utf8' }
    );
    const end = Date.now();

    if (response && !response.includes('error')) {
      results.direct.success++;
      results.direct.times.push(end - start);
      // eslint-disable-next-line no-console
      console.log(`  ✓ Direct connection successful (${end - start}ms)`);
    } else {
      results.direct.fails++;
      // eslint-disable-next-line no-console
      console.log('  ✗ Direct connection failed');
    }
  } catch (_) {
    results.direct.fails++;
    // eslint-disable-next-line no-console
    console.error('  ✗ Error connecting directly to Supabase');
  }
}

// Proxy auth test
// eslint-disable-next-line no-console
console.log('\n🔄 Testing proxy-based auth...');

for (let i = 0; i < iterations; i++) {
  // eslint-disable-next-line no-console
  console.log(`  Iteration ${i + 1}/${iterations}`);

  try {
    const start = Date.now();
    const response = execSync(
      `curl -s -X POST "${proxyEndpoint}" -H "Content-Type: application/json" -d '{"url": "rest/v1/", "method": "GET"}'`,
      { encoding: 'utf8' }
    );
    const end = Date.now();

    const data = JSON.parse(response);
    if (data && !data.error) {
      results.proxy.success++;
      results.proxy.times.push(end - start);
      // eslint-disable-next-line no-console
      console.log(`  ✓ Proxy connection successful (${end - start}ms)`);
    } else {
      results.proxy.fails++;
      // eslint-disable-next-line no-console
      console.log('  ✗ Proxy connection failed');
    }
  } catch (_) {
    results.proxy.fails++;
    // eslint-disable-next-line no-console
    console.error('  ✗ Error connecting via proxy');
  }
}

// Calculate results
function getAverage(arr) {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function getSuccessRate(success, total) {
  return Math.round((success / total) * 100);
}

// eslint-disable-next-line no-console
console.log('\n📊 RESULTS:');
// eslint-disable-next-line no-console
console.log('='.repeat(50));

// eslint-disable-next-line no-console
console.log('\n🍪 Cookie Handling:');
// eslint-disable-next-line no-console
console.log(
  `  Success Rate: ${getSuccessRate(results.cookies.success, iterations)}%`
);
// eslint-disable-next-line no-console
console.log(`  Average Time: ${getAverage(results.cookies.times)}ms`);

// eslint-disable-next-line no-console
console.log('\n🔑 Direct Supabase Auth:');
// eslint-disable-next-line no-console
console.log(
  `  Success Rate: ${getSuccessRate(results.direct.success, iterations)}%`
);
// eslint-disable-next-line no-console
console.log(`  Average Time: ${getAverage(results.direct.times)}ms`);

// eslint-disable-next-line no-console
console.log('\n🔄 Proxy Auth:');
// eslint-disable-next-line no-console
console.log(
  `  Success Rate: ${getSuccessRate(results.proxy.success, iterations)}%`
);
// eslint-disable-next-line no-console
console.log(`  Average Time: ${getAverage(results.proxy.times)}ms`);

// eslint-disable-next-line no-console
console.log('\n💡 RECOMMENDATION:');
if (
  results.direct.success >= results.proxy.success &&
  getAverage(results.direct.times) <= getAverage(results.proxy.times)
) {
  // eslint-disable-next-line no-console
  console.log(
    '  Direct Supabase Auth is recommended (faster and more reliable)'
  );
} else if (results.proxy.success > results.direct.success) {
  // eslint-disable-next-line no-console
  console.log('  Proxy Auth is recommended (more reliable)');
} else {
  // eslint-disable-next-line no-console
  console.log('  Proxy Auth is recommended (faster)');
}

// eslint-disable-next-line no-console
console.log(
  '\nTest completed. Use these results to configure your authentication strategy.'
);
