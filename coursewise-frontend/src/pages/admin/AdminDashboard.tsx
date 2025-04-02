import React from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Icon,
  Button,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  AddIcon, 
  RepeatIcon, 
  ViewIcon, 
  SettingsIcon, 
  StarIcon,
  AtSignIcon 
} from '@chakra-ui/icons';

interface DashboardItemProps {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
}

const DashboardItem: React.FC<DashboardItemProps> = ({ title, description, icon, onClick }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('purple.200', 'gray.600');
  const hoverBg = useColorModeValue('purple.50', 'gray.700');

  return (
    <Button
      onClick={onClick}
      height="200px"
      p={6}
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="lg"
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
        borderColor: 'purple.300',
      }}
      transition="all 0.3s"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      w="100%"
    >
      <Icon as={icon} w={10} h={10} color="purple.500" mb={4} />
      <Text fontSize="xl" fontWeight="bold" mb={2} color="purple.600">
        {title}
      </Text>
      <Text color="gray.500" fontSize="sm">
        {description}
      </Text>
    </Button>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, blue.50)',
    'linear(to-br, gray.900, purple.900)'
  );

  const dashboardItems = [
    {
      title: 'Add Course',
      description: 'Add a new course to the system',
      icon: AddIcon,
      route: '/admin/courses/add',
    },
    {
      title: 'Bulk Upload',
      description: 'Upload multiple courses using Excel file',
      icon: RepeatIcon,
      route: '/admin/courses/bulk-upload',
    },
    {
      title: 'My Added Courses',
      description: 'View and manage courses you have added',
      icon: ViewIcon,
      route: '/admin/courses/my-courses',
    },
    {
      title: 'Stream Management',
      description: 'Manage academic streams and departments',
      icon: AtSignIcon,
      route: '/admin/streams',
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: StarIcon,
      route: '/admin/users',
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: SettingsIcon,
      route: '/admin/settings',
    },
  ];

  return (
    <Box p={8} minH="100vh" bgGradient={bgGradient}>
      <VStack spacing={8} maxW="1200px" mx="auto">
        <Heading 
          size="xl" 
          mb={6}
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
        >
          Admin Dashboard
        </Heading>
        
        <SimpleGrid 
          columns={{ base: 1, md: 2, lg: 3 }} 
          spacing={8} 
          w="100%"
          justifyItems="center"
        >
          {dashboardItems.map((item, index) => (
            <DashboardItem
              key={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              onClick={() => navigate(item.route)}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default AdminDashboard; 