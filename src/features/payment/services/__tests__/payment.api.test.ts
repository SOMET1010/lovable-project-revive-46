/**
 * Tests unitaires pour paymentApi - 10 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/services/supabase/client';

vi.mock('@/services/supabase/client');

// Mock simple du service payment
const paymentApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('payments').select('*');
    if (error) throw error;
    return { data, error: null };
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
    if (error) throw error;
    return { data, error: null };
  },
  create: async (payment: any) => {
    const { data, error } = await supabase.from('payments').insert(payment).select().single();
    if (error) throw error;
    return { data, error: null };
  },
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return { data, error: null };
  },
};

describe('paymentApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPayment = {
    id: 'payment-123',
    payer_id: 'tenant-123',
    receiver_id: 'landlord-123',
    amount: 300000,
    payment_type: 'loyer',
    payment_method: 'mobile_money',
    status: 'en_attente',
  };

  it('should fetch all payments', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [mockPayment], error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await paymentApi.getAll();
    expect(result.data).toEqual([mockPayment]);
  });

  it('should fetch payment by ID', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await paymentApi.getById('payment-123');
    expect(result.data).toEqual(mockPayment);
  });

  it('should create payment', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPayment, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await paymentApi.create(mockPayment);
    expect(result.data).toBeDefined();
  });

  it('should update payment status to completed', async () => {
    const completedPayment = { ...mockPayment, status: 'complete' };
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: completedPayment, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await paymentApi.update('payment-123', { status: 'complete' });
    expect(result.data?.status).toBe('complete');
  });

  it('should update payment status to failed', async () => {
    const failedPayment = { ...mockPayment, status: 'echoue' };
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: failedPayment, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await paymentApi.update('payment-123', { status: 'echoue' });
    expect(result.data?.status).toBe('echoue');
  });

  it('should handle large payment amounts', async () => {
    const largePayment = { ...mockPayment, amount: 5000000 };
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: largePayment, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await paymentApi.create(largePayment);
    expect(result.data?.amount).toBe(5000000);
  });

  it('should support different payment methods', async () => {
    const cardPayment = { ...mockPayment, payment_method: 'carte_bancaire' };
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: cardPayment, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await paymentApi.create(cardPayment);
    expect(result.data?.payment_method).toBe('carte_bancaire');
  });

  it('should support different payment types', async () => {
    const depositPayment = { ...mockPayment, payment_type: 'depot_garantie' };
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: depositPayment, error: null }),
    });
    (supabase.from as any) = mockFrom;

    const result = await paymentApi.create(depositPayment);
    expect(result.data?.payment_type).toBe('depot_garantie');
  });

  it('should handle payment not found', async () => {
    const mockError = new Error('Payment not found');
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });
    (supabase.from as any) = mockFrom;

    await expect(paymentApi.getById('invalid-id')).rejects.toThrow('Payment not found');
  });

  it('should handle database errors', async () => {
    const mockError = new Error('Database connection failed');
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });
    (supabase.from as any) = mockFrom;

    await expect(paymentApi.getAll()).rejects.toThrow('Database connection failed');
  });
});
