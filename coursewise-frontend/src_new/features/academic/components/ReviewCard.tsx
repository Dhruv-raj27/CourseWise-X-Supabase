import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Text,
  Avatar,
  Badge,
  HStack,
  Icon,
  Button,
  Tooltip,
  useColorModeValue,
  Divider,
  Tag
} from '@chakra-ui/react';
import { Star, Calendar, ThumbsUp, Flag, Award, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  full_name: string;
  profile_picture_url?: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
}

export interface Review {
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
  user: User;
  course: Course;
  helpful_count?: number;
}

interface ReviewCardProps {
  review: Review;
  onHelpfulClick?: (reviewId: string) => Promise<void>;
  onReportClick?: (reviewId: string) => void;
  isHelpful?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onHelpfulClick,
  onReportClick,
  isHelpful = false
}) => {
  const formattedDate = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'green';
      case 'Medium':
        return 'orange';
      case 'Hard':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Determine if this is a recent review (within last 7 days)
  const isRecentReview = () => {
    const reviewDate = new Date(review.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const getSemesterText = (semester: number) => {
    if (semester <= 0 || semester > 8) return `Semester ${semester}`;
    
    const yearMap = {
      1: 'Year 1 - Sem 1',
      2: 'Year 1 - Sem 2',
      3: 'Year 2 - Sem 1',
      4: 'Year 2 - Sem 2',
      5: 'Year 3 - Sem 1',
      6: 'Year 3 - Sem 2',
      7: 'Year 4 - Sem 1',
      8: 'Year 4 - Sem 2',
    };
    
    return yearMap[semester as keyof typeof yearMap];
  };

  return (
    <Card
      borderRadius="lg" 
      overflow="hidden" 
      bg="white" 
      boxShadow="md"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
      transition="all 0.3s ease"
      position="relative"
      borderTop="3px solid"
      borderColor={review.rating >= 4 ? "green.400" : review.rating >= 3 ? "blue.400" : "red.400"}
    >
      {isRecentReview() && (
        <Badge
          position="absolute"
          top={0}
          right={0}
          colorScheme="purple"
          m={2}
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="md"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Icon as={MessageSquare} boxSize={3} />
          New
        </Badge>
      )}

      <CardBody p={5}>
        <Flex justify="space-between" align="flex-start" mb={3}>
          <Flex align="center" gap={3}>
            <Avatar 
              size="md" 
              name={review.user.full_name} 
              src={review.user.profile_picture_url}
              bg="purple.500"
              boxShadow="0 0 0 3px rgba(128, 90, 213, 0.2)"
            />
            <Box>
              <Text fontWeight="bold">{review.user.full_name}</Text>
              <Text fontSize="sm" color="gray.500">{formattedDate}</Text>
            </Box>
          </Flex>
          
          <HStack spacing={1}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                fill={i < review.rating ? "#F6AD55" : "none"}
                stroke={i < review.rating ? "#ED8936" : "gray"}
                strokeWidth={1.5}
              />
            ))}
          </HStack>
        </Flex>
        
        <Flex wrap="wrap" gap={2} align="center" mb={3}>
          <Badge 
            colorScheme={getDifficultyColor(review.difficulty)} 
            borderRadius="full"
            px={2}
            py={1}
            display="flex"
            alignItems="center"
            gap={1}
          >
            {review.difficulty === 'Hard' && <Icon as={Award} boxSize={3} />}
            {review.difficulty}
          </Badge>
          
          <Flex align="center" bg="gray.100" px={2} py={1} borderRadius="md">
            <Icon as={Calendar} size={14} color="gray.500" mr={1} />
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              {getSemesterText(review.semester)}
            </Text>
          </Flex>

          {review.tags && review.tags.length > 0 && (
            <Flex wrap="wrap" gap={2} mt={1}>
              {review.tags.map(tag => (
                <Tag
                  key={tag} 
                  borderRadius="full" 
                  px={2} 
                  py={0.5}
                  colorScheme="purple"
                  variant="subtle"
                  fontWeight="normal"
                >
                  {tag}
                </Tag>
              ))}
            </Flex>
          )}
        </Flex>
        
        <Box
          bg="gray.50"
          p={3}
          borderRadius="md"
          mb={4}
          borderLeft="3px solid"
          borderColor="purple.200"
        >
          <Text color="gray.700">{review.review}</Text>
        </Box>
      </CardBody>

      <Divider borderColor="gray.200" />

      <Flex
        p={3}
        bg="gray.50"
        justifyContent="space-between"
        alignItems="center"
      >
        <Tooltip label={isHelpful ? "Remove helpful mark" : "Mark as helpful"}>
          <Button
            size="sm"
            leftIcon={<ThumbsUp size={14} />}
            onClick={() => onHelpfulClick && onHelpfulClick(review.id)}
            colorScheme={isHelpful ? "purple" : "gray"}
            variant={isHelpful ? "solid" : "outline"}
            _hover={{ transform: "scale(1.05)" }}
            transition="all 0.2s"
          >
            Helpful {review.helpful_count && review.helpful_count > 0 ? `(${review.helpful_count})` : ''}
          </Button>
        </Tooltip>
          
          <Tooltip label="Report this review">
            <Button
              size="sm"
            leftIcon={<Flag size={14} />}
            onClick={() => onReportClick && onReportClick(review.id)}
              variant="ghost"
            colorScheme="red"
            >
            Report
            </Button>
          </Tooltip>
      </Flex>
    </Card>
  );
};

export default ReviewCard; 