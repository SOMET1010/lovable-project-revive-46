/**
 * useNavigationItems - Centralized navigation items filtered by permissions
 * Returns only the menu items the current user has access to
 * Includes dynamic badge counts for real-time notifications
 */

import { useMemo } from 'react';
import { usePermissions } from './usePermissions';
import { useMenuBadges } from './useMenuBadges';
import type { BadgeColor } from '@/shared/ui/BadgeIndicator';
import {
  LayoutDashboard,
  User,
  Users,
  FileText,
  CreditCard,
  Calendar,
  Wrench,
  Award,
  Heart,
  MessageSquare,
  Search,
  Home,
  PlusCircle,
  Building2,
  ClipboardList,
  BarChart3,
  Shield,
  Key,
  Settings,
  Activity,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  TrendingUp,
  Eye,
  LucideIcon
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  hasBadge?: boolean;
  badgeCount?: number;
  badgeColor?: BadgeColor;
  badgePulse?: boolean;
  color?: string;
}

export interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

export function useNavigationItems() {
  const permissions = usePermissions();
  const badges = useMenuBadges();

  const tenantItems = useMemo(() => {
    const items: (NavigationItem & { visible: boolean })[] = [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, visible: true },
      { label: 'Mon Profil', href: '/profil', icon: User, visible: true },
      { 
        label: 'Mes Candidatures', 
        href: '/mes-candidatures', 
        icon: Users, 
        visible: permissions.isTenant || permissions.isAdmin,
        badgeCount: badges.pendingApplications,
        badgeColor: 'orange' as BadgeColor,
      },
      { 
        label: 'Mes Contrats', 
        href: '/mes-contrats', 
        icon: FileText, 
        visible: permissions.canViewOwnContracts,
        badgeCount: badges.contractsToSign,
        badgeColor: 'red' as BadgeColor,
      },
      { label: 'Mes Paiements', href: '/mes-paiements', icon: CreditCard, visible: permissions.canMakePayments },
      { label: 'Mes Visites', href: '/mes-visites', icon: Calendar, visible: permissions.canScheduleVisits },
      { label: 'Maintenance', href: '/maintenance/locataire', icon: Wrench, visible: permissions.canCreateMaintenanceRequest },
      { label: 'Mon Score', href: '/mon-score', icon: Award, visible: permissions.isTenant || permissions.isAdmin },
      { label: 'Historique Locations', href: '/profil/historique-locations', icon: Home, visible: permissions.isTenant || permissions.isAdmin },
      { label: 'Mes Favoris', href: '/favoris', icon: Heart, visible: permissions.isTenant || permissions.isAdmin },
      { 
        label: 'Messages', 
        href: '/messages', 
        icon: MessageSquare, 
        visible: permissions.canSendMessages, 
        hasBadge: true,
        badgeCount: badges.unreadMessages,
        badgeColor: 'green' as BadgeColor,
        badgePulse: true,
      },
    ];

    return items.filter(item => item.visible).map(({ visible: _visible, ...rest }) => rest);
  }, [permissions, badges]);

  const ownerItems = useMemo(() => {
    const items: (NavigationItem & { visible: boolean })[] = [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, visible: true },
      { label: 'Mon Profil', href: '/profil', icon: User, visible: true },
      { label: 'Mes Propriétés', href: '/dashboard/mes-proprietes', icon: Building2, visible: permissions.isOwner || permissions.isAdmin },
      { label: 'Ajouter un bien', href: '/ajouter-propriete', icon: PlusCircle, visible: permissions.canAddProperty },
      { 
        label: 'Candidatures reçues', 
        href: '/dashboard/candidatures', 
        icon: ClipboardList, 
        visible: permissions.isOwner || permissions.isAdmin,
        badgeCount: badges.receivedApplications,
        badgeColor: 'orange' as BadgeColor,
      },
      { 
        label: 'Mes Contrats', 
        href: '/dashboard/mes-contrats', 
        icon: FileText, 
        visible: permissions.canManageContracts,
        badgeCount: badges.ownerContractsToSign,
        badgeColor: 'red' as BadgeColor,
      },
      { 
        label: 'Maintenance', 
        href: '/dashboard/maintenance', 
        icon: Wrench, 
        visible: permissions.isOwner || permissions.isAdmin,
        badgeCount: badges.pendingMaintenance,
        badgeColor: 'blue' as BadgeColor,
      },
      { label: 'Statistiques', href: '/dashboard/statistiques', icon: BarChart3, visible: permissions.canViewAnalytics },
      { 
        label: 'Messages', 
        href: '/messages', 
        icon: MessageSquare, 
        visible: permissions.canSendMessages, 
        hasBadge: true,
        badgeCount: badges.unreadMessages,
        badgeColor: 'green' as BadgeColor,
        badgePulse: true,
      },
    ];

    return items.filter(item => item.visible).map(({ visible: _visible, ...rest }) => rest);
  }, [permissions, badges]);

  const agentItems = useMemo(() => {
    const items: (NavigationItem & { visible: boolean })[] = [
      { label: 'Tableau de bord', href: '/agency', icon: LayoutDashboard, visible: true },
      { label: 'Mon Profil', href: '/profil', icon: User, visible: true },
      { label: 'Propriétés gérées', href: '/agency/proprietes', icon: Building2, visible: permissions.isAgent || permissions.isAdmin },
      { label: 'Mandats', href: '/agency/mandats', icon: FileText, visible: permissions.isAgent || permissions.isAdmin },
      { label: 'Candidatures', href: '/agency/candidatures', icon: ClipboardList, visible: permissions.isAgent || permissions.isAdmin },
      { label: 'Contrats', href: '/agency/contrats', icon: FileText, visible: permissions.canManageContracts },
      { 
        label: 'Messages', 
        href: '/messages', 
        icon: MessageSquare, 
        visible: permissions.canSendMessages, 
        hasBadge: true,
        badgeCount: badges.unreadMessages,
        badgeColor: 'green' as BadgeColor,
        badgePulse: true,
      },
    ];

    return items.filter(item => item.visible).map(({ visible: _visible, ...rest }) => rest);
  }, [permissions, badges]);

  const adminSections = useMemo(() => {
    const sections: (NavigationSection & { visible: boolean })[] = [
      {
        section: 'Vue d\'ensemble',
        visible: permissions.isAdmin,
        items: [
          { label: 'Dashboard', href: '/admin/tableau-de-bord', icon: LayoutDashboard, color: 'text-blue-600' },
          { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'text-purple-600' },
        ]
      },
      {
        section: 'Gestion Utilisateurs',
        visible: permissions.canManageUsers,
        items: [
          { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: Users, color: 'text-green-600' },
          { label: 'Rôles & Permissions', href: '/admin/gestion-roles', icon: Shield, color: 'text-orange-600' },
          { label: 'Trust Agents', href: '/admin/trust-agents', icon: UserCheck, color: 'text-cyan-600' },
        ]
      },
      {
        section: 'Gestion Contenu',
        visible: permissions.isAdmin || permissions.isModerator,
        items: [
          { label: 'Propriétés', href: '/admin/properties', icon: Home, color: 'text-emerald-600' },
          { label: 'Transactions', href: '/admin/transactions', icon: FileText, color: 'text-indigo-600' },
          { label: 'CEV Management', href: '/admin/cev-management', icon: CheckCircle, color: 'text-teal-600' },
        ]
      },
      {
        section: 'Monitoring Système',
        visible: permissions.isAdmin,
        items: [
          { label: 'Service Monitoring', href: '/admin/service-monitoring', icon: Activity, color: 'text-red-600' },
          { label: 'API Keys', href: '/admin/api-keys', icon: Key, color: 'text-yellow-600' },
          { label: 'Logs & Erreurs', href: '/admin/logs', icon: AlertTriangle, color: 'text-red-500' },
        ]
      },
      {
        section: 'Configuration',
        visible: permissions.isAdmin,
        items: [
          { label: 'Règles Métier', href: '/admin/regles-metier', icon: Settings, color: 'text-orange-600' },
          { label: 'Service Providers', href: '/admin/service-providers', icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Service Configuration', href: '/admin/service-configuration', icon: Settings, color: 'text-gray-600' },
          { label: 'Data Generator', href: '/admin/test-data-generator', icon: Eye, color: 'text-purple-500' },
        ]
      }
    ];

    return sections.filter(section => section.visible).map(({ visible: _visible, ...rest }) => rest);
  }, [permissions]);

  const bottomItems = useMemo(() => {
    return [
      { label: 'Rechercher', href: '/recherche', icon: Search },
    ];
  }, []);

  return {
    tenantItems,
    ownerItems,
    agentItems,
    adminSections,
    bottomItems,
    permissions,
    badges,
  };
}

export default useNavigationItems;
