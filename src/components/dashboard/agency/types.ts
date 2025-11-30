// Configuration TypeScript pour le Dashboard Agency
// Types et interfaces utilisés dans toute l'application

export interface Agency {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  licenseNumber: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'suspended';
  settings: AgencySettings;
}

export interface AgencySettings {
  currency: string;
  language: 'fr' | 'en';
  timezone: string;
  commissionRate: number;
  autoNotifications: boolean;
  backupEnabled: boolean;
}

// Props pour les composants principaux
export interface AgencyDashboardProps {
  agencyName?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: 'director' | 'manager' | 'agent';
  agency?: Agency;
}

// Types pour les utilisateurs
export interface AgencyUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  permissions: Permission[];
}

export type UserRole = 'director' | 'manager' | 'senior_agent' | 'agent' | 'junior_agent' | 'assistant';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Types pour les propriétés
export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price: number;
  currency: string;
  area: number;
  rooms: number;
  bathrooms: number;
  bedrooms: number;
  parking: number;
  yearBuilt?: number;
  features: string[];
  images: string[];
  virtualTour?: string;
  documents: PropertyDocument[];
  owner: PropertyOwner;
  agent: Agent;
  listing: {
    date: string;
    expiryDate?: string;
    isActive: boolean;
    views: number;
    inquiries: number;
    favorites: number;
  };
  analytics: {
    conversionRate: number;
    averageTimeOnListing: number;
    leadsGenerated: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type PropertyType = 'villa' | 'appartement' | 'immeuble' | 'commerce' | 'terrain' | 'bureau' | 'entrepot';

export type PropertyStatus = 'draft' | 'available' | 'rented' | 'sold' | 'maintenance' | 'suspended' | 'archived';

export interface PropertyDocument {
  id: string;
  name: string;
  type: 'title_deed' | 'certificate' | 'insurance' | 'plan' | 'other';
  url: string;
  uploadDate: string;
}

export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'company';
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  licenseNumber: string;
}

// Types pour les clients
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: ClientType;
  status: ClientStatus;
  profile: {
    avatar?: string;
    dateOfBirth?: string;
    nationality: string;
    languages: string[];
    occupation?: string;
    annualIncome?: number;
  };
  address: {
    street: string;
    city: string;
    region: string;
    postalCode?: string;
  };
  preferences: {
    propertyTypes: PropertyType[];
    priceRange: {
      min: number;
      max: number;
    };
    preferredLocations: string[];
    bedrooms: number;
    amenities: string[];
  };
  history: {
    propertiesViewed: number;
    inquiriesMade: number;
    propertiesRented: number;
    propertiesPurchased: number;
    totalSpent: number;
  };
  notes: string;
  tags: string[];
  assignedAgent?: Agent;
  createdAt: string;
  lastContact?: string;
}

export type ClientType = 'locataire' | 'proprietaire' | 'acheteur' | 'vendeur' | 'investor';

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'archived';

// Types pour les transactions
export interface Transaction {
  id: string;
  type: TransactionType;
  property: Property;
  client: Client;
  agent: Agent;
  amount: number;
  currency: string;
  commission: {
    rate: number;
    amount: number;
    status: CommissionStatus;
    paidDate?: string;
  };
  status: TransactionStatus;
  dates: {
    created: string;
    completed?: string;
    paid?: string;
  };
  documents: TransactionDocument[];
  notes: string;
  recurringRevenue?: {
    isRecurring: boolean;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    nextPayment?: string;
    amount: number;
  };
}

export type TransactionType = 'vente' | 'location' | 'gestion' | 'estimation' | 'consultation';

export type TransactionStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'disputed';

export interface TransactionDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadDate: string;
}

export type DocumentType = 'contract' | 'invoice' | 'receipt' | 'certificate' | 'report';

// Types pour l'équipe
export interface TeamMember {
  id: string;
  user: AgencyUser;
  employeeId: string;
  hireDate: string;
  department: string;
  position: UserRole;
  status: EmployeeStatus;
  performance: {
    sales: number;
    rentals: number;
    totalRevenue: number;
    conversionRate: number;
    clientSatisfaction: number;
    monthlyGoals: {
      target: number;
      achieved: number;
      percentage: number;
    };
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
  training: TrainingRecord[];
  availability: WeeklyAvailability;
  bio: string;
  specializations: string[];
  certifications: string[];
  languages: string[];
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export interface TrainingRecord {
  id: string;
  name: string;
  provider: string;
  date: string;
  duration: number; // hours
  score?: number;
  certificateUrl?: string;
  certificateNumber?: string;
  isCompleted: boolean;
}

export interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface DayAvailability {
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
  breakStart?: string;
  breakEnd?: string;
}

// Types pour les analytics et métriques
export interface AgencyMetrics {
  overview: {
    totalProperties: number;
    activeListings: number;
    completedTransactions: number;
    monthlyRevenue: number;
    conversionRate: number;
    averageCommission: number;
    newClients: number;
    clientRetention: number;
    teamPerformance: number;
    marketShare: number;
  };
  trends: {
    monthlyData: MonthlyDataPoint[];
    yearlyData: YearlyDataPoint[];
    topPerformers: Agent[];
    revenueProjection: RevenueProjection;
  };
}

export interface MonthlyDataPoint {
  month: string;
  sales: number;
  rentals: number;
  revenue: number;
  newClients: number;
}

export interface YearlyDataPoint {
  year: number;
  totalRevenue: number;
  totalTransactions: number;
  growth: number;
}

export interface RevenueProjection {
  thisMonth: number;
  nextMonth: number;
  recurringRevenue: number;
  confidence: number;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export type NotificationType = 
  | 'property_added' 
  | 'property_viewed' 
  | 'inquiry_received' 
  | 'transaction_completed' 
  | 'commission_paid' 
  | 'client_registered' 
  | 'goal_achieved' 
  | 'deadline_reminder' 
  | 'system_alert';

// Types pour les filtres et recherche
export interface SearchFilters {
  query?: string;
  type?: PropertyType | ClientType | TransactionType;
  status?: PropertyStatus | ClientStatus | TransactionStatus;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string;
  agent?: string;
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Types pour les exports et rapports
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    start: string;
    end: string;
  };
  sections: string[];
  includeImages: boolean;
  watermark?: string;
}

// Configuration pour les graphiques
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  data: any;
  options: any;
  height?: number;
  width?: number;
}