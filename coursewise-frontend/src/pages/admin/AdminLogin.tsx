import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  useToast,
  Text,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const bgGradient = useColorModeValue(
    'linear(to-r, purple.50, purple.100)',
    'linear(to-r, gray.800, purple.900)'
  );
  const boxBg = useColorModeValue('white', 'gray.800');
  const boxShadow = useColorModeValue('lg', 'dark-lg');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if the email matches the admin email
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      if (email !== adminEmail) {
        throw new Error('Invalid admin credentials');
      }

      // Attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store admin status in localStorage
      localStorage.setItem('isAdmin', 'true');

      toast({
        title: 'Welcome back, Admin!',
        description: 'Login successful',
        status: 'success',
        duration: 3000,
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      // Clear admin status on error
      localStorage.removeItem('isAdmin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={20}>
      <Container maxW="container.sm">
        <Box
          bg={boxBg}
          p={10}
          rounded="xl"
          shadow={boxShadow}
          borderWidth="1px"
          borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
          <VStack spacing={8}>
            <VStack spacing={3} align="center">
              <Heading size="xl" color="purple.600">Admin Portal</Heading>
              <Text color="gray.500" fontSize="lg">
                Welcome back! Please sign in to continue.
              </Text>
            </VStack>
            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    size="lg"
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    _hover={{
                      borderColor: 'purple.400',
                    }}
                    _focus={{
                      borderColor: 'purple.500',
                      boxShadow: '0 0 0 1px purple.500',
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      bg={useColorModeValue('white', 'gray.700')}
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{
                        borderColor: 'purple.400',
                      }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        colorScheme="purple"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="purple"
                  width="100%"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminLogin; 