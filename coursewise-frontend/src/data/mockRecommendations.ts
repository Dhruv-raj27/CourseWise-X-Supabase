export const mockRecommendations = [
  // Core Technical Courses
  {
    id: "CSE101",
    code: "CSE101",
    name: "Data Structures and Algorithms",
    description: "Master fundamental data structures and algorithms. Learn about arrays, linked lists, trees, graphs, and essential algorithms for sorting and searching.",
    instructor: "Dr. Sarah Johnson",
    duration: "12 weeks",
    difficulty: "intermediate",
    prerequisites: [],
    antiRequisites: [],
    semester: "3",
    tags: ["DSA", "Programming", "Core"],
    enrollmentStatus: "Open",
    credits: 4
  },
  {
    id: "CSE102",
    code: "CSE102",
    name: "Object-Oriented Programming",
    description: "Deep dive into OOP concepts using Java. Learn inheritance, polymorphism, encapsulation, and design patterns.",
    instructor: "Prof. Michael Chen",
    duration: "14 weeks",
    difficulty: "intermediate",
    prerequisites: ["CSE101"],
    antiRequisites: [],
    semester: "3",
    tags: ["Java", "OOP", "Design Patterns"],
    enrollmentStatus: "Open",
    credits: 4
  },

  // AI/ML Track
  {
    id: "CSE521",
    code: "CSE521",
    name: "Deep Learning and Machine Learning",
    description: "Introduction to deep learning architectures and applications in machine learning. Covers neural networks, CNNs, RNNs, and transformers.",
    instructor: "Prof. Lisa Wang",
    duration: "16 weeks",
    difficulty: "advanced",
    prerequisites: ["CSE101"],
    antiRequisites: [],
    semester: "5",
    tags: ["AI", "ML", "Deep Learning"],
    enrollmentStatus: "Open",
    credits: 4
  },
  {
    id: "ECE564",
    code: "ECE564",
    name: "Reinforcement Learning",
    description: "Study of reinforcement learning algorithms and applications. Learn about Q-learning, policy gradients, and deep RL.",
    instructor: "Dr. James Wilson",
    duration: "12 weeks",
    difficulty: "advanced",
    prerequisites: ["CSE521"],
    antiRequisites: [],
    semester: "6",
    tags: ["AI", "RL", "Advanced"],
    enrollmentStatus: "Open",
    credits: 4
  },

  // Web/Mobile Development
  {
    id: "CSE511",
    code: "CSE511",
    name: "Full Stack Development",
    description: "Comprehensive course on modern web development. Learn React, Node.js, and related technologies.",
    instructor: "Prof. David Lee",
    duration: "16 weeks",
    difficulty: "intermediate",
    prerequisites: ["CSE102"],
    antiRequisites: [],
    semester: "5",
    tags: ["Web", "React", "Node.js"],
    enrollmentStatus: "Open",
    credits: 4
  },
  {
    id: "CSE512",
    code: "CSE512",
    name: "Mobile App Development",
    description: "Learn to build cross-platform mobile applications using React Native and modern mobile development practices.",
    instructor: "Dr. Emma Wilson",
    duration: "14 weeks",
    difficulty: "intermediate",
    prerequisites: ["CSE511"],
    antiRequisites: [],
    semester: "6",
    tags: ["Mobile", "React Native", "iOS/Android"],
    enrollmentStatus: "Open",
    credits: 4
  },

  // Systems and Security
  {
    id: "CSE345",
    code: "CSE345",
    name: "Computer Security",
    description: "Introduction to computer security principles, cryptographic systems, and network security.",
    instructor: "Prof. Robert Kim",
    duration: "12 weeks",
    difficulty: "intermediate",
    prerequisites: ["CSE101"],
    antiRequisites: [],
    semester: "5",
    tags: ["Security", "Cryptography", "Networks"],
    enrollmentStatus: "Open",
    credits: 4
  },
  {
    id: "CSE524",
    code: "CSE524",
    name: "Distributed Systems",
    description: "Study of distributed computing principles, consensus algorithms, and fault tolerance.",
    instructor: "Dr. Alex Thompson",
    duration: "14 weeks",
    difficulty: "advanced",
    prerequisites: ["CSE345"],
    antiRequisites: [],
    semester: "6",
    tags: ["Systems", "Distributed Computing", "Advanced"],
    enrollmentStatus: "Open",
    credits: 4
  },

  // Theory and Mathematics
  {
    id: "MTH372",
    code: "MTH372",
    name: "Statistical Inference",
    description: "Study of statistical inference techniques used in data science and AI applications.",
    instructor: "Prof. Maria Garcia",
    duration: "12 weeks",
    difficulty: "intermediate",
    prerequisites: [],
    antiRequisites: [],
    semester: "4",
    tags: ["Statistics", "Math", "Data Science"],
    enrollmentStatus: "Open",
    credits: 4
  },
  {
    id: "MTH523",
    code: "MTH523",
    name: "Advanced Algorithms",
    description: "Deep dive into advanced algorithmic techniques and complexity theory.",
    instructor: "Dr. John Smith",
    duration: "14 weeks",
    difficulty: "advanced",
    prerequisites: ["CSE101", "MTH372"],
    antiRequisites: [],
    semester: "6",
    tags: ["Algorithms", "Theory", "Advanced"],
    enrollmentStatus: "Open",
    credits: 4
  }
]; 