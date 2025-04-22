import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  Select,
  RadioGroup,
  Radio,
  HStack,
  Flex,
  VStack,
  Text,
  Badge,
  Tag,
  TagLabel,
  TagCloseButton,
  SimpleGrid,
  IconButton,
  InputGroup,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import { Star, Plus, X, AlertTriangle } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
}

export interface ReviewFormData {
  course_id: string;
  rating: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | '';
  review: string;
  semester: number | '';
  tags: string[];
}

interface ReviewFormProps {
  courses: Course[];
  initialCourseId?: string | null;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  courses,
  initialCourseId = null,
  onSubmit,
  isSubmitting = false
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<ReviewFormData>({
    course_id: initialCourseId || '',
    rating: 0,
    difficulty: '',
    review: '',
    semester: '',
    tags: []
  });
  
  const [newTag, setNewTag] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ReviewFormData, string>>>({});
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Update course_id when initialCourseId changes
  useEffect(() => {
    if (initialCourseId) {
      setFormData(prev => ({ ...prev, course_id: initialCourseId }));
    }
  }, [initialCourseId]);

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (formErrors.rating) {
      setFormErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const handleDifficultyChange = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    setFormData(prev => ({ ...prev, difficulty }));
    if (formErrors.difficulty) {
      setFormErrors(prev => ({ ...prev, difficulty: '' }));
    }
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const semesterValue = e.target.value ? parseInt(e.target.value, 10) : '';
    setFormData(prev => ({ ...prev, semester: semesterValue }));
    if (formErrors.semester) {
      setFormErrors(prev => ({ ...prev, semester: '' }));
    }
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, review: e.target.value }));
    if (formErrors.review) {
      setFormErrors(prev => ({ ...prev, review: '' }));
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, course_id: e.target.value }));
    if (formErrors.course_id) {
      setFormErrors(prev => ({ ...prev, course_id: '' }));
    }
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    // Check if tag already exists
    if (formData.tags.includes(newTag.trim())) {
      toast({
        title: 'Tag already exists',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    // Limit the number of tags
    if (formData.tags.length >= 5) {
      toast({
        title: 'Maximum 5 tags allowed',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const addSuggestedTag = (tag: string) => {
    if (formData.tags.includes(tag)) {
      toast({
        title: 'Tag already exists',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    if (formData.tags.length >= 5) {
      toast({
        title: 'Maximum 5 tags allowed',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, tag]
    }));
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ReviewFormData, string>> = {};
    
    if (!formData.course_id) {
      errors.course_id = 'Please select a course';
    }
    
    if (formData.rating === 0) {
      errors.rating = 'Please provide a rating';
    }
    
    if (!formData.difficulty) {
      errors.difficulty = 'Please select a difficulty level';
    }
    
    if (!formData.review.trim()) {
      errors.review = 'Please provide a review';
    } else if (formData.review.length < 20) {
      errors.review = 'Review should be at least 20 characters';
    }
    
    if (formData.semester === '') {
      errors.semester = 'Please select a semester';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await onSubmit(formData);
        // Reset form after successful submission
        setFormData({
          course_id: initialCourseId || '',
          rating: 0,
          difficulty: '',
          review: '',
          semester: '',
          tags: []
        });
      } catch (error) {
        console.error('Error submitting review:', error);
      }
    } else {
      toast({
        title: 'Form Validation Error',
        description: 'Please fill in all required fields correctly',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Common tag suggestions
  const tagSuggestions = [
    'Helpful',
    'Interesting',
    'Challenging',
    'Easy A',
    'Time-consuming',
    'Group projects',
    'Essay-heavy',
    'Exam-heavy',
    'Good professor',
    'Poor materials'
  ];

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      {courses.length > 1 && (
        <FormControl mb={5} isRequired isInvalid={!!formErrors.course_id}>
          <FormLabel fontWeight="semibold">Course</FormLabel>
          <Select
            name="course_id"
            value={formData.course_id}
            onChange={handleCourseChange}
            placeholder="Select a course"
            bg="white"
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
          {formErrors.course_id && (
            <FormErrorMessage>{formErrors.course_id}</FormErrorMessage>
          )}
        </FormControl>
      )}
      
      <FormControl mb={6} isRequired isInvalid={!!formErrors.rating}>
        <FormLabel fontWeight="semibold">Your Rating</FormLabel>
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between" px={2}>
            <Text fontSize="xs" fontWeight="medium" color="gray.500">Poor</Text>
            <Text fontSize="xs" fontWeight="medium" color="gray.500">Excellent</Text>
          </HStack>
          <Flex 
            justify="space-between" 
            bg="gray.50" 
            p={3} 
            borderRadius="md"
            borderWidth="1px"
            borderColor={formErrors.rating ? "red.500" : "gray.200"}
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <Flex 
                key={rating} 
                direction="column" 
                align="center"
                onClick={() => handleRatingChange(rating)}
                cursor="pointer"
                transition="all 0.2s"
                transform={formData.rating === rating ? "scale(1.15)" : "scale(1)"}
              >
                <Star
                  size={32}
                  fill={rating <= formData.rating ? "#F6AD55" : "none"}
                  stroke={rating <= formData.rating ? "#ED8936" : "gray"}
                  strokeWidth={1.5}
                />
                <Text 
                  fontSize="xs" 
                  mt={1}
                  fontWeight={formData.rating === rating ? "bold" : "normal"}
                  color={formData.rating === rating ? "orange.500" : "gray.600"}
                >
                  {rating}
                </Text>
              </Flex>
            ))}
          </Flex>
          
          {formData.rating > 0 && (
            <Badge 
              alignSelf="center" 
              colorScheme={
                formData.rating >= 4 ? "green" : 
                formData.rating >= 3 ? "blue" : 
                formData.rating >= 2 ? "orange" : "red"
              }
              px={2}
              py={1}
              borderRadius="full"
              mt={1}
            >
              {getRatingLabel(formData.rating)}
            </Badge>
          )}
          
          {formErrors.rating && (
            <FormErrorMessage>{formErrors.rating}</FormErrorMessage>
          )}
        </VStack>
      </FormControl>
      
      <FormControl mb={6} isRequired isInvalid={!!formErrors.difficulty}>
        <FormLabel fontWeight="semibold">Difficulty</FormLabel>
        <SimpleGrid columns={3} spacing={4}>
          {['Easy', 'Medium', 'Hard'].map((difficulty) => {
            const isSelected = formData.difficulty === difficulty;
            let bgColor = "gray.50";
            let borderColor = formErrors.difficulty ? "red.500" : "gray.200";
            let textColor = "gray.700";
            
            if (isSelected) {
              if (difficulty === 'Easy') {
                bgColor = "green.50";
                borderColor = formErrors.difficulty ? "red.500" : "green.300";
                textColor = "green.700";
              } else if (difficulty === 'Medium') {
                bgColor = "orange.50";
                borderColor = formErrors.difficulty ? "red.500" : "orange.300";
                textColor = "orange.700";
              } else if (difficulty === 'Hard') {
                bgColor = "red.50";
                borderColor = formErrors.difficulty ? "red.500" : "red.300";
                textColor = "red.700";
              }
            }
            
            return (
              <Box 
                key={difficulty}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                bg={bgColor}
                borderColor={borderColor}
                cursor="pointer"
                onClick={() => handleDifficultyChange(difficulty as 'Easy' | 'Medium' | 'Hard')}
                transition="all 0.2s"
                _hover={{
                  borderColor: isSelected ? borderColor : "gray.300",
                  bg: isSelected ? bgColor : "gray.100"
                }}
              >
                <Radio 
                  value={difficulty}
                  isChecked={formData.difficulty === difficulty}
                  colorScheme={
                    difficulty === 'Easy' ? "green" : 
                    difficulty === 'Medium' ? "orange" : "red"
                  }
                  w="100%"
                >
                  <Text fontWeight="medium" color={textColor}>
                    {difficulty}
                  </Text>
                </Radio>
              </Box>
            );
          })}
        </SimpleGrid>
        {formErrors.difficulty && (
          <FormErrorMessage>{formErrors.difficulty}</FormErrorMessage>
        )}
      </FormControl>
      
      <FormControl mb={6} isRequired isInvalid={!!formErrors.semester}>
        <FormLabel fontWeight="semibold">Semester</FormLabel>
        <Select
          value={formData.semester?.toString() || ''}
          onChange={handleSemesterChange}
          placeholder="Select a semester"
          bg="white"
          borderColor={formErrors.semester ? "red.500" : "gray.300"}
          _hover={{ borderColor: "gray.400" }}
          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>
              {sem <= 2 ? 'Year 1' : sem <= 4 ? 'Year 2' : sem <= 6 ? 'Year 3' : 'Year 4'} - Semester {sem % 2 === 0 ? 2 : 1}
            </option>
          ))}
        </Select>
        {formErrors.semester && (
          <FormErrorMessage>{formErrors.semester}</FormErrorMessage>
        )}
      </FormControl>
      
      <FormControl mb={6}>
        <FormLabel fontWeight="semibold">Tags (Optional)</FormLabel>
        <FormHelperText mb={2}>
          Select up to 5 tags that describe your experience with this course
        </FormHelperText>
        <InputGroup>
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag..."
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: "gray.400" }}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
            onFocus={() => setShowTagSuggestions(true)}
          />
          <InputRightElement>
            <IconButton
              size="sm"
              aria-label="Add tag"
              icon={<Plus size={16} />}
              onClick={addTag}
              isDisabled={!newTag.trim()}
              colorScheme="purple"
              variant="ghost"
            />
          </InputRightElement>
        </InputGroup>
        
        {showTagSuggestions && (
          <Box mt={2} mb={3}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
              Suggested tags:
            </Text>
            <Flex wrap="wrap" gap={2}>
              {tagSuggestions
                .filter(tag => !formData.tags.includes(tag))
                .map(tag => (
                  <Badge
                    key={tag}
                    px={2}
                    py={1}
                    borderRadius="full"
                    colorScheme="purple"
                    opacity={0.8}
                    cursor="pointer"
                    onClick={() => addSuggestedTag(tag)}
                    _hover={{ opacity: 1, transform: "scale(1.05)" }}
                    transition="all 0.2s"
                  >
                    + {tag}
                  </Badge>
                ))}
            </Flex>
          </Box>
        )}
        
        {formData.tags.length > 0 && (
          <Flex wrap="wrap" gap={2} mt={3}>
            {formData.tags.map(tag => (
              <Tag
                key={tag}
                size="md"
                borderRadius="full"
                variant="solid"
                colorScheme="purple"
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag)} />
              </Tag>
            ))}
          </Flex>
        )}
      </FormControl>
      
      <FormControl mb={6} isRequired isInvalid={!!formErrors.review}>
        <FormLabel fontWeight="semibold">Your Review</FormLabel>
        <Textarea
          value={formData.review}
          onChange={handleReviewChange}
          placeholder="Share your experience with this course..."
          rows={6}
          bg="white"
          borderColor={formErrors.review ? "red.500" : "gray.300"}
          _hover={{ borderColor: "gray.400" }}
          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
        />
        {formErrors.review ? (
          <FormErrorMessage>{formErrors.review}</FormErrorMessage>
        ) : (
          <FormHelperText>
            <Flex align="center" gap={1}>
              <AlertTriangle size={14} color="#718096" />
              <Text>Be honest, helpful, and constructive in your review</Text>
            </Flex>
          </FormHelperText>
        )}
      </FormControl>
      
      <Flex justify="flex-end" mt={8}>
        <Button
          type="submit"
          colorScheme="purple"
          isLoading={isSubmitting}
          loadingText="Submitting..."
          size="lg"
          px={8}
          boxShadow="md"
          _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
          transition="all 0.2s"
        >
          Submit Review
        </Button>
      </Flex>
    </Box>
  );
};

export default ReviewForm; 