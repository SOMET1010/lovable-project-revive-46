import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import FormPageLayout from '@/shared/components/FormPageLayout';
import { FormStepper, FormStepContent, useFormStepper } from '@/shared/ui';
import PaymentContractCard from '../components/payment/PaymentContractCard';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import PaymentConfirmationModal from '../components/payment/PaymentConfirmationModal';
import PaymentSecurityNotice from '../components/payment/PaymentSecurityNotice';
import { 
  Building, 
  Coins, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  Lock
} from 'lucide-react';

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

const STEP_LABELS = ['Sélection', 'Paiement'];

// Validation du numéro Mobile Money CI
const validateMobileMoneyNumber = (number: string): { isValid: boolean; error?: string } => {
  const cleaned = number.replace(/[\s\-+]/g, '');
  const regexShort = /^(07|01|05)\d{8}$/;
  const regexLong = /^225(07|01|05)\d{8}$/;
  
  if (!cleaned) {
    return { isValid: false, error: 'Numéro requis' };
  }
  if (!regexShort.test(cleaned) && !regexLong.test(cleaned)) {
    return { isValid: false, error: 'Format invalide. Utilisez 07/01/05 suivi de 8 chiffres' };
  }
  return { isValid: true };
};

export default function MakePayment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { step, slideDirection, nextStep, prevStep } = useFormStepper(1, 2);
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [mobileMoneyError, setMobileMoneyError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const handleMobileMoneyNumberChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, mobile_money_number: value }));
    if (value) {
      const validation = validateMobileMoneyNumber(value);
      setMobileMoneyError(validation.error || '');
    } else {
      setMobileMoneyError('');
    }
  }, []);

  const loadUserContracts = async () => {
    if (!user) return;
    
    try {
      const { data: contractsData, error: contractsError } = await supabase
        .from('lease_contracts')
        .select('id, property_id, monthly_rent, deposit_amount, owner_id')
        .eq('tenant_id', user.id)
        .eq('status', 'actif')
        .order('created_at', { ascending: false });

      if (contractsError) throw contractsError;

      interface LeaseContractBasic {
        id: string;
        property_id: string;
        monthly_rent: number;
        deposit_amount: number | null;
        owner_id: string;
      }
      
      const formattedContracts: Contract[] = (contractsData || []).map((contract: LeaseContractBasic) => ({
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
    } catch (err: unknown) {
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
    nextStep();
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
      default:
        amount = 0;
    }

    setFormData({
      ...formData,
      payment_type: type,
      amount,
    });
  };

  const isFormValid = useCallback(() => {
    if (formData.payment_method === 'mobile_money') {
      const validation = validateMobileMoneyNumber(formData.mobile_money_number || '');
      return validation.isValid && formData.amount > 0;
    }
    return formData.amount > 0;
  }, [formData]);

  const handlePreConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      if (formData.payment_method === 'mobile_money') {
        const validation = validateMobileMoneyNumber(formData.mobile_money_number || '');
        setMobileMoneyError(validation.error || '');
      }
      return;
    }
    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
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
        navigate('/mes-paiements');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error processing payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du traitement du paiement';
      setError(errorMessage);
      setShowConfirmation(false);
    } finally {
      setSubmitting(false);
    }
  };

  // État non connecté
  if (!user) {
    return (
      <FormPageLayout title="Effectuer un paiement" showBackButton={false}>
        <div className="flex flex-col items-center justify-center py-12">
          <Coins className="w-16 h-16 text-[#A69B95] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2C1810] mb-2">
            Connexion requise
          </h2>
          <p className="text-[#A69B95]">
            Veuillez vous connecter pour effectuer un paiement
          </p>
        </div>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout 
      title="Effectuer un paiement" 
      subtitle="Payez votre loyer et vos charges en toute sécurité"
      icon={Coins}
      showBackButton={step === 1}
    >
      {/* Stepper */}
      <FormStepper
        currentStep={step}
        totalSteps={2}
        onStepChange={() => {}}
        labels={STEP_LABELS}
        allowClickNavigation={false}
      />

      {success ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C1810] mb-2">Paiement en cours</h2>
          <p className="text-[#A69B95] mb-4">
            Votre paiement est en cours de traitement. Vous recevrez une confirmation par email.
          </p>
          <p className="text-sm text-[#A69B95]">Redirection vers l'historique des paiements...</p>
        </div>
      ) : (
        <>
          {/* Étape 1: Sélection du contrat */}
          <FormStepContent step={1} currentStep={step} slideDirection={slideDirection}>
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#2C1810]">Sélectionnez une propriété</h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F16522] mx-auto"></div>
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="w-16 h-16 text-[#A69B95] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2C1810] mb-2">
                    Aucun contrat actif
                  </h3>
                  <p className="text-[#A69B95]">
                    Vous n'avez pas de contrat de location actif pour effectuer un paiement
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <PaymentContractCard
                      key={contract.id}
                      contract={contract}
                      onSelect={handleContractSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </FormStepContent>

          {/* Étape 2: Détails du paiement */}
          <FormStepContent step={2} currentStep={step} slideDirection={slideDirection}>
            {/* Modal de confirmation */}
            <PaymentConfirmationModal
              isOpen={showConfirmation}
              onClose={() => setShowConfirmation(false)}
              onConfirm={handleSubmit}
              formData={formData}
              selectedContract={selectedContract}
              submitting={submitting}
            />

            <form onSubmit={handlePreConfirm} className="space-y-6">
              <h2 className="text-lg font-semibold text-[#2C1810]">Détails du paiement</h2>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Propriété sélectionnée */}
              {selectedContract && (
                <div className="p-4 bg-[#F16522]/5 border border-[#F16522]/20 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <img
                      src={selectedContract.property_main_image || 'https://via.placeholder.com/80'}
                      alt={selectedContract.property_title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-[#2C1810]">{selectedContract.property_title}</h3>
                      <p className="text-sm text-[#A69B95]">{selectedContract.property_address}</p>
                      <p className="text-sm text-[#A69B95]">À: {selectedContract.owner_name}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Type de paiement */}
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-2">
                    Type de paiement <span className="text-[#F16522]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'loyer', label: 'Loyer mensuel', amount: selectedContract?.monthly_rent || 0 },
                      { value: 'depot_garantie', label: 'Dépôt de garantie', amount: selectedContract?.deposit_amount || 0 },
                      { value: 'charges', label: 'Charges', amount: 0 },
                      { value: 'frais_agence', label: "Frais d'agence", amount: 0 },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handlePaymentTypeChange(type.value as PaymentFormData['payment_type'])}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          formData.payment_type === type.value
                            ? 'border-[#F16522] bg-[#F16522]/10'
                            : 'border-[#EFEBE9] hover:border-[#F16522]/50'
                        }`}
                      >
                        <p className={`font-semibold ${formData.payment_type === type.value ? 'text-[#F16522]' : 'text-[#2C1810]'}`}>
                          {type.label}
                        </p>
                        {type.amount > 0 && (
                          <p className="text-sm text-[#F16522] font-bold mt-1">
                            {type.amount.toLocaleString()} FCFA
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-[#2C1810] mb-2">
                    Montant <span className="text-[#F16522]">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl bg-white text-[#2C1810] font-bold text-lg focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] transition-colors"
                    required
                  />
                </div>

                {/* Méthode de paiement */}
                <PaymentMethodSelector
                  paymentMethod={formData.payment_method}
                  onMethodChange={(method) => setFormData({ ...formData, payment_method: method })}
                  mobileMoneyProvider={formData.mobile_money_provider}
                  mobileMoneyNumber={formData.mobile_money_number}
                  onProviderChange={(provider) => setFormData({ ...formData, mobile_money_provider: provider })}
                  onNumberChange={handleMobileMoneyNumberChange}
                  mobileMoneyError={mobileMoneyError}
                />

                {/* Notice sécurité */}
                <PaymentSecurityNotice />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-[#EFEBE9]">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-6 py-3 border-2 border-[#EFEBE9] rounded-xl font-semibold text-[#2C1810] hover:bg-[#FAF7F4] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Précédent</span>
                </button>
                
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#F16522] text-white rounded-xl font-semibold hover:bg-[#D55A1B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Confirmer le paiement</span>
                  <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </form>
          </FormStepContent>
        </>
      )}
    </FormPageLayout>
  );
}
