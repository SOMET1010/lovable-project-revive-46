import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/app/layout/Header';
import Footer from '@/app/layout/Footer';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Loader, 
  Download,
  User,
  Calendar,
  DollarSign,
  Stamp,
  Clock
} from 'lucide-react';

interface LeaseContract {
  id: string;
  contract_number: string;
  property_id: string;
  owner_id: string;
  tenant_id: string;
  monthly_rent: number;
  deposit_amount: number | null;
  charges_amount: number | null;
  start_date: string;
  end_date: string;
  payment_day: number | null;
  status: string | null;
  signed_at: string | null;
  landlord_signed_at: string | null;
  tenant_signed_at: string | null;
  document_url: string | null;
  signed_document_url: string | null;
  cryptoneo_operation_id: string | null;
  custom_clauses: string | null;
  created_at: string | null;
}

interface Property {
  title: string;
  address: string | null;
  city: string;
}

interface UserProfile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_verified: boolean | null;
  oneci_verified: boolean | null;
}

export default function SignLeasePage() {
  const { user, profile } = useAuth();
  const { id: leaseId } = useParams<{ id: string }>();
  
  const [lease, setLease] = useState<LeaseContract | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);
  const [tenantProfile, setTenantProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [certifiedSigning, setCertifiedSigning] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && leaseId) {
      loadLeaseData();
    }
  }, [user, leaseId]);

  const loadLeaseData = async () => {
    if (!leaseId) return;
    
    try {
      const { data: leaseData, error: leaseError } = await supabase
        .from('lease_contracts')
        .select('*')
        .eq('id', leaseId)
        .single();

      if (leaseError) throw leaseError;

      if (leaseData.owner_id !== user?.id && leaseData.tenant_id !== user?.id) {
        setError('Vous n\'êtes pas autorisé à accéder à ce bail');
        setLoading(false);
        return;
      }

      setLease(leaseData as LeaseContract);

      const [propertyRes, ownerRes, tenantRes] = await Promise.all([
        supabase
          .from('properties')
          .select('title, address, city')
          .eq('id', leaseData.property_id)
          .single(),
        supabase
          .from('profiles')
          .select('full_name, email, phone, is_verified, oneci_verified')
          .eq('user_id', leaseData.owner_id)
          .single(),
        supabase
          .from('profiles')
          .select('full_name, email, phone, is_verified, oneci_verified')
          .eq('user_id', leaseData.tenant_id)
          .single()
      ]);

      if (propertyRes.data) setProperty(propertyRes.data as Property);
      if (ownerRes.data) setOwnerProfile(ownerRes.data as UserProfile);
      if (tenantRes.data) setTenantProfile(tenantRes.data as UserProfile);

    } catch (err: unknown) {
      console.error('Error loading lease:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du bail');
    } finally {
      setLoading(false);
    }
  };

  const handleSimpleSign = async () => {
    if (!user || !lease || !acceptedTerms) return;

    setSigning(true);
    setError('');

    try {
      const isOwner = lease.owner_id === user.id;
      const updateField = isOwner ? 'landlord_signed_at' : 'tenant_signed_at';
      
      const updateData: Record<string, unknown> = {
        [updateField]: new Date().toISOString()
      };

      // If both parties will have signed, update status
      const otherSigned = isOwner ? lease.tenant_signed_at : lease.landlord_signed_at;
      if (otherSigned) {
        updateData['status'] = 'pending_cryptoneo';
      }

      const { error: updateError } = await supabase
        .from('lease_contracts')
        .update(updateData)
        .eq('id', lease.id);

      if (updateError) throw updateError;

      // Create notification for other party
      const otherPartyId = isOwner ? lease.tenant_id : lease.owner_id;
      await supabase.from('notifications').insert({
        user_id: otherPartyId,
        type: 'lease_signed',
        title: 'Signature du bail',
        message: `${profile?.full_name || 'L\'autre partie'} a signé le bail ${lease.contract_number}`,
        action_url: `/signer-bail/${lease.id}`
      });

      setSuccess('✅ Signature simple enregistrée!');
      loadLeaseData();

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la signature');
    } finally {
      setSigning(false);
    }
  };

  const handleCertifiedSign = async () => {
    if (!user || !lease) return;

    setCertifiedSigning(true);
    setError('');

    try {
      const { data, error: signError } = await supabase.functions.invoke('cryptoneo-sign-document', {
        body: { leaseId: lease.id }
      });

      if (signError) throw signError;

      if (data.needsVerification) {
        setError('Veuillez d\'abord vérifier votre identité ONECI pour la signature certifiée');
        return;
      }

      setSuccess(`✅ ${data.message}`);
      loadLeaseData();

    } catch (err: unknown) {
      console.error('Error with certified signing:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la signature certifiée');
    } finally {
      setCertifiedSigning(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Connexion requise</h2>
            <p className="text-muted-foreground">Veuillez vous connecter pour signer le bail</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader className="w-12 h-12 text-primary animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!lease || !property) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Bail introuvable</h2>
            <p className="text-muted-foreground">{error || 'Le bail demandé n\'existe pas'}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isOwner = lease.owner_id === user.id;
  const hasUserSigned = isOwner ? !!lease.landlord_signed_at : !!lease.tenant_signed_at;
  const hasOtherSigned = isOwner ? !!lease.tenant_signed_at : !!lease.landlord_signed_at;
  const bothSigned = !!lease.landlord_signed_at && !!lease.tenant_signed_at;
  const isCertifiedSigned = lease.status === 'active' && lease.signed_document_url;
  const isProcessing = lease.status === 'processing';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 card-animate-in dashboard-header-animate">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FileText className="w-10 h-10 text-primary icon-pulse-premium" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Signature du Bail</h1>
                <p className="text-muted-foreground">Contrat #{lease.contract_number}</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start space-x-3 mb-6 card-animate-in">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start space-x-3 mb-6 card-animate-in">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* Verification Warning */}
          {!profile?.is_verified && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-6 card-animate-in">
              <div className="flex items-start space-x-4">
                <Shield className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">Vérification recommandée</h3>
                  <p className="text-amber-800 dark:text-amber-300 mb-4">
                    La vérification de votre profil renforce la confiance et permet la signature certifiée.
                  </p>
                  <Link to="/profil?tab=verification" className="text-primary font-medium hover:underline">
                    Vérifier mon profil →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Signature Status */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 card-animate-in card-hover-premium card-stagger-1">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center space-x-2">
              <Stamp className="w-5 h-5 text-primary" />
              <span>État des signatures</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Owner Signature */}
              <div className={`p-4 rounded-xl border-2 ${
                lease.landlord_signed_at 
                  ? 'border-green-500 bg-green-50 dark:bg-green-500/10' 
                  : 'border-border bg-muted/50'
              }`}>
                <div className="flex items-center space-x-3">
                  {lease.landlord_signed_at ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">Propriétaire</p>
                    <p className="text-sm text-muted-foreground">
                      {ownerProfile?.full_name || 'Non renseigné'}
                    </p>
                    {lease.landlord_signed_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Signé le {new Date(lease.landlord_signed_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tenant Signature */}
              <div className={`p-4 rounded-xl border-2 ${
                lease.tenant_signed_at 
                  ? 'border-green-500 bg-green-50 dark:bg-green-500/10' 
                  : 'border-border bg-muted/50'
              }`}>
                <div className="flex items-center space-x-3">
                  {lease.tenant_signed_at ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">Locataire</p>
                    <p className="text-sm text-muted-foreground">
                      {tenantProfile?.full_name || 'Non renseigné'}
                    </p>
                    {lease.tenant_signed_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Signé le {new Date(lease.tenant_signed_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Certified Signature Status */}
            {bothSigned && (
              <div className={`mt-4 p-4 rounded-xl border-2 ${
                isCertifiedSigned 
                  ? 'border-primary bg-primary/10' 
                  : isProcessing 
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                    : 'border-dashed border-muted-foreground bg-muted/30'
              }`}>
                <div className="flex items-center space-x-3">
                  {isCertifiedSigned ? (
                    <Shield className="w-6 h-6 text-primary" />
                  ) : isProcessing ? (
                    <Loader className="w-6 h-6 text-amber-600 animate-spin" />
                  ) : (
                    <Stamp className="w-6 h-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {isCertifiedSigned 
                        ? 'Signature certifiée CryptoNeo ✓' 
                        : isProcessing 
                          ? 'Signature certifiée en cours...'
                          : 'Signature certifiée (optionnelle)'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isCertifiedSigned 
                        ? 'Ce bail a valeur légale certifiée'
                        : isProcessing
                          ? 'Traitement en cours, vous serez notifié'
                          : 'Valeur légale équivalente à une signature manuscrite'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contract Details */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6 card-animate-in card-hover-premium card-stagger-2">
            <h2 className="text-xl font-bold text-foreground mb-6">Détails du Bail</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Propriété</p>
                  <p className="font-medium text-foreground">{property.title}</p>
                  <p className="text-sm text-muted-foreground">{property.address || ''}, {property.city}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Durée du bail</p>
                  <p className="font-medium text-foreground">
                    Du {new Date(lease.start_date).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="font-medium text-foreground">
                    Au {new Date(lease.end_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Propriétaire</p>
                  <p className="font-medium text-foreground">{ownerProfile?.full_name || 'Non renseigné'}</p>
                  <p className="text-sm text-muted-foreground">{ownerProfile?.email || ''}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Locataire</p>
                  <p className="font-medium text-foreground">{tenantProfile?.full_name || 'Non renseigné'}</p>
                  <p className="text-sm text-muted-foreground">{tenantProfile?.email || ''}</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-primary/5 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Montants</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Loyer mensuel</p>
                  <p className="text-xl font-bold text-primary">
                    {lease.monthly_rent.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dépôt de garantie</p>
                  <p className="text-xl font-bold text-primary">
                    {(lease.deposit_amount || 0).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                {(lease.charges_amount ?? 0) > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Charges</p>
                    <p className="text-xl font-bold text-primary">
                      {(lease.charges_amount || 0).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Simple Signature Action */}
          {!hasUserSigned && !isCertifiedSigned && (
            <div className="bg-card rounded-2xl border border-border p-6 mb-6 card-animate-in card-hover-premium card-stagger-3">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Étape 1 : Signature simple
              </h2>
              <p className="text-muted-foreground mb-6">
                Signez pour valider les termes du contrat. Les deux parties doivent signer avant de pouvoir procéder à la signature certifiée.
              </p>

              <label className="flex items-start space-x-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 text-primary focus:ring-primary border-border rounded"
                />
                <span className="text-foreground text-sm">
                  J'ai lu et j'accepte les termes et conditions du contrat de bail. 
                  Je comprends que cette signature électronique a la même valeur juridique qu'une signature manuscrite.
                </span>
              </label>

              <button
                onClick={handleSimpleSign}
                disabled={!acceptedTerms || signing}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {signing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Signature en cours...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>Signer le bail</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Certified Signature Action */}
          {bothSigned && !isCertifiedSigned && !isProcessing && (
            <div className="bg-card rounded-2xl border-2 border-primary p-6 mb-6 card-animate-in card-hover-premium card-stagger-4">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <span>Étape 2 : Signature certifiée CryptoNeo</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Les deux parties ont signé. Vous pouvez maintenant procéder à la signature électronique certifiée 
                qui donnera à ce contrat une valeur légale équivalente à une signature manuscrite notariée.
              </p>

              <button
                onClick={handleCertifiedSign}
                disabled={certifiedSigning}
                className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 text-primary-foreground font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {certifiedSigning ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Initialisation...</span>
                  </>
                ) : (
                  <>
                    <Stamp className="w-5 h-5" />
                    <span>Signature certifiée CryptoNeo</span>
                  </>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Requiert une vérification ONECI valide
              </p>
            </div>
          )}

          {/* Already Signed */}
          {isCertifiedSigned && (
            <div className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-8 text-center card-animate-in">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-200 mb-2">
                Bail signé et certifié
              </h2>
              <p className="text-green-800 dark:text-green-300 mb-6">
                Ce contrat a été signé électroniquement et a valeur légale.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to={`/contrat/${lease.id}`}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition"
                >
                  <FileText className="w-5 h-5" />
                  <span>Voir le contrat</span>
                </Link>
                {lease.signed_document_url && (
                  <a
                    href={lease.signed_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                  >
                    <Download className="w-5 h-5" />
                    <span>Télécharger PDF signé</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Waiting for other party */}
          {hasUserSigned && !hasOtherSigned && !isCertifiedSigned && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center card-animate-in">
              <Clock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2">
                En attente de l'autre partie
              </h2>
              <p className="text-amber-800 dark:text-amber-300">
                Vous avez signé. {isOwner ? 'Le locataire' : 'Le propriétaire'} doit également signer 
                avant de pouvoir procéder à la signature certifiée.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
