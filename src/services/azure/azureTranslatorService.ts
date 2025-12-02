/**
 * Azure Translator Service Stub
 * Service de traduction pour l'internationalisation
 */

export const azureTranslatorService = {
  /**
   * Définit la langue cible pour la traduction
   */
  setTargetLanguage: async (lang: string): Promise<void> => {
    console.log(`[Azure Translator] Language set to: ${lang}`);
    localStorage.setItem('preferred_language', lang);
  },

  /**
   * Traduit un texte vers la langue cible
   */
  translate: async (text: string, _targetLang: string): Promise<string> => {
    // Stub: retourne le texte original
    return text;
  },

  /**
   * Vérifie si le service est configuré
   */
  isConfigured: (): boolean => {
    return !!import.meta.env['VITE_AZURE_TRANSLATOR_KEY'];
  },

  /**
   * Obtient la langue préférée
   */
  getPreferredLanguage: (): string => {
    return localStorage.getItem('preferred_language') || 'fr';
  }
};

export default azureTranslatorService;
