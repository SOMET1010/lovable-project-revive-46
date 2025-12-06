import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Eye, 
  MessageSquare, 
  XCircle, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  Home
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { type TenantApplicationWithDetails } from '@/services/applications/applicationService';

interface TenantApplicationCardProps {
  application: TenantApplicationWithDetails;
  onCancel: (id: string) => void;
  isCanceling: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock; bgColor: string }> = {
  en_attente: { 
    label: 'En attente', 
    color: 'text-amber-700', 
    icon: Clock,
    bgColor: 'bg-amber-100'
  },
  en_cours: { 
    label: 'En cours', 
    color: 'text-blue-700', 
    icon: Clock,
    bgColor: 'bg-blue-100'
  },
  acceptee: { 
    label: 'Acceptée', 
    color: 'text-green-700', 
    icon: CheckCircle,
    bgColor: 'bg-green-100'
  },
  refusee: { 
    label: 'Refusée', 
    color: 'text-red-700', 
    icon: XCircle,
    bgColor: 'bg-red-100'
  },
  annulee: { 
    label: 'Annulée', 
    color: 'text-neutral-500', 
    icon: AlertCircle,
    bgColor: 'bg-neutral-100'
  },
};

const DEFAULT_STATUS = STATUS_CONFIG['en_attente']!;

export default function TenantApplicationCard({ 
  application, 
  onCancel, 
  isCanceling 
}: TenantApplicationCardProps) {
  const statusConfig = STATUS_CONFIG[application.status] ?? DEFAULT_STATUS;
  const StatusIcon = statusConfig.icon;

  const formattedDate = application.created_at 
    ? format(new Date(application.created_at), 'd MMMM yyyy', { locale: fr })
    : 'Date inconnue';

  const canCancel = application.status === 'en_attente';

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Property Image */}
        <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 relative">
          {application.property?.main_image ? (
            <img
              src={application.property.main_image}
              alt={application.property.title || 'Propriété'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <Home className="h-12 w-12 text-neutral-300" />
            </div>
          )}
          
          {/* Status Badge on Image */}
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.color}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex flex-col h-full">
            {/* Top Section */}
            <div className="flex-1">
              {/* Property Title */}
              <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 mb-1">
                {application.property?.title || 'Propriété supprimée'}
              </h3>

              {/* Location */}
              <div className="flex items-center text-neutral-500 text-sm mb-3">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="line-clamp-1">
                  {application.property?.city}
                  {application.property?.neighborhood && `, ${application.property.neighborhood}`}
                </span>
              </div>

              {/* Details Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                {/* Rent */}
                {application.property?.monthly_rent && (
                  <span className="font-bold text-primary-600">
                    {application.property.monthly_rent.toLocaleString()} FCFA/mois
                  </span>
                )}

                {/* Application Date */}
                <span className="flex items-center text-neutral-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formattedDate}
                </span>
              </div>

              {/* Owner Info */}
              {application.owner && (
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <div className="w-6 h-6 rounded-full bg-neutral-200 overflow-hidden">
                    {application.owner.avatar_url ? (
                      <img 
                        src={application.owner.avatar_url} 
                        alt={application.owner.full_name || 'Propriétaire'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-3 w-3 text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <span>
                    {application.owner.full_name || 'Propriétaire'}
                    {application.owner.is_verified && (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 inline ml-1" />
                    )}
                  </span>
                  {application.owner.trust_score !== null && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Score: {application.owner.trust_score}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
              {/* View Property */}
              <Link
                to={`/propriete/${application.property_id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Eye className="h-4 w-4" />
                Voir la propriété
              </Link>

              {/* Contact Owner */}
              {application.owner && application.property && (
                <Link
                  to={`/messages?to=${application.owner.user_id}&property=${application.property_id}&subject=Candidature: ${application.property.title}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Contacter
                </Link>
              )}

              {/* Cancel Button */}
              {canCancel && (
                <button
                  onClick={() => onCancel(application.id)}
                  disabled={isCanceling}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCanceling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Annuler
                </button>
              )}

              {/* Status specific messages */}
              {application.status === 'acceptee' && (
                <span className="text-sm text-green-600 font-medium ml-auto">
                  🎉 Félicitations ! Votre candidature a été acceptée
                </span>
              )}
              {application.status === 'refusee' && (
                <span className="text-sm text-red-500 ml-auto">
                  Candidature refusée par le propriétaire
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}