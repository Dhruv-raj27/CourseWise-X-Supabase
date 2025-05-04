import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Image,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  keyframes,
  Icon,
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import NavBar from '../shared/NavBar';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import {
  BookOpen, 
  Star,
  Users,
  BarChart,
  Brain,
} from 'lucide-react';

// Import images
import imgRajput from '../../assets/Rajput.png';
import imgDewan from '../../assets/Dewan.png';
import imgSarthak from '../../assets/sarthak.png';
import imgKunal from '../../assets/kunal.jpg';

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Team members data
const teamMembers = [
  {
    name: 'Dhruv Rajput',
    role: 'Lead Developer',
    image: imgRajput,
    bio: 'Full stack wizard orchestrating both frontend and backend systems with expertise in React and Supabase.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Dhruv Dewan',
    role: 'ML Engineer',
    image: imgDewan,
    bio: 'AI enthusiast who crafted the ML models and architected database schemas that power the platform.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Sarthak Srivastava',
    role: 'Design & Content Lead',
    image: imgSarthak,
    bio: 'Creative mind behind the Figma designs and data-driven content strategy for the platform.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Kunal Sharma',
    role: 'DevOps Engineer',
    image: imgKunal,
    bio: 'Integration expert who seamlessly connects frontend components and manages deployment pipelines.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
  },
];

// Core features
const features = [
  {
    title: 'Course Insights',
    description: 'Comprehensive course reviews and ratings from fellow students',
    icon: Star,
    color: 'yellow.400',
  },
  {
    title: 'Intelligent Planning',
    description: 'Smart timetable planning tools to optimize your academic journey',
    icon: Brain,
    color: 'purple.400',
  },
  {
    title: 'Academic Tracking',
    description: 'Track your progress and CGPA with intuitive visualization tools',
    icon: BarChart,
    color: 'blue.400',
  },
  {
    title: 'Community Powered',
    description: 'Join thousands of students sharing knowledge and experiences',
    icon: Users,
    color: 'green.400',
  },
];

// Motion components with proper typing
const MotionDiv = motion.div;
const MotionFlex = motion(Flex);

