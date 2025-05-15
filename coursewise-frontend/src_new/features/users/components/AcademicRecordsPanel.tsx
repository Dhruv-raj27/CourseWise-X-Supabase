import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Divider,
  Badge,
  List,
  ListItem,
  Grid,
  GridItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { Plus, Edit2, Trash, Star, BookOpen, GraduationCap, Upload, Trash2, Check, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/contexts/AuthContext';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
}

interface UserCourse {
  id: string;
  user_id: string;
  course_id: string;
  semester_number: number;
  grade: string;
  status: string;
  course: Course;
}

interface AcademicRecord {
  id: string;
  user_id: string;
  semester_number: number;
  gpa: number;
  backlogs: number;
  total_credits: number;
  completed_credits: number;
  academic_year: string;
  courses: UserCourse[];
}

const AcademicRecordsPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);
  
  const [formData, setFormData] = useState<Omit<AcademicRecord, 'id' | 'user_id'>>({
    semester_number: 1,
    academic_year: '',
    gpa: 0,
    backlogs: 0,
    total_credits: 0,
    completed_credits: 0,
    courses: []
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (session?.user?.id) {
      fetchAcademicRecords();
    }
  }, [session?.user?.id]);

  const fetchAcademicRecords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all academic records for the user
      const { data: records, error: recordsError } = await supabase
        .from('user_academic_records')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('semester_number', { ascending: true });
      
      if (recordsError) throw recordsError;
      
      // Fetch all courses for this user
      const { data: userCourses, error: coursesError } = await supabase
        .from('user_semester_courses')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', session?.user?.id);
      
      if (coursesError) throw coursesError;
      
      // Group courses by semester
      const recordsWithCourses = records.map((record: any) => {
        const coursesForSemester = userCourses.filter(
          (uc: any) => uc.semester_number === record.semester_number
        );
        
        return {
          ...record,
          courses: coursesForSemester,
        };
      });
      
      setAcademicRecords(recordsWithCourses);
    } catch (error) {
      console.error('Error fetching academic records:', error);
      setError('Failed to load your academic records. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, semesterId: string) => {
    try {
      // Delete the course from the user's semester
      const { error } = await supabase
        .from('user_semester_courses')
        .delete()
        .eq('id', courseId);
      
      if (error) throw error;
      
      // Refetch records to update the UI
      fetchAcademicRecords();
      
      toast({
        title: 'Course removed',
        description: 'The course has been removed from your semester',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove course. Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'green.500';
    if (grade === 'A-' || grade === 'B+' || grade === 'B') return 'teal.500';
    if (grade === 'B-' || grade === 'C+' || grade === 'C') return 'blue.500';
    if (grade === 'C-' || grade === 'D+' || grade === 'D') return 'orange.500';
    return 'red.500'; // F or other failing grades
  };

  const renderSkeleton = () => (
    <VStack spacing={4} align="stretch" w="full">
      <Skeleton height="40px" width="200px" />
      <Skeleton height="20px" width="100%" />
      <Skeleton height="20px" width="100%" />
      <Skeleton height="20px" width="100%" />
      <Grid templateColumns="repeat(5, 1fr)" gap={4}>
        <GridItem colSpan={5}>
          <Skeleton height="40px" />
        </GridItem>
        {[...Array(5)].map((_, i) => (
          <React.Fragment key={i}>
            <GridItem colSpan={2}>
              <Skeleton height="30px" />
            </GridItem>
            <GridItem colSpan={2}>
              <Skeleton height="30px" />
            </GridItem>
            <GridItem colSpan={1}>
              <Skeleton height="30px" />
            </GridItem>
          </React.Fragment>
        ))}
      </Grid>
    </VStack>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester_number' || name === 'gpa' || name === 'backlogs' || 
              name === 'total_credits' || name === 'completed_credits'
        ? Number(value)
        : value
    }));
  };

  const handleOpenAddModal = () => {
    // Set default form data for a new record
    const nextSemester = academicRecords.length > 0 
      ? Math.max(...academicRecords.map(r => r.semester_number)) + 1 
      : 1;
    
    setFormData({
      semester_number: nextSemester <= 8 ? nextSemester : 8,
      academic_year: new Date().getFullYear().toString(),
      gpa: 0,
      backlogs: 0,
      total_credits: 0,
      completed_credits: 0,
      courses: []
    });
    setEditingRecord(null);
    onOpen();
  };

  const handleOpenEditModal = (record: AcademicRecord) => {
    setFormData({
      semester_number: record.semester_number,
      academic_year: record.academic_year,
      gpa: record.gpa,
      backlogs: record.backlogs,
      total_credits: record.total_credits,
      completed_credits: record.completed_credits,
      courses: record.courses
    });
    setEditingRecord(record);
    onOpen();
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      if (editingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('user_academic_records')
          .update({
            semester_number: formData.semester_number,
            academic_year: formData.academic_year,
            gpa: formData.gpa,
            backlogs: formData.backlogs,
            total_credits: formData.total_credits,
            completed_credits: formData.completed_credits,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRecord.id);
          
        if (error) throw error;
        
        toast({
          title: 'Record updated',
          description: `Academic record for semester ${formData.semester_number} has been updated.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Check if a record for this semester already exists
        const existingRecord = academicRecords.find(r => r.semester_number === formData.semester_number);
        
        if (existingRecord) {
          toast({
            title: 'Semester already exists',
            description: `A record for semester ${formData.semester_number} already exists.`,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }
        
        // Add new record
        const { error } = await supabase
          .from('user_academic_records')
          .insert({
            user_id: session?.user?.id,
            semester_number: formData.semester_number,
            academic_year: formData.academic_year,
            gpa: formData.gpa,
            backlogs: formData.backlogs,
            total_credits: formData.total_credits,
            completed_credits: formData.completed_credits
          });
          
        if (error) throw error;
        
        toast({
          title: 'Record added',
          description: `Academic record for semester ${formData.semester_number} has been added.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Close modal and refresh data
      onClose();
      // Reload the page to refresh the data
      fetchAcademicRecords();
      
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

  const handleDeleteRecord = async (id: string, semesterNumber: number) => {
    if (!window.confirm(`Are you sure you want to delete the record for Semester ${semesterNumber}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('user_academic_records')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Record deleted',
        description: `Academic record for semester ${semesterNumber} has been deleted.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reload the page to refresh the data
      fetchAcademicRecords();
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

  return (
    <Box>
      <Tabs variant="enclosed" colorScheme="purple" defaultIndex={0}>
        <TabList mb={4}>
          <Tab><Flex align="center" gap={2}><BookOpen size={16} />Records</Flex></Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel px={0}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color="purple.700">Academic Records</Heading>
        <Button
          leftIcon={<Plus size={16} />}
          colorScheme="purple"
                size="sm"
          onClick={handleOpenAddModal}
        >
          Add Semester
        </Button>
      </Flex>

            {/* Stats section */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
              <Box p={4} bg="purple.50" rounded="lg" shadow="sm">
            <Stat>
                  <StatLabel color="gray.600">Completed Semesters</StatLabel>
                  <StatNumber fontSize="2xl" color="purple.600">{academicRecords.length}</StatNumber>
                </Stat>
        </Box>
        
              <Box p={4} bg="purple.50" rounded="lg" shadow="sm">
            <Stat>
                  <StatLabel color="gray.600">Total Credits</StatLabel>
                  <StatNumber fontSize="2xl" color="purple.600">{academicRecords.reduce((sum, record) => sum + (record.completed_credits || 0), 0)}</StatNumber>
                </Stat>
        </Box>
        
              <Box p={4} bg="purple.50" rounded="lg" shadow="sm">
            <Stat>
                  <StatLabel color="gray.600">Cumulative GPA</StatLabel>
                  <StatNumber fontSize="2xl" color="purple.600">{calculateCGPA(academicRecords)}</StatNumber>
                </Stat>
        </Box>
      </SimpleGrid>

            {/* Records table */}
      {isLoading ? (
        renderSkeleton()
      ) : error ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      ) : academicRecords.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" mb={4}>
            No academic records found
          </Text>
          <Text color="gray.500" mb={6}>
            Your academic records will appear here once they're added.
          </Text>
          <Button
            leftIcon={<RefreshCw size={16} />}
            colorScheme="purple"
            onClick={fetchAcademicRecords}
          >
            Refresh Records
          </Button>
        </Box>
      ) : (
        <VStack spacing={6} align="stretch">
          <Accordion allowMultiple defaultIndex={[0]}>
            {academicRecords.map((record) => (
              <AccordionItem 
                key={record.id}
                mb={4}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
              >
                <AccordionButton py={3} bg={bgColor}>
                  <Flex flex="1" textAlign="left" alignItems="center">
                    <Heading as="h4" size="md" mr={2}>
                      Semester {record.semester_number}
                    </Heading>
                    <Badge colorScheme="purple" mr={2}>
                      GPA: {record.gpa.toFixed(2)}
                    </Badge>
                    <Badge colorScheme="blue">
                      {record.completed_credits} Credits
                    </Badge>
                    {record.backlogs > 0 && (
                      <Badge colorScheme="red" ml={2}>
                        {record.backlogs} Backlogs
                      </Badge>
                    )}
                  </Flex>
                  <AccordionIcon />
                </AccordionButton>
                
                <AccordionPanel pb={4}>
                  <Table variant="simple" size="sm" mt={2}>
                    <Thead>
                      <Tr>
                        <Th>Course Code</Th>
                        <Th>Course Name</Th>
                        <Th>Credits</Th>
                        <Th>Grade</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {record.courses.length > 0 ? (
                        record.courses.map((userCourse) => (
                          <Tr key={userCourse.id}>
                            <Td fontWeight="medium">{userCourse.course.code}</Td>
                            <Td>{userCourse.course.name}</Td>
                            <Td>{userCourse.course.credits}</Td>
                            <Td>
                              <Badge 
                                colorScheme={getGradeColor(userCourse.grade) === 'red.500' ? 'red' : 'green'}
                                color={getGradeColor(userCourse.grade)}
                              >
                                {userCourse.grade}
                              </Badge>
                            </Td>
                            <Td>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                leftIcon={<Trash2 size={14} />}
                                onClick={() => handleDeleteCourse(userCourse.id, record.id)}
                              >
                                Remove
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={4}>
                            No courses added for this semester
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                  
                  <Button
                    size="sm"
                    leftIcon={<Plus size={16} />}
                    mt={4}
                    colorScheme="purple"
                    variant="outline"
                  >
                    Add Course
                  </Button>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </VStack>
      )}

      {/* Add/Edit Record Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
                  {editingRecord ? 'Edit Semester Record' : 'Add Semester Record'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
                    <FormControl>
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
                <FormLabel>Academic Year</FormLabel>
                <Input
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  placeholder="e.g. 2023-2024"
                />
              </FormControl>
              
                    <FormControl>
                      <FormLabel>GPA</FormLabel>
                <Input
                  name="gpa"
                  type="number"
                        step="0.01"
                        min="0"
                        max="10"
                  value={formData.gpa}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Total Credits</FormLabel>
                <Input
                  name="total_credits"
                  type="number"
                        min="0"
                  value={formData.total_credits}
                  onChange={handleInputChange}
                />
              </FormControl>
              
                    <FormControl>
                <FormLabel>Completed Credits</FormLabel>
                <Input
                  name="completed_credits"
                  type="number"
                        min="0"
                  max={formData.total_credits}
                  value={formData.completed_credits}
                  onChange={handleInputChange}
                />
              </FormControl>
                    
                    <FormControl>
                      <FormLabel>Backlogs</FormLabel>
                      <Input
                        name="backlogs"
                        type="number"
                        min="0"
                        value={formData.backlogs}
                        onChange={handleInputChange}
                      />
                    </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onClose} isDisabled={loading}>
              Cancel
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={handleSubmit}
              isLoading={loading}
            >
                    {editingRecord ? 'Save Changes' : 'Add Record'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Helper function to calculate CGPA
const calculateCGPA = (records: AcademicRecord[]): string => {
  if (records.length === 0) return '0.00';
  
  const totalCredits = records.reduce((sum, record) => sum + record.completed_credits, 0);
  if (totalCredits === 0) return '0.00';
  
  const weightedGPA = records.reduce((sum, record) => {
    return sum + (record.gpa * record.completed_credits);
  }, 0);
  
  return (weightedGPA / totalCredits).toFixed(2);
};

export default AcademicRecordsPanel; 