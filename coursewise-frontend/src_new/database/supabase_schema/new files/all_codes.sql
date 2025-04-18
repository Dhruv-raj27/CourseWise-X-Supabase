-- If courses.id must remain TEXT type, adjust user_courses table
BEGIN;
-- Drop the foreign key constraint if it exists
ALTER TABLE user_courses DROP CONSTRAINT IF EXISTS user_courses_course_id_fkey;

-- Change the data type of course_id to TEXT
ALTER TABLE user_courses ALTER COLUMN course_id TYPE TEXT;

-- Re-add the foreign key constraint
ALTER TABLE user_courses ADD CONSTRAINT user_courses_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES courses(id);
COMMIT;







-- Apply comprehensive RLS policies for users table
BEGIN;

-- Reset existing policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own user data" ON users;
DROP POLICY IF EXISTS "Users can update own user data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "System can insert user data" ON users;

-- Create specific policies
-- Allow users to read their own data
CREATE POLICY "Users can view own data" ON users 
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Allow system to insert user data (for auth hooks)
CREATE POLICY "System can insert user data" ON users 
  FOR INSERT WITH CHECK (true);

-- Grant proper permissions
GRANT SELECT, UPDATE ON users TO authenticated;

COMMIT;







-- Ensure the function exists that is called in the code
CREATE OR REPLACE FUNCTION create_or_update_user_profile(
  user_id UUID,
  user_email VARCHAR,
  user_name VARCHAR,
  auth_provider VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Insert or update the user profile
  INSERT INTO users (
    id, 
    email, 
    full_name, 
    auth_provider,
    email_verified
  )
  VALUES (
    user_id,
    user_email,
    user_name,
    auth_provider,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    auth_provider = EXCLUDED.auth_provider,
    updated_at = NOW(),
    email_verified = TRUE
  RETURNING to_jsonb(users.*) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to function
GRANT EXECUTE ON FUNCTION create_or_update_user_profile TO authenticated;






-- First temporarily disable RLS to make changes
BEGIN;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Clear existing policies
DROP POLICY IF EXISTS "Users can view own user data" ON users;
DROP POLICY IF EXISTS "Users can update own user data" ON users;
DROP POLICY IF EXISTS "System can insert user data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "System can create users" ON users;
-- Create proper policies
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "System can create users" ON users 
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

COMMIT;






-- Comprehensive SQL script to fix RLS permissions for Supabase
-- Execute this in the Supabase SQL Editor

-- First, disable RLS temporarily to diagnose issues
BEGIN;

-- Temporarily disable RLS for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Reset policies
DROP POLICY IF EXISTS "Users can view own user data" ON users;
DROP POLICY IF EXISTS "Users can update own user data" ON users;
DROP POLICY IF EXISTS "System can insert user data" ON users;
DROP POLICY IF EXISTS "Auth can read users" ON users;
DROP POLICY IF EXISTS "Auth can update users" ON users;
DROP POLICY IF EXISTS "Service role can read users" ON users;

-- Create more permissive policies
-- Service account (internal) access
CREATE POLICY "Service role can access users" ON users 
  USING (auth.role() = 'service_role');

-- User can read their own data
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

-- User can update their own data
CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- System can create user entries
CREATE POLICY "System can create users" ON users 
  FOR INSERT WITH CHECK (true);

-- Re-enable RLS with new policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Check if the session handling function exists
CREATE OR REPLACE FUNCTION handle_session_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- For diagnostic purposes, log user info
  RAISE NOTICE 'User ID: %, Email: %', NEW.id, NEW.email;
  
  -- Update user data
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    auth_provider,
    email_verified
  ) VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    COALESCE(NEW.email_confirmed, false)
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    auth_provider = COALESCE(EXCLUDED.auth_provider, users.auth_provider),
    email_verified = COALESCE(EXCLUDED.email_verified, users.email_verified),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_session_user();

COMMIT;

-- Verify policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'users';








BEGIN;

-- Enable Row Level Security for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own user data" ON users;
DROP POLICY IF EXISTS "Users can update own user data" ON users;
DROP POLICY IF EXISTS "System can insert user data" ON users;

-- Create policies
-- Policy for users to read their own data
CREATE POLICY "Users can view own user data" ON users 
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own user data" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Policy for table creation/insertion by the auth functions
CREATE POLICY "System can insert user data" ON users 
  FOR INSERT WITH CHECK (true);

COMMIT;






// ... existing code ...

-- Enable Row Level Security for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view own user data" ON users 
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own user data" ON users 
  FOR UPDATE USING (auth.uid() = id);

-- Policy for table creation/insertion by the auth functions
CREATE POLICY "System can insert user data" ON users 
  FOR INSERT WITH CHECK (true);

// ... existing code ...







-- Drop existing users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication service" ON public.users;
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;
-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create improved user policies with better permission handling
-- 1. Allow users to view their own profile data
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 2. Allow users to insert their own data (for profile creation)
CREATE POLICY "Users can insert their own data"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- 4. Allow authenticated service to create student users
CREATE POLICY "Enable insert for authentication service"
ON public.users
FOR INSERT
WITH CHECK (role = 'student');

-- 5. Add an admin policy to view all users
CREATE POLICY "Admin can view all users"
ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.email = auth.email()
  )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;












