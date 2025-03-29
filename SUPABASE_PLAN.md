# CourseWise Supabase Integration Plan

## Current Database State

### Existing Tables ✅
1. **users**
   - Core user information
   - Academic details
   - Profile information
   - Preferences

2. **streams**
   - Stream information
   - Descriptions

3. **courses**
   - Basic course information
   - Stream relationships
   - Semester details

4. **course_prerequisites**
   - Prerequisite relationships
   - Course dependencies

5. **course_schedules**
   - Schedule information
   - Time slots

6. **selected_courses**
   - User-course relationships
   - Selection tracking

### Recent Schema Updates ✅
1. **New Course Fields**
   - instructor
   - duration
   - difficulty
   - enrollment_status
   - created_at
   - updated_at

2. **New Tables**
   - course_tags
   - course_anti_requisites

3. **New Indexes**
   - idx_courses_stream_semester
   - idx_courses_code
   - idx_course_tags_tag
   - idx_course_anti_requisites_course
   - idx_course_anti_requisites_anti

4. **New Functions**
   - check_schedule_conflicts
   - check_prerequisites
   - check_anti_requisites

## Required Database Updates

### 1. Course Data Population
- [ ] **Maintain Existing Structure**
  - Keep current course data format
  - Preserve existing relationships
  - Maintain data integrity

- [ ] **Add New Fields**
  - Add instructor information
  - Add difficulty levels
  - Add duration information
  - Add enrollment status

- [ ] **Data Migration**
  - Create migration script
  - Update existing records
  - Validate data integrity

### 2. Course Relationships
- [ ] **Prerequisites**
  - Update prerequisite relationships
  - Add validation functions
  - Implement checks

- [ ] **Anti-requisites**
  - Add anti-requisite relationships
  - Implement validation
  - Add conflict detection

- [ ] **Schedule Management**
  - Update schedule validation
  - Add conflict detection
  - Implement time slot management

### 3. Course Metadata
- [ ] **Tags**
  - Add course tags
  - Implement tag filtering
  - Add tag-based search

- [ ] **Course Status**
  - Add enrollment status
  - Implement availability checks
  - Add capacity management

### 4. Performance Optimization
- [ ] **Indexes**
  - Review existing indexes
  - Add missing indexes
  - Optimize query performance

- [ ] **Views**
  - Create course details view
  - Add schedule view
  - Implement filtered views

### 5. Security
- [ ] **RLS Policies**
  - Review existing policies
  - Add missing policies
  - Implement proper access control

- [ ] **Data Validation**
  - Add constraints
  - Implement triggers
  - Add data integrity checks

## SQL Updates Required

### 1. Course Data Updates
```sql
-- Update existing courses with new fields
UPDATE public.courses
SET 
  instructor = 'Default Instructor',
  duration = '12 weeks',
  difficulty = 'intermediate',
  enrollment_status = 'open'
WHERE instructor IS NULL;
```

### 2. Tag Population
```sql
-- Insert common tags
INSERT INTO public.course_tags (course_id, tag)
SELECT c.id, t.tag
FROM public.courses c
CROSS JOIN (VALUES 
  ('Programming'),
  ('Mathematics'),
  ('Science'),
  ('Engineering')
) AS t(tag)
WHERE NOT EXISTS (
  SELECT 1 FROM public.course_tags ct 
  WHERE ct.course_id = c.id AND ct.tag = t.tag
);
```

### 3. Anti-requisite Setup
```sql
-- Add anti-requisite relationships
INSERT INTO public.course_anti_requisites (course_id, anti_requisite_id)
SELECT c1.id, c2.id
FROM public.courses c1
JOIN public.courses c2 ON c1.code = c2.code
WHERE c1.id != c2.id
AND NOT EXISTS (
  SELECT 1 FROM public.course_anti_requisites car
  WHERE car.course_id = c1.id AND car.anti_requisite_id = c2.id
);
```

## Frontend Integration Steps

### 1. Data Fetching
- [ ] Update course interfaces
- [ ] Implement new service functions
- [ ] Add error handling
- [ ] Implement loading states

### 2. Course Selection
- [ ] Add prerequisite validation
- [ ] Implement anti-requisite checks
- [ ] Add schedule conflict detection
- [ ] Update UI feedback

### 3. Course Display
- [ ] Update course cards
- [ ] Add new fields display
- [ ] Implement tag filtering
- [ ] Add status indicators

## Testing Requirements

### 1. Database Tests
- [ ] Test data integrity
- [ ] Validate relationships
- [ ] Check constraints
- [ ] Test performance

### 2. Integration Tests
- [ ] Test course selection
- [ ] Validate prerequisites
- [ ] Check anti-requisites
- [ ] Test schedule conflicts

### 3. Frontend Tests
- [ ] Test data display
- [ ] Validate user interactions
- [ ] Check error handling
- [ ] Test loading states

## Next Steps
1. Execute database updates
2. Update frontend interfaces
3. Implement new features
4. Add tests
5. Deploy changes

## Progress Tracking
- Current Phase: Database Updates
- Next Phase: Frontend Integration
- Status: In Progress 🔄 