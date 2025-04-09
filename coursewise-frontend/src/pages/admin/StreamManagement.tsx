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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FaEye } from 'react-icons/fa';
import { format } from 'date-fns';

interface Stream {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  stream_id: string;
  created_at: string;
  updated_at: string;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MM/dd/yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

const StreamManagement: React.FC = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const borderColor = useColorModeValue('purple.200', 'gray.600');
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState<Stream | null>(null);
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [selectedStreamCourses, setSelectedStreamCourses] = useState<Course[]>([]);
  const [selectedStreamName, setSelectedStreamName] = useState('');
  const [selectedStreamId, setSelectedStreamId] = useState('');
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      
      // First, get all streams with proper ordering
      const { data: streamsData, error: streamsError } = await supabase
        .from('streams')
        .select('*')
        .order('name', { ascending: true });

      if (streamsError) throw streamsError;
      if (!streamsData) throw new Error('No streams data received');

      // Then, get detailed course information for each stream
      const streamsWithDetails = await Promise.all(
        streamsData.map(async (stream) => {
          // Get courses for the stream
          const { data: streamCourses, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .eq('stream_id', stream.id);

          if (coursesError) {
            console.error(`Error fetching courses for stream ${stream.id}:`, coursesError);
            return {
              ...stream,
              total_courses: 0,
              active_courses: 0,
              archived_courses: 0
            };
          }

          // Calculate counts
          const total = streamCourses?.length || 0;
          const active = streamCourses?.filter(c => c.status === 'active').length || 0;
          const archived = streamCourses?.filter(c => c.status === 'archived').length || 0;

          return {
            ...stream,
            total_courses: total,
            active_courses: active,
            archived_courses: archived
          };
        })
      );

      setStreams(streamsWithDetails);
    } catch (error) {
      console.error('Error fetching streams:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch streams. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCourseCounts = async () => {
    try {
      setUpdating(true);
      
      // Simply refresh the streams data to update counts
      await fetchStreams();
      
      toast({
        title: 'Success',
        description: 'Course counts updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating course counts:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course counts. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEditStream = (stream: Stream) => {
    setEditingStream(stream);
    setIsEditModalOpen(true);
  };

  const handleDeleteStream = (stream: Stream) => {
    setStreamToDelete(stream);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStream) return;

    try {
      const { error } = await supabase
        .from('streams')
        .update({ 
          name: editingStream.name,
          description: editingStream.description
        })
        .eq('id', editingStream.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stream updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await fetchStreams();
    } catch (error) {
      console.error('Error updating stream:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stream',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsEditModalOpen(false);
      setEditingStream(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!streamToDelete) return;

    try {
      // Check if stream has any courses
      const { count } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('stream_id', streamToDelete.id);

      if (count && count > 0) {
        toast({
          title: 'Cannot Delete',
          description: 'Stream has associated courses. Please remove or reassign courses first.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const { error } = await supabase
        .from('streams')
        .delete()
        .eq('id', streamToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stream deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchStreams();
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete stream',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteModalOpen(false);
      setStreamToDelete(null);
    }
  };

  const fetchStreamCourses = async (streamId: string, streamName: string) => {
    try {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('stream_id', streamId)
        .order('name');

      if (error) throw error;

      setSelectedStreamCourses(courses || []);
      setSelectedStreamName(streamName);
      setSelectedStreamId(streamId);
      setIsCoursesModalOpen(true);
    } catch (error) {
      console.error('Error fetching stream courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', deletingCourse.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Course deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the courses list and stream data
      await fetchStreamCourses(selectedStreamId, selectedStreamName);
      await fetchStreams();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteCourseModalOpen(false);
      setDeletingCourse(null);
    }
  };

  const handleViewCourses = (streamId: string, streamName: string) => {
    fetchStreamCourses(streamId, streamName);
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          name: editingCourse.name,
          description: editingCourse.description,
          status: editingCourse.status,
          stream_id: editingCourse.stream_id
        })
        .eq('id', editingCourse.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Course updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // If the stream was changed, close the courses modal
      if (editingCourse.stream_id !== selectedStreamId) {
        setIsCoursesModalOpen(false);
      } else {
        // Otherwise, refresh the current stream's courses
        await fetchStreamCourses(selectedStreamId, selectedStreamName);
      }

      // Refresh the streams data to update counts
      await fetchStreams();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: 'Failed to update course',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsEditCourseModalOpen(false);
      setEditingCourse(null);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  return (
    <>
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
              Stream Management
            </Heading>
            <HStack>
              <Button
                colorScheme="blue"
                onClick={updateCourseCounts}
                isLoading={updating}
                loadingText="Updating..."
              >
                Update Course Counts
              </Button>
              <Button
                as="a"
                href="/admin"
                colorScheme="gray"
                leftIcon={<ArrowBackIcon />}
              >
                Back to Dashboard
              </Button>
            </HStack>
          </HStack>

          {loading ? (
            <Spinner size="xl" />
          ) : (
            <Table variant="simple" borderWidth="1px" borderColor={borderColor}>
              <Thead>
                <Tr>
                  <Th>STREAM NAME</Th>
                  <Th>COURSE STATISTICS</Th>
                  <Th>CREATED AT</Th>
                  <Th>DESCRIPTION</Th>
                  <Th>ACTIONS</Th>
                </Tr>
              </Thead>
              <Tbody>
                {streams.map((stream) => (
                  <Tr key={stream.id}>
                    <Td>{stream.name}</Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Badge colorScheme="blue">TOTAL: {stream.total_courses}</Badge>
                        <Badge colorScheme="green">ACTIVE: {stream.active_courses}</Badge>
                        <Badge colorScheme="gray">ARCHIVED: {stream.archived_courses}</Badge>
                      </VStack>
                    </Td>
                    <Td>
                      <Text>Created: {formatDate(stream.created_at)}</Text>
                    </Td>
                    <Td>
                      <Text>{stream.description}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="View courses"
                          icon={<FaEye />}
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleViewCourses(stream.id, stream.name)}
                        />
                        <IconButton
                          aria-label="Edit stream"
                          icon={<EditIcon />}
                          colorScheme="yellow"
                          variant="ghost"
                          onClick={() => handleEditStream(stream)}
                        />
                        <IconButton
                          aria-label="Delete stream"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteStream(stream)}
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

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Stream</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Stream Name</FormLabel>
                <Input
                  value={editingStream?.name || ''}
                  onChange={(e) => setEditingStream(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={editingStream?.description || ''}
                  onChange={(e) => setEditingStream(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveEdit}>
              Save
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <AlertDialog
        isOpen={isDeleteModalOpen}
        leastDestructiveRef={undefined}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Stream
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{streamToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Courses Modal */}
      <Modal 
        isOpen={isCoursesModalOpen} 
        onClose={() => setIsCoursesModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between" align="center" width="100%">
              <Text>Courses in {selectedStreamName}</Text>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => {
                  setIsCoursesModalOpen(false);
                  navigate('/admin/courses');
                }}
              >
                Manage All Courses
              </Button>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {selectedStreamCourses.map((course) => (
                  <Tr key={course.id}>
                    <Td>{course.name}</Td>
                    <Td>{course.description}</Td>
                    <Td>
                      <Badge
                        colorScheme={course.status === 'active' ? 'green' : 'gray'}
                      >
                        {course.status.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit course"
                          icon={<EditIcon />}
                          colorScheme="yellow"
                          variant="ghost"
                          onClick={() => {
                            setIsCoursesModalOpen(false);
                            navigate(`/admin/courses/edit/${course.id}`);
                          }}
                        />
                        <IconButton
                          aria-label="Delete course"
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => {
                            setDeletingCourse(course);
                            setIsDeleteCourseModalOpen(true);
                          }}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {selectedStreamCourses.length === 0 && (
              <Text textAlign="center" py={4} color="gray.500">
                No courses found in this stream
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Course Confirmation Modal */}
      <AlertDialog
        isOpen={isDeleteCourseModalOpen}
        leastDestructiveRef={undefined}
        onClose={() => setIsDeleteCourseModalOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Course
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{deletingCourse?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setIsDeleteCourseModalOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteCourse} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Quick Edit Course Modal - For Stream and Status Changes Only */}
      <Modal 
        isOpen={isEditCourseModalOpen} 
        onClose={() => setIsEditCourseModalOpen(false)}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Quick Edit - {editingCourse?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.500">
                For detailed course editing (professor, syllabus, etc.), please use the full course editor.
              </Text>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <select
                  value={editingCourse?.status || 'active'}
                  onChange={(e) => setEditingCourse(prev => prev ? { ...prev, status: e.target.value as 'active' | 'archived' } : null)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                  aria-label="Course Status"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </FormControl>
              <FormControl>
                <FormLabel>Stream</FormLabel>
                <select
                  value={editingCourse?.stream_id || ''}
                  onChange={(e) => setEditingCourse(prev => prev ? { ...prev, stream_id: e.target.value } : null)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                  aria-label="Course Stream"
                >
                  {streams.map(stream => (
                    <option key={stream.id} value={stream.id}>
                      {stream.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <Button
                width="100%"
                colorScheme="blue"
                onClick={() => navigate(`/admin/edit-course/${editingCourse?.id}`)}
              >
                Open Full Course Editor
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditCourse}>
              Save Changes
            </Button>
            <Button onClick={() => setIsEditCourseModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default StreamManagement; 