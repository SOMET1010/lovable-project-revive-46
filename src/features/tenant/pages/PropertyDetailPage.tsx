import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Bed, Bath, Maximize, Heart, Share2, Calendar, 
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Car, 
  Zap, Building, Home, FileText, Shield 
} from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import MapWrapper from '@/shared/ui/MapWrapper';
import { useAuth } from '@/app/providers/AuthProvider';
import { getCreateContractRoute } from '@/shared/config/routes.config';
import { ScoreBadge } from '@/shared/ui';

// Extended property type with new columns and owner profile
interface Property {
  id: string;
  title: string;
  description: string | null;
  address: string | null;
  city: string;
  neighborhood: string | null;
  property_type: string;
  property_category: string | null;
  status: string | null;
  monthly_rent: number;
  price: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface_area: number | null;
  is_furnished: boolean | null;
  has_parking: boolean | null;
  has_garden: boolean | null;
  has_ac: boolean | null;
  amenities: string[] | null;
  images: string[] | null;
  main_image: string | null;
  latitude: number | null;
  longitude: number | null;
  view_count: number | null;
  owner_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Owner profile fields
  owner_trust_score?: number | null;
  owner_full_name?: string | null;
  owner_avatar_url?: string | null;
  owner_is_verified?: boolean | null;
  owner_oneci_verified?: boolean | null;
  owner_cnam_verified?: boolean | null;
}

