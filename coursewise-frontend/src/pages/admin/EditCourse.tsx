import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Select,
  Textarea,
  HStack,
  useColorModeValue,
  Grid,
  GridItem,
  IconButton,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;
  end_time: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  stream_id: string;
  semester: number;
  description: string;
  instructor: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  department: string;
  status: 'active' | 'inactive' | 'archived';
  prerequisites: string[];
  anti_requisites: string[];
  schedule: TimeSlot[];
}

const STREAMS = [
  { id: 'f757bad9-202e-44fc-8158-de439d8dbefe', name: 'All' },
  { id: '1160d7a4-30ef-4d8c-ab41-0e6317560dc3', name: 'Computer Science and AI' },
  { id: '5fc95cf3-e817-47c2-9c28-7a54f0f7e62a', name: 'Computer Science and Engineering' },
  { id: '63957879-1c1e-4797-b7df-fba74c54fd00', name: 'Electronics & Communication Engineering' },
  { id: '7f05302c-9b18-466f-875b-b820d532514c', name: 'Computer Science and Social Sciences' },
  { id: 'f5725c05-12ff-49f2-99f0-78235ccd08d3', name: 'Computer Science and Design' }
];

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const borderColor = useColorModeValue('purple.200', 'gray.600');

  const [formData, setFormData] = useState<Course>({
    id: '',
    code: '',
    name: '',
    credits: 0,
    stream_id: '',
    semester: 1,
    description: '',
    instructor: '',
    difficulty: 'Easy',
    department: '',
    status: 'active',
    prerequisites: [],
    anti_requisites: [],
    schedule: []
  });

  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newAntiRequisite, setNewAntiRequisite] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:30'
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: 'Authentication Error',
          description: 'Please login as admin first',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.created_by !== session.user.id) {
        toast({
          title: 'Access Denied',
          description: 'You can only edit courses you have created',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/admin/courses/my-courses');
        return;
      }

      // Ensure arrays are initialized even if null
      setFormData({
        ...data,
        prerequisites: data.prerequisites || [],
        anti_requisites: data.anti_requisites || [],
        schedule: data.schedule || []
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch course details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite && !formData.prerequisites.includes(newPrerequisite)) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prerequisite: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(p => p !== prerequisite)
    }));
  };

  const addAntiRequisite = () => {
    if (newAntiRequisite && !formData.anti_requisites.includes(newAntiRequisite)) {
      setFormData(prev => ({
        ...prev,
        anti_requisites: [...prev.anti_requisites, newAntiRequisite]
      }));
      setNewAntiRequisite('');
    }
  };

  const removeAntiRequisite = (antiRequisite: string) => {
    setFormData(prev => ({
      ...prev,
      anti_requisites: prev.anti_requisites.filter(a => a !== antiRequisite)
    }));
  };

  const addTimeSlot = () => {
    // Check if the time slot already exists
    const exists = formData.schedule.some(
      slot => slot.day === newTimeSlot.day && 
              slot.start_time === newTimeSlot.start_time && 
              slot.end_time === newTimeSlot.end_time
    );

    if (!exists) {
      setFormData(prev => ({
        ...prev,
        schedule: [...prev.schedule, { ...newTimeSlot }].sort((a, b) => {
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return days.indexOf(a.day) - days.indexOf(b.day) || 
                 a.start_time.localeCompare(b.start_time);
        })
      }));
    }

    // Reset time slot
    setNewTimeSlot({
      day: 'Monday',
      start_time: '09:00',
      end_time: '10:30'
    });
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: 'Authentication Error',
          description: 'Please login as admin first',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // No need to find selected stream since we're using actual IDs now
      const finalFormData = {
        ...formData,
        updated_by: session.user.id
      };

      const { error: updateError } = await supabase
        .from('courses')
        .update(finalFormData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Course updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/admin/courses/my-courses');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box p={8} maxWidth="800px" mx="auto">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={8} maxWidth="800px" mx="auto" bgGradient="linear(to-br, purple.50, blue.50)">
      <VStack 
        spacing={8} 
        align="stretch" 
        bg="white" 
        p={8} 
        borderRadius="xl" 
        boxShadow="lg" 
        border="1px" 
        borderColor={borderColor}
      >
        <HStack justify="space-between" align="center">
          <Heading size="lg" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
            Edit Course
          </Heading>
          <Button
            as="a"
            href="/admin/courses/my-courses"
            colorScheme="gray"
            leftIcon={<ArrowBackIcon />}
          >
            Back to My Courses
          </Button>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Course Code</FormLabel>
                  <Input
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., CS101"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Course Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Introduction to Computer Science"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Credits</FormLabel>
                  <NumberInput
                    min={1}
                    max={6}
                    value={formData.credits}
                    onChange={(value) => handleNumberInputChange('credits', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Stream</FormLabel>
                  <Select
                    name="stream_id"
                    value={formData.stream_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a stream</option>
                    {STREAMS.map(stream => (
                      <option key={stream.id} value={stream.id}>
                        {stream.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Department</FormLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a department</option>
                    {STREAMS.map(stream => (
                      <option key={stream.id} value={stream.name}>
                        {stream.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Semester</FormLabel>
                  <NumberInput
                    min={1}
                    max={8}
                    value={formData.semester}
                    onChange={(value) => handleNumberInputChange('semester', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Instructor</FormLabel>
                  <Input
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    placeholder="e.g., Dr. John Doe"
                  />
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    name="difficulty"
                    value={formData.difficulty || ''}
                    onChange={handleInputChange}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                rows={4}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Prerequisites</FormLabel>
              <HStack>
                <Input
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Enter course code"
                />
                <Button onClick={addPrerequisite} leftIcon={<AddIcon />}>
                  Add
                </Button>
              </HStack>
              <HStack wrap="wrap" mt={2} spacing={2}>
                {formData.prerequisites.map((prerequisite) => (
                  <Button
                    key={prerequisite}
                    size="sm"
                    rightIcon={<CloseIcon />}
                    onClick={() => removePrerequisite(prerequisite)}
                  >
                    {prerequisite}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Anti-requisites</FormLabel>
              <HStack>
                <Input
                  value={newAntiRequisite}
                  onChange={(e) => setNewAntiRequisite(e.target.value)}
                  placeholder="Enter course code"
                />
                <Button onClick={addAntiRequisite} leftIcon={<AddIcon />}>
                  Add
                </Button>
              </HStack>
              <HStack wrap="wrap" mt={2} spacing={2}>
                {formData.anti_requisites.map((antiRequisite) => (
                  <Button
                    key={antiRequisite}
                    size="sm"
                    rightIcon={<CloseIcon />}
                    onClick={() => removeAntiRequisite(antiRequisite)}
                  >
                    {antiRequisite}
                  </Button>
                ))}
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Schedule</FormLabel>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <GridItem>
                  <Select
                    value={newTimeSlot.day}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, day: e.target.value as TimeSlot['day'] }))}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </Select>
                </GridItem>
                <GridItem>
                  <Input
                    type="time"
                    value={newTimeSlot.start_time}
                    onChange={(e) => {
                      const time = e.target.value;
                      // Ensure HH:mm format
                      const formattedTime = time.split(':').slice(0, 2).join(':');
                      setNewTimeSlot(prev => ({ ...prev, start_time: formattedTime }));
                    }}
                    step="60" // Only allow hours and minutes (no seconds)
                  />
                </GridItem>
                <GridItem>
                  <Input
                    type="time"
                    value={newTimeSlot.end_time}
                    onChange={(e) => {
                      const time = e.target.value;
                      // Ensure HH:mm format
                      const formattedTime = time.split(':').slice(0, 2).join(':');
                      setNewTimeSlot(prev => ({ ...prev, end_time: formattedTime }));
                    }}
                    step="60" // Only allow hours and minutes (no seconds)
                  />
                </GridItem>
              </Grid>
              <Button onClick={addTimeSlot} mt={4} leftIcon={<AddIcon />}>
                Add Time Slot
              </Button>
              <VStack align="stretch" mt={4} spacing={2}>
                {formData.schedule.map((slot, index) => (
                  <HStack key={index} justify="space-between">
                    <Text>
                      {slot.day} - {slot.start_time} to {slot.end_time}
                    </Text>
                    <IconButton
                      aria-label="Remove time slot"
                      icon={<CloseIcon />}
                      size="sm"
                      onClick={() => removeTimeSlot(index)}
                      colorScheme="red"
                    />
                  </HStack>
                ))}
              </VStack>
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              width="100%"
              size="lg"
              isLoading={saving}
            >
              Update Course
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default EditCourse; 