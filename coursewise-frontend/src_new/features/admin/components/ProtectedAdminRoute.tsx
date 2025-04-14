import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Flex, Spinner } from '@chakra-ui/react';
import { supabase } from '../../../lib/supabase';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          localStorage.removeItem('isAdmin');
          setIsLoading(false);
          return;
        }

        // Check if the user's email matches the admin email
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const isAdminUser = session.user.email === adminEmail;
        
        if (!isAdminUser) {
          localStorage.removeItem('isAdmin');
          setIsAdmin(false);
        } else {
          localStorage.setItem('isAdmin', 'true');
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        localStorage.removeItem('isAdmin');
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return (
      <Flex height="100vh" align="center" justify="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="purple.500"
          size="xl"
        />
      </Flex>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute; 