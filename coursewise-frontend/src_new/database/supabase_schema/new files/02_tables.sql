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