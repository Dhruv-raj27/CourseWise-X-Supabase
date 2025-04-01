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
  const borderColor = useColorModeValue('purple.200', 'gray.600');

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([sampleCourse]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'course_upload_template.xlsx');
  };

  const processExcelData = (data: any[]): BulkCourseData[] => {
    return data.map(row => {
      // Parse and sort schedule if it exists
      let schedule: TimeSlot[] = [];
      if (row.schedule) {
        try {
          const parsedSchedule = JSON.parse(row.schedule);
          if (Array.isArray(parsedSchedule)) {
            schedule = parsedSchedule
              .filter(slot => 
                slot.day && 
                slot.start_time && 
                slot.end_time && 
                ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(slot.day)
              )
              .map(slot => ({
                day: slot.day as TimeSlot['day'],
                start_time: slot.start_time,
                end_time: slot.end_time
              }))
              .sort((a, b) => {
                const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return days.indexOf(a.day) - days.indexOf(b.day) || 
                       a.start_time.localeCompare(b.start_time);
              });
          }
        } catch (e) {
          console.error('Error parsing schedule:', e);
          schedule = [];
        }
      }

      return {
        id: row.code,
        code: row.code,
        name: row.name,
        credits: parseInt(row.credits),
        stream_id: row.stream_id,
        semester: parseInt(row.semester),
        description: row.description,
        instructor: row.instructor,
        difficulty: row.difficulty,
        department: row.department,
        status: row.status || 'active',
        prerequisites: row.prerequisites ? row.prerequisites.split(',').map((p: string) => p.trim()) : null,
        anti_requisites: row.anti_requisites ? row.anti_requisites.split(',').map((a: string) => a.trim()) : null,
        schedule
      };
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Get the current session
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

      setUploading(true);
      setProgress(0);
      setResults({ success: [], errors: [] });

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const courses = processExcelData(jsonData).map(course => ({
          ...course,
          created_by: session.user.id,
          updated_by: session.user.id
        }));

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
      };

      reader.readAsArrayBuffer(file);
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