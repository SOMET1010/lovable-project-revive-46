import { ChevronRight } from 'lucide-react';

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

interface PaymentContractCardProps {
  contract: Contract;
  onSelect: (contract: Contract) => void;
}

export default function PaymentContractCard({ contract, onSelect }: PaymentContractCardProps) {
  return (
    <button
      onClick={() => onSelect(contract)}
      className="w-full bg-white border-2 border-[#EFEBE9] rounded-xl p-6 hover:border-[#F16522] hover:shadow-lg transition-all duration-300 text-left group"
    >
      <div className="flex items-start space-x-4">
        <img
          src={contract.property_main_image || 'https://via.placeholder.com/100'}
          alt={contract.property_title}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#2C1810] mb-1">
            {contract.property_title}
          </h3>
          <p className="text-sm text-[#A69B95] mb-2">
            {contract.property_address}, {contract.property_city}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="font-semibold text-[#F16522]">
              Loyer: {contract.monthly_rent.toLocaleString()} FCFA
            </span>
            <span className="text-[#A69B95]">
              Propriétaire: {contract.owner_name}
            </span>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-[#A69B95] group-hover:text-[#F16522] transition-colors" />
      </div>
    </button>
  );
}
