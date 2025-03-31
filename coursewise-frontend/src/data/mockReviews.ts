export const mockReviews = [
  {
    _id: '1',
    courseName: 'Data Structures and Algorithms',
    courseCode: 'CSE101',
    professorName: 'Dr. Smith',
    rating: 4.5,
    difficulty: 3,
    review: 'Great course! The professor explains concepts clearly and provides good examples.',
    semester: '3',
    helpfulCount: 15,
    createdAt: '2024-03-15T10:00:00Z',
    anonymous: false,
    userId: {
      username: 'john_doe',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    }
  },
  {
    _id: '2',
    courseName: 'Computer Networks',
    courseCode: 'CSE201',
    professorName: 'Dr. Johnson',
    rating: 4.0,
    difficulty: 4,
    review: 'Challenging but rewarding course. Lots of practical assignments.',
    semester: '5',
    helpfulCount: 10,
    createdAt: '2024-03-14T15:30:00Z',
    anonymous: true,
    userId: {
      username: 'anonymous_user'
    }
  }
]; 