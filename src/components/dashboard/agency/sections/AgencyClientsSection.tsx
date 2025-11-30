import React, { useState } from 'react';
import { 
  Users, 
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
  MessageSquare,
  Eye,
  Edit,
  UserPlus,
  Heart,
  DollarSign,
  Home,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  FileText,
  Award,
  Target
} from 'lucide-react';

interface Client {
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

const AgencyClientsSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'score' | 'spent'>('date');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Données mock des clients
  const clients: Client[] = [
    {
      id: 1,
      name: 'M. KOUASSI Jean-Baptiste',
      type: 'acheteur',
      email: 'j.kouassi@email.com',
      phone: '+225 07 00 00 01',
      address: 'Cocody, Riviera',
      status: 'actif',
      lastContact: '2025-11-29',
      registrationDate: '2025-10-15',
      propertiesCount: 0,
      totalSpent: 0,
      satisfaction: 95,
      preferences: ['Villa', 'Piscine', 'Jardin'],
      budget: { min: 400000000, max: 600000000 },
      locationPreference: 'Cocody, Plateau',
      typePreference: 'Villa',
      notes: 'Client VIP, recherche propriété de luxe',
      assignedAgent: 'A. TRAORE',
      communicationHistory: [
        { date: '2025-11-29', type: 'call', subject: 'Visite villa Cocody', outcome: 'Intéressé' },
        { date: '2025-11-27', type: 'email', subject: 'Envoi catalogues', outcome: 'Réponse positive' }
      ],
      score: 92,
      nextFollowUp: '2025-12-02',
      tags: ['VIP', 'Luxe', 'Urgence']
    },
    {
      id: 2,
      name: 'Mme TRAORE Aya',
      type: 'locataire',
      email: 'aya.traore@email.com',
      phone: '+225 05 00 00 02',
      address: 'Marcory, Zone 4A',
      status: 'actif',
      lastContact: '2025-11-28',
      registrationDate: '2025-09-20',
      propertiesCount: 1,
      totalSpent: 2400000,
      satisfaction: 88,
      preferences: ['Appartement', 'Centre-ville', 'Meublé'],
      budget: { min: 150000, max: 250000 },
      locationPreference: 'Marcory, Cocody',
      typePreference: 'Appartement',
      notes: 'Excellente cliente, paiement régulier',
      assignedAgent: 'M. BAKAYOKO',
      communicationHistory: [
        { date: '2025-11-28', type: 'visit', subject: 'Visite état des lieux', outcome: 'Satisfait' }
      ],
      score: 85,
      nextFollowUp: '2025-12-05',
      tags: ['Fidèle', 'Paiement à l\'heure']
    },
    {
      id: 3,
      name: 'SCI Plateau Commercial',
      type: 'proprietaire',
      email: 'contact@sciplateau.ci',
      phone: '+225 20 00 00 03',
      address: 'Plateau, Rue des Hôtels',
      status: 'actif',
      lastContact: '2025-11-26',
      registrationDate: '2025-08-10',
      propertiesCount: 3,
      totalSpent: 15000000,
      satisfaction: 91,
      preferences: ['Immeuble', 'Commercial', 'Centre-ville'],
      locationPreference: 'Plateau, Adjamé',
      typePreference: 'Immeuble',
      notes: 'Propriétaire de plusieurs actifs commerciaux',
      assignedAgent: 'Mme KONE',
      communicationHistory: [
        { date: '2025-11-26', type: 'meeting', subject: 'Stratégie location', outcome: 'Accord trouvé' }
      ],
      score: 89,
      nextFollowUp: '2025-12-01',
      tags: ['Commercial', 'Multiple propriétés']
    },
    {
      id: 4,
      name: 'M. DIALLO Ousmane',
      type: 'acheteur',
      email: 'ousmane.diallo@email.com',
      phone: '+225 03 00 00 04',
      address: 'Yopougon, Siporex',
      status: 'prospect',
      lastContact: '2025-11-25',
      registrationDate: '2025-11-20',
      propertiesCount: 0,
      totalSpent: 0,
      satisfaction: 78,
      preferences: ['Appartement', 'Abordable', 'Familial'],
      budget: { min: 70000000, max: 100000000 },
      locationPreference: 'Yopougon, Bingerville',
      typePreference: 'Appartement',
      notes: 'Premier achat, besoin d\'accompagnement',
      assignedAgent: 'M. TRAORE',
      communicationHistory: [
        { date: '2025-11-25', type: 'call', subject: 'Premier contact', outcome: 'Rendez-vous fixé' }
      ],
      score: 72,
      nextFollowUp: '2025-11-30',
      tags: ['Premier achat', 'Jeune couple']
    },
    {
      id: 5,
      name: 'SARL Commerce Adjamé',
      type: 'vendeur',
      email: 'vente@commerceadjame.ci',
      phone: '+225 27 00 00 05',
      address: 'Adjamé, Marché Central',
      status: 'actif',
      lastContact: '2025-11-24',
      registrationDate: '2025-07-15',
      propertiesCount: 1,
      totalSpent: 0,
      satisfaction: 83,
      preferences: ['Commercial', 'Passage'],
      locationPreference: 'Adjamé, Plateau',
      typePreference: 'Local commercial',
      notes: 'Vente urgence, prix compétitif',
      assignedAgent: 'Mme FOFANA',
      communicationHistory: [
        { date: '2025-11-24', type: 'call', subject: 'Négociation prix', outcome: 'En cours' }
      ],
      score: 76,
      nextFollowUp: '2025-12-03',
      tags: ['Urgence', 'Prix ferme']
    },
    {
      id: 6,
      name: 'M. KONE Ibrahim',
      type: 'proprietaire',
      email: 'ibrahim.kone@email.com',
      phone: '+225 01 00 00 06',
      address: 'Bingerville, Centre',
      status: 'inactif',
      lastContact: '2025-11-10',
      registrationDate: '2025-06-01',
      propertiesCount: 2,
      totalSpent: 8000000,
      satisfaction: 65,
      preferences: ['Terrain', 'Construction'],
      locationPreference: 'Bingerville, Grand-Bassam',
      typePreference: 'Terrain',
      notes: 'Client difficile, prix trop élevés',
      assignedAgent: 'M. BAKAYOKO',
      communicationHistory: [
        { date: '2025-11-10', type: 'email', subject: 'Refus proposition', outcome: 'Hors budget' }
      ],
      score: 45,
      nextFollowUp: null,
      tags: ['Difficile', 'Hors budget']
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'actif': { 
        label: 'Actif', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      'inactif': { 
        label: 'Inactif', 
        color: 'bg-gray-100 text-gray-800', 
        icon: Clock 
      },
      'prospect': { 
        label: 'Prospect', 
        color: 'bg-blue-100 text-blue-800', 
        icon: UserPlus 
      },
      'archivé': { 
        label: 'Archivé', 
        color: 'bg-red-100 text-red-800', 
        icon: Archive 
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['prospect'];
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'locataire': { label: 'Locataire', color: 'bg-blue-100 text-blue-800', icon: Home },
      'proprietaire': { label: 'Propriétaire', color: 'bg-green-100 text-green-800', icon: Building },
      'acheteur': { label: 'Acheteur', color: 'bg-purple-100 text-purple-800', icon: DollarSign },
      'vendeur': { label: 'Vendeur', color: 'bg-orange-100 text-orange-800', icon: TrendingUp }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap['acheteur'];
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-semantic-success';
    if (score >= 70) return 'text-semantic-warning';
    return 'text-semantic-error';
  };

  const filteredClients = clients.filter(client => {
    const matchesFilter = selectedFilter === 'all' || client.status === selectedFilter || client.type === selectedFilter;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const clientStats = {
    total: clients.length,
    actifs: clients.filter(c => c.status === 'actif').length,
    prospects: clients.filter(c => c.status === 'prospect').length,
    locataires: clients.filter(c => c.type === 'locataire').length,
    proprietaires: clients.filter(c => c.type === 'proprietaire').length,
    acheteurs: clients.filter(c => c.type === 'acheteur').length,
    vendeurs: clients.filter(c => c.type === 'vendeur').length,
    satisfactionMoyenne: clients.reduce((sum, c) => sum + c.satisfaction, 0) / clients.length,
    valeurTotale: clients.reduce((sum, c) => sum + c.totalSpent, 0)
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Gestion des Clients
            </h2>
            <p className="text-neutral-700">
              Base de données des locataires, propriétaires et prospects
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
              Ajouter client
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
              <p className="text-lg font-bold text-neutral-900">{clientStats.total}</p>
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
              <p className="text-lg font-bold text-neutral-900">{clientStats.actifs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Prospects</p>
              <p className="text-lg font-bold text-neutral-900">{clientStats.prospects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Home className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Locataires</p>
              <p className="text-lg font-bold text-neutral-900">{clientStats.locataires}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Propriétaires</p>
              <p className="text-lg font-bold text-neutral-900">{clientStats.proprietaires}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Acheteurs</p>
              <p className="text-lg font-bold text-neutral-900">{clientStats.acheteurs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Vendeurs</p>
              <p className="text-lg font-bold text-neutral-900">{clientStats.vendeurs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <Star className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Satisfaction</p>
              <p className="text-lg font-bold text-neutral-900">{clientStats.satisfactionMoyenne.toFixed(0)}%</p>
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
                placeholder="Rechercher un client..."
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
              <option value="all">Tous les clients</option>
              <option value="actif">Actifs</option>
              <option value="prospect">Prospects</option>
              <option value="inactif">Inactifs</option>
              <option value="locataire">Locataires</option>
              <option value="proprietaire">Propriétaires</option>
              <option value="acheteur">Acheteurs</option>
              <option value="vendeur">Vendeurs</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'score' | 'spent')}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Trier par date</option>
              <option value="name">Trier par nom</option>
              <option value="score">Trier par score</option>
              <option value="spent">Trier par montant</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200">
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Clients Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const statusInfo = getStatusInfo(client.status);
            const typeInfo = getTypeInfo(client.type);
            const StatusIcon = statusInfo.icon;
            const TypeIcon = typeInfo.icon;

            return (
              <div key={client.id} className="bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow duration-200">
                {/* Client Header */}
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        {client.photo ? (
                          <img
                            src={client.photo}
                            alt={client.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{client.name}</h3>
                        <p className="text-sm text-neutral-600">{client.assignedAgent}</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(client.score)}`}>
                      {client.score}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {typeInfo.label}
                    </span>
                  </div>
                </div>

                {/* Client Details */}
                <div className="p-4">
                  <div className="space-y-3 text-sm text-neutral-700">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-neutral-500" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-neutral-500" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500">Dernière visite</p>
                        <p className="font-medium">{new Date(client.lastContact).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Propriétés</p>
                        <p className="font-medium">{client.propertiesCount}</p>
                      </div>
                    </div>
                  </div>

                  {client.budget && (
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <p className="text-sm text-neutral-500 mb-1">Budget</p>
                      <p className="text-sm font-medium">
                        {(client.budget.min / 1000000).toFixed(0)} - {(client.budget.max / 1000000).toFixed(0)}M F
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-4">
                    {client.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 px-3 py-2 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors duration-200">
                      <Eye className="w-4 h-4 mr-1 inline" />
                      Voir
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                      <MessageSquare className="w-4 h-4 mr-1 inline" />
                      Contacter
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
            {filteredClients.map((client) => {
              const statusInfo = getStatusInfo(client.status);
              const typeInfo = getTypeInfo(client.type);
              const StatusIcon = statusInfo.icon;
              const TypeIcon = typeInfo.icon;

              return (
                <div key={client.id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Client Avatar */}
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {client.photo ? (
                          <img
                            src={client.photo}
                            alt={client.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-primary-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-neutral-900">
                            {client.name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {typeInfo.label}
                          </span>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getScoreColor(client.score)}`}>
                            Score: {client.score}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-neutral-700">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-neutral-500" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
                            <span className="truncate">{client.address}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{client.assignedAgent}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{new Date(client.lastContact).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-2 text-neutral-500" />
                            <span>{client.satisfaction}% satisfaction</span>
                          </div>
                        </div>

                        {client.budget && (
                          <div className="mt-2">
                            <span className="text-sm text-neutral-700 mr-2">Budget:</span>
                            <span className="text-sm font-medium">
                              {(client.budget.min / 1000000).toFixed(0)} - {(client.budget.max / 1000000).toFixed(0)}M F
                            </span>
                          </div>
                        )}
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {client.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                              {tag}
                            </span>
                          ))}
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
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      
                      <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Suivre
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Client Communication Tools */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-neutral-900">
            Outils de Communication
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Campagnes Email</h4>
            <p className="text-sm text-neutral-700 mb-3">Envoyez des newsletters personnalisées</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Créer campagne
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Suivi Automatique</h4>
            <p className="text-sm text-neutral-700 mb-3">Relances et rappels programmés</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Configurer
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-neutral-900 mb-2">Analyses CRM</h4>
            <p className="text-sm text-neutral-700 mb-3">Métriques de performance client</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Voir rapports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyClientsSection;