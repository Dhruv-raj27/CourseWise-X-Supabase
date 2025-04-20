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
        console.log('Auth callback initiated', { url: window.location.href });
        
        // Get the auth code from the URL
        const code = searchParams.get('code');
        console.log('Auth code present:', code ? 'Yes' : 'No');
        
        if (!code) {
          console.warn('No auth code found in URL parameters');
          // If no code is present, user might be already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('Existing session found, redirecting to dashboard');
            navigate('/dashboard');
            return;
          }
          console.log('No session found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Exchanging auth code for session...');
        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Error exchanging code:', exchangeError);
          throw exchangeError;
        }
        
        if (!data.session) {
          console.error('No session received after code exchange');
          throw new Error('No session received after code exchange');
        }
        
        console.log('Session successfully obtained', { 
          user: data.session.user.email,
          provider: data.session.user.app_metadata.provider 
        });

        // Success notification
        toast({
          title: 'Welcome!',
          description: 'You have successfully signed in',
          status: 'success',
          duration: 3000,
        });

        // Check for redirect URL
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          console.log('Redirecting to stored URL:', redirectUrl);
          localStorage.removeItem('redirectAfterLogin');
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectUrl);
        } else {
          // Default redirect to dashboard
          console.log('Redirecting to dashboard (default)');
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        console.error('Error details:', { 
          message: error.message,
          name: error.name,
          stack: error.stack,
          status: (error as any).status
        });
        
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