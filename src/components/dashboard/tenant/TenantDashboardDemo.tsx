/**
 * Tenant Dashboard Demo - Page de démonstration
 * Showcase de toutes les fonctionnalités du nouveau dashboard
 */

import { useState } from 'react';
import { TenantDashboard } from './TenantDashboard';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';

export function TenantDashboardDemo() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <TenantDashboard />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header de démonstration */}
      <div className="bg-background-page border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-h1 font-bold text-text-primary mb-4">
              Tenant Dashboard Demo
            </h1>
            <p className="text-body-lg text-text-secondary mb-8">
              Découvrez la nouvelle interface du dashboard locataire avec le style Modern Minimalism Premium
            </p>
            <Button 
              variant="primary" 
              size="large"
              onClick={() => setShowDashboard(true)}
            >
              🚀 Lancer le Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu de démonstration */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        {/* Fonctionnalités principales */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-8 text-center">
            ✨ Fonctionnalités Principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>📊 Statistiques Avancées</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Cartes KPI avec icônes et tendances</li>
                  <li>• Graphiques d'évolution mensuelle</li>
                  <li>• Données en temps réel</li>
                  <li>• Export et détails disponibles</li>
                </ul>
              </CardBody>
            </Card>

            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>❤️ Gestion des Favoris</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Grille responsive 3 colonnes</li>
                  <li>• Filtres avancés (prix, type, ville)</li>
                  <li>• Vue liste/grille switchable</li>
                  <li>• Actions rapides sur chaque bien</li>
                </ul>
              </CardBody>
            </Card>

            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>📝 Candidatures Intelligentes</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Suivi statuts en temps réel</li>
                  <li>• Priorités et notifications</li>
                  <li>• Documents et historique</li>
                  <li>• Communication propriétaire</li>
                </ul>
              </CardBody>
            </Card>

            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>📅 Calendrier Visites</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Visites physiques et virtuelles</li>
                  <li>• Confirmations et reprogrammations</li>
                  <li>• Historique complet</li>
                  <li>• Rappels automatiques</li>
                </ul>
              </CardBody>
            </Card>

            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>💳 Gestion Financière</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Historique paiements complet</li>
                  <li>• Alertes échéances et retards</li>
                  <li>• Reçus et justificatifs</li>
                  <li>• Méthodes paiement multiples</li>
                </ul>
              </CardBody>
            </Card>

            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>🎨 Design System</CardTitle>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Modern Minimalism Premium</li>
                  <li>• Contraste WCAG AAA</li>
                  <li>• Responsive design</li>
                  <li>• Composants réutilisables</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Architecture technique */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-8 text-center">
            🏗️ Architecture Technique
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Composants Modulaires</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Structure</h4>
                    <code className="text-sm bg-neutral-100 p-2 rounded block">
                      src/components/dashboard/tenant/<br/>
                      ├── TenantDashboard.tsx<br/>
                      ├── TenantHeader.tsx<br/>
                      ├── TenantSidebar.tsx<br/>
                      └── sections/
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Sections</h4>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• TenantStatsSection - Statistiques</li>
                      <li>• TenantFavoritesSection - Favoris</li>
                      <li>• TenantApplicationsSection - Candidatures</li>
                      <li>• TenantVisitsSection - Visites</li>
                      <li>• TenantPaymentsSection - Paiements</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Design System</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Couleurs</h4>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-primary-500 rounded" title="#FF6C2F"></div>
                      <div className="w-8 h-8 bg-neutral-900 rounded" title="#171717"></div>
                      <div className="w-8 h-8 bg-neutral-700 rounded" title="#404040"></div>
                      <div className="w-8 h-8 bg-semantic-success rounded" title="#059669"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Composants UI</h4>
                    <ul className="text-sm text-text-secondary space-y-1">
                      <li>• Button (5 variants)</li>
                      <li>• Card (4 variants)</li>
                      <li>• Input (validé)</li>
                      <li>• Badge, Progress, Table</li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Données Mock */}
        <section>
          <h2 className="text-h2 font-bold text-text-primary mb-8 text-center">
            📊 Données de Démonstration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="bordered" className="text-center">
              <CardBody className="py-6">
                <div className="text-3xl font-bold text-primary-500 mb-2">24</div>
                <div className="text-sm text-text-secondary">Propriétés consultées</div>
                <div className="text-xs text-green-600 mt-1">+15% ce mois</div>
              </CardBody>
            </Card>

            <Card variant="bordered" className="text-center">
              <CardBody className="py-6">
                <div className="text-3xl font-bold text-primary-500 mb-2">8</div>
                <div className="text-sm text-text-secondary">Candidatures envoyées</div>
                <div className="text-xs text-green-600 mt-1">+25% ce mois</div>
              </CardBody>
            </Card>

            <Card variant="bordered" className="text-center">
              <CardBody className="py-6">
                <div className="text-3xl font-bold text-primary-500 mb-2">3</div>
                <div className="text-sm text-text-secondary">Visites programmées</div>
                <div className="text-xs text-blue-600 mt-1">2 confirmées</div>
              </CardBody>
            </Card>

            <Card variant="bordered" className="text-center">
              <CardBody className="py-6">
                <div className="text-3xl font-bold text-primary-500 mb-2">12</div>
                <div className="text-sm text-text-secondary">Paiements effectués</div>
                <div className="text-xs text-green-600 mt-1">565k FCFA</div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Call to action */}
        <section className="text-center">
          <Card variant="elevated" className="max-w-2xl mx-auto">
            <CardBody className="py-12">
              <h3 className="text-h3 font-bold text-text-primary mb-4">
                Prêt à explorer le nouveau dashboard ?
              </h3>
              <p className="text-body text-text-secondary mb-8">
                Découvrez toutes les fonctionnalités du dashboard locataire avec une interface moderne et intuitive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="large"
                  onClick={() => setShowDashboard(true)}
                >
                  🚀 Lancer le Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  size="large"
                  onClick={() => window.open('/docs/tenant-dashboard', '_blank')}
                >
                  📖 Voir la documentation
                </Button>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default TenantDashboardDemo;