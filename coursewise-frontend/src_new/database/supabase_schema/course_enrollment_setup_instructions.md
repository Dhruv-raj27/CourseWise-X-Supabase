# Course Enrollment Setup Instructions

To get the Course Enrollment feature working properly, follow these steps:

## Step 1: Execute the SQL Script

1. Open your Supabase dashboard and navigate to the SQL Editor
2. Copy the contents of the `course_enrollment_setup.sql` file
3. Paste it into the SQL Editor and run the query

This script will:
- Create the necessary tables if they don't exist
- Verify the table structure matches what the component expects
- Insert sample courses if your database is empty
- Set up proper row-level security policies

## Step 2: Verify Navigation

1. Make sure your app is running
2. Navigate to the Academic Tools page
3. Click on the "Course Enrollment" card
4. You should now see the Course Enrollment feature with courses listed

## Step 3: Add More Courses (Optional)

If you want to add more courses, you can use the Admin Dashboard:

1. Login to the Admin Dashboard
2. Navigate to Courses → Add Course
3. Fill in the course details and submit

Or run additional SQL INSERT statements like:

```sql
INSERT INTO courses (id, code, name, credits, stream_id, semester, description, instructor, department, status)
VALUES 
('CS301', 'CS301', 'Database Systems', 4, 
(SELECT id FROM streams WHERE name = 'Computer Science' LIMIT 1),
5, 'Introduction to database design, normalization, and SQL.', 
'Dr. Williams', 'Computer Science', 'active');
```

## Troubleshooting

If you're still having issues:

1. Check the browser console for errors
2. Verify your Supabase connection is working
3. Make sure the tables have been created properly
4. Verify that you have courses in the database with the correct schema
5. Check that your user has the necessary permissions 