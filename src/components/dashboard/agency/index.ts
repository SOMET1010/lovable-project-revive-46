// Agency Dashboard Components - Export Barrel
// Main dashboard pour la gestion d'agences immobilières

export { default as AgencyDashboard } from './AgencyDashboard';
export { default as AgencyHeader } from './AgencyHeader';
export { default as AgencySidebar } from './AgencySidebar';

// Sections
export { default as AgencyPropertiesSection } from './sections/AgencyPropertiesSection';
export { default as AgencyClientsSection } from './sections/AgencyClientsSection';
export { default as AgencyTransactionsSection } from './sections/AgencyTransactionsSection';
export { default as AgencyTeamSection } from './sections/AgencyTeamSection';

// Types
export interface AgencyProperty {
  id: number;
  photo: string;
  title: string;
  address: string;
  type: 'villa' | 'appartement' | 'immeuble' | 'commerce' | 'terrain';
  status: 'disponible' | 'loué' | 'maintenance' | 'suspendu' | 'vendu';
  price: number;
  area: number;
  rooms: number;
  bathrooms: number;
  parking: number;
  owner: string;
  ownerPhone: string;
  agent: string;
  agentPhone: string;
  listedDate: string;
  views: number;
  inquiries: number;
  conversionRate: number;
  tags: string[];
  description: string;
  amenities: string[];
  location: string;
  coordinates?: { lat: number; lng: number };
  yearBuilt?: number;
  lastUpdated: string;
}

export interface AgencyClient {
  id: number;
  photo?: string;
  name: string;
  type: 'locataire' | 'proprietaire' | 'acheteur' | 'vendeur';
  email: string;
  phone: string;
  address: string;
  status: 'actif' | 'inactif' | 'prospect' | 'archivé';
  lastContact: string;
  registrationDate: string;
  propertiesCount: number;
  totalSpent: number;
  satisfaction: number;
  preferences: string[];
  budget?: { min: number; max: number };
  locationPreference: string;
  typePreference: string;
  notes: string;
  assignedAgent: string;
  communicationHistory: Array<{
    date: string;
    type: 'call' | 'email' | 'meeting' | 'visit';
    subject: string;
    outcome: string;
  }>;
  score: number;
  nextFollowUp: string;
  tags: string[];
}

export interface AgencyTransaction {
  id: number;
  type: 'vente' | 'location' | 'gestion' | 'estimation';
  property: {
    id: number;
    title: string;
    address: string;
    type: string;
    price: number;
  };
  client: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  agent: {
    id: number;
    name: string;
    phone: string;
  };
  amount: number;
  commission: number;
  commissionRate: number;
  status: 'en_cours' | 'completed' | 'cancelled' | 'pending_payment';
  date: string;
  completionDate?: string;
  paymentDate?: string;
  description: string;
  documents: string[];
  tags: string[];
  commissionPaid: boolean;
  recurringRevenue?: boolean;
  monthlyAmount?: number;
}

export interface TeamMember {
  id: number;
  photo?: string;
  name: string;
  role: 'director' | 'manager' | 'senior_agent' | 'agent' | 'junior_agent' | 'assistant';
  email: string;
  phone: string;
  address: string;
  hireDate: string;
  lastActivity: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  specializations: string[];
  certifications: string[];
  performance: {
    sales: number;
    rentals: number;
    totalRevenue: number;
    conversionRate: number;
    clientSatisfaction: number;
    monthlyGoal: number;
    achievedGoal: number;
  };
  properties: {
    assigned: number;
    active: number;
    sold: number;
    rented: number;
  };
  clients: {
    total: number;
    active: number;
    prospects: number;
  };
  commissions: {
    total: number;
    thisMonth: number;
    pending: number;
  };
  training: Array<{
    name: string;
    date: string;
    score: number;
    certificate: boolean;
  }>;
  bio: string;
  languages: string[];
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

export interface AgencyDashboardProps {
  agencyName?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: 'director' | 'manager' | 'agent';
}

export interface AgencyHeaderProps {
  agencyName: string;
  userName: string;
  userAvatar?: string;
  userRole: 'director' | 'manager' | 'agent';
  roleInfo: {
    style: string;
    label: string;
  };
  notifications: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  onMenuClick: () => void;
}

export interface AgencySidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface AgencyPropertiesSectionProps {
  agencyName: string;
}