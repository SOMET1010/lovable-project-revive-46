# 🎯 Système de Gestion des Statuts de Candidatures

## Vue d'ensemble

Le système de gestion des statuts de candidatures est un ensemble complet de composants React qui permet de gérer le workflow et les transitions d'état des candidatures immobilières. Il respecte les standards WCAG AAA et s'intègre parfaitement dans le design system existant.

## 📦 Composants

### 1. StatusBadge
Composant de base pour afficher un statut avec icône et couleur.

```tsx
import { StatusBadge } from '@/components/applications';

<StatusBadge 
  status="en_cours" 
  size="md" 
  showIcon={true} 
/>
```

**Props :**
- `status: ApplicationStatus` - Le statut à afficher
- `size?: 'sm' | 'md' | 'lg'` - Taille du badge
- `showIcon?: boolean` - Afficher l'icône
- `className?: string` - Classes CSS personnalisées

### 2. ApplicationStatus
Composant principal qui affiche le statut complet avec description et historique.

```tsx
import { ApplicationStatus } from '@/components/applications';

<ApplicationStatus 
  application={application}
  showDescription={true}
  showHistory={true}
  onStatusClick={(status) => console.log(status)}
/>
```

**Props :**
- `application: Application` - Objet candidature complet
- `showDescription?: boolean` - Afficher la description
- `showHistory?: boolean` - Afficher l'historique
- `onStatusClick?: (status) => void` - Callback au clic

### 3. StatusWorkflow
Visualisation graphique du workflow avec progression.

```tsx
import { StatusWorkflow } from '@/components/applications';

<StatusWorkflow 
  currentStatus="en_cours"
  completedStatuses={['en_attente']}
/>
```

**Props :**
- `currentStatus: ApplicationStatus` - Statut actuel
- `completedStatuses?: ApplicationStatus[]` - Statuts complétés
- `className?: string` - Classes CSS personnalisées

### 4. StatusHistory
Affichage détaillé de l'historique des changements avec filtres.

```tsx
import { StatusHistory } from '@/components/applications';

<StatusHistory 
  history={application.statusHistory}
  showFilters={true}
  maxVisibleItems={10}
/>
```

**Props :**
- `history: StatusChange[]` - Liste des changements
- `showFilters?: boolean` - Afficher les filtres
- `maxVisibleItems?: number` - Nombre d'éléments visibles
- `className?: string` - Classes CSS personnalisées

### 5. StatusActions
Actions contextuelles selon le statut et le rôle utilisateur.

```tsx
import { StatusActions } from '@/components/applications';

<StatusActions
  application={application}
  userRole="proprietaire"
  onStatusChange={handleStatusChange}
  onCancel={handleCancel}
/>
```

**Props :**
- `application: Application` - Objet candidature
- `userRole: UserRole` - Rôle de l'utilisateur
- `onStatusChange: (status, reason?, comment?) => void` - Changement de statut
- `onCancel?: () => void` - Callback d'annulation
- `className?: string` - Classes CSS personnalisées

## 🔄 Statuts Disponibles

| Statut | Couleur | Description | Transitions |
|--------|---------|-------------|-------------|
| `en_attente` | Orange | Nouvelle candidature, en attente | `en_cours`, `annulee` |
| `en_cours` | Bleu | En cours d'examen | `acceptee`, `refusee` |
| `acceptee` | Vert | Acceptée, prête pour signature | - |
| `refusee` | Rouge | Refusée avec motif | - |
| `annulee` | Gris | Annulée par le candidat | - |

## 🎨 Couleurs et Accessibilité

Tous les composants respectent les contrastes WCAG AAA :

- **Texte principal** : 16.5:1 de contraste
- **Texte secondaire** : 8.6:1 de contraste
- **Éléments interactifs** : Conforme AA Large
- **Couleurs sémantiques** : Respect des standards (success, error, warning, info)

## 🔧 Intégration

### 1. Import des composants

```tsx
import {
  ApplicationStatus,
  StatusWorkflow,
  StatusActions,
  StatusHistory,
  StatusBadge,
  type Application,
  type UserRole
} from '@/components/applications';
```

### 2. Types TypeScript

```tsx
interface Application {
  id: string;
  candidateId: string;
  propertyId: string;
  status: ApplicationStatus;
  statusHistory: StatusChange[];
  submittedAt: Date;
  updatedAt: Date;
  currentStep?: number;
  totalSteps?: number;
}
```

### 3. Gestion des transitions

