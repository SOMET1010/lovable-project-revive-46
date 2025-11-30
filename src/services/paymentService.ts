/**
 * Payment Service
 * Business logic for payment processing avec gestion d'erreur robuste
 */

import { ErrorHandler } from '@/lib/errorHandler';
import type {
  MobileMoneyProvider,
  ProviderDetectionResult,
  PaymentCalculation,
  PaymentErrorCode,
  PaymentError,
} from '@/shared/types/payment.types';
import { PROVIDER_PREFIXES, PROVIDER_FEES, PLATFORM_FEE_PERCENTAGE } from '@/shared/types/payment.types';

// Context pour le logging
const SERVICE_CONTEXT = { service: 'PaymentService', context: { module: 'payments' } };

// Configuration de retry pour les opérations de paiement
const PAYMENT_RETRY_CONFIG = {
  maxRetries: 2, // Moins de retries pour les paiements
  baseDelay: 2000, // Délai plus long pour les paiements
  maxDelay: 10000,
  timeout: 45000, // Timeout plus long pour les paiements
  retryCondition: ErrorHandler.createExternalApiRetryCondition(),
  onRetry: (attempt: number, error: any, delay: number) => {
    console.warn(`[PaymentService] Retry attempt ${attempt} after ${delay}ms:`, error.message);
  },
};

export class PaymentService {
  /**
   * Simuler un appel API externe pour traiter un paiement
   * (Dans un vrai système, ceci ferait un appel à l'API du provider Mobile Money)
   */
  static async processPayment(
    amount: number,
    provider: MobileMoneyProvider,
    phoneNumber: string,
    transactionRef: string
  ): Promise<{ success: boolean; transactionId?: string; error?: PaymentError }> {
    return ErrorHandler.executeWithRetry(async () => {
      // Simulation d'un appel API avec risque d'erreur
      await this.simulateExternalApiCall();
      
      // Simulation de vérification du solde
      const balanceCheck = await this.checkBalance(phoneNumber, provider);
      if (!balanceCheck.sufficient) {
        throw this.createPaymentError('INSUFFICIENT_BALANCE', { available: balanceCheck.available });
      }

      // Simulation du traitement du paiement
      const paymentResult = await this.simulatePaymentProcessing(amount, provider, transactionRef);
      
      return paymentResult;
    }, { ...SERVICE_CONTEXT, operation: 'processPayment' }, PAYMENT_RETRY_CONFIG);
  }

