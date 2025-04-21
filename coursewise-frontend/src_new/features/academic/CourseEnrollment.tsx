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
  Image,
  IconButton,
  Tooltip,
  Tag,
  SimpleGrid,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  CloseButton,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { 
  Search, 
  BookOpen, 
  Check, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Bookmark, 
  BookmarkCheck,
  GraduationCap,
  Book,
  ArrowUpDown,
  Info
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
  isEnrolled?: boolean;
}

interface Schedule {
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  type: string;
}

interface FilterOptions {
  search: string;
  semester: string;
  department: string;
  credits: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const CourseEnrollment = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<{[key: string]: boolean}>({});
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    semester: '',
    department: '',
    credits: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'streams' | 'semesters'>('streams');
  
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
      
      let coursesWithEnrollment = coursesData || [];
      
      // If logged in, fetch user's enrolled courses
      if (session?.user) {
        const { data: enrolledData, error: enrolledError } = await supabase
          .from('selected_courses')
          .select('course_id')
          .eq('user_id', session.user.id);
          
        if (enrolledError) throw enrolledError;
        
        const enrolledIds = (enrolledData || []).map(item => item.course_id);
        setSelectedCourses(enrolledIds);
        
        // Mark enrolled courses
        coursesWithEnrollment = coursesData.map(course => ({
          ...course,
          isEnrolled: enrolledIds.includes(course.id)
        }));
      }
      
      setCourses(coursesWithEnrollment);
      
