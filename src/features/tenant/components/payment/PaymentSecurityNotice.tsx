import { ShieldCheck } from 'lucide-react';

export default function PaymentSecurityNotice() {
  return (
    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
      <div className="p-2 bg-green-100 rounded-full">
        <ShieldCheck className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="font-medium text-green-800">Paiement sécurisé via Mon Toit</p>
        <p className="text-sm text-[#6B5A4E]">
          Vos informations de paiement sont protégées par un chiffrement de bout en bout.
        </p>
      </div>
    </div>
  );
}
