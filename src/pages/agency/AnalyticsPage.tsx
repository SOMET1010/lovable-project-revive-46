import React from 'react';

/**
 * Page d'analytics pour les agences
 * Le layout est géré par le système de routing
 */
export default function AgencyAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Agence</h1>
      <p className="text-gray-600">Page d'analyse pour les agences</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Biens gérés</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
          <p className="text-sm text-gray-500">+3 ce mois-ci</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Mandats actifs</h3>
          <p className="text-3xl font-bold text-green-600">18</p>
          <p className="text-sm text-gray-500">+2 ce mois-ci</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Taux de conversion</h3>
          <p className="text-3xl font-bold text-purple-600">87%</p>
          <p className="text-sm text-gray-500">+5% vs mois dernier</p>
        </div>
      </div>
    </div>
  );
}