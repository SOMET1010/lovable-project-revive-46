/**
 * Real-time hook for lease signature status updates
 * Listens to Supabase realtime changes on lease_contracts table
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaseSignatureData {
  landlord_signed_at: string | null;
  tenant_signed_at: string | null;
  landlord_cryptoneo_signature_at: string | null;
  tenant_cryptoneo_signature_at: string | null;
  cryptoneo_signature_status: string | null;
  is_electronically_signed: boolean;
  cryptoneo_signed_document_url: string | null;
  signed_document_url: string | null;
}

export function useLeaseSignatureRealtime(
  leaseId: string | undefined,
  initialData: LeaseSignatureData
): LeaseSignatureData {
  const [signatureData, setSignatureData] = useState<LeaseSignatureData>(initialData);

  useEffect(() => {
    setSignatureData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (!leaseId) return;

    const channel = supabase
      .channel(`lease_signature:${leaseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lease_contracts',
          filter: `id=eq.${leaseId}`,
        },
        (payload) => {
          const newData = payload.new as Record<string, unknown>;
          setSignatureData({
            landlord_signed_at: (newData['landlord_signed_at'] as string) ?? null,
            tenant_signed_at: (newData['tenant_signed_at'] as string) ?? null,
            landlord_cryptoneo_signature_at: (newData['landlord_cryptoneo_signature_at'] as string) ?? null,
            tenant_cryptoneo_signature_at: (newData['tenant_cryptoneo_signature_at'] as string) ?? null,
            cryptoneo_signature_status: (newData['cryptoneo_signature_status'] as string) ?? null,
            is_electronically_signed: (newData['is_electronically_signed'] as boolean) ?? false,
            cryptoneo_signed_document_url: (newData['cryptoneo_signed_document_url'] as string) ?? null,
            signed_document_url: (newData['signed_document_url'] as string) ?? null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leaseId]);

  return signatureData;
}
