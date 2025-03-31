-- Template for inserting streams
INSERT INTO streams (name, description) VALUES
('All', 'General courses applicable to all streams'),
('Computer Science and Engineering', 'Courses specific to CSE stream'),
('Computer Science and AI', 'Courses specific to CS and AI stream'),
('Computer Science and Design', 'Courses specific to CS and Design stream'),
('Electronics & Communication Engineering', 'Courses specific to ECE stream'),
('Computer Science and Social Sciences', 'Courses specific to CS and Social Sciences stream')
ON CONFLICT (name) DO NOTHING;

-- Template for inserting a course with all details
SELECT add_course(
    'CSE101', -- code
    'Introduction to Programming', -- name
    'Introduction to programming concepts with Python', -- description
    4, -- credits
    1, -- semester
    'All', -- stream_name
    'Dr. John Doe', -- instructor
    NULL, -- difficulty (can be updated later)
    'Computer Science', -- department
    ARRAY['CSE100'], -- prerequisites
    ARRAY['CSE102'], -- anti-requisites
    '[
        {
            "day": "Monday",
            "start_time": "09:30",
            "end_time": "11:00"
        },
        {
            "day": "Wednesday",
            "start_time": "09:30",
            "end_time": "11:00"
        },
        {
            "day": "Friday",
            "start_time": "14:00",
            "end_time": "16:00"
        }
    ]'::JSONB -- schedule
);

-- Template for updating a course
SELECT update_course(
    'CSE101',
    '{
        "instructor": "New Instructor",
        "difficulty": "Medium",
        "description": "Updated description",
        "status": "inactive",
        "schedule": [
            {
                "day": "Monday",
                "start_time": "10:00",
                "end_time": "11:30"
            },
            {
                "day": "Wednesday",
                "start_time": "10:00",
                "end_time": "11:30"
            }
        ]
    }'::JSONB
);

-- Example of bulk course insertion
DO $$
DECLARE
    v_stream_id UUID;
BEGIN
    -- Get stream ID
    SELECT id INTO v_stream_id FROM streams WHERE name = 'Computer Science and Engineering';

    -- Insert multiple courses
    PERFORM add_course(
        'CSE102', -- code
        'Data Structures', -- name
        'Introduction to data structures and algorithms', -- description
        4, -- credits
        2, -- semester
        'Computer Science and Engineering', -- stream_name
        'Dr. Jane Smith', -- instructor
        NULL, -- difficulty
        'Computer Science', -- department
        ARRAY['CSE101'], -- prerequisites
        ARRAY['CSE103'], -- anti-requisites
        '[
            {
                "day": "Tuesday",
                "start_time": "09:30",
                "end_time": "11:00"
            },
            {
                "day": "Thursday",
                "start_time": "09:30",
                "end_time": "11:00"
            }
        ]'::JSONB -- schedule
    );

    -- Add more courses as needed...
END $$; 