# Guide d'Intégration - Système de Candidature Multi-Étapes

## Vue d'ensemble

Le système de candidature multi-étapes MONTOIT fournit une solution complète pour les demandes de location immobilières avec :
- Formulaire intelligent multi-étapes
- Upload de documents avec validation
- Sauvegarde automatique
- Interface responsive et accessible
- Design cohérent avec le design system MONTOIT

## Architecture

```
src/
├── components/applications/
│   ├── ApplicationForm.tsx          # Composant principal orchestrant le flux
│   ├── ApplicationProgress.tsx      # Barre de progression (3 variantes)
│   ├── ApplicationStep1.tsx         # Informations personnelles
│   ├── ApplicationStep2.tsx         # Documents et justificatifs
│   ├── ApplicationStep3.tsx         # Validation et soumission
│   ├── ApplicationReview.tsx        # Aperçu final
│   ├── index.ts                     # Exports centralisés
│   └── README.md                    # Documentation technique
├── pages/applications/
│   ├── ApplicationPage.tsx          # Page d'exemple complète
│   └── index.ts                     # Exports des pages
└── types/applications.ts            # Types TypeScript (optionnel)
```

## Intégration Étape par Étape

### 1. Configuration du routing

Ajoutez les routes dans votre configuration de routage :

```tsx
// src/App.tsx ou src/routes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApplicationPage } from '@/pages/applications';

// Routes existantes...
<Routes>
  {/* Autres routes... */}
  
  {/* Route pour candidature */}
  <Route path="/properties/:propertyId/apply" element={<ApplicationPage />} />
  <Route path="/applications/new" element={<ApplicationPage />} />
</Routes>
```

### 2. Intégration dans les pages existantes

#### A. Dans une page de détail de propriété

```tsx
// src/pages/properties/PropertyDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

export function PropertyDetailPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const handleApply = () => {
    navigate(`/properties/${propertyId}/apply`);
  };

  return (
    <div>
      {/* Contenu de la page... */}
      
      <Button 
        onClick={handleApply}
        variant="primary"
        size="large"
      >
        Postuler à ce bien
      </Button>
    </div>
  );
}
```

#### B. Dans une liste de propriétés

```tsx
// src/components/properties/PropertyCard.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    address: string;
    rent: number;
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const navigate = useNavigate();

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la navigation vers le détail
    navigate(`/properties/${property.id}/apply`);
  };

  return (
    <div className="property-card">
      {/* Contenu de la carte... */}
      
      <div className="mt-4 flex gap-3">
        <Button 
          variant="secondary"
          onClick={() => navigate(`/properties/${property.id}`)}
        >
          Voir les détails
        </Button>
        <Button 
          variant="primary"
          onClick={handleApply}
        >
          Postuler
        </Button>
      </div>
    </div>
  );
}
```

### 3. Configuration du backend

#### API Endpoints suggérés

```typescript
// POST /api/applications - Soumettre une candidature complète
interface ApplicationSubmission {
  propertyId: string;
  applicantData: ApplicationData;
  documents: DocumentFile[];
}

interface ApplicationResponse {
  applicationId: string;
  status: 'submitted' | 'pending_review';
  submittedAt: string;
}

// PUT /api/applications/draft - Sauvegarder un brouillon
interface DraftSave {
  propertyId?: string;
  applicationData: Partial<ApplicationData>;
}

// GET /api/applications/:id - Récupérer une candidature
interface ApplicationDetails {
  id: string;
  propertyId: string;
  data: ApplicationData;
  documents: DocumentFile[];
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
```

#### Exemple d'intégration frontend

```tsx
// src/services/applicationService.ts
import { ApplicationData, DocumentFile } from '@/components/applications';

export class ApplicationService {
  static async submitApplication(
    data: ApplicationData, 
    documents: DocumentFile[]
  ): Promise<ApplicationResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    
    documents.forEach((doc, index) => {
      // Si vous stockez les fichiers, les convertir en blobs
      const file = new File([doc.name], doc.name, { type: doc.type });
      formData.append(`document_${index}`, file);
    });

    const response = await fetch('/api/applications', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la soumission');
    }

    return response.json();
  }

  static async saveDraft(data: Partial<ApplicationData>): Promise<void> {
    await fetch('/api/applications/draft', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  static async getApplication(id: string): Promise<ApplicationDetails> {
    const response = await fetch(`/api/applications/${id}`);
    return response.json();
  }
}
```

### 4. Personnalisation des styles

#### Variables CSS personnalisées

```css
/* src/styles/applications.css */
.applications-form {
  /* Vous pouvez surcharger certains styles si nécessaire */
}

.applications-step-transition {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Styles pour les zones de drop */
.document-dropzone {
  border: 2px dashed var(--neutral-300);
  transition: all 0.2s ease;
}

.document-dropzone.dragover {
  border-color: var(--primary-500);
  background-color: var(--primary-50);
}
```

#### Thème sombre (optionnel)

```tsx
// src/styles/dark-theme-applications.css
@media (prefers-color-scheme: dark) {
  .applications-form {
    --background-page: #0a0a0a;
    --background-surface: #1a1a1a;
    --background-elevated: #2a2a2a;
    --text-primary: #ffffff;
    --text-secondary: #a1a1aa;
  }
}
```

### 5. Optimisations et bonnes pratiques

#### A. Lazy loading des étapes

```tsx
// Optimisation optionnelle si le formulaire devient volumineux
const ApplicationStep1 = lazy(() => import('./ApplicationStep1'));
const ApplicationStep2 = lazy(() => import('./ApplicationStep2'));
const ApplicationStep3 = lazy(() => import('./ApplicationStep3'));

function ApplicationForm() {
  // ... reste du code
  
  const StepComponent = {
    1: ApplicationStep1,
    2: ApplicationStep2,
    3: ApplicationStep3,
  }[currentStep];

  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <StepComponent />
    </Suspense>
  );
}
```

#### B. Validation avancée

```tsx
// src/hooks/useApplicationValidation.ts
import { useMemo } from 'react';
import { ApplicationData } from '@/components/applications';

export function useApplicationValidation(data: ApplicationData) {
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    // Validation email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }

    // Validation téléphone français
    if (data.phone && !/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(data.phone)) {
      errors.phone = 'Format de téléphone français invalide';
    }

    // Validation revenus
    if (data.monthlyIncome && data.monthlyIncome < 0) {
      errors.monthlyIncome = 'Le montant ne peut pas être négatif';
    }

    return errors;
  }, [data]);

  return { validationErrors, isValid: Object.keys(validationErrors).length === 0 };
}
```

#### C. Analytics et tracking

```tsx
// src/hooks/useApplicationAnalytics.ts
export function useApplicationAnalytics() {
  const trackStepCompletion = (step: number, duration: number) => {
    // Analytics
    console.log(`Étape ${step} complétée en ${duration}ms`);
  };

  const trackDocumentUpload = (category: string, fileName: string) => {
    console.log(`Document uploadé: ${category} - ${fileName}`);
  };

  const trackFormAbandon = (currentStep: number) => {
    console.log(`Formulaire abandonné à l'étape ${currentStep}`);
  };

  return {
    trackStepCompletion,
    trackDocumentUpload,
    trackFormAbandon,
  };
}
```

### 6. Tests

#### Tests unitaires

```tsx
// src/components/applications/__tests__/ApplicationForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplicationForm } from '../ApplicationForm';

describe('ApplicationForm', () => {
  it('should render the first step', () => {
    render(<ApplicationForm />);
    
    expect(screen.getByText('Candidature de location')).toBeInTheDocument();
    expect(screen.getByText('Informations personnelles')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<ApplicationForm />);
    
    const nextButton = screen.getByText('Continuer');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Ce champ est requis')).toBeInTheDocument();
    });
  });

  it('should save data automatically', async () => {
    const onSave = jest.fn();
    render(<ApplicationForm onSave={onSave} />);
    
    // Saisir des données
    const firstNameInput = screen.getByLabelText('Prénom');
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    
    // Attendre la sauvegarde automatique
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ firstName: 'John' });
    }, { timeout: 35000 });
  });
});
```

#### Tests d'accessibilité

```tsx
// src/components/applications/__tests__/ApplicationForm.accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ApplicationForm } from '../ApplicationForm';

expect.extend(toHaveNoViolations);

describe('ApplicationForm Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<ApplicationForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 7. Monitoring et debug

#### A. Mode debug

```tsx
// src/components/applications/DebugPanel.tsx (optionnel)
import { ApplicationData, DocumentFile } from './index';

interface DebugPanelProps {
  data: ApplicationData;
  documents: DocumentFile[];
  currentStep: number;
}

export function DebugPanel({ data, documents, currentStep }: DebugPanelProps) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs">
      <h4>Debug Panel</h4>
      <p>Étape: {currentStep}/3</p>
      <p>Données: {JSON.stringify(data, null, 2)}</p>
      <p>Documents: {documents.length}</p>
    </div>
  );
}
```

#### B. Gestion d'erreurs

```tsx
// src/utils/applicationErrorHandler.ts
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export function handleApplicationError(error: unknown) {
  if (error instanceof ApplicationError) {
    console.error(`[Application ${error.code}]`, error.message, error.context);
    return {
      type: error.code,
      message: error.message,
      context: error.context,
    };
  }
  
  console.error('Erreur application:', error);
  return {
    type: 'unknown',
    message: 'Une erreur inattendue est survenue',
  };
}
```

## Checklist de déploiement

- [ ] ✅ Composants créés et testés
- [ ] ✅ Routes configurées
- [ ] ✅ Services API implémentés
- [ ] ✅ Types TypeScript exports
- [ ] ✅ Tests unitaires écrits
- [ ] ✅ Tests d'accessibilité passants
- [ ] ✅ Performance optimisée
- [ ] ✅ Analytics configuré
- [ ] ✅ Monitoring en place
- [ ] ✅ Documentation mise à jour

## Support et maintenance

Pour toute question ou amélioration :
1. Consultez la documentation dans `src/components/applications/README.md`
2. Vérifiez les exemples dans `src/pages/applications/ApplicationPage.tsx`
3. Utilisez les types TypeScript pour l'intellisense
4. Testez avec les outils d'accessibilité intégrés