interface ImageGalleryProps {
  images: string[];
  title: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

function ImageGallery({ images, title, currentIndex, onIndexChange }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    images = ['/images/placeholder-property.jpg'];
  }

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-neutral-100 rounded-xl overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="eager"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-6 w-6 text-neutral-700" />
            </button>
            <button
              onClick={() => onIndexChange((currentIndex + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-6 w-6 text-neutral-700" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-sm font-semibold">
          {currentIndex + 1} / {images.length}
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            aria-label="Ajouter aux favoris"
          >
            <Heart className="h-5 w-5 text-neutral-700" />
          </button>
          <button
            className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            aria-label="Partager"
          >
            <Share2 className="h-5 w-5 text-neutral-700" />
          </button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex 
                  ? 'border-primary-500 shadow-lg' 
                  : 'border-neutral-200 hover:border-primary-300'
              }`}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Miniature ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PropertyFeaturesProps {
  property: Property;
}

function PropertyFeatures({ property }: PropertyFeaturesProps) {
  const features = [];

  if (property.bedrooms) {
    features.push({
      icon: <Bed className="h-6 w-6" />,
      label: 'Chambres',
      value: property.bedrooms.toString(),
      color: 'text-primary-500'
    });
  }

  if (property.bathrooms) {
    features.push({
      icon: <Bath className="h-6 w-6" />,
      label: 'Salles de bain',
      value: property.bathrooms.toString(),
      color: 'text-primary-500'
    });
  }

  if (property.surface_area) {
    features.push({
      icon: <Maximize className="h-6 w-6" />,
      label: 'Surface',
      value: `${property.surface_area} m²`,
      color: 'text-primary-500'
    });
  }

  if (property.has_parking) {
    features.push({
      icon: <Car className="h-6 w-6" />,
      label: 'Parking',
      value: 'Disponible',
      color: 'text-primary-500'
    });
  }

  if (property.property_type) {
    const propertyTypeLabels: Record<string, string> = {
      'maison': 'Maison',
      'appartement': 'Appartement',
      'villa': 'Villa',
      'studio': 'Studio',
      'duplex': 'Duplex',
      'chambre': 'Chambre',
      'bureau': 'Bureau',
      'commerce': 'Commerce',
      'entrepot': 'Entrepôt',
      'terrain': 'Terrain'
    };
    features.push({
      icon: property.property_type === 'maison' || property.property_type === 'villa' ? <Home className="h-6 w-6" /> : <Building className="h-6 w-6" />,
      label: 'Type de bien',
      value: propertyTypeLabels[property.property_type] || property.property_type,
      color: 'text-primary-500'
    });
  }

  const amenities = [
    { key: 'parking', available: property.has_parking, label: 'Parking', icon: <Car className="h-5 w-5" /> },
    { key: 'garden', available: property.has_garden, label: 'Jardin', icon: <CheckCircle className="h-5 w-5" /> },
    { key: 'furnished', available: property.is_furnished, label: 'Meublé', icon: <CheckCircle className="h-5 w-5" /> },
    { key: 'ac', available: property.has_ac, label: 'Climatisation', icon: <Zap className="h-5 w-5" /> },
  ].filter(a => a.available);

  amenities.slice(0, 4).forEach((amenity) => {
    features.push({
      icon: amenity.icon,
      label: amenity.label,
      value: 'Disponible',
      color: 'text-semantic-success'
    });
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
          <div className={`${feature.color}`}>
            {feature.icon}
          </div>
          <div>
            <div className="text-sm text-neutral-500">{feature.label}</div>
            <div className="font-semibold text-neutral-900">{feature.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface StickyCTABarProps {
  propertyId: string;
  isOwnerOrAgency?: boolean;
}

function StickyCTABar({ propertyId, isOwnerOrAgency }: StickyCTABarProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-lg z-50 md:hidden">
      <div className="flex gap-3 max-w-sm mx-auto">
        {isOwnerOrAgency ? (
          <button
            onClick={() => navigate(getCreateContractRoute(propertyId))}
            className="flex-1 px-4 py-3 bg-semantic-success text-white font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="h-5 w-5" />
            <span>Créer contrat</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate(`/visites/planifier/${propertyId}`)}
              className="flex-1 px-4 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              <span>Planifier visite</span>
            </button>
            <button
              onClick={() => navigate(`/postuler/${propertyId}`)}
              className="flex-1 px-4 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Postuler
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const isOwnerOrAgency = user && property && (
    user.id === property.owner_id || 
    profile?.user_type === 'agence' ||
    profile?.user_type === 'proprietaire'
  );

  useEffect(() => {
    if (id) {
      loadProperty(id);
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyBar(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProperty = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles:owner_id (
            full_name,
            avatar_url,
            trust_score,
            is_verified,
            oneci_verified,
            cnam_verified
          )
        `)
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      
      // Cast to our extended Property type with owner profile data
      const profileData = (data as any).profiles;
      const propertyData = {
        ...data,
        status: data.status ?? undefined,
        owner_trust_score: profileData?.trust_score ?? null,
        owner_full_name: profileData?.full_name ?? null,
        owner_avatar_url: profileData?.avatar_url ?? null,
        owner_is_verified: profileData?.is_verified ?? null,
        owner_oneci_verified: profileData?.oneci_verified ?? null,
        owner_cnam_verified: profileData?.cnam_verified ?? null,
      } as unknown as Property;
      setProperty(propertyData);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-500 font-medium">Chargement de la propriété...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Propriété introuvable</h2>
          <p className="text-neutral-500 mb-8">Cette propriété n'existe pas ou a été supprimée</p>
          <button
            onClick={() => navigate('/recherche')}
            className="btn-primary w-full sm:w-auto"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  const images = property.images || ['/images/placeholder-property.jpg'];

  return (
    <div className="min-h-screen bg-background-page">
      <header className="bg-white border-b border-neutral-100">
        <div className="container max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-neutral-50 hover:bg-neutral-100 rounded-full flex items-center justify-center transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-700" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
              {property.title}
            </h1>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <section>
              <ImageGallery
                images={images}
                title={property.title}
                currentIndex={currentImageIndex}
                onIndexChange={setCurrentImageIndex}
              />
            </section>

            <section className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <MapPin className="h-5 w-5" />
                      <span className="font-medium">
                        {property.city}, {property.neighborhood}
                      </span>
                    </div>
                    {(property.view_count ?? 0) > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-500">
                          {property.view_count} vue{(property.view_count ?? 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-bold text-primary-500">
                    {property.monthly_rent?.toLocaleString()}
                  </span>
                  <span className="text-xl text-neutral-500 font-medium">FCFA/mois</span>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Caractéristiques</h2>
                <PropertyFeatures property={property} />
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Description</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-neutral-700 leading-relaxed text-lg">
                    {property.description || 'Aucune description disponible pour ce bien.'}
                  </p>
                </div>
              </div>

              {(property.has_parking || property.has_garden || property.is_furnished || property.has_ac) && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Équipements</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.has_parking && (
                      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <CheckCircle className="h-5 w-5 text-semantic-success flex-shrink-0" />
                        <span className="text-neutral-700 font-medium">Parking</span>
                      </div>
                    )}
                    {property.has_garden && (
                      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <CheckCircle className="h-5 w-5 text-semantic-success flex-shrink-0" />
                        <span className="text-neutral-700 font-medium">Jardin</span>
                      </div>
                    )}
                    {property.is_furnished && (
                      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <CheckCircle className="h-5 w-5 text-semantic-success flex-shrink-0" />
                        <span className="text-neutral-700 font-medium">Meublé</span>
                      </div>
                    )}
                    {property.has_ac && (
                      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                        <CheckCircle className="h-5 w-5 text-semantic-success flex-shrink-0" />
                        <span className="text-neutral-700 font-medium">Climatisation</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-900">Localisation</h2>
                <div className="bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200">
                  {property.longitude && property.latitude ? (
                    <MapWrapper
                      center={[property.longitude, property.latitude]}
                      zoom={15}
                      height="400px"
                      properties={[{ 
                        id: property.id, 
                        title: property.title, 
                        latitude: property.latitude,
                        longitude: property.longitude,
                        monthly_rent: property.monthly_rent,
                        status: property.status ?? 'disponible',
                        city: property.city
                      }]}
                    />
                  ) : (
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500">Localisation non disponible</p>
                        <p className="text-sm text-neutral-400 mt-2">
                          {property.address}, {property.city}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Prix et CTA */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-100">
                <div className="space-y-6">
                  <div>
                    <span className="text-3xl font-bold text-primary-500">
                      {property.monthly_rent?.toLocaleString()}
                    </span>
                    <span className="text-neutral-500 ml-2">FCFA/mois</span>
                  </div>

                  <div className="space-y-3">
                    {isOwnerOrAgency ? (
                      <button
                        onClick={() => navigate(getCreateContractRoute(property.id))}
                        className="w-full py-3 bg-semantic-success text-white font-semibold rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="h-5 w-5" />
                        <span>Créer un contrat</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/visites/planifier/${property.id}`)}
                          className="w-full py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Calendar className="h-5 w-5" />
                          <span>Planifier une visite</span>
                        </button>
                        <button
                          onClick={() => navigate(`/postuler/${property.id}`)}
                          className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                        >
                          Postuler maintenant
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Profil Propriétaire */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-100">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Propriétaire</h3>
                
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={property.owner_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.owner_full_name || 'P')}&background=FF6C2F&color=fff`}
                      alt={property.owner_full_name || 'Propriétaire'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-neutral-100"
                    />
                    {property.owner_is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Infos */}
                  <div className="flex-1">
                    <div className="font-semibold text-neutral-900">
                      {property.owner_full_name || 'Propriétaire'}
                    </div>
                    
                    {/* Trust Score Badge */}
                    {property.owner_trust_score != null && (
                      <div className="mt-2">
                        <ScoreBadge 
                          score={property.owner_trust_score} 
                          variant="detailed" 
                          size="md"
                          showVerified={property.owner_is_verified ?? false}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Badges de vérification */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="text-sm text-neutral-500 mb-2">Vérifications</div>
                  <div className="flex flex-wrap gap-2">
                    {property.owner_is_verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle className="h-3 w-3" /> Identité vérifiée
                      </span>
                    )}
                    {property.owner_oneci_verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        <Shield className="h-3 w-3" /> ONECI
                      </span>
                    )}
                    {property.owner_cnam_verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                        <Shield className="h-3 w-3" /> CNAM
                      </span>
                    )}
                    {!property.owner_is_verified && !property.owner_oneci_verified && !property.owner_cnam_verified && (
                      <span className="text-xs text-neutral-400">Aucune vérification</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showStickyBar && (
        <StickyCTABar 
          propertyId={property.id} 
          isOwnerOrAgency={isOwnerOrAgency ?? false}
        />
      )}
    </div>
  );
}
