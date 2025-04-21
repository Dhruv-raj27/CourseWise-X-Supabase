-- Verify and setup course enrollment tables
DO $$ 
BEGIN
  -- Create course_status type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
    CREATE TYPE course_status AS ENUM ('active', 'inactive', 'archived');
  END IF;
END $$;

-- Verify streams table
CREATE TABLE IF NOT EXISTS streams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    course_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Verify courses table with compatible structure for CourseEnrollment component
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Verify selected_courses table for tracking enrollments
CREATE TABLE IF NOT EXISTS selected_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Insert sample data if tables are empty
INSERT INTO streams (name, description)
SELECT 'Computer Science', 'Computer Science and Engineering'
WHERE NOT EXISTS (SELECT 1 FROM streams LIMIT 1);

INSERT INTO streams (name, description)
SELECT 'Electrical Engineering', 'Electrical and Electronics Engineering'
WHERE NOT EXISTS (SELECT 1 FROM streams WHERE name = 'Electrical Engineering');

-- Sample course data
INSERT INTO courses (id, code, name, credits, stream_id, semester, description, instructor, department, status, prerequisites, schedule)
SELECT 
    'CS101', 'CS101', 'Introduction to Programming', 4, 
    (SELECT id FROM streams WHERE name = 'Computer Science' LIMIT 1),
    1, 'Learn the basics of programming concepts using Python and C.', 
    'Dr. Smith', 'Computer Science', 'active', ARRAY[]::TEXT[],
    '[
        {"day": "Monday", "start_time": "09:00", "end_time": "10:30", "room": "CS-101", "type": "Lecture"},
        {"day": "Wednesday", "start_time": "09:00", "end_time": "10:30", "room": "CS-101", "type": "Lecture"}
    ]'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CS101');

INSERT INTO courses (id, code, name, credits, stream_id, semester, description, instructor, department, status, prerequisites, schedule)
SELECT 
    'CS201', 'CS201', 'Data Structures', 4, 
    (SELECT id FROM streams WHERE name = 'Computer Science' LIMIT 1),
    3, 'Advanced data structures and algorithms with practical applications.', 
    'Dr. Johnson', 'Computer Science', 'active', ARRAY['CS101']::TEXT[],
    '[
        {"day": "Tuesday", "start_time": "11:00", "end_time": "12:30", "room": "CS-201", "type": "Lecture"},
        {"day": "Thursday", "start_time": "11:00", "end_time": "12:30", "room": "CS-201", "type": "Lecture"}
    ]'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'CS201');

INSERT INTO courses (id, code, name, credits, stream_id, semester, description, instructor, department, status, prerequisites, schedule)
SELECT 
    'EE101', 'EE101', 'Basic Electronics', 4, 
    (SELECT id FROM streams WHERE name = 'Electrical Engineering' LIMIT 1),
    1, 'Introduction to basic electronic components and circuits.', 
    'Dr. Wilson', 'Electrical Engineering', 'active', ARRAY[]::TEXT[],
    '[
        {"day": "Monday", "start_time": "13:00", "end_time": "14:30", "room": "EE-101", "type": "Lecture"},
        {"day": "Wednesday", "start_time": "13:00", "end_time": "14:30", "room": "LAB-A", "type": "Lab"}
    ]'::JSONB
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'EE101');

-- Enable RLS and set up policies
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY IF NOT EXISTS "Anyone can view active courses" 
ON courses FOR SELECT 
USING (status = 'active');

-- Create policies for streams
CREATE POLICY IF NOT EXISTS "Anyone can view streams" 
ON streams FOR SELECT 
USING (true);

-- Selected courses policies
CREATE POLICY IF NOT EXISTS "Users can view their selected courses" 
ON selected_courses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage their selected courses" 
ON selected_courses FOR ALL 
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON streams TO anon, authenticated;
GRANT SELECT ON courses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON selected_courses TO authenticated; 