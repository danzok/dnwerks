// Test script for admin functionality
// Run with: node test-admin-functionality.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Test credentials (from the SQL files)
const ADMIN_EMAIL = 'admin@dnwerks.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

async function testAdminAPI() {
  console.log('🧪 Testing Admin API Functionality...\n');

  try {
    // Step 1: Login as admin to get token
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token || loginData.session?.access_token;
    
    if (!token) {
      throw new Error('No token received from login');
    }

    console.log('✅ Admin login successful');

    // Step 2: Test GET /api/admin/users
    console.log('\n2️⃣ Testing GET /api/admin/users...');
    const getUsersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Status: ${getUsersResponse.status}`);
    
    if (getUsersResponse.ok) {
      const usersData = await getUsersResponse.json();
      console.log('✅ GET users successful');
      console.log(`📊 Found ${usersData.data?.length || 0} users`);
      
      if (usersData.data && usersData.data.length > 0) {
        console.log('👥 Sample user:', {
          id: usersData.data[0].id,
          email: usersData.data[0].email,
          role: usersData.data[0].role,
          full_name: usersData.data[0].full_name
        });
      }
    } else {
      const errorData = await getUsersResponse.json();
      console.error('❌ GET users failed:', errorData);
    }

    // Step 3: Test POST /api/admin/users (create user)
    console.log('\n3️⃣ Testing POST /api/admin/users (create user)...');
    const createUserResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'TestPassword123!',
        full_name: 'Test User',
        role: 'user',
      }),
    });

    console.log(`Status: ${createUserResponse.status}`);
    
    if (createUserResponse.ok) {
      const createData = await createUserResponse.json();
      console.log('✅ User creation successful');
      console.log('👤 Created user:', {
        id: createData.data?.id,
        email: createData.data?.email,
        role: createData.data?.role
      });
    } else {
      const errorData = await createUserResponse.json();
      console.error('❌ User creation failed:', errorData);
    }

    // Step 4: Test PUT /api/admin/users (update user role)
    console.log('\n4️⃣ Testing PUT /api/admin/users (update user role)...');
    
    // First get a user to update
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const testUser = usersData.data?.find(u => u.email === 'testuser@example.com');
      
      if (testUser) {
        const updateUserResponse = await fetch(`${BASE_URL}/api/admin/users`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: testUser.user_id,
            role: 'admin',
          }),
        });

        console.log(`Status: ${updateUserResponse.status}`);
        
        if (updateUserResponse.ok) {
          const updateData = await updateUserResponse.json();
          console.log('✅ User role update successful');
          console.log('🔄 Updated user:', {
            id: updateData.data?.id,
            role: updateData.data?.role
          });
        } else {
          const errorData = await updateUserResponse.json();
          console.error('❌ User role update failed:', errorData);
        }
      }
    }

    console.log('\n🎉 Admin API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAdminAPI();