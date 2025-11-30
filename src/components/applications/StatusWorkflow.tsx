import React from 'react';
import { ApplicationStatus, STATUS_CONFIGS, WORKFLOW_STEPS } from './types';
import { StatusBadge } from './StatusBadge';

interface StatusWorkflowProps {
  currentStatus: ApplicationStatus;
  completedStatuses?: ApplicationStatus[];
  className?: string;
}

/**
 * Visualisation du workflow des statuts de candidature
 */
export const StatusWorkflow: React.FC<StatusWorkflowProps> = ({
  currentStatus,
  completedStatuses = [],
  className = ''
}) => {
  const currentStepIndex = WORKFLOW_STEPS.indexOf(currentStatus);
  const isCompleted = (status: ApplicationStatus) => 
    completedStatuses.includes(status);

  const isCurrent = (status: ApplicationStatus) => 
    status === currentStatus;

  const isPast = (status: ApplicationStatus) => {
    const stepIndex = WORKFLOW_STEPS.indexOf(status);
    return stepIndex < currentStepIndex && isCompleted(status);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Workflow */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between">
          {WORKFLOW_STEPS.map((status, index) => {
            const config = STATUS_CONFIGS[status];
            const isCurrentStep = isCurrent(status);
            const isPastStep = isPast(status);
            
            return (
              <React.Fragment key={status}>
                <div className="flex flex-col items-center flex-1">
                  {/* Étape */}
                  <div className="relative">
                    <div
                      className={`
                        w-12 h-12 rounded-full border-2 flex items-center justify-center
                        transition-all duration-300
                        ${isCurrentStep 
                          ? 'border-current shadow-lg scale-110' 
                          : isPastStep
                          ? 'border-current opacity-75'
                          : 'border-neutral-300 opacity-50'
                        }
                      `}
                      style={{
                        backgroundColor: isCurrentStep || isPastStep 
                          ? config.bgColor 
                          : 'var(--color-neutral-100)',
                        borderColor: isCurrentStep || isPastStep 
                          ? config.borderColor 
                          : 'var(--color-neutral-300)',
                        color: isCurrentStep || isPastStep 
                          ? config.color 
                          : 'var(--text-muted)'
                      }}
                    >
                      <span className="text-xl" aria-hidden="true">
                        {config.icon}
                      </span>
                    </div>
                    
                    {/* Indicateur de progression */}
                    {isCurrentStep && (
                      <div
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                      />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={`
                        text-sm font-medium
                        ${isCurrentStep ? 'contrast-aaa' : isPastStep ? 'contrast-aa-large' : 'contrast-muted'}
                      `}
                    >
                      {config.label}
                    </p>
                  </div>
                </div>
                
                {/* Connecteur */}
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className="flex-1 mx-4 relative">
                    <div
                      className={`
                        h-0.5 transition-all duration-300
                        ${isPastStep ? 'w-full' : 'w-full opacity-30'}
                      `}
                      style={{
                        backgroundColor: isPastStep 
                          ? 'var(--accent-primary)' 
                          : 'var(--color-neutral-300)'
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Workflow */}
      <div className="lg:hidden space-y-4">
        {WORKFLOW_STEPS.map((status, index) => {
          const config = STATUS_CONFIGS[status];
          const isCurrentStep = isCurrent(status);
          const isPastStep = isPast(status);
          
          return (
            <div key={status} className="flex items-start gap-3">
              {/* Indicateur d'étape */}
              <div className="flex-shrink-0 mt-1">
                <div
                  className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300
                    ${isCurrentStep 
                      ? 'border-current shadow-lg' 
                      : isPastStep
                      ? 'border-current opacity-75'
                      : 'border-neutral-300 opacity-50'
                    }
                  `}
                  style={{
                    backgroundColor: isCurrentStep || isPastStep 
                      ? config.bgColor 
                      : 'var(--color-neutral-100)',
                    borderColor: isCurrentStep || isPastStep 
                      ? config.borderColor 
                      : 'var(--color-neutral-300)'
                  }}
                >
                  <span className="text-sm" aria-hidden="true">
                    {config.icon}
                  </span>
                </div>
              </div>
              
              {/* Contenu */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <h3
                    className={`
                      text-sm font-semibold
                      ${isCurrentStep ? 'contrast-aaa' : isPastStep ? 'contrast-aa-large' : 'contrast-muted'}
                    `}
                  >
                    {config.label}
                  </h3>
                  {isCurrentStep && (
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--text-inverse)'
                      }}
                    >
                      En cours
                    </span>
                  )}
                  {isPastStep && (
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: 'var(--color-semantic-success)',
                        color: 'var(--text-inverse)'
                      }}
                    >
                      Terminé
                    </span>
                  )}
                </div>
                <p 
                  className="text-xs mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {config.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistiques de progression */}
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background-surface)' }}>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>
            Progression globale
          </span>
          <span 
            className="font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {Math.round(((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100)}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full mt-2"
          style={{ backgroundColor: 'var(--color-neutral-200)' }}
        >
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              backgroundColor: 'var(--accent-primary)',
              width: `${((currentStepIndex + 1) / WORKFLOW_STEPS.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
};