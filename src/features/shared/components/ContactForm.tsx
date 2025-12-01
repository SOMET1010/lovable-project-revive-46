import React, { useState } from 'react';
import { useContact, ContactFormData } from '../hooks/useContact';
import { LoadingOverlay } from '../../../shared/components/LoadingStates';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  privacy?: string;
}

const ContactForm: React.FC = () => {
  const { submitContact, isLoading, error, success } = useContact();
  const [formData, setFormData] = useState<ContactFormData & { privacy: boolean }>({
    name: '',
    email: '',
    subject: '',
    message: '',
    privacy: false
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Options de sujets
  const subjectOptions = [
    { value: '', label: 'Sélectionnez un sujet' },
    { value: 'support', label: 'Support technique' },
    { value: 'partnership', label: 'Partenariat et collaboration' },
    { value: 'billing', label: 'Facturation et paiement' },
    { value: 'property', label: 'Gestion des propriétés' },
    { value: 'account', label: 'Problème de compte' },
    { value: 'feature', label: 'Demande de fonctionnalité' },
    { value: 'security', label: 'Sécurité et confidentialité' },
    { value: 'feedback', label: 'Commentaires et suggestions' },
    { value: 'other', label: 'Autre' }
  ];

  // Validation des champs
  const validateField = (name: string, value: string | boolean): string | undefined => {
    switch (name) {
      case 'name':
        if (!value) return 'Le nom est requis';
        if (typeof value === 'string' && value.trim().length < 2) {
          return 'Le nom doit contenir au moins 2 caractères';
        }
        return undefined;
      
      case 'email':
        if (!value) return 'L\'adresse email est requise';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value === 'string' && !emailRegex.test(value)) {
          return 'Veuillez saisir une adresse email valide';
        }
        return undefined;
      
      case 'subject':
        if (!value) return 'Veuillez sélectionner un sujet';
        return undefined;
      
      case 'message':
        if (!value) return 'Le message est requis';
        if (typeof value === 'string' && value.trim().length < 10) {
          return 'Le message doit contenir au moins 10 caractères';
        }
        if (typeof value === 'string' && value.trim().length > 1000) {
          return 'Le message ne peut pas dépasser 1000 caractères';
        }
        return undefined;
      
      case 'privacy':
        if (!value) return 'Vous devez accepter la politique de confidentialité';
        return undefined;
      
      default:
        return undefined;
    }
  };

  // Gestion des changements
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : undefined;
    
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validation en temps réel
    const fieldError = validateField(name, (newValue ?? '') as string | boolean);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Gestion du blur (quitting un champ)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : undefined;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name, (fieldValue ?? '') as string | boolean);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Validation complète du formulaire
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key as keyof typeof formData]);
      if (fieldError) {
        newErrors[key as keyof FormErrors] = fieldError;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marquer tous les champs comme "touchés"
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Valider le formulaire
    if (!validateForm()) {
      return;
    }

    // Préparer les données pour l'envoi
    const submitData: ContactFormData = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    };

    // Soumettre via le hook
    const result = await submitContact(submitData);
    
    if (result.success) {
      // Réinitialiser le formulaire en cas de succès
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        privacy: false
      });
      setTouched({});
      setErrors({});
    }
  };

  // Reset du formulaire
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      privacy: false
    });
    setTouched({});
    setErrors({});
  };

  return (
    <div className="relative">
      {/* Messages de succès/erreur globaux */}
      {success && (
        <div className="success-message flex items-center mb-6">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.</span>
        </div>
      )}
      
      {error && (
        <div className="error-message flex items-center mb-6">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom complet */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors['name'] && touched['name'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-white'
            }`}
            placeholder="Votre nom et prénom"
          />
          {errors['name'] && touched['name'] && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors['name']}
            </p>
          )}
        </div>
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors['email'] && touched['email'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-white'
            }`}
            placeholder="votre.email@exemple.com"
          />
          {errors['email'] && touched['email'] && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors['email']}
            </p>
          )}
        </div>
        
        {/* Sujet */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Sujet *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors['subject'] && touched['subject'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-white'
            }`}
          >
            {subjectOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors['subject'] && touched['subject'] && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors['subject']}
            </p>
          )}
        </div>
        
        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={6}
            required
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors ${
              errors['message'] && touched['message'] 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 bg-white'
            }`}
            placeholder="Décrivez votre demande en détail..."
          />
          <div className="flex justify-between items-center mt-1">
            {errors['message'] && touched['message'] ? (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors['message']}
              </p>
            ) : (
              <div></div>
            )}
            <span className="text-sm text-gray-500">
              {formData.message.length}/1000
            </span>
          </div>
        </div>
        
        {/* Checkbox confidentialité */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="privacy"
            name="privacy"
            checked={formData.privacy}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 h-4 w-4 rounded border-gray-300 focus:ring-blue-500 ${
              errors['privacy'] && touched['privacy'] 
                ? 'border-red-300' 
                : 'border-gray-300'
            }`}
          />
          <label htmlFor="privacy" className="ml-3 text-sm text-gray-600">
            J'accepte que mes données personnelles soient traitées conformément à la{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
              politique de confidentialité
            </a>{' '}
            de MonToit dans le but de traiter ma demande. *
          </label>
        </div>
        {errors['privacy'] && touched['privacy'] && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors['privacy']}
          </p>
        )}
        
        {/* Boutons */}
        <div className="flex gap-4 pt-4">
          <LoadingOverlay isLoading={isLoading} className="flex-1">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </LoadingOverlay>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;