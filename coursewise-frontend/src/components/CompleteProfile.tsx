import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Predefined lists for dropdowns
const INSTITUTIONS = ['Indraprastha Institute of Information Technology Delhi (IIIT Delhi)'];

const BRANCHES = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Computational Biology',
  'Computer Science and Applied Mathematics',
  'Computer Science and Design',
  'Computer Science and Social Sciences',
  'Computer Science and Artificial Intelligence',
  'Computer Science and Biosciences'
];

const SEMESTERS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    institution: '',
    branch: '',
    semester: ''
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
        return;
      }
      setUser(user);
    };
    getUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) {
        throw new Error('No user found');
      }

      // Update user profile in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          institution: formData.institution,
          branch: formData.branch,
          semester: parseInt(formData.semester),
          email_verified: user.email_confirmed_at !== null
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Profile completed successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to complete profile');
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide your academic details to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                Institution
              </label>
              <div className="mt-1">
                <input
                  id="institution"
                  name="institution"
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                           shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                           focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                Branch/Department
              </label>
              <div className="mt-1">
                <input
                  id="branch"
                  name="branch"
                  type="text"
                  required
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                           shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                           focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Current Semester
              </label>
              <div className="mt-1">
                <input
                  id="semester"
                  name="semester"
                  type="number"
                  required
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                           shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                           focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                         shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 