import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // You'll need to install framer-motion
import { useNavigate } from 'react-router-dom';
import { FormData } from '../types/formData';
import { Course } from '../types/index';

interface UserInputProps {
  onComplete: (preferences: FormData) => void;
}

interface UserFormData {
  institution: string;
  currentSemester: string;
  stream: string;
  careerGoal: string;
  preparationType: string;
  certifications: string;
  technicalSkills: string;
  improvementAreas: string;
  courseFormat: string;
  timeCommitment: string;
  courseStyle: string;
  primaryInterest?: string;
  secondaryInterest?: string;
  experienceLevel?: string;
  workEnvironment?: string;
  futureGoal?: string;
  preparationTimeline?: string;
  softSkills: string;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"/>
  </div>
);

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
  <div className="w-full max-w-md mx-auto mb-8">
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-1/2 transform -translate-y-1/2 h-1 w-full bg-gray-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          className="h-full bg-blue-500 rounded-full"
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div
            key={step}
            className={`
              relative z-10 flex items-center justify-center
              w-10 h-10 rounded-full transition-all duration-300
              ${
                step === currentStep
                  ? 'bg-blue-500 text-white scale-110 shadow-lg'
                  : step < currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border-2 border-gray-200'
              }
            `}
          >
            <AnimatePresence mode='wait'>
              <motion.div
                key={step < currentStep ? 'check' : step}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}
              >
                {step < currentStep ? (
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">
                    {step}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>

    {/* Step labels */}
    <div className="mt-4 flex justify-between text-sm text-gray-600">
      <span className={currentStep === 1 ? 'text-blue-500 font-medium' : ''}>Basic Info</span>
      <span className={currentStep === 2 ? 'text-blue-500 font-medium' : ''}>Academic</span>
      <span className={currentStep === 3 ? 'text-blue-500 font-medium' : ''}>Goals</span>
      <span className={currentStep === 4 ? 'text-blue-500 font-medium' : ''}>Skills</span>
      <span className={currentStep === 5 ? 'text-blue-500 font-medium' : ''}>Preferences</span>
      <span className={currentStep === 6 ? 'text-blue-500 font-medium' : ''}>Future</span>
    </div>
  </div>
);

const CustomGroupedSelect: React.FC<{
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  activeInstitutions: string[];
  comingSoonInstitutions: string[];
  placeholder: string;
  label: string;
}> = ({ name, value, onChange, activeInstitutions, comingSoonInstitutions, placeholder, label }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      aria-label={label}
      className="
        appearance-none w-full px-4 py-3
        bg-gray-50 border border-gray-200
        rounded-lg focus:ring-2 focus:ring-blue-200
        transition-all duration-200 ease-in-out
        hover:border-blue-300
        text-gray-700
      "
    >
      <option value="">{placeholder}</option>
      
      <optgroup label="Available">
        {activeInstitutions.map((institution) => (
          <option key={institution} value={institution}>
            {institution}
          </option>
        ))}
      </optgroup>

      <optgroup label="Coming Soon">
        {comingSoonInstitutions.map((institution) => (
          <option key={institution} value={institution} disabled className="text-gray-400">
            {institution} (Coming Soon)
          </option>
        ))}
      </optgroup>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
      </svg>
    </div>
  </div>
);

const CustomSelect: React.FC<{
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  label: string;
}> = ({ name, value, onChange, options, placeholder, label }) => (
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      aria-label={label}
      className="
        appearance-none w-full px-4 py-3
        bg-gray-50 border border-gray-200
        rounded-lg focus:ring-2 focus:ring-blue-200
        transition-all duration-200 ease-in-out
        hover:border-blue-300
        text-gray-700
      "
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
      </svg>
    </div>
  </div>
);

const UserInput: React.FC<UserInputProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    institution: '',
    currentSemester: '',
    stream: '',
    careerGoal: '',
    preparationType: '',
    certifications: '',
    technicalSkills: '',
    improvementAreas: '',
    courseFormat: '',
    timeCommitment: '',
    courseStyle: '',
    softSkills: '',
  });

  const handleNext = async () => {
    if (currentStep === 6) {
      setIsLoading(true);
      try {
        // Format the data according to FormData interface
        const formattedData: FormData = {
          interests: [formData.primaryInterest, formData.secondaryInterest].filter((x): x is string => !!x),
          experience: formData.experienceLevel || '',
          goals: [formData.careerGoal, formData.futureGoal].filter((x): x is string => !!x),
          timeCommitment: formData.timeCommitment,
          preferredDifficulty: formData.experienceLevel === 'Beginner - Just starting out' ? 'beginner' :
                              formData.experienceLevel === 'Intermediate - Some experience' ? 'intermediate' :
                              'advanced'
        };

        // Call the onComplete callback with the formatted data
        await onComplete(formattedData);

        // Navigate back to recommendations page
        navigate('/courses/recommendations/results');
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const institutions = {
    active: ['Indraprastha Institute of Information Technology Delhi'],
    comingSoon: [
      // IITs
      'Indian Institute of Technology Delhi',
      'Indian Institute of Technology Bombay',
      'Indian Institute of Technology Madras',
      'Indian Institute of Technology Kanpur',
      'Indian Institute of Technology Kharagpur',
      'Indian Institute of Technology Roorkee',
      'Indian Institute of Technology Guwahati',
      // NITs
      'National Institute of Technology Trichy',
      'National Institute of Technology Surathkal',
      'National Institute of Technology Warangal',
      'National Institute of Technology Calicut',
      'National Institute of Technology Rourkela',
      'National Institute of Technology Delhi',
      // Add more universities
      'Delhi Technological University',
      'Netaji Subhas University of Technology',
      'Jamia Millia Islamia',
      'Delhi University',
      'Guru Gobind Singh Indraprastha University'
    ]
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderStep = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }

    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">Current Academic Status</h2>
              <p className="text-gray-600 text-center mb-8">
                Where are you in your academic journey? Let's find the best courses for your current stage!
              </p>
              <div className="space-y-6">
                <CustomGroupedSelect
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  activeInstitutions={institutions.active}
                  comingSoonInstitutions={institutions.comingSoon}
                  placeholder="Select Institution"
                  label="Select your Institution"
                />

                {formData.institution && !institutions.active.includes(formData.institution) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 text-yellow-800">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-medium">Coming Soon!</p>
                        <p className="text-sm">
                          We're currently working on adding course data for more institutions. 
                          Stay tuned for updates!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <CustomSelect
                  name="currentSemester"
                  value={formData.currentSemester}
                  onChange={handleChange}
                  options={['1', '2', '3', '4', '5', '6', '7', '8']}
                  placeholder="Select Semester"
                  label="What is your Current Semester?"
                />

                {formData.institution === 'Indraprastha Institute of Information Technology Delhi' && (
                  <CustomSelect
                    name="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    options={[
                      'Computer Science and Engineering',
                      'Computer Science and AI',
                      'Computer Science and Biosciences',
                      'Computer Science and Design',
                      'Computer Science and Social Sciences',
                      'Electronics and Communications Engineering',
                      'Electronics and VLSI Engineering'
                    ]}
                    placeholder="Select your Stream"
                    label="What's your Stream?"
                  />
                )}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">Field of Interest</h2>
              <p className="text-gray-600 text-center mb-8">
                What areas of study excite you the most? This helps us tailor your course recommendations.
              </p>
              <div className="space-y-6">
                <CustomSelect
                  name="primaryInterest"
                  value={formData.primaryInterest || ''}
                  onChange={handleChange}
                  options={[
                    'Software Development',
                    'Artificial Intelligence & Machine Learning',
                    'Data Science & Analytics',
                    'Cybersecurity',
                    'Web Development',
                    'Mobile App Development',
                    'Cloud Computing',
                    'Internet of Things (IoT)',
                    'Robotics',
                    'Computer Graphics',
                    'Computer Networks',
                    'Database Management',
                    'Game Development',
                    'Blockchain Technology',
                    'Digital Design',
                    'Electronics & Communication'
                  ]}
                  placeholder="Select your primary interest"
                  label="What is your primary field of interest?"
                />

                <CustomSelect
                  name="secondaryInterest"
                  value={formData.secondaryInterest || ''}
                  onChange={handleChange}
                  options={[
                    'Project Management',
                    'UI/UX Design',
                    'Business Analytics',
                    'Digital Marketing',
                    'Technical Writing',
                    'Research & Development',
                    'System Administration',
                    'Quality Assurance',
                    'DevOps',
                    'Product Management'
                  ]}
                  placeholder="Select your secondary interest"
                  label="Any secondary areas of interest?"
                />

                <CustomSelect
                  name="experienceLevel"
                  value={formData.experienceLevel || ''}
                  onChange={handleChange}
                  options={[
                    'Beginner - Just starting out',
                    'Intermediate - Some experience',
                    'Advanced - Considerable experience',
                    'Expert - Professional experience'
                  ]}
                  placeholder="Select your experience level"
                  label="What's your experience level in your primary field?"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">Career Aspirations</h2>
              <p className="text-gray-600 text-center mb-8">
                Let's understand your career goals to better align your course selections.
              </p>
              <div className="space-y-6">
                <CustomSelect
                  name="careerGoal"
                  value={formData.careerGoal}
                  onChange={handleChange}
                  options={[
                    'Software Engineer',
                    'Data Scientist',
                    'AI/ML Engineer',
                    'Full Stack Developer',
                    'Research Scientist',
                    'Product Manager',
                    'System Architect',
                    'DevOps Engineer',
                    'Security Engineer',
                    'UI/UX Designer'
                  ]}
                  placeholder="Select your career goal"
                  label="Where do you see yourself in the next 3-5 years?"
                />

                <CustomSelect
                  name="workEnvironment"
                  value={formData.workEnvironment || ''}
                  onChange={handleChange}
                  options={[
                    'Corporate',
                    'Research',
                    'Startups',
                    'Freelancing',
                    'Academia',
                    'Government',
                    'Non-profit',
                    'Entrepreneurship'
                  ]}
                  placeholder="Select preferred work environment"
                  label="What type of work environment interests you?"
                />

                <CustomSelect
                  name="preparationType"
                  value={formData.preparationType}
                  onChange={handleChange}
                  options={[
                    'Higher Studies (MS/PhD)',
                    'Job Placements',
                    'Entrepreneurship',
                    'Research Positions',
                    'Industry Certifications'
                  ]}
                  placeholder="Select your preparation type"
                  label="Are you preparing for higher studies, job placements, or entrepreneurship?"
                />
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">Technical & Soft Skills</h2>
              <p className="text-gray-600 text-center mb-8">
                Help us understand your current skill set and areas for improvement.
              </p>
              <div className="space-y-6">
                <CustomSelect
                  name="technicalSkills"
                  value={formData.technicalSkills}
                  onChange={handleChange}
                  options={[
                    'Programming Languages (Python, Java, etc.)',
                    'Web Development (Full Stack)',
                    'Data Structures & Algorithms',
                    'Machine Learning & AI',
                    'Cloud Computing',
                    'Database Management',
                    'System Design',
                    'DevOps & CI/CD',
                    'Mobile Development',
                    'Computer Networks'
                  ]}
                  placeholder="Select your strongest technical skill"
                  label="What are your strongest technical skills?"
                />

                <CustomSelect
                  name="softSkills"
                  value={formData.softSkills}
                  onChange={handleChange}
                  options={[
                    'Communication',
                    'Problem Solving',
                    'Team Collaboration',
                    'Project Management',
                    'Leadership',
                    'Time Management',
                    'Critical Thinking',
                    'Adaptability'
                  ]}
                  placeholder="Select your strongest soft skill"
                  label="What soft skills would you like to develop?"
                />

                <CustomSelect
                  name="improvementAreas"
                  value={formData.improvementAreas}
                  onChange={handleChange}
                  options={[
                    'Technical Depth',
                    'Practical Experience',
                    'Theoretical Knowledge',
                    'Project Portfolio',
                    'Industry Knowledge',
                    'Research Skills',
                    'Leadership Skills',
                    'Communication Skills'
                  ]}
                  placeholder="Select area for improvement"
                  label="Which areas would you like to improve the most?"
                />
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">Learning Preferences & Constraints</h2>
              <p className="text-gray-600 text-center mb-8">
                How do you like to learn? Let's find courses that fit your style and schedule!
              </p>
              <div className="space-y-6">
                <CustomSelect
                  name="courseFormat"
                  value={formData.courseFormat}
                  onChange={handleChange}
                  options={[
                    'In-Person Lectures',
                    'Online Live Sessions',
                    'Hybrid Learning',
                    'Self-Paced Online',
                    'Project-Based Learning',
                    'Lab-Based Learning'
                  ]}
                  placeholder="Select preferred format"
                  label="What is your preferred course format?"
                />

                <CustomSelect
                  name="timeCommitment"
                  value={formData.timeCommitment}
                  onChange={handleChange}
                  options={[
                    '1-2 hours per week',
                    '3-5 hours per week',
                    '6-8 hours per week',
                    '9-12 hours per week',
                    '12+ hours per week'
                  ]}
                  placeholder="Select time commitment"
                  label="How much time can you dedicate to learning each week?"
                />

                <CustomSelect
                  name="courseStyle"
                  value={formData.courseStyle}
                  onChange={handleChange}
                  options={[
                    'Theory-focused',
                    'Practice-oriented',
                    'Project-based',
                    'Research-oriented',
                    'Industry-aligned',
                    'Balanced approach'
                  ]}
                  placeholder="Select learning style"
                  label="Would you like hands-on projects or more theoretical courses?"
                />
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-center mb-2">Future Planning</h2>
              <p className="text-gray-600 text-center mb-8">
                What's your next big goal—higher studies, job, or something else? Let's get you ready!
              </p>
              <div className="space-y-6">
                <CustomSelect
                  name="futureGoal"
                  value={formData.futureGoal || ''}
                  onChange={handleChange}
                  options={[
                    'Pursue Masters/PhD',
                    'Join Tech Industry',
                    'Start Own Company',
                    'Research Career',
                    'Join Academia',
                    'Freelancing'
                  ]}
                  placeholder="Select your future goal"
                  label="Where do you see yourself in the next 3-5 years career-wise?"
                />

                <CustomSelect
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  options={[
                    'Professional Certifications',
                    'Research Publications',
                    'Industry Internships',
                    'Competitive Programming',
                    'Open Source Contributions',
                    'Not Sure Yet'
                  ]}
                  placeholder="Select certification type"
                  label="Do you plan to take any certifications or competitive exams?"
                />

                <CustomSelect
                  name="preparationTimeline"
                  value={formData.preparationTimeline || ''}
                  onChange={handleChange}
                  options={[
                    'Next 6 months',
                    'Next 1 year',
                    'Next 2 years',
                    'After graduation',
                    'Not decided yet'
                  ]}
                  placeholder="Select timeline"
                  label="What's your timeline for achieving these goals?"
                />
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    const mockRecommendedCourses = [
      {
        id: 'CSE101',
        name: 'Introduction to Programming',
        description: 'Learn the basics of programming with Python',
        schedule: { days: 'Mon, Wed', time: '10:00 AM - 11:30 AM' },
        tags: ['Programming', 'Beginner', 'Python']
      },
      // Add more mock courses
    ];

    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-2">Your Personalized Course Path</h2>
          <p className="text-gray-600 text-center mb-8">
            Based on your responses, we've curated these courses just for you.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {mockRecommendedCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-gray-600 mt-1">{course.description}</p>
                  </div>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200">
                    Enroll
                  </button>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.schedule.days} • {course.schedule.time}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white backdrop-blur-lg bg-opacity-90 p-8 rounded-2xl shadow-xl"
        >
          {!showResults ? (
            <>
              <ProgressBar currentStep={currentStep} />
              <h1 className="text-2xl font-bold text-center mb-8">
                Find the right course for your future
              </h1>
              <AnimatePresence mode='wait'>
                {renderStep()}
              </AnimatePresence>
              <motion.div 
                className="flex justify-between mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={handleBack}
                  className={`
                    px-6 py-3 text-sm font-medium text-gray-700 
                    bg-gray-100 rounded-lg hover:bg-gray-200
                    transform transition-all duration-200 ease-in-out
                    hover:scale-105
                    ${currentStep === 1 ? 'invisible' : ''}
                  `}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="
                    group px-6 py-3 text-sm font-medium text-white 
                    bg-gradient-to-r from-blue-500 to-blue-600
                    rounded-lg hover:from-blue-600 hover:to-blue-700
                    transform transition-all duration-200 ease-in-out
                    hover:scale-105 hover:shadow-lg
                    flex items-center justify-center
                  "
                >
                  {currentStep === 6 ? 'Submit' : 'Continue'}
                  <svg 
                    className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            </>
          ) : (
            renderResults()
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserInput;