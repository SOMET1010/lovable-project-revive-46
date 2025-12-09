import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { downloadContract, regenerateContract } from '@/services/contracts/contractService';
import Header from '@/app/layout/Header';
import Footer from '@/app/layout/Footer';
import { ArrowLeft, FileText, Edit, CheckCircle, X, Download, RefreshCw, Loader, ExternalLink } from 'lucide-react';
import { AddressValue, formatAddress } from '@/shared/utils/address';

interface LeaseContract {
  id: string;
  contract_number: string;
  property_id: string;
  owner_id: string;
  tenant_id: string;
  status: string | null;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number | null;
  charges_amount: number | null;
  signed_at: string | null;
  created_at: string | null;
  document_url: string | null;
  signed_document_url: string | null;
}

interface Property {
  title: string;
  address: AddressValue;
  city: string;
  property_type: string;
  surface_area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

export default function ContractDetail() {
  const { user } = useAuth();
  const [contract, setContract] = useState<LeaseContract | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [signing, setSigning] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const contractId = window.location.pathname.split('/')[2];

  useEffect(() => {
    if (user && contractId) {
      loadContract();
    }
  }, [user, contractId]);

  const loadContract = async () => {
    if (!contractId) return;
    
    try {
      const { data, error } = await supabase
        .from('lease_contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;
      
      const contractData = data as unknown as LeaseContract;

      if (!contractData || (contractData.owner_id !== user?.id && contractData.tenant_id !== user?.id)) {
        alert('Vous n\'avez pas accès à ce contrat');
        window.location.href = '/mes-contrats';
        return;
      }

      setContract(contractData);

      // Load property
      const { data: propData } = await supabase
        .from('properties')
        .select('title, address, city, property_type, surface_area, bedrooms, bathrooms')
        .eq('id', contractData.property_id)
        .single();
      
      if (propData) setProperty(propData);

      // Load owner profile
      const { data: ownerData } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', contractData.owner_id)
        .single();
      
      if (ownerData) setOwner(ownerData);

      // Load tenant profile
      const { data: tenantData } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', contractData.tenant_id)
        .single();
      
      if (tenantData) setTenant(tenantData);

    } catch (error) {
      console.error('Error loading contract:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContractContent = () => {
    if (!contract || !property || !owner || !tenant) return '';

    return `
CONTRAT DE BAIL

N° ${contract.contract_number}

Entre les soussignés :

LE BAILLEUR
${owner.full_name}
Email : ${owner.email}
Téléphone : ${owner.phone}

LE LOCATAIRE
${tenant.full_name}
Email : ${tenant.email}
Téléphone : ${tenant.phone}

OBJET DU CONTRAT

Le bailleur loue au locataire le bien suivant :

      Adresse : ${formatAddress(property.address, property.city)}
Type : ${property.property_type}
Superficie : ${property.surface_area}m²
Chambres : ${property.bedrooms}
Salles de bain : ${property.bathrooms}

DURÉE DU BAIL

Date de début : ${new Date(contract.start_date).toLocaleDateString('fr-FR')}
Date de fin : ${new Date(contract.end_date).toLocaleDateString('fr-FR')}

CONDITIONS FINANCIÈRES

- Loyer mensuel : ${contract.monthly_rent.toLocaleString()} FCFA
- Dépôt de garantie : ${(contract.deposit_amount || 0).toLocaleString()} FCFA

Fait à ${property.city}, le ${new Date(contract.created_at || '').toLocaleDateString('fr-FR')}
    `.trim();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? (e.touches[0]?.clientX ?? 0) - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? (e.touches[0]?.clientY ?? 0) - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? (e.touches[0]?.clientX ?? 0) - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? (e.touches[0]?.clientY ?? 0) - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const signContract = async () => {
    if (!contract) return;

    setSigning(true);
    try {
      const { error } = await supabase
        .from('lease_contracts' as any)
        .update({ 
          signed_at: new Date().toISOString(),
          status: 'actif'
        } as any)
        .eq('id', contract.id);

      if (error) throw error;

      alert('Contrat signé avec succès !');
      loadContract();
      setShowSignature(false);
    } catch (error) {
      console.error('Error signing contract:', error);
      alert('Erreur lors de la signature du contrat');
    } finally {
      setSigning(false);
    }
  };

  const canSign = () => {
    if (!contract) return false;
    return !contract.signed_at && (contract.owner_id === user?.id || contract.tenant_id === user?.id);
  };

  const handleDownloadPdf = async () => {
    if (!contract?.document_url) return;
    setDownloading(true);
    try {
      await downloadContract(contract.document_url, `contrat-${contract.contract_number}.pdf`);
    } catch (err) {
      console.error('Error downloading:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleRegeneratePdf = async () => {
    if (!contract) return;
    setRegenerating(true);
    try {
      await regenerateContract(contract.id);
      loadContract();
    } catch (err) {
      console.error('Error regenerating:', err);
    } finally {
      setRegenerating(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Veuillez vous connecter</p>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!contract) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Contrat non trouvé</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-orange-500" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Contrat {contract.contract_number}
                  </h1>
                  <p className="text-gray-600">{property?.title}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {contract.document_url && (
                  <>
                    <button
                      onClick={handleDownloadPdf}
                      disabled={downloading}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center space-x-2 disabled:opacity-50"
                    >
                      {downloading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      <span>PDF</span>
                    </button>
                    <a
                      href={contract.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Voir</span>
                    </a>
                  </>
                )}
                {contract.owner_id === user?.id && (
                  <button
                    onClick={handleRegeneratePdf}
                    disabled={regenerating}
                    className="px-3 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition flex items-center space-x-2 disabled:opacity-50"
                  >
                    {regenerating ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>Regénérer</span>
                  </button>
                )}
                {canSign() && (
                  <button
                    onClick={() => setShowSignature(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Signer</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {contract.signed_at ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">
                      Signé le {new Date(contract.signed_at).toLocaleDateString('fr-FR')}
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-red-600" />
                    <span className="text-sm text-gray-700">Non signé</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  contract.status === 'actif' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {contract.status === 'actif' ? 'Actif' : contract.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
              {generateContractContent()}
            </pre>
          </div>
        </div>
      </div>

      {showSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Signer le contrat</h3>
              <button
                onClick={() => setShowSignature(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Dessinez votre signature dans le cadre ci-dessous
            </p>

            <div className="border-2 border-gray-300 rounded-lg mb-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ touchAction: 'none' }}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={clearSignature}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Effacer
              </button>
              <button
                onClick={signContract}
                disabled={signing}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {signing ? 'Signature...' : 'Confirmer la signature'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
