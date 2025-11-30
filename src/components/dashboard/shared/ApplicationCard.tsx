import React from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Star,
  Building,
  DollarSign,
  MessageSquare,
  UserCheck,
  Send
} from 'lucide-react';

export interface Application {
  id: number;
  propertyId: number;
  propertyTitle: string;
  propertyAddress: string;
  propertyType: 'appartement' | 'villa' | 'studio' | 'maison' | 'immeuble';
  propertyRent: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAge?: number;
  applicantIncome?: number;
  applicationDate: string;
  status: 'en_attente' | 'accepte' | 'refuse' | 'annule' | 'en_cours';
  documentsStatus: 'incomplet' | 'complet' | 'en_verification';
  message?: string;
  notes?: string;
  priority: 'basse' | 'normale' | 'haute';
  lastUpdate: string;
  visited?: boolean;
  creditScore?: number;
  employmentType?: string;
  references?: number;
  guarantor?: string;
  files?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

interface ApplicationCardProps {
  application: Application;
  role: 'tenant' | 'owner' | 'agency';
  onViewDetails?: (id: number) => void;
  onUpdateStatus?: (id: number, status: string) => void;
  onContact?: (id: number) => void;
  onDownload?: (id: number, fileId: string) => void;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  showBulkActions?: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  role,
  onViewDetails,
  onUpdateStatus,
  onContact,
  onDownload,
  isSelected = false,
  onSelect,
  showBulkActions = false
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'en_attente':
        return {
          label: 'En attente',
          color: 'bg-amber-100 text-amber-800',
          icon: Clock,
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-600'
        };
      case 'accepte':
        return {
          label: 'Accepté',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          iconColor: 'text-green-600'
        };
      case 'refuse':
        return {
          label: 'Refusé',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600'
        };
      case 'annule':
        return {
          label: 'Annulé',
          color: 'bg-neutral-100 text-neutral-800',
          icon: XCircle,
          bgColor: 'bg-neutral-50',
          iconColor: 'text-neutral-600'
        };
      case 'en_cours':
        return {
          label: 'En cours',
          color: 'bg-blue-100 text-blue-800',
          icon: AlertCircle,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          label: 'Inconnu',
          color: 'bg-neutral-100 text-neutral-800',
          icon: AlertCircle,
          bgColor: 'bg-neutral-50',
          iconColor: 'text-neutral-600'
        };
    }
  };

  const getDocumentsStatusConfig = (status: string) => {
    switch (status) {
      case 'complet':
        return {
          label: 'Complet',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'en_verification':
        return {
          label: 'En vérification',
          color: 'bg-blue-100 text-blue-800',
          icon: Eye
        };
      case 'incomplet':
        return {
          label: 'Incomplet',
          color: 'bg-red-100 text-red-800',
          icon: AlertCircle
        };
      default:
        return {
          label: 'Inconnu',
          color: 'bg-neutral-100 text-neutral-800',
          icon: AlertCircle
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'haute':
        return { color: 'text-red-600', label: 'Haute' };
      case 'normale':
        return { color: 'text-amber-600', label: 'Normale' };
      case 'basse':
        return { color: 'text-green-600', label: 'Basse' };
      default:
        return { color: 'text-neutral-600', label: 'Normale' };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const statusConfig = getStatusConfig(application.status);
  const docsConfig = getDocumentsStatusConfig(application.documentsStatus);
  const priorityConfig = getPriorityConfig(application.priority);
  const StatusIcon = statusConfig.icon;
  const DocsIcon = docsConfig.icon;

  const renderActionButtons = () => {
    switch (role) {
      case 'owner':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails?.(application.id)}
              className="flex items-center px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              Voir
            </button>
            <button
              onClick={() => onContact?.(application.id)}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Contacter
            </button>
            {application.status === 'en_attente' && (
              <>
                <button
                  onClick={() => onUpdateStatus?.(application.id, 'accepte')}
                  className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors duration-200"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accepter
                </button>
                <button
                  onClick={() => onUpdateStatus?.(application.id, 'refuse')}
                  className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors duration-200"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Refuser
                </button>
              </>
            )}
          </div>
        );
      
      case 'tenant':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails?.(application.id)}
              className="flex items-center px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              Détails
            </button>
            {application.documentsStatus === 'incomplet' && (
              <button className="flex items-center px-3 py-1.5 text-sm bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors duration-200">
                <FileText className="w-4 h-4 mr-1" />
                Compléter
              </button>
            )}
            <button
              onClick={() => onContact?.(application.id)}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Suivi
            </button>
          </div>
        );
      
      case 'agency':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails?.(application.id)}
              className="flex items-center px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              Gérer
            </button>
            <button
              onClick={() => onContact?.(application.id)}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Assigner
            </button>
            {application.status === 'en_attente' && (
              <div className="flex space-x-1">
                <button
                  onClick={() => onUpdateStatus?.(application.id, 'en_cours')}
                  className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Transférer
                </button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderTenantInfo = () => {
    if (role === 'owner' || role === 'agency') {
      return (
        <div className="bg-neutral-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="w-4 h-4 text-neutral-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-neutral-900">{application.applicantName}</p>
                <div className="flex items-center space-x-3 text-xs text-neutral-600">
                  <span>{application.applicantEmail}</span>
                  <span>{application.applicantPhone}</span>
                </div>
              </div>
            </div>
            {application.creditScore && (
              <div className="text-right">
                <p className="text-xs text-neutral-600">Score de crédit</p>
                <p className="text-sm font-bold text-neutral-900">{application.creditScore}/100</p>
              </div>
            )}
          </div>
          
          {(application.applicantIncome || application.employmentType) && (
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-neutral-600">
              {application.applicantIncome && (
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  <span>{formatCurrency(application.applicantIncome)}/mois</span>
                </div>
              )}
              {application.employmentType && (
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  <span>{application.employmentType}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow duration-200 ${
      isSelected ? 'border-primary-500' : 'border-neutral-200'
    }`}>
      {showBulkActions && onSelect && (
        <div className="p-3 border-b border-neutral-200 bg-neutral-50">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(application.id, e.target.checked)}
              className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-neutral-700">Sélectionner cette candidature</span>
          </label>
        </div>
      )}

      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-neutral-900">{application.propertyTitle}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                {priorityConfig.label}
              </span>
            </div>
            <div className="flex items-center text-neutral-600 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{application.propertyAddress}</span>
            </div>
            <p className="text-xl font-bold text-semantic-success">{formatCurrency(application.propertyRent)}/mois</p>
          </div>
          
          <div className="flex space-x-2 ml-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${docsConfig.color}`}>
              <DocsIcon className="w-3 h-3 mr-1" />
              {docsConfig.label}
            </span>
          </div>
        </div>

        {/* Applicant info for owner/agency */}
        {renderTenantInfo()}

        {/* Application details */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div className="flex items-center text-neutral-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Postulée le {formatDate(application.applicationDate)}</span>
          </div>
          <div className="flex items-center text-neutral-600">
            <Building className="w-4 h-4 mr-2" />
            <span className="capitalize">{application.propertyType}</span>
          </div>
          {application.visited && (
            <div className="flex items-center text-neutral-600">
              <Eye className="w-4 h-4 mr-2" />
              <span>Visite effectuée</span>
            </div>
          )}
          {application.references && (
            <div className="flex items-center text-neutral-600">
              <UserCheck className="w-4 h-4 mr-2" />
              <span>{application.references} références</span>
            </div>
          )}
        </div>

        {/* Documents list */}
        {application.files && application.files.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-neutral-600 mb-2">Documents ({application.files.length})</p>
            <div className="flex flex-wrap gap-1">
              {application.files.slice(0, 3).map((file) => (
                <button
                  key={file.id}
                  onClick={() => onDownload?.(application.id, file.id)}
                  className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded hover:bg-neutral-200 transition-colors duration-200"
                >
                  <Download className="w-3 h-3 mr-1" />
                  {file.name}
                </button>
              ))}
              {application.files.length > 3 && (
                <span className="px-2 py-1 text-xs text-neutral-500">
                  +{application.files.length - 3} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Message/Notes */}
        {application.message && (
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-blue-900">{application.message}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
          <div className="flex items-center text-xs text-neutral-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>MAJ: {formatDate(application.lastUpdate)}</span>
          </div>
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;