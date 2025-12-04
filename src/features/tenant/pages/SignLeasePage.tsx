import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import Header from '@/app/layout/Header';
import Footer from '@/app/layout/Footer';
import { FileText, Shield, CheckCircle, AlertCircle, Lock, Loader, Download } from 'lucide-react';

interface LeaseContract {
  id: string;
  contract_number: string;
  property_id: string;
  owner_id: string;
  tenant_id: string;
  monthly_rent: number;
  deposit_amount: number | null;
  start_date: string;
  end_date: string;
  status: string | null;
  signed_at: string | null;
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
}

export default function SignLease() {
  const { user, profile } = useAuth();
  const [lease, setLease] = useState<LeaseContract | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null);
  const [tenantProfile, setTenantProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const leaseId = window.location.pathname.split('/').pop();

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
          .select('full_name, email, phone, is_verified')
          .eq('user_id', leaseData.owner_id)
          .single(),
        supabase
          .from('profiles')
          .select('full_name, email, phone, is_verified')
          .eq('user_id', leaseData.tenant_id)
          .single()
      ]);

      if (propertyRes.data) setProperty(propertyRes.data as Property);
      if (ownerRes.data) setOwnerProfile(ownerRes.data as UserProfile);
      if (tenantRes.data) setTenantProfile(tenantRes.data as UserProfile);

    } catch (err: any) {
      console.error('Error loading lease:', err);
      setError(err.message || 'Erreur lors du chargement du bail');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!user || !lease || !acceptedTerms) return;

    setSigning(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('lease_contracts')
        .update({
          status: 'actif',
          signed_at: new Date().toISOString()
        })
        .eq('id', lease.id);

      if (updateError) throw updateError;

      setSuccess('✅ Bail signé avec succès!');

      setTimeout(() => {
        window.location.href = `/contrat/${leaseId}`;
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la signature');
    } finally {
      setSigning(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connexion requise
            </h2>
            <p className="text-gray-600">
              Veuillez vous connecter pour signer le bail
            </p>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader className="w-12 h-12 text-terracotta-500 animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (!lease || !property) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bail introuvable
            </h2>
            <p className="text-gray-600">{error || 'Le bail demandé n\'existe pas'}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // const isOwner = lease.owner_id === user.id;
  const hasSigned = lease.signed_at !== null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-coral-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-10 h-10 text-terracotta-600" />
              <h1 className="text-4xl font-bold text-gradient">Signature du Bail</h1>
            </div>
            <p className="text-gray-600 text-lg">
              Contrat #{lease.contract_number}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3 mb-6">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {!profile?.is_verified && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-4">
                <Shield className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-900 mb-2">Vérification recommandée</h3>
                  <p className="text-amber-800 mb-4">
                    La vérification de votre profil renforce la confiance entre les parties.
                  </p>
                  <a
                    href="/verification"
                    className="btn-secondary inline-block"
                  >
                    Vérifier mon profil
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails du Bail</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-bold text-gray-700 mb-2">Propriété</h3>
                <p className="text-gray-900">{property.title}</p>
                <p className="text-sm text-gray-600">{property.address || ''}, {property.city}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 mb-2">Durée du bail</h3>
                <p className="text-gray-900">
                  Du {new Date(lease.start_date).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-gray-900">
                  Au {new Date(lease.end_date).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 mb-2">Propriétaire</h3>
                <p className="text-gray-900">{ownerProfile?.full_name || 'Non renseigné'}</p>
                <p className="text-sm text-gray-600">{ownerProfile?.email || ''}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-700 mb-2">Locataire</h3>
                <p className="text-gray-900">{tenantProfile?.full_name || 'Non renseigné'}</p>
                <p className="text-sm text-gray-600">{tenantProfile?.email || ''}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-terracotta-50 to-coral-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">Montants</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Loyer mensuel</p>
                  <p className="text-xl font-bold text-terracotta-700">
                    {lease.monthly_rent.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Dépôt de garantie</p>
                  <p className="text-xl font-bold text-terracotta-700">
                    {(lease.deposit_amount || 0).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Statut</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">Contrat</span>
                {hasSigned ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">Signé le {new Date(lease.signed_at!).toLocaleDateString('fr-FR')}</span>
                  </div>
                ) : (
                  <span className="text-amber-600 font-bold">En attente de signature</span>
                )}
              </div>
            </div>
          </div>

          {!hasSigned && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Signer le bail</h2>

              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-5 w-5 text-terracotta-600 focus:ring-terracotta-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">
                    J'ai lu et j'accepte les termes et conditions du contrat de bail. 
                    Je comprends que cette signature électronique a la même valeur juridique qu'une signature manuscrite.
                  </span>
                </label>
              </div>

              <button
                onClick={handleSign}
                disabled={!acceptedTerms || signing}
                className="w-full py-4 bg-terracotta-500 text-white font-bold rounded-xl hover:bg-terracotta-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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

              <p className="text-center text-sm text-gray-500 mt-4">
                En signant, vous acceptez les conditions générales de Mon Toit
              </p>
            </div>
          )}

          {hasSigned && (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">Bail signé</h2>
              <p className="text-green-800 mb-4">
                Ce contrat a été signé le {new Date(lease.signed_at!).toLocaleDateString('fr-FR')}
              </p>
              <a
                href={`/contrat/${lease.id}`}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Voir le contrat</span>
              </a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
