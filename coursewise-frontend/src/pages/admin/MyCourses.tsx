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
  Badge,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabase';

interface Course {
  id: string;
  code: string;
  name: string;
  created_at: string;
  status: 'active' | 'inactive' | 'archived';
  instructor: string;
}

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const borderColor = useColorModeValue('purple.200', 'gray.600');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
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
        .select('id, code, name, created_at, status, instructor')
        .eq('created_by', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'yellow';
      case 'archived':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            My Added Courses
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

        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : courses.length === 0 ? (
          <Text textAlign="center" fontSize="lg" color="gray.500">
            No courses added yet
          </Text>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>Instructor</Th>
                <Th>Status</Th>
                <Th>Added On</Th>
              </Tr>
            </Thead>
            <Tbody>
              {courses.map((course) => (
                <Tr key={course.id}>
                  <Td fontWeight="medium">{course.code}</Td>
                  <Td>{course.name}</Td>
                  <Td>{course.instructor}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(course.status)}>
                      {course.status}
                    </Badge>
                  </Td>
                  <Td>{formatDate(course.created_at)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
    </Box>
  );
};

export default MyCourses; 