# User Dashboard Course History Implementation

## Recommended Approach

To implement the course history feature in the user dashboard, I recommend the following systematic approach:

### 1. Add a "Course History" Tab in the Dashboard

Create a dedicated tab in the user dashboard for managing course history:

```jsx
// In the Dashboard component
<Tabs>
  <TabList>
    <Tab>Profile</Tab>
    <Tab>Academic Records</Tab>
    <Tab>Course History</Tab>
    <Tab>Current Courses</Tab>
  </TabList>
  <TabPanels>
    {/* Other panels */}
    <TabPanel>
      <CourseHistoryPanel />
    </TabPanel>
  </TabPanels>
</Tabs>
```

### 2. Create a CourseHistoryPanel Component

This component should allow users to:
- Select a semester
- View available courses by stream/department
- Select courses they've completed
- Add grades for each course
- Save their course history

### 3. Database Table Structure

The existing `user_semester_courses` table is already set up for this purpose:

```sql
CREATE TABLE IF NOT EXISTS user_semester_courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    semester_number INTEGER NOT NULL CHECK (semester_number > 0 AND semester_number <= 8),
    grade TEXT,
    status TEXT CHECK (status IN ('completed', 'dropped')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, course_id, semester_number)
);
```

### 4. UI Implementation

Here's how the CourseHistoryPanel should look:

```jsx
const CourseHistoryPanel = () => {
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [viewMode, setViewMode] = useState('streams');
  
  // Fetch all courses for the semester grouping
  useEffect(() => {
    // Fetch courses from Supabase
  }, []);
  
  // Fetch user's previously recorded courses for the selected semester
  useEffect(() => {
    // Fetch user's course history for the selected semester
  }, [selectedSemester]);
  
  const handleSemesterChange = (sem) => {
    setSelectedSemester(sem);
  };
  
  const handleCourseSelection = (course) => {
    // Toggle course selection
  };
  
  const handleGradeChange = (courseId, grade) => {
    // Update grade for a selected course
  };
  
  const handleSave = async () => {
    // Save the course history to the database
  };
  
  return (
    <Box>
      <Heading size="md" mb={4}>Course History</Heading>
      
      {/* Semester selector */}
      <HStack mb={6}>
        <Text>Select Semester:</Text>
        <ButtonGroup isAttached>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
            <Button
              key={sem}
              colorScheme={selectedSemester === sem ? "teal" : "gray"}
              onClick={() => handleSemesterChange(sem)}
            >
              {sem}
            </Button>
          ))}
        </ButtonGroup>
      </HStack>
      
      {/* View mode selector */}
      <HStack mb={4}>
        <Text>View By:</Text>
        <ButtonGroup>
          <Button
            size="sm"
            colorScheme={viewMode === 'streams' ? "teal" : "gray"}
            onClick={() => setViewMode('streams')}
          >
            Streams
          </Button>
          <Button
            size="sm"
            colorScheme={viewMode === 'departments' ? "teal" : "gray"}
            onClick={() => setViewMode('departments')}
          >
            Departments
          </Button>
        </ButtonGroup>
      </HStack>
      
      {/* Course selection UI (reuse the course grouping logic from CourseEnrollment) */}
      <Accordion allowMultiple defaultIndex={[0]}>
        {/* Group courses by stream or department */}
        {/* For each course, add checkbox and grade selector */}
      </Accordion>
      
      {/* Selected courses summary */}
      {selectedCourses.length > 0 && (
        <Box mt={6}>
          <Heading size="sm" mb={2}>Selected Courses ({selectedCourses.length})</Heading>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th>Credits</Th>
                  <Th>Grade</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Map through selected courses */}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      <Button
        mt={6}
        colorScheme="teal"
        onClick={handleSave}
      >
        Save Course History
      </Button>
    </Box>
  );
};
```

### 5. Integration with Academic Records

- After saving course history, update the user's academic records with GPA calculation
- The system should calculate total credits completed based on course history
- Display earned credits and GPA in the Academic Records panel

### 6. Reuse Course Display Components

- Reuse the course grouping and display logic from the CourseEnrollment component
- This maintains UI consistency and reduces code duplication
- Add selection checkboxes and grade dropdowns to the course cards

### 7. Implementation Steps

1. Create the CourseHistoryPanel component
2. Implement the semester selection UI
3. Reuse the course grouping logic from CourseEnrollment
4. Add selection and grade input UI elements
5. Implement save functionality to update the database
6. Connect to academic records for GPA calculation

This approach provides a consistent, user-friendly way for students to record their course history while maintaining visual coherence with the rest of the application. 