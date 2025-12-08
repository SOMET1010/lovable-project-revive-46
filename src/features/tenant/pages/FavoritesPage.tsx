import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MapPin, Bed, Bath, Trash2, Home, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TenantDashboardLayout from '../components/TenantDashboardLayout';
import { toast } from 'sonner';

interface Favorite {
  id: string;
  property_id: string | null;
  created_at: string | null;
  property: {
    id: string;
    title: string;
    address: string | null;
    city: string;
    neighborhood: string | null;
    property_type: string;
    bedrooms: number | null;
    bathrooms: number | null;
    surface_area: number | null;
    monthly_rent: number;
    status: string | null;
    main_image: string | null;
  } | null;
}

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          property_id,
          created_at,
          properties(
            id,
            title,
            address,
            city,
            neighborhood,
            property_type,
            bedrooms,
            bathrooms,
            surface_area,
            monthly_rent,
            status,
            main_image
          )
        `)
        .eq('user_id', user?.id ?? '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedFavorites = (data || []).map((fav: any) => ({
        id: fav.id,
        property_id: fav.property_id,
        created_at: fav.created_at,
        property: fav.properties
      }));

      setFavorites(formattedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    setRemovingId(favoriteId);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast.success('Retiré des favoris');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#FAF7F4] border border-[#EFEBE9] flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-[#A69B95]" />
          </div>
          <h2 className="text-xl font-semibold text-[#2C1810] mb-2">Connexion requise</h2>
          <p className="text-[#6B5A4E]">Veuillez vous connecter pour voir vos favoris</p>
        </div>
      </div>
    );
  }

  return (
    <TenantDashboardLayout title="Mes Favoris">
      <div className="max-w-7xl mx-auto">
        {/* Header Premium */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F16522] to-[#D95318] flex items-center justify-center shadow-lg shadow-[#F16522]/20">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2C1810]">Mes Favoris</h1>
              <p className="text-[#6B5A4E]">
                {favorites.length} bien{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F16522]"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-lg shadow-[#2C1810]/5 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FAF7F4] flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-[#A69B95]" />
            </div>
            <h3 className="text-xl font-semibold text-[#2C1810] mb-2">Aucun favori</h3>
            <p className="text-[#6B5A4E] mb-6 max-w-md mx-auto">
              Explorez nos propriétés et ajoutez vos préférées à vos favoris
            </p>
            <Link
              to="/recherche"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-[#F16522]/20"
            >
              Rechercher des propriétés
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-[24px] border border-[#EFEBE9] shadow-lg shadow-[#2C1810]/5 overflow-hidden group hover:shadow-xl hover:shadow-[#2C1810]/10 transition-all duration-300">
                <div className="relative h-48">
                  <img
                    src={favorite.property?.main_image || '/placeholder-property.jpg'}
                    alt={favorite.property?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    disabled={removingId === favorite.id}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg disabled:opacity-50"
                  >
                    {removingId === favorite.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-[#2C1810] border border-[#EFEBE9]">
                    {favorite.property?.status === 'available' ? 'Disponible' : favorite.property?.status}
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                    <span className="text-lg font-bold text-[#F16522]">
                      {favorite.property?.monthly_rent.toLocaleString()} FCFA
                    </span>
                    <span className="text-[#6B5A4E] text-sm">/mois</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#2C1810] mb-2 line-clamp-1 group-hover:text-[#F16522] transition-colors">
                    {favorite.property?.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[#6B5A4E] mb-4">
                    <MapPin className="w-4 h-4 text-[#F16522]" />
                    <p className="text-sm line-clamp-1">
                      {favorite.property?.neighborhood ? `${favorite.property.neighborhood}, ` : ''}
                      {favorite.property?.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[#6B5A4E] mb-5 pb-5 border-b border-[#EFEBE9]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-[#FAF7F4] flex items-center justify-center">
                        <Home className="w-3.5 h-3.5 text-[#F16522]" />
                      </div>
                      <span>{favorite.property?.property_type}</span>
                    </div>
                    {favorite.property?.bedrooms && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF7F4] flex items-center justify-center">
                          <Bed className="w-3.5 h-3.5 text-[#F16522]" />
                        </div>
                        <span>{favorite.property.bedrooms}</span>
                      </div>
                    )}
                    {favorite.property?.bathrooms && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF7F4] flex items-center justify-center">
                          <Bath className="w-3.5 h-3.5 text-[#F16522]" />
                        </div>
                        <span>{favorite.property.bathrooms}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/propriete/${favorite.property?.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F16522] hover:bg-[#D95318] text-white font-medium rounded-xl transition-all duration-200"
                  >
                    Voir les détails
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TenantDashboardLayout>
  );
}