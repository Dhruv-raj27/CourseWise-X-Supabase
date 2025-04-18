import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { supabase } from '../../lib/supabase';
import { XCircle, CheckCircle, Edit3, User as UserIcon, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Constants
const INSTITUTIONS = [
  'BITS Pilani',
  'IIT Delhi',
  'IIT Bombay',
  'IIT Madras',
  'NIT Warangal',
  'Delhi University',
  'Manipal Institute of Technology',
  'Other'
];

const BRANCHES = [
  'Computer Science',
  'Electronics and Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Other'
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
        } else if (userData) {
          setUser(userData as User);
          setFormData(userData as User);
        }
      } catch (error) {
        console.error('Error in user profile:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleArrayInputChange = (name: string, value: string) => {
    const currentValues = formData[name as keyof User] as string[] || [];
    if (!currentValues.includes(value) && value.trim() !== '') {
      setFormData({
        ...formData,
        [name]: [...currentValues, value]
      });
    }
  };

  const handleArrayItemRemove = (name: string, index: number) => {
    const currentValues = formData[name as keyof User] as string[] || [];
    setFormData({
      ...formData,
      [name]: currentValues.filter((_, i) => i !== index)
    });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);
      
      if (error) {
        setError('Failed to update profile: ' + error.message);
      } else {
        setUser({...user, ...formData} as User);
        setSuccess('Profile updated successfully!');
        setEditMode(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user as User);
    setEditMode(false);
    setError(null);
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExtension}`;
    
    setUploadingImage(true);
    setError(null);
    
    try {
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
      
      if (urlData) {
        // Update the user profile with the new image URL
        const { error: updateError } = await supabase
          .from('users')
          .update({ profile_picture_url: urlData.publicUrl })
          .eq('id', user.id);
        
        if (updateError) {
          throw updateError;
        }
        
        // Update local state
        setUser({
          ...user,
          profile_picture_url: urlData.publicUrl
        });
        
        setFormData({
          ...formData,
          profile_picture_url: urlData.publicUrl
        });
        
        setSuccess('Profile picture updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError('Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center">
        <h3 className="text-xl font-semibold text-gray-700">User not found</h3>
        <p className="mt-2 text-gray-500">Please login to view your profile.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header with profile picture */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 md:p-8 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200 flex items-center justify-center ${uploadingImage ? 'opacity-50' : ''}`}>
              {user.profile_picture_url ? (
                <img 
                  src={user.profile_picture_url} 
                  alt={user.full_name || 'User'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={48} className="text-gray-400" />
              )}
              
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            {editMode && (
              <label 
                htmlFor="profile-picture-upload" 
                className="absolute bottom-0 right-0 bg-white text-purple-600 rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload size={16} />
                <input 
                  type="file" 
                  id="profile-picture-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{user.full_name || 'Student'}</h1>
            <p className="opacity-90">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{user.role || 'Student'}</span>
              {user.institution && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">{user.institution}</span>
              )}
            </div>
          </div>
        </div>
        
        {!editMode ? (
          <button 
            onClick={() => setEditMode(true)} 
            className="absolute top-6 right-6 text-white hover:text-indigo-100 transition-colors"
          >
            <Edit3 size={20} />
          </button>
        ) : (
          <div className="absolute top-6 right-6 flex gap-2">
            <button 
              onClick={handleCancel}
              className="text-white hover:text-indigo-100 transition-colors"
              disabled={saving}
            >
              <XCircle size={20} />
            </button>
            <button 
              onClick={handleSave}
              className="text-white hover:text-indigo-100 transition-colors"
              disabled={saving}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <CheckCircle size={20} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error and success messages */}
      {error && (
        <div className="mx-6 md:mx-8 mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start gap-2">
          <XCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mx-6 md:mx-8 mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start gap-2">
          <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Main content */}
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Personal Details */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <p className="text-gray-800">{user.full_name || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-800">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <p className="text-gray-800">{user.phone_number || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-800">{user.bio || 'Not specified'}</p>
                )}
              </div>
            </div>
          </section>
          
          {/* Academic Details */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Academic Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Institution</label>
                {editMode ? (
                  <select
                    name="institution"
                    value={formData.institution || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Institution</option>
                    {INSTITUTIONS.map((institution) => (
                      <option key={institution} value={institution}>{institution}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-800">{user.institution || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Branch / Major</label>
                {editMode ? (
                  <select
                    name="branch"
                    value={formData.branch || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Branch</option>
                    {BRANCHES.map((branch) => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-800">{user.branch || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Current Semester</label>
                {editMode ? (
                  <select
                    name="semester"
                    value={formData.semester || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Semester</option>
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-800">{user.semester ? `Semester ${user.semester}` : 'Not specified'}</p>
                )}
              </div>
            </div>
          </section>
          
          {/* Preferences */}
          <section className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Career & Course Preferences</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Primary Interest</label>
                {editMode ? (
                  <input
                    type="text"
                    name="primary_interest"
                    value={formData.primary_interest || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Machine Learning"
                  />
                ) : (
                  <p className="text-gray-800">{user.primary_interest || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Secondary Interest</label>
                {editMode ? (
                  <input
                    type="text"
                    name="secondary_interest"
                    value={formData.secondary_interest || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Web Development"
                  />
                ) : (
                  <p className="text-gray-800">{user.secondary_interest || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Career Goal</label>
                {editMode ? (
                  <input
                    type="text"
                    name="career_goal"
                    value={formData.career_goal || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. Software Engineer"
                  />
                ) : (
                  <p className="text-gray-800">{user.career_goal || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Experience Level</label>
                {editMode ? (
                  <select
                    name="experience_level"
                    value={formData.experience_level || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                ) : (
                  <p className="text-gray-800">{user.experience_level || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Preferred Course Format</label>
                {editMode ? (
                  <select
                    name="course_format"
                    value={formData.course_format || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Format</option>
                    <option value="Online">Online</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                ) : (
                  <p className="text-gray-800">{user.course_format || 'Not specified'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Time Commitment</label>
                {editMode ? (
                  <select
                    name="time_commitment"
                    value={formData.time_commitment || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Commitment</option>
                    <option value="1-3 hours/week">1-3 hours/week</option>
                    <option value="4-6 hours/week">4-6 hours/week</option>
                    <option value="7-10 hours/week">7-10 hours/week</option>
                    <option value="10+ hours/week">10+ hours/week</option>
                  </select>
                ) : (
                  <p className="text-gray-800">{user.time_commitment || 'Not specified'}</p>
                )}
              </div>
            </div>
          </section>
          
          {/* Skills & Areas for Improvement */}
          <section className="md:col-span-2 mt-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Skills & Areas for Improvement</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Technical Skills</label>
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="technical_skills_input"
                        placeholder="Add a skill"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleArrayInputChange('technical_skills', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        onClick={() => {
                          const input = document.getElementById('technical_skills_input') as HTMLInputElement;
                          handleArrayInputChange('technical_skills', input.value);
                          input.value = '';
                          input.focus();
                        }}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.technical_skills || []).map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            className="text-purple-600 hover:text-purple-800"
                            onClick={() => handleArrayItemRemove('technical_skills', index)}
                          >
                            <XCircle size={16} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.technical_skills && user.technical_skills.length > 0 ? (
                      user.technical_skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No technical skills specified</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Soft Skills</label>
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="soft_skills_input"
                        placeholder="Add a skill"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleArrayInputChange('soft_skills', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        onClick={() => {
                          const input = document.getElementById('soft_skills_input') as HTMLInputElement;
                          handleArrayInputChange('soft_skills', input.value);
                          input.value = '';
                          input.focus();
                        }}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.soft_skills || []).map((skill, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleArrayItemRemove('soft_skills', index)}
                          >
                            <XCircle size={16} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.soft_skills && user.soft_skills.length > 0 ? (
                      user.soft_skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No soft skills specified</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Areas for Improvement</label>
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="improvement_areas_input"
                        placeholder="Add an area"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleArrayInputChange('improvement_areas', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        onClick={() => {
                          const input = document.getElementById('improvement_areas_input') as HTMLInputElement;
                          handleArrayInputChange('improvement_areas', input.value);
                          input.value = '';
                          input.focus();
                        }}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.improvement_areas || []).map((area, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                        >
                          {area}
                          <button
                            type="button"
                            className="text-amber-600 hover:text-amber-800"
                            onClick={() => handleArrayItemRemove('improvement_areas', index)}
                          >
                            <XCircle size={16} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.improvement_areas && user.improvement_areas.length > 0 ? (
                      user.improvement_areas.map((area, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No improvement areas specified</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Certifications</label>
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="certifications_input"
                        placeholder="Add a certification"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleArrayInputChange('certifications', (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        onClick={() => {
                          const input = document.getElementById('certifications_input') as HTMLInputElement;
                          handleArrayInputChange('certifications', input.value);
                          input.value = '';
                          input.focus();
                        }}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData.certifications || []).map((cert, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {cert}
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleArrayItemRemove('certifications', index)}
                          >
                            <XCircle size={16} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.certifications && user.certifications.length > 0 ? (
                      user.certifications.map((cert, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {cert}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No certifications specified</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer actions */}
      {editMode && (
        <div className="bg-gray-50 px-6 md:px-8 py-4 border-t border-gray-200 flex justify-end gap-4">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
            disabled={saving}
          >
            {saving && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>}
            Save Changes
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default UserProfile; 