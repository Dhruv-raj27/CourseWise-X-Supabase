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
  InputLeftElement,
  InputRightElement,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const bgGradient = useColorModeValue(
    'linear(to-r, purple.100, blue.100)',
    'linear(to-r, purple.900, blue.900)'
  );
  const boxBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

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
        title: 'Login successful',
        description: 'Welcome to the admin panel',
        status: 'success',
        duration: 3000,
      });

      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="container.sm" py={20}>
        <Box bg={boxBg} p={8} rounded="xl" shadow="lg">
          <VStack spacing={8}>
            <VStack spacing={2} textAlign="center">
              <Heading size="xl" color="purple.600">Admin Portal</Heading>
              <Text color={textColor}>Enter your credentials to access the admin panel</Text>
            </VStack>
            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <VStack spacing={5}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={EmailIcon} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      bg={useColorModeValue('white', 'gray.800')}
                      borderColor={useColorModeValue('gray.200', 'gray.600')}
                      _hover={{
                        borderColor: 'purple.400',
                      }}
                      _focus={{
                        borderColor: 'purple.500',
                        boxShadow: '0 0 0 1px purple.500',
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={LockIcon} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      bg={useColorModeValue('white', 'gray.800')}
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
                      <Button
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <Icon as={showPassword ? ViewOffIcon : ViewIcon} color="gray.400" />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  width="100%"
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