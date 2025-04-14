-- First, drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update access for users" ON users;
DROP POLICY IF EXISTS "Enable delete access for users" ON users;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- 1. Read Policy: Users can read their own data and basic info of others
CREATE POLICY "Enable read access for authenticated users"
ON users
FOR SELECT
USING (
  -- Users can read their own data
  auth.uid() = id
  OR
  -- Or they can read basic public info of other users
  (
    auth.role() = 'authenticated' 
    AND 
    EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid())
  )
);

-- 2. Insert Policy: Users can only insert their own data
CREATE POLICY "Enable insert access for authenticated users"
ON users
FOR INSERT
WITH CHECK (
  -- Can only insert rows where the id matches their auth id
  auth.uid() = id
  AND
  -- Verify the user exists in auth.users
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid())
);

-- 3. Update Policy: Users can only update their own data
CREATE POLICY "Enable update access for users"
ON users
FOR UPDATE
USING (
  -- Can only update their own rows
  auth.uid() = id
  AND
  -- Verify the user exists in auth.users
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid())
)
WITH CHECK (
  -- Cannot change their id
  id = auth.uid()
  AND
  -- Verify the user exists in auth.users
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid())
);

-- 4. Delete Policy: Users cannot delete their profiles (handled by Supabase auth cascade)
CREATE POLICY "Enable delete access for users"
ON users
FOR DELETE
USING (false);  -- No direct deletion allowed

-- Create a function to handle user profile creation/updates
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, auth_provider, email_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'provider', 'email'),
    COALESCE(new.email_confirmed, false)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    auth_provider = COALESCE(EXCLUDED.auth_provider, users.auth_provider),
    email_verified = COALESCE(EXCLUDED.email_verified, users.email_verified),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 