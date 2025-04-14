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