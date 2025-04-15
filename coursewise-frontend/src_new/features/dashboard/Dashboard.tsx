import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Badge, Spinner, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import NavBar from '../shared/NavBar';

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

  if (loading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
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
    <div className="min-h-screen bg-gray-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2ODhBRkYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDMwaC0yVjBoMnYzMHptLTIgMEgydjJoMzJ2LTJ6bTAgMnYyOGgydi0yOGgtMnptMi0ydi0zaC0ydjNoMnptLTIgMEgwdjJoMzR2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]">
      <NavBar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 mb-8 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full z-0 opacity-50"></div>
            
            <div className="relative z-10">
              <HStack justifyContent="space-between" flexWrap="wrap" spacing={4}>
                <Box>
                  <Heading mb={2} bgGradient="linear(to-r, indigo.600, purple.600)" bgClip="text">
                    Welcome, {userName}!
                  </Heading>
                  <Text color="gray.600" fontSize="lg">Your personalized course dashboard</Text>
                  {userEmail && (
                    <Text fontSize="sm" color="gray.500" mt={1}>{userEmail}</Text>
                  )}
                </Box>
              </HStack>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div 
              className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              <div className="relative z-10">
                <Heading size="md" mb={4} className="text-gray-800">Your Dashboard</Heading>
                <Text className="text-gray-600">
                  This is a placeholder dashboard that will be replaced with the actual dashboard UI from the original codebase. The authentication and navigation are working correctly.
                </Text>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge colorScheme="green" className="py-1 px-3 rounded-full">Authentication Working</Badge>
                  <Badge colorScheme="blue" className="py-1 px-3 rounded-full">Session Management Working</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              <div className="relative z-10">
                <Heading size="md" mb={4} className="text-gray-800">Next Steps</Heading>
                <Text className="text-gray-600">
                  We'll next integrate the UI components from the original codebase into this new structure, starting with:
                </Text>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">1</div>
                    <Text>Dashboard UI with course recommendations</Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">2</div>
                    <Text>Course selection and timetable planning</Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">3</div>
                    <Text>Profile management</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 