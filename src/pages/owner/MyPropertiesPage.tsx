import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  MapPin,
  Users,
  Calendar,
  Edit,
  Eye,
  Plus,
  Building2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/app/providers/AuthProvider';

interface Property {
  id: string;
  title: string;
  type: string;
  city: string;
  neighborhood: string;
  monthly_rent: number;
  status: 'available' | 'rented' | 'maintenance';
  created_at: string;
  applications_count?: number;
  views_count: number;
}

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'rented' | 'maintenance'>('all');

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        applications(count)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties(data || []);
    }
    setLoading(false);
  };

  const filteredProperties = properties.filter(property =>
    filter === 'all' || property.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Disponible</span>;
      case 'rented':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Loué</span>;
      case 'maintenance':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Maintenance</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Inconnu</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mes Propriétés</h1>
          <p className="text-gray-600">Gérez votre portefeuille immobilier</p>
        </div>
        <Link
          to="/proprietaire/ajouter-propriete"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Ajouter un bien
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-2xl font-bold">{properties.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">
                {properties.filter(p => p.status === 'available').length}
              </p>
            </div>
            <Home className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Loués</p>
              <p className="text-2xl font-bold text-blue-600">
                {properties.filter(p => p.status === 'rented').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">En maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">
                {properties.filter(p => p.status === 'maintenance').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Tous' },
          { value: 'available', label: 'Disponibles' },
          { value: 'rented', label: 'Loués' },
          { value: 'maintenance', label: 'Maintenance' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as any)}
            className={`px-4 py-2 rounded-lg ${
              filter === item.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune propriété</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all'
                ? "Vous n'avez pas encore ajouté de propriété"
                : `Aucune propriété ${filter === 'available' ? 'disponible' : filter === 'rented' ? 'louée' : 'en maintenance'}`
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/proprietaire/ajouter-propriete"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter votre première propriété
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Propriété</th>
                  <th className="text-left p-4 font-medium">Localisation</th>
                  <th className="text-left p-4 font-medium">Loyer</th>
                  <th className="text-left p-4 font-medium">Statut</th>
                  <th className="text-left p-4 font-medium">Candidatures</th>
                  <th className="text-left p-4 font-medium">Vues</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <h4 className="font-medium">{property.title}</h4>
                        <p className="text-sm text-gray-500">{property.type}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {property.city}, {property.neighborhood}
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {property.monthly_rent?.toLocaleString()} FCFA
                    </td>
                    <td className="p-4">{getStatusBadge(property.status)}</td>
                    <td className="p-4 text-sm">
                      {property.applications_count || 0} candidature(s)
                    </td>
                    <td className="p-4 text-sm">
                      {property.views_count || 0}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}