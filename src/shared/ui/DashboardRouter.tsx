/**
 * DashboardRouter - Redirects users to their appropriate dashboard based on user_type and roles
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useUserRoles } from '@/hooks/shared/useUserRoles';
import { Loader2 } from 'lucide-react';

export default function DashboardRouter() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { isAdmin, isTrustAgent, loading: rolesLoading } = useUserRoles();

  useEffect(() => {
    // Wait for both auth and roles to load
    if (authLoading || rolesLoading) return;

    // Not logged in - redirect to login
    if (!user) {
      navigate('/connexion', { replace: true });
      return;
    }

    // Check system roles first (from user_roles table)
    if (isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    if (isTrustAgent) {
      navigate('/trust-agent/dashboard', { replace: true });
      return;
    }

    // Redirect based on user_type from profile
    const userType = profile?.user_type || profile?.active_role;

    switch (userType) {
      case 'owner':
      case 'proprietaire':
        navigate('/dashboard/proprietaire', { replace: true });
        break;
      case 'agent':
      case 'agence':
        navigate('/dashboard/agence', { replace: true });
        break;
      case 'tenant':
      case 'locataire':
      default:
        navigate('/dashboard/locataire', { replace: true });
        break;
    }
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
