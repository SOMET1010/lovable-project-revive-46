import { supabase } from '@/services/supabase/client';
import { ContractPdfGenerator, ContractData } from './contracts/contractPdfGenerator';
import { ErrorHandler } from '@/lib/errorHandler';

// Context pour le logging
const SERVICE_CONTEXT = { service: 'ContractService', context: { module: 'contracts' } };

// Configuration de retry pour Supabase
const SUPABASE_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  timeout: 30000,
  retryCondition: ErrorHandler.createSupabaseRetryCondition(),
};

export const contractService = {
  /**
   * Générer un contrat PDF avec gestion d'erreur robuste
   */
  async generateContract(data: ContractData): Promise<Blob> {
    return ErrorHandler.executeWithRetry(async () => {
      const generator = new ContractPdfGenerator();
      
      // Simulation d'opérations qui peuvent échouer
      await this.simulateContractGeneration();
      
      return generator.generate(data);
    }, { ...SERVICE_CONTEXT, operation: 'generateContract' }, SUPABASE_RETRY_CONFIG);
  },

  /**
   * Sauvegarder un contrat avec retry automatique
   */
  async saveContract(leaseId: string, blob: Blob): Promise<string> {
    return ErrorHandler.executeWithRetry(async () => {
      const fileName = `${leaseId}/contract_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for contract');
      }

      return urlData.publicUrl;
    }, { ...SERVICE_CONTEXT, operation: 'saveContract' }, SUPABASE_RETRY_CONFIG);
  },

  /**
   * Générer et sauvegarder un contrat avec gestion d'erreur complète
   */
  async generateAndSaveContract(leaseId: string): Promise<string> {
    return ErrorHandler.executeWithRetry(async () => {
      // Récupérer les données du bail avec retry
      const lease = await this.getLeaseWithRetry(leaseId);
      
      if (!lease) {
        throw new Error('Bail introuvable');
      }

      const contractData: ContractData = {
        leaseId,
        propertyTitle: lease.property?.title || 'Propriété',
        propertyAddress: lease.property?.address || '',
        propertyCity: lease.property?.city || '',
        landlordName: lease.landlord?.full_name || 'Propriétaire',
        landlordPhone: lease.landlord?.phone || '',
        landlordEmail: lease.landlord?.email || '',
        tenantName: lease.tenant?.full_name || 'Locataire',
        tenantPhone: lease.tenant?.phone || '',
        tenantEmail: lease.tenant?.email || '',
        monthlyRent: lease.monthly_rent || 0,
        depositAmount: lease.deposit_amount || 0,
        chargesAmount: lease.charges_amount || 0,
        startDate: lease.start_date,
        endDate: lease.end_date,
        paymentDay: lease.payment_day || 1,
        customClauses: lease.custom_clauses || undefined
      };

      // Générer le PDF avec retry
      const pdfBlob = await this.generateContract(contractData);
      
      // Sauvegarder avec retry
      const contractUrl = await this.saveContract(leaseId, pdfBlob);

      // Mettre à jour le bail avec l'URL du contrat
      await this.updateLeaseContractUrl(leaseId, contractUrl);

      return contractUrl;
    }, { ...SERVICE_CONTEXT, operation: 'generateAndSaveContract' }, SUPABASE_RETRY_CONFIG);
  },

  /**
   * Télécharger un contrat avec gestion d'erreur
   */
  async downloadContract(contractUrl: string, fileName: string = 'contrat-bail.pdf'): Promise<void> {
    return ErrorHandler.execute(async () => {
      const response = await fetch(contractUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download contract: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Utiliser la méthode existante pour le téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, { ...SERVICE_CONTEXT, operation: 'downloadContract' });
  },

  /**
   * Supprimer un contrat
   */
  async deleteContract(contractUrl: string): Promise<void> {
    return ErrorHandler.executeWithRetry(async () => {
      // Extraire le nom de fichier de l'URL
      const urlParts = contractUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { error } = await supabase.storage
        .from('contracts')
        .remove([fileName]);

      if (error) {
        throw new Error(`Failed to delete contract: ${error.message}`);
      }
    }, { ...SERVICE_CONTEXT, operation: 'deleteContract' }, SUPABASE_RETRY_CONFIG);
  },

  /**
   * Vérifier si un contrat existe déjà
   */
  async contractExists(leaseId: string): Promise<boolean> {
    return ErrorHandler.executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('leases')
        .select('pdf_document_url')
        .eq('id', leaseId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to check contract existence: ${error.message}`);
      }

      return !!(data?.pdf_document_url);
    }, { ...SERVICE_CONTEXT, operation: 'contractExists' }, SUPABASE_RETRY_CONFIG);
  },

  // ============================================================================
  // MÉTHODES PRIVÉES AVEC RETRY
  // ============================================================================

  /**
   * Récupérer un bail avec retry
   */
  private async getLeaseWithRetry(leaseId: string): Promise<any> {
    return ErrorHandler.executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          property:properties(title, address, city),
          landlord:profiles!leases_landlord_id_fkey(full_name, phone, email),
          tenant:profiles!leases_tenant_id_fkey(full_name, phone, email)
        `)
        .eq('id', leaseId)
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    }, { ...SERVICE_CONTEXT, operation: 'getLeaseWithRetry' }, SUPABASE_RETRY_CONFIG);
  },

  /**
   * Mettre à jour l'URL du contrat dans le bail
   */
  private async updateLeaseContractUrl(leaseId: string, contractUrl: string): Promise<void> {
    return ErrorHandler.executeWithRetry(async () => {
      const { error } = await supabase
        .from('leases')
        .update({ pdf_document_url: contractUrl })
        .eq('id', leaseId);

      if (error) {
        throw new Error(`Failed to update lease contract URL: ${error.message}`);
      }
    }, { ...SERVICE_CONTEXT, operation: 'updateLeaseContractUrl' }, SUPABASE_RETRY_CONFIG);
  },

  /**
   * Simuler la génération de contrat (opérations potentiellement lentes/qui échouent)
   */
  private async simulateContractGeneration(): Promise<void> {
    // Simulation d'un délai de génération
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Simulation d'erreurs occasionnelles (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error('Contract generation timeout');
    }
  },
  async generateContract(data: ContractData): Promise<Blob> {
    const generator = new ContractPdfGenerator();
    return generator.generate(data);
  },

  async saveContract(leaseId: string, blob: Blob): Promise<string> {
    const fileName = `${leaseId}/contract_${Date.now()}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(fileName, blob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('contracts')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  },

  async generateAndSaveContract(leaseId: string): Promise<string> {
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select(`
        *,
        property:properties(title, address, city),
        landlord:profiles!leases_landlord_id_fkey(full_name, phone, email),
        tenant:profiles!leases_tenant_id_fkey(full_name, phone, email)
      `)
      .eq('id', leaseId)
      .single();

    if (leaseError) {
      throw new Error(`Supabase error: ${leaseError.message}`);
    }

    return data;
  },

  /**
   * Simuler la génération de contrat (opérations potentiellement lentes/qui échouent)
   */
  private async simulateContractGeneration(): Promise<void> {
    // Simulation d'un délai de génération
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Simulation d'erreurs occasionnelles (5% de chance)
    if (Math.random() < 0.05) {
      throw new Error('Contract generation timeout');
    }
  },
