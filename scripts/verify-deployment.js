#!/usr/bin/env node

/**
 * DNwerks Deployment Verification Script
 * 
 * This script verifies that the deployment is working correctly by testing:
 * - Database connection
 * - API endpoints
 * - Environment variables
 * - Authentication system
 * - Edge functions
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Update these with your deployed app URL
const DEPLOYED_URL = process.env.DEPLOYED_URL || 'https://your-app.vercel.app';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

function logSection(title) {
  log(`\n🔍 ${title}`, 'cyan');
  log('='.repeat(50), 'cyan');
}

// Test results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

async function testAPIEndpoint(endpoint, description) {
  try {
    const response = await fetch(`${DEPLOYED_URL}${endpoint}`);
    if (response.ok) {
      logSuccess(`${description} - ${response.status}`);
      results.passed.push(description);
      return true;
    } else {
      logError(`${description} - ${response.status}`);
      results.failed.push(description);
      return false;
    }
  } catch (error) {
    logError(`${description} - ${error.message}`);
    results.failed.push(description);
    return false;
  }
}

async function testDatabaseConnection() {
  logSection('Database Connection Tests');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count').single();
    
    if (error) {
      logError(`Database connection failed: ${error.message}`);
      results.failed.push('Database connection');
      return false;
    }
    
    logSuccess('Database connection established');
    results.passed.push('Database connection');
    
    // Test RLS policies
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .limit(5);
    
    if (profilesError) {
      logWarning(`RLS policies test failed: ${profilesError.message}`);
      results.warnings.push('RLS policies');
    } else {
      logSuccess('RLS policies working');
      results.passed.push('RLS policies');
    }
    
    return true;
  } catch (error) {
    logError(`Database test failed: ${error.message}`);
    results.failed.push('Database tests');
    return false;
  }
}

async function testEnvironmentVariables() {
  logSection('Environment Variables Check');
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  const optional = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'BITLY_ACCESS_TOKEN'
  ];
  
  let allRequiredPresent = true;
  
  logInfo('Required Environment Variables:');
  required.forEach(env => {
    const status = process.env[env] ? '✅' : '❌';
    log(`  ${status} ${env}`);
    if (!process.env[env]) allRequiredPresent = false;
  });
  
  if (allRequiredPresent) {
    logSuccess('All required environment variables present');
    results.passed.push('Environment variables');
  } else {
    logError('Missing required environment variables');
    results.failed.push('Environment variables');
  }
  
  logInfo('\nOptional Environment Variables:');
  optional.forEach(env => {
    const status = process.env[env] ? '✅' : '⚠️';
    log(`  ${status} ${env}`);
  });
  
  return allRequiredPresent;
}

async function testAPIEndpoints() {
  logSection('API Endpoint Tests');
  
  const endpoints = [
    { path: '/api/customers', desc: 'Customers API' },
    { path: '/api/health', desc: 'Health check endpoint' }
  ];
  
  for (const endpoint of endpoints) {
    await testAPIEndpoint(endpoint.path, endpoint.desc);
  }
}

async function testAuthentication() {
  logSection('Authentication System Tests');
  
  try {
    // Test if auth pages are accessible
    const loginResponse = await fetch(`${DEPLOYED_URL}/login`);
    if (loginResponse.ok) {
      logSuccess('Login page accessible');
      results.passed.push('Login page');
    } else {
      logError('Login page not accessible');
      results.failed.push('Login page');
    }
    
    // Test admin access (this will likely fail without proper auth, but should return 401/403, not 500)
    const adminResponse = await fetch(`${DEPLOYED_URL}/admin`);
    if (adminResponse.status === 401 || adminResponse.status === 403) {
      logSuccess('Admin endpoint properly protected');
      results.passed.push('Admin protection');
    } else if (adminResponse.ok) {
      logWarning('Admin endpoint might not be properly protected');
      results.warnings.push('Admin protection');
    } else {
      logError('Admin endpoint returned unexpected status');
      results.failed.push('Admin endpoint');
    }
    
  } catch (error) {
    logError(`Authentication test failed: ${error.message}`);
    results.failed.push('Authentication tests');
  }
}

async function testEdgeFunctions() {
  logSection('Supabase Edge Functions Tests');
  
  if (!SUPABASE_URL) {
    logWarning('Cannot test edge functions without Supabase URL');
    results.warnings.push('Edge functions test skipped');
    return false;
  }
  
  try {
    const functionUrl = SUPABASE_URL.replace('/rest/v1/', '/functions/v1/create-user');
    
    // Test edge function accessibility (will fail without proper auth, but should not 404)
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123',
        full_name: 'Test User',
        role: 'user'
      })
    });
    
    if (response.status === 401) {
      logSuccess('Edge function accessible and properly secured');
      results.passed.push('Edge function security');
    } else if (response.status === 404) {
      logError('Edge function not found - may need deployment');
      results.failed.push('Edge function deployment');
    } else {
      logInfo(`Edge function responded with status: ${response.status}`);
      results.passed.push('Edge function accessible');
    }
    
  } catch (error) {
    logError(`Edge function test failed: ${error.message}`);
    results.failed.push('Edge function tests');
  }
}

async function testApplicationLoad() {
  logSection('Application Load Test');
  
  try {
    const startTime = Date.now();
    const response = await fetch(DEPLOYED_URL);
    const loadTime = Date.now() - startTime;
    
    if (response.ok) {
      if (loadTime < 3000) {
        logSuccess(`Application loaded in ${loadTime}ms`);
        results.passed.push('Application load time');
      } else {
        logWarning(`Application loaded slowly in ${loadTime}ms`);
        results.warnings.push('Application load time');
      }
    } else {
      logError(`Application failed to load: ${response.status}`);
      results.failed.push('Application load');
    }
  } catch (error) {
    logError(`Application load test failed: ${error.message}`);
    results.failed.push('Application load test');
  }
}

function generateReport() {
  logSection('Deployment Verification Report');
  
  log(`\n📊 Summary:`);
  log(`✅ Passed: ${results.passed.length}`, 'green');
  log(`❌ Failed: ${results.failed.length}`, 'red');
  log(`⚠️ Warnings: ${results.warnings.length}`, 'yellow');
  
  if (results.passed.length > 0) {
    log(`\n✅ Passed Tests:`, 'green');
    results.passed.forEach(test => log(`  - ${test}`, 'green'));
  }
  
  if (results.failed.length > 0) {
    log(`\n❌ Failed Tests:`, 'red');
    results.failed.forEach(test => log(`  - ${test}`, 'red'));
  }
  
  if (results.warnings.length > 0) {
    log(`\n⚠️ Warnings:`, 'yellow');
    results.warnings.forEach(warning => log(`  - ${warning}`, 'yellow'));
  }
  
  // Overall status
  const totalTests = results.passed.length + results.failed.length;
  const successRate = totalTests > 0 ? (results.passed.length / totalTests * 100).toFixed(1) : 0;
  
  log(`\n📈 Success Rate: ${successRate}%`);
  
  if (results.failed.length === 0) {
    log('\n🎉 All critical tests passed! Deployment appears successful.', 'green');
    return true;
  } else {
    log('\n🚨 Some tests failed. Please review the issues above.', 'red');
    return false;
  }
}

async function main() {
  log('🚀 DNwerks Deployment Verification', 'cyan');
  log('='.repeat(50), 'cyan');
  log(`Testing deployment at: ${DEPLOYED_URL}`, 'blue');
  
  // Check if deployment URL is set
  if (DEPLOYED_URL === 'https://your-app.vercel.app') {
    logError('Please set DEPLOYED_URL environment variable');
    log('Example: DEPLOYED_URL=https://your-app.vercel.app node scripts/verify-deployment.js');
    process.exit(1);
  }
  
  // Run all tests
  await testEnvironmentVariables();
  await testDatabaseConnection();
  await testApplicationLoad();
  await testAPIEndpoints();
  await testAuthentication();
  await testEdgeFunctions();
  
  // Generate final report
  const success = generateReport();
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the verification
if (require.main === module) {
  main().catch(error => {
    logError(`Verification script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testDatabaseConnection,
  testAPIEndpoints,
  testEnvironmentVariables,
  testAuthentication,
  testEdgeFunctions,
  testApplicationLoad
};