import { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  CreditCard,
  ArrowLeft,
  MessageSquare,
  Download
} from 'lucide-react';
import { trustValidationService } from '@/services/trustValidationService';
import { useAuth } from '@/app/providers/AuthProvider';

interface ValidationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  agent_notes?: string;
  rejection_reason?: string;
  additional_info_requested?: string;
  trust_score?: number;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    id_number?: string;
    city?: string;
    tenant_score?: number;
    ansut_verified: boolean;
    monthly_income?: number;
    employment_status?: string;
    guarantor_name?: string;
    guarantor_phone?: string;
  };
  documents: {
    id_card_url?: string;
    selfie_url?: string;
    income_proof_url?: string;
    employment_certificate_url?: string;
    guarantor_id_url?: string;
  };
  verification_status: {
    onecpi: 'pending' | 'verified' | 'failed';
    identity_match: 'pending' | 'verified' | 'failed';
    documents_valid: 'pending' | 'verified' | 'failed';
    income_verified: 'pending' | 'verified' | 'failed';
  };
}

export default function ValidationRequestsManagement() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<ValidationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'under_review' | 'urgent'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile && (profile.available_roles?.includes('trust_agent') || profile.active_role === 'trust_agent')) {
      loadValidationRequests();
    }
  }, [profile, filter]);

  const loadValidationRequests = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filter !== 'all') {
        if (filter === 'urgent') {
          // Simulation des demandes urgentes
          filters.urgency = 'high';
        } else {
          filters.status = filter;
        }
      }
      const data = await trustValidationService.getValidationRequests(filters);
      setRequests(data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'additional_info_required': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours === 1) return 'Il y a 1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  const filteredRequests = requests.filter(request =>
    request.profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!profile || (!profile.available_roles?.includes('trust_agent') && profile.active_role !== 'trust_agent')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès réservé</h2>
          <p className="text-gray-600">Cette page est réservée aux agents Tiers de Confiance.</p>
        </div>
      </div>
    );
  }

  if (selectedRequest) {
    return (
      <ValidationRequestDetail
        request={selectedRequest}
        onBack={() => {
          setSelectedRequest(null);
          loadValidationRequests();
        }}
        onUpdate={loadValidationRequests}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Validations</h1>
              <p className="text-gray-600">Validation manuelle des demandes de confiance</p>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 bg-yellow-500 text-white p-1.5 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-gray-600">En attente</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 bg-blue-500 text-white p-1.5 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'under_review').length}</p>
                  <p className="text-sm text-gray-600">En examen</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 bg-green-500 text-white p-1.5 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'approved').length}</p>
                  <p className="text-sm text-gray-600">Approuvées</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 bg-red-500 text-white p-1.5 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'rejected').length}</p>
                  <p className="text-sm text-gray-600">Rejetées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex gap-2">
                <FilterButton
                  label="Toutes"
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                  count={requests.length}
                />
                <FilterButton
                  label="En attente"
                  active={filter === 'pending'}
                  onClick={() => setFilter('pending')}
                  count={requests.filter(r => r.status === 'pending').length}
                />
                <FilterButton
                  label="En examen"
                  active={filter === 'under_review'}
                  onClick={() => setFilter('under_review')}
                  count={requests.filter(r => r.status === 'under_review').length}
                />
                <FilterButton
                  label="Urgentes"
                  active={filter === 'urgent'}
                  onClick={() => setFilter('urgent')}
                  count={3}
                />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher un demandeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Liste des demandes */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement des demandes...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune demande trouvée</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <ValidationRequestCard
                    key={request.id}
                    request={request}
                    getStatusColor={getStatusColor}
                    formatTimeAgo={formatTimeAgo}
                    onClick={() => setSelectedRequest(request)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick, count }: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium rounded-lg transition-colors ${
        active
          ? 'bg-green-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label} {count !== undefined && `(${count})`}
    </button>
  );
}

