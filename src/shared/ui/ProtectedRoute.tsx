import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuthStore();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion', { replace: true });
    }
  }, [user, loading, navigate]);

  // Check role-based access
  useEffect(() => {
    if (!loading && user && allowedRoles && allowedRoles.length > 0) {
      const userRole = profile?.user_type || profile?.active_role;
      if (userRole && !allowedRoles.includes(userRole)) {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, profile, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
