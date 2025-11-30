/**
 * Tests unitaires pour contractApi - 10 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { contractApi } from '../contract.api';
import { supabase } from '@/services/supabase/client';

vi.mock('@/services/supabase/client');

describe('contractApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockContract = {
    id: 'contract-123',
    property_id: 'prop-123',
    landlord_id: 'landlord-123',
    tenant_id: 'tenant-123',
    monthly_rent: 300000,
    status: 'brouillon',
    start_date: '2024-12-01',
    end_date: '2025-11-30',
  };

  it('should fetch all contracts', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockContract], error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await contractApi.getAll();
    expect(result.data).toEqual([mockContract]);
  });

  it('should fetch contract by ID', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockContract, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await contractApi.getById('contract-123');
    expect(result.data).toEqual(mockContract);
  });

  it('should fetch contracts by landlord', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockContract], error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await contractApi.getByLandlordId('landlord-123');
    expect(result.data).toEqual([mockContract]);
  });

  it('should fetch contracts by tenant', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockContract], error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await contractApi.getByTenantId('tenant-123');
    expect(result.data).toEqual([mockContract]);
  });

  it('should create contract', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockContract, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await contractApi.create(mockContract as any);
    expect(result.data).toBeDefined();
  });

  it('should update contract', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockContract, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await contractApi.update('contract-123', { status: 'actif' });
    expect(result.data).toBeDefined();
  });

  it('should sign contract as tenant', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockContract, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const signatureData = {
      otp_verified_at: '2024-11-25',
      signed_at: '2024-11-25',
    };

    const result = await contractApi.sign('contract-123', 'tenant', signatureData);
    expect(result.data).toBeDefined();
  });

  it('should check if contract is fully signed', async () => {
    const signedContract = {
      ...mockContract,
      tenant_signed_at: '2024-11-25',
      landlord_signed_at: '2024-11-25',
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: signedContract, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await contractApi.isFullySigned('contract-123');
    expect(result.data).toBe(true);
  });

  it('should update contract status', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {...mockContract, status: 'actif'}, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await contractApi.updateStatus('contract-123', 'actif');
    expect(result.data?.status).toBe('actif');
  });

  it('should handle errors', async () => {
    const mockError = new Error('Contract not found');
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });
    (supabase.from as any) = mockFrom;

    await expect(contractApi.getById('invalid-id')).rejects.toThrow('Contract not found');
  });
});
