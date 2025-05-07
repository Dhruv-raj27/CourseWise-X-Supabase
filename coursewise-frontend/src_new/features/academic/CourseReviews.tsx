import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Spinner,
  useToast,
  Card,
  CardBody,
  SimpleGrid,
  Select,
  VStack,
  HStack,
  Icon,
  Badge,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Tooltip,
  Avatar,
  AvatarGroup,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  IconButton,
  Grid,
} from '@chakra-ui/react';
import {
  Star,
  BookOpen,
  ArrowLeft,
  Plus,
  User,
  ThumbsUp,
  Info,
  Filter,
  Calendar,
  Flag,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/contexts/AuthContext';
import NavBar from '../shared/NavBar';
import ReviewCard, { Review } from './components/ReviewCard';
import ReviewForm, { ReviewFormData } from './components/ReviewForm';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  stream?: { name: string };
  semester?: number;
}

interface CourseStats {
  averageRating: number;
  totalReviews: number;
  difficultyBreakdown: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

const CourseReviews: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    averageRating: 0,
    totalReviews: 0,
    difficultyBreakdown: {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    },
  });
  const [viewMode, setViewMode] = useState<'list' | 'streams' | 'semesters'>('list');

  // Group courses by stream
  const coursesByStream = useMemo(() => {
    const grouped: { [key: string]: Course[] } = {};
    
    courses.forEach(course => {
      // Fetch stream info from the API or use a default
      const streamName = course.stream?.name || 'Uncategorized';
      if (!grouped[streamName]) {
        grouped[streamName] = [];
      }
      grouped[streamName].push(course);
    });
    
    return grouped;
  }, [courses]);

  // Group courses by semester
  const coursesBySemester = useMemo(() => {
    const grouped: { [key: number]: Course[] } = {};
    
    courses.forEach(course => {
      const semester = course.semester || 0;
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(course);
    });
    
    return Object.entries(grouped)
      .sort(([semA], [semB]) => parseInt(semA) - parseInt(semB))
      .map(([semester, courses]) => ({
        semester: parseInt(semester),
        courses
      }));
  }, [courses]);

  // Fetch course data on initial load
  useEffect(() => {
    if (!courseId) {
      fetchAllCourses();
    } else {
    fetchCourseAndReviews();
    }
  }, [courseId]);

  // Check if selectedCourse changes and navigate appropriately
  useEffect(() => {
    if (selectedCourse && !courseId) {
      navigate(`/course-reviews/${selectedCourse}`);
    }
  }, [selectedCourse]);

  // Check if the user has already reviewed the course
  useEffect(() => {
    if (isAuthenticated && user && reviews.length > 0) {
      const userReview = reviews.find((review) => review.user_id === user.id);
      setHasUserReviewed(!!userReview);
    }
  }, [user, reviews, isAuthenticated]);

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, 
          code, 
          name, 
          credits, 
          description,
          semester,
          stream:stream_id (
            id,
            name
          )
        `)
        .order('code');

      if (error) throw error;
      setCourses((data || []).map(course => ({
        ...course,
        stream: course.stream?.[0] ? { name: course.stream[0].name } : undefined
      })));
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHelpfulReviews = async () => {
    if (!isAuthenticated || !user) return;

    // Initialize empty array - no review_helpful table exists
    setHelpfulReviews([]);
  };

  const fetchCourseAndReviews = async () => {
    setLoading(true);
    setError('');

      if (!courseId) {
        setLoading(false);
        return;
      }

    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Initialize helpful reviews as an empty array
      setHelpfulReviews([]);

      // Fetch course reviews
      const { data, error } = await supabase
        .from('course_reviews')
        .select(`
          id, 
          course_id, 
          user_id, 
          rating, 
          difficulty, 
          review, 
          semester, 
          tags, 
          created_at, 
          updated_at
        `)
        .eq('course_id', courseId);

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get user info
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, full_name, profile_picture_url')
          .in('id', data.map(review => review.user_id));
          
        if (userError) throw userError;

        // Transform the data
        const formattedReviews = data.map((review) => ({
        ...review,
          user: userData?.find(u => u.id === review.user_id) || {
            id: review.user_id, 
            full_name: 'Unknown User',
            profile_picture_url: ''
          },
          course: courseData,
          helpful_count: 0 // Since review_helpful doesn't exist
      }));

      setReviews(formattedReviews);

      // Calculate stats
        calculateStats(formattedReviews);
      } else {
        setReviews([]);
        // Reset stats for no reviews
        setStats({
          averageRating: 0,
          totalReviews: 0,
          difficultyBreakdown: {
            Easy: 0,
            Medium: 0,
            Hard: 0,
          },
        });
      }
    } catch (error: any) {
      console.error('Error fetching course data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviews: Review[]) => {
    if (!reviews.length) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        difficultyBreakdown: {
          Easy: 0,
          Medium: 0,
          Hard: 0,
        },
      });
      return;
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avgRating = totalRating / reviews.length;

    const difficultyCount = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
    };

    reviews.forEach((review) => {
      if (review.difficulty) {
          difficultyCount[review.difficulty]++;
      }
        });
        
        setStats({
          averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length,
      difficultyBreakdown: difficultyCount,
    });
  };

  const handleSubmitReview = async (formData: ReviewFormData) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit a review',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      // Check if user has already reviewed this course
      if (courseId) {
        const { data: existingReview, error: checkError } = await supabase
          .from('course_reviews')
          .select('id')
          .eq('course_id', courseId)
          .eq('user_id', user.id);

        if (checkError) throw checkError;

        if (existingReview && existingReview.length > 0) {
      toast({
            title: 'Review already exists',
            description: 'You have already reviewed this course',
            status: 'warning',
            duration: 3000,
        isClosable: true,
      });
          setSubmitting(false);
      return;
        }
    }

      // Format the data for submission
      const reviewData = {
        course_id: courseId || formData.course_id,
        user_id: user.id,
        rating: formData.rating,
        difficulty: formData.difficulty,
        review: formData.review,
        semester: formData.semester,
        tags: formData.tags,
      };

      // Submit the review
      const { error } = await supabase.from('course_reviews').insert([reviewData]);

      if (error) throw error;

      toast({
        title: 'Review submitted',
        description: 'Your review has been submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the reviews
      if (!courseId) {
        await fetchAllCourses();
      } else {
        await fetchCourseAndReviews();
      }
      onClose();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error submitting review',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to mark reviews as helpful',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Since review_helpful table doesn't exist, show a message and do nothing
    toast({
      title: 'Feature not available',
      description: 'Marking reviews as helpful is not available at this time.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    // This would be the implementation if the review_helpful table existed
    /*
    try {
      const isAlreadyHelpful = helpfulReviews.includes(reviewId);

      if (isAlreadyHelpful) {
        // Remove the helpful mark
        const { error } = await supabase
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        if (error) throw error;

        setHelpfulReviews((prev) => prev.filter((id) => id !== reviewId));
        
        // Update the reviews array
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? { ...review, helpful_count: Math.max(0, (review.helpful_count || 0) - 1) }
              : review
          )
        );

        toast({
          title: 'Removed helpful mark',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Add helpful mark
        const { error } = await supabase.from('review_helpful').insert([
          {
            review_id: reviewId,
            user_id: user.id,
          },
        ]);

        if (error) throw error;

        setHelpfulReviews((prev) => [...prev, reviewId]);

        // Update the reviews array
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? { ...review, helpful_count: (review.helpful_count || 0) + 1 }
              : review
          )
        );

        toast({
          title: 'Marked as helpful',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error('Error updating helpful status:', error);
      toast({
        title: 'Error updating helpful status',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    */
  };

  const handleReportClick = (reviewId: string) => {
    // For now, just show a toast message that the review has been reported
    toast({
      title: 'Review reported',
      description: 'Thank you for reporting this review. We will look into it.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const sortReviews = (reviews: Review[]) => {
    const sortedReviews = [...reviews];
    
    switch (sortBy) {
      case 'recent':
        return sortedReviews.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return sortedReviews.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'highest':
        return sortedReviews.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sortedReviews.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return sortedReviews.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
      default:
        return sortedReviews;
    }
  };

  const filterReviews = (reviews: Review[]) => {
    if (!filterDifficulty) return reviews;
    
    return reviews.filter(review => review.difficulty === filterDifficulty);
  };

  // Simple helper to get course details when needed
  const fetchCourseDetails = async () => {
    if (!courseId) return;
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name, credits, description')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      setCourse(data);
    } catch (error: any) {
      console.error('Error fetching course details:', error);
      toast({
        title: 'Error fetching course details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update render browse view to include classification tabs
  const renderBrowseView = () => {
    return (
      <Flex direction="column" gap={6}>
        {/* Header section */}
        <Box className="bg-white rounded-xl shadow-md p-8">
          <Flex direction={['column', 'row']} justify="space-between" align={['flex-start', 'center']} gap={4}>
            <Flex direction={['column', 'row']} align={['flex-start', 'center']} gap={4}>
              <Box className="p-3 bg-blue-100 rounded-lg">
                <Star size={30} className="text-blue-600" />
              </Box>
              <Box>
                <Heading size="lg" mb={1}>Course Reviews</Heading>
                <Text color="gray.600">Browse and read reviews or share your own experiences</Text>
              </Box>
            </Flex>
            
            <Button
              leftIcon={<Box as="span" className="rotate-180 inline-block"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></Box>}
              colorScheme="blue"
              variant="outline"
              onClick={() => navigate('/academic-tools')}
              size="sm"
            >
              Back to Tools
            </Button>
          </Flex>
        </Box>
        
        {/* Filters and search */}
        <Box className="bg-white rounded-xl shadow-lg p-6">
          <Flex direction={['column', 'row']} gap={4} mb={6} wrap="wrap">
            <Flex flex={1} position="relative">
            <Select
                placeholder="Select a course..."
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
                bg="gray.50"
                borderColor="gray.200"
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
            >
                {courses.map((course) => (
                <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                </option>
              ))}
            </Select>
            </Flex>
          </Flex>

          <Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <HStack spacing={2}>
              <Text color="gray.500" fontSize="sm" fontWeight="medium">View by:</Text>
            <Button
                size="sm" 
                variant={viewMode === 'list' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                onClick={() => setViewMode('list')}
              >
                List
            </Button>
              <Button
                size="sm"
                variant={viewMode === 'streams' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'streams' ? 'blue' : 'gray'}
                onClick={() => setViewMode('streams')}
              >
                Streams
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'semesters' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'semesters' ? 'blue' : 'gray'}
                onClick={() => setViewMode('semesters')}
              >
                Semesters
              </Button>
            </HStack>
            
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              Found {courses.length} course{courses.length !== 1 ? 's' : ''}
            </Text>
          </Flex>
        </Box>
        
        {/* Course listings */}
        <Box className="bg-white rounded-xl shadow-lg p-6">
          {viewMode === 'list' && (
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
              gap={6}
            >
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </Grid>
          )}
          
          {viewMode === 'streams' && (
            <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
              <TabList overflowX="auto" py={2} className="flex-nowrap whitespace-nowrap">
                {Object.keys(coursesByStream).map((streamName) => (
                  <Tab key={streamName} px={4}>
                    {streamName} ({coursesByStream[streamName].length})
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {Object.entries(coursesByStream).map(([streamName, streamCourses]) => (
                  <TabPanel key={streamName} px={0}>
                    <Grid
                      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                      gap={6}
                    >
                      {streamCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </Grid>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          )}
          
          {viewMode === 'semesters' && (
            <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
              <TabList overflowX="auto" py={2} className="flex-nowrap whitespace-nowrap">
                {coursesBySemester.map(({semester, courses}) => (
                  <Tab key={semester} px={4}>
                    Semester {semester} ({courses.length})
                  </Tab>
                ))}
              </TabList>
              <TabPanels>
                {coursesBySemester.map(({semester, courses: semesterCourses}) => (
                  <TabPanel key={semester} px={0}>
                    <Grid
                      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                      gap={6}
                    >
                      {semesterCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </Grid>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          )}
        </Box>

        {/* Review Form Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
          <ModalContent borderRadius="xl" mx={4}>
            <ModalHeader
              borderTopRadius="xl"
              bg="blue.50"
              borderBottom="1px solid"
              borderColor="blue.100"
            >
              <Flex align="center" gap={2}>
                <Star className="text-blue-500" size={20} />
                <Text>Write a Review</Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              <ReviewForm
                courses={courses}
                initialCourseId={selectedCourse}
                onSubmit={handleSubmitReview}
                isSubmitting={submitting}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    );
  };

  // Add a CourseCard component for displaying course information
  const CourseCard = ({ course }: { course: Course }) => {
    return (
      <Box
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 relative"
        onClick={() => navigate(`/course-reviews/${course.id}`)}
        cursor="pointer"
      >
        {/* Color strip at the top based on semester */}
        <Box 
          h="6px" 
          w="100%" 
          className={`bg-gradient-to-r ${
            course?.semester ? 
              (course.semester <= 2 ? 'from-green-400 to-green-500' :
               course.semester <= 4 ? 'from-blue-400 to-blue-500' :
               course.semester <= 6 ? 'from-purple-400 to-purple-500' :
               'from-red-400 to-red-500') :
              'from-blue-400 to-blue-500' // Default if semester is not defined
          }`}
        />
        
        <Box p={5}>
          <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box>
              <Badge 
                colorScheme={
                  course?.semester ? 
                    (course.semester <= 2 ? 'green' :
                     course.semester <= 4 ? 'blue' :
                     course.semester <= 6 ? 'purple' :
                     'red') :
                    'blue'  // Default color if semester is not defined
                }
                rounded="full"
                px={2}
                py={0.5}
                fontSize="xs"
              >
                Semester {course?.semester || 'N/A'}
              </Badge>
              <Badge 
                ml={2}
                colorScheme="gray"
                variant="subtle"
                rounded="full"
                px={2}
                py={0.5}
                fontSize="xs"
              >
                {course.credits} credit{course.credits !== 1 ? 's' : ''}
              </Badge>
            </Box>
            
            <IconButton
              aria-label="View reviews"
              icon={<Star size={18} />}
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/course-reviews/${course.id}`);
              }}
            />
      </Flex>
          
          <Heading 
            size="md" 
            mb={1} 
            noOfLines={1} 
            title={course.name}
            className="text-gray-800"
          >
            {course.name}
          </Heading>
          
          <Text 
            fontSize="sm" 
            color="gray.500" 
            fontFamily="mono" 
            mb={4}
          >
            {course.code}
          </Text>
          
          <Text 
            fontSize="sm" 
            color="gray.600" 
            noOfLines={2} 
            mb={4}
            title={course.description || "No description available"}
          >
            {course.description || "No description available"}
          </Text>
          
          {course.stream?.name && (
            <Flex align="center" gap={1.5} mb={4}>
              <BookOpen size={14} className="text-gray-400" />
              <Text fontSize="xs" color="gray.600">
                {course.stream.name}
              </Text>
            </Flex>
          )}
          
          <Divider mb={4} />
          
          <Button
            size="sm"
            width="full"
            colorScheme="blue"
            variant="outline"
            leftIcon={<BookOpen size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/course-reviews/${course.id}`);
            }}
          >
            View Reviews
          </Button>
        </Box>
      </Box>
    );
  };

  // Render the browse view when no course is selected
  if (loading && !courseId) {
    return (
      <>
        <NavBar />
        <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-16">
          <Box maxW="1200px" margin="0 auto" p={[4, 6, 8]}>
            <Flex justify="center" align="center" h="400px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          </Box>
        </Box>
      </>
    );
  }

  // Render error state
  if (error && !courseId) {
    return (
      <>
        <NavBar />
        <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-16">
          <Box maxW="1200px" margin="0 auto" p={[4, 6, 8]}>
            <Box className="bg-white rounded-xl shadow-md p-6">
              <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pb-16">
        <Box maxW="1200px" margin="0 auto" p={[4, 6, 8]}>
        {!courseId ? (
          renderBrowseView()
        ) : (
            <>
              {loading ? (
                <Flex justify="center" py={12}>
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : error ? (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              ) : (
                <Flex direction="column" gap={6}>
                  {/* Header with back buttons */}
                  <Box className="bg-white rounded-xl shadow-md p-6">
                    <Flex justify="space-between" align="center">
        <Button 
              leftIcon={<ArrowLeft size={16} />}
                        colorScheme="blue"
                        variant="outline"
              size="sm"
                        onClick={() => navigate('/course-reviews')}
                      >
                        Back to Course List
                      </Button>
                      
                      <Button
                        leftIcon={<Box as="span" className="rotate-180 inline-block"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></Box>}
                        colorScheme="blue"
              variant="outline"
                        size="sm"
                        onClick={() => navigate('/academic-tools')}
            >
                        Back to Tools
        </Button>
                    </Flex>
                  </Box>
        
                  {/* Course details */}
                  <Box className="bg-white rounded-xl shadow-lg p-6">
                    <Box
              position="relative"
              overflow="hidden"
            >
                      {/* Color strip at the top based on semester */}
                      <Box 
                        h="6px" 
                        w="100%" 
                        mb={4}
                        className={`bg-gradient-to-r ${
                          course?.semester ? 
                            (course.semester <= 2 ? 'from-green-400 to-green-500' :
                             course.semester <= 4 ? 'from-blue-400 to-blue-500' :
                             course.semester <= 6 ? 'from-purple-400 to-purple-500' :
                             'from-red-400 to-red-500') :
                            'from-blue-400 to-blue-500' // Default if semester is not defined
                        }`}
                      />
                      
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <Box>
                    <HStack mb={2}>
                            <BookOpen size={24} color="#3182CE" />
                      <Heading size="lg" fontWeight="bold" color="gray.800">
                        {course?.name || 'Course Reviews'}
                      </Heading>
                    </HStack>

                    {course?.code && (
                      <Text fontSize="md" color="gray.600" mb={2}>
                        {course.code}
                      </Text>
                    )}

                    {course?.description && (
                      <Text color="gray.600" mt={2}>
                        {course.description}
                      </Text>
                    )}
                          
                          {course?.stream?.name && (
                            <Flex align="center" gap={1.5} mt={4}>
                              <BookOpen size={14} className="text-gray-400" />
                              <Text fontWeight="medium" color="gray.600">
                                Stream: {course.stream.name}
                              </Text>
                            </Flex>
                    )}
        </Box>
        
                        <Box bg="blue.50" p={4} borderRadius="lg">
                    <StatGroup mb={4}>
                      <Stat>
                        <StatLabel fontSize="sm" fontWeight="medium" color="gray.600">
                          Average Rating
                        </StatLabel>
                        <Flex align="center">
                                <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
                            {stats.averageRating}
                          </StatNumber>
                          <Icon as={Star} w={6} h={6} ml={1} color="yellow.400" fill="yellow.400" />
      </Flex>
                      </Stat>

            <Stat>
                        <StatLabel fontSize="sm" fontWeight="medium" color="gray.600">
                          Total Reviews
                        </StatLabel>
                        <Flex align="center">
                                <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
                            {stats.totalReviews}
                          </StatNumber>
                                <Icon as={ThumbsUp} w={5} h={5} ml={2} color="blue.400" />
              </Flex>
            </Stat>
          </StatGroup>

                    <Heading size="sm" color="gray.700" mb={2}>
                      Difficulty Breakdown
                    </Heading>
                    <SimpleGrid columns={3} gap={2}>
                      <Box bg="green.50" p={2} borderRadius="md" textAlign="center">
                        <Text fontWeight="bold" color="green.600">
                          {stats.difficultyBreakdown.Easy}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Easy
                        </Text>
                      </Box>
                      <Box bg="orange.50" p={2} borderRadius="md" textAlign="center">
                        <Text fontWeight="bold" color="orange.600">
                          {stats.difficultyBreakdown.Medium}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Medium
                        </Text>
                      </Box>
                      <Box bg="red.50" p={2} borderRadius="md" textAlign="center">
                        <Text fontWeight="bold" color="red.600">
                          {stats.difficultyBreakdown.Hard}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          Hard
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {stats.totalReviews > 0 && (
                      <Box mt={4}>
                        <Text fontSize="sm" fontWeight="medium" color="gray.600">
                          Recent Reviewers
                        </Text>
                        <AvatarGroup size="sm" max={5} mt={1}>
                          {reviews.slice(0, 5).map((review) => (
                            <Avatar
                              key={review.id}
                              name={review.user.full_name}
                              src={review.user.profile_picture_url}
                                    bg="blue.500"
                            />
                          ))}
                        </AvatarGroup>
          </Box>
                    )}
      </Box>
                </SimpleGrid>
                    </Box>
                  </Box>

            {/* Filter & Sort Controls */}
                  <Box 
                    className="bg-white rounded-xl shadow-md p-6"
                  >
      <Flex 
        justify="space-between" 
              align="center"
              flexDir={{ base: "column", md: "row" }}
              gap={{ base: 4, md: 0 }}
            >
              <HStack spacing={4}>
        <Select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
                  maxW="200px"
                  size="md"
                          bg="gray.50"
                          borderColor="gray.200"
                          _hover={{ bg: "gray.100" }}
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
                  <option value="helpful">Most Helpful</option>
                </Select>

                <Select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  maxW="200px"
                  size="md"
                          bg="gray.50"
                          borderColor="gray.200"
                          _hover={{ bg: "gray.100" }}
                          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                  placeholder="All Difficulties"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
        </Select>
              </HStack>

              <Button
                onClick={onOpen}
                        colorScheme="blue"
                leftIcon={<Plus size={18} />}
                isDisabled={!isAuthenticated || hasUserReviewed}
                fontWeight="bold"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                {hasUserReviewed ? "You've Already Reviewed" : "Write a Review"}
              </Button>
      </Flex>
                  </Box>

      {/* Reviews list */}
                  <Box className="bg-white rounded-xl shadow-lg p-6">
            {reviews.length > 0 ? (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {filterReviews(sortReviews(reviews)).map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onHelpfulClick={handleHelpfulClick}
                    onReportClick={handleReportClick}
                    isHelpful={helpfulReviews.includes(review.id)}
                  />
                ))}
              </SimpleGrid>
            ) : (
                      <Flex 
                        direction="column" 
                        align="center" 
                        justify="center" 
                p={8}
                textAlign="center"
                      >
                        <Box p={4} bg="blue.50" rounded="full" mb={4}>
                          <Icon as={Info} w={12} h={12} color="blue.400" />
                        </Box>
                        <Heading size="md" color="gray.700" mb={2}>
                    No Reviews Yet
                  </Heading>
                        <Text color="gray.600" mb={6}>
                    Be the first to share your experience with this course!
          </Text>
                  {isAuthenticated ? (
            <Button 
              onClick={onOpen}
                            colorScheme="blue"
                      leftIcon={<Plus size={16} />}
                      isDisabled={hasUserReviewed}
                    >
                      {hasUserReviewed ? "You've Already Reviewed" : "Add Review"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/login')}
                            colorScheme="blue"
                      variant="outline"
                      leftIcon={<User size={16} />}
                    >
                      Sign in to review
            </Button>
          )}
                      </Flex>
      )}
                  </Box>

            {/* Review Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
              <ModalContent borderRadius="xl" mx={4}>
                <ModalHeader
                  borderTopRadius="xl"
                        bg="blue.50"
                  borderBottom="1px solid"
                        borderColor="blue.100"
                >
                  <Flex align="center" gap={2}>
                          <Star className="text-blue-500" size={20} />
                    <Text>Write a Review</Text>
                  </Flex>
                </ModalHeader>
          <ModalCloseButton />
                <ModalBody py={6}>
            <ReviewForm 
                    courses={[]}
                    initialCourseId={courseId}
              onSubmit={handleSubmitReview} 
                    isSubmitting={submitting}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
                </Flex>
              )}
            </>
        )}
        </Box>
    </Box>
    </>
  );
};

export default CourseReviews; 