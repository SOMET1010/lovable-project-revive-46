/**
 * Tests unitaires pour authApi
 *
 * Ces tests vérifient toutes les méthodes du service d'authentification
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi } from '../auth.api';
import { supabase } from '@/services/supabase/client';

// Mock Supabase client
vi.mock('@/services/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
    })),
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          phone: '0709090909',
          role: 'tenant',
        },
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      } as any);

      const signUpData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        phone: '0709090909',
        role: 'tenant' as const,
      };

      const result = await authApi.signUp(signUpData);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            phone: signUpData.phone,
            role: signUpData.role,
          },
        },
      });
    });

    it('should throw error when signup fails', async () => {
      const mockError = new Error('Email already exists');

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const signUpData = {
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Test User',
        phone: '0709090909',
        role: 'tenant' as const,
      };

      await expect(authApi.signUp(signUpData)).rejects.toThrow('Email already exists');
    });
  });

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockSession = {
        access_token: 'token-123',
        user: { id: 'user-123', email: 'test@example.com' },
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockSession.user, session: mockSession as any },
        error: null,
      } as any);

      const signInData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authApi.signIn(signInData);

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(signInData);
    });

    it('should throw error with invalid credentials', async () => {
      const mockError = new Error('Invalid credentials');

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const signInData = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      await expect(authApi.signIn(signInData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      const result = await authApi.signOut();

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle signout error', async () => {
      const mockError = new Error('Signout failed');

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError,
      });

      await expect(authApi.signOut()).rejects.toThrow('Signout failed');
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      const mockSession = {
        access_token: 'token-123',
        user: { id: 'user-123' },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      const result = await authApi.getSession();

      expect(result.data).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should handle session fetch error', async () => {
      const mockError = new Error('Session fetch failed');

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      await expect(authApi.getSession()).rejects.toThrow('Session fetch failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const result = await authApi.getCurrentUser();

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      } as any);

      const email = 'test@example.com';
      const result = await authApi.resetPassword(email);

      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        email,
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        })
      );
    });

    it('should handle invalid email error', async () => {
      const mockError = new Error('Invalid email');

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: mockError,
      } as any);

      await expect(authApi.resetPassword('invalid-email')).rejects.toThrow('Invalid email');
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: { id: 'user-123' } as any },
        error: null,
      });

      const newPassword = 'new-password-123';
      const result = await authApi.updatePassword(newPassword);

      expect(result.error).toBeNull();
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword,
      });
    });
  });

  describe('sendOTP', () => {
    it('should send OTP via email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const email = 'test@example.com';
      const result = await authApi.sendOTP(email, 'email');

      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-otp', {
        body: { email, method: 'email' },
      });
    });

    it('should send OTP via WhatsApp', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const email = 'test@example.com';
      await authApi.sendOTP(email, 'whatsapp');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-whatsapp-otp', {
        body: { email, method: 'whatsapp' },
      });
    });
  });

  describe('verifyOTP', () => {
    it('should verify valid OTP', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true, verified: true },
        error: null,
      });

      const otpData = {
        email: 'test@example.com',
        otp: '123456',
      };

      const result = await authApi.verifyOTP(otpData);

      expect(result.data.verified).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject invalid OTP', async () => {
      const mockError = new Error('Invalid OTP');

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const otpData = {
        email: 'test@example.com',
        otp: 'wrong-otp',
      };

      await expect(authApi.verifyOTP(otpData)).rejects.toThrow('Invalid OTP');
    });
  });
});
