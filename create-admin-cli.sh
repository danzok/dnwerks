#!/bin/bash

# Create Admin User using Supabase CLI
# Make sure you have: npm install supabase --save-dev

echo "🚀 Creating admin user for danisbermainaja@gmail.com..."

# Set environment variables
export SUPABASE_URL="https://gjaekyfjwhtxicppbnsf.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d '=' -f2)

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
    exit 1
fi

# Create user using Supabase CLI
supabase auth admin create \
  --email "danisbermainaja@gmail.com" \
  --password "AdminPassword123!" \
  --data '{"name": "Danis Bermain", "role": "admin"}' \
  --confirm

if [ $? -eq 0 ]; then
    echo "✅ Admin user created successfully!"
    
    # Create user profile
    echo "👤 Creating user profile..."
    
    supabase db execute --sql "
        INSERT INTO public.user_profiles (user_id, email, full_name, role)
        SELECT 
            id,
            email,
            'Danis Bermain',
            'admin'
        FROM auth.users 
        WHERE email = 'danisbermainaja@gmail.com'
        AND NOT EXISTS (
            SELECT 1 FROM public.user_profiles WHERE user_id = auth.users.id
        );
    "
    
    if [ $? -eq 0 ]; then
        echo "✅ User profile created successfully!"
        echo ""
        echo "🎉 Admin account setup complete!"
        echo ""
        echo "📋 Login Credentials:"
        echo "   Email: danisbermainaja@gmail.com"
        echo "   Password: AdminPassword123!"
        echo ""
        echo "🌐 Test Login:"
        echo "   Go to: http://localhost:3000/login"
        echo "   Use credentials above"
    else
        echo "❌ Failed to create user profile"
    fi
else
    echo "❌ Failed to create admin user"
    exit 1
fi