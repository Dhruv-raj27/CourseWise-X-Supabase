import React, { useState, useEffect } from 'react';
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
        .select('id, code, name, credits, description')
        .order('code');

      if (error) throw error;
      setCourses(data || []);
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
          .from('profiles')
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

  // Render the browse view when no course is selected
  const renderBrowseView = () => {
    return (
      <Container maxW="container.xl" py={8}>
        <Card
          mb={8}
          bg="white"
          boxShadow="md"
          borderRadius="xl"
          p={6}
          borderTop="4px solid"
          borderColor="purple.500"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            right={0}
            bg="purple.500"
            w="200px"
            h="200px"
            transform="translate(100px, -100px) rotate(45deg)"
            opacity={0.05}
          />

          <Heading size="lg" mb={6} color="gray.800">Course Reviews</Heading>

          <Text color="gray.700" mb={6}>
            Browse reviews from your peers or add your own review to help others make informed course decisions.
          </Text>

          <FormControl mb={6}>
            <FormLabel fontWeight="semibold">Select a Course to View or Review</FormLabel>
            <Select
              placeholder="Choose a course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              bg="white"
              size="lg"
              borderColor="gray.300"
              _hover={{ borderColor: "gray.400" }}
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code}: {course.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <Flex justify="space-between" wrap="wrap" gap={4}>
            <Button
              leftIcon={<Star />}
              colorScheme="purple"
              size="lg"
              isDisabled={!selectedCourse}
              onClick={() => navigate(`/course-reviews/${selectedCourse}`)}
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              View Course Reviews
            </Button>

            {isAuthenticated ? (
              <Button
                leftIcon={<Plus />}
                colorScheme="green"
                size="lg"
                onClick={onOpen}
                isDisabled={!selectedCourse}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                Write a Review
              </Button>
            ) : (
              <Button
                leftIcon={<User />}
                colorScheme="blue"
                size="lg"
                onClick={() => navigate('/login')}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                Sign in to Review
              </Button>
            )}
          </Flex>
        </Card>

        {/* Review Form Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
          <ModalContent borderRadius="xl" mx={4}>
            <ModalHeader
              borderTopRadius="xl"
              bg="purple.50"
              borderBottom="1px solid"
              borderColor="purple.100"
            >
              <Flex align="center" gap={2}>
                <Star className="text-purple-500" size={20} />
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
      </Container>
    );
  };

  // Render a loading state
  if (loading) {
    return (
      <>
        <NavBar />
        <Box
          minH="calc(100vh - 64px)"
          bg="gray.50"
          bgGradient="linear(to-b, white, gray.50)"
        >
          <Flex direction="column" align="center" justify="center" h="50vh">
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text mt={4}>Loading course reviews...</Text>
      </Flex>
        </Box>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
      <>
        <NavBar />
        <Box
          minH="calc(100vh - 64px)"
          bg="gray.50"
          bgGradient="linear(to-b, white, gray.50)"
        >
          <Container maxW="container.xl" py={8}>
            <Alert status="error" borderRadius="md" mb={6}>
        <AlertIcon />
        {error}
      </Alert>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Box
        minH="calc(100vh - 64px)"
        bg="gray.50"
        bgGradient="linear(to-b, white, gray.50)"
      >
        {!courseId ? (
          renderBrowseView()
        ) : (
          <Container maxW="container.xl" py={8}>
            {/* Back button */}
        <Button 
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/course-reviews')}
              mb={4}
              size="sm"
              colorScheme="gray"
              variant="outline"
            >
              Back to All Courses
        </Button>
        
            {/* Course Header */}
            <Card
              mb={8}
              bg="white"
              boxShadow="md"
              borderRadius="xl"
              p={4}
              borderTop="4px solid"
              borderColor="purple.500"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                right={0}
                bg="purple.500"
                w="150px"
                h="150px"
                transform="translate(75px, -75px) rotate(45deg)"
                opacity={0.1}
              />
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <Box>
                    <HStack mb={2}>
                      <BookOpen size={24} color="#805AD5" />
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
        </Box>
        
                  <Box bg="purple.50" p={4} borderRadius="lg">
                    <StatGroup mb={4}>
                      <Stat>
                        <StatLabel fontSize="sm" fontWeight="medium" color="gray.600">
                          Average Rating
                        </StatLabel>
                        <Flex align="center">
                          <StatNumber fontSize="2xl" fontWeight="bold" color="purple.600">
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
                          <StatNumber fontSize="2xl" fontWeight="bold" color="purple.600">
                            {stats.totalReviews}
                          </StatNumber>
                          <Icon as={ThumbsUp} w={5} h={5} ml={2} color="purple.400" />
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
                              bg="purple.500"
                            />
                          ))}
                        </AvatarGroup>
          </Box>
                    )}
      </Box>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Filter & Sort Controls */}
      <Flex 
        justify="space-between" 
              align="center"
        mb={6} 
              bg="white"
              p={4}
              borderRadius="lg"
              boxShadow="sm"
              flexDir={{ base: "column", md: "row" }}
              gap={{ base: 4, md: 0 }}
            >
              <HStack spacing={4}>
        <Select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
                  maxW="200px"
                  size="md"
                  variant="filled"
                  bg="gray.100"
                  _hover={{ bg: "gray.200" }}
                  icon={<Filter size={14} />}
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
                  variant="filled"
                  bg="gray.100"
                  _hover={{ bg: "gray.200" }}
                  placeholder="All Difficulties"
                  icon={<Filter size={14} />}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
        </Select>
              </HStack>

              <Button
                onClick={onOpen}
                colorScheme="purple"
                size="md"
                leftIcon={<Plus size={18} />}
                isDisabled={!isAuthenticated || hasUserReviewed}
                fontWeight="bold"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                {hasUserReviewed ? "You've Already Reviewed" : "Write a Review"}
              </Button>
      </Flex>

      {/* Reviews list */}
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
              <Card
                p={8}
                textAlign="center"
                borderRadius="lg"
                bg="white"
                boxShadow="md"
                borderTop="4px solid"
                borderColor="purple.200"
              >
                <VStack spacing={4}>
                  <Icon as={Info} w={12} h={12} color="purple.400" />
                  <Heading size="md" color="gray.700">
                    No Reviews Yet
                  </Heading>
                  <Text color="gray.600">
                    Be the first to share your experience with this course!
          </Text>
                  {isAuthenticated ? (
            <Button 
              onClick={onOpen}
                      colorScheme="purple"
                      leftIcon={<Plus size={16} />}
                      isDisabled={hasUserReviewed}
                    >
                      {hasUserReviewed ? "You've Already Reviewed" : "Add Review"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/login')}
                      colorScheme="purple"
                      variant="outline"
                      leftIcon={<User size={16} />}
                    >
                      Sign in to review
            </Button>
          )}
                </VStack>
              </Card>
      )}

            {/* Review Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
              <ModalContent borderRadius="xl" mx={4}>
                <ModalHeader
                  borderTopRadius="xl"
                  bg="purple.50"
                  borderBottom="1px solid"
                  borderColor="purple.100"
                >
                  <Flex align="center" gap={2}>
                    <Star className="text-purple-500" size={20} />
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
          </Container>
        )}
    </Box>
    </>
  );
};

export default CourseReviews; 