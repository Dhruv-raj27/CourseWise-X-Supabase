import React, { useState, useEffect } from 'react';
import { Box, Button, VStack, Text, useToast, Spinner } from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import type { AuthError, Session } from '@supabase/supabase-js';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Login - Initial session check:', session);
      setSession(session);
      if (session) {
        navigate('/dashboard');
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Login - Auth state change:', { event: _event, session });
      setSession(session);
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google sign-in...', { origin: window.location.origin });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          scopes: 'email profile',
        }
      });

      console.log('Sign-in response:', { data, error, redirectUrl: data?.url });

      if (error) {
        console.error('Supabase OAuth error:', error);
        throw error;
      }
      
      if (!data?.url) {
        console.error('No redirect URL in response:', data);
        throw new Error('No redirect URL received from authentication provider');
      }

      // Log the redirect URL before redirecting
      console.log('Redirecting to OAuth URL:', data.url);
      window.location.href = data.url;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Detailed sign-in error:', {
        message: authError.message,
        status: (authError as any).status,
        name: authError.name,
        stack: authError.stack
      });
      toast({
        title: 'Authentication Error',
        description: authError.message || 'Failed to sign in with Google. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (session === undefined) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <VStack spacing={8} p={8} bg="white" borderRadius="lg" boxShadow="lg" maxW="md" w="full">
        <Text fontSize="2xl" fontWeight="bold">Welcome to CourseWise</Text>
        <Text textAlign="center" color="gray.600">
          Sign in with your Google account to access personalized course recommendations
        </Text>
        <Button
          leftIcon={<FcGoogle />}
          onClick={handleGoogleSignIn}
          size="lg"
          w="full"
          variant="outline"
          isLoading={isLoading}
          loadingText="Signing in..."
          _hover={{
            bg: 'gray.50',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          }}
          disabled={isLoading}
        >
          Continue with Google
        </Button>
      </VStack>
    </Box>
  );
};

export default Login; 