
import { ChevronRight, MapPin, Wallet, User } from 'lucide-react';

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
  contract: Contract | null | undefined;
  onSelect: (contract: Contract) => void;
}

export default function PaymentContractCard({ contract, onSelect }: PaymentContractCardProps) {
  if (!contract) {
    console.warn("PaymentContractCard: Données 'contract' manquantes");
    return null;
  }

  const imageSrc = contract.property_main_image?.length 
    ? contract.property_main_image 
    : 'https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image';

  return (
    <button
      type="button"
      onClick={() => onSelect(contract)}
      className="w-full bg-white border border-border rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all duration-300 text-left group flex items-start gap-4"
    >
      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
        <img
          src={imageSrc}
          alt={contract.property_title || 'Propriété'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/e2e8f0/1e293b?text=Erreur';
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-foreground mb-1 truncate pr-2">
          {contract.property_title || 'Titre non disponible'}
        </h3>
        
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">
            {contract.property_address || 'Adresse inconnue'}, {contract.property_city || ''}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
            <Wallet className="w-3.5 h-3.5 mr-1.5" />
            {contract.monthly_rent?.toLocaleString() ?? 0} FCFA
          </div>
          
          <div className="flex items-center text-muted-foreground text-xs">
            <User className="w-3 h-3 mr-1" />
            <span className="truncate max-w-[100px]">{contract.owner_name || 'Propriétaire'}</span>
          </div>
        </div>
      </div>

      <div className="self-center pl-2">
        <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}
