/**
 * Application roles constants
 * Centralized role definitions to avoid magic strings
 */
export const ROLES = {
  TENANT: 'locataire',
  OWNER: 'proprietaire',
  OWNER_EN: 'owner',
  AGENCY: 'agence',
  AGENT: 'agent',
  ADMIN: 'admin',
  TRUST_AGENT: 'trust_agent',
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];

// Role groups for common access patterns
export const OWNER_ROLES = [ROLES.OWNER, ROLES.OWNER_EN] as const;
export const AGENCY_ROLES = [ROLES.AGENCY, ROLES.AGENT] as const;
export const PROPERTY_MANAGER_ROLES = [...OWNER_ROLES, ...AGENCY_ROLES] as const;
