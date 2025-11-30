/**
 * ApplicationStep1 - Informations personnelles
 */

import { HTMLAttributes, ReactNode, useState } from 'react';

export interface ApplicationData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  
  // Adresse
  address: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Situation professionnelle
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'retired' | 'student';
  employerName?: string;
  jobTitle?: string;
  monthlyIncome?: number;
  employmentDuration?: string;
  
  // Garant (optionnel)
  hasGuarantor: boolean;
  guarantorFirstName?: string;
  guarantorLastName?: string;
  guarantorEmail?: string;
  guarantorPhone?: string;
}

export interface ApplicationStep1Props extends HTMLAttributes<HTMLDivElement> {
  data: ApplicationData;
  onChange: (data: Partial<ApplicationData>) => void;
  onNext: () => void;
  errors?: Record<string, string>;
  loading?: boolean;
}

const employmentStatusOptions = [
  { value: 'employed', label: 'Salarié(e)' },
  { value: 'self-employed', label: 'Indépendant(e)' },
  { value: 'unemployed', label: 'Sans emploi' },
  { value: 'retired', label: 'Retraité(e)' },
  { value: 'student', label: 'Étudiant(e)' },
] as const;

export function ApplicationStep1({
  data,
  onChange,
  onNext,
  errors = {},
  loading = false,
  className = '',
  ...props
}: ApplicationStep1Props) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof ApplicationData, value: any) => {
    onChange({ [field]: value });
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateStep1 = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'employmentStatus'];
    return required.every(field => data[field as keyof ApplicationData]);
  };

  const isFormValid = validateStep1();
  const canProceed = isFormValid && !loading;

  const baseClasses = [
    'w-full',
    'space-y-8',
  ].join(' ');

  const fieldGroupClasses = [
    'space-y-6',
    'p-6',
    'bg-background-surface',
    'rounded-lg',
    'border border-neutral-200',
  ].join(' ');

  const inputClasses = [
    'w-full',
    'h-12',
    'px-4',
    'border border-neutral-200',
    'rounded-lg',
    'text-base',
    'text-neutral-900',
    'bg-background-page',
    'placeholder-neutral-500',
    'focus:outline-none',
    'focus:ring-3',
    'focus:ring-primary-500/15',
    'focus:border-primary-500',
    'transition-all duration-200',
  ].join(' ');

  const labelClasses = [
    'block',
    'text-sm',
    'font-medium',
    'text-neutral-700',
    'mb-2',
  ].join(' ');

  const errorClasses = [
    'text-sm',
    'text-semantic-error',
    'mt-1',
  ].join(' ');

  return (
    <div className={baseClasses} {...props}>
      {/* Informations personnelles */}
      <div className={fieldGroupClasses}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Informations personnelles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses} htmlFor="firstName">
              Prénom *
            </label>
            <input
              id="firstName"
              type="text"
              className={`${inputClasses} ${errors.firstName ? 'border-semantic-error' : ''}`}
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              placeholder="Votre prénom"
              disabled={loading}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && touched.firstName && (
              <div id="firstName-error" className={errorClasses}>
                {errors.firstName}
              </div>
            )}
          </div>

          <div>
            <label className={labelClasses} htmlFor="lastName">
              Nom de famille *
            </label>
            <input
              id="lastName"
              type="text"
              className={`${inputClasses} ${errors.lastName ? 'border-semantic-error' : ''}`}
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              placeholder="Votre nom de famille"
              disabled={loading}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && touched.lastName && (
              <div id="lastName-error" className={errorClasses}>
                {errors.lastName}
              </div>
            )}
          </div>

          <div>
            <label className={labelClasses} htmlFor="email">
              Adresse email *
            </label>
            <input
              id="email"
              type="email"
              className={`${inputClasses} ${errors.email ? 'border-semantic-error' : ''}`}
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="votre@email.com"
              disabled={loading}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && touched.email && (
              <div id="email-error" className={errorClasses}>
                {errors.email}
              </div>
            )}
          </div>

          <div>
            <label className={labelClasses} htmlFor="phone">
              Téléphone *
            </label>
            <input
              id="phone"
              type="tel"
              className={`${inputClasses} ${errors.phone ? 'border-semantic-error' : ''}`}
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              placeholder="+33 6 12 34 56 78"
              disabled={loading}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && touched.phone && (
              <div id="phone-error" className={errorClasses}>
                {errors.phone}
              </div>
            )}
          </div>

          <div>
            <label className={labelClasses} htmlFor="dateOfBirth">
              Date de naissance
            </label>
            <input
              id="dateOfBirth"
              type="date"
              className={inputClasses}
              value={data.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="nationality">
              Nationalité
            </label>
            <input
              id="nationality"
              type="text"
              className={inputClasses}
              value={data.nationality}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="Votre nationalité"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Adresse */}
      <div className={fieldGroupClasses}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Adresse
        </h3>
        
        <div>
          <label className={labelClasses} htmlFor="address">
            Adresse complète *
          </label>
          <input
            id="address"
            type="text"
            className={`${inputClasses} ${errors.address ? 'border-semantic-error' : ''}`}
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            placeholder="123 Rue de la Paix"
            disabled={loading}
            aria-describedby={errors.address ? 'address-error' : undefined}
          />
          {errors.address && touched.address && (
            <div id="address-error" className={errorClasses}>
              {errors.address}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClasses} htmlFor="city">
              Ville *
            </label>
            <input
              id="city"
              type="text"
              className={`${inputClasses} ${errors.city ? 'border-semantic-error' : ''}`}
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              onBlur={() => handleBlur('city')}
              placeholder="Paris"
              disabled={loading}
              aria-describedby={errors.city ? 'city-error' : undefined}
            />
            {errors.city && touched.city && (
              <div id="city-error" className={errorClasses}>
                {errors.city}
              </div>
            )}
          </div>

          <div>
            <label className={labelClasses} htmlFor="postalCode">
              Code postal *
            </label>
            <input
              id="postalCode"
              type="text"
              className={`${inputClasses} ${errors.postalCode ? 'border-semantic-error' : ''}`}
              value={data.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              onBlur={() => handleBlur('postalCode')}
              placeholder="75001"
              disabled={loading}
              aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
            />
            {errors.postalCode && touched.postalCode && (
              <div id="postalCode-error" className={errorClasses}>
                {errors.postalCode}
              </div>
            )}
          </div>

          <div>
            <label className={labelClasses} htmlFor="country">
              Pays
            </label>
            <input
              id="country"
              type="text"
              className={inputClasses}
              value={data.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="France"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Situation professionnelle */}
      <div className={fieldGroupClasses}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Situation professionnelle
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClasses} htmlFor="employmentStatus">
              Statut professionnel *
            </label>
            <select
              id="employmentStatus"
              className={`${inputClasses} ${errors.employmentStatus ? 'border-semantic-error' : ''}`}
              value={data.employmentStatus}
              onChange={(e) => handleChange('employmentStatus', e.target.value)}
              onBlur={() => handleBlur('employmentStatus')}
              disabled={loading}
              aria-describedby={errors.employmentStatus ? 'employmentStatus-error' : undefined}
            >
              <option value="">Sélectionnez votre statut</option>
              {employmentStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.employmentStatus && touched.employmentStatus && (
              <div id="employmentStatus-error" className={errorClasses}>
                {errors.employmentStatus}
              </div>
            )}
          </div>

          <div>
            <label className={labelClasses} htmlFor="monthlyIncome">
              Revenus mensuels (€)
            </label>
            <input
              id="monthlyIncome"
              type="number"
              className={inputClasses}
              value={data.monthlyIncome || ''}
              onChange={(e) => handleChange('monthlyIncome', Number(e.target.value))}
              placeholder="3000"
              min="0"
              disabled={loading}
            />
          </div>

          {data.employmentStatus === 'employed' && (
            <>
              <div>
                <label className={labelClasses} htmlFor="employerName">
                  Nom de l'employeur
                </label>
                <input
                  id="employerName"
                  type="text"
                  className={inputClasses}
                  value={data.employerName || ''}
                  onChange={(e) => handleChange('employerName', e.target.value)}
                  placeholder="Nom de votre entreprise"
                  disabled={loading}
                />
              </div>

              <div>
                <label className={labelClasses} htmlFor="jobTitle">
                  Poste occupé
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  className={inputClasses}
                  value={data.jobTitle || ''}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  placeholder="Votre poste"
                  disabled={loading}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Garant */}
      <div className={fieldGroupClasses}>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Garant (optionnel)
        </h3>
        
        <div className="mb-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
              checked={data.hasGuarantor}
              onChange={(e) => handleChange('hasGuarantor', e.target.checked)}
              disabled={loading}
            />
            <span className="text-sm font-medium text-neutral-700">
              J'ai un garant pour cette candidature
            </span>
          </label>
        </div>

        {data.hasGuarantor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses} htmlFor="guarantorFirstName">
                Prénom du garant
              </label>
              <input
                id="guarantorFirstName"
                type="text"
                className={inputClasses}
                value={data.guarantorFirstName || ''}
                onChange={(e) => handleChange('guarantorFirstName', e.target.value)}
                placeholder="Prénom du garant"
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClasses} htmlFor="guarantorLastName">
                Nom du garant
              </label>
              <input
                id="guarantorLastName"
                type="text"
                className={inputClasses}
                value={data.guarantorLastName || ''}
                onChange={(e) => handleChange('guarantorLastName', e.target.value)}
                placeholder="Nom du garant"
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClasses} htmlFor="guarantorEmail">
                Email du garant
              </label>
              <input
                id="guarantorEmail"
                type="email"
                className={inputClasses}
                value={data.guarantorEmail || ''}
                onChange={(e) => handleChange('guarantorEmail', e.target.value)}
                placeholder="garant@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClasses} htmlFor="guarantorPhone">
                Téléphone du garant
              </label>
              <input
                id="guarantorPhone"
                type="tel"
                className={inputClasses}
                value={data.guarantorPhone || ''}
                onChange={(e) => handleChange('guarantorPhone', e.target.value)}
                placeholder="+33 6 12 34 56 78"
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={[
            'px-8 py-3',
            'bg-primary-500',
            'text-white',
            'font-semibold',
            'rounded-lg',
            'transition-all duration-200',
            'hover:bg-primary-600',
            'focus:outline-none',
            'focus:ring-3',
            'focus:ring-primary-500/15',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed',
            'disabled:hover:bg-primary-500',
          ].join(' ')}
        >
          {loading ? 'Validation...' : 'Continuer'}
        </button>
      </div>
    </div>
  );
}