const AboutPage: React.FC = () => {
  // Theme colors
  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, #f9f7ff 0%, #f1eaff 25%, #ede9fe 50%, #f1eaff 75%, #f9f7ff 100%)',
    'linear-gradient(135deg, #170b3b 0%, #2d1f69 50%, #170b3b 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('purple.100', 'purple.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const accentColor = useColorModeValue('purple.600', 'purple.300');
  
  // Animations for the sections
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <>
      <NavBar />
      <Box
        position="relative"
        overflow="hidden"
        minH="100vh"
        bgGradient={bgGradient}
        pt={20}
        pb={20}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: useColorModeValue(
            'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%238b5cf6\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
            'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23c4b5fd\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")'
          ),
          zIndex: 0,
        }}
      >
        {/* Background decorative elements */}
        <Box
          position="absolute"
          top="10%"
          right="10%"
          w="400px"
          h="400px"
          borderRadius="full"
          bgGradient="radial(circle, purple.400 0%, purple.500 30%, transparent 70%)"
          opacity={0.1}
          zIndex={0}
          filter="blur(60px)"
        />
        
        <Box
          position="absolute"
          bottom="15%"
          left="5%"
          w="350px"
          h="350px"
          borderRadius="full"
          bgGradient="radial(circle, blue.300 0%, purple.400 50%, transparent 70%)"
          opacity={0.08}
          zIndex={0}
          filter="blur(70px)"
        />
        
        <Box
          position="absolute" 
          top="40%"
          left="20%"
          w="250px"
          h="250px"
          borderRadius="full"
          bgGradient="radial(circle, teal.300 0%, purple.300 40%, transparent 70%)"
          opacity={0.05}
          zIndex={0}
          filter="blur(50px)"
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          {/* Hero Section */}
          <Box mb={20}>
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Flex 
                direction={{ base: 'column', lg: 'row' }} 
                align="center" 
                justify="space-between"
                gap={10}
              >
                <VStack 
                  align={{ base: 'center', lg: 'flex-start' }} 
                  spacing={6} 
                  flex="1"
                  textAlign={{ base: 'center', lg: 'left' }}
                >
                  <Badge 
                    px={3} 
                    py={1} 
                    colorScheme="purple" 
                    variant="solid" 
                    borderRadius="full"
                    fontSize="sm"
                  >
                    For Students, By Students
                  </Badge>
              
              <Heading 
                as="h1" 
                size="3xl" 
                fontWeight="bold"
                    bgGradient="linear(to-r, purple.400, blue.500)"
                bgClip="text"
                    lineHeight="1.2"
              >
                    CourseWise
              </Heading>
              
              <Text 
                    fontSize="xl" 
                color={subtitleColor}
                    maxW="600px"
              >
                    Your intelligent companion for navigating college courses, simplifying academic planning, and making informed decisions about your education.
              </Text>
                </VStack>
                
                <Box 
                  flex="1" 
                  maxW={{ base: "300px", lg: "450px" }}
                  animation={`${float} 3s ease-in-out infinite`}
                >
                  <Box
                    position="relative"
                    borderRadius="2xl"
                    overflow="hidden"
                    boxShadow="2xl"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: '-4px',
                      left: '-4px',
                      right: '-4px',
                      bottom: '-4px',
                      borderRadius: '2xl',
                      padding: '4px',
                      background: 'linear-gradient(45deg, purple.400, blue.500, teal.300)',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                      zIndex: -1,
                    }}
                  >
                    <Box
                      bgColor="purple.50"
                      borderRadius="2xl"
                      p={8}
                      textAlign="center"
                      height="300px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                    >
                      <Icon as={BookOpen} w={24} h={24} color="purple.400" mb={4} />
                      <Text fontSize="xl" fontWeight="bold" color={accentColor}>Elevating Education</Text>
                    </Box>
                  </Box>
                </Box>
              </Flex>
            </MotionDiv>
          </Box>

          {/* Features Section */}
          <Box mb={20}>
            <MotionDiv
              ref={ref}
              initial="hidden"
              animate={controls}
              variants={{
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.2 } },
                hidden: { opacity: 0, y: 20 }
              }}
            >
              <VStack spacing={12} align="stretch">
                <VStack spacing={3} textAlign="center">
                  <Heading as="h2" size="xl" fontWeight="bold" color={textColor}>
                    Designed to Empower
                </Heading>
                  <Text color={subtitleColor} maxW="600px" mx="auto">
                    CourseWise combines powerful features with intuitive design to transform your academic planning
                </Text>
              </VStack>
              
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                {features.map((feature, index) => (
                    <MotionDiv
                      key={feature.title}
                      variants={{
                        visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } },
                        hidden: { opacity: 0, y: 20 }
                      }}
                    >
                      <VStack
                        p={6}
                        h="full"
                        bg={cardBg}
                    borderRadius="xl"
                        boxShadow="md"
                        border="1px"
                        borderColor={borderColor}
                        spacing={4}
                        align="flex-start"
                        transition="all 0.3s"
                    _hover={{ 
                          transform: "translateY(-5px)",
                          boxShadow: "lg",
                          borderColor: feature.color,
                        }}
                      >
                        <Flex
                          align="center"
                          justify="center"
                          bg={`${feature.color}20`}
                          color={feature.color}
                          p={3}
                          borderRadius="lg"
                        >
                          <Icon as={feature.icon} boxSize={6} />
                        </Flex>
                        <Heading as="h3" size="md" color={textColor}>
                          {feature.title}
                        </Heading>
                        <Text color={subtitleColor} fontSize="sm">
                          {feature.description}
                        </Text>
                      </VStack>
                    </MotionDiv>
                ))}
              </SimpleGrid>
            </VStack>
            </MotionDiv>
          </Box>

          {/* Team Section */}
          <Box>
            <MotionDiv
              initial="hidden"
              animate={controls}
              variants={{
                visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
                hidden: { opacity: 0 }
              }}
            >
              <VStack spacing={12} align="stretch">
                <VStack spacing={3} textAlign="center">
                  <Heading as="h2" size="xl" fontWeight="bold" color={textColor}>
                  Meet Our Team
                </Heading>
                  <Text color={subtitleColor} maxW="600px" mx="auto">
                    The minds behind CourseWise committed to enhancing your academic journey
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                {teamMembers.map((member, index) => (
                    <MotionDiv
                      key={member.name}
                      variants={{
                        visible: { opacity: 1, scale: 1, transition: { delay: index * 0.1 } },
                        hidden: { opacity: 0, scale: 0.9 }
                      }}
                    >
                      <VStack 
                        spacing={4}
                        p={6}
                        bg={cardBg}
                        borderRadius="xl"
                        boxShadow="md"
                        border="1px" 
                        borderColor={borderColor}
                        transition="transform 0.3s, box-shadow 0.3s"
                        _hover={{
                          transform: "translateY(-5px)",
                          boxShadow: "xl",
                        }}
                        position="relative"
                        overflow="hidden"
                      >
                        <Box
                          borderRadius="full"
                          boxSize="120px"
                          overflow="hidden"
                          borderWidth="3px"
                          borderColor={borderColor}
                        >
                          <Image
                            src={member.image}
                            alt={member.name}
                            objectFit="cover"
                            h="100%"
                            w="100%"
                          />
                        </Box>
                        
                        <VStack spacing={1}>
                          <Heading as="h3" size="md" fontWeight="bold" color={textColor}>
                            {member.name}
                          </Heading>
                          <Badge colorScheme="purple">{member.role}</Badge>
                          <Text fontSize="sm" color={subtitleColor} textAlign="center">
                            {member.bio}
                          </Text>
                        </VStack>
                        
                        <HStack spacing={4}>
                          <Box 
                            as="a" 
                            href={member.github}
                            target="_blank"
                            p={2}
                            color={subtitleColor}
                            borderRadius="full"
                            transition="all 0.2s"
                            _hover={{ color: accentColor, transform: "scale(1.2)" }}
                          >
                            <FaGithub size={20} />
                          </Box>
                          <Box 
                            as="a" 
                            href={member.linkedin}
                            target="_blank"
                            p={2}
                            color={subtitleColor}
                            borderRadius="full"
                            transition="all 0.2s"
                            _hover={{ color: accentColor, transform: "scale(1.2)" }}
                          >
                            <FaLinkedin size={20} />
                        </Box>
                        </HStack>
                      </VStack>
                    </MotionDiv>
                ))}
              </SimpleGrid>
              </VStack>
            </MotionDiv>
          </Box>
        </Container>
        
        {/* Footer section with copyright */}
        <Box mt={20} py={6} textAlign="center" color={subtitleColor}>
          <Text>© {new Date().getFullYear()} CourseWise. All rights reserved.</Text>
        </Box>
      </Box>
    </>
  );
};

export default AboutPage; 