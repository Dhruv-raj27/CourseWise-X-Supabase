import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  Button,
  useToast,
  Spinner,
  useColorModeValue,
  Badge,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  description: string;
  instructor: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  status: 'active' | 'inactive' | 'archived';
  prerequisites: string[];
  anti_requisites: string[];
  schedule: {
    day: string;
    start_time: string;
    end_time: string;
  }[];
  created_at: string;
  updated_at: string;
}

interface Stream {
  id: string;
  name: string;
}

const StreamCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const borderColor = useColorModeValue('purple.200', 'gray.600');

  useEffect(() => {
    const fetchStreamCourses = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const streamId = searchParams.get('streamId');

        if (!streamId) {
          toast({
            title: 'Error',
            description: 'No stream specified',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/admin/streams');
          return;
        }

        // Fetch stream details
        const { data: streamData, error: streamError } = await supabase
          .from('streams')
          .select('*')
          .eq('id', streamId)
          .single();

        if (streamError) throw streamError;
        setStream(streamData);

        // Fetch courses for the stream
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('stream_id', streamId)
          .order('semester')
          .order('code');

        if (coursesError) throw coursesError;
        setCourses(coursesData || []);
      } catch (error) {
        console.error('Error fetching stream courses:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch courses',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStreamCourses();
  }, [location.search, navigate, toast]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'yellow';
      case 'archived': return 'red';
      default: return 'gray';
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
            {stream?.name || 'Stream'} Courses
          </Heading>
          <Button
            as="a"
            href="/admin/streams"
            colorScheme="gray"
            leftIcon={<ArrowBackIcon />}
          >
            Back to Streams
          </Button>
        </HStack>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Course Code</Th>
                <Th>Name</Th>
                <Th>Semester</Th>
                <Th>Credits</Th>
                <Th>Status</Th>
                <Th>Last Updated</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.map((course) => (
                <Tr key={course.id}>
                  <Td>{course.code}</Td>
                  <Td>{course.name}</Td>
                  <Td>{course.semester}</Td>
                  <Td>{course.credits}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </Td>
                  <Td>{new Date(course.updated_at).toLocaleDateString()}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit course"
                        icon={<EditIcon />}
                        size="sm"
                        colorScheme="blue"
                        onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                      />
                      <IconButton
                        aria-label="Delete course"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => {/* TODO: Implement delete functionality */}}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
    </Box>
  );
};

export default StreamCourses; 