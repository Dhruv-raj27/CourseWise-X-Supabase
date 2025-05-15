import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner, Avatar, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, useColorModeValue, Card, CardBody, Stack, Icon, Divider } from '@chakra-ui/react';
import { User, Bookmark, BookOpen, Award, BarChart, GraduationCap, Book, Calendar, ClipboardList } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { useToast } from '../../../lib/contexts/ToastContext';
import NavBar from '../../shared/NavBar';
import PersonalInfoPanel from './PersonalInfoPanel';
import AcademicRecordsPanel from './AcademicRecordsPanel';
import CourseHistoryPanel from './CourseHistoryPanel';
import AchievementsPanel from './AchievementsPanel';

// Function to create a CORS-friendly URL for Google images
const getCorsProxyUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.includes('googleusercontent.com')) {
    // Use images.weserv.nl as a proxy to avoid CORS issues
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=404`;
  }
  return url;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [semesterCourses, setSemesterCourses] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const { session } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        if (!session) {
          throw new Error('No active session');
        }
        
        // Get user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user data:', userError);
          throw userError;
        }
        
        // If Google avatar is available but not saved in database, save it
        if (session.user.user_metadata?.avatar_url && 
            (!userData.profile_picture_url || userData.profile_picture_url !== session.user.user_metadata.avatar_url)) {
          
          // Add debugging
          console.log('Before sync - Profile URL:', userData.profile_picture_url);
          console.log('Google Avatar URL:', session.user.user_metadata.avatar_url);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              profile_picture_url: session.user.user_metadata.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id);
            
          if (updateError) {
            console.error('Error synchronizing Google avatar:', updateError);
          } else {
            // Update the userData with the new profile_picture_url
            userData.profile_picture_url = session.user.user_metadata.avatar_url;
            console.log('After sync - Updated profile URL:', userData.profile_picture_url);
          }
        }
        
        // Get academic records with error handling
        const { data: academicRecords, error: academicError } = await supabase
          .from('user_academic_records')
          .select('*')
          .eq('user_id', session.user.id)
          .order('semester_number');
          
        if (academicError) {
          console.error('Error fetching academic records:', academicError);
        }
        
        // Get semester courses with error handling
        const { data: semesterCourses, error: coursesError } = await supabase
          .from('user_semester_courses')
          .select('*, courses(*)')
          .eq('user_id', session.user.id)
          .order('semester_number');
          
        if (coursesError) {
          console.error('Error fetching semester courses:', coursesError);
        }
        
        // Get achievements with error handling
        const { data: achievements, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', session.user.id)
          .order('awarded_at', { ascending: false });
          
        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError);
        }
        
        // Get selected courses with error handling
        const { data: selectedCourses, error: selectedCoursesError } = await supabase
          .from('selected_courses')
          .select('*, courses(*)')
          .eq('user_id', session.user.id);
          
        if (selectedCoursesError) {
          console.error('Error fetching selected courses:', selectedCoursesError);
        }
        
        // Update state with fetched data, defaulting to empty arrays if there were errors
        setUserData(userData);
        setAcademicRecords(academicRecords || []);
        setSemesterCourses(semesterCourses || []);
        setAchievements(achievements || []);
        setSelectedCourses(selectedCourses || []);
        
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error fetching data',
          description: error.message || 'Could not load user data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session, toast]);

  const semester = userData?.semester || userData?.current_semester || '-';
  const totalCredits = academicRecords.reduce((sum, record) => sum + (record.completed_credits || 0), 0);
  const averageGPA = academicRecords.length ? 
    (academicRecords.reduce((sum, record) => sum + (record.gpa || 0), 0) / academicRecords.length).toFixed(2) : 
    '-';

  return (
    <>
      <NavBar />
      <Box className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-16">
        <Box maxW="1200px" margin="0 auto" p={[4, 6, 8]}>
          <Flex direction="column" gap={6}>
            {/* Header section with user info */}
            <Box className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
              <Flex direction={['column', 'row']} justifyContent="space-between" alignItems={['center', 'flex-start']} gap={6}>
                <Flex direction={['column', 'row']} alignItems="center" gap={6}>
                  <Box>
                    <Avatar 
                      size="xl" 
                      name={userData?.full_name || session?.user?.email}
                      src={getCorsProxyUrl(userData?.profile_picture_url || session?.user?.user_metadata?.avatar_url)}
                      bg="purple.500"
                      color="white"
                      shadow="md"
                      border="3px solid"
                      borderColor="white"
                    />
                    {/* Temporary debugging image */}
                    {process.env.NODE_ENV === 'development' && (
                      <Box display="none">
                        <img 
                          src={getCorsProxyUrl(userData?.profile_picture_url || session?.user?.user_metadata?.avatar_url)} 
                          alt="Debug" 
                          onLoad={() => console.log("Image loaded successfully")}
                          onError={(e) => console.error("Image failed to load:", e)}
                        />
                      </Box>
                    )}
                  </Box>
                  <Box textAlign={['center', 'left']}>
                    <Heading size="lg" className="font-bold">
                      {userData?.full_name || 'Student'}
                    </Heading>
                    <Text fontSize="md" mt={1} className="opacity-80">
                      {userData?.email || session?.user?.email}
                    </Text>
                    {userData?.institution && (
                      <Flex align="center" gap={2} mt={3}>
                        <GraduationCap size={18} className="opacity-80" />
                        <Text fontSize="sm" className="opacity-80">
                          {userData.institution} {userData.branch ? `• ${userData.branch}` : ''}
                        </Text>
                      </Flex>
                    )}
                  </Box>
                </Flex>
                <SimpleGrid columns={[2, 2, 3]} spacing={4} minW={['auto', '320px']} mt={[4, 0]}>
                  <Box bg="whiteAlpha.200" p={3} rounded="lg" backdropFilter="blur(4px)" textAlign="center">
                    <Text fontSize="sm" className="opacity-80">Semester</Text>
                    <Text fontSize="xl" fontWeight="bold">{semester}</Text>
                  </Box>
                  <Box bg="whiteAlpha.200" p={3} rounded="lg" backdropFilter="blur(4px)" textAlign="center">
                    <Text fontSize="sm" className="opacity-80">Credits</Text>
                    <Text fontSize="xl" fontWeight="bold">{totalCredits}</Text>
                  </Box>
                  <Box bg="whiteAlpha.200" p={3} rounded="lg" backdropFilter="blur(4px)" textAlign="center" 
                    gridColumn={[null, 'span 2', 'auto']}>
                    <Text fontSize="sm" className="opacity-80">Avg. GPA</Text>
                    <Text fontSize="xl" fontWeight="bold">{averageGPA}</Text>
                  </Box>
                </SimpleGrid>
              </Flex>
            </Box>

            {/* Stats cards */}
            {!loading && (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={2}>
                <Card overflow="hidden" variant="outline" shadow="md">
                  <CardBody p={0}>
                    <Flex>
                      <Box bg="purple.50" p={4} display="flex" alignItems="center" justifyContent="center">
                        <Icon as={Book} boxSize={6} color="purple.500" />
                      </Box>
                      <Stack p={4} flex={1}>
                        <Heading size="md" fontWeight="semibold">
                          {selectedCourses.length}
                        </Heading>
                        <Text fontSize="sm" color="gray.500">Current Courses</Text>
                      </Stack>
                    </Flex>
                  </CardBody>
                </Card>

                <Card overflow="hidden" variant="outline" shadow="md">
                  <CardBody p={0}>
                    <Flex>
                      <Box bg="indigo.50" p={4} display="flex" alignItems="center" justifyContent="center">
                        <Icon as={ClipboardList} boxSize={6} color="indigo.500" />
                      </Box>
                      <Stack p={4} flex={1}>
                        <Heading size="md" fontWeight="semibold">
                          {semesterCourses.length}
                        </Heading>
                        <Text fontSize="sm" color="gray.500">Completed Courses</Text>
                      </Stack>
                    </Flex>
                  </CardBody>
                </Card>

                <Card overflow="hidden" variant="outline" shadow="md">
                  <CardBody p={0}>
                    <Flex>
                      <Box bg="blue.50" p={4} display="flex" alignItems="center" justifyContent="center">
                        <Icon as={Calendar} boxSize={6} color="blue.500" />
                      </Box>
                      <Stack p={4} flex={1}>
                        <Heading size="md" fontWeight="semibold">
                          {academicRecords.length}
                        </Heading>
                        <Text fontSize="sm" color="gray.500">Semesters Completed</Text>
                      </Stack>
                    </Flex>
                  </CardBody>
                </Card>

                <Card overflow="hidden" variant="outline" shadow="md">
                  <CardBody p={0}>
                    <Flex>
                      <Box bg="pink.50" p={4} display="flex" alignItems="center" justifyContent="center">
                        <Icon as={Award} boxSize={6} color="pink.500" />
                      </Box>
                      <Stack p={4} flex={1}>
                        <Heading size="md" fontWeight="semibold">
                          {achievements.length}
                        </Heading>
                        <Text fontSize="sm" color="gray.500">Achievements</Text>
                      </Stack>
                    </Flex>
                  </CardBody>
                </Card>
              </SimpleGrid>
            )}

            {loading ? (
              <Flex justify="center" align="center" h="400px">
                <Spinner size="xl" color="purple.500" />
              </Flex>
            ) : (
              <Tabs colorScheme="purple" variant="enclosed" className="bg-white rounded-xl shadow-lg p-6">
                <TabList overflowX="auto" py={2} className="flex-nowrap">
                  <Tab className="flex items-center gap-2 whitespace-nowrap">
                    <User size={18} />
                    <span>Personal Info</span>
                  </Tab>
                  <Tab className="flex items-center gap-2 whitespace-nowrap">
                    <Bookmark size={18} />
                    <span>Academic Records</span>
                  </Tab>
                  <Tab className="flex items-center gap-2 whitespace-nowrap">
                    <BookOpen size={18} />
                    <span>Course History</span>
                  </Tab>
                  <Tab className="flex items-center gap-2 whitespace-nowrap">
                    <Award size={18} />
                    <span>Achievements</span>
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <PersonalInfoPanel userData={userData} />
                  </TabPanel>
                  <TabPanel>
                    <AcademicRecordsPanel 
                      academicRecords={academicRecords} 
                      userData={userData} 
                    />
                  </TabPanel>
                  <TabPanel>
                    <CourseHistoryPanel 
                      semesterCourses={semesterCourses} 
                      userData={userData}
                    />
                  </TabPanel>
                  <TabPanel>
                    <AchievementsPanel 
                      achievements={achievements}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard; 