-- Drop existing policies and triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication service" ON public.users;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Allow Supabase auth to handle user creation
CREATE POLICY "Enable insert for authentication service"
ON public.users
FOR INSERT
WITH CHECK (role = 'student');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create function to handle new user registration
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
    NEW.raw_user_meta_data->>'full_name',
    'google',
    NEW.raw_user_meta_data->>'sub',
    TRUE,
    NEW.raw_user_meta_data->>'avatar_url',
    'student'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    auth_provider = EXCLUDED.auth_provider,
    google_user_id = EXCLUDED.google_user_id,
    email_verified = TRUE,
    profile_picture_url = EXCLUDED.profile_picture_url,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();











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










-- Stream policies
CREATE POLICY "Anyone can view streams"
    ON streams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anonymous can view streams"
    ON streams FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Admin can insert streams"
    ON streams FOR INSERT
    TO authenticated
    WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin can update streams"
    ON streams FOR UPDATE
    TO authenticated
    USING (is_admin(auth.uid()));

CREATE POLICY "Admin can delete streams"
    ON streams FOR DELETE
    TO authenticated
    USING (is_admin(auth.uid()));

-- Grant necessary permissions for streams
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON streams TO authenticated;
GRANT SELECT ON streams TO anon;















-- Drop any existing policies
DROP POLICY IF EXISTS "Enable all actions for admin users" ON courses;

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create a simpler policy for admin users
CREATE POLICY "Enable all actions for admin users" ON courses
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
  )
);









INSERT INTO streams (name, description) VALUES
('All', 'General courses applicable to all streams'),
('Computer Science and Engineering', 'Courses specific to CSE stream'),
('Computer Science and AI', 'Courses specific to CS and AI stream'),
('Computer Science and Design', 'Courses specific to CS and Design stream'),
('Electronics & Communication Engineering', 'Courses specific to ECE stream'),
('Computer Science and Social Sciences', 'Courses specific to CS and Social Sciences stream')
ON CONFLICT (name) DO NOTHING;







-- Enable RLS on enrollments table
alter table enrollments enable row level security;

-- Create a function to check if a user is an admin
create or replace function is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_profiles
    where id = user_id
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Admin Policies
-- Admins can view all enrollments
create policy "admins can view all enrollments"
on enrollments for select
to authenticated
using (is_admin(auth.uid()));

-- Admins can insert enrollments for any user
create policy "admins can insert enrollments"
on enrollments for insert
to authenticated
with check (is_admin(auth.uid()));

-- Admins can update any enrollment
create policy "admins can update enrollments"
on enrollments for update
to authenticated
using (is_admin(auth.uid()))
with check (is_admin(auth.uid()));

-- Admins can delete any enrollment
create policy "admins can delete enrollments"
on enrollments for delete
to authenticated
using (is_admin(auth.uid()));

-- Student Policies
-- Students can view their own enrollments
create policy "students can view own enrollments"
on enrollments for select
to authenticated
using (auth.uid() = user_id);

