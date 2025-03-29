# CourseWise Development Tasks

## Completed Tasks ✅

### Frontend
- [x] Basic UI Components
  - Login page with Google OAuth
  - User Registration page
  - Course Questionnaire page
  - Recommendation Choice page
- [x] Basic routing setup
- [x] Initial project structure
- [x] Course Features Integration
  - [x] Course Recommendations
  - [x] Course Reviews
  - [x] Timetable Maker
  - [x] Academic Tools Integration

### Backend (Migrated to Supabase)
- [x] Basic API structure
- [x] Authentication endpoints
- [x] Course management endpoints

### Supabase Setup
- [x] Create Supabase project
- [x] Get project URL and anon key
- [x] Update environment variables
- [x] Test Supabase connection

### Database Schema
- [x] Create users table with all required fields
  - Core user fields (id, email, full_name, phone_number)
  - Academic details (institution, branch, semester)
  - Profile details (profile_picture_url, bio)
  - Additional preferences (career_goal, preparation_type, etc.)
  - Security (email_verified)
  - Timestamps and RLS policies
- [x] Create streams table
  - Stream information and descriptions
- [x] Create courses table
  - Course details (id, code, name, credits)
  - Stream relationships
  - Semester information
  - Descriptions and metadata
- [x] Create course_prerequisites table
  - Flexible prerequisite relationships
  - Handles courses with no prerequisites
- [x] Create course_schedules table
  - Day and time slot management
  - Multiple schedules per course
- [x] Create selected_courses table
  - User-course relationships
  - Unique constraints
- [x] Set up all necessary indexes and RLS policies
- [x] Test table creation and relationships

## Pending Tasks 📝

### 1. Authentication
- [x] Implement Supabase Auth
  - [x] Email/Password login
  - [x] Google OAuth integration
  - [x] Session management
  - [x] Email verification flow
  - [x] User profile creation and management
- [x] Update frontend auth service
- [x] Protected routes implementation
- [x] Test Google authentication flow
  - [x] Sign-up flow
  - [x] Sign-in flow
  - [x] Profile completion
  - [x] Session handling
  - [x] Error handling

### 2. Course Management
- [x] Implement course services
  - [x] Get all courses
  - [x] Get courses by stream
  - [x] Get courses by semester
  - [x] Get selected courses
  - [x] Select/deselect courses
  - [x] Handle prerequisites
- [x] Update frontend course components
- [x] Test course functionality

### 3. Frontend Integration
- [x] Update API calls to use Supabase client
- [x] Add loading states
- [x] Implement error handling
- [x] Add course filtering and search
- [x] Implement course selection validation
- [x] Add prerequisite checks
- [x] Test all features

### 4. Testing & Documentation
- [ ] Write API documentation
- [ ] Create user guide
- [ ] Add code comments
- [x] Test all features
  - [x] Authentication flows
  - [x] Course selection
  - [x] Prerequisite validation
  - [x] Schedule conflicts
  - [x] Error handling

### 5. Course System Integration
- [ ] Database Schema Updates
  - [ ] Add missing fields to courses table
    - [ ] instructor
    - [ ] duration
    - [ ] difficulty
    - [ ] tags
    - [ ] enrollment_status
    - [ ] anti_requisites
  - [ ] Create course_tags table
  - [ ] Create course_anti_requisites table
  - [ ] Add proper foreign key constraints
  - [ ] Add necessary indexes
  - [ ] Update RLS policies

- [ ] Frontend Data Integration
  - [ ] Remove mock data from courseData.ts
  - [ ] Update course interfaces to match database schema
  - [ ] Implement proper data fetching from Supabase
  - [ ] Add error handling for database operations
  - [ ] Implement real-time updates for course selections
  - [ ] Add loading states and error states

- [ ] Course Selection Logic
  - [ ] Implement prerequisite validation
  - [ ] Add anti-requisite checks
  - [ ] Add schedule conflict detection
  - [ ] Implement proper course filtering
  - [ ] Add proper error handling
  - [ ] Add validation feedback to users

- [ ] User Dashboard Integration
  - [ ] Update selected courses display
  - [ ] Implement course removal
  - [ ] Add course status indicators
  - [ ] Show prerequisite status
  - [ ] Add course details view
  - [ ] Implement course search and filtering

### 6. Testing & Validation
- [ ] Database Integration Tests
  - [ ] Test course data retrieval
  - [ ] Test course selection
  - [ ] Test prerequisite validation
  - [ ] Test anti-requisite validation
  - [ ] Test schedule conflict detection
  - [ ] Test error handling

- [ ] Frontend Integration Tests
  - [ ] Test course listing
  - [ ] Test course filtering
  - [ ] Test course selection
  - [ ] Test course removal
  - [ ] Test error states
  - [ ] Test loading states

- [ ] End-to-End Tests
  - [ ] Test complete course selection flow
  - [ ] Test prerequisite validation flow
  - [ ] Test schedule conflict detection
  - [ ] Test error handling scenarios
  - [ ] Test real-time updates

## Notes
- Database schema needs to be updated to support all course features
- Mock data needs to be replaced with real database integration
- Course selection logic needs to be implemented with proper validation
- User dashboard needs to be updated to show real-time data
- All features need proper error handling and loading states

## Next Steps
1. Update database schema
2. Remove mock data
3. Implement proper data fetching
4. Add course selection logic
5. Update user dashboard
6. Add comprehensive testing

## Progress Tracking
- Current Phase: Course System Integration
- Previous Phase: Authentication and Basic Features ✅
- Status: In Progress 🔄 