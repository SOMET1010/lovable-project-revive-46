import React, { useEffect } from 'react';
import { useSecureProperties } from '@/hooks/useProperties';
import { useNotifications } from '@/hooks/useNotifications';
import { useApplications } from '@/hooks/useApplications';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Exemple de composant utilisant les opérations asynchrones sécurisées
 * avec AbortController, gestion d'erreurs et états de chargement
 */
export function SecureDashboard() {
  // Hooks sécurisés avec AbortController
  const { 
    properties, 
    loading: propertiesLoading, 
    error: propertiesError, 
    success: propertiesSuccess,
    fetchProperties, 
    cancel: cancelProperties 
  } = useSecureProperties();

  const { 
    notifications, 
    loading: notificationsLoading, 
    error: notificationsError,
    success: notificationsSuccess,
    cancel: cancelNotifications 
  } = useNotifications();

  const { 
    applications, 
    loading: applicationsLoading, 
    error: applicationsError,
    success: applicationsSuccess,
    refetch: refetchApplications 
  } = useApplications({});

  // Charger les données au montage du composant
  useEffect(() => {
    // Charger les propriétés
    fetchProperties();

    // Charger les notifications et candidatures
    refetchApplications();

    return () => {
      // Cleanup automatique via AbortController lors du démontage
      cancelProperties();
      cancelNotifications();
    };
  }, [fetchProperties, refetchApplications, cancelProperties, cancelNotifications]);

  // Fonction pour recharger toutes les données
  const reloadAll = async () => {
    try {
      await Promise.all([
        fetchProperties(),
        refetchApplications(),
      ]);
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
    }
  };

  // Fonction pour annuler toutes les requêtes en cours
  const cancelAll = () => {
    cancelProperties();
    cancelNotifications();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Sécurisé</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={reloadAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={propertiesLoading || applicationsLoading}
          >
            Recharger
          </button>
          <button
            onClick={cancelAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            disabled={!propertiesLoading && !applicationsLoading}
          >
            Annuler
          </button>
        </div>
      </div>

      {/* États de chargement globaux */}
      {(propertiesLoading || notificationsLoading || applicationsLoading) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-blue-700">
              Chargement des données en cours...
            </p>
          </div>
        </div>
      )}

      {/* Messages de succès */}
      {propertiesSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">Propriétés chargées avec succès</p>
          </div>
        </div>
      )}

      {notificationsSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">Notifications chargées avec succès</p>
          </div>
        </div>
      )}

      {applicationsSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-700">Candidatures chargées avec succès</p>
          </div>
        </div>
      )}

      {/* Messages d'erreur */}
      {propertiesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">Erreur lors du chargement des propriétés: {propertiesError}</p>
          </div>
        </div>
      )}

      {notificationsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">Erreur lors du chargement des notifications: {notificationsError}</p>
          </div>
        </div>
      )}

      {applicationsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">Erreur lors du chargement des candidatures: {applicationsError}</p>
          </div>
        </div>
      )}

      {/* Grille de contenu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Propriétés */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Propriétés ({properties.length})</h2>
          {propertiesLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement...</span>
            </div>
          ) : propertiesError ? (
            <div className="text-red-600">Erreur: {propertiesError}</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {properties.slice(0, 5).map((property) => (
                <div key={property.id} className="p-3 border border-gray-200 rounded">
                  <h3 className="font-medium">{property.title || 'Propriété sans titre'}</h3>
                  <p className="text-sm text-gray-600">{property.city || 'Ville non spécifiée'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Notifications */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications ({notifications.length})</h2>
          {notificationsLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement...</span>
            </div>
          ) : notificationsError ? (
            <div className="text-red-600">Erreur: {notificationsError}</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="p-3 border border-gray-200 rounded">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Candidatures */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Candidatures Récentes ({applications.length})</h2>
          {applicationsLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement...</span>
            </div>
          ) : applicationsError ? (
            <div className="text-red-600">Erreur: {applicationsError}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.slice(0, 6).map((application) => (
                <div key={application.id} className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium">Candidature #{application.id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    Statut: <span className="font-medium">{application.status || 'En attente'}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Créée le {new Date(application.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer avec informations de sécurité */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-2">🔒 Sécurité Asynchrone Active</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Toutes les requêtes utilisent AbortController pour annulation propre</li>
          <li>• Gestion automatique des timeouts et retry</li>
          <li>• États de chargement, succès et erreur clairement définis</li>
          <li>• Cleanup automatique lors du démontage des composants</li>
          <li>• Prévention des fuites mémoire et des requêtes en double</li>
        </ul>
      </div>
    </div>
  );
}