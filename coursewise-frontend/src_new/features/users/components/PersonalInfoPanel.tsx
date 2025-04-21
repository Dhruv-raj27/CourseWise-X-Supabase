import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Grid, 
  GridItem, 
  Select,
  useToast,
  Heading,
  Text,
  Flex,
  Avatar
} from '@chakra-ui/react';
import { supabase } from '../../../lib/supabase';
import { User, Mail, Phone, Edit } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone_number: string | null;
  profile_picture_url: string | null;
  bio: string | null;
  current_semester: number | null;
}

interface PersonalInfoPanelProps {
  userData: UserData;
}

const PersonalInfoPanel = ({ userData }: PersonalInfoPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: userData?.full_name || '',
    phone_number: userData?.phone_number || '',
    bio: userData?.bio || '',
    current_semester: userData?.current_semester || 1,
    profile_picture_url: userData?.profile_picture_url || '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          bio: formData.bio,
          current_semester: formData.current_semester,
          profile_picture_url: formData.profile_picture_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);
      
      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your personal information has been updated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md" color="purple.700">Personal Information</Heading>
        {!isEditing && (
          <Button 
            size="sm" 
            leftIcon={<Edit size={16} />} 
            colorScheme="purple" 
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </Flex>

      {!isEditing ? (
        <Grid templateColumns={{ base: "1fr", md: "200px 1fr" }} gap={8} alignItems="start">
          <GridItem>
            <VStack spacing={4} align="center">
              <Avatar 
                size="2xl" 
                src={userData?.profile_picture_url || ''} 
                name={userData?.full_name || userData?.email}
                bg="purple.500"
              />
              <Text fontWeight="bold" fontSize="lg">
                {userData?.full_name || 'No name provided'}
              </Text>
              <Box bg="purple.50" p={2} px={3} rounded="md" fontSize="sm" color="purple.700">
                {userData?.role || 'Student'}
              </Box>
            </VStack>
          </GridItem>
          
          <GridItem>
            <VStack spacing={6} align="stretch" className="bg-gray-50 p-6 rounded-xl">
              <Flex gap={3} align="center">
                <Box className="p-2 bg-purple-100 rounded-full">
                  <Mail size={20} className="text-purple-600" />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Email Address</Text>
                  <Text fontWeight="medium">{userData?.email}</Text>
                </Box>
              </Flex>
              
              <Flex gap={3} align="center">
                <Box className="p-2 bg-purple-100 rounded-full">
                  <Phone size={20} className="text-purple-600" />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Phone Number</Text>
                  <Text fontWeight="medium">{userData?.phone_number || 'Not provided'}</Text>
                </Box>
              </Flex>
              
              <Flex gap={3} align="center">
                <Box className="p-2 bg-purple-100 rounded-full">
                  <User size={20} className="text-purple-600" />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Current Semester</Text>
                  <Text fontWeight="medium">{userData?.current_semester || 'Not specified'}</Text>
                </Box>
              </Flex>
              
              <Box mt={4}>
                <Text fontSize="sm" color="gray.500" mb={1}>About Me</Text>
                <Text>{userData?.bio || 'No bio provided yet.'}</Text>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      ) : (
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <Input
                    name="profile_picture_url"
                    value={formData.profile_picture_url}
                    onChange={handleChange}
                    placeholder="Enter the URL of your profile picture"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Current Semester</FormLabel>
                  <Select
                    name="current_semester"
                    value={formData.current_semester}
                    onChange={handleChange}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Input
                    as="textarea"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    minHeight="100px"
                  />
                </FormControl>
              </GridItem>
            </Grid>
            
            <Flex gap={4} justifyContent="flex-end">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="purple"
                isLoading={loading}
              >
                Save Changes
              </Button>
            </Flex>
          </VStack>
        </form>
      )}
    </Box>
  );
};

export default PersonalInfoPanel; 