import React, { useState } from 'react';
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
  VStack
} from '@chakra-ui/react';
import { Plus, FileEdit, Trash2, Filter } from 'lucide-react';
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
    course_name: string;
    course_code: string;
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

  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, course_name, course_code')
        .order('course_name');
        
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

  // Helper function to get color for grade
  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'gray';
    
    const gradeValue = grade.toUpperCase();
    if (['A+', 'A', 'A-', 'B+'].includes(gradeValue)) return 'green';
    if (['B', 'B-', 'C+'].includes(gradeValue)) return 'blue';
    if (['C', 'C-', 'D+', 'D'].includes(gradeValue)) return 'orange';
    if (['F', 'E'].includes(gradeValue)) return 'red';
    
    return 'gray';
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

      {/* Semester filter */}
      <Flex justify="flex-end" align="center" mb={4}>
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
      </Flex>

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
                .sort((a, b) => a.semester_number - b.semester_number || a.courses.course_name.localeCompare(b.courses.course_name))
                .map(course => (
                <Tr key={course.id}>
                  <Td fontWeight="medium">{course.courses.course_name}</Td>
                  <Td>{course.courses.course_code}</Td>
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
                      <Badge 
                        colorScheme={getGradeColor(course.grade)}
                        variant="solid"
                        px={2}
                        py={1}
                        rounded="md"
                      >
                        {course.grade}
                      </Badge>
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
                        onClick={() => handleDeleteCourse(course.id, course.courses.course_name)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
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
                      {course.course_name} ({course.course_code})
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
                <FormLabel>Grade</FormLabel>
                <Select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="Select grade (if completed)"
                >
                  {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
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