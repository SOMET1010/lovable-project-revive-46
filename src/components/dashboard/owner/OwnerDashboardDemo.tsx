/**
 * Owner Dashboard Demo - Démonstration interactive
 * Showcase des fonctionnalités du dashboard propriétaire
 */

import { useState } from 'react';
import { OwnerDashboard } from './OwnerDashboard';

export function OwnerDashboardDemo() {
  const [showDemo, setShowDemo] = useState(false);

  if (showDemo) {
    return <OwnerDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Owner Dashboard Demo
          </h1>
          <p className="text-text-secondary text-lg">
            Découvrez la nouvelle interface de gestion immobilière pour propriétaires
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-background-surface p-6 rounded-xl">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Statistiques Avancées
            </h3>
            <p className="text-sm text-text-secondary">
              KPIs en temps réel, graphiques interactifs, indicateurs de performance
            </p>
          </div>

          <div className="bg-background-surface p-6 rounded-xl">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Gestion Propriétés
            </h3>
            <p className="text-sm text-text-secondary">
              Cards détaillées, statuts visuels, actions rapides
            </p>
          </div>

          <div className="bg-background-surface p-6 rounded-xl">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Suivi Locataires
            </h3>
            <p className="text-sm text-text-secondary">
              Informations complètes, alertes échéances, relances automatiques
            </p>
          </div>

          <div className="bg-background-surface p-6 rounded-xl">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Revenus & Paiements
            </h3>
            <p className="text-sm text-text-secondary">
              Suivi financier, projections, gestion des retards
            </p>
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
          <h4 className="text-lg font-semibold text-primary-700 mb-3">
            ✨ Nouvelles Fonctionnalités
          </h4>
          <ul className="space-y-2 text-sm text-primary-600">
            <li>• Interface Modern Minimalism Premium</li>
            <li>• Design responsive mobile-first</li>
            <li>• Accessibilité WCAG AAA</li>
            <li>• Animations fluides et performance optimisée</li>
            <li>• Système de notifications intelligentes</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowDemo(true)}
            className="btn-primary flex-1 py-3 text-lg font-semibold"
          >
            🚀 Lancer la Démo
          </button>
          <button
            onClick={() => window.open('https://montoit.com', '_blank')}
            className="btn-secondary flex-1 py-3 text-lg font-semibold"
          >
            🔗 Site Officiel
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-xs text-text-secondary">
            Développé avec ❤️ pour une expérience propriétaire exceptionnelle
          </p>
          <p className="text-xs text-text-disabled mt-2">
            MONTOITVPROD v2.0 - Modern Minimalism Premium
          </p>
        </div>
      </div>
    </div>
  );
}