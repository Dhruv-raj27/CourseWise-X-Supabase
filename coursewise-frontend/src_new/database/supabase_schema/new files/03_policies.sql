-- Drop existing policies and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication service" ON users;
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
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- User table policies
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication service"
ON public.users
FOR INSERT
WITH CHECK (role = 'student');

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
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON selected_courses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON course_reviews TO authenticated;

-- New user trigger function with improved handling
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
    COALESCE(NEW.raw_user_meta_data->>'provider', 'google'),
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();