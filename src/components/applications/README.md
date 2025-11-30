# Module Applications - Système de Candidature Multi-Étapes

Ce module fournit un système complet de candidature pour les locations immobilières avec un formulaire multi-étapes, validation côté client, upload de documents et sauvegarde automatique.

## Composants

### ApplicationForm
Le composant principal qui orchestre l'ensemble du processus de candidature.

```tsx
import { ApplicationForm } from '@/components/applications';

<ApplicationForm
  propertyId="property-123"
  propertyTitle="Appartement 2 pièces - Paris 1er"
  onSubmit={async (data, documents) => {
    console.log('Candidature soumise:', data, documents);
  }}
  onSave={async (data) => {
    console.log('Données sauvegardées:', data);
  }}
  autoSave={true}
  autoSaveInterval={30000} // 30 secondes
/>
```

### ApplicationProgress
Barre de progression personnalisable avec différents formats.

```tsx
import { ApplicationProgress } from '@/components/applications';

// Format détaillé par défaut
<ApplicationProgress 
  currentStep={2} 
  totalSteps={3} 
  variant="detailed"
/>

// Format compact
<ApplicationProgress 
  currentStep={1} 
  totalSteps={3} 
  variant="compact"
/>
```

### ApplicationStep1
Étape de saisie des informations personnelles.

```tsx
import { ApplicationStep1, type ApplicationData } from '@/components/applications';

<ApplicationStep1
  data={applicationData}
  onChange={(data) => setApplicationData(prev => ({ ...prev, ...data }))}
  onNext={() => console.log('Étape suivante')}
  errors={{ firstName: 'Ce champ est requis' }}
  loading={false}
/>
```

### ApplicationStep2
Étape de téléchargement et gestion des documents.

```tsx
import { ApplicationStep2, type DocumentFile } from '@/components/applications';

<ApplicationStep2
  documents={documents}
  onDocumentsChange={(docs) => setDocuments(docs)}
  onNext={() => console.log('Étape suivante')}
  onPrevious={() => console.log('Étape précédente')}
  loading={false}
/>
```

### ApplicationStep3
Étape finale de validation et soumission.

```tsx
import { ApplicationStep3 } from '@/components/applications';

<ApplicationStep3
  applicationData={applicationData}
  documents={documents}
  onSubmit={async () => {
    console.log('Soumission en cours...');
  }}
  onPrevious={() => console.log('Étape précédente')}
  loading={false}
/>
```

### ApplicationReview
Aperçu des données avant soumission finale.

```tsx
import { ApplicationReview } from '@/components/applications';

<ApplicationReview
  applicationData={applicationData}
  documents={documents}
  editable={true}
/>
```

## Types de données

### ApplicationData
```tsx
interface ApplicationData {
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
  
  // Garant
  hasGuarantor: boolean;
  guarantorFirstName?: string;
  guarantorLastName?: string;
  guarantorEmail?: string;
  guarantorPhone?: string;
}
```

### DocumentFile
```tsx
interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  error?: string;
}
```

## Fonctionnalités

### ✨ Gestion multi-étapes
- Navigation fluide entre les étapes
- Validation à chaque étape
- Retour arrière possible

### 📄 Upload de documents
- Glisser-déposer de fichiers
- Validation des types de fichiers (PDF, images)
- Limitation de taille et nombre de fichiers
- Prévisualisation des fichiers

### 💾 Sauvegarde automatique
- Sauvegarde locale (localStorage)
- Sauvegarde sur serveur (via callback)
- Intervalle configurable
- Indicateur de sauvegarde

### ✅ Validation
- Validation côté client en temps réel
- Messages d'erreur contextuels
- Empêcher la navigation si données invalides

### 📱 Responsive Design
- Interface adaptative mobile/desktop
- Compatible tous navigateurs
- Accessibilité WCAG AAA

### 🎨 Design System
- Respect des design tokens MONTOIT
- Couleurs et typographies cohérentes
- Animations fluides
- États interactifs (hover, focus, loading)

## Configuration

### Variables d'environnement
- Aucun prérequis spécial

### Dépendances
- React 18+
- TypeScript 4.5+
- Tailwind CSS (déjà inclus dans le projet)

## Exemple d'intégration complète

```tsx
import React, { useState } from 'react';
import { ApplicationForm, type ApplicationData, type DocumentFile } from '@/components/applications';

export function PropertyApplicationPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (data: ApplicationData, documents: DocumentFile[]) => {
    try {
      // Soumettre la candidature au backend
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, documents }),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Erreur soumission:', error);
    }
  };

  const handleSave = async (data: Partial<ApplicationData>) => {
    // Sauvegarde automatique
    await fetch('/api/applications/draft', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          Candidature soumise avec succès !
        </h2>
        <p className="text-neutral-600">
          Vous recevrez un email de confirmation sous peu.
        </p>
      </div>
    );
  }

  return (
    <ApplicationForm
      propertyId="property-123"
      propertyTitle="Appartement 2 pièces - Paris 1er"
      onSubmit={handleSubmit}
      onSave={handleSave}
      autoSave={true}
      autoSaveInterval={30000}
    />
  );
}
```

## Accessibilité

- Contrôles de formulaire entièrement accessibles (labels, descriptions, focus)
- Navigation au clavier complète
- Messages d'erreur announceés par les lecteurs d'écran
- Contraste de couleurs conforme WCAG AAA
- Animations respectueuses des préférences utilisateur

## Tests

Les composants incluent des attributs `aria-*` pour faciliter les tests d'accessibilité et d'automatisation.

## Performance

- Lazy loading des étapes
- Optimisation des re-renders avec React.memo
- Debouncing de la sauvegarde automatique
- Compression des images uploadées (côté client)