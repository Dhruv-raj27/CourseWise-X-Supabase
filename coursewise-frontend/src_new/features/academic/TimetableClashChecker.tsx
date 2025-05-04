import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, 
  Heading, 
  Text, 
  Grid, 
  Input, 
  Select, 
  Button, 
  Flex, 
  Badge, 
  Spinner,
  useToast,
  IconButton,
  Tooltip,
  Tag,
  SimpleGrid,
  Divider,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { 
  Search, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Filter,
  Book,
  X,
  Clock8,
  BookmarkCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/contexts/AuthContext';
import NavBar from '../shared/NavBar';

// Type definitions
interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  description: string;
  instructor: string;
  department: string;
  prerequisites: string[];
  anti_requisites: string[];
  schedule: Schedule[];
  stream: {
    id: string;
    name: string;
  };
  isSelected?: boolean;
}

interface Schedule {
  day: string;
  start_time: string;
  end_time: string;
  room?: string;
  type?: string;
}

interface FilterOptions {
  search: string;
  semester: string;
  department: string;
  credits: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ClashResult {
  courseId: string;
  hasClash: boolean;
  clashingWith: string[]; // Course IDs that clash
}

// Helper function to convert time string to minutes for comparison
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Function to detect clashes between courses
const detectClashes = (courses: Course[]): ClashResult[] => {
  const results: ClashResult[] = [];
  
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const clashingWith: string[] = [];
    
    // Skip courses with no schedule
    if (!course.schedule || course.schedule.length === 0) {
      results.push({
        courseId: course.id,
        hasClash: false,
        clashingWith: []
      });
      continue;
    }
    
    // Check against all other courses
    for (let j = 0; j < courses.length; j++) {
      if (i === j) continue; // Skip comparing with itself
      
      const otherCourse = courses[j];
      
      // Skip courses with no schedule
      if (!otherCourse.schedule || otherCourse.schedule.length === 0) {
        continue;
      }
      
      // Compare all schedule slots
      for (const slot1 of course.schedule) {
        for (const slot2 of otherCourse.schedule) {
          // Check if same day and time overlap
          if (slot1.day === slot2.day) {
            const slot1Start = timeToMinutes(slot1.start_time);
            const slot1End = timeToMinutes(slot1.end_time);
            const slot2Start = timeToMinutes(slot2.start_time);
            const slot2End = timeToMinutes(slot2.end_time);
            
            // Check for overlap - standard interval overlap check
            if (slot1Start < slot2End && slot1End > slot2Start) {
              if (!clashingWith.includes(otherCourse.id)) {
                clashingWith.push(otherCourse.id);
              }
            }
          }
        }
      }
    }
    
    results.push({
      courseId: course.id,
      hasClash: clashingWith.length > 0,
      clashingWith
    });
  }
  
  return results;
};

// Add an array of colors for courses
const COURSE_COLORS = [
  "blue.400", "green.400", "purple.400", "pink.400", "orange.400", 
  "teal.400", "cyan.400", "yellow.400", "red.400", "indigo.400"
];