  /**
   * Vérifier le statut d'une transaction
   */
  static async getTransactionStatus(transactionRef: string): Promise<{ 
    status: 'pending' | 'completed' | 'failed';
    details?: any;
  }> {
    return ErrorHandler.executeWithRetry(async () => {
      // Simulation d'appel API pour vérifier le statut
      await this.simulateExternalApiCall();
      
      // Simulation de réponse
      const statuses = ['pending', 'completed', 'failed'] as const;
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        status: randomStatus,
        details: {
          transactionRef,
          checkedAt: new Date().toISOString(),
          providerResponse: `Simulated response for ${transactionRef}`,
        },
      };
    }, { ...SERVICE_CONTEXT, operation: 'getTransactionStatus' }, PAYMENT_RETRY_CONFIG);
  }

  /**
   * Annuler une transaction en attente
   */
  static async cancelTransaction(transactionRef: string): Promise<{ success: boolean; error?: PaymentError }> {
    return ErrorHandler.executeWithRetry(async () => {
      await this.simulateExternalApiCall();
      
      // Simulation d'annulation
      return { success: true };
    }, { ...SERVICE_CONTEXT, operation: 'cancelTransaction' }, { ...PAYMENT_RETRY_CONFIG, maxRetries: 1 });
  }

  /**
   * Envoyer OTP pour confirmation de paiement
   */
  static async sendPaymentOTP(phoneNumber: string, provider: MobileMoneyProvider): Promise<{ 
    success: boolean; 
    error?: PaymentError 
  }> {
    return ErrorHandler.executeWithRetry(async () => {
      await this.simulateExternalApiCall();
      
      // Simulation d'envoi d'OTP
      console.log(`[PaymentService] OTP sent to ${this.formatPhoneNumber(phoneNumber)} via ${this.getProviderName(provider)}`);
      
      return { success: true };
    }, { ...SERVICE_CONTEXT, operation: 'sendPaymentOTP' }, PAYMENT_RETRY_CONFIG);
  }

  /**
   * Vérifier le solde du compte Mobile Money
   */
  private static async checkBalance(
    phoneNumber: string, 
    provider: MobileMoneyProvider
  ): Promise<{ sufficient: boolean; available: number }> {
    await this.simulateExternalApiCall();
    
    // Simulation: solde aléatoire entre 1000 et 50000 FCFA
    const balance = Math.floor(Math.random() * 49000) + 1000;
    return {
      sufficient: balance >= 1000, // Montant minimum
      available: balance,
    };
  }

  /**
   * Simuler le traitement du paiement
   */
  private static async simulatePaymentProcessing(
    amount: number,
    provider: MobileMoneyProvider,
    transactionRef: string
  ): Promise<{ success: boolean; transactionId?: string; error?: PaymentError }> {
    await this.simulateExternalApiCall();
    
    // Simulation: 10% de chance d'échec
    if (Math.random() < 0.1) {
      throw this.createPaymentError('PROVIDER_ERROR', { provider, amount });
    }
    
    // Simulation: délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      transactionId: `${provider.toUpperCase()}_${transactionRef}_${Date.now()}`,
    };
  }

  /**
   * Simuler un appel API externe avec gestion d'erreur
   */
  private static async simulateExternalApiCall(): Promise<void> {
    // Simulation de délai réseau
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulation d'erreurs réseau occasionnelles
    if (Math.random() < 0.05) { // 5% de chance d'erreur réseau
      const networkError = new Error('Network timeout');
      networkError.name = 'NetworkError';
      throw networkError;
    }
    
    // Simulation d'erreurs serveur occasionnelles
    if (Math.random() < 0.03) { // 3% de chance d'erreur serveur
      const serverError = new Error('Internal server error');
      serverError.status = 500;
      throw serverError;
    }
  }
  /**
   * Detect Mobile Money provider from phone number
   */
  static detectProvider(phoneNumber: string): ProviderDetectionResult {
    // Remove all non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Must be 10 digits for Côte d'Ivoire
    if (cleanNumber.length !== 10) {
      return {
        provider: null,
        isValid: false,
        phoneNumber,
        formattedNumber: cleanNumber,
        error: 'Le numéro doit contenir exactement 10 chiffres',
      };
    }

    // Extract prefix (first 2 or 3 digits)
    const prefix2 = cleanNumber.substring(0, 2);
    const prefix3 = cleanNumber.substring(0, 3);

    // Check each provider
    for (const [provider, prefixes] of Object.entries(PROVIDER_PREFIXES)) {
      if (prefixes.includes(prefix2) || prefixes.includes(prefix3)) {
        return {
          provider: provider as MobileMoneyProvider,
          isValid: true,
          phoneNumber,
          formattedNumber: this.formatPhoneNumber(cleanNumber),
          error: undefined,
        };
      }
    }

    // Wave doesn't have specific prefixes, but we can accept it
    // if explicitly selected by user
    return {
      provider: null,
      isValid: true, // Valid number format, just unknown provider
      phoneNumber,
      formattedNumber: this.formatPhoneNumber(cleanNumber),
      error: 'Opérateur non détecté automatiquement. Veuillez sélectionner manuellement.',
    };
  }

  /**
   * Format phone number for display (XX XX XX XX XX)
   */
  static formatPhoneNumber(phoneNumber: string): string {
    const clean = phoneNumber.replace(/\D/g, '');
    if (clean.length !== 10) return phoneNumber;

    return `${clean.substring(0, 2)} ${clean.substring(2, 4)} ${clean.substring(4, 6)} ${clean.substring(6, 8)} ${clean.substring(8, 10)}`;
  }

  /**
   * Format phone number for international format (+225XXXXXXXXXX)
   */
  static formatInternational(phoneNumber: string): string {
    const clean = phoneNumber.replace(/\D/g, '');
    return `+225${clean}`;
  }

  /**
   * Calculate payment fees and amounts
   */
  static calculatePayment(
    amount: number,
    provider: MobileMoneyProvider
  ): PaymentCalculation {
    if (amount <= 0) {
      throw new Error('Le montant doit être supérieur à zéro');
    }

    const providerFeeRate = PROVIDER_FEES[provider];
    const providerFee = (amount * providerFeeRate) / 100;
    const totalAmount = amount + providerFee;
    const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
    const landlordAmount = amount - platformFee;

    return {
      baseAmount: amount,
      providerFee: Math.round(providerFee),
      platformFee: Math.round(platformFee),
      totalAmount: Math.round(totalAmount),
      landlordAmount: Math.round(landlordAmount),
    };
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number): { valid: boolean; error?: string } {
    const MIN_AMOUNT = 100; // 100 FCFA
    const MAX_AMOUNT = 5000000; // 5 million FCFA

    if (amount < MIN_AMOUNT) {
      return {
        valid: false,
        error: `Le montant minimum est de ${MIN_AMOUNT} FCFA`,
      };
    }

    if (amount > MAX_AMOUNT) {
      return {
        valid: false,
        error: `Le montant maximum est de ${MAX_AMOUNT.toLocaleString()} FCFA`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): { valid: boolean; error?: string } {
    const clean = phoneNumber.replace(/\D/g, '');

    if (clean.length !== 10) {
      return {
        valid: false,
        error: 'Le numéro doit contenir 10 chiffres',
      };
    }

    // Check if starts with valid mobile prefix
    const validPrefixes = ['01', '05', '07', '054', '055', '056', '227'];
    const prefix2 = clean.substring(0, 2);
    const prefix3 = clean.substring(0, 3);

    if (!validPrefixes.includes(prefix2) && !validPrefixes.includes(prefix3)) {
      return {
        valid: false,
        error: 'Numéro de téléphone invalide',
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique transaction reference
   */
  static generateTransactionReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MTT${timestamp}${random}`;
  }

  /**
   * Get provider display name
   */
  static getProviderName(provider: MobileMoneyProvider): string {
    const names: Record<MobileMoneyProvider, string> = {
      orange_money: 'Orange Money',
      mtn_money: 'MTN Money',
      moov_money: 'Moov Money',
      wave: 'Wave',
    };
    return names[provider];
  }

  /**
   * Get provider logo URL
   */
  static getProviderLogo(provider: MobileMoneyProvider): string {
    const logos: Record<MobileMoneyProvider, string> = {
      orange_money: '/logos/orange-money.png',
      mtn_money: '/logos/mtn-money.png',
      moov_money: '/logos/moov-money.png',
      wave: '/logos/wave.png',
    };
    return logos[provider];
  }

  /**
   * Map error code to user-friendly message
   */
  static getErrorMessage(code: PaymentErrorCode): string {
    const messages: Record<PaymentErrorCode, string> = {
      INVALID_PHONE: 'Numéro de téléphone invalide',
      INVALID_AMOUNT: 'Montant invalide',
      INSUFFICIENT_BALANCE: 'Solde insuffisant',
      PROVIDER_ERROR: 'Erreur de l\'opérateur. Veuillez réessayer.',
      NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre réseau.',
      TIMEOUT: 'La transaction a expiré. Veuillez réessayer.',
      DUPLICATE_TRANSACTION: 'Cette transaction existe déjà',
      CANCELLED_BY_USER: 'Transaction annulée',
      INVALID_OTP: 'Code OTP invalide',
      TRANSACTION_EXPIRED: 'La transaction a expiré',
      UNKNOWN_ERROR: 'Une erreur est survenue. Veuillez réessayer.',
    };
    return messages[code];
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(code: PaymentErrorCode): boolean {
    const retryable = [
      'PROVIDER_ERROR',
      'NETWORK_ERROR',
      'TIMEOUT',
      'UNKNOWN_ERROR',
    ];
    return retryable.includes(code);
  }

  /**
   * Create payment error object
   */
  static createPaymentError(
    code: PaymentErrorCode,
    details?: unknown
  ): PaymentError {
    return {
      code,
      message: this.getErrorMessage(code),
      details,
      retryable: this.isRetryableError(code),
    };
  }

  /**
   * Validate payment request
   */
  static validatePaymentRequest(
    amount: number,
    phoneNumber: string,
    provider: MobileMoneyProvider
  ): { valid: boolean; error?: PaymentError } {
    // Validate amount
    const amountValidation = this.validateAmount(amount);
    if (!amountValidation.valid) {
      return {
        valid: false,
        error: this.createPaymentError('INVALID_AMOUNT'),
      };
    }

    // Validate phone number
    const phoneValidation = this.validatePhoneNumber(phoneNumber);
    if (!phoneValidation.valid) {
      return {
        valid: false,
        error: this.createPaymentError('INVALID_PHONE'),
      };
    }

    // Validate provider matches phone number
    const detection = this.detectProvider(phoneNumber);
    if (detection.provider && detection.provider !== provider) {
      return {
        valid: false,
        error: {
          code: 'INVALID_PHONE',
          message: `Ce numéro correspond à ${this.getProviderName(detection.provider)}`,
          retryable: false,
        },
      };
    }

    return { valid: true };
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate estimated transfer time
   */
  static getEstimatedTransferTime(provider: MobileMoneyProvider): string {
    const times: Record<MobileMoneyProvider, string> = {
      orange_money: 'Instantané',
      mtn_money: 'Quelques secondes',
      moov_money: 'Quelques secondes',
      wave: 'Instantané',
    };
    return times[provider];
  }
}
