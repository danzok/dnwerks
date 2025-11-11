-- ============================================
-- Fix User Profile Schema and Create Missing Profile
-- ============================================

-- 1. Add missing email column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add missing full_name column to user_profiles table  
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 3. Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'user_profiles_user_id_unique'
    ) THEN
        ALTER TABLE user_profiles 
        ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint on user_id';
    END IF;
END $$;

-- 4. Create user profile for the authenticated user
DO $$
DECLARE
  target_user_id UUID := '6a06617b-deee-4f02-a08a-bdec17e46d98';
  user_email TEXT := 'danisbermainaja@gmail.com';
  profile_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    
    -- Check if profile already exists
    SELECT EXISTS(
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = target_user_id
    ) INTO profile_exists;
    
    IF profile_exists THEN
      -- Update existing profile
      UPDATE public.user_profiles 
      SET 
        email = user_email,
        full_name = 'Danis Bermain',
        role = 'admin',
        updated_at = NOW()
      WHERE user_id = target_user_id;
      
      RAISE NOTICE 'Updated existing user profile for: %', user_email;
    ELSE
      -- Insert new profile
      INSERT INTO public.user_profiles (user_id, email, full_name, role)
      VALUES (
        target_user_id,
        user_email,
        'Danis Bermain',
        'admin'
      );
      
      RAISE NOTICE 'Created new user profile for: %', user_email;
    END IF;
    
  ELSE
    RAISE NOTICE 'User not found in auth.users: %', target_user_id;
  END IF;
END $$;

-- 4. Verification
SELECT 
  u.id as user_id,
  u.email as auth_email,
  p.email as profile_email,
  p.full_name,
  p.role,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.id = '6a06617b-deee-4f02-a08a-bdec17e46d98';