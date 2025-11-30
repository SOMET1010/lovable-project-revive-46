/**
 * Tests d'intégration pour useContract
 *
 * Couvre:
 * - Chargement des données du contrat
 * - Autorisation utilisateur (landlord/tenant)
 * - Gestion des erreurs
 * - Fonction reload
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useContract } from '../useContract';
import { supabase } from '@/services/supabase/client';

// Mock Supabase client
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useContract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useContract('lease-123', 'user-123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.lease).toBeNull();
    expect(result.current.property).toBeNull();
    expect(result.current.landlordProfile).toBeNull();
    expect(result.current.tenantProfile).toBeNull();
    expect(result.current.error).toBe('');
  });

  it('should load contract data successfully for landlord', async () => {
    const mockLease = {
      id: 'lease-123',
      property_id: 'prop-123',
      landlord_id: 'user-123',
      tenant_id: 'tenant-123',
      monthly_rent: 300000,
      deposit_amount: 600000,
      status: 'actif',
    };

    const mockProperty = {
      title: 'Villa Cocody',
      address: '123 Rue Test',
      city: 'Abidjan',
    };

    const mockLandlord = {
      full_name: 'Jean Propriétaire',
      email: 'jean@example.com',
      phone: '0709090909',
      identity_verified: true,
    };

    const mockTenant = {
      full_name: 'Marie Locataire',
      email: 'marie@example.com',
      phone: '0708080808',
      identity_verified: true,
    };

    const fromMock = vi.fn();
    (supabase.from as any) = fromMock;

    // Mock lease query
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockLease,
        error: null,
      }),
    });

    // Mock property query
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProperty,
        error: null,
      }),
    });

    // Mock landlord query
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockLandlord,
        error: null,
      }),
    });

    // Mock tenant query
    fromMock.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockTenant,
        error: null,
      }),
    });

    const { result } = renderHook(() => useContract('lease-123', 'user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.lease).toEqual(mockLease);
    expect(result.current.property).toEqual(mockProperty);
    expect(result.current.landlordProfile).toEqual(mockLandlord);
    expect(result.current.tenantProfile).toEqual(mockTenant);
    expect(result.current.error).toBe('');
  });

  it('should load contract data successfully for tenant', async () => {
    const mockLease = {
      id: 'lease-123',
      property_id: 'prop-123',
      landlord_id: 'landlord-123',
      tenant_id: 'user-123',
      monthly_rent: 300000,
      status: 'actif',
    };

    const mockProperty = { title: 'Appartement', address: '456 Test', city: 'Abidjan' };
    const mockLandlord = { full_name: 'Landlord', email: 'land@example.com', phone: '0701', identity_verified: true };
    const mockTenant = { full_name: 'Tenant', email: 'tenant@example.com', phone: '0702', identity_verified: true };

    const fromMock = vi.fn();
    (supabase.from as any) = fromMock;

    fromMock
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockLease, error: null }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProperty, error: null }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockLandlord, error: null }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTenant, error: null }),
      });

    const { result } = renderHook(() => useContract('lease-123', 'user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.lease).toEqual(mockLease);
    expect(result.current.error).toBe('');
  });

  it('should return error when user is not authorized', async () => {
    const mockLease = {
      id: 'lease-123',
      property_id: 'prop-123',
      landlord_id: 'other-user-1',
      tenant_id: 'other-user-2',
      monthly_rent: 300000,
      status: 'actif',
    };

    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockLease,
        error: null,
      }),
    });
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useContract('lease-123', 'user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Vous n'êtes pas autorisé à accéder à ce bail");
    expect(result.current.lease).toBeNull();
  });

  it('should handle lease not found error', async () => {
    const fromMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(new Error('Lease not found')),
    });
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useContract('lease-123', 'user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Erreur lors du chargement du contrat');
    expect(result.current.lease).toBeNull();
  });

  it('should not fetch when leaseId is undefined', async () => {
    const fromMock = vi.fn();
    (supabase.from as any) = fromMock;

    const { result } = renderHook(() => useContract(undefined, 'user-123'));

    // Le hook reste en loading car il ne fetch pas et ne met pas loading à false
    expect(result.current.loading).toBe(true);
    expect(fromMock).not.toHaveBeenCalled();
    expect(result.current.lease).toBeNull();
  });

  it('should reload contract data when reload is called', async () => {
    const mockLease = {
      id: 'lease-123',
      property_id: 'prop-123',
      landlord_id: 'user-123',
      tenant_id: 'tenant-123',
      monthly_rent: 300000,
      status: 'actif',
    };

    const mockProperty = { title: 'Villa', address: '123 Test', city: 'Abidjan' };
    const mockLandlord = { full_name: 'Landlord', email: 'land@example.com', phone: '0701', identity_verified: true };
    const mockTenant = { full_name: 'Tenant', email: 'tenant@example.com', phone: '0702', identity_verified: true };

    const fromMock = vi.fn();
    (supabase.from as any) = fromMock;

    // Setup mocks for initial load and reload
    const setupMocks = () => {
      fromMock
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockLease, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockProperty, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockLandlord, error: null }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockTenant, error: null }),
        });
    };

    setupMocks();

    const { result } = renderHook(() => useContract('lease-123', 'user-123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCallCount = fromMock.mock.calls.length;

    // Setup mocks for reload
    setupMocks();

    // Call reload
    result.current.reload();

    await waitFor(() => expect(fromMock.mock.calls.length).toBeGreaterThan(initialCallCount));

    expect(result.current.lease).toEqual(mockLease);
  });
});
