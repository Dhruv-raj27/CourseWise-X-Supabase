import { supabase } from '../lib/supabase';

export const auth = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  
  googleLogin: async (token: string) => {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token,
    });
    if (error) throw error;
    return data;
  },
  
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    institution: string;
    branch: string;
    semester: number;
  }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user?.id,
          name: userData.name,
          institution: userData.institution,
          branch: userData.branch,
          semester: userData.semester,
        },
      ]);
    if (profileError) throw profileError;

    return authData;
  }
};

export const courses = {
  getAllCourses: async (filters: {
    institution: string;
    branch: string;
    semester: number;
  }) => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('institution', filters.institution)
      .eq('branch', filters.branch)
      .eq('semester', filters.semester);
    if (error) throw error;
    return data;
  },
  
  getSelectedCourses: async (userId: string) => {
    const { data, error } = await supabase
      .from('selected_courses')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },
  
  selectCourse: async (courseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('selected_courses')
      .insert([
        {
          user_id: user.id,
          course_id: courseId,
        },
      ])
      .select();
    if (error) throw error;
    return data;
  }
}; 