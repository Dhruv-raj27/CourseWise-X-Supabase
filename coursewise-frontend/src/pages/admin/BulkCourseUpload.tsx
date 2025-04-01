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
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, ArrowBackIcon } from '@chakra-ui/icons';
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

const BulkCourseUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: string[]; errors: string[] }>({
    success: [],
    errors: [],
  });
  const toast = useToast();
  const borderColor = useColorModeValue('purple.200', 'gray.600');

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

        <Text>
          Upload an Excel file containing multiple courses. The file should have the following columns:
          code, name, credits, stream_id, semester, description, instructor, difficulty, department,
          status, prerequisites (comma-separated), anti_requisites (comma-separated), and schedule (JSON string).
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