import { Outlet, useLocation } from 'react-router-dom';
import TenantDashboardLayout from './TenantDashboardLayout';
import { useAuth } from '@/app/providers/AuthProvider';
import { TENANT_ROLES } from '@/shared/constants/roles';
import OwnerDashboardLayout from '@/features/owner/components/OwnerDashboardLayout';

const ROUTE_TITLES = [
  { prefix: '/mon-espace', title: 'Mon Espace' },
  { prefix: '/messages', title: 'Messages' },
  { prefix: '/recherches-sauvegardees', title: 'Recherches sauvegardées' },
  { prefix: '/dashboard/locataire/calendrier', title: 'Calendrier' },
  { prefix: '/maintenance/nouvelle', title: 'Maintenance' },
  { prefix: '/visiter', title: 'Planifier une visite' },
  { prefix: '/candidature', title: 'Candidature' },
  { prefix: '/contrat', title: 'Contrat' },
  { prefix: '/signer-bail', title: 'Signature du bail' },
  { prefix: '/effectuer-paiement', title: 'Paiement' },
];

const getTitleForPath = (pathname: string) => {
  const match = ROUTE_TITLES.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.title ?? 'Mon espace';
};

export default function TenantSidebarLayout() {
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const title = getTitleForPath(pathname);
  const isTenant = profile?.user_type
    ? (TENANT_ROLES as readonly string[]).includes(profile.user_type)
    : false;
  const isOwner = profile?.user_type === 'owner' || profile?.user_type === 'proprietaire';

  if (!isTenant && !isOwner) {
    return <Outlet />;
  }

  if (isOwner) {
    return (
      <OwnerDashboardLayout title={title}>
        <Outlet />
      </OwnerDashboardLayout>
    );
  }

  return (
    <TenantDashboardLayout title={title}>
      <Outlet />
    </TenantDashboardLayout>
  );
}
