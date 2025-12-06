import { Eye, ArrowLeft, Users, Home, FileText, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui';

export default function DataGeneratorPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Eye className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Generator</h1>
            <p className="text-gray-600">Génération de données de test (développement)</p>
          </div>
        </div>
        <Link to="/admin/tableau-de-bord">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour au Dashboard
          </Button>
        </Link>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800 font-medium">
            ⚠️ Outil de développement uniquement - Ne pas utiliser en production
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Module Data Generator en Développement
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Cette page permettra de générer des données de test :
          utilisateurs fictifs, propriétés, contrats, et transactions.
        </p>
        
        {/* Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Utilisateurs</p>
            <Button size="small" variant="outline" disabled className="mt-2">
              Générer
            </Button>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Home className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Propriétés</p>
            <Button size="small" variant="outline" disabled className="mt-2">
              Générer
            </Button>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <FileText className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Contrats</p>
            <Button size="small" variant="outline" disabled className="mt-2">
              Générer
            </Button>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <RefreshCw className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Reset Data</p>
            <Button size="small" variant="outline" disabled className="mt-2">
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
