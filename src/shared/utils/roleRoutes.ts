/**
 * Role-based routes configuration
 * Centralizes all role-specific routing logic
 */

export type UserRole = 'locataire' | 'proprietaire' | 'agence' | 'tenant' | 'owner' | 'agent';

/**
 * Dashboard routes by role
 * Structure : /{userType}/dashboard
 */
export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  locataire: '/locataire/dashboard',
  tenant: '/locataire/dashboard', // Alias for locataire
  proprietaire: '/proprietaire/dashboard',
  owner: '/proprietaire/dashboard', // Alias for proprietaire
  agence: '/agences/dashboard',
  agent: '/agences/dashboard', // Alias for agence
};

/**
 * Other common routes by role
 */
export const ROLE_ROUTES: Record<string, Record<UserRole, string>> = {
  profile: {
    locataire: '/profil',
    tenant: '/profil',
    proprietaire: '/profil',
    owner: '/profil',
    agence: '/profil',
    agent: '/profil',
  },
  addProperty: {
    locataire: '/dashboard/ajouter-propriete',
    tenant: '/dashboard/ajouter-propriete',
    proprietaire: '/dashboard/ajouter-propriete',
    owner: '/dashboard/ajouter-propriete',
    agence: '/dashboard/ajouter-propriete',
    agent: '/dashboard/ajouter-propriete',
  },
  contracts: {
    locataire: '/mes-contrats',
    tenant: '/mes-contrats',
    proprietaire: '/proprietaire/contrats',
    owner: '/proprietaire/contrats',
    agence: '/proprietaire/contrats',
    agent: '/proprietaire/contrats',
  },
  applications: {
    locataire: '/mes-candidatures',
    tenant: '/mes-candidatures',
    proprietaire: '/proprietaire/candidatures',
    owner: '/proprietaire/candidatures',
    agence: '/proprietaire/candidatures',
    agent: '/proprietaire/candidatures',
  },
  messages: {
    locataire: '/messages',
    tenant: '/messages',
    proprietaire: '/messages',
    owner: '/messages',
    agence: '/messages',
    agent: '/messages',
  },
};

/**
 * Normalize role names to standard format
 */
export function normalizeRole(role: string): UserRole {
  const roleMapping: Record<string, UserRole> = {
    'locataire': 'locataire',
    'tenant': 'tenant',
    'proprietaire': 'proprietaire',
    'owner': 'owner',
    'agence': 'agence',
    'agent': 'agent',
  };

  return roleMapping[role.toLowerCase()] || 'locataire';
}

/**
 * Get dashboard route for a role
 */
export function getDashboardRoute(role: string | undefined): string {
  if (!role) return DASHBOARD_ROUTES.locataire;
  const normalizedRole = normalizeRole(role);
  return DASHBOARD_ROUTES[normalizedRole] || DASHBOARD_ROUTES.locataire;
}

/**
 * Get route for a specific route type and role
 */
export function getRoleRoute(routeType: keyof typeof ROLE_ROUTES, role: string | undefined): string {
  if (!role) return ROLE_ROUTES[routeType].locataire;
  const normalizedRole = normalizeRole(role);
  return ROLE_ROUTES[routeType][normalizedRole] || ROLE_ROUTES[routeType].locataire;
}

/**
 * Role aliases mapping
 */
export const ROLE_ALIASES: Record<string, UserRole> = {
  'locataire': 'locataire',
  'tenant': 'tenant',
  'proprietaire': 'proprietaire',
  'owner': 'owner',
  'agence': 'agence',
  'agent': 'agent',
};