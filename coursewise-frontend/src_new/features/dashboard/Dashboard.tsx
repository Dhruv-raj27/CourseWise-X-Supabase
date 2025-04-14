import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, VStack, HStack, Badge, Spinner, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        // Set email from session for fallback
        setUserEmail(session.user.email || '');
        
        // Get user's full name from the session metadata if available
        const fullName = session.user.user_metadata?.full_name;
        if (fullName) {
          setUserName(fullName);
          setLoading(false);
          return;
        }

        // If full name not in metadata, try to get it from profile
        // Note: Query format is important for RLS policies to work
        const { data: userData, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching user data:', error);
          // Fall back to email username if DB query fails
          setUserName(session.user.email?.split('@')[0] || 'User');
        } else if (userData && userData.full_name) {
          setUserName(userData.full_name);
        } else {
          // If no user data found, use email username
          setUserName(session.user.email?.split('@')[0] || 'User');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUserName('User');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="purple.500"
          size="xl"
        />
      </Box>
    );
  }

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <VStack spacing={8} align="stretch">
        <HStack justifyContent="space-between">
          <Box>
            <Heading mb={2}>Welcome, {userName}!</Heading>
            <Text color="gray.600">Your personalized course dashboard</Text>
            {userEmail && (
              <Text fontSize="sm" color="gray.500" mt={1}>{userEmail}</Text>
            )}
          </Box>
          <Button colorScheme="purple" variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </HStack>
        
        <Box 
          bg="white" 
          p={6} 
          borderRadius="lg" 
          boxShadow="md"
          borderLeft="4px solid"
          borderLeftColor="purple.500"
        >
          <Heading size="md" mb={4}>Your Dashboard</Heading>
          <Text>
            This is a placeholder dashboard that will be replaced with the actual dashboard UI from the original codebase. The authentication and navigation are working correctly.
          </Text>
          <HStack mt={4}>
            <Badge colorScheme="green">Authentication Working</Badge>
            <Badge colorScheme="blue">Session Management Working</Badge>
          </HStack>
        </Box>
        
        <Box mt={6} p={6} bg="white" borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Next Steps</Heading>
          <Text>
            We'll next integrate the UI components from the original codebase into this new structure, starting with:
          </Text>
          <VStack align="start" mt={4} spacing={2}>
            <HStack>
              <Badge colorScheme="purple">1</Badge>
              <Text>Dashboard UI with course recommendations</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="purple">2</Badge>
              <Text>Course selection and timetable planning</Text>
            </HStack>
            <HStack>
              <Badge colorScheme="purple">3</Badge>
              <Text>Profile management</Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Dashboard; 