      // Extract unique departments for filter
      const depts = [...new Set(coursesWithEnrollment.map(c => c.department).filter(Boolean))];
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
      filtered = filtered.filter(course => 
        course.semester === parseInt(filters.semester)
      );
    }
    
    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(course => 
        course.department === filters.department
      );
    }
    
    // Apply credits filter
    if (filters.credits) {
      filtered = filtered.filter(course => 
        course.credits === parseInt(filters.credits)
      );
    }
    
    // Apply sorting
    const { sortBy, sortOrder } = filters;
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'code') {
        comparison = a.code.localeCompare(b.code);
      } else if (sortBy === 'credits') {
        comparison = a.credits - b.credits;
      } else if (sortBy === 'semester') {
        comparison = a.semester - b.semester;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
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
    setFilters(prev => {
      if (prev.sortBy === field) {
        return {
          ...prev,
          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
        };
      } else {
        return {
          ...prev,
          sortBy: field,
          sortOrder: 'asc'
        };
      }
    });
  };
  
  const handleEnroll = async (courseId: string) => {
    if (!session?.user) {
      toast({
        title: 'Login required',
        description: 'Please login to enroll in courses',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login', { state: { from: '/academic-tools/course-enrollment' } });
      return;
    }
    
    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }));
      
      const isEnrolled = selectedCourses.includes(courseId);
      
      if (isEnrolled) {
        // Unenroll
        const { error } = await supabase
          .from('selected_courses')
          .delete()
          .eq('user_id', session.user.id)
          .eq('course_id', courseId);
          
        if (error) throw error;
        
        setSelectedCourses(prev => prev.filter(id => id !== courseId));
        setCourses(prev => prev.map(course => 
          course.id === courseId 
            ? { ...course, isEnrolled: false } 
            : course
        ));
        
        toast({
          title: 'Course removed',
          description: 'Course has been removed from your selection',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Enroll
        const { error } = await supabase
          .from('selected_courses')
          .insert({
            user_id: session.user.id,
            course_id: courseId
          });
          
        if (error) throw error;
        
        setSelectedCourses(prev => [...prev, courseId]);
        setCourses(prev => prev.map(course => 
          course.id === courseId 
            ? { ...course, isEnrolled: true } 
            : course
        ));
        
        toast({
          title: 'Course enrolled',
          description: 'Course has been added to your selection',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };
  
  const viewCourseDetails = (course: Course) => {
    setSelectedCourse(course);
    onOpen();
  };
  
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  const handleAddToHistory = async (course: Course) => {
    if (!session?.user) {
      toast({
        title: 'Login required',
        description: 'Please login to add courses to your history',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login', { state: { from: '/academic-tools/course-enrollment' } });
      return;
    }
    
    try {
      // Check if the course is already in user's history
      const { data: existingData, error: existingError } = await supabase
        .from('user_semester_courses')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('course_id', course.id);
        
      if (existingError) throw existingError;
      
      if (existingData && existingData.length > 0) {
        toast({
          title: 'Course already in history',
          description: 'This course is already in your course history',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Add course to history with empty grade
      const { error } = await supabase
        .from('user_semester_courses')
        .insert({
          user_id: session.user.id,
          course_id: course.id,
          semester_number: course.semester,
          grade: '',
          status: 'completed'
        });
        
      if (error) throw error;
      
      toast({
        title: 'Course added to history',
        description: 'The course has been added to your course history',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error: any) {
      console.error('Error adding course to history:', error);
      toast({
        title: 'Error adding course',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Get all unique credit values for filter
  const uniqueCredits = useMemo(() => {
    return [...new Set(courses.map(c => c.credits))].sort((a, b) => a - b);
  }, [courses]);

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

  // Course card component for reuse
  const CourseCard = ({ course }: { course: Course }) => (
    <Box
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 relative"
    >
      {/* Color strip at the top based on semester */}
      <Box 
        h="6px" 
        w="100%" 
        className={`bg-gradient-to-r ${
          course.semester <= 2 ? 'from-green-400 to-green-500' :
          course.semester <= 4 ? 'from-blue-400 to-blue-500' :
          course.semester <= 6 ? 'from-purple-400 to-purple-500' :
          'from-red-400 to-red-500'
        }`}
      />
      
      <Box p={5}>
        <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Badge 
              colorScheme={
                course.semester <= 2 ? 'green' :
                course.semester <= 4 ? 'blue' :
                course.semester <= 6 ? 'purple' :
                'red'
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
              colorScheme="gray"
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
            aria-label={course.isEnrolled ? "Remove from selection" : "Add to selection"}
            icon={course.isEnrolled ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            isLoading={enrolling[course.id]}
            size="sm"
            colorScheme={course.isEnrolled ? "purple" : "gray"}
            variant={course.isEnrolled ? "solid" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              handleEnroll(course.id);
            }}
          />
        </Flex>
        
        <Heading 
          size="md" 
          mb={1} 
          noOfLines={1} 
          title={course.name}
          className="text-gray-800"
        >
          {course.name}
        </Heading>
        
        <Text 
          fontSize="sm" 
          color="gray.500" 
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
              <User size={14} className="text-gray-400" />
              <Text fontSize="xs" color="gray.600">
                {course.instructor}
              </Text>
            </Flex>
          )}
          
          {course.stream?.name && (
            <Flex align="center" gap={1.5}>
              <GraduationCap size={14} className="text-gray-400" />
              <Text fontSize="xs" color="gray.600">
                {course.stream.name}
              </Text>
            </Flex>
          )}
        </HStack>
        
        <Divider mb={4} />
        
        <Flex gap={2}>
          <Button
            size="sm"
            width="full"
            colorScheme="purple"
            variant="outline"
            onClick={() => viewCourseDetails(course)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            width="full"
            colorScheme="indigo"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToHistory(course);
            }}
          >
            Add to History
          </Button>
        </Flex>
      </Box>
    </Box>
  );

  return (
    <>
      <NavBar />
      <Box className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-16">
        <Box maxW="1200px" margin="0 auto" p={[4, 6, 8]}>
          <Flex direction="column" gap={6}>
            {/* Header section */}
            <Box className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
              <Flex direction={['column', 'row']} alignItems="center" gap={4}>
                <Box className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                  <Book size={40} />
                </Box>
                <Box>
                  <Heading size="xl">Course Enrollment</Heading>
                  <Text fontSize="lg" mt={2} opacity={0.9}>
                    Browse and enroll in courses for your academic journey
                  </Text>
                </Box>
              </Flex>
            </Box>

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
                
                <Select
                  placeholder="Credits"
                  value={filters.credits}
                  onChange={(e) => handleFilterChange('credits', e.target.value)}
                  maxW={['100%', '120px']}
                  bg="gray.50"
                  borderColor="gray.200"
                  _focus={{ borderColor: 'purple.400', boxShadow: '0 0 0 1px var(--chakra-colors-purple-400)' }}
                >
                  {uniqueCredits.map(credit => (
                    <option key={credit} value={credit}>{credit} credit{credit !== 1 ? 's' : ''}</option>
                  ))}
                </Select>
              </Flex>
              
              <Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <HStack spacing={2}>
                  <Text color="gray.500" fontSize="sm" fontWeight="medium">View by:</Text>
                  <Button 
                    size="sm" 
                    variant={viewMode === 'list' ? 'solid' : 'outline'}
                    colorScheme={viewMode === 'list' ? 'purple' : 'gray'}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                  <Button 
                    size="sm"
                    variant={viewMode === 'streams' ? 'solid' : 'outline'}
                    colorScheme={viewMode === 'streams' ? 'purple' : 'gray'}
                    onClick={() => setViewMode('streams')}
                  >
                    Streams
                  </Button>
                  <Button 
                    size="sm"
                    variant={viewMode === 'semesters' ? 'solid' : 'outline'}
                    colorScheme={viewMode === 'semesters' ? 'purple' : 'gray'}
                    onClick={() => setViewMode('semesters')}
                  >
                    Semesters
                  </Button>
                </HStack>
                
                <Text color="gray.500" fontSize="sm" fontWeight="medium">
                  Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                </Text>
              </Flex>
            </Box>

            {/* Course listings */}
            {loading ? (
              <Flex justify="center" align="center" h="400px">
                <Spinner size="xl" color="purple.500" />
              </Flex>
            ) : filteredCourses.length > 0 ? (
              <Box>
                {/* List View */}
                {viewMode === 'list' && (
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                    gap={6}
                  >
                    {filteredCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </Grid>
                )}
                
                {/* Streams View */}
                {viewMode === 'streams' && (
                  <Accordion allowMultiple defaultIndex={[0]}>
                    {Object.entries(coursesByStream).map(([streamName, streamCourses], index) => (
                      <AccordionItem key={streamName} border="none" mb={4}>
                        <AccordionButton 
                          py={3}
                          bg="whiteAlpha.800" 
                          _hover={{ bg: "whiteAlpha.900" }}
                          rounded="lg"
                          border="1px"
                          borderColor="gray.100"
                        >
                          <Box flex='1' textAlign='left'>
                            <Text fontSize="lg" fontWeight="bold" color="gray.700">
                              {streamName} <Badge ml={2} colorScheme="purple">{streamCourses.length}</Badge>
                            </Text>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4} pt={6}>
                          <Grid
                            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                            gap={6}
                          >
                            {streamCourses.map((course) => (
                              <CourseCard key={course.id} course={course} />
                            ))}
                          </Grid>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
                
                {/* Semesters View */}
                {viewMode === 'semesters' && (
                  <Tabs variant="soft-rounded" colorScheme="purple">
                    <TabList mb={6} overflowX="auto" py={2} className="flex-nowrap">
                      {coursesBySemester.map(({ semester }) => (
                        <Tab key={semester} mx={1} whiteSpace="nowrap" fontWeight="medium">
                          Semester {semester}
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {coursesBySemester.map(({ semester, courses }) => (
                        <TabPanel key={semester} px={0}>
                          <Grid
                            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
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
          </Flex>
        </Box>
      </Box>
      
      {/* Course details modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent rounded="xl" overflow="hidden">
          {selectedCourse && (
            <>
              <Box 
                h="8px" 
                w="100%" 
                className={`bg-gradient-to-r ${
                  selectedCourse.semester <= 2 ? 'from-green-400 to-green-500' :
                  selectedCourse.semester <= 4 ? 'from-blue-400 to-blue-500' :
                  selectedCourse.semester <= 6 ? 'from-purple-400 to-purple-500' :
                  'from-red-400 to-red-500'
                }`}
              />
              
              <ModalHeader pb={2}>
                <Flex justify="space-between" align="center" w="full">
                  <Text fontSize="2xl" fontWeight="bold" className="text-gray-800">
                    {selectedCourse.name}
                  </Text>
                  <ModalCloseButton position="static" />
                </Flex>
                <Text fontSize="md" color="gray.500" fontFamily="mono">
                  {selectedCourse.code}
                </Text>
              </ModalHeader>
              
              <Divider />
              
              <ModalBody pt={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Department</Text>
                    <Text>{selectedCourse.department || 'Not specified'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Stream</Text>
                    <Text>{selectedCourse.stream?.name || 'Not specified'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Semester</Text>
                    <Text>Semester {selectedCourse.semester}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Credits</Text>
                    <Text>{selectedCourse.credits} credit{selectedCourse.credits !== 1 ? 's' : ''}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">Instructor</Text>
                    <Text>{selectedCourse.instructor || 'Not specified'}</Text>
                  </Box>
                </SimpleGrid>
                
                <Box mb={6}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={1}>Description</Text>
                  <Text fontSize="md" whiteSpace="pre-wrap">
                    {selectedCourse.description || 'No description available for this course.'}
                  </Text>
                </Box>
                
                {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                  <Box mb={6}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={2}>Prerequisites</Text>
                    <Flex gap={2} flexWrap="wrap">
                      {selectedCourse.prerequisites.map(prereq => (
                        <Tag key={prereq} size="md" colorScheme="blue" variant="subtle">
                          {prereq}
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}
                
                {selectedCourse.anti_requisites && selectedCourse.anti_requisites.length > 0 && (
                  <Box mb={6}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={2}>Anti-requisites</Text>
                    <Flex gap={2} flexWrap="wrap">
                      {selectedCourse.anti_requisites.map(anti => (
                        <Tag key={anti} size="md" colorScheme="red" variant="subtle">
                          {anti}
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}
                
                {selectedCourse.schedule && selectedCourse.schedule.length > 0 && (
                  <Box mb={6}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium" mb={2}>Schedule</Text>
                    <VStack align="stretch" spacing={2}>
                      {selectedCourse.schedule.map((slot, index) => (
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
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </Text>
                            </Flex>
                          </HStack>
                          <Flex alignItems="center" gap={1}>
                            <Tag size="sm" colorScheme={slot.type === 'Lecture' ? 'blue' : 'green'}>
                              {slot.type}
                            </Tag>
                            {slot.room && (
                              <Text fontSize="xs" color="gray.500">
                                Room: {slot.room}
                              </Text>
                            )}
                          </Flex>
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
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  colorScheme={selectedCourse.isEnrolled ? "red" : "purple"}
                  variant={selectedCourse.isEnrolled ? "outline" : "solid"}
                  leftIcon={selectedCourse.isEnrolled ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  isLoading={enrolling[selectedCourse.id]}
                  onClick={() => handleEnroll(selectedCourse.id)}
                >
                  {selectedCourse.isEnrolled ? "Remove from selection" : "Add to selection"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CourseEnrollment; 