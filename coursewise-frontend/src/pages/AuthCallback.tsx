import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { SupabaseError } from '../types';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.user) {
          throw new Error('No user found in session');
        }

        const user = session.user;
        const isGoogleAuth = searchParams.get('provider') === 'google';
        const isSignUp = searchParams.get('mode') === 'signup';

        console.log('Auth flow:', { isGoogleAuth, isSignUp, email: user.email });

        try {
          // Check if user exists in our users table by email (not ID)
          const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();

          if (userError && userError.code !== 'PGRST116') {
            throw userError;
          }

          // Handle sign-up flow
          if (isSignUp) {
            if (existingUser) {
              // If user exists during sign-up, sign out and redirect back
              await supabase.auth.signOut();
              localStorage.clear();
              sessionStorage.clear();
              throw new Error('An account with this email already exists. Please sign in instead.');
            }

            console.log('Creating new user:', user.email);

            // First, try to delete any existing user record with this ID (if any)
            await supabase
              .from('users')
              .delete()
              .eq('id', user.id);

            // Create new user record
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                auth_provider: isGoogleAuth ? 'google' : 'email',
                email_verified: true,
                role: 'student',
                institution: '',
                branch: '',
                semester: null,
                certifications: [],
                technical_skills: [],
                improvement_areas: [],
                soft_skills: []
              });

            if (insertError) {
              console.error('Insert error:', insertError);
              // Try one more time without deleting
              const { error: retryError } = await supabase
                .from('users')
                .upsert({
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                  auth_provider: isGoogleAuth ? 'google' : 'email',
                  email_verified: true,
                  role: 'student',
                  institution: '',
                  branch: '',
                  semester: null,
                  certifications: [],
                  technical_skills: [],
                  improvement_areas: [],
                  soft_skills: []
                }, { onConflict: 'id' });

              if (retryError) {
                console.error('Retry error:', retryError);
                await supabase.auth.signOut();
                localStorage.clear();
                sessionStorage.clear();
                throw new Error('Failed to create user profile. Please try again.');
              }
            }

            // Store user data in localStorage
            const userData = {
              id: user.id,
              name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              email: user.email,
              branch: '',
              semester: null,
              role: 'student'
            };
            localStorage.setItem('user', JSON.stringify(userData));

            // Redirect new users to complete their profile
            toast.success('Please complete your profile');
            navigate('/complete-profile');
            return;
          }

          // Handle sign-in flow
          if (!existingUser) {
            // If user doesn't exist during sign-in, sign out and redirect back
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            throw new Error('No account found with this email. Please sign up first.');
          }

          // Verify auth provider matches for sign-in
          if (existingUser.auth_provider !== (isGoogleAuth ? 'google' : 'email')) {
            await supabase.auth.signOut();
            localStorage.clear();
            sessionStorage.clear();
            throw new Error(`This email is registered with ${existingUser.auth_provider}. Please use that method to sign in.`);
          }

          // Store user data in localStorage for existing user
          const userData = {
            id: existingUser.id,
            name: existingUser.full_name,
            email: existingUser.email,
            branch: existingUser.branch,
            semester: existingUser.semester,
            role: existingUser.role
          };
          localStorage.setItem('user', JSON.stringify(userData));

          // Successful login for existing user
          toast.success('Successfully signed in!');
          navigate('/dashboard');

        } catch (dbError: any) {
          console.error('Database error:', dbError);
          throw dbError;
        }

      } catch (error: unknown) {
        console.error('Auth callback error:', error);
        const supabaseError = error as SupabaseError;
        const errorMessage = supabaseError.message || 'An error occurred during authentication';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Ensure clean state
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect appropriately
        if (errorMessage.includes('Please sign in')) {
          navigate('/login');
        } else if (errorMessage.includes('Please sign up')) {
          navigate('/signup');
        } else {
          navigate('/login');
        }
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
} 