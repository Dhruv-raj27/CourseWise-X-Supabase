-- Keep the users table but simplify it to core identity data
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    auth_provider TEXT DEFAULT null,
    google_user_id TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_number TEXT,
    profile_picture_url TEXT,
    role TEXT DEFAULT 'student',
    bio TEXT,
    current_semester INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    CONSTRAINT unique_google_id UNIQUE (google_user_id),
    CONSTRAINT unique_email UNIQUE (email)
);

-- Move course recommendation preferences to a dedicated table
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



-- Track user semester data
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

-- Track courses taken each semester
CREATE TABLE IF NOT EXISTS user_semester_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    semester_number INTEGER NOT NULL CHECK (semester_number > 0 AND semester_number <= 8),
    grade TEXT,
    status TEXT CHECK (status IN ('completed', 'dropped')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id, semester_number)
);

-- Achievement badges for the profile/dashboard
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

-- Keep your existing selected_courses table for current semester selections
-- Either keep or recreate with this definition:
CREATE TABLE IF NOT EXISTS selected_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id)
);