import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Divider,
  Badge,
  useColorModeValue,
  useDisclosure,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Select,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { ChevronLeft, Star, SlidersHorizontal, ArrowDownUp } from 'lucide-react';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/contexts/AuthContext';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department?: string;
  faculty?: string;
}

interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  review: string;
  semester: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    full_name: string;
    profile_picture_url: string;
  };
  course: Course;
}

const CourseReviews: React.FC = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  
  useEffect(() => {
    fetchCourses();
    if (courseId) {
      fetchCourseDetails();
      fetchReviews();
    } else {
      // If no courseId, fetch all reviews
      fetchAllReviews();
    }
  }, [courseId]);
  
  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name, credits, department, faculty')
        .order('code', { ascending: true });
      
      if (error) throw error;
      setAllCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error fetching courses',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const fetchCourseDetails = async () => {
    if (!courseId) return;
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, code, name, credits, department, faculty')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast({
        title: 'Error fetching course details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const fetchReviews = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      // Simple query for reviews only
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
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get user info
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, full_name, profile_picture_url')
          .in('id', data.map(review => review.user_id));
          
        if (userError) throw userError;
        
        // Get course info
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, code, name, credits')
          .in('id', data.map(review => review.course_id));
          
        if (courseError) throw courseError;
        
        // Match the data manually
        const transformedData = data.map(review => ({
          ...review,
          semester: parseInt(review.semester as string, 10),
          user: userData?.find(u => u.id === review.user_id) || { 
            id: review.user_id, 
            full_name: 'Unknown User',
            profile_picture_url: ''
          },
          course: courseData?.find(c => c.id === review.course_id) || {
            id: review.course_id,
            code: 'Unknown',
            name: 'Unknown Course',
            credits: 0
          }
        })) as Review[];
        
        setReviews(transformedData);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error fetching reviews',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      // Simple query for reviews only
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
        .order('created_at', { ascending: false })
        .limit(50); // Limit to recent reviews
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get user info
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, full_name, profile_picture_url')
          .in('id', data.map(review => review.user_id));
          
        if (userError) throw userError;
        
        // Get course info
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id, code, name, credits')
          .in('id', data.map(review => review.course_id));
          
        if (courseError) throw courseError;
        
        // Match the data manually
        const transformedData = data.map(review => ({
          ...review,
          semester: parseInt(review.semester as string, 10),
          user: userData?.find(u => u.id === review.user_id) || { 
            id: review.user_id, 
            full_name: 'Unknown User',
            profile_picture_url: ''
          },
          course: courseData?.find(c => c.id === review.course_id) || {
            id: review.course_id,
            code: 'Unknown',
            name: 'Unknown Course',
            credits: 0
          }
        })) as Review[];
        
        setReviews(transformedData);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      toast({
        title: 'Error fetching reviews',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitReview = async (reviewData: any) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'You must be logged in to submit a review',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .insert([
          {
            course_id: reviewData.course_id,
            user_id: user.id,
            rating: reviewData.rating,
            difficulty: reviewData.difficulty,
            review: reviewData.review,
            semester: parseInt(reviewData.semester.toString(), 10),
            tags: reviewData.tags,
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: 'Review submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onClose();
      
      // Refresh reviews
      if (courseId) {
        fetchReviews();
      } else {
        fetchAllReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error submitting review',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  // Filter and sort reviews
  const filteredAndSortedReviews = () => {
    let filtered = [...reviews];
    
    // Apply filters
    if (ratingFilter !== null) {
      filtered = filtered.filter(review => review.rating === ratingFilter);
    }
    
    if (difficultyFilter) {
      filtered = filtered.filter(review => review.difficulty === difficultyFilter);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    return filtered;
  };
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1) 
    : 'N/A';
  
  // Count reviews by difficulty
  const difficultyCount = {
    Easy: reviews.filter(r => r.difficulty === 'Easy').length,
    Medium: reviews.filter(r => r.difficulty === 'Medium').length,
    Hard: reviews.filter(r => r.difficulty === 'Hard').length,
  };
  
  const resetFilters = () => {
    setRatingFilter(null);
    setDifficultyFilter(null);
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

    // Since review_helpful table doesn't exist, just show a message to the user
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
        
        // Update the local state
        setHelpfulReviews(prev => prev.filter(id => id !== reviewId));
        
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
        
        // Update the local state
        setHelpfulReviews(prev => [...prev, reviewId]);

        toast({
          title: 'Marked as helpful',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
      
      // Refresh reviews to update counts
      if (courseId) {
        fetchReviews();
      } else {
        fetchAllReviews();
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
  
  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <Flex mb={6} align="center">
          <Button
            leftIcon={<ChevronLeft size={16} />}
            variant="ghost"
            onClick={goBack}
            mr={4}
          >
            Back
          </Button>
          
          <Box>
            {course ? (
              <>
                <Heading size="lg">{course.code}: {course.name}</Heading>
                <Text color="gray.600" fontSize="md">Course Reviews</Text>
              </>
            ) : courseId ? (
              <Skeleton height="60px" width="300px" />
            ) : (
              <Heading size="lg">All Course Reviews</Heading>
            )}
          </Box>
          
          <Box ml="auto">
            <Button 
              colorScheme="amber" 
              onClick={onOpen}
              disabled={!isAuthenticated}
            >
              Write a Review
            </Button>
          </Box>
        </Flex>
        
        {course && (
          <Flex 
            bg={cardBgColor}
            p={5}
            borderRadius="lg"
            shadow="sm"
            mb={6}
            direction={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <Box flex={1}>
              <Text fontSize="lg" fontWeight="bold" mb={1}>Course Rating</Text>
              <Flex align="center" mb={2}>
                <Text fontSize="3xl" fontWeight="bold" mr={2}>{averageRating}</Text>
                <HStack spacing={1}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < parseInt(averageRating) ? "orange.400" : "none"}
                      stroke={i < parseInt(averageRating) ? "orange.400" : "gray.400"}
                    />
                  ))}
                </HStack>
                <Text fontSize="sm" ml={2} color="gray.500">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </Text>
              </Flex>
              <Text fontSize="sm" color="gray.600">
                Department: {course.department}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Credits: {course.credits}
              </Text>
            </Box>
            
            <Divider orientation="vertical" />
            
            <Box flex={1}>
              <Text fontSize="lg" fontWeight="bold" mb={2}>Difficulty Breakdown</Text>
              <HStack spacing={4}>
                <Badge colorScheme="green" px={2} py={1}>
                  Easy: {difficultyCount.Easy}
                </Badge>
                <Badge colorScheme="orange" px={2} py={1}>
                  Medium: {difficultyCount.Medium}
                </Badge>
                <Badge colorScheme="red" px={2} py={1}>
                  Hard: {difficultyCount.Hard}
                </Badge>
              </HStack>
            </Box>
          </Flex>
        )}
        
        {/* Filters and Sorting */}
        <Flex 
          justify="space-between" 
          align="center" 
          mb={4}
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 2, md: 0 }}
        >
          <Text fontSize="lg" fontWeight="medium">
            {filteredAndSortedReviews().length} {filteredAndSortedReviews().length === 1 ? 'Review' : 'Reviews'}
          </Text>
          
          <HStack spacing={4}>
            <Button
              leftIcon={<SlidersHorizontal size={16} />}
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              Filters
            </Button>
            
            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<ArrowDownUp size={16} />}
                variant="outline"
                size="sm"
              >
                {sortOption === 'newest' && 'Newest First'}
                {sortOption === 'oldest' && 'Oldest First'}
                {sortOption === 'highest' && 'Highest Rated'}
                {sortOption === 'lowest' && 'Lowest Rated'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setSortOption('newest')}>Newest First</MenuItem>
                <MenuItem onClick={() => setSortOption('oldest')}>Oldest First</MenuItem>
                <MenuItem onClick={() => setSortOption('highest')}>Highest Rated</MenuItem>
                <MenuItem onClick={() => setSortOption('lowest')}>Lowest Rated</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Filter options */}
        {filtersOpen && (
          <Box 
            bg={cardBgColor} 
            p={4} 
            borderRadius="md" 
            shadow="sm" 
            mb={4}
          >
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              gap={4} 
              justify="space-between"
            >
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Rating</Text>
                <HStack spacing={2}>
                  {[1, 2, 3, 4, 5].map(rating => (
                    <Button
                      key={rating}
                      size="xs"
                      variant={ratingFilter === rating ? "solid" : "outline"}
                      colorScheme={ratingFilter === rating ? "amber" : "gray"}
                      onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                    >
                      {rating} ★
                    </Button>
                  ))}
                </HStack>
              </Box>
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Difficulty</Text>
                <HStack spacing={2}>
                  <Button
                    size="xs"
                    variant={difficultyFilter === 'Easy' ? "solid" : "outline"}
                    colorScheme={difficultyFilter === 'Easy' ? "green" : "gray"}
                    onClick={() => setDifficultyFilter(difficultyFilter === 'Easy' ? null : 'Easy')}
                  >
                    Easy
                  </Button>
                  <Button
                    size="xs"
                    variant={difficultyFilter === 'Medium' ? "solid" : "outline"}
                    colorScheme={difficultyFilter === 'Medium' ? "orange" : "gray"}
                    onClick={() => setDifficultyFilter(difficultyFilter === 'Medium' ? null : 'Medium')}
                  >
                    Medium
                  </Button>
                  <Button
                    size="xs"
                    variant={difficultyFilter === 'Hard' ? "solid" : "outline"}
                    colorScheme={difficultyFilter === 'Hard' ? "red" : "gray"}
                    onClick={() => setDifficultyFilter(difficultyFilter === 'Hard' ? null : 'Hard')}
                  >
                    Hard
                  </Button>
                </HStack>
              </Box>
              
              <Box alignSelf="flex-end">
                <Button size="sm" variant="ghost" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </Box>
            </Flex>
          </Box>
        )}
        
        {/* Reviews */}
        {loading ? (
          <VStack spacing={4} align="stretch">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height="200px" />
            ))}
          </VStack>
        ) : filteredAndSortedReviews().length > 0 ? (
          <VStack spacing={4} align="stretch">
            {filteredAndSortedReviews().map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onHelpfulClick={handleHelpfulClick}
                isHelpful={false} // Always false since we don't have a review_helpful table
              />
            ))}
          </VStack>
        ) : (
          <Box 
            textAlign="center" 
            py={10} 
            bg={cardBgColor} 
            borderRadius="lg"
            shadow="sm"
          >
            <Text fontSize="lg" mb={4}>No reviews available</Text>
            <Button colorScheme="amber" onClick={onOpen}>
              Be the first to review
            </Button>
          </Box>
        )}
      </Container>
      
      {/* Review Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {courseId 
              ? `Write a Review for ${course?.code || 'this course'}`
              : 'Write a Course Review'
            }
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ReviewForm 
              courses={allCourses}
              initialCourseId={courseId || null}
              onSubmit={handleSubmitReview}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CourseReviews; 