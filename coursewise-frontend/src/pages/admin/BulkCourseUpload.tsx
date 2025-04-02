import React, { useState } from 'react';
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
  { id: 'f5725c05-12ff-49f2-99f0-78235ccd08d3', name: 'Computer Science and Design' }
];

// Sample course data format
const sampleCourse = {
  code: "CS101",
  name: "Introduction to Computer Science",
  credits: 4,
  stream_id: "stream_uuid_here", // You'll need to get this from your streams table
  semester: 1,
  description: "An introductory course to computer science fundamentals",
  instructor: "Dr. John Doe",
  difficulty: "Medium", // Can be: Easy, Medium, Hard
  department: "Computer Science",
  status: "active", // Can be: active, inactive, archived
  prerequisites: "MATH101,PHY101", // Comma-separated course codes
  anti_requisites: "CS102,CS103", // Comma-separated course codes
  schedule: JSON.stringify([
    {
      day: "Monday",
      start_time: "09:00",
      end_time: "10:30"
    },
    {
      day: "Wednesday",
      start_time: "09:00",
      end_time: "10:30"
    }
  ])
};

const BulkCourseUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: string[]; errors: string[] }>({
    success: [],
    errors: [],
  });
  const toast = useToast();
  const navigate = useNavigate();
  const borderColor = useColorModeValue('purple.200', 'gray.600');

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([sampleCourse]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'course_upload_template.xlsx');
  };

  const processExcelData = async (data: any[], userId: string) => {
    const processedData = data.map(row => {
      // Process prerequisites and anti-requisites
      const prerequisites = row.prerequisites ? row.prerequisites.split(',').map((p: string) => p.trim()) : null;
      const antiRequisites = row.anti_requisites ? row.anti_requisites.split(',').map((a: string) => a.trim()) : null;

      // Process schedule if it exists
      let schedule = null;
      if (row.schedule) {
        try {
          schedule = JSON.parse(row.schedule);
          if (Array.isArray(schedule)) {
            schedule = schedule.map(slot => ({
              day: slot.day,
              start_time: slot.start_time,
              end_time: slot.end_time
            })).sort((a, b) => {
              const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              return days.indexOf(a.day) - days.indexOf(b.day) || 
                     a.start_time.localeCompare(b.start_time);
            });
          }
        } catch (error) {
          console.error('Error parsing schedule:', error);
          schedule = null;
        }
      }

      // Find stream ID from name
      const stream = STREAMS.find(s => s.name === row.stream_id);
      const streamId = stream ? stream.id : null;

      // Use stream name as department
      const department = stream?.name || 'All';

      return {
        id: row.code,
        code: row.code,
        name: row.name,
        credits: parseInt(row.credits),
        stream_id: streamId,
        semester: parseInt(row.semester),
        description: row.description,
        instructor: row.instructor,
        difficulty: row.difficulty,
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
        title: 'Error',
        description: 'Failed to process file',
        status: 'error',
        duration: 5000,
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