const TimetableClashChecker: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [clashResults, setClashResults] = useState<ClashResult[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseColors, setCourseColors] = useState<{[courseId: string]: string}>({});
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    semester: '',
    department: '',
    credits: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [viewMode, setViewMode] = useState<'list' | 'streams' | 'semesters'>('streams');
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isTimetableOpen, onOpen: onTimetableOpen, onClose: onTimetableClose } = useDisclosure();
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { session } = useAuth();

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Update filtered courses whenever courses or filters change
  useEffect(() => {
    filterCourses();
  }, [courses, filters]);

  // Update clash results whenever selected courses change
  useEffect(() => {
    if (selectedCourses.length > 0) {
      const results = detectClashes(selectedCourses);
      setClashResults(results);
    } else {
      setClashResults([]);
    }
  }, [selectedCourses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch courses with stream data
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          stream:stream_id (
            id, 
            name
          )
        `)
        .eq('status', 'active')
        .order('name');
        
      if (coursesError) throw coursesError;
      
      setCourses(coursesData || []);
      
      // Extract unique departments for filter
      const depts = [...new Set(coursesData?.map(c => c.department).filter(Boolean) || [])];
      setDepartments(depts);
      
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error fetching courses',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filterCourses = () => {
    let filtered = [...courses];
    
    // Apply text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchLower) || 
        course.code.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply semester filter
    if (filters.semester) {
      filtered = filtered.filter(course => course.semester === parseInt(filters.semester));
    }
    
    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(course => course.department === filters.department);
    }
    
    // Apply credits filter
    if (filters.credits) {
      filtered = filtered.filter(course => course.credits === parseInt(filters.credits));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const fieldA = a[filters.sortBy as keyof Course];
      const fieldB = b[filters.sortBy as keyof Course];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return filters.sortOrder === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return filters.sortOrder === 'asc' 
          ? fieldA - fieldB
          : fieldB - fieldA;
      }
      
      return 0;
    });
    
    setFilteredCourses(filtered);
  };
  
  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleSort = (field: string) => {
    if (filters.sortBy === field) {
      setFilters(prev => ({
        ...prev,
        sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        sortBy: field,
        sortOrder: 'asc'
      }));
    }
  };
  
  const selectCourse = (course: Course) => {
    // Check if course is already selected
    const isAlreadySelected = selectedCourses.some(c => c.id === course.id);
    
    if (isAlreadySelected) {
      // Remove from selected courses
      setSelectedCourses(prev => prev.filter(c => c.id !== course.id));
      
      // Remove the color assignment
      setCourseColors(prev => {
        const updated = {...prev};
        delete updated[course.id];
        return updated;
      });
      
      toast({
        title: 'Course removed',
        description: `${course.code} has been removed from your selection`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    } else {
      // Check if adding this course would create a clash
      const tempSelected = [...selectedCourses, course];
      const tempResults = detectClashes(tempSelected);
      
      // Find if this course would clash with any existing course
      const courseResult = tempResults.find(r => r.courseId === course.id);
      const wouldClash = courseResult?.hasClash || false;
      
      if (wouldClash) {
        // Don't add the course, show warning toast instead
        const clashingCourses = courseResult?.clashingWith.map(id => {
          const c = selectedCourses.find(sc => sc.id === id);
          return c?.code;
        }).filter(Boolean).join(', ');
        
        toast({
          title: 'Schedule Conflict Detected',
          description: `${course.code} clashes with ${clashingCourses}. Please select a different course.`,
          status: 'warning',
          duration: 4000,
          isClosable: true,
        });
      } else {
        // Add to selected courses - keep existing courses
        setSelectedCourses(prev => [...prev, course]);
        
        // Assign a color to this course
        setCourseColors(prev => {
          const nextColorIndex = Object.keys(prev).length % COURSE_COLORS.length;
          return {
            ...prev,
            [course.id]: COURSE_COLORS[nextColorIndex]
          };
        });
        
        toast({
          title: 'Course selected',
          description: `${course.code} has been added to your selection`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };
  
  const viewCourseDetails = (course: Course) => {
    setSelectedCourseDetails(course);
    onDetailsOpen();
  };
  
  const getCourseById = (courseId: string): Course | undefined => {
    return selectedCourses.find(course => course.id === courseId);
  };
  
  const getClashResultForCourse = (courseId: string): ClashResult | undefined => {
    return clashResults.find(result => result.courseId === courseId);
  };
  
  const hasAnyClashes = useMemo(() => {
    return clashResults.some(result => result.hasClash);
  }, [clashResults]);
  
  // Group courses by stream
  const coursesByStream = useMemo(() => {
    const grouped: { [key: string]: Course[] } = {};
    
    filteredCourses.forEach(course => {
      const streamName = course.stream?.name || 'Uncategorized';
      if (!grouped[streamName]) {
        grouped[streamName] = [];
      }
      grouped[streamName].push(course);
    });
    
    return grouped;
  }, [filteredCourses]);
  
  // Group courses by semester
  const coursesBySemester = useMemo(() => {
    const grouped: { [key: number]: Course[] } = {};
    
    filteredCourses.forEach(course => {
      const semester = course.semester;
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(course);
    });
    
    return Object.entries(grouped)
      .sort(([semA], [semB]) => parseInt(semA) - parseInt(semB))
      .map(([semester, courses]) => ({
        semester: parseInt(semester),
        courses
      }));
  }, [filteredCourses]);
  
  // Generate timetable data structure for the weekly view
  const weeklyTimetable = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [];
    
    // Generate time slots from 8AM to 8PM
    for (let hour = 8; hour <= 20; hour++) {
      timeSlots.push(`${hour}:00`);
      if (hour < 20) timeSlots.push(`${hour}:30`);
    }
    
    // Create the grid
    const grid: { [day: string]: { [time: string]: Course[] } } = {};
    
    // Initialize empty grid
    days.forEach(day => {
      grid[day] = {};
      timeSlots.forEach(time => {
        grid[day][time] = [];
      });
    });
    
    // Fill in the courses
    selectedCourses.forEach(course => {
      if (!course.schedule) return;
      
      course.schedule.forEach(slot => {
        const day = slot.day;
        if (!days.includes(day)) return;
        
        // Get all 30-minute blocks that this course spans
        const startMinutes = timeToMinutes(slot.start_time);
        const endMinutes = timeToMinutes(slot.end_time);
        
        for (let time of timeSlots) {
          const [hour, minute] = time.split(':').map(Number);
          const timeInMinutes = hour * 60 + minute;
          
          // Check if this time slot is within the course's schedule
          if (timeInMinutes >= startMinutes && timeInMinutes < endMinutes) {
            grid[day][time].push(course);
          }
        }
      });
    });
    
    return { days, timeSlots, grid };
  }, [selectedCourses]);

  // Course card component
  const CourseCard = ({ course }: { course: Course }) => {
    const isSelected = selectedCourses.some(c => c.id === course.id);
    const clashResult = isSelected ? getClashResultForCourse(course.id) : undefined;
    const hasClash = clashResult?.hasClash || false;
    const courseColor = isSelected ? (hasClash ? 'red' : courseColors[course.id]?.split('.')[0] || "green") : null;
    
    return (
      <Box
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 relative"
        borderColor={isSelected ? (hasClash ? 'red.300' : courseColors[course.id] || "green.300") : 'gray.100'}
        borderLeftWidth={isSelected ? "4px" : "1px"}
        borderWidth={isSelected ? '2px' : '1px'}
        transition="all 0.2s"
        _hover={{ 
          transform: "translateY(-2px)",
          boxShadow: "md" 
        }}
      >
        {/* Color strip at the top based on semester or selection status */}
        <Box 
          h="6px" 
          w="100%" 
          bg={isSelected 
            ? (hasClash ? "red.400" : courseColors[course.id] || "green.400")
            : `linear-gradient(to right, 
              ${course.semester <= 2 ? 'var(--chakra-colors-green-400), var(--chakra-colors-green-500)' :
                course.semester <= 4 ? 'var(--chakra-colors-blue-400), var(--chakra-colors-blue-500)' :
                course.semester <= 6 ? 'var(--chakra-colors-purple-400), var(--chakra-colors-purple-500)' :
                'var(--chakra-colors-red-400), var(--chakra-colors-red-500)'
              })`
          }
        />
        
        <Box p={5}>
          <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box>
              <Badge 
                colorScheme={
                  isSelected 
                    ? (hasClash ? "red" : courseColor || "green")
                    : (course.semester <= 2 ? 'green' :
                      course.semester <= 4 ? 'blue' :
                      course.semester <= 6 ? 'purple' :
                      'red')
                }
                rounded="full"
                px={2}
                py={0.5}
                fontSize="xs"
              >
                Semester {course.semester}
              </Badge>
              <Badge 
                ml={2}
                colorScheme={isSelected ? (hasClash ? "red" : courseColor || "green") : "gray"}
                variant="subtle"
                rounded="full"
                px={2}
                py={0.5}
                fontSize="xs"
              >
                {course.credits} credit{course.credits !== 1 ? 's' : ''}
              </Badge>
            </Box>
            
            <IconButton
              aria-label={isSelected ? "Remove from selection" : "Add to selection"}
              icon={isSelected ? (
                hasClash ? <AlertCircle size={18} /> : <CheckCircle size={18} />
              ) : <Calendar size={18} />}
              size="sm"
              colorScheme={isSelected ? (hasClash ? "red" : courseColor || "green") : "gray"}
              variant={isSelected ? "solid" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                selectCourse(course);
              }}
            />
          </Flex>
          
          <Heading 
            size="md" 
            mb={1} 
            noOfLines={1} 
            title={course.name}
            color={isSelected ? (hasClash ? "red.700" : `${courseColor}.700` || "green.700") : "gray.800"}
            className={!isSelected ? "text-gray-800" : ""}
          >
            {course.name}
          </Heading>
          
          <Text 
            fontSize="sm" 
            color={isSelected ? (hasClash ? "red.500" : `${courseColor}.500` || "green.500") : "gray.500"}
            fontFamily="mono" 
            mb={4}
          >
            {course.code}
          </Text>
          
          <Text 
            fontSize="sm" 
            color="gray.600" 
            noOfLines={2} 
            mb={4}
            title={course.description || "No description available"}
          >
            {course.description || "No description available"}
          </Text>
          
          <HStack spacing={4} mb={4}>
            {course.instructor && (
              <Flex align="center" gap={1.5}>
                <Clock size={14} className={isSelected ? 
                  (hasClash ? "text-red-400" : `text-${courseColor}-400` || "text-green-400") : 
                  "text-gray-400"} 
                />
                <Text fontSize="xs" color="gray.600">
                  {course.schedule && course.schedule.length > 0 
                    ? `${course.schedule.length} schedule slot${course.schedule.length !== 1 ? 's' : ''}`
                    : 'No schedule'}
                </Text>
              </Flex>
            )}
            
            {course.stream?.name && (
              <Flex align="center" gap={1.5}>
                <Book size={14} className={isSelected ? 
                  (hasClash ? "text-red-400" : `text-${courseColor}-400` || "text-green-400") : 
                  "text-gray-400"} 
                />
                <Text fontSize="xs" color="gray.600">
                  {course.stream.name}
                </Text>
              </Flex>
            )}
          </HStack>
          
          {isSelected && hasClash && (
            <Alert status="error" variant="left-accent" mb={4} py={2} fontSize="xs">
              <AlertIcon boxSize={4} />
              <AlertTitle fontSize="xs" mr={1}>Timetable clash detected!</AlertTitle>
            </Alert>
          )}
          
          <Divider mb={4} />
          
          <Button
            size="sm"
            width="full"
            colorScheme={isSelected ? (hasClash ? "red" : courseColor || "purple") : "purple"}
            variant="outline"
            onClick={() => viewCourseDetails(course)}
          >
            View Details
          </Button>
        </Box>
      </Box>
    );
  };
  
  return (
    <>
      <NavBar />
      <Box className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-16">
        <Box maxW="1200px" margin="0 auto" p={[4, 6, 8]}>
          <Flex direction="column" gap={6}>
            {/* Header section */}
            <Box className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
              <Flex direction={['column', 'row']} alignItems="center" gap={4} position="relative">
                <Box className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                  <Calendar size={40} />
                </Box>
                <Box>
                  <Heading size="xl">Timetable Clash Checker</Heading>
                  <Text fontSize="lg" mt={2} opacity={0.9}>
                    Select multiple courses to check for scheduling conflicts
                  </Text>
                </Box>
                <Button
                  position={['static', 'absolute']}
                  right={4}
                  top={4}
                  leftIcon={<Box as="span" className="rotate-180 inline-block"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></Box>}
                  colorScheme="whiteAlpha"
                  variant="outline"
                  onClick={() => navigate('/academic-tools')}
                  size="sm"
                  mt={[4, 0]}
                  ml={["auto", 0]}
                >
                  Back to Tools
                </Button>
              </Flex>
            </Box>

            {/* Selected courses and clash detection results */}
            {selectedCourses.length > 0 && (
              <Box className="bg-white rounded-xl shadow-lg p-6">
                <Heading size="md" mb={4}>Selected Courses</Heading>
                
                {hasAnyClashes ? (
                  <Alert status="error" mb={4}>
                    <AlertIcon />
                    <AlertTitle>Schedule conflicts detected!</AlertTitle>
                    <AlertDescription>
                      Some of your selected courses have time clashes. Check the details below.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert status="success" mb={4}>
                    <AlertIcon />
                    <AlertTitle>No conflicts detected!</AlertTitle>
                    <AlertDescription>
                      Your selected courses don't have any schedule conflicts.
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Selected courses list with clash information */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                  {selectedCourses.map(course => {
                    const clashResult = getClashResultForCourse(course.id);
                    const hasClash = clashResult?.hasClash || false;
                    
                    return (
                      <Box 
                        key={course.id} 
                        p={4} 
                        borderWidth="1px" 
                        borderColor={hasClash ? "red.300" : `${courseColors[course.id]}` || "green.300"}
                        bg={hasClash ? "red.50" : `${courseColors[course.id]}10` || "green.50"}
                        borderLeft={`4px solid ${hasClash ? "red.400" : courseColors[course.id] || "green.400"}`}
                        rounded="md"
                        position="relative"
                        transition="all 0.2s"
                        _hover={{
                          boxShadow: "md",
                          bg: hasClash ? "red.100" : `${courseColors[course.id]}15` || "green.100",
                        }}
                      >
                        <Flex justify="space-between" align="flex-start">
                          <Box>
                            <Heading size="sm" mb={1}>{course.code}: {course.name}</Heading>
                            
                            {course.schedule && course.schedule.length > 0 ? (
                              <VStack align="start" spacing={1} mt={2}>
                                {course.schedule.map((slot, index) => (
                                  <Text key={index} fontSize="xs">
                                    {slot.day}, {slot.start_time} - {slot.end_time}
                                  </Text>
                                ))}
                              </VStack>
                            ) : (
                              <Text fontSize="xs" color="gray.500">No schedule information available</Text>
                            )}
                            
                            {hasClash && (
                              <Box mt={3}>
                                <Text fontSize="sm" color="red.600" fontWeight="bold">
                                  Clashes with:
                                </Text>
                                <VStack align="start" spacing={1} mt={1}>
                                  {clashResult?.clashingWith.map(clashId => {
                                    const clashCourse = getCourseById(clashId);
                                    return clashCourse ? (
                                      <Text key={clashId} fontSize="xs">
                                        {clashCourse.code}: {clashCourse.name}
                                      </Text>
                                    ) : null;
                                  })}
                                </VStack>
                              </Box>
                            )}
                          </Box>
                          
                          <IconButton
                            aria-label="Remove course"
                            icon={<X size={14} />}
                            size="sm"
                            colorScheme="gray"
                            variant="ghost"
                            onClick={() => selectCourse(course)}
                          />
                        </Flex>
                      </Box>
                    );
                  })}
                </SimpleGrid>
                
                {/* Weekly timetable visualization */}
                <Box mb={6}>
                  <Flex justifyContent="space-between" alignItems="center" mb={4}>
                    <Heading size="md">Timetable Visualization</Heading>
                    <HStack>
                      <Button 
                        size="sm"
                        leftIcon={<Calendar size={14} />}
                        colorScheme="purple"
                        onClick={onTimetableOpen}
                        variant="outline"
                      >
                        View Full Timetable
                      </Button>
                    </HStack>
                  </Flex>
                  
                  <Box maxHeight="300px" overflowY="auto" overflowX="auto" borderWidth="1px" borderColor="gray.200" borderRadius="md">
                    <Table variant="simple" size="sm">
                      <Thead position="sticky" top={0} bg="white" zIndex={1}>
                        <Tr>
                          <Th>Time Slot</Th>
                          {weeklyTimetable.days.map(day => (
                            <Th key={day}>{day}</Th>
                          ))}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {weeklyTimetable.timeSlots.map(timeSlot => (
                          <Tr key={timeSlot}>
                            <Td fontWeight="medium" fontSize="xs">{timeSlot}</Td>
                            
                            {weeklyTimetable.days.map(day => {
                              const coursesInSlot = weeklyTimetable.grid[day][timeSlot];
                              const hasClash = coursesInSlot.length > 1;
                              
                              return (
                                <Td 
                                  key={`${day}-${timeSlot}`}
                                  bg={hasClash ? "red.50" : undefined}
                                  padding="2px"
                                  position="relative"
                                  borderBottom={hasClash ? "2px solid red" : undefined}
                                >
                                  {coursesInSlot.map((course, index) => (
                                    <Box 
                                      key={`${day}-${timeSlot}-${course.id}`}
                                      bg={hasClash ? "red.100" : `${courseColors[course.id]}15` || "green.50"}
                                      color={hasClash ? "red.700" : `${courseColors[course.id]}` || "green.600"}
                                      borderLeft={`3px solid ${hasClash ? "red.400" : courseColors[course.id] || "green.400"}`}
                                      px={2}
                                      py={0.5}
                                      my={0.5}
                                      borderRadius="sm"
                                      fontSize="xs" 
                                      fontWeight="semibold"
                                      boxShadow="xs"
                                      whiteSpace="nowrap"
                                      transition="all 0.2s"
                                      _hover={{
                                        bg: hasClash ? "red.200" : `${courseColors[course.id]}25` || "green.100",
                                      }}
                                    >
                                      {course.code}
                                    </Box>
                                  ))}
                                </Td>
                              );
                            })}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                  
                  {/* Add color legend */}
                  {selectedCourses.length > 0 && (
                    <Flex mt={3} flexWrap="wrap" gap={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600" mr={2}>Color Legend:</Text>
                      {selectedCourses.map(course => (
                        <Box 
                          key={`legend-${course.id}`} 
                          display="inline-flex" 
                          alignItems="center" 
                          bg={`${courseColors[course.id]}10` || "green.50"} 
                          color={`${courseColors[course.id]}` || "green.600"}
                          borderLeft={`3px solid ${courseColors[course.id] || "green.400"}`}
                          px={2}
                          py={0.5}
                          borderRadius="sm"
                          fontSize="xs"
                          fontWeight="medium"
                        >
                          {course.code}
                        </Box>
                      ))}
                      <Box 
                        display="inline-flex" 
                        alignItems="center" 
                        bg="red.100" 
                        color="red.700"
                        borderLeft="3px solid red.400"
                        px={2}
                        py={0.5}
                        borderRadius="sm"
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        Clash
                      </Box>
                    </Flex>
                  )}
                </Box>
              </Box>
            )}

            {/* Filters and search */}
            <Box className="bg-white rounded-xl shadow-lg p-6">
              <Flex direction={['column', 'row']} gap={4} mb={6} wrap="wrap">
                <Flex flex={1} position="relative">
                  <Input
                    placeholder="Search courses..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    pl={10}
                    bg="gray.50"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
                    <Search size={18} opacity={0.5} />
                  </Box>
                </Flex>
                
                <Select
                  placeholder="Semester"
                  value={filters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                  maxW={['100%', '150px']}
                  bg="gray.50"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </Select>
                
                <Select
                  placeholder="Department"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  maxW={['100%', '180px']}
                  bg="gray.50"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
                
                <Button 
                  leftIcon={<Filter size={16} />}
                  onClick={() => setFilters({
                    search: '',
                    semester: '',
                    department: '',
                    credits: '',
                    sortBy: 'name',
                    sortOrder: 'asc'
                  })}
                  variant="outline"
                  colorScheme="purple"
                  size="md"
                >
                  Reset Filters
                </Button>
              </Flex>
              
              {/* View mode selection */}
              <Flex gap={2} mb={4}>
                <Button
                  size="sm"
                  colorScheme={viewMode === 'streams' ? 'purple' : 'gray'}
                  variant={viewMode === 'streams' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('streams')}
                >
                  View by Stream
                </Button>
                <Button
                  size="sm"
                  colorScheme={viewMode === 'semesters' ? 'purple' : 'gray'}
                  variant={viewMode === 'semesters' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('semesters')}
                >
                  View by Semester
                </Button>
                <Button
                  size="sm"
                  colorScheme={viewMode === 'list' ? 'purple' : 'gray'}
                  variant={viewMode === 'list' ? 'solid' : 'outline'}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </Button>
              </Flex>
              
              {/* Loading state */}
              {loading ? (
                <Flex justifyContent="center" py={10}>
                  <Spinner size="xl" color="purple.500" />
                </Flex>
              ) : filteredCourses.length > 0 ? (
                <Box>
                  {viewMode === 'list' && (
                    <Grid 
                      templateColumns={{ 
                        base: "repeat(1, 1fr)", 
                        md: "repeat(2, 1fr)", 
                        lg: "repeat(3, 1fr)" 
                      }} 
                      gap={6}
                    >
                      {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </Grid>
                  )}
                  
                  {viewMode === 'streams' && (
                    <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
                      <TabList overflowX="auto" py={2} className="flex-nowrap whitespace-nowrap">
                        {Object.keys(coursesByStream).map((streamName) => (
                          <Tab key={streamName} px={4}>
                            {streamName} ({coursesByStream[streamName].length})
                          </Tab>
                        ))}
                      </TabList>
                      <TabPanels>
                        {Object.entries(coursesByStream).map(([streamName, courses]) => (
                          <TabPanel key={streamName} px={0}>
                            <Grid 
                              templateColumns={{ 
                                base: "repeat(1, 1fr)", 
                                md: "repeat(2, 1fr)", 
                                lg: "repeat(3, 1fr)" 
                              }} 
                              gap={6}
                            >
                              {courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                              ))}
                            </Grid>
                          </TabPanel>
                        ))}
                      </TabPanels>
                    </Tabs>
                  )}
                  
                  {viewMode === 'semesters' && (
                    <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
                      <TabList overflowX="auto" py={2} className="flex-nowrap whitespace-nowrap">
                        {coursesBySemester.map(({semester, courses}) => (
                          <Tab key={semester} px={4}>
                            Semester {semester} ({courses.length})
                          </Tab>
                        ))}
                      </TabList>
                      <TabPanels>
                        {coursesBySemester.map(({semester, courses}) => (
                          <TabPanel key={semester} px={0}>
                            <Grid 
                              templateColumns={{ 
                                base: "repeat(1, 1fr)", 
                                md: "repeat(2, 1fr)", 
                                lg: "repeat(3, 1fr)" 
                              }}
                              gap={6}
                            >
                              {courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                              ))}
                            </Grid>
                          </TabPanel>
                        ))}
                      </TabPanels>
                    </Tabs>
                  )}
                </Box>
              ) : (
                <Flex 
                  direction="column" 
                  align="center" 
                  justify="center" 
                  bg="white" 
                  rounded="xl" 
                  shadow="md" 
                  p={8} 
                  mt={4}
                >
                  <Box 
                    p={4} 
                    bg="purple.50" 
                    rounded="full" 
                    mb={4}
                  >
                    <Search size={40} className="text-purple-400" />
                  </Box>
                  <Heading size="md" mb={2} color="gray.700">No courses found</Heading>
                  <Text color="gray.500" textAlign="center">
                    Try adjusting your search filters to find more courses
                  </Text>
                </Flex>
              )}
            </Box>
          </Flex>
        </Box>
      </Box>
      
      {/* Course details modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded="xl" overflow="hidden">
          {selectedCourseDetails && (
            <>
              <Box 
                h="8px" 
                w="100%" 
                className={`bg-gradient-to-r ${
                  selectedCourseDetails.semester <= 2 ? 'from-green-400 to-green-500' :
                  selectedCourseDetails.semester <= 4 ? 'from-blue-400 to-blue-500' :
                  selectedCourseDetails.semester <= 6 ? 'from-purple-400 to-purple-500' :
                  'from-red-400 to-red-500'
                }`}
              />
              
              <ModalHeader pb={2}>
                <Flex justify="space-between" align="center" w="full">
                  <Text fontSize="2xl" fontWeight="bold" className="text-gray-800">
                    {selectedCourseDetails.name}
                  </Text>
                  <ModalCloseButton position="static" />
                </Flex>
                <Text fontSize="md" color="gray.500" fontFamily="mono">
                  {selectedCourseDetails.code}
                </Text>
              </ModalHeader>
              
              <Divider />
              
              <ModalBody pt={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Department</Text>
                    <Text>{selectedCourseDetails.department || 'Not specified'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Stream</Text>
                    <Text>{selectedCourseDetails.stream?.name || 'Not specified'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Semester</Text>
                    <Text>Semester {selectedCourseDetails.semester}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Credits</Text>
                    <Text>{selectedCourseDetails.credits} credit{selectedCourseDetails.credits !== 1 ? 's' : ''}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Instructor</Text>
                    <Text>{selectedCourseDetails.instructor || 'Not specified'}</Text>
                  </Box>
                </SimpleGrid>
                
                <Box mb={6}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>Description</Text>
                  <Text fontSize="md" whiteSpace="pre-wrap">
                    {selectedCourseDetails.description || 'No description available for this course.'}
                  </Text>
                </Box>
                
                {selectedCourseDetails.prerequisites && selectedCourseDetails.prerequisites.length > 0 && (
                  <Box mb={6}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={2}>Prerequisites</Text>
                    <Flex gap={2} flexWrap="wrap">
                      {selectedCourseDetails.prerequisites.map(prereq => (
                        <Tag key={prereq} size="md" colorScheme="blue" variant="subtle">
                          {prereq}
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}
                
                {selectedCourseDetails.schedule && selectedCourseDetails.schedule.length > 0 && (
                  <Box mb={6}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={2}>Schedule</Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedCourseDetails.schedule.map((slot, index) => (
                        <Flex 
                          key={index}
                          bg="gray.50" 
                          p={3} 
                          rounded="md" 
                          align="center"
                          justifyContent="space-between"
                        >
                          <HStack spacing={4}>
                            <Tag size="sm" colorScheme="purple" variant="subtle" width="90px" justifyContent="center">
                              {slot.day}
                            </Tag>
                            <Flex alignItems="center" gap={1}>
                              <Clock size={14} className="text-gray-400" />
                              <Text fontSize="sm">
                                {slot.start_time} - {slot.end_time}
                              </Text>
                            </Flex>
                          </HStack>
                          {slot.room && (
                            <Text fontSize="xs" color="gray.500">
                              Room: {slot.room}
                            </Text>
                          )}
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}
              </ModalBody>
              
              <ModalFooter borderTop="1px" borderColor="gray.100" pt={4}>
                <Button 
                  colorScheme="gray" 
                  mr={3} 
                  onClick={onDetailsClose}
                >
                  Close
                </Button>
                <Button
                  colorScheme="purple"
                  leftIcon={
                    selectedCourses.some(c => c.id === selectedCourseDetails.id) 
                      ? <BookmarkCheck size={18} /> 
                      : <Calendar size={18} />
                  }
                  onClick={() => selectCourse(selectedCourseDetails)}
                >
                  {selectedCourses.some(c => c.id === selectedCourseDetails.id) 
                    ? "Remove from Selection" 
                    : "Add to Selection"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Full timetable visualization modal */}
      <Modal isOpen={isTimetableOpen} onClose={onTimetableClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded="xl">
          <ModalHeader>Weekly Timetable View</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Time Slot</Th>
                    {weeklyTimetable.days.map(day => (
                      <Th key={day}>{day}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {weeklyTimetable.timeSlots.map(timeSlot => (
                    <Tr key={timeSlot}>
                      <Td fontWeight="medium" fontSize="sm">{timeSlot}</Td>
                      
                      {weeklyTimetable.days.map(day => {
                        const coursesInSlot = weeklyTimetable.grid[day][timeSlot];
                        const hasClash = coursesInSlot.length > 1;
                        
                        return (
                          <Td 
                            key={`${day}-${timeSlot}`}
                            bg={hasClash ? "red.50" : undefined}
                            padding="4px"
                            position="relative"
                            borderBottom={hasClash ? "2px solid red" : undefined}
                          >
                            {coursesInSlot.map((course, index) => (
                              <Box 
                                key={`${day}-${timeSlot}-${course.id}`}
                                bg={hasClash ? "red.100" : `${courseColors[course.id]}15` || "green.50"}
                                color={hasClash ? "red.700" : `${courseColors[course.id]}` || "green.600"}
                                borderLeft={`3px solid ${hasClash ? "red.400" : courseColors[course.id] || "green.400"}`}
                                px={2}
                                py={1}
                                my={0.5}
                                borderRadius="sm"
                                fontSize="sm"
                                fontWeight="semibold"
                                boxShadow="xs"
                                whiteSpace="nowrap"
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                transition="all 0.2s"
                                _hover={{
                                  bg: hasClash ? "red.200" : `${courseColors[course.id]}25` || "green.100",
                                }}
                              >
                                <span>{course.code}</span>
                                {hasClash && index < coursesInSlot.length - 1 && (
                                  <Box as="span" bg="red.200" color="red.700" fontSize="xs" px={1} ml={1} borderRadius="full">
                                    clash
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Td>
                        );
                      })}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            
            {/* Color legend for modal */}
            {selectedCourses.length > 0 && (
              <Flex mt={4} flexWrap="wrap" gap={2} borderTop="1px solid" borderColor="gray.100" pt={4}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mr={2}>Color Legend:</Text>
                {selectedCourses.map(course => (
                  <Box 
                    key={`legend-modal-${course.id}`} 
                    display="inline-flex" 
                    alignItems="center" 
                    bg={`${courseColors[course.id]}15` || "green.50"} 
                    color={`${courseColors[course.id]}` || "green.600"}
                    borderLeft={`3px solid ${courseColors[course.id] || "green.400"}`}
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {course.code}
                  </Box>
                ))}
                <Box 
                  display="inline-flex" 
                  alignItems="center" 
                  bg="red.100" 
                  color="red.700"
                  borderLeft="3px solid red.400"
                  px={3}
                  py={1}
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  Clash
                </Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={onTimetableClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TimetableClashChecker; 