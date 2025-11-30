/**
 * ApplicationProgress - Barre de progression du formulaire de candidature
 */

import { HTMLAttributes, ReactNode } from 'react';

export interface ApplicationProgressProps extends HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  variant?: 'default' | 'compact' | 'detailed';
}

interface StepItem {
  id: number;
  title: string;
  description?: string;
}

const defaultStepTitles = [
  'Informations Personnelles',
  'Documents & Justificatifs', 
  'Validation & Soumission'
];

export function ApplicationProgress({
  currentStep,
  totalSteps,
  stepTitles = defaultStepTitles,
  variant = 'default',
  className = '',
  ...props
}: ApplicationProgressProps) {
  const steps: StepItem[] = Array.from({ length: totalSteps }, (_, i) => ({
    id: i + 1,
    title: stepTitles[i] || `Étape ${i + 1}`,
  }));

  const progressPercentage = (currentStep / totalSteps) * 100;

  const baseClasses = [
    'w-full',
    'bg-background-page',
  ].join(' ');

  const progressClasses = [
    'relative',
    'w-full',
    'h-1',
    'bg-neutral-200',
    'rounded-full',
    'overflow-hidden',
  ].join(' ');

  const fillClasses = [
    'h-full',
    'bg-primary-500',
    'rounded-full',
    'transition-all duration-500 ease-out',
  ].join(' ');

  if (variant === 'compact') {
    return (
      <div className={baseClasses} {...props}>
        <div className={progressClasses}>
          <div
            className={fillClasses}
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={0}
            aria-valuemax={totalSteps}
            aria-label={`Étape ${currentStep} sur ${totalSteps}`}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm font-medium text-neutral-700">
            Étape {currentStep} sur {totalSteps}
          </span>
          <span className="text-sm text-neutral-500">
            {Math.round(progressPercentage)}% terminé
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={baseClasses} {...props}>
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.id > currentStep;

            const stepClasses = [
              'flex items-center flex-1',
              index < steps.length - 1 ? 'relative' : '',
            ].join(' ');

            const circleClasses = [
              'w-10 h-10',
              'rounded-full',
              'flex items-center justify-center',
              'font-semibold text-sm',
              'transition-all duration-300 ease-out',
            ];

            if (isCompleted) {
              circleClasses.push(
                'bg-primary-500',
                'text-white',
                'shadow-md'
              );
            } else if (isCurrent) {
              circleClasses.push(
                'bg-primary-500',
                'text-white',
                'ring-4',
                'ring-primary-100',
                'shadow-md'
              );
            } else {
              circleClasses.push(
                'bg-neutral-200',
                'text-neutral-500'
              );
            }

            const titleClasses = [
              'text-sm font-medium mt-2 text-center',
              isCurrent ? 'text-neutral-900' : isCompleted ? 'text-primary-600' : 'text-neutral-500'
            ].join(' ');

            return (
              <div key={step.id} className={stepClasses}>
                <div className="flex flex-col items-center">
                  <div className={circleClasses}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className={titleClasses}>
                    {step.title}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px mx-4 bg-neutral-200 relative">
                    <div
                      className={`absolute top-0 left-0 h-full bg-primary-500 transition-all duration-500 ease-out ${
                        isCompleted ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // variant === 'default'
  return (
    <div className={baseClasses} {...props}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">
          Étape {currentStep} sur {totalSteps}
        </h3>
        <span className="text-sm text-neutral-500">
          {Math.round(progressPercentage)}% terminé
        </span>
      </div>
      
      <div className={progressClasses}>
        <div
          className={fillClasses}
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`Progression du formulaire - Étape ${currentStep} sur ${totalSteps}`}
        />
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-neutral-600">
          {steps[currentStep - 1]?.title}
        </p>
      </div>
    </div>
  );
}