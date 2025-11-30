<<<<<<< HEAD
import React, { useState } from 'react';
import { 
  Award, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Star,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  Users,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Activity,
  FileText,
  PhoneCall,
  MessageSquare,
  Building,
  Home,
  Badge,
  GraduationCap,
  Trophy,
  UserCheck,
  UserX,
  Archive
} from 'lucide-react';

interface TeamMember {
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

const AgencyTeamSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'sales' | 'revenue'>('performance');

  // Données mock de l'équipe
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Marie KOUASSI',
      role: 'director',
      email: 'm.kouassi@immobilier-premium.ci',
      phone: '+225 01 00 00 01',
      address: 'Cocody, Riviera Golf',
      hireDate: '2020-03-15',
      lastActivity: '2025-11-29',
      status: 'active',
      specializations: ['Luxe', 'Commercial', 'Investissement'],
      certifications: ['Agent Certifié ANSUT', 'Expert Immobilier', 'Commercial'],
      performance: {
        sales: 45,
        rentals: 67,
        totalRevenue: 125000000,
        conversionRate: 28.5,
        clientSatisfaction: 94,
        monthlyGoal: 5000000,
        achievedGoal: 5200000
      },
      properties: {
        assigned: 32,
        active: 18,
        sold: 45,
        rented: 67
      },
      clients: {
        total: 156,
        active: 89,
        prospects: 23
      },
      commissions: {
        total: 25000000,
        thisMonth: 5200000,
        pending: 800000
      },
      training: [
        { name: 'Vente de Luxe', date: '2025-09-15', score: 95, certificate: true },
        { name: 'Négociation Avancée', date: '2025-06-20', score: 88, certificate: true },
        { name: 'Commercial', date: '2025-03-10', score: 92, certificate: true }
      ],
      bio: 'Directrice expérimentée avec plus de 15 ans dans l\'immobilier de luxe à Abidjan.',
      languages: ['Français', 'Anglais', 'Baoulé'],
      availability: {
        monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false
      }
    },
    {
      id: 2,
      name: 'Antoine TRAORE',
      role: 'senior_agent',
      email: 'a.traore@immobilier-premium.ci',
      phone: '+225 05 00 00 02',
      address: 'Marcory, Zone 4A',
      hireDate: '2021-07-20',
      lastActivity: '2025-11-29',
      status: 'active',
      specializations: ['Villa', 'Familial', 'Résidentiel'],
      certifications: ['Agent Certifié ANSUT', 'Spécialiste Villa'],
      performance: {
        sales: 28,
        rentals: 34,
        totalRevenue: 75000000,
        conversionRate: 24.8,
        clientSatisfaction: 91,
        monthlyGoal: 3000000,
        achievedGoal: 2850000
      },
      properties: {
        assigned: 24,
        active: 16,
        sold: 28,
        rented: 34
      },
      clients: {
        total: 98,
        active: 67,
        prospects: 18
      },
      commissions: {
        total: 18000000,
        thisMonth: 2850000,
        pending: 450000
      },
      training: [
        { name: 'Vente Résidentielle', date: '2025-08-12', score: 89, certificate: true },
        { name: 'Relation Client', date: '2025-05-18', score: 85, certificate: true }
      ],
      bio: 'Agent senior spécialisé dans les villas et propriétés familiales.',
      languages: ['Français', 'Dioula'],
      availability: {
        monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
      }
    },
    {
      id: 3,
      name: 'Aya BAKAYOKO',
      role: 'agent',
      email: 'a.bakayoko@immobilier-premium.ci',
      phone: '+225 01 00 00 03',
      address: 'Plateau, Centre-ville',
      hireDate: '2022-11-10',
      lastActivity: '2025-11-28',
      status: 'active',
      specializations: ['Appartement', 'Centre-ville', 'Premier achat'],
      certifications: ['Agent Certifié ANSUT'],
      performance: {
        sales: 19,
        rentals: 25,
        totalRevenue: 42000000,
        conversionRate: 22.3,
        clientSatisfaction: 88,
        monthlyGoal: 2000000,
        achievedGoal: 2150000
      },
      properties: {
        assigned: 18,
        active: 12,
        sold: 19,
        rented: 25
      },
      clients: {
        total: 67,
        active: 45,
        prospects: 12
      },
      commissions: {
        total: 12000000,
        thisMonth: 2150000,
        pending: 320000
      },
      training: [
        { name: 'Appartements', date: '2025-10-05', score: 87, certificate: true },
        { name: 'Commercial', date: '2025-07-22', score: 82, certificate: true }
      ],
      bio: 'Agent dynamique spécialisée dans les appartements et premiers achats.',
      languages: ['Français', 'Anglais'],
      availability: {
        monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: false
      }
    },
    {
      id: 4,
      name: 'Ibrahim KONE',
      role: 'agent',
      email: 'i.kone@immobilier-premium.ci',
      phone: '+225 07 00 00 04',
      address: 'Yopougon, Siporex',
      hireDate: '2023-02-14',
      lastActivity: '2025-11-27',
      status: 'active',
      specializations: ['Commercial', 'Bureau', 'Investissement'],
      certifications: ['Agent Certifié ANSUT'],
      performance: {
        sales: 12,
        rentals: 8,
        totalRevenue: 35000000,
        conversionRate: 18.7,
        clientSatisfaction: 85,
        monthlyGoal: 1800000,
        achievedGoal: 1650000
      },
      properties: {
        assigned: 15,
        active: 10,
        sold: 12,
        rented: 8
      },
      clients: {
        total: 45,
        active: 28,
        prospects: 8
      },
      commissions: {
        total: 8500000,
        thisMonth: 1650000,
        pending: 280000
      },
      training: [
        { name: 'Immobilier Commercial', date: '2025-09-20', score: 83, certificate: true }
      ],
      bio: 'Expert en immobilier commercial et bureaux.',
      languages: ['Français', 'Dioula'],
      availability: {
        monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
      }
    },
    {
      id: 5,
      name: 'Fatou FOFANA',
      role: 'junior_agent',
      email: 'f.fofana@immobilier-premium.ci',
      phone: '+225 05 00 00 05',
      address: 'Bingerville, Centre',
      hireDate: '2024-06-01',
      lastActivity: '2025-11-28',
      status: 'active',
      specializations: ['Starter', 'Location', 'Étudiant'],
      certifications: ['Agent Certifié ANSUT'],
      performance: {
        sales: 6,
        rentals: 15,
        totalRevenue: 18000000,
        conversionRate: 16.2,
        clientSatisfaction: 82,
        monthlyGoal: 1000000,
        achievedGoal: 950000
      },
      properties: {
        assigned: 12,
        active: 8,
        sold: 6,
        rented: 15
      },
      clients: {
        total: 34,
        active: 23,
        prospects: 15
      },
      commissions: {
        total: 4200000,
        thisMonth: 950000,
        pending: 180000
      },
      training: [
        { name: 'Formation Junior', date: '2024-08-15', score: 78, certificate: true },
        { name: 'Location', date: '2025-03-20', score: 81, certificate: true }
      ],
      bio: 'Junior agent en formation, spécialisée dans les locations.',
      languages: ['Français'],
      availability: {
        monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true
      }
    },
    {
      id: 6,
      name: 'Ousmane DIALLO',
      role: 'assistant',
      email: 'o.diallo@immobilier-premium.ci',
      phone: '+225 03 00 00 06',
      address: 'Adjamé, Marché Central',
      hireDate: '2024-09-10',
      lastActivity: '2025-11-29',
      status: 'active',
      specializations: ['Administration', 'Support', 'Commercial'],
      certifications: ['Assistant Commercial'],
      performance: {
        sales: 3,
        rentals: 5,
        totalRevenue: 8500000,
        conversionRate: 14.5,
        clientSatisfaction: 79,
        monthlyGoal: 500000,
        achievedGoal: 520000
      },
      properties: {
        assigned: 8,
        active: 6,
        sold: 3,
        rented: 5
      },
      clients: {
        total: 18,
        active: 12,
        prospects: 6
      },
      commissions: {
        total: 1800000,
        thisMonth: 520000,
        pending: 95000
      },
      training: [
        { name: 'Assistant Commercial', date: '2024-10-20', score: 75, certificate: true },
        { name: 'Support Client', date: '2025-04-12', score: 79, certificate: true }
      ],
      bio: 'Assistant commercial en apprentissage.',
      languages: ['Français', 'Dioula'],
      availability: {
        monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false
      }
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'active': { 
        label: 'Actif', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      'inactive': { 
        label: 'Inactif', 
        color: 'bg-gray-100 text-gray-800', 
        icon: UserX 
      },
      'on_leave': { 
        label: 'En congés', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Clock 
      },
      'terminated': { 
        label: 'Terminé', 
        color: 'bg-red-100 text-red-800', 
        icon: UserX 
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['active'];
  };

  const getRoleInfo = (role: string) => {
    const roleMap = {
      'director': { label: 'Directeur', color: 'bg-purple-100 text-purple-800', icon: Trophy },
      'manager': { label: 'Responsable', color: 'bg-blue-100 text-blue-800', icon: Award },
      'senior_agent': { label: 'Agent Senior', color: 'bg-green-100 text-green-800', icon: UserCheck },
      'agent': { label: 'Agent', color: 'bg-orange-100 text-orange-800', icon: User },
      'junior_agent': { label: 'Agent Junior', color: 'bg-yellow-100 text-yellow-800', icon: User },
      'assistant': { label: 'Assistant', color: 'bg-gray-100 text-gray-800', icon: User }
    };
    return roleMap[role as keyof typeof roleMap] || roleMap['agent'];
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-semantic-success';
    if (performance >= 75) return 'text-semantic-warning';
    return 'text-semantic-error';
  };

  const filteredTeam = teamMembers.filter(member => {
    const matchesFilter = selectedFilter === 'all' || member.role === selectedFilter || member.status === selectedFilter;
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm) ||
                         member.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const teamStats = {
    total: teamMembers.length,
    actifs: teamMembers.filter(m => m.status === 'active').length,
    objectifsAtteints: teamMembers.filter(m => m.performance.achievedGoal >= m.performance.monthlyGoal).length,
    revenueTotal: teamMembers.reduce((sum, m) => sum + m.performance.totalRevenue, 0),
    performanceMoyenne: teamMembers.reduce((sum, m) => sum + (m.performance.achievedGoal / m.performance.monthlyGoal * 100), 0) / teamMembers.length,
    satisfactionMoyenne: teamMembers.reduce((sum, m) => sum + m.performance.clientSatisfaction, 0) / teamMembers.length,
    conversionsMoyennes: teamMembers.reduce((sum, m) => sum + m.performance.conversionRate, 0) / teamMembers.length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Gestion de l'Équipe
            </h2>
            <p className="text-neutral-700">
              Suivi des performances et développement des agents
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <div className="flex rounded-lg border border-neutral-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
              >
                Liste
              </button>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter membre
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Total</p>
              <p className="text-lg font-bold text-neutral-900">{teamStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-semantic-success" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Actifs</p>
              <p className="text-lg font-bold text-neutral-900">{teamStats.actifs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Objectifs</p>
              <p className="text-lg font-bold text-neutral-900">{teamStats.objectifsAtteints}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Revenus</p>
              <p className="text-lg font-bold text-neutral-900">
                {(teamStats.revenueTotal / 1000000).toFixed(0)}M F
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Performance</p>
              <p className="text-lg font-bold text-neutral-900">{teamStats.performanceMoyenne.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Star className="w-5 h-5 text-pink-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Satisfaction</p>
              <p className="text-lg font-bold text-neutral-900">{teamStats.satisfactionMoyenne.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Conversion</p>
              <p className="text-lg font-bold text-neutral-900">{teamStats.conversionsMoyennes.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <Trophy className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Top Performer</p>
              <p className="text-lg font-bold text-neutral-900">A. TRAORE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Toute l'équipe</option>
              <option value="director">Directeur</option>
              <option value="manager">Responsables</option>
              <option value="senior_agent">Agents Senior</option>
              <option value="agent">Agents</option>
              <option value="junior_agent">Agents Junior</option>
              <option value="assistant">Assistants</option>
              <option value="active">Actifs</option>
              <option value="on_leave">En congés</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'performance' | 'sales' | 'revenue')}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="performance">Trier par performance</option>
              <option value="name">Trier par nom</option>
              <option value="sales">Trier par ventes</option>
              <option value="revenue">Trier par revenus</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200">
              Exporter équipe
            </button>
          </div>
        </div>
      </div>

      {/* Team Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => {
            const statusInfo = getStatusInfo(member.status);
            const roleInfo = getRoleInfo(member.role);
            const StatusIcon = statusInfo.icon;
            const RoleIcon = roleInfo.icon;
            const goalAchievement = (member.performance.achievedGoal / member.performance.monthlyGoal * 100);

            return (
              <div key={member.id} className="bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                {/* Member Header */}
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{member.name}</h3>
                        <p className="text-sm text-neutral-600">{roleInfo.label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPerformanceColor(goalAchievement)}`}>
                        {goalAchievement.toFixed(0)}%
                      </div>
                      <div className="text-xs text-neutral-500">Objectif</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Member Details */}
                <div className="p-4">
                  <div className="space-y-3 text-sm text-neutral-700">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-neutral-500" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-neutral-500" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
                      <span className="truncate">{member.address}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500">Ventes</p>
                        <p className="font-medium">{member.performance.sales}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Locations</p>
                        <p className="font-medium">{member.performance.rentals}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Clients</p>
                        <p className="font-medium">{member.clients.total}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Conversion</p>
                        <p className="font-medium">{member.performance.conversionRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-sm text-neutral-500 mb-2">Spécialisations</p>
                    <div className="flex flex-wrap gap-1">
                      {member.specializations.slice(0, 3).map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Performance Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">Performance mensuelle</span>
                      <span className={`font-medium ${getPerformanceColor(goalAchievement)}`}>
                        {goalAchievement.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-neutral-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${goalAchievement >= 100 ? 'bg-semantic-success' : goalAchievement >= 75 ? 'bg-semantic-warning' : 'bg-semantic-error'}`}
                        style={{ width: `${Math.min(goalAchievement, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 px-3 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors duration-200">
                      <Eye className="w-4 h-4 mr-1 inline" />
                      Voir
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                      <Edit className="w-4 h-4 mr-1 inline" />
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="divide-y divide-neutral-200">
            {filteredTeam.map((member) => {
              const statusInfo = getStatusInfo(member.status);
              const roleInfo = getRoleInfo(member.role);
              const StatusIcon = statusInfo.icon;
              const RoleIcon = roleInfo.icon;
              const goalAchievement = (member.performance.achievedGoal / member.performance.monthlyGoal * 100);

              return (
                <div key={member.id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Member Avatar */}
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {member.photo ? (
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-primary-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-neutral-900">
                            {member.name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                          </span>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getPerformanceColor(goalAchievement)}`}>
                            {goalAchievement.toFixed(0)}% objectif
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-neutral-700">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{member.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-neutral-500" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{member.performance.sales} ventes • {member.performance.rentals} locations</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{member.clients.total} clients</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{(member.performance.totalRevenue / 1000000).toFixed(1)}M F</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{member.performance.clientSatisfaction}% satisfaction</span>
                          </div>
                        </div>

                        {/* Specializations */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {member.specializations.map((spec, index) => (
                            <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                              {spec}
                            </span>
                          ))}
                        </div>

                        {/* Performance Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-neutral-700">Performance mensuelle</span>
                            <span className={`font-medium ${getPerformanceColor(goalAchievement)}`}>
                              {member.performance.achievedGoal.toLocaleString()} / {member.performance.monthlyGoal.toLocaleString()} F
                            </span>
                          </div>
                          <div className="h-2 bg-neutral-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${goalAchievement >= 100 ? 'bg-semantic-success' : goalAchievement >= 75 ? 'bg-semantic-warning' : 'bg-semantic-error'}`}
                              style={{ width: `${Math.min(goalAchievement, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Voir détails">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Appeler">
                        <PhoneCall className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      
                      <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Gérer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Training & Development */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <GraduationCap className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Formation & Développement
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Formations Programmées</h4>
            <p className="text-sm text-neutral-700 mb-3">5 formations cette semaine</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Voir planning
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Certifications</h4>
            <p className="text-sm text-neutral-700 mb-3">12 certifications actives</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Gérer certifications
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Performance Collective</h4>
            <p className="text-sm text-neutral-700 mb-3">+15% ce trimestre</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Voir rapport
            </button>
          </div>
=======
/**
 * Agency Team Section - Gestion de l'équipe et des agents
 */

import { useState } from 'react';
import { Badge } from '../../ui/Badge';
import { Progress } from '../../ui/Progress';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  photo?: string;
  specialty: string;
  performance: number;
  propertiesCount: number;
  status: 'actif' | 'en_vacances' | 'inactif';
}

interface AgencyTeamSectionProps {
  team: TeamMember[];
  showHeader?: boolean;
}

export function AgencyTeamSection({ team, showHeader = false }: AgencyTeamSectionProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'actif' | 'en_vacances' | 'inactif'>('all');

  const filteredTeam = team.filter(member => {
    if (filterStatus !== 'all' && member.status !== filterStatus) return false;
    return true;
  });

  const statusColors = {
    actif: 'success',
    en_vacances: 'warning',
    inactif: 'error',
  } as const;

  const statusLabels = {
    actif: 'Actif',
    en_vacances: 'En vacances',
    inactif: 'Inactif',
  };

  const roleIcons = {
    'Directrice': '👩‍💼',
    'Agent Senior': '👨‍💼',
    'Agent Commercial': '👤',
    'Agent Junior': '👨‍💻',
    'Responsable Locative': '👩‍💼',
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'success';
    if (performance >= 75) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Équipe et agents</h2>
            <p className="text-text-secondary">Gestion de {team.length} membres</p>
          </div>
          <button className="btn-primary">
            ➕ Ajouter un agent
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-background-page rounded-xl p-4 border border-neutral-100">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Statut</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="en_vacances">En vacances</option>
              <option value="inactif">Inactifs</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end">
            <span className="text-sm text-text-secondary">
              {filteredTeam.length} membre(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>

      {/* Grille des membres de l'équipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTeam.map((member) => (
          <div key={member.id} className="bg-background-page rounded-xl border border-neutral-100 p-6 hover:shadow-lg transition-all">
            {/* Photo et statut */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-semibold text-lg">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className={`
                  absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white
                  ${member.status === 'actif' ? 'bg-semantic-success' : ''}
                  ${member.status === 'en_vacances' ? 'bg-semantic-warning' : ''}
                  ${member.status === 'inactif' ? 'bg-semantic-error' : ''}
                `}></div>
              </div>
              
              <Badge 
                variant={statusColors[member.status] as any}
                size="small"
                className="mb-2"
              >
                {statusLabels[member.status]}
              </Badge>
            </div>

            {/* Informations */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-text-primary text-center">{member.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-lg">{roleIcons[member.role as keyof typeof roleIcons] || '👤'}</span>
                  <span className="text-sm text-text-secondary text-center">{member.role}</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Spécialité</div>
                <div className="text-sm font-medium text-text-primary">{member.specialty}</div>
              </div>

              {/* Performance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Performance</span>
                  <span className="text-sm font-medium text-text-primary">{member.performance}%</span>
                </div>
                <Progress 
                  value={member.performance} 
                  variant={getPerformanceColor(member.performance) as any}
                  size="small"
                />
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-500">{member.propertiesCount}</div>
                  <div className="text-xs text-text-secondary">Propriétés</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-semantic-success">
                    {Math.round(member.performance * member.propertiesCount / 100)}
                  </div>
                  <div className="text-xs text-text-secondary">Ventes</div>
                </div>
              </div>

              {/* Contact */}
              <div className="pt-2 border-t border-neutral-100 text-xs text-text-secondary space-y-1">
                <div>📧 {member.email}</div>
                <div>📞 {member.phone}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
              <button className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                Profil
              </button>
              <button 
                className="px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                title="Assigner propriété"
              >
                🏠
              </button>
              <button 
                className="px-3 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-sm"
                title="Voir performance"
              >
                📊
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Performance globale de l'équipe */}
      <div className="bg-background-page rounded-xl p-6 border border-neutral-100">
        <h3 className="text-lg font-semibold text-text-primary mb-6">Performance globale de l'équipe</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-semantic-success mb-2">
              {team.filter(m => m.status === 'actif').length}
            </div>
            <div className="text-sm text-text-secondary">Agents actifs</div>
            <div className="text-xs text-text-secondary mt-1">sur {team.length} total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-500 mb-2">
              {Math.round(team.reduce((acc, m) => acc + m.performance, 0) / team.length)}%
            </div>
            <div className="text-sm text-text-secondary">Performance moyenne</div>
            <div className="text-xs text-semantic-success mt-1">
              +{team.filter(m => m.performance >= 90).length} excellents
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-info mb-2">
              {team.reduce((acc, m) => acc + m.propertiesCount, 0)}
            </div>
            <div className="text-sm text-text-secondary">Propriétés gérées</div>
            <div className="text-xs text-text-secondary mt-1">
              Moyenne: {Math.round(team.reduce((acc, m) => acc + m.propertiesCount, 0) / team.length)} par agent
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-warning mb-2">
              {team.filter(m => m.status === 'en_vacances').length}
            </div>
            <div className="text-sm text-text-secondary">En vacances</div>
            <div className="text-xs text-text-secondary mt-1">
              {team.filter(m => m.status === 'inactif').length} inactifs
            </div>
          </div>
        </div>

        {/* Classement des agents */}
        <div className="space-y-3">
          <h4 className="font-semibold text-text-primary">🏆 Classement des agents (par performance)</h4>
          {team
            .sort((a, b) => b.performance - a.performance)
            .map((member, index) => (
              <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${index === 0 ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${index === 1 ? 'bg-gray-100 text-gray-800' : ''}
                  ${index === 2 ? 'bg-orange-100 text-orange-800' : ''}
                  ${index > 2 ? 'bg-neutral-100 text-neutral-600' : ''}
                `}>
                  {index + 1}
                </div>
                
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{member.name}</div>
                  <div className="text-sm text-text-secondary">{member.specialty}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-text-primary">{member.performance}%</div>
                  <div className="text-sm text-text-secondary">{member.propertiesCount} propriétés</div>
                </div>
                
                <Progress 
                  value={member.performance} 
                  variant={getPerformanceColor(member.performance) as any}
                  size="small"
                  className="w-24"
                />
              </div>
            ))}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default AgencyTeamSection;
=======
}
>>>>>>> 179702229bfc197f668a7416e325de75b344681e
