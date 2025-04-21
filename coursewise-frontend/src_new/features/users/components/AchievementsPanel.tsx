import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  VStack,
  Badge,
  HStack,
  Icon
} from '@chakra-ui/react';
import {
  Award,
  Trophy,
  Medal,
  BookOpen,
  Target,
  Star,
  TrendingUp,
  Zap,
  CheckCircle
} from 'lucide-react';

interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  semester_number: number | null;
  awarded_at: string;
}

interface AchievementsPanelProps {
  achievements: Achievement[];
}

const AchievementsPanel = ({ achievements }: AchievementsPanelProps) => {
  // Get icon based on achievement type
  const getAchievementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'academic':
        return BookOpen;
      case 'honor':
        return Trophy;
      case 'excellence':
        return Star;
      case 'improvement':
        return TrendingUp;
      case 'milestone':
        return Target;
      case 'performance':
        return Zap;
      case 'completion':
        return CheckCircle;
      default:
        return Award;
    }
  };

  // Get color scheme based on achievement type
  const getColorScheme = (type: string) => {
    switch (type.toLowerCase()) {
      case 'academic':
        return 'blue';
      case 'honor':
        return 'purple';
      case 'excellence':
        return 'yellow';
      case 'improvement':
        return 'green';
      case 'milestone':
        return 'teal';
      case 'performance':
        return 'orange';
      case 'completion':
        return 'cyan';
      default:
        return 'purple';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box>
      <Heading size="md" color="purple.700" mb={6}>Achievements & Badges</Heading>

      {achievements.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {achievements.map((achievement) => (
            <Box
              key={achievement.id}
              bg="white"
              borderRadius="xl"
              boxShadow="md"
              overflow="hidden"
              transition="transform 0.3s, box-shadow 0.3s"
              _hover={{
                transform: 'translateY(-5px)',
                boxShadow: 'lg',
              }}
            >
              <Box
                bg={`${getColorScheme(achievement.achievement_type)}.100`}
                p={4}
                borderBottom="1px"
                borderColor={`${getColorScheme(achievement.achievement_type)}.200`}
              >
                <Flex align="center" justify="space-between" mb={1}>
                  <Badge
                    colorScheme={getColorScheme(achievement.achievement_type)}
                    px={2}
                    py={1}
                    borderRadius="full"
                    textTransform="capitalize"
                  >
                    {achievement.achievement_type}
                  </Badge>
                  <HStack spacing={1}>
                    <Icon
                      as={Medal}
                      color={`${getColorScheme(achievement.achievement_type)}.500`}
                      boxSize={4}
                    />
                    {achievement.semester_number && (
                      <Text fontSize="xs" fontWeight="medium" color="gray.600">
                        Semester {achievement.semester_number}
                      </Text>
                    )}
                  </HStack>
                </Flex>
                <Heading
                  size="sm"
                  color={`${getColorScheme(achievement.achievement_type)}.800`}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon
                    as={getAchievementIcon(achievement.achievement_type)}
                    color={`${getColorScheme(achievement.achievement_type)}.500`}
                    boxSize={5}
                  />
                  {achievement.title}
                </Heading>
              </Box>
              <VStack align="stretch" p={4} spacing={2}>
                {achievement.description && (
                  <Text fontSize="sm" color="gray.600">
                    {achievement.description}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500" fontStyle="italic">
                  Awarded on {formatDate(achievement.awarded_at)}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Box
          textAlign="center"
          py={10}
          px={6}
          borderRadius="lg"
          bg="purple.50"
          color="purple.600"
        >
          <Flex direction="column" align="center" justify="center">
            <Trophy size={48} className="mb-4 opacity-60" />
            <Heading size="md" mb={2}>No Achievements Yet</Heading>
            <Text fontSize="sm" maxW="md" mx="auto">
              As you progress through your academic journey, you'll earn achievements that will appear here.
              Keep up the good work!
            </Text>
          </Flex>
        </Box>
      )}

      {/* Achievement types information */}
      {achievements.length > 0 && (
        <Box mt={10} p={4} borderRadius="lg" bg="gray.50">
          <Heading size="sm" mb={4} color="gray.700">Achievement Types</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {[
              { type: 'Academic', icon: BookOpen, description: 'For scholarly accomplishments' },
              { type: 'Honor', icon: Trophy, description: 'Special recognition awards' },
              { type: 'Excellence', icon: Star, description: 'Outstanding performance' },
              { type: 'Improvement', icon: TrendingUp, description: 'Growth and progress' },
              { type: 'Milestone', icon: Target, description: 'Reaching significant goals' },
              { type: 'Performance', icon: Zap, description: 'Exceptional results in courses' }
            ].map((item) => (
              <Flex key={item.type} align="center" gap={3}>
                <Box
                  p={2}
                  borderRadius="full"
                  bg={`${getColorScheme(item.type.toLowerCase())}.100`}
                >
                  <Icon
                    as={item.icon}
                    color={`${getColorScheme(item.type.toLowerCase())}.500`}
                    boxSize={4}
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">{item.type}</Text>
                  <Text fontSize="xs" color="gray.600">{item.description}</Text>
                </Box>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default AchievementsPanel; 