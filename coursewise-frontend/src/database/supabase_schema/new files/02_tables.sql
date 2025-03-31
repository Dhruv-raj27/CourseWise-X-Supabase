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