function ValidationRequestCard({ request, getStatusColor, formatTimeAgo, onClick }: {
  request: ValidationRequest;
  getStatusColor: (status: string) => string;
  formatTimeAgo: (date: string) => string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer bg-white"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {request.profile.first_name} {request.profile.last_name}
              </h3>
              <p className="text-sm text-gray-600">{request.profile.email}</p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
              {request.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{request.profile.phone || 'Non renseigné'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{request.profile.city || 'Non renseigné'}</span>
            </div>
            {request.profile.tenant_score && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Score ANSUT: {request.profile.tenant_score}/850</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(request.requested_at)}</span>
            </div>
          </div>

          {request.profile.ansut_verified && (
            <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              ✅ Vérifié ANSUT
            </span>
          )}
        </div>

        <div className="text-right ml-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Examiner
          </button>
        </div>
      </div>
    </div>
  );
}

function ValidationRequestDetail({ request, onBack, onUpdate }: {
  request: ValidationRequest;
  onBack: () => void;
  onUpdate: () => void;
}) {
  const [formData, setFormData] = useState({
    documentsVerified: false,
    identityVerified: false,
    backgroundCheck: false,
    incomeVerified: false,
    trustScore: 75,
    agentNotes: '',
    rejectionReason: '',
    additionalInfoRequested: ''
  });

  const [decision, setDecision] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!decision) return;

    try {
      setSubmitting(true);

      const status = decision === 'approve' ? 'approved' :
                    decision === 'reject' ? 'rejected' :
                    'additional_info_required';

      await trustValidationService.updateValidationRequest({
        requestId: request.id,
        status,
        ...formData
      });

      alert('Décision enregistrée avec succès !');
      onUpdate();
      onBack();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la validation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <button
          onClick={onBack}
          className="mb-6 text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Validation Manuelle - {request.profile.first_name} {request.profile.last_name}
            </h1>
            <p className="text-green-100">
              Demandé le {formatDate(request.requested_at)}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Section 1: Informations personnelles */}
            <Section title="Informations Personnelles">
              <InfoGrid>
                <InfoItem label="Nom complet" value={`${request.profile.first_name} ${request.profile.last_name}`} />
                <InfoItem label="Email" value={request.profile.email} />
                <InfoItem label="Téléphone" value={request.profile.phone} />
                <InfoItem label="Date de naissance" value={request.profile.date_of_birth} />
                <InfoItem label="Numéro CNI" value={request.profile.id_number} />
                <InfoItem label="Ville" value={request.profile.city || 'Non renseigné'} />
                {request.profile.employment_status && (
                  <InfoItem label="Statut emploi" value={request.profile.employment_status} />
                )}
                {request.profile.monthly_income && (
                  <InfoItem label="Revenus mensuels" value={`${new Intl.NumberFormat('fr-FR').format(request.profile.monthly_income)} FCFA`} />
                )}
              </InfoGrid>
            </Section>

            {/* Section 2: Garant */}
            {request.profile.guarantor_name && (
              <Section title="Informations Garant">
                <InfoGrid>
                  <InfoItem label="Nom du garant" value={request.profile.guarantor_name} />
                  <InfoItem label="Téléphone garant" value={request.profile.guarantor_phone} />
                </InfoGrid>
              </Section>
            )}

            {/* Section 3: Vérifications automatiques */}
            <Section title="Vérifications Automatiques">
              <div className="grid grid-cols-2 gap-4">
                <VerificationStatus
                  label="Vérification ONECI"
                  status={request.verification_status.onecpi}
                />
                <VerificationStatus
                  label="Correspondance identité"
                  status={request.verification_status.identity_match}
                />
                <VerificationStatus
                  label="Validité documents"
                  status={request.verification_status.documents_valid}
                />
                <VerificationStatus
                  label="Vérification revenus"
                  status={request.verification_status.income_verified}
                />
              </div>
            </Section>

            {/* Section 4: Documents */}
            <Section title="Documents">
              <div className="grid grid-cols-2 gap-4">
                {request.documents.id_card_url && (
                  <DocumentPreview
                    title="Carte d'identité"
                    url={request.documents.id_card_url}
                  />
                )}
                {request.documents.selfie_url && (
                  <DocumentPreview
                    title="Photo selfie"
                    url={request.documents.selfie_url}
                  />
                )}
                {request.documents.income_proof_url && (
                  <DocumentPreview
                    title="Justificatif de revenus"
                    url={request.documents.income_proof_url}
                  />
                )}
                {request.documents.employment_certificate_url && (
                  <DocumentPreview
                    title="Certificat d'emploi"
                    url={request.documents.employment_certificate_url}
                  />
                )}
              </div>
            </Section>

            {/* Section 5: Vérifications manuelles */}
            <Section title="Vérifications Manuelles">
              <div className="space-y-3">
                <Checkbox
                  label="Documents CNI clairs et lisibles"
                  checked={formData.documentsVerified}
                  onChange={(checked) => setFormData({ ...formData, documentsVerified: checked })}
                />
                <Checkbox
                  label="Selfie correspond à la CNI"
                  checked={formData.identityVerified}
                  onChange={(checked) => setFormData({ ...formData, identityVerified: checked })}
                />
                <Checkbox
                  label="Aucun antécédent judiciaire"
                  checked={formData.backgroundCheck}
                  onChange={(checked) => setFormData({ ...formData, backgroundCheck: checked })}
                />
                <Checkbox
                  label="Revenus cohérents avec le dossier"
                  checked={formData.incomeVerified}
                  onChange={(checked) => setFormData({ ...formData, incomeVerified: checked })}
                />
              </div>
            </Section>

            {/* Section 6: Notes agent */}
            <Section title="Notes Agent">
              <textarea
                value={formData.agentNotes}
                onChange={(e) => setFormData({ ...formData, agentNotes: e.target.value })}
                placeholder="Vos observations sur le dossier..."
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </Section>

            {/* Section 7: Décision */}
            <Section title="Décision">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setDecision('approve')}
                    className={`
                      flex-1 py-3 px-4 rounded-lg font-medium transition-all
                      ${decision === 'approve'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Approuver
                  </button>
                  <button
                    onClick={() => setDecision('request_info')}
                    className={`
                      flex-1 py-3 px-4 rounded-lg font-medium transition-all
                      ${decision === 'request_info'
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <AlertTriangle className="w-5 h-5 inline mr-2" />
                    Demander infos
                  </button>
                  <button
                    onClick={() => setDecision('reject')}
                    className={`
                      flex-1 py-3 px-4 rounded-lg font-medium transition-all
                      ${decision === 'reject'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <XCircle className="w-5 h-5 inline mr-2" />
                    Rejeter
                  </button>
                </div>

                {decision === 'approve' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score de confiance (0-100)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.trustScore}
                      onChange={(e) => setFormData({ ...formData, trustScore: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>0</span>
                      <span className="font-semibold text-lg text-green-600">{formData.trustScore}</span>
                      <span>100</span>
                    </div>
                  </div>
                )}

                {decision === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison du rejet *
                    </label>
                    <textarea
                      value={formData.rejectionReason}
                      onChange={(e) => setFormData({ ...formData, rejectionReason: e.target.value })}
                      placeholder="Expliquez la raison du rejet..."
                      className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                {decision === 'request_info' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Informations requises *
                    </label>
                    <textarea
                      value={formData.additionalInfoRequested}
                      onChange={(e) => setFormData({ ...formData, additionalInfoRequested: e.target.value })}
                      placeholder="Indiquez quelles informations sont nécessaires..."
                      className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
              </div>
            </Section>

            <div className="flex gap-4 pt-6 border-t">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!decision || submitting}
                className={`
                  flex-1 py-3 px-6 rounded-lg font-semibold transition-all
                  ${decision && !submitting
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {submitting ? 'Envoi en cours...' : 'Valider la décision'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composants utilitaires
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {children}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">{value || 'Non renseigné'}</p>
    </div>
  );
}

function VerificationStatus({ label, status }: { label: string; status: string }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'verified': return 'Vérifié';
      case 'failed': return 'Échec';
      default: return 'En attente';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <p className="font-medium text-gray-900">{label}</p>
      </div>
      <span className={`text-sm font-semibold ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
}

function DocumentPreview({ title, url }: { title: string; url: string }) {
  const isImage = url.match(/\.(jpg|jpeg|png|gif)$/i);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <button className="text-blue-600 hover:text-blue-700 text-sm">
          <Download className="w-4 h-4" />
        </button>
      </div>
      {isImage ? (
        <img
          src={url}
          alt={title}
          className="w-full rounded-lg border border-gray-200 max-h-64 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
          <span className="ml-2 text-sm text-gray-600">Document PDF</span>
        </div>
      )}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
      />
      <span className="text-gray-900">{label}</span>
    </label>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}