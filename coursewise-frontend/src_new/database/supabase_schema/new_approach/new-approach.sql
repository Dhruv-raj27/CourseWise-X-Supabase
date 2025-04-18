-- Drop existing tables (clean slate approach)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_semester_courses CASCADE;
DROP TABLE IF EXISTS user_academic_records CASCADE;
DROP TABLE IF EXISTS user_course_preferences CASCADE;
DROP TABLE IF EXISTS selected_courses CASCADE;
DROP TABLE IF EXISTS course_reviews CASCADE;
DROP TABLE IF EXISTS streams CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- Custom Types (recreate these first)
-- ==========================================
DO $$ 
BEGIN
  -- Create course_status type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
    CREATE TYPE course_status AS ENUM ('active', 'inactive', 'archived');
  END IF;
  
  -- Create difficulty_level type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN
    CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
  END IF;
END $$;

-- ==========================================
-- Helper Functions
-- ==========================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate schedule JSON
CREATE OR REPLACE FUNCTION validate_schedule(schedule JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic check - can be enhanced as needed
  RETURN (schedule IS NULL OR jsonb_typeof(schedule) = 'array');
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Core Tables
-- ==========================================

-- 1. Admin Users Table (CRITICAL for admin login)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    auth_provider TEXT DEFAULT 'email',
    google_user_id TEXT,
    github_user_id TEXT,
    -- Academic details
    institution TEXT,
    branch TEXT,
    semester INTEGER,
    -- Profile details
    profile_picture_url TEXT,
    role TEXT DEFAULT 'student',
    bio TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    -- Constraints
    CONSTRAINT unique_google_id UNIQUE (google_user_id),
    CONSTRAINT unique_github_id UNIQUE (github_user_id),
    CONSTRAINT unique_email UNIQUE (email)
);

-- 3. Streams Table
CREATE TABLE IF NOT EXISTS streams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    course_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 4. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,  -- Using course code as ID (e.g., 'CSE101')
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    stream_id UUID REFERENCES streams(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 8),
    description TEXT,
    instructor TEXT,
    department TEXT,
    status course_status DEFAULT 'active',
    prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],
    anti_requisites TEXT[] DEFAULT ARRAY[]::TEXT[],
    schedule JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    CONSTRAINT valid_schedule CHECK (validate_schedule(schedule))
);

-- 5. Selected Courses Table
CREATE TABLE IF NOT EXISTS selected_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- 6. Course Reviews Table
CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
    difficulty difficulty_level DEFAULT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id, semester)
);

-- ==========================================
-- New Feature Tables
-- ==========================================

-- 7. Course Preferences Table (for recommendation feature)
CREATE TABLE IF NOT EXISTS user_course_preferences (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 8. Academic Records Table
CREATE TABLE IF NOT EXISTS user_academic_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    semester_number INTEGER NOT NULL CHECK (semester_number > 0 AND semester_number <= 8),
    academic_year TEXT,
    gpa NUMERIC(3,2) CHECK (gpa >= 0.0 AND gpa <= 10.0),
    backlogs INTEGER default 0,
    total_credits INTEGER DEFAULT 0,
    completed_credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, semester_number)
);

-- 9. Semester Courses Table
CREATE TABLE IF NOT EXISTS user_semester_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    semester_number INTEGER NOT NULL CHECK (semester_number > 0 AND semester_number <= 8),
    grade TEXT,
    backlog TEXT check (backlog in ('Yes','No')) default 'No',
    status TEXT CHECK (status IN ('completed', 'dropped')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id, semester_number)
);

-- 10. Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    semester_number INTEGER,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- ==========================================
-- Triggers
-- ==========================================

-- Update timestamps trigger for courses
CREATE TRIGGER set_timestamp_courses
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Update timestamps trigger for course_reviews
CREATE TRIGGER set_timestamp_course_reviews
BEFORE UPDATE ON course_reviews
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger to update stream course_count
CREATE OR REPLACE FUNCTION update_stream_course_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE streams
    SET course_count = COALESCE(course_count, 0) + 1
    WHERE id = NEW.stream_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE streams
    SET course_count = GREATEST(COALESCE(course_count, 0) - 1, 0)
    WHERE id = OLD.stream_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.stream_id != OLD.stream_id THEN
    UPDATE streams
    SET course_count = COALESCE(course_count, 0) + 1
    WHERE id = NEW.stream_id;
    
    UPDATE streams
    SET course_count = GREATEST(COALESCE(course_count, 0) - 1, 0)
    WHERE id = OLD.stream_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stream_course_count_trigger
AFTER INSERT OR DELETE OR UPDATE OF stream_id ON courses
FOR EACH ROW
EXECUTE FUNCTION update_stream_course_count();

-- ==========================================
-- Indexes
-- ==========================================

CREATE INDEX IF NOT EXISTS courses_code_idx ON courses(code);
CREATE INDEX IF NOT EXISTS courses_semester_idx ON courses(semester);
CREATE INDEX IF NOT EXISTS courses_stream_id_idx ON courses(stream_id);
CREATE INDEX IF NOT EXISTS selected_courses_user_id_idx ON selected_courses(user_id);
CREATE INDEX IF NOT EXISTS selected_courses_course_id_idx ON selected_courses(course_id);
CREATE INDEX IF NOT EXISTS user_academic_records_user_id_idx ON user_academic_records(user_id);
CREATE INDEX IF NOT EXISTS user_semester_courses_user_id_idx ON user_semester_courses(user_id);

