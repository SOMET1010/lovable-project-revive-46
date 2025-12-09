import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { useUserRoles } from '@/shared/hooks/useUserRoles';
import { Loader2 } from 'lucide-react';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: ReactNode;
  /** 
   * Allowed roles - can be:
   * - Business types from profiles.user_type: 'tenant', 'owner', 'agent', 'locataire', 'proprietaire', 'agence'
   * - System roles from user_roles table: 'admin', 'moderator', 'trust_agent', 'user'
   */
  allowedRoles?: string[];
  /** If true, requires admin role from user_roles table */
  requireAdmin?: boolean;
  /** If true, requires trust_agent role from user_roles table */
  requireTrustAgent?: boolean;
  /** If true, shows AccessDenied page instead of redirecting to home */
  showAccessDenied?: boolean;
  /** Custom message for AccessDenied page */
  accessDeniedMessage?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAdmin,
  requireTrustAgent,
  showAccessDenied = false,
  accessDeniedMessage
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading, profile } = useAuth();
  const { isAdmin, isTrustAgent, loading: rolesLoading, roles } = useUserRoles();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  const isLoading = authLoading || rolesLoading;

  useEffect(() => {
    if (isLoading) return;

    // Not logged in - redirect to login
    if (!user) {
      navigate('/connexion', { replace: true });
      return;
    }

    let accessGranted = true;

    // Check admin requirement
    if (requireAdmin && !isAdmin) {
      accessGranted = false;
    }

    // Check trust_agent requirement
    if (requireTrustAgent && !isTrustAgent) {
      accessGranted = false;
    }

    // Check role-based access
    if (accessGranted && allowedRoles && allowedRoles.length > 0) {
      const userType = profile?.user_type || profile?.active_role;
      
      // Check if user has any of the allowed roles
      // First check business type (from profile)
      const hasBusinessType = userType && allowedRoles.includes(userType);
      
      // Then check system roles (from user_roles table)
      const hasSystemRole = roles.some(role => allowedRoles.includes(role));
      
      // Admin always has access
      const adminOverride = isAdmin;
      
      if (!hasBusinessType && !hasSystemRole && !adminOverride) {
        accessGranted = false;
      }
    }

    setHasAccess(accessGranted);

    if (!accessGranted && !showAccessDenied) {
      navigate('/', { replace: true });
      return;
    }

    setAccessChecked(true);
  }, [user, isLoading, profile, allowedRoles, requireAdmin, requireTrustAgent, isAdmin, isTrustAgent, roles, navigate, showAccessDenied]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show AccessDenied page if configured and access is denied
  if (!hasAccess && showAccessDenied) {
    return <AccessDenied message={accessDeniedMessage} />;
  }

  // Wait for access check to complete before rendering
  if ((allowedRoles && allowedRoles.length > 0 || requireAdmin || requireTrustAgent) && !accessChecked) {
    return null;
  }

  return <>{children}</>;
}
