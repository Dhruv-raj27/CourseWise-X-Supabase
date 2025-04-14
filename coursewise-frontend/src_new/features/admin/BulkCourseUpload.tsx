import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  useToast,
  Text,
  Progress,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Input,
  HStack,
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  start_time: string;
  end_time: string;
}

interface BulkCourseData {
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
  { id: 'f5725c05-12ff-49f2-99f0-78235ccd08d3', name: 'Computer Science and Design' },
  { id: 'f3ff5d00-fe29-42c2-bbce-ea45c4cfa7bc', name: 'Computer Science and Biosciences' }  
];

// Update the sample course with detailed instructions
const sampleCourse = {
  code: "CS101", // REQUIRED: Course code (uppercase letters and numbers only)
  name: "Introduction to Computer Science", // REQUIRED: Course name (any case)
  credits: 4, // REQUIRED: Number between 1-8
  stream_id: "1160d7a4-30ef-4d8c-ab41-0e6317560dc3", // REQUIRED: Use exact UUID from below
  semester: 1, // REQUIRED: Number between 1-8
  description: "An introductory course to computer science fundamentals", // Optional: Course description
  instructor: "Dr. John Doe", // Optional: Instructor name
  difficulty: "Medium", // Optional: Must be exactly 'Easy', 'Medium', or 'Hard' (case-sensitive)
  department: "", // LEAVE EMPTY: Will be auto-filled based on stream_id
  status: "active", // Optional: Must be exactly 'active', 'inactive', or 'archived' (lowercase)
  prerequisites: "MATH101,PHY101", // Optional: Comma-separated course codes (uppercase)
  anti_requisites: "CS102,CS103", // Optional: Comma-separated course codes (uppercase)
  schedule: JSON.stringify([ // Optional: Must be valid JSON with exact format
    {
      "day": "Monday", // Must be exactly: Monday, Tuesday, Wednesday, Thursday, Friday, or Saturday
      "start_time": "09:00", // 24-hour format (HH:MM)
      "end_time": "10:30" // 24-hour format (HH:MM)
    },
    {
      "day": "Wednesday",
      "start_time": "09:00",
      "end_time": "10:30"
    }
  ])
};

// Add stream information as a separate sheet
const streamInfo = {
  stream_id: "Available Stream IDs (Copy exactly as shown)",
  name: "Stream Name",
  "f757bad9-202e-44fc-8158-de439d8dbefe": "All",
  "1160d7a4-30ef-4d8c-ab41-0e6317560dc3": "Computer Science and AI",
  "5fc95cf3-e817-47c2-9c28-7a54f0f7e62a": "Computer Science and Engineering",
  "63957879-1c1e-4797-b7df-fba74c54fd00": "Electronics & Communication Engineering",
  "7f05302c-9b18-466f-875b-b820d532514c": "Computer Science and Social Sciences",
  "f5725c05-12ff-49f2-99f0-78235ccd08d3": "Computer Science and Design",
  "f3ff5d00-fe29-42c2-bbce-ea45c4cfa7bc": "Computer Science and Biosciences"
};

const downloadTemplate = () => {
  // Create main template sheet
  const ws = XLSX.utils.json_to_sheet([sampleCourse]);
  
  // Add formatting and column widths
  ws['!cols'] = [
    { wch: 10 }, // code
    { wch: 40 }, // name
    { wch: 8 },  // credits
    { wch: 40 }, // stream_id
    { wch: 10 }, // semester
    { wch: 60 }, // description
    { wch: 20 }, // instructor
    { wch: 10 }, // difficulty
    { wch: 40 }, // department
    { wch: 10 }, // status
    { wch: 30 }, // prerequisites
    { wch: 30 }, // anti_requisites
    { wch: 100 } // schedule
  ];

  // Create stream info sheet
  const wsStreams = XLSX.utils.json_to_sheet([streamInfo]);
  wsStreams['!cols'] = [
    { wch: 40 }, // stream_id
    { wch: 40 }  // name
  ];

  // Create workbook with both sheets
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.utils.book_append_sheet(wb, wsStreams, 'Stream IDs');

  // Add some styling
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFE0E0E0" } }
    };
  }

  XLSX.writeFile(wb, 'course_upload_template.xlsx');
};

// Add these validation functions before the BulkCourseUpload component
const validateStreamId = (streamId: string): string | null => {
  const validStream = STREAMS.find(s => s.id === streamId);
  return validStream ? null : 'Invalid stream ID. Please use a valid UUID from the streams list.';
};