-- Students can enroll themselves in courses
create policy "students can enroll themselves"
on enrollments for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'active'
  and not exists (
    select 1
    from enrollments e
    where e.user_id = auth.uid()
    and e.course_id = enrollments.course_id
    and e.status = 'active'
  )
);

-- Students can update their own enrollment status
create policy "students can update own enrollment status"
on enrollments for update
to authenticated
using (auth.uid() = user_id and status = 'active')
with check (
  auth.uid() = user_id
  and status in ('dropped', 'completed')
);

-- Students cannot delete enrollments (only update status)
-- No delete policy for students

-- Add completed_at trigger
create or replace function set_completed_at()
returns trigger as $$
begin
    -- Only set completed_at when status changes to completed
  if (TG_OP = 'UPDATE') then
    if (NEW.status = 'completed' and OLD.status != 'completed') then
      NEW.completed_at = now();
    elsif (NEW.status != 'completed') then
      NEW.completed_at = null;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger set_enrollment_completed_at
before update on enrollments
for each row
execute function set_completed_at();

-- Add updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  if (TG_OP = 'UPDATE') then
    NEW.updated_at = now();
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger set_enrollment_updated_at
before update on enrollments
for each row
execute function set_updated_at();













create table enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  course_id text references courses(id) not null,  -- Changed from uuid to text
  status text check (status in ('active', 'completed', 'dropped')) default 'active',
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);









