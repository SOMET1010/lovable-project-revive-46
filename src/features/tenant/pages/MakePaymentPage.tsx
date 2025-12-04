import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/services/supabase/client';
import Header from '@/app/layout/Header';
import Footer from '@/app/layout/Footer';
import { CreditCard, Smartphone, Building, Coins, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface PaymentFormData {
  property_id: string;
  receiver_id: string;
  amount: number;
  payment_type: 'loyer' | 'depot_garantie' | 'charges' | 'frais_agence';
  payment_method: 'mobile_money' | 'carte_bancaire' | 'virement' | 'especes';
  mobile_money_provider?: 'orange_money' | 'mtn_money' | 'moov_money' | 'wave';
  mobile_money_number?: string;
}

interface Contract {
  id: string;
  property_id: string;
  monthly_rent: number;
  deposit_amount: number | null;
  owner_id: string;
  property_title: string;
  property_address: string | null;
  property_city: string;
  property_main_image: string | null;
  owner_name: string;
}

export default function MakePayment() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    property_id: '',
    receiver_id: '',
    amount: 0,
    payment_type: 'loyer',
    payment_method: 'mobile_money',
    mobile_money_provider: 'orange_money',
    mobile_money_number: '',
  });

  useEffect(() => {
    if (user) {
      loadUserContracts();
    }
  }, [user]);

  const loadUserContracts = async () => {
    if (!user) return;
    
    try {
      // Load contracts first
      const { data: contractsData, error: contractsError } = await supabase
        .from('lease_contracts')
        .select('id, property_id, monthly_rent, deposit_amount, owner_id')
        .eq('tenant_id', user.id)
        .eq('status', 'actif')
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      // Format contracts with placeholder data
      const formattedContracts: Contract[] = (contractsData || []).map((contract: any) => ({
        id: contract.id,
        property_id: contract.property_id,
        monthly_rent: contract.monthly_rent,
        deposit_amount: contract.deposit_amount,
        owner_id: contract.owner_id,
        property_title: 'Propriété',
        property_address: null,
        property_city: '',
        property_main_image: null,
        owner_name: 'Propriétaire'
      }));

      // Load property details for each contract
      for (const contract of formattedContracts) {
        const { data: propertyData } = await supabase
          .from('properties')
          .select('title, address, city, main_image')
          .eq('id', contract.property_id)
          .single();
        
        if (propertyData) {
          contract.property_title = propertyData.title;
          contract.property_address = propertyData.address;
          contract.property_city = propertyData.city;
          contract.property_main_image = propertyData.main_image;
        }
      }

      setContracts(formattedContracts);
    } catch (err: any) {
      console.error('Error loading contracts:', err);
      setError('Erreur lors du chargement des contrats');
    } finally {
      setLoading(false);
    }
  };

  const handleContractSelect = (contract: Contract) => {
    setSelectedContract(contract);
    setFormData({
      ...formData,
      property_id: contract.property_id,
      receiver_id: contract.owner_id,
      amount: contract.monthly_rent,
    });
  };

  const handlePaymentTypeChange = (type: PaymentFormData['payment_type']) => {
    if (!selectedContract) return;

    let amount = 0;
    switch (type) {
      case 'loyer':
        amount = selectedContract.monthly_rent;
        break;
      case 'depot_garantie':
        amount = selectedContract.deposit_amount || 0;
        break;
      case 'charges':
        amount = 0;
        break;
      default:
        amount = 0;
    }

    setFormData({
      ...formData,
      payment_type: type,
      amount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedContract) return;

    setSubmitting(true);
    setError('');

    try {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          payer_id: user.id,
          receiver_id: formData.receiver_id || null,
          property_id: formData.property_id || null,
          contract_id: selectedContract.id,
          amount: formData.amount,
          payment_type: formData.payment_type,
          payment_method: formData.payment_method,
          status: 'en_attente',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      if (formData.payment_method === 'mobile_money' && formData.mobile_money_provider && formData.mobile_money_number) {
        await supabase
          .from('payments')
          .update({
            status: 'en_cours',
            transaction_ref: `MM_${payment.id.substring(0, 8)}`
          })
          .eq('id', payment.id);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/mes-paiements';
      }, 2000);
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Erreur lors du traitement du paiement');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Coins className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connexion requise
            </h2>
            <p className="text-gray-600">
              Veuillez vous connecter pour effectuer un paiement
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-coral-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-terracotta-600 hover:text-terracotta-700 mb-6 transition-all duration-300 transform hover:scale-105 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-2">Effectuer un paiement</h1>
            <p className="text-gray-600 text-lg">Payez votre loyer et vos charges en toute sécurité</p>
          </div>

          {success ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement en cours</h2>
              <p className="text-gray-600 mb-4">
                Votre paiement est en cours de traitement. Vous recevrez une confirmation par email.
              </p>
              <p className="text-sm text-gray-500">Redirection vers l'historique des paiements...</p>
            </div>
          ) : (
            <>
              {!selectedContract ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Sélectionnez une propriété</h2>

                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta-500 mx-auto"></div>
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="text-center py-12">
                      <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aucun contrat actif
                      </h3>
                      <p className="text-gray-600">
                        Vous n'avez pas de contrat de location actif pour effectuer un paiement
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contracts.map((contract) => (
                        <button
                          key={contract.id}
                          onClick={() => handleContractSelect(contract)}
                          className="w-full bg-gradient-to-br from-white to-amber-50 border-2 border-terracotta-200 rounded-xl p-6 hover:border-terracotta-400 hover:shadow-lg transition-all duration-300 text-left"
                        >
                          <div className="flex items-start space-x-4">
                            <img
                              src={contract.property_main_image || 'https://via.placeholder.com/100'}
                              alt={contract.property_title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {contract.property_title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {contract.property_address}, {contract.property_city}
                              </p>
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="font-semibold text-terracotta-600">
                                  Loyer: {contract.monthly_rent.toLocaleString()} FCFA
                                </span>
                                <span className="text-gray-500">
                                  Propriétaire: {contract.owner_name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails du paiement</h2>

                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <img
                          src={selectedContract.property_main_image || 'https://via.placeholder.com/80'}
                          alt={selectedContract.property_title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900">{selectedContract.property_title}</h3>
                          <p className="text-sm text-gray-600">{selectedContract.property_address}</p>
                          <p className="text-sm text-gray-500">À: {selectedContract.owner_name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Type de paiement
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { value: 'loyer', label: 'Loyer mensuel', amount: selectedContract.monthly_rent },
                            { value: 'depot_garantie', label: 'Dépôt de garantie', amount: selectedContract.deposit_amount || 0 },
                            { value: 'charges', label: 'Charges', amount: 0 },
                            { value: 'frais_agence', label: 'Frais d\'agence', amount: 0 },
                          ].map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => handlePaymentTypeChange(type.value as any)}
                              className={`p-4 border-2 rounded-xl text-left transition-all ${
                                formData.payment_type === type.value
                                  ? 'border-terracotta-500 bg-terracotta-50'
                                  : 'border-gray-200 hover:border-terracotta-300'
                              }`}
                            >
                              <p className="font-semibold text-gray-900">{type.label}</p>
                              {type.amount > 0 && (
                                <p className="text-sm text-terracotta-600 font-bold mt-1">
                                  {type.amount.toLocaleString()} FCFA
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Montant
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-terracotta-200 focus:border-terracotta-500 font-bold text-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Méthode de paiement
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, payment_method: 'mobile_money' })}
                            className={`p-4 border-2 rounded-xl flex items-center space-x-3 transition-all ${
                              formData.payment_method === 'mobile_money'
                                ? 'border-terracotta-500 bg-terracotta-50'
                                : 'border-gray-200 hover:border-terracotta-300'
                            }`}
                          >
                            <Smartphone className="w-6 h-6 text-terracotta-600" />
                            <span className="font-semibold text-gray-900">Mobile Money</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, payment_method: 'carte_bancaire' })}
                            className={`p-4 border-2 rounded-xl flex items-center space-x-3 transition-all ${
                              formData.payment_method === 'carte_bancaire'
                                ? 'border-terracotta-500 bg-terracotta-50'
                                : 'border-gray-200 hover:border-terracotta-300'
                            }`}
                          >
                            <CreditCard className="w-6 h-6 text-terracotta-600" />
                            <span className="font-semibold text-gray-900">Carte bancaire</span>
                          </button>
                        </div>
                      </div>

                      {formData.payment_method === 'mobile_money' && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Opérateur Mobile Money
                            </label>
                            <select
                              value={formData.mobile_money_provider}
                              onChange={(e) => setFormData({ ...formData, mobile_money_provider: e.target.value as any })}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-terracotta-200 focus:border-terracotta-500"
                              required
                            >
                              <option value="orange_money">🟠 Orange Money</option>
                              <option value="mtn_money">🟡 MTN Money</option>
                              <option value="moov_money">🔵 Moov Money</option>
                              <option value="wave">🌊 Wave</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Numéro de téléphone
                            </label>
                            <input
                              type="tel"
                              value={formData.mobile_money_number}
                              onChange={(e) => setFormData({ ...formData, mobile_money_number: e.target.value })}
                              placeholder="Ex: 07 XX XX XX XX"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-terracotta-200 focus:border-terracotta-500"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setSelectedContract(null)}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
                      >
                        Changer de propriété
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || formData.amount <= 0}
                        className="flex-1 px-6 py-3 bg-terracotta-500 text-white rounded-xl hover:bg-terracotta-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Coins className="w-5 h-5" />
                        <span>{submitting ? 'Traitement...' : `Payer ${formData.amount.toLocaleString()} FCFA`}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