const validateSchedule = (scheduleStr: string): string | null => {
  try {
    const schedule = JSON.parse(scheduleStr);
    if (!Array.isArray(schedule)) {
      return 'Schedule must be an array of time slots';
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    for (const slot of schedule) {
      if (!validDays.includes(slot.day)) {
        return `Invalid day in schedule: ${slot.day}. Must be one of: ${validDays.join(', ')}`;
      }
      if (!timeRegex.test(slot.start_time) || !timeRegex.test(slot.end_time)) {
        return `Invalid time format in schedule. Use 24-hour format (HH:MM)`;
      }
    }
    return null;
  } catch (error) {
    return 'Invalid JSON format in schedule. Please check the format.';
  }
};

const validatePrerequisites = (prereqs: string): string | null => {
  if (!prereqs) return null;
  const courses = prereqs.split(',').map(p => p.trim());
  if (courses.some(c => !c)) {
    return 'Invalid prerequisites format. Course codes should be comma-separated without empty values.';
  }
  return null;
};

const validateCourseData = (row: any, index: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!row.code) errors.push('Course code is required');
  if (!row.name) errors.push('Course name is required');
  if (!row.stream_id) errors.push('Stream ID is required');
  if (!row.semester) errors.push('Semester is required');

  // Field validations
  if (row.credits && (isNaN(row.credits) || row.credits < 0)) {
    errors.push('Credits must be a positive number');
  }

  if (row.semester && (isNaN(row.semester) || row.semester < 1 || row.semester > 8)) {
    errors.push('Semester must be between 1 and 8');
  }

  if (row.difficulty && !['Easy', 'Medium', 'Hard', null].includes(row.difficulty)) {
    errors.push('Difficulty must be Easy, Medium, Hard, or empty');
  }

  if (row.status && !['active', 'inactive', 'archived'].includes(row.status)) {
    errors.push('Status must be active, inactive, or archived');
  }

  const streamError = validateStreamId(row.stream_id);
  if (streamError) errors.push(streamError);

  if (row.schedule) {
    const scheduleError = validateSchedule(row.schedule);
    if (scheduleError) errors.push(scheduleError);
  }

  if (row.prerequisites) {
    const prereqError = validatePrerequisites(row.prerequisites);
    if (prereqError) errors.push(prereqError);
  }

  if (row.anti_requisites) {
    const antiReqError = validatePrerequisites(row.anti_requisites);
    if (antiReqError) errors.push(antiReqError);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(error => `Row ${index + 2}: ${error}`)
  };
};

const BulkCourseUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: string[]; errors: string[] }>({
    success: [],
    errors: [],
  });
  const [streams, setStreams] = useState<Array<{ id: string; name: string }>>([]);
  const toast = useToast();
  const navigate = useNavigate();
  const borderColor = useColorModeValue('purple.200', 'gray.600');

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

  // Update the validateStreamId function to use dynamic streams
  const validateStreamId = (streamId: string): string | null => {
    const validStream = streams.find(s => s.id === streamId);
    return validStream ? null : 'Invalid stream ID. Please use a valid UUID from the streams list.';
  };

  // Update the streamInfo object to use dynamic streams
  const getStreamInfo = () => {
    const info: any = {
      stream_id: "Available Stream IDs (Copy exactly as shown)",
      name: "Stream Name"
    };
    
    streams.forEach(stream => {
      info[stream.id] = stream.name;
    });

    return info;
  };

  const downloadTemplate = () => {
    // Create main template sheet with sample course
    const ws = XLSX.utils.json_to_sheet([sampleCourse]);
    
    // Add formatting and column widths
    ws['!cols'] = [
      { wch: 10 }, // code
      { wch: 40 }, // name
      { wch: 8 },  // credits
      { wch: 40 }, // stream_id
      { wch: 10 }, // semester
      { wch: 60 }, // description
      { wch: 20 }, // instructor
      { wch: 10 }, // difficulty
      { wch: 40 }, // department
      { wch: 10 }, // status
      { wch: 30 }, // prerequisites
      { wch: 30 }, // anti_requisites
      { wch: 100 } // schedule
    ];

    // Create stream info sheet with dynamic streams
    const wsStreams = XLSX.utils.json_to_sheet([getStreamInfo()]);
    wsStreams['!cols'] = [
      { wch: 40 }, // stream_id
      { wch: 40 }  // name
    ];

    // Create workbook with both sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.utils.book_append_sheet(wb, wsStreams, 'Stream IDs');

    // Add some styling
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFE0E0E0" } }
      };
    }

    XLSX.writeFile(wb, 'course_upload_template.xlsx');
  };

  const processExcelData = async (data: any[], userId: string) => {
    const validationResults = data.map((row, index) => validateCourseData(row, index));
    const allErrors = validationResults.flatMap(result => result.errors);
    
    if (allErrors.length > 0) {
      throw new Error(`Validation errors found:\n${allErrors.join('\n')}`);
    }

    const processedData = data.map(row => {
      // Process prerequisites and anti-requisites
      const prerequisites = row.prerequisites ? row.prerequisites.split(',').map((p: string) => p.trim()) : null;
      const antiRequisites = row.anti_requisites ? row.anti_requisites.split(',').map((a: string) => a.trim()) : null;

      // Process schedule if it exists
      let schedule: TimeSlot[] | null = null;
      if (row.schedule) {
        try {
          const parsedSchedule = JSON.parse(row.schedule);
          if (Array.isArray(parsedSchedule)) {
            schedule = parsedSchedule.map(slot => ({
              day: slot.day,
              start_time: slot.start_time,
              end_time: slot.end_time
            }));
          }
        } catch (error) {
          console.error('Error parsing schedule:', error);
          schedule = null;
        }
      }

      // Find stream by UUID and get its name for department
      const stream = streams.find(s => s.id === row.stream_id);
      const department = stream ? stream.name : 'All';

      return {
        id: row.code,
        code: row.code,
        name: row.name,
        credits: parseInt(row.credits) || null,
        stream_id: row.stream_id || null,
        semester: parseInt(row.semester) || null,
        description: row.description || null,
        instructor: row.instructor || null,
        difficulty: row.difficulty || null,
        department: department,
        status: row.status || 'active',
        prerequisites,
        anti_requisites: antiRequisites,
        schedule,
        created_by: userId,
        updated_by: userId
      };
    });

    return processedData;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResults({ success: [], errors: [] });

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

      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const courses = await processExcelData(jsonData, session.user.id);

      const batchSize = 50;
      const batches = Math.ceil(courses.length / batchSize);

      for (let i = 0; i < courses.length; i += batchSize) {
        const batch = courses.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('courses')
          .insert(batch)
          .select();

        if (error) {
          batch.forEach(course => {
            setResults(prev => ({
              ...prev,
              errors: [...prev.errors, `Failed to add ${course.code}: ${error.message}`]
            }));
          });
        } else {
          batch.forEach(course => {
            setResults(prev => ({
              ...prev,
              success: [...prev.success, `Successfully added ${course.code}`]
            }));
          });
        }

        setProgress(((i + batch.length) / courses.length) * 100);
      }

      toast({
        title: 'Upload Complete',
        description: `Successfully added ${results.success.length} courses with ${results.errors.length} errors`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading courses:', error);
      toast({
        title: 'Validation Error',
        description: error instanceof Error ? error.message : 'An error occurred while validating courses',
        status: 'error',
        duration: 10000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box p={8} maxWidth="1200px" mx="auto" bgGradient="linear(to-br, purple.50, blue.50)">
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
            Bulk Course Upload
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

        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Upload Format Instructions</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack align="stretch" spacing={4}>
                <Text>
                  Download the template below and fill in your course data following these guidelines:
                </Text>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Field</Th>
                      <Th>Format</Th>
                      <Th>Example</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>code</Td>
                      <Td>String</Td>
                      <Td>CS101</Td>
                    </Tr>
                    <Tr>
                      <Td>credits</Td>
                      <Td>Number</Td>
                      <Td>4</Td>
                    </Tr>
                    <Tr>
                      <Td>stream_id</Td>
                      <Td>UUID</Td>
                      <Td>Get from streams table</Td>
                    </Tr>
                    <Tr>
                      <Td>difficulty</Td>
                      <Td>String</Td>
                      <Td>Easy, Medium, or Hard</Td>
                    </Tr>
                    <Tr>
                      <Td>status</Td>
                      <Td>String</Td>
                      <Td>active, inactive, or archived</Td>
                    </Tr>
                    <Tr>
                      <Td>prerequisites</Td>
                      <Td>Comma-separated</Td>
                      <Td>MATH101,PHY101</Td>
                    </Tr>
                    <Tr>
                      <Td>schedule</Td>
                      <Td>JSON string</Td>
                      <Td>See template</Td>
                    </Tr>
                  </Tbody>
                </Table>
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  onClick={downloadTemplate}
                  size="sm"
                >
                  Download Template
                </Button>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Text>
          Upload an Excel file containing multiple courses. Make sure to follow the template format.
        </Text>

        <Button
          as="label"
          htmlFor="file-upload"
          colorScheme="purple"
          size="lg"
          cursor="pointer"
          isLoading={uploading}
        >
          Choose Excel File
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            display="none"
            title="Upload Excel File"
            aria-label="Upload Excel File"
          />
        </Button>

        {uploading && (
          <Progress
            value={progress}
            size="sm"
            colorScheme="purple"
            hasStripe
            isAnimated
          />
        )}

        {(results.success.length > 0 || results.errors.length > 0) && (
          <VStack align="stretch" spacing={4}>
            {results.success.length > 0 && (
              <List spacing={2}>
                {results.success.map((msg, i) => (
                  <ListItem key={i}>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    {msg}
                  </ListItem>
                ))}
              </List>
            )}

            {results.errors.length > 0 && (
              <List spacing={2}>
                {results.errors.map((msg, i) => (
                  <ListItem key={i} color="red.500">
                    <ListIcon as={WarningIcon} color="red.500" />
                    {msg}
                  </ListItem>
                ))}
              </List>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default BulkCourseUpload; 