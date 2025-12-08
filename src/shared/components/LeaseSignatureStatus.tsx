/**
 * LeaseSignatureStatus - Real-time signature status display for lease contracts
 * Displays CryptoNeo electronic signature status with timeline visualization
 */

import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircle2, 
  Clock, 
  Shield, 
  XCircle, 
  User, 
  Home,
  FileCheck,
  Loader2
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLeaseSignatureRealtime, LeaseSignatureData } from '@/shared/hooks/useLeaseSignatureRealtime';

export interface LeaseSignatureStatusProps {
  // Signature data
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  landlordCryptoneoSignedAt?: string | null;
  tenantCryptoneoSignedAt?: string | null;
  cryptoneoStatus?: string | null;
  isElectroniclySigned?: boolean;
  signedDocumentUrl?: string | null;
  cryptoneoSignedDocumentUrl?: string | null;
  
  // Display options
  compact?: boolean;
  showCryptoneo?: boolean;
  showDates?: boolean;
  
  // User context
  isOwner?: boolean;
  
  // Party names
  landlordName?: string;
  tenantName?: string;
  
  // Real-time (optional)
  leaseId?: string;
  
  className?: string;
}

type SignatureState = 
  | 'pending'
  | 'landlord_signed'
  | 'tenant_signed'
  | 'completed'
  | 'certified'
  | 'failed'
  | 'expired'
  | 'processing';

