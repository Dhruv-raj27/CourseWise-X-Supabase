import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Spinner, useToast } from '@chakra-ui/react';
import { supabase } from '../../../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const code = searchParams.get('code');
        
        if (!code) {
          // If no code is present, user might be already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate('/dashboard');
            return;
          }
          navigate('/login');
          return;
        }

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) throw exchangeError;
        if (!data.session) throw new Error('No session received after code exchange');

        // Success notification
        toast({
          title: 'Welcome!',
          description: 'You have successfully signed in',
          status: 'success',
          duration: 3000,
        });

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: 'Authentication Error',
          description: error.message || 'Failed to complete authentication',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast, searchParams]);

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
};

export default AuthCallback; 