import React from 'react';
import { 
  Box, Flex, Text, Button, Heading, VStack, 
  useColorModeValue, Image, Container
} from '@chakra-ui/react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../shared/NavBar';

// Import the basic types for type checking
import { Course, Stream } from '../../types/courseRecommendation';

const CourseRecommendation: React.FC = () => {
  const navigate = useNavigate();

  // Colors for theming
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, indigo.50)', 
    'linear(to-br, gray.800, purple.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const accentColor = useColorModeValue('purple.500', 'purple.300');
  
  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <NavBar />
      
      <Container maxW="container.lg" py={16}>
        <VStack spacing={10} align="center">
          {/* Back button */}
          <Flex w="full" justify="flex-start">
              <Button
              leftIcon={<ChevronLeft size={20} />}
              variant="ghost" 
              onClick={() => navigate(-1)}
              size="md"
            >
              Back to Academic Tools
              </Button>
            </Flex>
          
          {/* Coming Soon Message */}
          <Box 
            p={10} 
            bg={cardBg} 
            shadow="xl" 
            borderRadius="2xl" 
            textAlign="center"
            w="full"
            maxW="750px"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
          >
            <Heading 
              as="h1" 
              fontSize={{ base: '2xl', md: '4xl' }} 
              mb={6}
              bgGradient="linear(to-r, purple.400, indigo.500)"
              bgClip="text"
            >
              Course Recommendation System
            </Heading>
            
            <Text 
              fontSize={{ base: 'md', md: 'xl' }} 
              color={textColor}
              mb={8}
              maxW="650px"
              mx="auto"
            >
              Our advanced AI-powered course recommendation system is currently under development. 
              We're working hard to create a personalized experience that will help you discover 
              courses that match your interests, career goals, and academic journey.
                      </Text>
                      
            <Box position="relative" py={6}>
              <Image 
                src="/images/course-recommendation-placeholder.svg" 
                alt="Course Recommendation" 
                fallbackSrc={`https://via.placeholder.com/600x300/8B5CF6/FFFFFF?text=Coming+Soon`}
                borderRadius="lg"
                mx="auto"
                mb={8}
                maxW="550px"
              />
              
              <VStack spacing={4}>
                <Heading 
                  as="h3" 
                  size="md" 
                  color={accentColor}
                >
                  Features to look forward to:
                </Heading>
                
                <Box 
                  p={6} 
                  bg={useColorModeValue('purple.50', 'gray.700')} 
                  borderRadius="xl"
                  w="full"
                >
                  <VStack spacing={4} align="start">
                    <Text><strong>🎯 Personalized Recommendations</strong> - Tailored to your academic history and interests</Text>
                    <Text><strong>🤖 AI-Powered Insights</strong> - Smart algorithm to match you with the right courses</Text>
                    <Text><strong>📊 Interactive Chat Interface</strong> - Simple conversation to learn your preferences</Text>
                    <Text><strong>📱 Mobile-Friendly Design</strong> - Access recommendations anywhere, anytime</Text>
                  </VStack>
                </Box>
              </VStack>
              
              <Button
                  colorScheme="purple"
                size="lg"
                mt={8}
                onClick={() => navigate(-1)}
              >
                Back to Academic Tools
              </Button>
            </Box>
          </Box>
        </VStack>
      </Container>
      </Box>
  );
};

export default CourseRecommendation; 