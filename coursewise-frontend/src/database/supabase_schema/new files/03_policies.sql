-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Anyone can view streams" ON streams;
DROP POLICY IF EXISTS "Admin can manage streams" ON streams;
DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON courses;
DROP POLICY IF EXISTS "Users can view their selected courses" ON selected_courses;
DROP POLICY IF EXISTS "Users can manage their selected courses" ON selected_courses;
DROP POLICY IF EXISTS "Admin can view all selected courses" ON selected_courses;
DROP POLICY IF EXISTS "Anyone can view reviews" ON course_reviews;
DROP POLICY IF EXISTS "Users can manage their own reviews" ON course_reviews;
DROP POLICY IF EXISTS "Admin can manage all reviews" ON course_reviews;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin can view all users"
    ON users FOR SELECT
    USING (is_admin(auth.uid()));

-- Stream policies
CREATE POLICY "Anyone can view streams"
    ON streams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage streams"
    ON streams FOR ALL
    USING (is_admin(auth.uid()));

-- Course policies
CREATE POLICY "Anyone can view active courses"
    ON courses FOR SELECT
    TO authenticated
    USING (status = 'active');

CREATE POLICY "Admin can manage courses"
    ON courses FOR ALL
    USING (is_admin(auth.uid()));

-- Selected courses policies
CREATE POLICY "Users can view their selected courses"
    ON selected_courses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their selected courses"
    ON selected_courses FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all selected courses"
    ON selected_courses FOR SELECT
    USING (is_admin(auth.uid()));

-- Course review policies
CREATE POLICY "Anyone can view reviews"
    ON course_reviews FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage their own reviews"
    ON course_reviews FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all reviews"
    ON course_reviews FOR ALL
    USING (is_admin(auth.uid()));

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON selected_courses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON course_reviews TO authenticated; 