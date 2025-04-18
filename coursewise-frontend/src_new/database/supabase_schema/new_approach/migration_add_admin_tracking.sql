-- Add admin tracking columns to courses table
ALTER TABLE courses 
ADD COLUMN created_by UUID REFERENCES users(id) NULL,
ADD COLUMN updated_by UUID REFERENCES users(id) NULL;

-- Create or replace trigger to update updated_by field
CREATE OR REPLACE FUNCTION update_courses_updated_by()
RETURNS TRIGGER AS $$
BEGIN
    -- Use auth.uid() to get the current user ID if available, otherwise keep existing
    NEW.updated_by = COALESCE(auth.uid(), NEW.updated_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS set_courses_updated_by ON courses;

-- Create the trigger
CREATE TRIGGER set_courses_updated_by
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_courses_updated_by();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS courses_created_by_idx ON courses(created_by);
CREATE INDEX IF NOT EXISTS courses_updated_by_idx ON courses(updated_by);

-- Comment on new columns
COMMENT ON COLUMN courses.created_by IS 'Reference to the admin user who created this course';
COMMENT ON COLUMN courses.updated_by IS 'Reference to the admin user who last updated this course'; 