-- ==========================================
-- User Authentication Handling
-- ==========================================

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
    github_user_id,
    profile_picture_url,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'provider', 'email'),
    CASE WHEN NEW.raw_user_meta_data->>'provider' = 'google' THEN NEW.raw_user_meta_data->>'sub' ELSE NULL END,
    CASE WHEN NEW.raw_user_meta_data->>'provider' = 'github' THEN NEW.raw_user_meta_data->>'sub' ELSE NULL END,
    NEW.raw_user_meta_data->>'avatar_url',
    'student'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    auth_provider = EXCLUDED.auth_provider,
    google_user_id = CASE WHEN EXCLUDED.auth_provider = 'google' THEN EXCLUDED.google_user_id ELSE users.google_user_id END,
    github_user_id = CASE WHEN EXCLUDED.auth_provider = 'github' THEN EXCLUDED.github_user_id ELSE users.github_user_id END,
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

-- ==========================================
-- Row Level Security Policies
-- ==========================================

-- Critical: Admin Users table (for admin login)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous to check admin status (needed for login)
CREATE POLICY "Allow anonymous to check admin status"
ON admin_users FOR SELECT
TO anon
USING (true);

-- Allow authenticated to check admin status
CREATE POLICY "Allow authenticated to check admin status"
ON admin_users FOR SELECT
TO authenticated
USING (true);

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- For regular users
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- For system insertion
CREATE POLICY "System can insert user data"
ON users FOR INSERT
WITH CHECK (true);

-- Admin can view all users
CREATE POLICY "Admin can view all users"
ON users FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- Streams table policies
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Anyone can view streams
CREATE POLICY "Anyone can view streams"
ON streams FOR SELECT
USING (true);

-- Admin can manage streams
CREATE POLICY "Admin can manage streams"
ON streams FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- Courses table policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view active courses
CREATE POLICY "Anyone can view active courses"
ON courses FOR SELECT
USING (status = 'active');

-- Admin can manage courses
CREATE POLICY "Admin can manage courses"
ON courses FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- Selected courses policies
ALTER TABLE selected_courses ENABLE ROW LEVEL SECURITY;

-- Users can view their selected courses
CREATE POLICY "Users can view their selected courses"
ON selected_courses FOR SELECT
USING (auth.uid() = user_id);

-- Users can manage their selected courses
CREATE POLICY "Users can manage their selected courses"
ON selected_courses FOR ALL
USING (auth.uid() = user_id);

-- Admin can view all selected courses
CREATE POLICY "Admin can view all selected courses"
ON selected_courses FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- Course reviews policies
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON course_reviews FOR SELECT
USING (true);

-- Users can manage their own reviews
CREATE POLICY "Users can manage their own reviews"
ON course_reviews FOR ALL
USING (auth.uid() = user_id);

-- Admin can manage all reviews
CREATE POLICY "Admin can manage all reviews"
ON course_reviews FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- Course preferences policies
ALTER TABLE user_course_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own course preferences
CREATE POLICY "Users can view their own course preferences"
ON user_course_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can manage their own course preferences
CREATE POLICY "Users can manage their own course preferences"
ON user_course_preferences FOR ALL
USING (auth.uid() = user_id);

-- Admin can view all course preferences
CREATE POLICY "Admin can view all course preferences"
ON user_course_preferences FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- Academic records policies
ALTER TABLE user_academic_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own academic records
CREATE POLICY "Users can view their own academic records"
ON user_academic_records FOR SELECT
USING (auth.uid() = user_id);

-- Users can manage their own academic records
CREATE POLICY "Users can manage their own academic records"
ON user_academic_records FOR ALL
USING (auth.uid() = user_id);

-- Admin can view all academic records
CREATE POLICY "Admin can view all academic records"
ON user_academic_records FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- Semester courses policies
ALTER TABLE user_semester_courses ENABLE ROW LEVEL SECURITY;

-- Users can view their own semester courses
CREATE POLICY "Users can view their own semester courses"
ON user_semester_courses FOR SELECT
USING (auth.uid() = user_id);

-- Users can manage their own semester courses
CREATE POLICY "Users can manage their own semester courses"
ON user_semester_courses FOR ALL
USING (auth.uid() = user_id);

-- Admin can view all semester courses
CREATE POLICY "Admin can view all semester courses"
ON user_semester_courses FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- Achievements policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements"
ON user_achievements FOR SELECT
USING (auth.uid() = user_id);

-- Users can view others' achievements (optional)
CREATE POLICY "Users can view others' achievements"
ON user_achievements FOR SELECT
USING (true);

-- Admin can manage all achievements
CREATE POLICY "Admin can manage all achievements"
ON user_achievements FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users WHERE email = auth.email()));

-- ==========================================
-- Grant Permissions
-- ==========================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT SELECT ON streams TO anon, authenticated;
GRANT SELECT ON courses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON selected_courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON course_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_course_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_academic_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_semester_courses TO authenticated;
GRANT SELECT ON user_achievements TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ==========================================
-- Insert a default admin user (modify email)
-- ==========================================
INSERT INTO admin_users (email)
VALUES ('admn.coursewise@gmail.com')  -- CHANGE THIS to your admin email
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- Admin Verification Function
-- ==========================================
CREATE OR REPLACE FUNCTION verify_admin_credentials(admin_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE email = admin_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;