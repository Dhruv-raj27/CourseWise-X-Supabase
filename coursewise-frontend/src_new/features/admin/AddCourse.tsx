import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Select,
  Textarea,
  NumberInput,
  NumberInputField,
  useToast,
  Tag,
  HStack,
  IconButton,
  Text,
  Switch,
  FormHelperText,
  Divider,
  useColorModeValue,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { AddIcon, CloseIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;
  end_time: string;
}

interface CourseForm {
  code: string;
  name: string;
  credits: number;
  stream_id: string;
  semester: number;
  description: string;
  instructor: string;
  department: string;
  status: 'active' | 'inactive' | 'archived';
  prerequisites: string[];
  anti_requisites: string[];
  schedule: TimeSlot[];
}

const AddCourse: React.FC = () => {
  const [prerequisiteInput, setPrerequisiteInput] = useState('');
  const [antiRequisiteInput, setAntiRequisiteInput] = useState('');
  const toast = useToast();
  const formBackground = useColorModeValue('purple.50', 'gray.700');
  const borderColor = useColorModeValue('purple.200', 'gray.600');
  const navigate = useNavigate();

  const [streams, setStreams] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState<CourseForm>({
    code: '',
    name: '',
    credits: 4,
    stream_id: '',
    semester: 1,
    description: '',
    instructor: '',
    department: '',
    status: 'active',
    prerequisites: [],
    anti_requisites: [],
    schedule: []
  });

  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    day: 'Monday',
    start_time: '',
    end_time: ''
  });

  const [timeInputs, setTimeInputs] = useState({
    startHours: '',
    startMinutes: '',
    endHours: '',
    endMinutes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const { data, error } = await supabase
          .from('streams')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setStreams(data || []);
      } catch (error) {
        console.error('Error fetching streams:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch streams',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchStreams();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const addPrerequisite = () => {
    if (prerequisiteInput && !formData.prerequisites.includes(prerequisiteInput)) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prerequisiteInput]
      }));
      setPrerequisiteInput('');
    }
  };

  const removePrerequisite = (prereq: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(p => p !== prereq)
    }));
  };

  const addAntiRequisite = () => {
    if (antiRequisiteInput && !formData.anti_requisites.includes(antiRequisiteInput)) {
      setFormData(prev => ({
        ...prev,
        anti_requisites: [...prev.anti_requisites, antiRequisiteInput]
      }));
      setAntiRequisiteInput('');
    }
  };

  const removeAntiRequisite = (antiReq: string) => {
    setFormData(prev => ({
      ...prev,
      anti_requisites: prev.anti_requisites.filter(a => a !== antiReq)
    }));
  };

  const addTimeSlot = () => {
    const formattedStartTime = timeInputs.startHours && timeInputs.startMinutes 
      ? `${timeInputs.startHours.padStart(2, '0')}:${timeInputs.startMinutes.padStart(2, '0')}`
      : '';
    const formattedEndTime = timeInputs.endHours && timeInputs.endMinutes
      ? `${timeInputs.endHours.padStart(2, '0')}:${timeInputs.endMinutes.padStart(2, '0')}`
      : '';

    if (formattedStartTime && formattedEndTime) {
      const newSlot = {
        day: newTimeSlot.day,
        start_time: formattedStartTime,
        end_time: formattedEndTime
      };

      // Check if this time slot already exists
      const slotExists = formData.schedule.some(
        slot => slot.day === newSlot.day && 
               slot.start_time === newSlot.start_time && 
               slot.end_time === newSlot.end_time
      );

      if (!slotExists) {
        setFormData(prev => ({
          ...prev,
          schedule: [...prev.schedule, newSlot].sort((a, b) => {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days.indexOf(a.day) - days.indexOf(b.day) || 
                   a.start_time.localeCompare(b.start_time);
          })
        }));
      }
      
      // Clear time inputs after adding
      setTimeInputs({
        startHours: '',
        startMinutes: '',
        endHours: '',
        endMinutes: ''
      });
      
      // Reset newTimeSlot but keep the selected day
      setNewTimeSlot(prev => ({
        ...prev,
        start_time: '',
        end_time: ''
      }));
    }
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>, isStartTime: boolean) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
      const field = isStartTime ? 'startHours' : 'endHours';
      setTimeInputs(prev => ({ ...prev, [field]: value }));
      if (value.length === 2) {
        // Auto-focus to minutes input when 2 digits are entered
        const nextInput = e.target.nextElementSibling?.nextElementSibling as HTMLInputElement;
        if (nextInput) nextInput.focus();
      }
      // Update the actual time slot
      const minutes = isStartTime ? timeInputs.startMinutes : timeInputs.endMinutes;
      const timeField = isStartTime ? 'start_time' : 'end_time';
      setNewTimeSlot(prev => ({
        ...prev,
        [timeField]: value && minutes ? `${value.padStart(2, '0')}:${minutes.padStart(2, '0')}` : ''
      }));
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>, isStartTime: boolean) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
      const field = isStartTime ? 'startMinutes' : 'endMinutes';
      setTimeInputs(prev => ({ ...prev, [field]: value }));
      // Update the actual time slot
      const hours = isStartTime ? timeInputs.startHours : timeInputs.endHours;
      const timeField = isStartTime ? 'start_time' : 'end_time';
      setNewTimeSlot(prev => ({
        ...prev,
        [timeField]: hours && value ? `${hours.padStart(2, '0')}:${value.padStart(2, '0')}` : ''
      }));
    }
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

      // Convert empty arrays to null for database storage
      const stream = streams.find(s => s.name === formData.stream_id);
      const streamId = stream ? stream.id : null;

      // First, try to add the admin user to the users table if not exists
      const { error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // User doesn't exist in users table, so prepare course data without created_by
      const finalFormData = {
        id: formData.code,
        ...formData,
        prerequisites: formData.prerequisites.length === 0 ? null : formData.prerequisites,
        anti_requisites: formData.anti_requisites.length === 0 ? null : formData.anti_requisites,
        schedule: formData.schedule.length === 0 ? null : formData.schedule,
        stream_id: streamId,
        department: formData.stream_id,
        ...(userCheckError ? {} : { created_by: session.user.id, updated_by: session.user.id })
      };

      const { error: insertError } = await supabase
        .from('courses')
        .insert(finalFormData);

      if (insertError) {
        // If the error is specifically about the foreign key constraint
        if (insertError.code === '23503' && insertError.message.includes('courses_created_by_fkey')) {
          toast({
            title: 'Admin User Setup Required',
            description: 'Your admin account needs to be added to the users table first. Please run the admin_user_creation.sql script.',
            status: 'error',
            duration: 8000,
            isClosable: true,
          });
          throw insertError;
        } else {
          throw insertError;
        }
      }

      toast({
        title: 'Course added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/admin/courses/my-courses');
    } catch (error) {
      console.error('Error:', error);
      if (!((error as any)?.code === '23503' && (error as any)?.message?.includes('courses_created_by_fkey'))) {
        toast({
          title: 'Error',
          description: 'Failed to add course',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setSaving(false);
    }
  };

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
            Add New Course
          </Heading>
          <Button
            as="a"
            href="/admin"
            colorScheme="gray"
            leftIcon={<ArrowBackIcon />}
          >
            Back to Dashboard
          </Button>
        </HStack>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Course Code</FormLabel>
              <Input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CSE101"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Course Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to Computer Science"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Credits</FormLabel>
              <NumberInput
                min={1}
                value={formData.credits}
                onChange={(value) => handleNumberInputChange('credits', value)}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Stream</FormLabel>
              <Select
                name="stream_id"
                value={formData.stream_id}
                onChange={handleInputChange}
                placeholder="Select stream"
              >
                {streams.map(stream => (
                  <option key={stream.id} value={stream.name}>
                    {stream.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Semester</FormLabel>
              <NumberInput
                min={1}
                max={8}
                value={formData.semester}
                onChange={(value) => handleNumberInputChange('semester', value)}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Department</FormLabel>
              <Select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Select department"
              >
                {streams.map(stream => (
                  <option key={stream.id} value={stream.name}>
                    {stream.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Instructor</FormLabel>
              <Input
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="e.g., Dr. John Smith"
              />
            </FormControl>

            <FormControl>
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

            <FormControl>
              <FormLabel>Prerequisites</FormLabel>
              <HStack>
                <Input
                  value={prerequisiteInput}
                  onChange={(e) => setPrerequisiteInput(e.target.value)}
                  placeholder="Enter prerequisite course code"
                />
                <IconButton
                  aria-label="Add prerequisite"
                  icon={<AddIcon />}
                  onClick={addPrerequisite}
                  colorScheme="blue"
                />
              </HStack>
              <Box mt={2}>
                {formData.prerequisites.map(prereq => (
                  <Tag
                    key={prereq}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue"
                    m={1}
                  >
                    <Text>{prereq}</Text>
                    <IconButton
                      size="xs"
                      ml={1}
                      icon={<CloseIcon />}
                      aria-label="Remove prerequisite"
                      onClick={() => removePrerequisite(prereq)}
                      variant="ghost"
                      colorScheme="blue"
                    />
                  </Tag>
                ))}
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>Anti-requisites</FormLabel>
              <HStack>
                <Input
                  value={antiRequisiteInput}
                  onChange={(e) => setAntiRequisiteInput(e.target.value)}
                  placeholder="Enter anti-requisite course code"
                />
                <IconButton
                  aria-label="Add anti-requisite"
                  icon={<AddIcon />}
                  onClick={addAntiRequisite}
                  colorScheme="purple"
                />
              </HStack>
              <Box mt={2}>
                {formData.anti_requisites.map(antiReq => (
                  <Tag
                    key={antiReq}
                    size="md"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="purple"
                    m={1}
                  >
                    <Text>{antiReq}</Text>
                    <IconButton
                      size="xs"
                      ml={1}
                      icon={<CloseIcon />}
                      aria-label="Remove anti-requisite"
                      onClick={() => removeAntiRequisite(antiReq)}
                      variant="ghost"
                      colorScheme="purple"
                    />
                  </Tag>
                ))}
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>Schedule</FormLabel>
              <VStack spacing={4}>
                <HStack spacing={4} width="100%">
                  <Select
                    value={newTimeSlot.day}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, day: e.target.value as any }))}
                    width="200px"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </Select>
                  <HStack spacing={1} flex={1}>
                    <Input
                      value={timeInputs.startHours}
                      onChange={(e) => handleHoursChange(e, true)}
                      placeholder="HH"
                      maxLength={2}
                      width="60px"
                      textAlign="center"
                      fontSize="lg"
                    />
                    <Text fontSize="lg" fontWeight="bold">:</Text>
                    <Input
                      value={timeInputs.startMinutes}
                      onChange={(e) => handleMinutesChange(e, true)}
                      placeholder="MM"
                      maxLength={2}
                      width="60px"
                      textAlign="center"
                      fontSize="lg"
                    />
                  </HStack>
                  <HStack spacing={1} flex={1}>
                    <Input
                      value={timeInputs.endHours}
                      onChange={(e) => handleHoursChange(e, false)}
                      placeholder="HH"
                      maxLength={2}
                      width="60px"
                      textAlign="center"
                      fontSize="lg"
                    />
                    <Text fontSize="lg" fontWeight="bold">:</Text>
                    <Input
                      value={timeInputs.endMinutes}
                      onChange={(e) => handleMinutesChange(e, false)}
                      placeholder="MM"
                      maxLength={2}
                      width="60px"
                      textAlign="center"
                      fontSize="lg"
                    />
                  </HStack>
                  <IconButton
                    aria-label="Add time slot"
                    icon={<AddIcon />}
                    onClick={addTimeSlot}
                    colorScheme="green"
                    size="lg"
                  />
                </HStack>
                {formData.schedule.map((slot, index) => (
                  <Grid
                    key={index}
                    templateColumns="200px 1fr auto"
                    gap={4}
                    w="100%"
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                    alignItems="center"
                  >
                    <Text>{slot.day}</Text>
                    <Text textAlign="center">{slot.start_time} - {slot.end_time}</Text>
                    <IconButton
                      size="sm"
                      icon={<CloseIcon />}
                      aria-label="Remove time slot"
                      onClick={() => removeTimeSlot(index)}
                      colorScheme="red"
                      variant="ghost"
                    />
                  </Grid>
                ))}
              </VStack>
            </FormControl>

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

            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              w="100%"
              mt={8}
              bgGradient="linear(to-r, blue.400, purple.500)"
              _hover={{
                bgGradient: "linear(to-r, blue.500, purple.600)",
              }}
            >
              Add Course
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AddCourse; 