-- Drop existing functions
DROP FUNCTION IF EXISTS add_course(TEXT, TEXT, TEXT, INTEGER, INTEGER, TEXT, TEXT, difficulty_level, TEXT, TEXT[], TEXT[], JSONB) CASCADE;
DROP FUNCTION IF EXISTS update_course(TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS delete_course(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_course_details(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_stream_courses(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_semester_courses(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_active_courses() CASCADE;

-- Function to add a new course
CREATE OR REPLACE FUNCTION add_course(
    p_code TEXT,
    p_name TEXT,
    p_description TEXT,
    p_credits INTEGER,
    p_semester INTEGER,
    p_stream_name TEXT,
    p_instructor TEXT,
    p_difficulty difficulty_level,
    p_department TEXT,
    p_prerequisites TEXT[],
    p_anti_requisites TEXT[],
    p_schedule JSONB
) RETURNS TEXT AS $$
DECLARE
    v_stream_id UUID;
BEGIN
    -- Check if admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admin can add courses';
    END IF;

    -- Get or create stream
    SELECT id INTO v_stream_id FROM streams WHERE name = p_stream_name;
    IF v_stream_id IS NULL THEN
        INSERT INTO streams (name) VALUES (p_stream_name) RETURNING id INTO v_stream_id;
    END IF;

    -- Insert course
    INSERT INTO courses (
        id, code, name, description, credits, semester, stream_id,
        instructor, difficulty, department, prerequisites, anti_requisites, schedule
    ) VALUES (
        p_code, p_code, p_name, p_description, p_credits, p_semester, v_stream_id,
        p_instructor, p_difficulty, p_department, p_prerequisites, p_anti_requisites, p_schedule
    );

    RETURN p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a course
CREATE OR REPLACE FUNCTION update_course(
    p_course_id TEXT,
    p_updates JSONB
) RETURNS VOID AS $$
BEGIN
    -- Check if admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admin can update courses';
    END IF;

    -- Update course
    UPDATE courses 
    SET 
        name = COALESCE((p_updates->>'name')::TEXT, name),
        description = COALESCE((p_updates->>'description')::TEXT, description),
        credits = COALESCE((p_updates->>'credits')::INTEGER, credits),
        semester = COALESCE((p_updates->>'semester')::INTEGER, semester),
        instructor = COALESCE((p_updates->>'instructor')::TEXT, instructor),
        difficulty = COALESCE((p_updates->>'difficulty')::difficulty_level, difficulty),
        department = COALESCE((p_updates->>'department')::TEXT, department),
        prerequisites = COALESCE((p_updates->>'prerequisites')::TEXT[], prerequisites),
        anti_requisites = COALESCE((p_updates->>'anti_requisites')::TEXT[], anti_requisites),
        schedule = COALESCE((p_updates->>'schedule')::JSONB, schedule),
        status = COALESCE((p_updates->>'status')::course_status, status),
        updated_at = NOW()
    WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a course
CREATE OR REPLACE FUNCTION delete_course(
    p_course_id TEXT
) RETURNS VOID AS $$
BEGIN
    -- Check if admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Only admin can delete courses';
    END IF;

    -- Delete course
    DELETE FROM courses WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get course details
CREATE OR REPLACE FUNCTION get_course_details(
    p_course_id TEXT
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT row_to_json(c) INTO v_result
    FROM courses c
    WHERE c.id = p_course_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all courses for a stream
CREATE OR REPLACE FUNCTION get_stream_courses(
    p_stream_name TEXT
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(row_to_json(c)) INTO v_result
    FROM courses c
    JOIN streams s ON s.id = c.stream_id
    WHERE s.name = p_stream_name
    ORDER BY c.code;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all courses for a semester
CREATE OR REPLACE FUNCTION get_semester_courses(
    p_semester INTEGER
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(row_to_json(c)) INTO v_result
    FROM courses c
    WHERE c.semester = p_semester
    ORDER BY c.code;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all active courses
CREATE OR REPLACE FUNCTION get_active_courses()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(row_to_json(c)) INTO v_result
    FROM courses c
    WHERE c.status = 'active'
    ORDER BY c.code;

    RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add course prerequisites
CREATE OR REPLACE FUNCTION add_course_prerequisites(
    p_course_id TEXT,
    p_prerequisite_ids TEXT[]
) RETURNS VOID AS $$
DECLARE
    v_prereq_id TEXT;
BEGIN
    -- Check if admin
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Only admin can add prerequisites';
    END IF;

    -- Delete existing prerequisites
    DELETE FROM course_prerequisites WHERE course_id = p_course_id;

    -- Add new prerequisites
    FOREACH v_prereq_id IN ARRAY p_prerequisite_ids
    LOOP
        INSERT INTO course_prerequisites (course_id, prerequisite_id)
        VALUES (p_course_id, v_prereq_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 










-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Anyone can view streams" ON streams;
DROP POLICY IF EXISTS "Admin can manage streams" ON streams;
DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON courses;
DROP POLICY IF EXISTS "Users can view their selected courses" ON selected_courses;
DROP POLICY IF EXISTS "Users can manage their selected courses" ON selected_courses;
DROP POLICY IF EXISTS "Admin can view all selected courses" ON selected_courses;
DROP POLICY IF EXISTS "Anyone can view reviews" ON course_reviews;
DROP POLICY IF EXISTS "Users can manage their own reviews" ON course_reviews;
DROP POLICY IF EXISTS "Admin can manage all reviews" ON course_reviews;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all users"
    ON users FOR SELECT
    USING (is_admin(auth.uid()));

-- Stream policies
CREATE POLICY "Anyone can view streams"
    ON streams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage streams"
    ON streams FOR ALL
    USING (is_admin(auth.uid()));

-- Course policies
CREATE POLICY "Anyone can view active courses"
    ON courses FOR SELECT
    TO authenticated
    USING (status = 'active');

CREATE POLICY "Admin can manage courses"
    ON courses FOR ALL
    USING (is_admin(auth.uid()));

-- Selected courses policies
CREATE POLICY "Users can view their selected courses"
    ON selected_courses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their selected courses"
    ON selected_courses FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all selected courses"
    ON selected_courses FOR SELECT
    USING (is_admin(auth.uid()));

-- Course review policies
CREATE POLICY "Anyone can view reviews"
    ON course_reviews FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage their own reviews"
    ON course_reviews FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all reviews"
    ON course_reviews FOR ALL
    USING (is_admin(auth.uid()));

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON selected_courses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON course_reviews TO authenticated; 













-- Create users table
CREATE TABLE IF NOT EXISTS users (
    -- Core user fields (from auth.users)
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    auth_provider TEXT DEFAULT 'email',
    google_user_id TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_number TEXT,
    
    -- Academic details
    institution TEXT,
    branch TEXT,
    semester INTEGER,
    
    -- Profile details
    profile_picture_url TEXT,
    role TEXT DEFAULT 'student',
    bio TEXT,
    
    -- Additional preferences (from UserInput form)
    career_goal TEXT,
    preparation_type TEXT,
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    technical_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    improvement_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
    course_format TEXT,
    time_commitment TEXT,
    course_style TEXT,
    primary_interest TEXT,
    secondary_interest TEXT,
    experience_level TEXT,
    work_environment TEXT,
    future_goal TEXT,
    preparation_timeline TEXT,
    soft_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    
    -- Add unique constraint for Google ID
    CONSTRAINT unique_google_id UNIQUE (google_user_id),
    CONSTRAINT unique_email UNIQUE (email)
);

-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create courses table with all course-related data
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,  -- Using course code as ID (e.g., 'CSE101')
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    stream_id UUID REFERENCES streams(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 8),
    description TEXT,
    instructor TEXT,
    difficulty difficulty_level DEFAULT NULL,  -- Can be updated later
    department TEXT,
    status course_status DEFAULT 'active',
    prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],  -- Array of course codes
    anti_requisites TEXT[] DEFAULT ARRAY[]::TEXT[],  -- Array of course codes
    schedule JSONB DEFAULT '[]'::JSONB,  -- Array of schedule objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    CONSTRAINT valid_schedule CHECK (validate_schedule(schedule))
);

-- Create selected courses table
CREATE TABLE IF NOT EXISTS selected_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Create course reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id, semester)
);

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON course_reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS courses_code_idx ON courses(code);
CREATE INDEX IF NOT EXISTS courses_semester_idx ON courses(semester);
CREATE INDEX IF NOT EXISTS courses_stream_id_idx ON courses(stream_id);
CREATE INDEX IF NOT EXISTS selected_courses_user_id_idx ON selected_courses(user_id);
CREATE INDEX IF NOT EXISTS selected_courses_course_id_idx ON selected_courses(course_id); 
















-- Drop existing types and functions
DROP TYPE IF EXISTS course_status CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS day_of_week CASCADE;
DROP FUNCTION IF EXISTS trigger_set_timestamp() CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS validate_schedule(JSONB) CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE course_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

-- Create custom functions
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create schedule validation function
CREATE OR REPLACE FUNCTION validate_schedule(schedule JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    schedule_item JSONB;
BEGIN
    -- Check if schedule is an array
    IF jsonb_typeof(schedule) != 'array' THEN
        RETURN FALSE;
    END IF;

    -- Check each schedule item
    FOR schedule_item IN SELECT * FROM jsonb_array_elements(schedule)
    LOOP
        -- Check required fields
        IF schedule_item->>'day' IS NULL 
           OR schedule_item->>'start_time' IS NULL 
           OR schedule_item->>'end_time' IS NULL THEN
            RETURN FALSE;
        END IF;

        -- Check valid day
        BEGIN
            IF (schedule_item->>'day')::day_of_week IS NULL THEN
                RETURN FALSE;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RETURN FALSE;
        END;

        -- Check valid times
        BEGIN
            IF (schedule_item->>'start_time')::TIME IS NULL 
               OR (schedule_item->>'end_time')::TIME IS NULL 
               OR (schedule_item->>'start_time')::TIME >= (schedule_item->>'end_time')::TIME THEN
                RETURN FALSE;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RETURN FALSE;
        END;
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;












-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table and policies if they exist
DROP POLICY IF EXISTS "Prevent admin deletion" ON admin_users;
DROP POLICY IF EXISTS "Prevent admin email updates" ON admin_users;
DROP POLICY IF EXISTS "Allow admin read" ON admin_users;
DROP TABLE IF EXISTS admin_users;

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT admin_users_email_check CHECK (email = 'admn.coursewise@gmail.com')
);

-- Create RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy to prevent deletion of admin user
CREATE POLICY "Prevent admin deletion" ON admin_users
FOR DELETE USING (false);

-- Policy to prevent updates to admin email
CREATE POLICY "Prevent admin email updates" ON admin_users
FOR UPDATE USING (false);

-- Policy to allow admin to read their own data
CREATE POLICY "Allow admin read" ON admin_users
FOR SELECT USING (auth.email() = email);

-- Insert the admin user
INSERT INTO admin_users (email)
VALUES ('admn.coursewise@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT ON admin_users TO authenticated; 