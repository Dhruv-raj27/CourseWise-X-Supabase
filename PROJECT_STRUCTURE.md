# CourseWise Project Structure

## Current Structure Analysis

### Components Directory (`src/components/`)
Contains both page components and reusable UI components. Needs reorganization:

#### Should be in pages/:
- `AboutPage.tsx`
- `DashboardPage.tsx`
- `HomePage.tsx`
- `LoginPage.tsx`
- `SignupPage.tsx`

#### Should remain in components/:
- `ComingSoon.tsx`
- `CompleteProfile.tsx`
- `CourseFeatures.tsx`
- `CourseFilterForm.tsx`
- `CourseList.tsx`
- `CourseReviews/`
- `GoogleSignIn.tsx`
- `Navbar.tsx`
- `ProtectedRoute.tsx`
- `QuickFilters.tsx`
- `SelectedCourses.tsx`
- `TimeTable/`
- `UserForm.tsx`
- `YourPath.tsx`

### Pages Directory (`src/pages/`)
Contains page components and some form components. Current files:
- `CourseQuestionnaire.tsx`
- `Login.tsx`
- `RecommendationChoice.tsx`
- `UserInput.tsx`

### Services Directory (`src/services/`)
Contains API service layer:
- `api.ts`

### Types Directory (`src/types/`)
Contains TypeScript type definitions:
- `auth.ts`
- `formData.ts`
- `index.ts`

## Supabase Database Schema

### Tables Structure

1. **users**
   ```sql
   create table users (
     id uuid references auth.users primary key,
     email text unique not null,
     full_name text,
     avatar_url text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

2. **courses**
   ```sql
   create table courses (
     id uuid default uuid_generate_v4() primary key,
     title text not null,
     description text,
     instructor_id uuid references users(id),
     duration text,
     level text,
     prerequisites text[],
     topics text[],
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

3. **enrollments**
   ```sql
   create table enrollments (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references users(id) not null,
     course_id uuid references courses(id) not null,
     status text default 'in_progress',
     progress integer default 0,
     started_at timestamp with time zone default timezone('utc'::text, now()) not null,
     completed_at timestamp with time zone,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
     unique(user_id, course_id)
   );
   ```

4. **course_progress**
   ```sql
   create table course_progress (
     id uuid default uuid_generate_v4() primary key,
     enrollment_id uuid references enrollments(id) not null,
     module_id text not null,
     completed boolean default false,
     last_accessed timestamp with time zone,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

5. **user_preferences**
   ```sql
   create table user_preferences (
     user_id uuid references users(id) primary key,
     notification_enabled boolean default true,
     email_notifications boolean default true,
     theme text default 'light',
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

### Row Level Security Policies

1. **users**
   ```sql
   -- Users can read their own profile
   create policy "Users can read own profile"
     on users for select
     using (auth.uid() = id);

   -- Users can update their own profile
   create policy "Users can update own profile"
     on users for update
     using (auth.uid() = id);
   ```

2. **courses**
   ```sql
   -- Anyone can read courses
   create policy "Anyone can read courses"
     on courses for select
     using (true);

   -- Only instructors can create/update courses
   create policy "Instructors can manage courses"
     on courses for all
     using (auth.uid() = instructor_id);
   ```

3. **enrollments**
   ```sql
   -- Users can read their own enrollments
   create policy "Users can read own enrollments"
     on enrollments for select
     using (auth.uid() = user_id);

   -- Users can create their own enrollments
   create policy "Users can create own enrollments"
     on enrollments for insert
     with check (auth.uid() = user_id);

   -- Users can update their own enrollments
   create policy "Users can update own enrollments"
     on enrollments for update
     using (auth.uid() = user_id);
   ```

4. **course_progress**
   ```sql
   -- Users can read their own progress
   create policy "Users can read own progress"
     on course_progress for select
     using (
       exists (
         select 1 from enrollments
         where enrollments.id = course_progress.enrollment_id
         and enrollments.user_id = auth.uid()
       )
     );

   -- Users can update their own progress
   create policy "Users can update own progress"
     on course_progress for update
     using (
       exists (
         select 1 from enrollments
         where enrollments.id = course_progress.enrollment_id
         and enrollments.user_id = auth.uid()
       )
     );
   ```

5. **user_preferences**
   ```sql
   -- Users can read their own preferences
   create policy "Users can read own preferences"
     on user_preferences for select
     using (auth.uid() = user_id);

   -- Users can update their own preferences
   create policy "Users can update own preferences"
     on user_preferences for update
     using (auth.uid() = user_id);
   ```

## Next Steps

1. Reorganize files according to the structure above
2. Set up Supabase project and implement the database schema
3. Implement authentication system
4. Create API service layer for Supabase integration
5. Update frontend components to use Supabase data 