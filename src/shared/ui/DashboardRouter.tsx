/**
 * DashboardRouter - Redirects users to their appropriate dashboard based on user_type and roles
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useUserRoles } from '@/hooks/shared/useUserRoles';
import { Loader2 } from 'lucide-react';
import { getDashboardRoute } from '@/shared/utils/roleRoutes';

export default function DashboardRouter() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { isAdmin, isTrustAgent, loading: rolesLoading } = useUserRoles();

  useEffect(() => {
    console.log('DashboardRouter - authLoading:', authLoading, 'rolesLoading:', rolesLoading);
    console.log('DashboardRouter - user:', user, 'profile:', profile);

    // Wait for both auth and roles to load
    if (authLoading || rolesLoading) return;

    console.log('DashboardRouter - Checking user...');

    // Not logged in - redirect to login
    if (!user) {
      console.log('DashboardRouter - No user, redirecting to /connexion');
      navigate('/connexion', { replace: true });
      return;
    }

    console.log('DashboardRouter - User logged in, checking roles...');

    // Check system roles first (from user_roles table)
    if (isAdmin) {
      console.log('DashboardRouter - Admin user, redirecting to /admin');
      navigate('/admin', { replace: true });
      return;
    }

    if (isTrustAgent) {
      console.log('DashboardRouter - Trust agent, redirecting to /trust-agent/dashboard');
      navigate('/trust-agent/dashboard', { replace: true });
      return;
    }

    // Redirect based on user_type from profile using centralized logic
    const userType = profile?.user_type || profile?.active_role;

    if (!userType) {
      console.log('DashboardRouter - No user type defined, redirecting to role selection');
      navigate('/inscription', { replace: true });
      return;
    }

    const dashboardRoute = getDashboardRoute(userType);
    console.log('DashboardRouter - User type:', userType, 'redirecting to:', dashboardRoute);
    navigate(dashboardRoute, { replace: true });
  }, [user, profile, authLoading, rolesLoading, isAdmin, isTrustAgent, navigate]);

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Redirection en cours...</p>
      </div>
    </div>
  );
}
