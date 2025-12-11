import React from 'react';

/**
 * Page de calendrier pour les agences
 * Le layout est géré par le système de routing
 */
export default function AgencyCalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Calendrier Agence</h1>
      <p className="text-gray-600">Calendrier des visites et échéances</p>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Visites programmées</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Ajouter une visite
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Visite - Appartement Abidjan Plateau</h3>
                <p className="text-gray-600">Client: Jean Dupont</p>
                <p className="text-sm text-gray-500">Aujourd'hui, 14h00</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Confirmé</span>
            </div>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Visite - Villa Cocody</h3>
                <p className="text-gray-600">Client: Marie Konan</p>
                <p className="text-sm text-gray-500">Demain, 10h00</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">En attente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}