import { ShieldCheck, Lock } from 'lucide-react';

interface PaymentFormData {
  amount: number;
  payment_type: 'loyer' | 'depot_garantie' | 'charges' | 'frais_agence';
  payment_method: 'mobile_money' | 'carte_bancaire' | 'virement' | 'especes';
  mobile_money_number?: string;
}

interface Contract {
  property_title: string;
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: PaymentFormData;
  selectedContract: Contract | null;
  submitting: boolean;
}

const PAYMENT_TYPE_LABELS: Record<PaymentFormData['payment_type'], string> = {
  loyer: 'Loyer mensuel',
  depot_garantie: 'Dépôt de garantie',
  charges: 'Charges',
  frais_agence: "Frais d'agence",
};

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  formData,
  selectedContract,
  submitting,
}: PaymentConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <ShieldCheck className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-[#2C1810]">Confirmer le paiement</h3>
        </div>

        {/* Récapitulatif */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">Récapitulatif sécurisé</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B5A4E]">Montant</span>
              <span className="font-bold text-[#2C1810]">{formData.amount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5A4E]">Type</span>
              <span className="text-[#2C1810]">{PAYMENT_TYPE_LABELS[formData.payment_type]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5A4E]">Méthode</span>
              <span className="text-[#2C1810]">
                {formData.payment_method === 'mobile_money' ? 'Mobile Money' : 'Carte bancaire'}
              </span>
            </div>
            {formData.payment_method === 'mobile_money' && formData.mobile_money_number && (
              <div className="flex justify-between">
                <span className="text-[#6B5A4E]">Numéro</span>
                <span className="text-[#2C1810]">{formData.mobile_money_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#6B5A4E]">Propriété</span>
              <span className="text-[#2C1810]">{selectedContract?.property_title}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 px-4 border-2 border-[#EFEBE9] rounded-xl font-semibold text-[#2C1810] hover:bg-[#FAF7F4] transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 py-3 px-4 bg-[#F16522] text-white rounded-xl font-semibold hover:bg-[#D55A1B] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Confirmer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