interface StatusConfig {
  label: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const STATUS_CONFIG: Record<SignatureState, StatusConfig> = {
  pending: {
    label: 'En attente',
    description: 'En attente de signature',
    icon: Clock,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
  landlord_signed: {
    label: 'Propriétaire signé',
    description: 'En attente de la signature du locataire',
    icon: User,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  tenant_signed: {
    label: 'Locataire signé',
    description: 'En attente de la signature du propriétaire',
    icon: Home,
    colorClass: 'text-violet-600',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-200',
  },
  completed: {
    label: 'Signé',
    description: 'Contrat signé par les deux parties',
    icon: CheckCircle2,
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
  },
  certified: {
    label: 'Certifié CryptoNeo',
    description: 'Signature électronique certifiée',
    icon: Shield,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30',
  },
  processing: {
    label: 'En cours',
    description: 'Signature en cours de traitement',
    icon: Loader2,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  failed: {
    label: 'Échec',
    description: 'La signature a échoué',
    icon: XCircle,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
  },
  expired: {
    label: 'Expiré',
    description: 'Le délai de signature a expiré',
    icon: XCircle,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
};

function formatSignatureDate(dateString: string | null): string {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), "d MMM yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return '';
  }
}

export function LeaseSignatureStatus({
  landlordSignedAt,
  tenantSignedAt,
  landlordCryptoneoSignedAt,
  tenantCryptoneoSignedAt,
  cryptoneoStatus,
  isElectroniclySigned,
  signedDocumentUrl,
  cryptoneoSignedDocumentUrl,
  compact = false,
  showCryptoneo = false,
  showDates = true,
  isOwner,
  landlordName = 'Propriétaire',
  tenantName = 'Locataire',
  leaseId,
  className,
}: LeaseSignatureStatusProps) {
  // Real-time updates if leaseId is provided
  const initialData: LeaseSignatureData = {
    landlord_signed_at: landlordSignedAt,
    tenant_signed_at: tenantSignedAt,
    landlord_cryptoneo_signature_at: landlordCryptoneoSignedAt ?? null,
    tenant_cryptoneo_signature_at: tenantCryptoneoSignedAt ?? null,
    cryptoneo_signature_status: cryptoneoStatus ?? null,
    is_electronically_signed: isElectroniclySigned ?? false,
    cryptoneo_signed_document_url: cryptoneoSignedDocumentUrl ?? null,
    signed_document_url: signedDocumentUrl ?? null,
  };

  const realtimeData = useLeaseSignatureRealtime(leaseId, initialData);

  // Use realtime data if available
  const data = leaseId ? realtimeData : initialData;

  // Compute signature state
  const signatureState = useMemo((): SignatureState => {
    // Check for CryptoNeo certification
    if (data.cryptoneo_signature_status === 'completed' || data.cryptoneo_signature_status === 'certified') {
      return 'certified';
    }
    if (data.cryptoneo_signature_status === 'failed') {
      return 'failed';
    }
    if (data.cryptoneo_signature_status === 'expired') {
      return 'expired';
    }
    if (data.cryptoneo_signature_status === 'processing' || data.cryptoneo_signature_status === 'pending') {
      if (data.landlord_cryptoneo_signature_at && data.tenant_cryptoneo_signature_at) {
        return 'processing';
      }
    }

    // Check standard signatures
    const hasLandlordSigned = !!data.landlord_signed_at || !!data.landlord_cryptoneo_signature_at;
    const hasTenantSigned = !!data.tenant_signed_at || !!data.tenant_cryptoneo_signature_at;

    if (hasLandlordSigned && hasTenantSigned) {
      return 'completed';
    }
    if (hasLandlordSigned && !hasTenantSigned) {
      return 'landlord_signed';
    }
    if (!hasLandlordSigned && hasTenantSigned) {
      return 'tenant_signed';
    }

    return 'pending';
  }, [data]);

  const config = STATUS_CONFIG[signatureState];
  const StatusIcon = config.icon;

  // Compact mode - simple badge
  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          config.bgClass,
          config.colorClass,
          className
        )}
      >
        <StatusIcon className={cn('h-3.5 w-3.5', signatureState === 'processing' && 'animate-spin')} />
        <span>{config.label}</span>
      </div>
    );
  }

  // Full mode - detailed timeline
  const hasLandlordSigned = !!data.landlord_signed_at || !!data.landlord_cryptoneo_signature_at;
  const hasTenantSigned = !!data.tenant_signed_at || !!data.tenant_cryptoneo_signature_at;

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2 rounded-lg', config.bgClass)}>
          <StatusIcon className={cn('h-5 w-5', config.colorClass, signatureState === 'processing' && 'animate-spin')} />
        </div>
        <div>
          <h4 className={cn('font-semibold text-sm', config.colorClass)}>{config.label}</h4>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between gap-2">
        {/* Landlord */}
        <div className="flex-1 text-center">
          <div
            className={cn(
              'w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 border-2',
              hasLandlordSigned
                ? 'bg-emerald-100 border-emerald-500'
                : 'bg-muted border-muted-foreground/30'
            )}
          >
            {hasLandlordSigned ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="text-xs font-medium text-foreground truncate">{landlordName}</p>
          {showDates && (
            <p className="text-[10px] text-muted-foreground">
              {hasLandlordSigned
                ? formatSignatureDate(data.landlord_cryptoneo_signature_at || data.landlord_signed_at)
                : isOwner === true
                  ? 'Vous'
                  : 'En attente'}
            </p>
          )}
        </div>

        {/* Connector */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <div
            className={cn(
              'h-0.5 w-6',
              hasLandlordSigned ? 'bg-emerald-400' : 'bg-muted-foreground/30'
            )}
          />
          {signatureState === 'certified' && showCryptoneo ? (
            <div className="p-1.5 rounded-full bg-primary/10 border border-primary/30">
              <Shield className="h-4 w-4 text-primary" />
            </div>
          ) : signatureState === 'completed' ? (
            <div className="p-1.5 rounded-full bg-emerald-100 border border-emerald-300">
              <FileCheck className="h-4 w-4 text-emerald-600" />
            </div>
          ) : (
            <div className="p-1.5 rounded-full bg-muted border border-muted-foreground/30">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div
            className={cn(
              'h-0.5 w-6',
              hasTenantSigned ? 'bg-emerald-400' : 'bg-muted-foreground/30'
            )}
          />
        </div>

        {/* Tenant */}
        <div className="flex-1 text-center">
          <div
            className={cn(
              'w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 border-2',
              hasTenantSigned
                ? 'bg-emerald-100 border-emerald-500'
                : 'bg-muted border-muted-foreground/30'
            )}
          >
            {hasTenantSigned ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <Home className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="text-xs font-medium text-foreground truncate">{tenantName}</p>
          {showDates && (
            <p className="text-[10px] text-muted-foreground">
              {hasTenantSigned
                ? formatSignatureDate(data.tenant_cryptoneo_signature_at || data.tenant_signed_at)
                : isOwner === false
                  ? 'Vous'
                  : 'En attente'}
            </p>
          )}
        </div>
      </div>

      {/* CryptoNeo Section */}
      {showCryptoneo && (signatureState === 'certified' || data.is_electronically_signed) && (
        <div className="mt-4 pt-3 border-t border-primary/20">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Signature électronique CryptoNeo</span>
          </div>
          {(data.cryptoneo_signed_document_url || data.signed_document_url) && (
            <a
              href={data.cryptoneo_signed_document_url || data.signed_document_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <FileCheck className="h-3.5 w-3.5" />
              Télécharger le document signé
            </a>
          )}
        </div>
      )}
    </div>
  );
}
