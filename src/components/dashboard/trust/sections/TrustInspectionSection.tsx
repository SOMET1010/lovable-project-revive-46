import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  MapPin,
  Home,
  Camera,
  FileCheck,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Download,
  Upload,
  Star,
  MessageSquare,
  CheckSquare,
  XSquare
} from 'lucide-react';

const TrustInspectionSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedInspection, setSelectedInspection] = useState<any>(null);

  // Données mock des inspections programmées
  const inspections = [
    {
      id: 'INSP-001',
      date: '2024-11-30',
      time: '09:00',
      address: 'Villa Bellevue, Cocody',
      type: 'Inspection technique',
      inspector: 'Agent Jean MUKENDI',
      status: 'scheduled',
      client: 'M. KOUASSI Jean',
      phone: '+225 07 XX XX XX XX',
      checklist: [
        { item: 'Installation électrique', status: 'pending', notes: '' },
        { item: 'Système de plomberie', status: 'pending', notes: '' },
        { item: 'Structure du bâtiment', status: 'pending', notes: '' },
        { item: 'Équipements de sécurité', status: 'pending', notes: '' },
        { item: 'Clôture et portail', status: 'pending', notes: '' }
      ],
      documents: [],
      photos: [],
      signature: null
    },
    {
      id: 'INSP-002',
      date: '2024-11-30',
      time: '14:30',
      address: 'Appartement Riviera, Plateau',
      type: 'Inspection de conformité',
      inspector: 'Agent Jean MUKENDI',
      status: 'in_progress',
      client: 'Mme ADJOUNI Aminata',
      phone: '+225 01 XX XX XX XX',
      checklist: [
        { item: 'Installation électrique', status: 'completed', notes: 'Conforme aux normes' },
        { item: 'Système de plomberie', status: 'completed', notes: 'Installation récente' },
        { item: 'Structure du bâtiment', status: 'completed', notes: 'Aucune anomalie' },
        { item: 'Équipements de sécurité', status: 'pending', notes: '' },
        { item: 'Aménagement intérieur', status: 'completed', notes: 'Bien entretenu' }
      ],
      documents: ['Rapport technique.pdf'],
      photos: ['photo1.jpg', 'photo2.jpg'],
      signature: null
    },
    {
      id: 'INSP-003',
      date: '2024-12-02',
      time: '10:00',
      address: 'Maison Yopougon, Siporex',
      type: 'Inspection de suivi',
      inspector: 'Agent Jean MUKENDI',
      status: 'completed',
      client: 'M. YAO Michel',
      phone: '+225 05 XX XX XX XX',
      checklist: [
        { item: 'Vérification corrections', status: 'completed', notes: 'Toutes les corrections ont été effectuées' },
        { item: 'Contrôle final', status: 'completed', notes: 'Propriété conforme' }
      ],
      documents: ['Rapport final.pdf', 'Certificat ANSUT.pdf'],
      photos: ['avant.jpg', 'après.jpg', 'final.jpg'],
      signature: 'signature_base64_data'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Calendar, label: 'Programmée' },
      in_progress: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'En cours' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Terminée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XSquare, label: 'Annulée' }
    };

    const config = styles[status as keyof typeof styles];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const getChecklistIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'failed':
        return <XSquare className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const todayInspections = inspections.filter(inspection => 
    inspection.date === new Date().toISOString().split('T')[0]
  );

  const upcomingInspections = inspections.filter(inspection => 
    inspection.date > new Date().toISOString().split('T')[0]
  );

  const InspectionCard: React.FC<{ inspection: any, onClick?: () => void }> = ({ inspection, onClick }) => (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Home className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-neutral-900">{inspection.address}</h3>
          </div>
          <p className="text-sm text-neutral-700 mb-1">{inspection.type}</p>
          <div className="flex items-center text-sm text-neutral-600">
            <User className="w-4 h-4 mr-1" />
            <span>{inspection.client}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{inspection.time}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {getStatusBadge(inspection.status)}
          <span className="text-xs text-neutral-500">ID: {inspection.id}</span>
        </div>
      </div>

      {/* Progress */}
      {inspection.status === 'in_progress' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">Progression</span>
            <span className="text-sm text-neutral-600">
              {inspection.checklist.filter((item: any) => item.status === 'completed').length}/
              {inspection.checklist.length} éléments
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full"
              style={{
                width: `${(inspection.checklist.filter((item: any) => item.status === 'completed').length / inspection.checklist.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Documents et photos */}
      <div className="flex items-center justify-between mb-4 p-3 bg-neutral-50 rounded-lg">
        <div className="flex items-center">
          <FileCheck className="w-4 h-4 text-neutral-600 mr-2" />
          <span className="text-sm text-neutral-700">{inspection.documents.length} documents</span>
        </div>
        <div className="flex items-center">
          <Camera className="w-4 h-4 text-neutral-600 mr-2" />
          <span className="text-sm text-neutral-700">{inspection.photos.length} photos</span>
        </div>
        {inspection.signature && (
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-600">Signé</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-neutral-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span>Cocody, Abidjan</span>
        </div>
        <div className="flex gap-2">
          {inspection.status === 'scheduled' && (
            <button className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
              Commencer
            </button>
          )}
          {inspection.status === 'in_progress' && (
            <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
              Finaliser
            </button>
          )}
          <button className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 text-sm">
            Détails
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Gestion des Inspections</h2>
          <p className="text-neutral-700 mt-1">Planifiez et suivez les inspections techniques des propriétés</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Liste
            </button>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle inspection
          </button>
        </div>
      </div>

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-neutral-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-neutral-100 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-neutral-600">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
              const dayInspections = inspections.filter(insp => 
                new Date(insp.date).getDate() === day
              );
              const isToday = day === new Date().getDate();
              
              return (
                <div
                  key={day}
                  className={`p-2 min-h-[80px] border border-neutral-200 rounded-lg ${
                    isToday ? 'bg-primary-50 border-primary-200' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-primary-900' : 'text-neutral-900'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayInspections.slice(0, 2).map((inspection) => (
                      <div key={inspection.id} className="text-xs p-1 bg-primary-100 text-primary-800 rounded truncate">
                        {inspection.time} {inspection.type}
                      </div>
                    ))}
                    {dayInspections.length > 2 && (
                      <div className="text-xs text-neutral-600">+{dayInspections.length - 2} autres</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Aujourd'hui</p>
              <p className="text-xl font-bold text-neutral-900">{todayInspections.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">En cours</p>
              <p className="text-xl font-bold text-neutral-900">
                {inspections.filter(i => i.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">Terminées</p>
              <p className="text-xl font-bold text-neutral-900">
                {inspections.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-700">À venir</p>
              <p className="text-xl font-bold text-neutral-900">{upcomingInspections.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des inspections */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">Inspections du jour</h3>
        {todayInspections.map((inspection) => (
          <InspectionCard 
            key={inspection.id} 
            inspection={inspection}
            onClick={() => setSelectedInspection(inspection)}
          />
        ))}
        
        {upcomingInspections.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-neutral-900 mt-8">Inspections à venir</h3>
            {upcomingInspections.map((inspection) => (
              <InspectionCard 
                key={inspection.id} 
                inspection={inspection}
                onClick={() => setSelectedInspection(inspection)}
              />
            ))}
          </>
        )}
      </div>

      {/* Modal d'inspection détaillée */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">
                  Inspection {selectedInspection.id} - {selectedInspection.address}
                </h3>
                <button 
                  onClick={() => setSelectedInspection(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <XSquare className="w-5 h-5" />
                </button>
              </div>

              {/* Checklist technique */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">Checklist Technique Standardisée</h4>
                <div className="space-y-3">
                  {selectedInspection.checklist.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center">
                        {getChecklistIcon(item.status)}
                        <span className="ml-3 text-sm font-medium text-neutral-900">{item.item}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.notes && (
                          <MessageSquare className="w-4 h-4 text-neutral-400" />
                        )}
                        <select className="text-sm border border-neutral-300 rounded px-2 py-1">
                          <option value="pending">En attente</option>
                          <option value="completed">Conforme</option>
                          <option value="failed">Non-conforme</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300">
                  Annuler
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter photos
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finaliser inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustInspectionSection;