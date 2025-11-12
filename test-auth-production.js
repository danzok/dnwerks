/**
 * Test script to verify authentication flow in production
 * Run this after deployment to ensure authentication works correctly
 */

const testUrls = {
  local: 'http://localhost:3000',
  production: 'https://your-vercel-app.vercel.app' // Replace with your actual Vercel URL
};

const testCredentials = {
  email: 'danisbermainaja@gmail.com', // Replace with your admin email
  password: 'your-password' // Replace with your admin password
};

async function testAuthentication(baseUrl) {
  console.log(`\n🧪 Testing authentication flow for: ${baseUrl}`);
  
  try {
    // Test 1: Check if login page loads
    console.log('\n1️⃣ Testing login page access...');
    const loginResponse = await fetch(`${baseUrl}/login`);
    console.log(`   Status: ${loginResponse.status}`);
    if (loginResponse.ok) {
      console.log('   ✅ Login page accessible');
    } else {
      console.log('   ❌ Login page not accessible');
      return false;
    }

    // Test 2: Test protected route without authentication
    console.log('\n2️⃣ Testing protected route without auth...');
    const protectedResponse = await fetch(`${baseUrl}/admin`);
    console.log(`   Status: ${protectedResponse.status}`);
    if (protectedResponse.status === 307 || protectedResponse.status === 302) {
      console.log('   ✅ Properly redirects to login');
    } else {
      console.log('   ❌ Should redirect to login');
    }

    // Test 3: Test API endpoint without authentication
    console.log('\n3️⃣ Testing API endpoint without auth...');
    const apiResponse = await fetch(`${baseUrl}/api/admin/users`);
    console.log(`   Status: ${apiResponse.status}`);
    if (apiResponse.status === 401) {
      console.log('   ✅ API properly secured');
    } else {
      console.log('   ❌ API should return 401');
    }

    // Test 4: Test login process (if credentials provided)
    if (testCredentials.email && testCredentials.password) {
      console.log('\n4️⃣ Testing login process...');
      
      // First, get the login page to extract any CSRF tokens if needed
      const loginPage = await fetch(`${baseUrl}/login`);
      const loginHtml = await loginPage.text();
      
      // Extract any form tokens or session cookies
      const cookies = loginResponse.headers.get('set-cookie') || '';
      
      // Attempt login
      const loginFormData = new URLSearchParams();
      loginFormData.append('email', testCredentials.email);
      loginFormData.append('password', testCredentials.password);

      const loginAttempt = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookies
        },
        body: loginFormData,
        redirect: 'manual' // Don't follow redirects automatically
      });

      console.log(`   Login status: ${loginAttempt.status}`);
      
      if (loginAttempt.status === 302 || loginAttempt.status === 307) {
        const redirectLocation = loginAttempt.headers.get('location');
        console.log(`   ✅ Login successful, redirecting to: ${redirectLocation}`);
        
        // Test 5: Test accessing admin after login
        if (redirectLocation && redirectLocation.includes('/admin')) {
          console.log('\n5️⃣ Testing admin access after login...');
          const sessionCookies = loginAttempt.headers.get('set-cookie') || '';
          
          const adminResponse = await fetch(`${baseUrl}/admin`, {
            headers: {
              'Cookie': sessionCookies
            }
          });
          
          console.log(`   Admin access status: ${adminResponse.status}`);
          if (adminResponse.ok) {
            console.log('   ✅ Admin dashboard accessible after login');
          } else {
            console.log('   ❌ Admin dashboard not accessible after login');
          }
        }
      } else {
        console.log('   ❌ Login failed');
        const errorText = await loginAttempt.text();
        console.log(`   Error: ${errorText.substring(0, 200)}...`);
      }
    }

    return true;
  } catch (error) {
    console.error(`❌ Test failed with error:`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Authentication Tests\n');
  
  // Test local development
  await testAuthentication(testUrls.local);
  
  // Test production (uncomment and update URL)
  // await testAuthentication(testUrls.production);
  
  console.log('\n🎯 Test completed!');
  console.log('\n📋 Troubleshooting Checklist:');
  console.log('1. Ensure environment variables are set in Vercel dashboard');
  console.log('2. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('3. Verify SUPABASE_SERVICE_ROLE_KEY is correctly set');
  console.log('4. Check Vercel function logs for authentication errors');
  console.log('5. Ensure Supabase RLS policies are properly configured');
  console.log('6. Verify user_profiles table exists and has admin user');
}

// Run tests
runAllTests().catch(console.error);