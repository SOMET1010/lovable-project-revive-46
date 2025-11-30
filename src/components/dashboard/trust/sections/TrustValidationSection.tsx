import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MapPin, Calendar, BarChart3 } from 'lucide-react';

interface Property {
  id: string;
  address: string;
  type: string;
  owner: string;
  status: 'pending' | 'approved' | 'rejected';
  score: number;
  conformity: {
    electricity: 'compliant' | 'non-compliant' | 'pending';
    plumbing: 'compliant' | 'non-compliant' | 'pending';
    structure: 'compliant' | 'non-compliant' | 'pending';
    safety: 'compliant' | 'non-compliant' | 'pending';
  };
  submittedDate: string;
}

const mockProperties: Property[] = [
  {
    id: 'PROP001',
    address: 'Cocody, Riviera 2',
    type: 'Appartement 3 pièces',
    owner: 'Jean Kouassi',
    status: 'pending',
    score: 85,
    conformity: {
      electricity: 'compliant',
      plumbing: 'compliant',
      structure: 'compliant',
      safety: 'pending'
    },
    submittedDate: '2024-11-25'
  },
  {
    id: 'PROP002',
    address: 'Plateau, Rue des Hôtels',
    type: 'Bureau commercial',
    owner: 'SARL Immobilier Plus',
    status: 'approved',
    score: 95,
    conformity: {
      electricity: 'compliant',
      plumbing: 'compliant',
      structure: 'compliant',
      safety: 'compliant'
    },
    submittedDate: '2024-11-20'
  },
  {
    id: 'PROP003',
    address: 'Yopougon, Niangon',
    type: 'Villa familiale',
    owner: 'Marie Ouattara',
    status: 'pending',
    score: 70,
    conformity: {
      electricity: 'compliant',
      plumbing: 'non-compliant',
      structure: 'compliant',
      safety: 'pending'
    },
    submittedDate: '2024-11-28'
  }
];

export function TrustValidationSection() {
  const [properties, setProperties] = useState<Property[]>(mockProperties);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
    }
  };

  const getConformityIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'non-compliant':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const handleValidate = (id: string, action: 'approve' | 'reject') => {
    setProperties(prev => prev.map(prop => 
      prop.id === id 
        ? { ...prop, status: action === 'approve' ? 'approved' : 'rejected' }
        : prop
    ));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Validation des Propriétés
        </h2>
        <p className="text-neutral-600">
          Gérez les demandes de validation des propriétés selon les normes ANSUT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">En attente</p>
              <p className="text-2xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Validées</p>
              <p className="text-2xl font-bold text-neutral-900">
                {properties.filter(p => p.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Score moyen</p>
              <p className="text-2xl font-bold text-neutral-900">
                {Math.round(properties.reduce((acc, p) => acc + p.score, 0) / properties.length)}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">
            Propriétés à valider
          </h3>
        </div>
        <div className="divide-y divide-neutral-200">
          {properties.map((property) => (
            <div key={property.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-neutral-900">
                      {property.type}
                    </h4>
                    {getStatusBadge(property.status)}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-neutral-600">
                      <MapPin className="w-4 h-4" />
                      <span>{property.address}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-neutral-600">
                      <Calendar className="w-4 h-4" />
                      <span>{property.submittedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-600">Propriétaire</p>
                  <p className="font-medium text-neutral-900">{property.owner}</p>
                  <p className="text-sm text-neutral-500">Score: {property.score}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  {getConformityIcon(property.conformity.electricity)}
                  <span className="text-sm text-neutral-700">Électricité</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getConformityIcon(property.conformity.plumbing)}
                  <span className="text-sm text-neutral-700">Plomberie</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getConformityIcon(property.conformity.structure)}
                  <span className="text-sm text-neutral-700">Structure</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getConformityIcon(property.conformity.safety)}
                  <span className="text-sm text-neutral-700">Sécurité</span>
                </div>
              </div>

              {property.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleValidate(property.id, 'approve')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => handleValidate(property.id, 'reject')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}