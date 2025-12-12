import { Smartphone, CreditCard, AlertCircle } from 'lucide-react';

type PaymentMethod = 'mobile_money' | 'carte_bancaire' | 'virement' | 'especes';
type MobileMoneyProvider = 'orange_money' | 'mtn_money' | 'moov_money' | 'wave';

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  mobileMoneyProvider?: MobileMoneyProvider;
  mobileMoneyNumber?: string;
  onProviderChange: (provider: MobileMoneyProvider) => void;
  onNumberChange: (value: string) => void;
  mobileMoneyError?: string;
}

export default function PaymentMethodSelector({
  paymentMethod,
  onMethodChange,
  mobileMoneyProvider,
  mobileMoneyNumber,
  onProviderChange,
  onNumberChange,
  mobileMoneyError,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Méthode de paiement */}
      <div>
        <label className="block text-sm font-medium text-[#2C1810] mb-2">
          Méthode de paiement <span className="text-[#F16522]">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onMethodChange('mobile_money')}
            className={`p-4 border-2 rounded-xl flex items-center space-x-3 transition-all ${
              paymentMethod === 'mobile_money'
                ? 'border-[#F16522] bg-[#F16522]/10'
                : 'border-[#EFEBE9] hover:border-[#F16522]/50'
            }`}
          >
            <Smartphone className={`w-6 h-6 ${paymentMethod === 'mobile_money' ? 'text-[#F16522]' : 'text-[#A69B95]'}`} />
            <span className={`font-semibold ${paymentMethod === 'mobile_money' ? 'text-[#F16522]' : 'text-[#2C1810]'}`}>
              Mobile Money
            </span>
          </button>
          <button
            type="button"
            onClick={() => onMethodChange('carte_bancaire')}
            className={`p-4 border-2 rounded-xl flex items-center space-x-3 transition-all ${
              paymentMethod === 'carte_bancaire'
                ? 'border-[#F16522] bg-[#F16522]/10'
                : 'border-[#EFEBE9] hover:border-[#F16522]/50'
            }`}
          >
            <CreditCard className={`w-6 h-6 ${paymentMethod === 'carte_bancaire' ? 'text-[#F16522]' : 'text-[#A69B95]'}`} />
            <span className={`font-semibold ${paymentMethod === 'carte_bancaire' ? 'text-[#F16522]' : 'text-[#2C1810]'}`}>
              Carte bancaire
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Money Options */}
      {paymentMethod === 'mobile_money' && (
        <div className="space-y-4 p-4 bg-[#FAF7F4] rounded-xl border border-[#EFEBE9]">
          <div>
            <label className="block text-sm font-medium text-[#2C1810] mb-2">
              Opérateur Mobile Money <span className="text-[#F16522]">*</span>
            </label>
            <select
              value={mobileMoneyProvider}
              onChange={(e) => onProviderChange(e.target.value as MobileMoneyProvider)}
              className="w-full px-4 py-3 border border-[#EFEBE9] rounded-xl bg-white text-[#2C1810] focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] transition-colors"
              required
            >
              <option value="orange_money">🟠 Orange Money</option>
              <option value="mtn_money">🟡 MTN Money</option>
              <option value="moov_money">🔵 Moov Money</option>
              <option value="wave">🌊 Wave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C1810] mb-2">
              Numéro Mobile Money <span className="text-[#F16522]">*</span>
            </label>
            <input
              type="tel"
              value={mobileMoneyNumber || ''}
              onChange={(e) => onNumberChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-[#2C1810] focus:ring-2 focus:ring-[#F16522]/20 focus:border-[#F16522] transition-colors ${
                mobileMoneyError ? 'border-red-400' : 'border-[#EFEBE9]'
              }`}
              placeholder="07 XX XX XX XX"
              required
            />
            {mobileMoneyError && (
              <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                <AlertCircle className="w-3 h-3" />
                {mobileMoneyError}
              </p>
            )}
            <p className="text-xs text-[#A69B95] mt-1">
              Format accepté: 07, 01 ou 05 suivi de 8 chiffres
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
