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