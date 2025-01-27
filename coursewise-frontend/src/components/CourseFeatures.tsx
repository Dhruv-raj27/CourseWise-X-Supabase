import { Sparkles, AlertTriangle, MessageSquare, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CourseFeatures() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Course Recommendation',
      description: 'Get personalized course suggestions based on your profile',
      icon: Sparkles,
      path: '/courses/recommendations',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'TT-Clash Checker',
      description: 'Check and resolve course timing conflicts',
      icon: AlertTriangle,
      path: '/courses/clash-checker',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Course Reviews',
      description: 'Read and write course reviews from peers',
      icon: MessageSquare,
      path: '/courses/reviews',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'TimeTable Maker',
      description: 'Create your perfect semester schedule',
      icon: Calendar,
      path: '/courses/timetable',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-12">Academic Planning Tools</h1>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(feature.path)}
              className="group relative bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`} />
              <div className="relative z-10 text-gray-900 group-hover:text-white transition-colors duration-300">
                <Icon className="w-12 h-12 mb-4" />
                <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
} 