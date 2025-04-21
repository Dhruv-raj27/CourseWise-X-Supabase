-- Fix for Google OAuth Authentication Issues
-- This migration addresses issues with Google OAuth login:
-- 1. Users weren't properly created in the users table after OAuth authentication
-- 2. Email verification was incorrectly set to false for Google users

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new users from OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    auth_provider,
    google_user_id,
    email_verified,
    profile_picture_url,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    NEW.raw_user_meta_data->>'sub',
    CASE 
      WHEN NEW.raw_user_meta_data->>'provider' = 'google' THEN TRUE
      ELSE NEW.email_confirmed_at IS NOT NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'student'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    auth_provider = EXCLUDED.auth_provider,
    google_user_id = EXCLUDED.google_user_id,
    email_verified = CASE 
      WHEN EXCLUDED.auth_provider = 'google' THEN TRUE
      ELSE COALESCE(EXCLUDED.email_verified, users.email_verified)
    END,
    profile_picture_url = COALESCE(EXCLUDED.profile_picture_url, users.profile_picture_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Re-sync existing users from auth.users to the users table
INSERT INTO public.users (
  id,
  email,
  full_name,
  auth_provider,
  google_user_id,
  email_verified,
  profile_picture_url,
  role
)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
  COALESCE(raw_user_meta_data->>'provider', 'email'),
  raw_user_meta_data->>'sub',
  CASE 
    WHEN raw_user_meta_data->>'provider' = 'google' THEN TRUE
    ELSE email_confirmed_at IS NOT NULL
  END,
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'),
  'student'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

-- Update email_verified for existing Google users
UPDATE public.users
SET email_verified = TRUE
WHERE auth_provider = 'google'; 