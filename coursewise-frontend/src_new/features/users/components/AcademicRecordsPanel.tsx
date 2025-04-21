import React, { useState } from 'react';
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
  SimpleGrid
} from '@chakra-ui/react';
import { Plus, Edit2, Trash, Star, BookOpen, GraduationCap } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface AcademicRecord {
  id: string;
  user_id: string;
  semester_number: number;
  academic_year: string;
  gpa: number;
  backlogs: number;
  total_credits: number;
  completed_credits: number;
}

interface AcademicRecordsPanelProps {
  academicRecords: AcademicRecord[];
  userData: any;
}

const AcademicRecordsPanel = ({ academicRecords, userData }: AcademicRecordsPanelProps) => {
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
    completed_credits: 0
  });

  // Calculate overall GPA
  const overallGPA = academicRecords.length > 0
    ? (academicRecords.reduce((sum, record) => sum + record.gpa, 0) / academicRecords.length).toFixed(2)
    : 'N/A';
  
  // Calculate total credits completed
  const totalCreditsCompleted = academicRecords.reduce((sum, record) => sum + record.completed_credits, 0);
  
  // Calculate total credits required
  const totalCreditsRequired = academicRecords.reduce((sum, record) => sum + record.total_credits, 0);

  const completionPercentage = totalCreditsRequired > 0 
    ? Math.round((totalCreditsCompleted / totalCreditsRequired) * 100) 
    : 0;
  
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
      completed_credits: 0
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
      completed_credits: record.completed_credits
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
            user_id: userData.id,
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color="purple.700">Academic Records</Heading>
        <Button
          size="sm"
          leftIcon={<Plus size={16} />}
          colorScheme="purple"
          onClick={handleOpenAddModal}
        >
          Add Semester
        </Button>
      </Flex>

      {/* Academic overview cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Box bg="white" boxShadow="md" borderRadius="lg" p={6}>
          <Flex align="center" mb={3}>
            <Box className="p-2 bg-purple-100 rounded-full mr-3">
              <Star size={20} className="text-purple-600" />
            </Box>
            <Stat>
              <StatLabel>Current GPA</StatLabel>
              <StatNumber>{overallGPA}</StatNumber>
              <StatHelpText>Overall average</StatHelpText>
            </Stat>
          </Flex>
        </Box>
        
        <Box bg="white" boxShadow="md" borderRadius="lg" p={6}>
          <Flex align="center" mb={3}>
            <Box className="p-2 bg-green-100 rounded-full mr-3">
              <BookOpen size={20} className="text-green-600" />
            </Box>
            <Stat>
              <StatLabel>Credits Completed</StatLabel>
              <StatNumber>{totalCreditsCompleted}</StatNumber>
              <StatHelpText>Out of {totalCreditsRequired}</StatHelpText>
            </Stat>
          </Flex>
          <Progress 
            value={completionPercentage} 
            colorScheme="green" 
            size="sm" 
            borderRadius="full" 
          />
        </Box>
        
        <Box bg="white" boxShadow="md" borderRadius="lg" p={6}>
          <Flex align="center" mb={3}>
            <Box className="p-2 bg-blue-100 rounded-full mr-3">
              <GraduationCap size={20} className="text-blue-600" />
            </Box>
            <Stat>
              <StatLabel>Current Semester</StatLabel>
              <StatNumber>{userData?.current_semester || 'N/A'}</StatNumber>
              <StatHelpText>Out of 8 semesters</StatHelpText>
            </Stat>
          </Flex>
          <Progress 
            value={(userData?.current_semester / 8) * 100 || 0} 
            colorScheme="blue" 
            size="sm" 
            borderRadius="full" 
          />
        </Box>
      </SimpleGrid>

      {academicRecords.length > 0 ? (
        <Box overflowX="auto">
          <Table variant="simple" className="border border-gray-100 rounded-lg">
            <Thead bg="purple.50">
              <Tr>
                <Th>Semester</Th>
                <Th>Academic Year</Th>
                <Th isNumeric>GPA</Th>
                <Th isNumeric>Backlogs</Th>
                <Th isNumeric>Credits</Th>
                <Th className="text-center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[...academicRecords]
                .sort((a, b) => a.semester_number - b.semester_number)
                .map((record) => (
                <Tr key={record.id}>
                  <Td fontWeight="medium">Semester {record.semester_number}</Td>
                  <Td>{record.academic_year}</Td>
                  <Td isNumeric>
                    <Text 
                      fontWeight="bold" 
                      color={record.gpa >= 8 ? 'green.500' : record.gpa >= 6 ? 'orange.500' : 'red.500'}
                    >
                      {record.gpa.toFixed(2)}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text color={record.backlogs > 0 ? 'red.500' : 'inherit'}>
                      {record.backlogs}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    {record.completed_credits}/{record.total_credits}
                  </Td>
                  <Td>
                    <Flex justify="center" gap={2}>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="purple"
                        onClick={() => handleOpenEditModal(record)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteRecord(record.id, record.semester_number)}
                      >
                        <Trash size={16} />
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
          <Text color="gray.500" mb={4}>No academic records found.</Text>
          <Button size="sm" colorScheme="purple" onClick={handleOpenAddModal}>
            Add Your First Semester
          </Button>
        </Box>
      )}

      {/* Add/Edit Record Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingRecord ? 'Edit Academic Record' : 'Add New Semester Record'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Semester</FormLabel>
                <Select
                  name="semester_number"
                  value={formData.semester_number}
                  onChange={handleInputChange}
                  isDisabled={!!editingRecord}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Academic Year</FormLabel>
                <Input
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleInputChange}
                  placeholder="e.g. 2023-2024"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>GPA (0-10)</FormLabel>
                <Input
                  name="gpa"
                  type="number"
                  min={0}
                  max={10}
                  step={0.01}
                  value={formData.gpa}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Backlogs</FormLabel>
                <Input
                  name="backlogs"
                  type="number"
                  min={0}
                  value={formData.backlogs}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Total Credits</FormLabel>
                <Input
                  name="total_credits"
                  type="number"
                  min={0}
                  value={formData.total_credits}
                  onChange={handleInputChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Completed Credits</FormLabel>
                <Input
                  name="completed_credits"
                  type="number"
                  min={0}
                  max={formData.total_credits}
                  value={formData.completed_credits}
                  onChange={handleInputChange}
                />
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
              {editingRecord ? 'Update' : 'Save'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AcademicRecordsPanel; 