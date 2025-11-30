import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  FileText,
  Navigation,
  Filter,
  Search,
  ChevronRight,
  AlertTriangle,
  Home,
  Eye
} from 'lucide-react';

interface Inspection {
  id: number;
  date: string;
  time: string;
  property: string;
  address: string;
  owner: string;
  phone: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'first-visit' | 'quality-control' | 'recertification';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  coordinates?: { lat: number; lng: number };
}

const TrustInspectionsSection: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Données mock des inspections
  const inspections: Inspection[] = [
    {
      id: 1,
      date: '2025-11-30',
      time: '14:30',
      property: 'Villa Bellevue',
      address: 'Cocody, Rue des Jardins',
      owner: 'M. KOUASSI Jean',
      phone: '+225 07 00 00 01',
      status: 'scheduled',
      type: 'first-visit',
      priority: 'high',
      notes: 'Première visite pour certification',
      coordinates: { lat: 5.3364, lng: -3.9847 }
    },
    {
      id: 2,
      date: '2025-11-30',
      time: '16:00',
      property: 'Appartement Riviera',
      address: 'Marcory, Zone 4A',
      owner: 'Mme TRAORE Aya',
      phone: '+225 05 00 00 02',
      status: 'scheduled',
      type: 'quality-control',
      priority: 'medium',
      notes: 'Contrôle qualité post-rénovation',
      coordinates: { lat: 5.2767, lng: -3.9756 }
    },
    {
      id: 3,
      date: '2025-12-01',
      time: '09:00',
      property: 'Résidence Les Palmiers',
      address: 'Abidjan, Plateau',
      owner: 'SCI Palmiers SA',
      phone: '+225 20 00 00 03',
      status: 'scheduled',
      type: 'recertification',
      priority: 'high',
      notes: 'Renouvellement certificat annuel',
      coordinates: { lat: 5.3197, lng: -4.0265 }
    },
    {
      id: 4,
      date: '2025-12-01',
      time: '11:30',
      property: 'Immeuble Cocody Centre',
      address: 'Cocody, Deux Plateaux',
      owner: 'M. BAKAYOKO Ibrahim',
      phone: '+225 01 00 00 04',
      status: 'scheduled',
      type: 'first-visit',
      priority: 'low',
      coordinates: { lat: 5.3481, lng: -3.9876 }
    },
    {
      id: 5,
      date: '2025-11-29',
      time: '15:00',
      property: 'Villa Yopougon',
      address: 'Yopougon, Siporex',
      owner: 'M. DIALLO Ousmane',
      phone: '+225 03 00 00 05',
      status: 'completed',
      type: 'quality-control',
      priority: 'medium',
      notes: 'Inspection terminée avec succès',
      coordinates: { lat: 5.3340, lng: -4.0846 }
    }
  ];

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'scheduled': { 
        label: 'Programmée', 
        color: 'bg-blue-100 text-blue-800', 
        icon: Calendar 
      },
      'in-progress': { 
        label: 'En cours', 
        color: 'bg-amber-100 text-amber-800', 
        icon: Clock 
      },
      'completed': { 
        label: 'Terminée', 
        color: 'bg-green-100 text-semantic-success', 
        icon: CheckCircle 
      },
      'cancelled': { 
        label: 'Annulée', 
        color: 'bg-red-100 text-semantic-error', 
        icon: XCircle 
      },
      'rescheduled': { 
        label: 'Reprogrammée', 
        color: 'bg-yellow-100 text-semantic-warning', 
        icon: RotateCcw 
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.scheduled;
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'first-visit': { label: 'Première visite', color: 'bg-purple-100 text-purple-800' },
      'quality-control': { label: 'Contrôle qualité', color: 'bg-blue-100 text-blue-800' },
      'recertification': { label: 'Recertification', color: 'bg-green-100 text-green-800' }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap['first-visit'];
  };

  const getPriorityInfo = (priority: string) => {
    const priorityMap = {
      'high': { label: 'Haute', color: 'bg-red-100 text-semantic-error', icon: AlertTriangle },
      'medium': { label: 'Moyenne', color: 'bg-yellow-100 text-semantic-warning', icon: Clock },
      'low': { label: 'Basse', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesFilter = selectedFilter === 'all' || inspection.status === selectedFilter;
    const matchesSearch = inspection.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const upcomingInspections = inspections.filter(i => 
    i.status === 'scheduled' && new Date(`${i.date}T${i.time}`) > new Date()
  ).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Calendrier des Inspections ANSUT
            </h2>
            <p className="text-neutral-700">
              Gestion et suivi des visites de certification
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200">
              <Calendar className="w-4 h-4 mr-2" />
              Nouvelle inspection
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Aujourd'hui</p>
              <p className="text-lg font-bold text-neutral-900">{upcomingInspections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-semantic-warning" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En attente</p>
              <p className="text-lg font-bold text-neutral-900">
                {inspections.filter(i => i.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-semantic-success" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Terminées</p>
              <p className="text-lg font-bold text-neutral-900">
                {inspections.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-semantic-error" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Priorité haute</p>
              <p className="text-lg font-bold text-neutral-900">
                {inspections.filter(i => i.priority === 'high' && i.status === 'scheduled').length}
              </p>
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
                placeholder="Rechercher une propriété..."
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
              <option value="all">Tous les statuts</option>
              <option value="scheduled">Programmées</option>
              <option value="in-progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-700 hover:bg-neutral-50 rounded-lg">
              <Navigation className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspections List */}
      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Liste des Inspections
          </h3>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {filteredInspections.map((inspection) => {
            const statusInfo = getStatusInfo(inspection.status);
            const typeInfo = getTypeInfo(inspection.type);
            const priorityInfo = getPriorityInfo(inspection.priority);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={inspection.id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-neutral-900">
                        {inspection.property}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                        {priorityInfo.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-neutral-700">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{new Date(inspection.date).toLocaleDateString('fr-FR')} à {inspection.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{inspection.address}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{inspection.owner}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-neutral-500" />
                        <span>{inspection.phone}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {inspection.notes && (
                        <p className="text-sm text-neutral-600 mt-2">
                          {inspection.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {inspection.coordinates && (
                      <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Voir sur la carte">
                        <Navigation className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg" title="Détails">
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {inspection.status === 'scheduled' && (
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-semantic-success text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                          Confirmer
                        </button>
                        <button className="px-3 py-1 text-sm bg-semantic-warning text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200">
                          Reprogrammer
                        </button>
                      </div>
                    )}
                    
                    {inspection.status === 'completed' && (
                      <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                        Rapport
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Inspections Today */}
      {upcomingInspections.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-semantic-warning mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">
              Inspections Programmées Aujourd'hui
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingInspections.slice(0, 4).map((inspection) => (
              <div key={inspection.id} className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900">{inspection.property}</h4>
                    <p className="text-sm text-neutral-700">{inspection.time} - {inspection.address}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-neutral-700 hover:bg-neutral-100 rounded">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-neutral-700 hover:bg-neutral-100 rounded">
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustInspectionsSection;