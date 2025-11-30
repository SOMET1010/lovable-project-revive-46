# Guide Technique - Trust Agent Dashboard

## 🏗️ Architecture Technique Détaillée

### Structure des Composants

Le nouveau système est organisé selon une architecture modulaire et extensible :

```
trust-agent/
├── pages/
│   ├── DashboardPage.tsx              # Point d'entrée principal
│   ├── ValidationRequestsManagementPage.tsx # Gestion des validations
│   ├── MediationPage.tsx             # Page de médiation avancée
│   ├── ModerationPage.tsx            # Modération du contenu
│   ├── AnalyticsPage.tsx             # Analytics et reporting
│   └── RequestValidationPage.tsx     # Demandes de validation (utilisateurs)
└── components/
    ├── TrustAgentHeader.tsx          # En-tête avec statut
    ├── MediationWorkflow.tsx         # Workflow visuel en 5 étapes
    ├── DisputeStatusBadge.tsx        # Badges de statut colorés
    ├── UrgencyIndicator.tsx          # Indicateurs d'urgence
    ├── ValidationMetrics.tsx         # Métriques avec graphiques
    ├── QuickActionsPanel.tsx         # Actions rapides contextuelles
    └── index.ts                      # Point d'export centralisé
```

## 🎯 Guide d'Utilisation des Composants

### 1. TrustAgentHeader

**Utilisation de base :**
```typescript
import { TrustAgentHeader } from '@/features/trust-agent/components';

<TrustAgentHeader 
  title="Dashboard Médiation & Confiance"
  subtitle="Agent tiers de confiance certifié"
  showStatus={true}
  showSettings={true}
/>
```

**Props disponibles :**
- `title` : string - Titre principal du dashboard
- `subtitle` : string - Sous-titre descriptif (optionnel)
- `showStatus` : boolean - Affiche l'indicateur de statut en ligne
- `showSettings` : boolean - Affiche le bouton de paramètres

### 2. MediationWorkflow

**Utilisation personnalisée :**
```typescript
import { MediationWorkflow } from '@/features/trust-agent/components';

const customStages = [
  {
    stage: "Évaluation",
    count: 3,
    color: "purple" as const,
    description: "En cours d'évaluation"
  },
  // ... autres étapes
];

<MediationWorkflow stages={customStages} />
```

**Props :**
- `stages` : Array<{stage: string, count: number, color: string, description: string}> - Étapes du workflow

### 3. DisputeStatusBadge

**Différents statuts :**
```typescript
import { DisputeStatusBadge } from '@/features/trust-agent/components';

// Statut assigné
<DisputeStatusBadge status="assigned" />

// Statut en médiation
<DisputeStatusBadge status="under_mediation" size="lg" showIcon={true} />

// Statut résolu
<DisputeStatusBadge status="resolved" className="ml-2" />
```

**Props :**
- `status` : 'assigned' | 'under_mediation' | 'awaiting_response' | 'resolved' | 'escalated'
- `size` : 'sm' | 'md' | 'lg'
- `showIcon` : boolean
- `className` : string

### 4. UrgencyIndicator

**Niveaux d'urgence :**
```typescript
import { UrgencyIndicator, UrgentBadge } from '@/features/trust-agent/components';

// Indicateur d'urgence
<UrgencyIndicator urgency="high" size="md" showLabel={true} />

// Badge d'urgence
<UrgentBadge />
```

**Props :**
- `urgency` : 'low' | 'medium' | 'high' | 'urgent'
- `size` : 'sm' | 'md' | 'lg'
- `showLabel` : boolean
- `className` : string

### 5. ValidationMetrics

**Métriques avec graphiques :**
```typescript
import { ValidationMetrics, KeyMetricsCards } from '@/features/trust-agent/components';

const stats = {
  successRate: 87,
  avgResolutionTime: 4.2,
  satisfactionScore: 4.7,
  escalationRate: 12
};

<ValidationMetrics stats={stats} period="month" />
<KeyMetricsCards stats={stats} />
```

**Props :**
- `stats` : Object avec successRate, avgResolutionTime, satisfactionScore, escalationRate
- `period` : 'today' | 'week' | 'month'

### 6. QuickActionsPanel

**Actions personnalisées :**
```typescript
import { QuickActionsPanel } from '@/features/trust-agent/components';

const customActions = [
  {
    id: 'custom_action',
    label: 'Action Personnalisée',
    icon: Settings,
    color: 'indigo',
    count: 2,
    action: () => console.log('Action exécutée')
  }
];

<QuickActionsPanel actions={customActions} />
```

## 🔧 Configuration et Personnalisation

### Variables CSS Disponibles

Le dashboard utilise un système de couleurs spécialisé :

```css
/* Couleurs principales de médiation */
:root {
  --mediation-blue: #3b82f6;        /* Actions assignées */
  --mediation-orange: #f59e0b;      /* Négociation en cours */
  --mediation-green: #10b981;       /* Résolution positive */
  --mediation-red: #ef4444;         /* Urgence/Alertes */
  --mediation-purple: #8b5cf6;      /* Analytics/Reporting */
  
  /* Couleurs de fond */
  --mediation-blue-bg: #dbeafe;
  --mediation-orange-bg: #fed7aa;
  --mediation-green-bg: #d1fae5;
  --mediation-red-bg: #fee2e2;
  --mediation-purple-bg: #e9d5ff;
}
```

### Classes Utilitaires

```css
/* Badges de statut */
.mediation-badge-assigned { @apply bg-blue-100 text-blue-800 border-blue-200; }
.mediation-badge-mediating { @apply bg-orange-100 text-orange-800 border-orange-200; }
.mediation-badge-resolved { @apply bg-green-100 text-green-800 border-green-200; }
.mediation-badge-urgent { @apply bg-red-100 text-red-800 border-red-200; }

/* Indicateurs d'urgence */
.urgency-low { @apply border-green-200 bg-green-50; }
.urgency-medium { @apply border-yellow-200 bg-yellow-50; }
.urgency-high { @apply border-orange-200 bg-orange-50; }
.urgency-urgent { @apply border-red-200 bg-red-50 animate-pulse; }
```

## 📊 Gestion des Données

### Interfaces TypeScript

```typescript
// Interface pour les statistiques de médiation
interface MediationStats {
  activeDisputes: number;
  resolvedDisputes: number;
  avgResolutionTime: number;
  satisfactionScore: number;
  pendingValidations: number;
  underReview: number;
  escalationRate: number;
  successRate: number;
}

// Interface pour un litige
interface Dispute {
  id: string;
  dispute_number: string;
  description: string;
  status: 'assigned' | 'under_mediation' | 'awaiting_response' | 'resolved' | 'escalated';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  amount_disputed: number;
  opened_at: string;
  mediation_stage: 'initial' | 'negotiation' | 'proposal' | 'agreement' | 'closure';
  parties: {
    opener: { first_name: string; last_name: string; role: string };
    opponent: { first_name: string; last_name: string; role: string };
  };
  property: { title: string; address: string };
}

// Interface pour une demande de validation
interface ValidationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required';
  requested_at: string;
  urgency: 'normal' | 'high';
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    tenant_score?: number;
    ansut_verified: boolean;
  };
}
```

### Services de Données

Le dashboard s'intègre avec les services existants :

```typescript
// Service de validation de confiance
import { trustValidationService } from '@/services/trustValidationService';

// Récupération des demandes de validation
const validationRequests = await trustValidationService.getValidationRequests({
  status: 'pending',
  limit: 50
});

// Mise à jour d'une demande
await trustValidationService.updateValidationRequest({
  requestId: '123',
  status: 'approved',
  trustScore: 85,
  agentNotes: 'Dossier complet et vérifié'
});
```

## 🎨 Thèmes et Variants

### Variant Clair (par défaut)
```typescript
<TrustAgentDashboard theme="light" />
```

### Variant Sombre
```typescript
<TrustAgentDashboard theme="dark" />
```

### Variant Haute Contraste
```typescript
<TrustAgentDashboard theme="high-contrast" />
```

## 🔌 Points d'Extension

### 1. Ajout de Nouvelles Actions

```typescript
// Ajouter une nouvelle action rapide
const newAction: QuickActionButton = {
  id: 'custom_action',
  label: 'Ma Action Personnalisée',
  icon: CustomIcon,
  color: 'indigo',
  count: 3,
  action: () => {
    // Logique personnalisée
    handleCustomAction();
  }
};

<QuickActionsPanel actions={[...defaultActions, newAction]} />
```

### 2. Nouvelles Métriques

```typescript
// Ajouter une métrique personnalisée
const customMetric = {
  key: 'custom_metric',
  label: 'Métrique Personnalisée',
  value: 75,
  unit: '%',
  color: '#6366f1',
  bgColor: 'bg-indigo-50',
  icon: CustomIcon,
  change: '+5%',
  trend: 'up' as const
};
```

### 3. Workflows Personnalisés

```typescript
// Définir un workflow spécialisé
const mortgageDisputeWorkflow = [
  { stage: "Recevabilité", count: 2, color: "blue", description: "Vérification éligibilité" },
  { stage: "Expertise", count: 1, color: "yellow", description: "Analyse technique" },
  { stage: "Négociation", count: 3, color: "orange", description: "Discussion parties" },
  { stage: "Proposition", count: 2, color: "purple", description: "Solution proposée" },
  { stage: "Validation", count: 1, color: "green", description: "Accord final" }
];

<MediationWorkflow stages={mortgageDisputeWorkflow} />
```

## 🧪 Tests et Debugging

### Tests des Composants

```typescript
// Test du composant DisputeStatusBadge
import { render, screen } from '@testing-library/react';
import { DisputeStatusBadge } from './DisputeStatusBadge';

test('affiche le bon statut avec couleur', () => {
  render(<DisputeStatusBadge status="under_mediation" />);
  
  const badge = screen.getByText('En médiation');
  expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
});
```

### Debugging avec React DevTools

Le dashboard inclut des props de debug :

```typescript
<TrustAgentDashboard 
  debug={process.env.NODE_ENV === 'development'}
  showPerformanceMetrics={true}
  logLevel="verbose"
/>
```

### Logs et Monitoring

```typescript
// Service de logging spécialisé
class MediationLogger {
  static logDisputeAction(action: string, disputeId: string, details: any) {
    console.log(`[MEDIATION] ${action}:`, { disputeId, ...details });
    
    // Envoi vers service de monitoring
    analytics.track('mediation_action', {
      action,
      disputeId,
      timestamp: new Date().toISOString()
    });
  }
}

// Utilisation dans les composants
MediationLogger.logDisputeAction('status_changed', '123', {
  from: 'assigned',
  to: 'under_mediation',
  agent: userId
});
```

## 🚀 Performance et Optimisation

### Lazy Loading des Composants

```typescript
// Chargement différé des composants lourds
const MediationWorkflow = lazy(() => import('./MediationWorkflow'));
const ValidationMetrics = lazy(() => import('./ValidationMetrics'));

function TrustAgentDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <MediationWorkflow />
      <ValidationMetrics />
    </Suspense>
  );
}
```

### Memoization des Calculs Coûteux

```typescript
import { useMemo } from 'react';

function useMediationStats(disputes: Dispute[]) {
  return useMemo(() => {
    return {
      activeDisputes: disputes.filter(d => ['assigned', 'under_mediation'].includes(d.status)).length,
      resolvedDisputes: disputes.filter(d => d.status === 'resolved').length,
      avgResolutionTime: calculateAverageTime(disputes),
      satisfactionScore: calculateSatisfaction(disputes)
    };
  }, [disputes]);
}
```

## 🔒 Sécurité et Permissions

### Contrôle d'Accès

```typescript
// Hook pour vérifier les permissions
function useTrustAgentPermissions() {
  const { profile } = useAuth();
  
  return {
    canMediateDisputes: profile?.available_roles?.includes('trust_agent'),
    canValidateUsers: profile?.trust_agent_level >= 2,
    canEscalateCases: profile?.trust_agent_level >= 3
  };
}

// Utilisation dans les composants
function QuickActionsPanel() {
  const permissions = useTrustAgentPermissions();
  
  if (!permissions.canMediateDisputes) {
    return <AccessDenied />;
  }
  
  return (
    <div>{/* Actions disponibles */}</div>
  );
}
```

## 📱 Responsive Design

### Breakpoints Utilisés

```css
/* Mobile First Approach */
.trust-dashboard {
  @apply grid grid-cols-1 gap-4; /* Mobile */
}

@media (min-width: 768px) {
  .trust-dashboard {
    @apply grid-cols-2; /* Tablet */
  }
}

@media (min-width: 1024px) {
  .trust-dashboard {
    @apply grid-cols-3; /* Desktop */
  }
}
```

### Adaptation Mobile

Tous les composants sont optimisés mobile avec :
- **Touch targets** de 44px minimum
- **Gestures** swipe pour la navigation
- **Menu contextuel** sur tap long
- **Indicateurs visuels** adaptés aux petits écrans

## 🔧 Maintenance et Mises à Jour

### Guide de Mise à Jour

1. **Sauvegarde des configurations** :
   ```bash
   cp -r src/features/trust-agent src/features/trust-agent-backup
   ```

2. **Mise à jour des dépendances** :
   ```bash
   npm update @trust-agent/dashboard-components
   ```

3. **Vérification de compatibilité** :
   ```bash
   npm run test:trust-agent
   ```

### Monitoring en Production

```typescript
// Métriques de performance surveillées
const performanceMetrics = {
  componentRenderTime: 'avg < 100ms',
  dataFetchTime: 'avg < 500ms',
  userInteractionDelay: 'avg < 50ms',
  errorRate: 'target < 0.1%'
};

// Alertes automatiques
if (componentRenderTime > 100) {
  alertService.sendAlert({
    type: 'performance',
    component: 'TrustAgentDashboard',
    metric: 'renderTime',
    value: componentRenderTime
  });
}
```

---

Ce guide technique fournit tous les éléments nécessaires pour comprendre, utiliser et étendre le nouveau Trust Agent Dashboard. L'architecture modulaire permet une maintenance facile et des évolutions continues.