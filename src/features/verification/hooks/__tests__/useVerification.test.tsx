/**
 * Tests d'intégration pour useVerification
 *
 * Couvre:
 * - Chargement des données de vérification
 * - Gestion de l'absence de données (maybeSingle)
 * - Gestion des erreurs
 * - userId optionnel
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useVerification } from '../useVerification';
import { supabase } from '@/services/supabase/client';

// Mock Supabase client
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useVerification('user-123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.verification).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should load verification data successfully', async () => {
    const mockVerification = {
      id: 'verif-123',
      user_id: 'user-123',
      oneci_status: 'verifie' as const,
      cnam_status: 'verifie' as const,
      face_verification_status: 'verifie' as const,
      oneci_document_url: 'https://example.com/oneci.pdf',
      cnam_document_url: 'https://example.com/cnam.pdf',
      selfie_image_url: 'https://example.com/selfie.jpg',
      oneci_number: 'CI1234567890',
      cnam_number: 'CNAM123456',
      rejection_reason: null,
      identity_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: mockVerification,
        error: null,
      }),
    });
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useVerification('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.verification).toEqual(mockVerification);
    expect(result.current.verification?.oneci_status).toBe('verifie');
    expect(result.current.verification?.cnam_status).toBe('verifie');
    expect(result.current.verification?.face_verification_status).toBe('verifie');
    expect(result.current.verification?.identity_verified).toBe(true);
    expect(result.current.error).toBe('');
  });

  it('should handle no verification data (maybeSingle returns null)', async () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useVerification('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.verification).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should handle database errors', async () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockRejectedValue(new Error('Database error')),
    });
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useVerification('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Erreur lors du chargement des données de vérification');
    expect(result.current.verification).toBeNull();
  });

  it('should not fetch when userId is undefined', async () => {
    const fromMock = vi.fn();
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useVerification(undefined));

    // Le hook reste en loading car il ne fetch pas et ne met pas loading à false
    expect(result.current.loading).toBe(true);
    expect(fromMock).not.toHaveBeenCalled();
    expect(result.current.verification).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should reload verification data when reload is called', async () => {
    const mockVerification = {
      id: 'verif-123',
      user_id: 'user-123',
      oneci_status: 'en_attente' as const,
      cnam_status: 'en_attente' as const,
      face_verification_status: 'en_attente' as const,
      oneci_document_url: null,
      cnam_document_url: null,
      selfie_image_url: null,
      oneci_number: null,
      cnam_number: null,
      rejection_reason: null,
      identity_verified: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: mockVerification,
        error: null,
      }),
    });
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useVerification('user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCallCount = fromMock.mock.calls.length;

    // Call reload
    result.current.reload();

    await waitFor(() => expect(fromMock.mock.calls.length).toBeGreaterThan(initialCallCount));

    expect(result.current.verification).toEqual(mockVerification);
  });
});
