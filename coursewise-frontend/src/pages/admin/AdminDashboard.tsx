import React from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  VStack,
  Text,
  useColorModeValue,
  Icon,
  Link as ChakraLink,
  Button,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AddIcon, ViewIcon, SettingsIcon, StarIcon } from '@chakra-ui/icons';
import { supabase } from '../../lib/supabase';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, to }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  return (
    <ChakraLink
      as={RouterLink}
      to={to}
      _hover={{ textDecoration: 'none' }}
      width="100%"
    >
      <Box
        p={6}
        bg={bgColor}
        rounded="lg"
        shadow="base"
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-2px)',
          shadow: 'md',
          bg: hoverBg,
        }}
      >
        <VStack spacing={4} align="center">
          <Icon as={icon} boxSize={6} color="purple.500" />
          <Heading size="md" textAlign="center">{title}</Heading>
          <Text textAlign="center" color="gray.600">{description}</Text>
        </VStack>
      </Box>
    </ChakraLink>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const bgGradient = useColorModeValue(
    'linear(to-r, purple.100, blue.100)',
    'linear(to-r, purple.900, blue.900)'
  );

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isAdmin');
      toast({
        title: 'Signed out successfully',
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error signing out',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const dashboardItems = [
    {
      title: 'Course Management',
      description: 'Add, edit, and manage courses',
      icon: AddIcon,
      to: '/admin/courses'
    },
    {
      title: 'Stream Management',
      description: 'Manage academic streams and departments',
      icon: ViewIcon,
      to: '/admin/streams'
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: StarIcon,
      to: '/admin/users'
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: SettingsIcon,
      to: '/admin/settings'
    }
  ];

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="purple.600">Admin Dashboard</Heading>
            <Button
              colorScheme="purple"
              variant="outline"
              onClick={handleSignOut}
              leftIcon={<Icon as={ViewIcon} />}
            >
              Sign Out
            </Button>
          </Flex>
          <Grid
            templateColumns={{
              base: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)'
            }}
            gap={6}
          >
            {dashboardItems.map((item, index) => (
              <DashboardCard key={index} {...item} />
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 