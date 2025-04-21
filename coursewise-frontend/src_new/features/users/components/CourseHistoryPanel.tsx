import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  InputGroup,
  InputRightElement,
  Tooltip,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider
} from '@chakra-ui/react';
import { Plus, FileEdit, Trash2, Filter, HelpCircle, Info } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SemesterCourse {
  id: string;
  user_id: string;
  course_id: string;
  semester_number: number;
  grade: string | null;
  status: 'completed' | 'dropped';
  courses: {
    id: string;
    name: string;
    code: string;
    credits: number;
    [key: string]: any;
  };
}

interface CourseHistoryPanelProps {
  semesterCourses: SemesterCourse[];
  userData: any;
}

const CourseHistoryPanel = ({ semesterCourses, userData }: CourseHistoryPanelProps) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<SemesterCourse | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [sgpa, setSgpa] = useState<string>('');
  const [cgpa, setCgpa] = useState<string>('');
  const [failedCount, setFailedCount] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    course_id: '',
    semester_number: 1,
    grade: '',
    status: 'completed' as 'completed' | 'dropped'
  });

  // Get unique semesters from courses
  const semesters = [...new Set(semesterCourses.map(course => course.semester_number))].sort((a, b) => a - b);

  // Filter courses by selected semester
  const filteredCourses = selectedSemester === 'all'
    ? semesterCourses
    : semesterCourses.filter(course => course.semester_number === selectedSemester);

  // Calculate failed courses
  useEffect(() => {
    const failed = semesterCourses.filter(course => 
      course.grade === '2' && course.status === 'completed'
    ).length;
    setFailedCount(failed);
  }, [semesterCourses]);

  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name');
        
      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error fetching courses',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOpenAddModal = async () => {
    await fetchAvailableCourses();
    
    setFormData({
      course_id: '',
      semester_number: userData?.current_semester || 1,
      grade: '',
      status: 'completed'
    });
    
    setEditing(null);
    onOpen();
  };

  const handleOpenEditModal = async (course: SemesterCourse) => {
    await fetchAvailableCourses();
    
    setFormData({
      course_id: course.course_id,
      semester_number: course.semester_number,
      grade: course.grade || '',
      status: course.status
    });
    
    setEditing(course);
    onOpen();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!formData.course_id || !formData.semester_number) {
        toast({
          title: 'Missing information',
          description: 'Please fill in all required fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }
      
      // Validate grade (must be between 2 and 10)
      if (formData.grade) {
        const gradeNum = parseInt(formData.grade);
        if (isNaN(gradeNum) || gradeNum < 2 || gradeNum > 10) {
          toast({
            title: 'Invalid grade',
            description: 'Grade must be a number between 2 and 10',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }
      }
      
      // Check if the course already exists for this user and semester
      if (!editing) {
        const exists = semesterCourses.some(
          course => course.course_id === formData.course_id && 
                   course.semester_number === formData.semester_number
        );
        
        if (exists) {
          toast({
            title: 'Course already exists',
            description: 'You have already added this course for this semester',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }
      }
      
      if (editing) {
        // Update existing course record
        const { error } = await supabase
          .from('user_semester_courses')
          .update({
            semester_number: formData.semester_number,
            grade: formData.grade || null,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editing.id);
          
        if (error) throw error;
        
        toast({
          title: 'Course updated',
          description: 'Course record has been updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new course record
        const { error } = await supabase
          .from('user_semester_courses')
          .insert({
            user_id: userData.id,
            course_id: formData.course_id,
            semester_number: formData.semester_number,
            grade: formData.grade || null,
            status: formData.status
          });
          
        if (error) throw error;
        
        toast({
          title: 'Course added',
          description: 'Course has been added to your record successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Close modal and refresh data
      onClose();
      window.location.reload();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}" from your course history?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_semester_courses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Course deleted',
        description: `"${courseName}" has been removed from your course history.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Helper function to get color and grade letter based on numeric grade
  const getGradeInfo = (grade: string | null) => {
    if (!grade) return { color: 'gray', letter: '-' };
    
    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum)) return { color: 'gray', letter: grade };
    
    if (gradeNum === 2) return { color: 'red', letter: 'F' };
    if (gradeNum === 4) return { color: 'orange', letter: 'D' };
    if (gradeNum === 5) return { color: 'orange', letter: 'C' };
    if (gradeNum === 6) return { color: 'blue', letter: 'C+' };
    if (gradeNum === 7) return { color: 'blue', letter: 'B' };
    if (gradeNum === 8) return { color: 'green', letter: 'B+' };
    if (gradeNum === 9) return { color: 'green', letter: 'A' };
    if (gradeNum === 10) return { color: 'green', letter: 'A+' };
    
    return { color: 'gray', letter: grade };
  };

  // Save SGPA and CGPA to user data
  const updateGrades = async () => {
    try {
      setLoading(true);
      
      const sgpaValue = parseFloat(sgpa);
      const cgpaValue = parseFloat(cgpa);
      
      if (isNaN(sgpaValue) || sgpaValue < 0 || sgpaValue > 10 || 
          isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
        toast({
          title: 'Invalid input',
          description: 'SGPA and CGPA must be between 0 and 10',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Update user record with SGPA and CGPA
      const { error } = await supabase
        .from('user_academic_records')
        .upsert({
          user_id: userData.id,
          semester_number: selectedSemester === 'all' ? (userData?.current_semester || 1) : selectedSemester,
          gpa: sgpaValue,
          backlogs: failedCount,
          academic_year: new Date().getFullYear().toString(),
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: 'Grades updated',
        description: 'Your SGPA and CGPA have been updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color="purple.700">Course History</Heading>
        <Button
          size="sm"
          leftIcon={<Plus size={16} />}
          colorScheme="purple"
          onClick={handleOpenAddModal}
        >
          Add Course
        </Button>
      </Flex>
      
      {/* GPA and Failed Courses Summary Card */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Card variant="outline" shadow="sm">
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="start">
                <StatLabel>Semester GPA (SGPA)</StatLabel>
                <Tooltip 
                  label="Enter your semester GPA manually. Values must be between 0 and 10."
                  placement="top"
                >
                  <span><Info size={16} /></span>
                </Tooltip>
              </Flex>
              <InputGroup size="sm" mt={2}>
                <NumberInput min={0} max={10} precision={2} w="full" value={sgpa} onChange={setSgpa}>
                  <NumberInputField placeholder="Enter SGPA" />
                </NumberInput>
              </InputGroup>
            </Stat>
          </CardBody>
        </Card>
        
        <Card variant="outline" shadow="sm">
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="start">
                <StatLabel>Cumulative GPA (CGPA)</StatLabel>
                <Tooltip 
                  label="Enter your cumulative GPA manually. Values must be between 0 and 10."
                  placement="top"
                >
                  <span><Info size={16} /></span>
                </Tooltip>
              </Flex>
              <InputGroup size="sm" mt={2}>
                <NumberInput min={0} max={10} precision={2} w="full" value={cgpa} onChange={setCgpa}>
                  <NumberInputField placeholder="Enter CGPA" />
                </NumberInput>
              </InputGroup>
            </Stat>
          </CardBody>
        </Card>
        
        <Card variant="outline" shadow="sm">
          <CardBody>
            <Stat>
              <Flex justify="space-between" align="start">
                <StatLabel>Failed Courses</StatLabel>
                <Tooltip 
                  label="Courses with grade 2 are counted as failed"
                  placement="top"
                >
                  <span><Info size={16} /></span>
                </Tooltip>
              </Flex>
              <StatNumber>{failedCount}</StatNumber>
              <StatHelpText>Courses with grade 2</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <HStack justify="space-between" mb={6}>
        <Button
          size="sm"
          colorScheme="purple"
          onClick={updateGrades}
          isLoading={loading}
        >
          Save GPA Information
        </Button>
        
        {/* Semester filter */}
        <Flex align="center" className="bg-gray-100 px-3 py-2 rounded-lg">
          <Filter size={16} className="text-gray-500 mr-2" />
          <Select
            size="sm"
            variant="unstyled"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            width="auto"
          >
            <option value="all">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </Select>
        </Flex>
      </HStack>

      {/* Grade Legend */}
      <Box bg="gray.50" p={3} rounded="md" mb={4}>
        <Heading size="xs" mb={2}>Grading System</Heading>
        <Flex wrap="wrap" gap={2}>
          <Badge colorScheme="red" variant="subtle">2 = F (Fail)</Badge>
          <Badge colorScheme="orange" variant="subtle">4 = D</Badge>
          <Badge colorScheme="orange" variant="subtle">5 = C</Badge>
          <Badge colorScheme="blue" variant="subtle">6 = C+</Badge>
          <Badge colorScheme="blue" variant="subtle">7 = B</Badge>
          <Badge colorScheme="green" variant="subtle">8 = B+</Badge>
          <Badge colorScheme="green" variant="subtle">9 = A</Badge>
          <Badge colorScheme="green" variant="subtle">10 = A+</Badge>
        </Flex>
      </Box>

      {filteredCourses.length > 0 ? (
        <Box overflowX="auto">
          <Table variant="simple" className="border border-gray-100 rounded-lg">
            <Thead bg="purple.50">
              <Tr>
                <Th>Course</Th>
                <Th>Code</Th>
                <Th>Semester</Th>
                <Th>Status</Th>
                <Th>Grade</Th>
                <Th>Credits</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCourses
                .sort((a, b) => a.semester_number - b.semester_number || a.courses.name?.localeCompare(b.courses.name || ''))
                .map(course => {
                  const gradeInfo = getGradeInfo(course.grade);
                  return (
                    <Tr key={course.id}>
                      <Td fontWeight="medium">{course.courses.name}</Td>
                      <Td>{course.courses.code}</Td>
                      <Td>Semester {course.semester_number}</Td>
                      <Td>
                        <Badge 
                          colorScheme={course.status === 'completed' ? 'green' : 'red'}
                          variant="subtle"
                          px={2}
                          py={1}
                          rounded="md"
                        >
                          {course.status}
                        </Badge>
                      </Td>
                      <Td>
                        {course.grade ? (
                          <Flex align="center" gap={2}>
                            <Badge 
                              colorScheme={gradeInfo.color}
                              variant="solid"
                              px={2}
                              py={1}
                              rounded="md"
                            >
                              {course.grade}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">({gradeInfo.letter})</Text>
                          </Flex>
                        ) : (
                          <Text fontSize="sm" color="gray.500">Not graded</Text>
                        )}
                      </Td>
                      <Td>{course.courses.credits}</Td>
                      <Td>
                        <Flex gap={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="purple"
                            onClick={() => handleOpenEditModal(course)}
                          >
                            <FileEdit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteCourse(course.id, course.courses.name)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Box textAlign="center" py={10} className="bg-gray-50 rounded-lg">
          <Text color="gray.500" mb={4}>No courses found for the selected semester.</Text>
          <Button size="sm" colorScheme="purple" onClick={handleOpenAddModal}>
            Add Your First Course
          </Button>
        </Box>
      )}

      {/* Add/Edit Course Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editing ? 'Edit Course Record' : 'Add New Course'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Course</FormLabel>
                <Select
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  isDisabled={!!editing}
                  placeholder="Select a course"
                >
                  {availableCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Semester</FormLabel>
                <Select
                  name="semester_number"
                  value={formData.semester_number}
                  onChange={handleInputChange}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>
                  <Flex align="center" gap={1}>
                    Grade
                    <Tooltip label="Enter grade from 2 to 10 (2=Failed, 4-10=D to A+)">
                      <span>
                        <HelpCircle size={14} />
                      </span>
                    </Tooltip>
                  </Flex>
                </FormLabel>
                <Select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="Select grade"
                >
                  {[
                    { value: '2', label: '2 - F (Failed)' },
                    { value: '4', label: '4 - D' },
                    { value: '5', label: '5 - C' },
                    { value: '6', label: '6 - C+' },
                    { value: '7', label: '7 - B' },
                    { value: '8', label: '8 - B+' },
                    { value: '9', label: '9 - A' },
                    { value: '10', label: '10 - A+' }
                  ].map(grade => (
                    <option key={grade.value} value={grade.value}>{grade.label}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={handleSubmit}
              isLoading={loading}
            >
              {editing ? 'Update' : 'Add'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CourseHistoryPanel; 