```tsx
const handleStatusChange = async (
  newStatus: ApplicationStatus,
  reason?: string,
  comment?: string
) => {
  // Appel API pour changer le statut
  const response = await fetch('/api/applications/change-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      applicationId: application.id,
      newStatus,
      reason,
      comment
    })
  });

  if (response.ok) {
    // Mise à jour locale
    setApplication(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date(),
      statusHistory: [
        ...prev.statusHistory,
        {
          id: Date.now().toString(),
          status: newStatus,
          changedAt: new Date(),
          changedBy: currentUser.id,
          reason,
          comment
        }
      ]
    }));
  }
};
```

### 4. Intégration avec les dashboards

#### Dashboard Propriétaire
```tsx
const OwnerDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  
  return (
    <div className="space-y-6">
      <h1>Mes Candidatures</h1>
      
      {applications.map(application => (
        <div key={application.id} className="p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3>{application.propertyTitle}</h3>
              <p>Candidat: {application.candidateName}</p>
            </div>
            <StatusBadge status={application.status} />
          </div>
          
          <ApplicationStatus 
            application={application}
            showDescription={true}
            showHistory={false}
          />
          
          <StatusActions
            application={application}
            userRole="proprietaire"
            onStatusChange={handleStatusChange}
          />
        </div>
      ))}
    </div>
  );
};
```

#### Dashboard Candidat
```tsx
const CandidateDashboard: React.FC = () => {
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  
  return (
    <div className="space-y-6">
      <h1>Mes Candidatures</h1>
      
      {myApplications.map(application => (
        <div key={application.id} className="p-4 rounded-lg border">
          <ApplicationStatus 
            application={application}
            showDescription={true}
            showHistory={true}
          />
          
          <StatusWorkflow 
            currentStatus={application.status}
            completedStatuses={getCompletedStatuses(application)}
          />
          
          <StatusHistory 
            history={application.statusHistory}
            showFilters={true}
          />
          
          <StatusActions
            application={application}
            userRole="candidat"
            onStatusChange={handleStatusChange}
          />
        </div>
      ))}
    </div>
  );
};
```

## 🚀 Fonctionnalités Avancées

### 1. Notifications de changement
```tsx
// Utiliser avec un système de notifications
useEffect(() => {
  if (application.statusHistory.length > 0) {
    const latest = application.statusHistory[0];
    if (latest.changedBy !== currentUser.id) {
      showNotification(
        `Candidature ${latest.status}`,
        `Statut mis à jour: ${latest.comment || latest.reason}`
      );
    }
  }
}, [application.statusHistory]);
```

### 2. Transitions automatisées
```tsx
// Workflow automatique basé sur le temps
useEffect(() => {
  if (application.status === 'en_attente') {
    const timeInQueue = Date.now() - application.submittedAt.getTime();
    const hoursInQueue = timeInQueue / (1000 * 60 * 60);
    
    if (hoursInQueue > 48) {
      // Rappel automatique au propriétaire
      sendReminderToOwner(application.id);
    }
  }
}, [application.status, application.submittedAt]);
```

### 3. Validation des transitions
```tsx
const validateStatusTransition = (
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus,
  userRole: UserRole
): boolean => {
  const config = STATUS_CONFIGS[currentStatus];
  return config.transitionTo?.includes(newStatus) || userRole === 'admin';
};
```

## 🎯 Bonnes Pratiques

1. **Cohérence visuelle** : Utilisez toujours les couleurs définies dans STATUS_CONFIGS
2. **Accessibilité** : Testez avec des lecteurs d'écran
3. **Performance** : Limitez le nombre d'éléments dans StatusHistory avec maxVisibleItems
4. **UX** : Toujours demander confirmation pour les actions irréversibles
5. **Audit** : Gardez un historique complet des changements

## 🔗 Intégration API

Les composants sont prêts pour une intégration avec votre backend :

```typescript
// Exemple d'endpoint pour changer de statut
POST /api/applications/{id}/status
{
  "newStatus": "en_cours",
  "reason": "Examen démarré",
  "comment": "Documents en cours de vérification"
}
```

## 📱 Responsive

Tous les composants sont entièrement responsive :
- StatusWorkflow s'adapte sur mobile
- StatusHistory peut être réduit/étendu
- StatusActions s'organise en grille sur desktop
- Tous respectent les breakpoints définis dans le design system

## 🧪 Tests

Les composants incluent :
- Accessibilité avec ARIA labels
- Responsive design
- Transitions d'état fluides
- Gestion d'erreurs
- Validation des inputs

Le système est maintenant prêt à être intégré dans votre application !